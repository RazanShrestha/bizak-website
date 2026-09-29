import * as React from "react";
import { ArrowDown, ArrowUp, FileText, ListChecks, Plus, X } from "lucide-react";
import { cn } from "../ui/utils";
import { BTN, Checkbox, Dialog, Field, GHOST, GHOST_SM, ICON_BTN_SM, INPUT, MenuItem, MenuLabel, MenuSep, NUM, Popover, Select, ToastHost, useToast } from "../sales/bzw";
import { createStore, useStore } from "../sales/store";
import { ACTIVITIES } from "./data";
import type { Activity, ActivityKind, PlaybookItem } from "./data";
import { playbooksStore, typesStore } from "./store";
import { List, PageIntro, Row, SidePanel, TypeMark } from "./ui";
import { RecordActivity, RecordNoteFoot, logChange } from "./network-log";
import { typeIn } from "./network-model";
import { FormBlock, SaveBar, SetupFrame, linkPlaybook, useSetupSelection } from "./setup-frame";

// ════════════════════════════════════════════════════════════════════════════
// SETUP · PLAYBOOKS — what a visit holds, built from an activity library
//
// Activity library → playbook (ordered steps, each required or not, geofenced
// or not, every visit / weekly / monthly / during a campaign) → the customer
// types it applies to (research/A §2, P1–P4). The library includes two open
// doors: "Any Bizak document" and "Custom form" (a Dynamic Form), which is
// what makes the playbook generic rather than one client's checklist.
// Activities added here live in `activitiesStore` (ACTIVITIES is a constant).
// ════════════════════════════════════════════════════════════════════════════

export const activitiesStore = createStore<Activity[]>([...ACTIVITIES, { id: "AC-TSK", name: "Follow-up task", kind: "task", detail: "A task for the rep or the office, with a due date" }]);

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

export function PlaybooksTab() {
  const playbooks = useStore(playbooksStore);
  const types = useStore(typesStore);
  const activities = useStore(activitiesStore);
  const [sel, setSel] = useSetupSelection();
  const open = sel === "new" || playbooks.some((p) => p.id === sel);
  const without = types.filter((t) => !t.playbookId);

  return (
    <SetupFrame tab="playbooks" panel={open && sel ? <PlaybookEditor key={sel} id={sel} onClose={() => setSel(null)} onSaved={setSel} /> : null}>
      <PageIntro
        actions={
          <button type="button" className={GHOST} onClick={() => setSel("new")}>
            <Plus size={13} /> New playbook
          </button>
        }
      >
        A playbook is what a rep does on a visit, step by step. Each customer type follows one.
      </PageIntro>

      <List>
        {playbooks.map((p) => {
          const req = p.items.filter((i) => i.required).length;
          const names = p.forTypeIds.map((t) => typeIn(types, t).plural);
          return (
            <Row
              key={p.id}
              active={p.id === sel}
              onClick={() => setSel(p.id)}
              lead={
                <span className="flex size-8 items-center justify-center rounded-bz-pill bg-bz-paper-warm text-bz-text-muted">
                  <ListChecks size={14} />
                </span>
              }
              title={p.name}
              sub={names.length ? `For ${names.join(", ")}` : "Not used by any type"}
              meta={[
                <span key="a" className="block w-[260px] truncate text-bz-text-soft">
                  {p.items.map((i) => activities.find((a) => a.id === i.activityId)?.name).join(" → ")}
                </span>,
              ]}
              trail={
                <span className="block w-[110px] text-[11.5px] font-normal text-bz-text-muted">
                  {p.items.length} steps · {req} required
                </span>
              }
            />
          );
        })}
      </List>
      {without.length > 0 && (
        <p className="m-0 mt-4 text-[11px] text-bz-text-soft">
          {without.map((t) => t.plural).join(", ")} {without.length === 1 ? "has" : "have"} no playbook — reps log a plain visit there.
        </p>
      )}
    </SetupFrame>
  );
}

// ── Editor ──────────────────────────────────────────────────────────────────

type Draft = { name: string; forTypeIds: string[]; items: PlaybookItem[] };

function PlaybookEditor({ id, onClose, onSaved }: { id: string; onClose: () => void; onSaved: (id: string) => void }) {
  const playbooks = useStore(playbooksStore);
  const types = useStore(typesStore);
  const activities = useStore(activitiesStore);
  const { toast, show, dismiss } = useToast();
  const isNew = id === "new";
  const original: Draft = React.useMemo(() => {
    const p = playbooks.find((x) => x.id === id);
    return p ? { name: p.name, forTypeIds: [...p.forTypeIds], items: p.items.map((i) => ({ ...i })) } : { name: "", forTypeIds: [], items: [] };
  }, [playbooks, id]);
  const [d, setD] = React.useState<Draft>(original);
  const addRef = React.useRef<HTMLButtonElement>(null);
  const [adding, setAdding] = React.useState(false);
  const [custom, setCustom] = React.useState<null | "document" | "form">(null);
  const dirty = isNew || JSON.stringify(d) !== JSON.stringify(original);
  const act = (aid: string) => activities.find((a) => a.id === aid);
  const name = d.name.trim();
  const error = !name
    ? "Give the playbook a name."
    : playbooks.some((p) => p.id !== id && p.name.toLowerCase() === name.toLowerCase())
      ? `There is already a playbook called ${name}.`
      : d.items.length === 0
        ? "Add at least one step."
        : null;

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
    if (error) return;
    let pid = id;
    if (isNew) {
      pid = `PB-${name.toUpperCase().replace(/[^A-Z0-9]+/g, "").slice(0, 6) || "NEW"}`;
      while (playbooks.some((p) => p.id === pid)) pid += "X";
      playbooksStore.set((ps) => [...ps, { id: pid, name, forTypeIds: [], items: d.items }]);
      logChange(`playbook:${pid}`, `created the playbook with ${d.items.length} steps`);
    } else {
      playbooksStore.set((ps) => ps.map((p) => (p.id === id ? { ...p, name, items: d.items } : p)));
      describe(original, { ...d, name }, (aid) => act(aid)?.name ?? aid).forEach((w) => logChange(`playbook:${id}`, w));
    }
    const dropped = original.forTypeIds.filter((t) => !d.forTypeIds.includes(t));
    if (dropped.length) linkPlaybook(dropped, null);
    if (d.forTypeIds.length) linkPlaybook(d.forTypeIds, pid);
    if (isNew) onSaved(pid);
    else show("success", `${name} saved. Reps get it on their next visit.`);
  };

  const preview = d.items.map((i) => act(i.activityId)?.name).filter(Boolean);
  const req = d.items.filter((i) => i.required).length;
  const firstType = d.forTypeIds[0] ? typeIn(types, d.forTypeIds[0]).name.toLowerCase() : "a customer";

  return (
    <SidePanel
      open
      width={680}
      onClose={onClose}
      eyebrow={isNew ? "New playbook" : "Playbook"}
      title={isNew ? name || "New playbook" : original.name}
      meta={!isNew && <span className={NUM}>{original.items.length} steps</span>}
      foot={
        dirty ? (
          <SaveBar error={error} note={d.forTypeIds.length ? `Reps visiting ${d.forTypeIds.map((t) => typeIn(types, t).plural.toLowerCase()).join(", ")} get it on their next visit.` : undefined} onDiscard={() => (isNew ? onClose() : setD(original))} onSave={save} saveLabel={isNew ? "Create playbook" : "Save"} />
        ) : (
          <RecordNoteFoot subject={`playbook:${id}`} />
        )
      }
    >
      {preview.length > 0 && (
        <div className="mb-8 rounded-bz-md bg-bz-paper-warm/70 px-4 py-3">
          <p className="m-0 text-[10px] font-semibold uppercase tracking-[0.14em] text-bz-text-soft">On a visit</p>
          <p className="m-0 mt-1.5 text-[12.5px] leading-relaxed text-bz-text">
            At {firstType === "a customer" ? "a customer" : `a ${firstType}`}: {preview.join(" → ")}.
          </p>
          <p className="m-0 mt-1 text-[11px] text-bz-text-soft">
            {req} of {d.items.length} {d.items.length === 1 ? "step is" : "steps are"} required · {d.items.filter((i) => i.geofence).length} only at the outlet
          </p>
        </div>
      )}

      <div className="flex flex-col gap-6">
        <FormBlock title="Name">
          <input autoFocus={isNew} value={d.name} onChange={(e) => setD((x) => ({ ...x, name: e.target.value }))} className={INPUT} placeholder="e.g. Pharmacy visit" />
        </FormBlock>

        <FormBlock title="Applies to" hint="A type follows one playbook. Adding a type here takes it off its current one.">
          <Select
            multiple
            trigger="ghost"
            width={300}
            className="w-full justify-between"
            value={d.forTypeIds}
            onChange={(v) => setD((x) => ({ ...x, forTypeIds: v }))}
            label={d.forTypeIds.length ? d.forTypeIds.map((t) => typeIn(types, t).plural).join(", ") : "Pick customer types"}
            options={types.map((t) => {
              const other = t.playbookId && t.playbookId !== id ? playbooks.find((p) => p.id === t.playbookId)?.name : null;
              return { value: t.id, label: t.plural, hint: other ? `Now on ${other}` : undefined };
            })}
          />
          {d.forTypeIds.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
              {d.forTypeIds.map((t) => {
                const ty = typeIn(types, t);
                return <TypeMark key={t} name={ty.plural} color={ty.color} />;
              })}
            </div>
          )}
        </FormBlock>

        <FormBlock title="Steps" hint="In the order the rep sees them. Required steps must be done before the visit can close; geofenced ones only at the outlet.">
          {d.items.length === 0 ? (
            <p className="m-0 text-[11.5px] text-bz-text-soft">No steps yet. Add one from the library.</p>
          ) : (
            <ol className="m-0 list-none divide-y divide-bz-line-soft border-y border-bz-line-soft p-0">
              {d.items.map((it, i) => {
                const a = act(it.activityId);
                return (
                  <li key={`${it.activityId}-${i}`} className="flex flex-wrap items-center gap-x-3 gap-y-2 py-3">
                    <span className={cn("w-5 shrink-0 text-right text-[11px] text-bz-text-soft", NUM)}>{i + 1}</span>
                    <span className="min-w-0 flex-1 basis-[180px]">
                      <span className="block truncate text-[12.5px] font-medium text-bz-text">{a?.name ?? it.activityId}</span>
                      <span className="block truncate text-[11px] text-bz-text-soft">
                        {a ? `${KIND_LABEL[a.kind]} · ${a.detail}` : "Not in the library"}
                      </span>
                    </span>
                    <span className="ml-8 flex flex-wrap items-center gap-x-4 gap-y-2 sm:ml-0">
                      <label className="inline-flex items-center gap-1.5 text-[11.5px] text-bz-text-muted">
                        <Checkbox on={it.required} onChange={(v) => patchItem(i, { required: v })} label="Required" /> Required
                      </label>
                      <label className="inline-flex items-center gap-1.5 text-[11.5px] text-bz-text-muted">
                        <Checkbox on={it.geofence} onChange={(v) => patchItem(i, { geofence: v })} label="At the outlet only" /> Geofence
                      </label>
                      <Select
                        trigger="ghost"
                        width={180}
                        value={it.when}
                        onChange={(v) => patchItem(i, { when: v as PlaybookItem["when"] })}
                        label={it.when.charAt(0).toUpperCase() + it.when.slice(1)}
                        options={WHEN.map((w) => ({ value: w, label: w.charAt(0).toUpperCase() + w.slice(1) }))}
                      />
                      <span className="flex items-center">
                        <button type="button" className={ICON_BTN_SM} onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up" title="Move up">
                          <ArrowUp size={12} />
                        </button>
                        <button type="button" className={ICON_BTN_SM} onClick={() => move(i, 1)} disabled={i === d.items.length - 1} aria-label="Move down" title="Move down">
                          <ArrowDown size={12} />
                        </button>
                        <button type="button" className={cn(ICON_BTN_SM, "hover:text-bz-red")} onClick={() => setD((x) => ({ ...x, items: x.items.filter((_, k) => k !== i) }))} aria-label="Remove step" title="Remove step">
                          <X size={12} />
                        </button>
                      </span>
                    </span>
                  </li>
                );
              })}
            </ol>
          )}
          <button ref={addRef} type="button" onClick={() => setAdding(true)} className={cn(GHOST_SM, "mt-3")}>
            <Plus size={12} /> Add a step
          </button>
          <Popover open={adding} anchor={addRef.current} onClose={() => setAdding(false)} width={320}>
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
                      <MenuItem icon={FileText} hint="Estimate, delivery, receipt, credit memo…" onClick={() => (setAdding(false), setCustom("document"))}>
                        Any Bizak document…
                      </MenuItem>
                      <MenuItem icon={ListChecks} hint="A form built in Dynamic Forms — photo, signature, location" onClick={() => (setAdding(false), setCustom("form"))}>
                        Custom form…
                      </MenuItem>
                    </>
                  )}
                </div>
              );
            })}
          </Popover>
        </FormBlock>
      </div>

      {!isNew && <RecordActivity subject={`playbook:${id}`} />}
      <CustomActivityDialog open={custom} onClose={() => setCustom(null)} onCreate={(aid) => (add(aid), setCustom(null))} />
      <ToastHost toast={toast} onDismiss={dismiss} />
    </SidePanel>
  );
}

function CustomActivityDialog({ open, onClose, onCreate }: { open: null | "document" | "form"; onClose: () => void; onCreate: (id: string) => void }) {
  const [pick, setPick] = React.useState<string | null>(null);
  const [name, setName] = React.useState("");
  React.useEffect(() => {
    setPick(null);
    setName("");
  }, [open]);
  const isDoc = open === "document";
  const choices = isDoc ? DOCUMENTS : FORMS;
  const suggested = pick ? (isDoc ? `Raise a ${pick.toLowerCase()}` : `Fill the ${pick.toLowerCase()}`) : "";
  const create = () => {
    if (!pick) return;
    const n = name.trim() || suggested;
    const idNew = `AC-${isDoc ? "DOC" : "FRM"}-${activitiesStore.get().length + 1}`;
    activitiesStore.set((as) => [...as, { id: idNew, name: n, kind: isDoc ? "document" : "form", detail: isDoc ? `Any Bizak document — here a ${pick.toLowerCase()}` : `Form: ${pick}` }]);
    onCreate(idNew);
  };
  return (
    <Dialog
      open={open !== null}
      eyebrow="Activity library"
      title={isDoc ? "Any Bizak document" : "Custom form"}
      onClose={onClose}
      foot={
        <>
          <button type="button" className={GHOST} onClick={onClose}>
            Cancel
          </button>
          <button type="button" className={BTN} onClick={create} disabled={!pick}>
            Add step
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Field label={isDoc ? "Document" : "Form"} hint={isDoc ? "The rep raises it for this customer. It follows the document's own approval." : "Only published forms are listed. Build new ones in Dynamic Forms."}>
          <Select trigger="ghost" width={300} className="w-full justify-between" value={pick} onChange={setPick} label={pick ?? (isDoc ? "Pick a document" : "Pick a form")} options={choices.map((c) => ({ value: c, label: c }))} />
        </Field>
        <Field label="Step name" hint="What the rep sees in the visit.">
          <input value={name} onChange={(e) => setName(e.target.value)} className={INPUT} placeholder={suggested || "e.g. Give a quotation"} />
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
    if (was.geofence !== it.geofence) out.push(`${it.geofence ? "geofenced" : "removed the geofence on"} ${n}`);
    if (was.when !== it.when) out.push(`set ${n} to ${it.when}`);
  });
  const addT = b.forTypeIds.filter((t) => !a.forTypeIds.includes(t));
  const dropT = a.forTypeIds.filter((t) => !b.forTypeIds.includes(t));
  if (addT.length || dropT.length) out.push("changed the customer types it applies to");
  return out;
}

