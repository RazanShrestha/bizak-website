import * as React from "react";
import { ArrowDown, ArrowUp, FileText, ListChecks, Plus, X } from "lucide-react";
import { cn } from "../ui/utils";
import { BTN, Checkbox, Dialog, Field, GHOST, ICON_BTN, INPUT, MenuItem, MenuLabel, MenuSep, NUM, Popover, Select, Switch, ToastHost, useToast } from "../sales/bzw";
import { useKeys } from "../sales/orders";
import { ConfirmDialog } from "../sales/parts";
import { useStore } from "../sales/store";
import type { ActivityKind, CustomerType, Playbook, PlaybookItem } from "./data";
import { HEAD_BTN, PillTabs } from "./fx";
import { FxEmpty, FxSearch, FxTable } from "./fx-table";
import type { FxColumn } from "./fx-table";
import { MultiPicker, Picker } from "./network-form";
import { nextId } from "./persist";
import { openQuickAdd } from "./quickadd";
import { logEvent } from "./records";
import { SfActivity, SfNoteFoot, SfShell, TypeMark } from "./sf";
import { activitiesStore, playbooksStore, typesStore } from "./store";
import { FField, FIELDS, FormSheet, GROUPS, Group, linkPlaybook, overlayUp } from "./setup-frame";
import type { ListPlaceProps, Toast } from "./setup-frame";

// ════════════════════════════════════════════════════════════════════════════
// SETUP · PLAYBOOKS — what a visit holds, built from an activity library
//
// Activity library → playbook (ordered steps, each required or not, geofenced
// or not, every visit / weekly / monthly / during a campaign) → the customer
// types it applies to (research/A §2, P1–P4). The library includes two open
// doors: "Any Bizak document" and "Custom form" (a Dynamic Form), which is
// what makes the playbook generic rather than one client's checklist.
// The library is `activitiesStore` (the built-in steps plus any added here);
// a clean start has NO playbooks — the user builds the first one.
// The place is the list kit: a roomy table, and the playbook as a form in the
// floating sheet.
// ════════════════════════════════════════════════════════════════════════════

type Row = Playbook & { used: number };
type Tab = "all" | "in-use" | "unused";

/** A type by id, or a stand-in that says it was deleted. */
const typeName = (types: CustomerType[], id: string) => types.find((t) => t.id === id) ?? { id, plural: "A deleted type", name: "A deleted type", color: 8 };

export const KIND_LABEL: Record<ActivityKind, string> = {
  order: "Order",
  collection: "Collection",
  return: "Return",
  "stock-count": "Stock count",
  photo: "Photo",
  form: "Form",
  "branding-audit": "Branding check",
  "scheme-briefing": "Scheme briefing",
  document: "Bizak document",
  task: "Task",
  sampling: "Sampling",
};
const KIND_GROUPS: { label: string; kinds: ActivityKind[] }[] = [
  { label: "Sell", kinds: ["order", "collection", "return"] },
  { label: "Check the outlet", kinds: ["stock-count", "photo", "branding-audit"] },
  { label: "Talk and hand out", kinds: ["scheme-briefing", "sampling"] },
  { label: "Documents, forms and tasks", kinds: ["document", "form", "task"] },
];
const WHEN: PlaybookItem["when"][] = ["every visit", "weekly", "monthly", "during campaign"];
const DOCUMENTS = ["Estimate", "Sales order", "Delivery", "Invoice", "Customer receipt", "Credit memo", "Return receipt"];
/** Published Dynamic Forms a playbook can use (the app lists them from api/dynamic-forms). */
const FORMS = ["Outlet census", "Cooler audit", "Retailer feedback", "Competitor survey", "Shelf share count"];

// MenuItem's `icon` is typed for a plain component; a lucide forwardRef icon trips the propTypes check.
const DocumentIcon = ({ size, className }: { size?: number; className?: string }) => <FileText size={size} className={className} />;
const FormIcon = ({ size, className }: { size?: number; className?: string }) => <ListChecks size={size} className={className} />;

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const stepsWord = (n: number) => `${n} ${n === 1 ? "step" : "steps"}`;
/** What deleting a playbook leaves behind — the confirm's one sentence. */
const afterDelete = (p: Playbook, types: CustomerType[]) =>
  p.forTypeIds.length ? `${p.forTypeIds.map((t) => typeName(types, t).plural).join(", ")} will have no playbook — reps log a plain visit there.` : "No customer type uses it. Its history is kept.";

export function PlaybooksPlace({ openId, open }: ListPlaceProps) {
  const { toast, show, dismiss } = useToast();
  const playbooks = useStore(playbooksStore);
  const types = useStore(typesStore);
  const activities = useStore(activitiesStore);
  const searchRef = React.useRef<HTMLInputElement>(null);
  const [q, setQ] = React.useState("");
  const [tab, setTab] = React.useState<Tab>("all");
  const [deleting, setDeleting] = React.useState<Playbook | null>(null);

  const rows: Row[] = playbooks.map((p) => ({ ...p, used: p.forTypeIds.length }));
  const acts = (p: Row) => p.items.map((i) => activities.find((a) => a.id === i.activityId)).filter((a) => !!a);
  /** The steps by what they are; the names they were given are the tooltip (and what the search reads). */
  const steps = (p: Row) =>
    acts(p)
      .map((a) => KIND_LABEL[a!.kind])
      .join(" → ");
  const stepNames = (p: Row) =>
    acts(p)
      .map((a) => a!.name)
      .join(" → ");
  const forTypes = (p: Row) => p.forTypeIds.map((t) => typeName(types, t).plural).join(", ");
  const required = (p: Row) => `${p.items.filter((i) => i.required).length} of ${p.items.length}`;

  const needle = q.trim().toLowerCase();
  const visible = rows.filter((p) => (tab === "all" || (tab === "in-use") === p.used > 0) && (!needle || `${p.name} ${stepNames(p)} ${steps(p)} ${forTypes(p)}`.toLowerCase().includes(needle)));
  const filtered = !!needle || tab !== "all";

  const remove = (p: Playbook) => {
    if (p.forTypeIds.length) linkPlaybook(p.forTypeIds, null);
    playbooksStore.set((ps) => ps.filter((x) => x.id !== p.id));
    logEvent(p.id, `deleted the playbook ${p.name}`);
    setDeleting(null);
    if (openId === p.id) open(null);
    show("success", `${p.name} deleted`);
  };

  useKeys({
    "/": (e) => {
      if (openId || overlayUp()) return;
      e.preventDefault();
      searchRef.current?.focus();
    },
    n: () => !openId && !overlayUp() && open("new"),
  });

  const columns: FxColumn<Row>[] = [
    {
      key: "name",
      label: "Playbook",
      width: "minmax(0,1.1fr)",
      role: "primary",
      render: (p) => (
        <span className="block min-w-0 leading-snug">
          <span className="block truncate font-semibold text-bz-text">{p.name}</span>
          <span className="block truncate text-[11.5px] text-bz-text-soft max-sm:whitespace-normal">
            <span className={NUM}>{stepsWord(p.items.length)}</span>
            <span className="md:hidden"> · {forTypes(p) || "Not used"}</span>
          </span>
        </span>
      ),
    },
    { key: "steps", label: "Steps", width: "minmax(0,2fr)", hideBelow: 1024, render: (p) => <span title={stepNames(p)} className="text-bz-text-muted">{steps(p) || "—"}</span> },
    {
      key: "required",
      label: "Required",
      width: "96px",
      role: "figure",
      render: (p) => (
        <span title={`${required(p)} steps are required`} className={cn("whitespace-nowrap text-bz-text", NUM)}>
          {required(p)}
          <span className="text-bz-text-soft sm:hidden"> required</span>
        </span>
      ),
    },
    {
      key: "types",
      label: "Customer types",
      width: "minmax(0,1.3fr)",
      hideBelow: 768,
      render: (p) =>
        p.forTypeIds.length ? (
          <span title={forTypes(p)} className="flex min-w-0 items-center gap-3 overflow-hidden">
            {p.forTypeIds.map((t) => {
              const x = typeName(types, t);
              return <TypeMark key={t} name={x.plural} color={x.color} className="text-[12.5px] text-bz-text-muted" />;
            })}
          </span>
        ) : (
          <span className="text-bz-text-soft">—</span>
        ),
    },
  ];

  const newButton = (
    <button type="button" className={BTN} onClick={() => open("new")} title="New playbook (N)">
      <Plus size={14} /> New playbook
    </button>
  );

  return (
    <SfShell current="setup:playbooks" actions={newButton}>
      <div className="relative h-full min-h-0">
        <div className="h-full overflow-y-auto px-4 pb-8 [scrollbar-width:thin] md:px-6">
          <div className="flex flex-col gap-3">
            {rows.length > 0 && (
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <PillTabs<Tab>
                  value={tab}
                  onChange={setTab}
                  options={[
                    { value: "all", label: "All" },
                    { value: "in-use", label: "In use" },
                    { value: "unused", label: "Not used" },
                  ]}
                />
                <FxSearch ref={searchRef} value={q} onChange={setQ} placeholder="Playbook or step" hint="/" className="w-full sm:ml-auto sm:w-[260px]" />
              </div>
            )}

            <FxTable<Row>
              label="Playbooks"
              rows={visible}
              idOf={(p) => p.id}
              columns={columns}
              noun={["playbook", "playbooks"]}
              rowLabel={(p) => p.name}
              onOpen={(p) => open(p.id)}
              current={openId}
              keys={!openId}
              empty={
                rows.length === 0 ? (
                  <FxEmpty title="No playbooks yet.">{newButton}</FxEmpty>
                ) : (
                  <FxEmpty title="Nothing matches.">
                    {filtered && (
                      <button type="button" className={HEAD_BTN} onClick={() => (setQ(""), setTab("all"))}>
                        Clear filters
                      </button>
                    )}
                  </FxEmpty>
                )
              }
            />
          </div>
        </div>

        {openId && <PlaybookSheet key={openId} id={openId} show={show} onClose={() => open(null)} onOpen={open} onDelete={(id) => setDeleting(playbooks.find((p) => p.id === id) ?? null)} />}

        <ConfirmDialog
          open={!!deleting}
          eyebrow="Playbook"
          title={`Delete ${deleting?.name ?? ""}?`}
          body={deleting ? afterDelete(deleting, types) : ""}
          confirm="Delete playbook"
          danger
          onClose={() => setDeleting(null)}
          onConfirm={() => deleting && remove(deleting)}
        />

        <ToastHost toast={toast} onDismiss={dismiss} />
      </div>
    </SfShell>
  );
}

// ── The playbook, as a form ─────────────────────────────────────────────────

type Draft = { name: string; forTypeIds: string[]; items: PlaybookItem[] };
type SheetProps = { id: string; show: Toast; onClose: () => void; onOpen: (id: string) => void; onDelete: (id: string) => void };

function PlaybookSheet(props: SheetProps) {
  const playbooks = useStore(playbooksStore);
  if (props.id !== "new" && !playbooks.some((p) => p.id === props.id))
    return (
      <FormSheet label="Playbook" title="Playbook" onClose={props.onClose}>
        <FxEmpty title="This playbook isn't available.">
          <button type="button" className={HEAD_BTN} onClick={props.onClose}>
            Close
          </button>
        </FxEmpty>
      </FormSheet>
    );
  return <PlaybookForm {...props} />;
}

const STEP_BTN = cn(ICON_BTN, "size-7");

function PlaybookForm({ id, show, onClose, onOpen, onDelete }: SheetProps) {
  const playbooks = useStore(playbooksStore);
  const types = useStore(typesStore);
  const activities = useStore(activitiesStore);
  const isNew = id === "new";
  const original: Draft = React.useMemo(() => {
    const p = playbooks.find((x) => x.id === id);
    return p ? { name: p.name, forTypeIds: [...p.forTypeIds], items: p.items.map((i) => ({ ...i })) } : { name: "", forTypeIds: [], items: [] };
  }, [playbooks, id]);
  const [d, setD] = React.useState<Draft>(original);
  const [tried, setTried] = React.useState(false);
  const nameRef = React.useRef<HTMLInputElement>(null);
  const addRef = React.useRef<HTMLButtonElement>(null);
  const [adding, setAdding] = React.useState(false);
  const [custom, setCustom] = React.useState<null | "document" | "form">(null);
  const dirty = JSON.stringify(d) !== JSON.stringify(original);
  const act = (aid: string) => activities.find((a) => a.id === aid);
  const name = d.name.trim();
  const nameError = !name ? "Give the playbook a name." : playbooks.some((p) => p.id !== id && p.name.toLowerCase() === name.toLowerCase()) ? `There is already a playbook called ${name}.` : null;
  const stepsError = d.items.length === 0 ? "Add at least one step." : null;

  const patchItem = (i: number, patch: Partial<PlaybookItem>) => setD((x) => ({ ...x, items: x.items.map((it, k) => (k === i ? { ...it, ...patch } : it)) }));
  const move = (i: number, by: -1 | 1) =>
    setD((x) => {
      const items = [...x.items];
      const j = i + by;
      if (j < 0 || j >= items.length) return x;
      [items[i], items[j]] = [items[j], items[i]];
      return { ...x, items };
    });
  const add = (aid: string) => {
    const a = act(aid) ?? activitiesStore.get().find((x) => x.id === aid);
    setD((x) => ({ ...x, items: [...x.items, { activityId: aid, required: a?.kind === "order", geofence: a?.kind === "order" || a?.kind === "stock-count" || a?.kind === "photo", when: "every visit" }] }));
  };

  const save = () => {
    setTried(true);
    if (nameError) return nameRef.current?.focus();
    if (stepsError) return addRef.current?.focus();
    let pid = id;
    if (isNew) {
      pid = nextId("PB-", playbooks.map((p) => p.id));
      playbooksStore.set((ps) => [...ps, { id: pid, name, forTypeIds: [], items: d.items }]);
      logEvent(pid, `created it with ${stepsWord(d.items.length)}`);
    } else {
      playbooksStore.set((ps) => ps.map((p) => (p.id === id ? { ...p, name, items: d.items } : p)));
      describe(original, { ...d, name }, (aid) => act(aid)?.name ?? aid).forEach((w) => logEvent(id, w));
    }
    const dropped = original.forTypeIds.filter((t) => !d.forTypeIds.includes(t));
    if (dropped.length) linkPlaybook(dropped, null);
    if (d.forTypeIds.length) linkPlaybook(d.forTypeIds, pid);
    setTried(false);
    if (isNew) {
      show("success", `${name} created`);
      onOpen(pid);
    } else {
      setD((x) => ({ ...x, name }));
      show("success", `${name} saved · reps get it on their next visit`);
    }
  };

  const usedBy = original.forTypeIds.map((t) => typeName(types, t).plural).join(", ");

  return (
    <FormSheet
      label={isNew ? "New playbook" : `Playbook ${original.name}`}
      title={isNew ? "New playbook" : original.name}
      meta={
        isNew ? undefined : (
          <>
            <span>{stepsWord(original.items.length)}</span>
            <span aria-hidden className="size-[3px] rounded-bz-pill bg-bz-line" />
            <span>{usedBy || "Not used"}</span>
          </>
        )
      }
      menu={
        isNew
          ? undefined
          : (close) => (
              <MenuItem danger onClick={() => (close(), onDelete(id))}>
                Delete
              </MenuItem>
            )
      }
      dirty={dirty}
      fresh={isNew}
      onSave={save}
      onClose={onClose}
    >
      <div className={GROUPS}>
        <div className={FIELDS}>
          <FField label="Name" required changed={!isNew && d.name !== original.name} error={tried ? nameError : null}>
            <input ref={nameRef} autoFocus={isNew} value={d.name} onChange={(e) => setD((x) => ({ ...x, name: e.target.value }))} aria-label="Name" placeholder="Pharmacy visit" className={cn(INPUT, tried && nameError && "border-bz-red-mark")} />
          </FField>
        </div>

        <Group
          title="Steps"
          count={d.items.length}
          right={
            <button ref={addRef} type="button" onClick={() => setAdding(true)} aria-haspopup="menu" aria-expanded={adding} className={cn(HEAD_BTN, "h-8 px-2.5")}>
              <Plus size={13} className="text-bz-text-muted" /> Add step
            </button>
          }
        >
          {d.items.length === 0 ? (
            <p role={tried ? "alert" : undefined} className={cn("m-0 rounded-[12px] border border-dashed px-4 py-6 text-center text-[13px]", tried ? "border-bz-red-mark text-bz-red" : "border-bz-line text-bz-text-muted")}>
              {tried ? stepsError : "No steps yet."}
            </p>
          ) : (
            <ol className="m-0 list-none overflow-hidden rounded-[12px] border border-bz-line-soft p-0">
              {d.items.map((it, i) => {
                const a = act(it.activityId);
                return (
                  <li key={`${it.activityId}-${i}`} className="border-t border-bz-line-soft px-3.5 py-3 first:border-t-0">
                    <div className="flex items-center gap-3">
                      <span className={cn("flex size-6 shrink-0 items-center justify-center rounded-[7px] bg-bz-paper-warm text-[11.5px] font-semibold text-bz-text-muted", NUM)}>{i + 1}</span>
                      <span className="min-w-0 flex-1 leading-snug">
                        <span className="block truncate text-[13px] font-medium text-bz-text">{a?.name ?? it.activityId}</span>
                        <span className="block truncate text-[11.5px] text-bz-text-soft">{a ? `${KIND_LABEL[a.kind]} · ${a.detail}` : "Not in the library"}</span>
                      </span>
                      <span className="-mr-1 flex shrink-0 items-center">
                        <button type="button" className={STEP_BTN} onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up" title="Move up">
                          <ArrowUp size={13} />
                        </button>
                        <button type="button" className={STEP_BTN} onClick={() => move(i, 1)} disabled={i === d.items.length - 1} aria-label="Move down" title="Move down">
                          <ArrowDown size={13} />
                        </button>
                        <button type="button" className={cn(STEP_BTN, "hover:text-bz-red")} onClick={() => setD((x) => ({ ...x, items: x.items.filter((_, k) => k !== i) }))} aria-label="Remove step" title="Remove step">
                          <X size={13} />
                        </button>
                      </span>
                    </div>
                    <div className="mt-2.5 flex flex-wrap items-center gap-x-5 gap-y-2 pl-9">
                      <label className="inline-flex cursor-pointer items-center gap-2 text-[12.5px] text-bz-text-muted" title="Must be done before the visit can close">
                        <Checkbox on={it.required} onChange={(v) => patchItem(i, { required: v })} label="Required" /> Required
                      </label>
                      <label className="inline-flex cursor-pointer items-center gap-2 text-[12.5px] text-bz-text-muted" title="Unlocks only when the rep's GPS puts them at the shop">
                        <Switch on={it.geofence} onChange={(v) => patchItem(i, { geofence: v })} label="At the shop only" /> At the shop only
                      </label>
                      <span className="sm:ml-auto">
                        <Select trigger="ghost" className="h-8 text-[12px]" width={180} align="right" title="When the step is due" value={it.when} onChange={(v) => patchItem(i, { when: v as PlaybookItem["when"] })} label={cap(it.when)} options={WHEN.map((w) => ({ value: w, label: cap(w) }))} />
                      </span>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </Group>

        <Group title="Customer types" count={d.forTypeIds.length}>
          <FField label="Followed by" title="A type follows one playbook — adding it here takes it off its current one" changed={!isNew && [...d.forTypeIds].sort().join() !== [...original.forTypeIds].sort().join()}>
            <MultiPicker
              value={d.forTypeIds}
              onChange={(v) => setD((x) => ({ ...x, forTypeIds: v }))}
              placeholder="Pick customer types"
              options={types.map((t) => {
                const other = t.playbookId && t.playbookId !== id ? playbooks.find((p) => p.id === t.playbookId)?.name : null;
                return { value: t.id, label: t.plural, hint: other ? `Now on ${other}` : undefined };
              })}
              addLabel="New customer type"
              onAdd={() => {
                // The picker stays open on a pick (it is a multi-select) and would sit over the dialog: a resize is what closes a bzw popover.
                window.dispatchEvent(new Event("resize"));
                openQuickAdd("type", { onCreated: (tid) => setD((x) => ({ ...x, forTypeIds: [...x.forTypeIds, tid] })) });
              }}
            />
          </FField>
        </Group>
      </div>

      {!isNew && (
        <div className="border-t border-bz-line-soft">
          <SfActivity ids={[id]} />
          <SfNoteFoot id={id} />
        </div>
      )}

      <Popover open={adding} anchor={addRef.current} onClose={() => setAdding(false)} align="right" width={320}>
        {KIND_GROUPS.map((g, gi) => {
          const list = activities.filter((a) => g.kinds.includes(a.kind));
          return (
            <div key={g.label}>
              {gi > 0 && <MenuSep />}
              <MenuLabel>{g.label}</MenuLabel>
              {list.map((a) => {
                const has = d.items.some((i) => i.activityId === a.id);
                return (
                  <MenuItem key={a.id} hint={has ? "Already a step" : a.detail} disabled={has} onClick={() => (add(a.id), setAdding(false))}>
                    {a.name}
                  </MenuItem>
                );
              })}
              {g.kinds.includes("document") && (
                <>
                  <MenuItem icon={DocumentIcon} onClick={() => (setAdding(false), setCustom("document"))}>
                    Any Bizak document…
                  </MenuItem>
                  <MenuItem icon={FormIcon} onClick={() => (setAdding(false), setCustom("form"))}>
                    Custom form…
                  </MenuItem>
                </>
              )}
            </div>
          );
        })}
      </Popover>
      <CustomActivityDialog open={custom} onClose={() => setCustom(null)} onCreate={(aid) => (add(aid), setCustom(null))} />
    </FormSheet>
  );
}

function CustomActivityDialog({ open, onClose, onCreate }: { open: null | "document" | "form"; onClose: () => void; onCreate: (id: string) => void }) {
  const [pick, setPick] = React.useState<string | null>(null);
  const [name, setName] = React.useState("");
  const [tried, setTried] = React.useState(false);
  React.useEffect(() => {
    setPick(null);
    setName("");
    setTried(false);
  }, [open]);
  const isDoc = open === "document";
  const choices = isDoc ? DOCUMENTS : FORMS;
  const suggested = pick ? (isDoc ? `Raise a ${pick.toLowerCase()}` : `Fill the ${pick.toLowerCase()}`) : "";
  const create = () => {
    setTried(true);
    if (!pick) return;
    const n = name.trim() || suggested;
    const prefix = isDoc ? "AC-DOC-" : "AC-FRM-";
    const idNew = nextId(prefix, activitiesStore.get().map((a) => a.id));
    activitiesStore.set((as) => [...as, { id: idNew, name: n, kind: isDoc ? "document" : "form", detail: isDoc ? `Any Bizak document — here a ${pick.toLowerCase()}` : `Form: ${pick}` }]);
    onCreate(idNew);
  };
  return (
    <Dialog
      open={open !== null}
      title={isDoc ? "Any Bizak document" : "Custom form"}
      onClose={onClose}
      foot={
        <>
          <button type="button" className={GHOST} onClick={onClose}>
            Cancel
          </button>
          <button type="button" className={BTN} onClick={create}>
            Add step
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <Field label={isDoc ? "Document" : "Form"} required hint={tried && !pick ? <span role="alert" className="text-bz-red">{isDoc ? "Pick a document." : "Pick a form."}</span> : undefined}>
          <Picker ariaLabel={isDoc ? "Document" : "Form"} width={300} value={pick} onChange={setPick} placeholder={isDoc ? "Pick a document" : "Pick a form"} options={choices.map((c) => ({ value: c, label: c }))} />
        </Field>
        <Field label="Step name">
          <input value={name} onChange={(e) => setName(e.target.value)} aria-label="Step name" className={INPUT} placeholder={suggested} />
        </Field>
      </div>
    </Dialog>
  );
}

function describe(a: Draft, b: Draft, nameOf: (id: string) => string) {
  const out: string[] = [];
  if (a.name !== b.name) out.push(`renamed the playbook to ${b.name}`);
  const aIds = a.items.map((i) => i.activityId);
  const bIds = b.items.map((i) => i.activityId);
  bIds.filter((x) => !aIds.includes(x)).forEach((x) => out.push(`added ${nameOf(x)}`));
  aIds.filter((x) => !bIds.includes(x)).forEach((x) => out.push(`removed ${nameOf(x)}`));
  const common = bIds.filter((x) => aIds.includes(x));
  if (common.join() !== aIds.filter((x) => bIds.includes(x)).join()) out.push("changed the order of the steps");
  b.items.forEach((it) => {
    const was = a.items.find((x) => x.activityId === it.activityId);
    if (!was) return;
    const n = nameOf(it.activityId);
    if (was.required !== it.required) out.push(`made ${n} ${it.required ? "required" : "optional"}`);
    if (was.geofence !== it.geofence) out.push(`${it.geofence ? "set at-the-shop-only on" : "allowed away from the shop:"} ${n}`);
    if (was.when !== it.when) out.push(`set ${n} to ${it.when}`);
  });
  const addT = b.forTypeIds.filter((t) => !a.forTypeIds.includes(t));
  const dropT = a.forTypeIds.filter((t) => !b.forTypeIds.includes(t));
  if (addT.length || dropT.length) out.push("changed the customer types it applies to");
  return out;
}
