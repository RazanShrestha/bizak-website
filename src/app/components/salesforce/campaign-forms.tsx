import * as React from "react";
import { cn } from "../ui/utils";
import { BTN, DANGER_BTN, Dialog, Field, GHOST, INPUT, NUM, Select, TEXTAREA } from "../sales/bzw";
import type { SelectOption } from "../sales/bzw";
import { SheetFrame } from "../sales/FulfilSheet";
import { useStore } from "../sales/store";
import { DateField } from "../masters/kit";
import { SF_TODAY } from "./data";
import type { Campaign } from "./data";
import { npr, productById } from "./engine";
import { nextId } from "./persist";
import { openQuickAdd, quickAddStore } from "./quickadd";
import { STAFF_NAME, logEvent } from "./records";
import { campaignsStore, customersStore, productsStore, typesStore } from "./store";
import { MoneyInput, MultiPicker, Pair, Picker, SuggestInput } from "./network-form";
import { MEASURE_HINT, MEASURE_LABEL, MEASURE_UNIT, addDays, audienceOf, campaignBrandStore, kpisStore, toNumber } from "./activationKit";
import type { Kpi, KpiMeasure } from "./activationKit";

// ════════════════════════════════════════════════════════════════════════════
// CAMPAIGN FORMS — the campaign sheet (new and edit) and the goal dialog
//
// A goal is what activationKit calls a Kpi: only its target is typed in, the
// result is always counted. The campaign's one-sentence aim is its objective.
// ════════════════════════════════════════════════════════════════════════════

// ── A goal ──────────────────────────────────────────────────────────────────

type KpiDraft = { measure: KpiMeasure; scope: string; target: string; unit: string; label: string };
const blankKpi = (): KpiDraft => ({ measure: "sales", scope: "all", target: "", unit: "", label: "" });
const draftOf = (k: Kpi): KpiDraft => ({ measure: k.measure, scope: k.productId ? `product:${k.productId}` : k.brand ? `brand:${k.brand}` : "all", target: String(k.target), unit: k.unit, label: k.label });

function suggestedUnit(d: KpiDraft) {
  if (d.measure !== "cases") return MEASURE_UNIT[d.measure];
  if (d.scope.startsWith("product:")) return productById(d.scope.slice(8)).unit || "cases";
  if (d.scope.startsWith("brand:")) return productsStore.get().find((p) => p.brand === d.scope.slice(6))?.unit || "cases";
  return "cases";
}
function suggestedLabel(d: KpiDraft) {
  if (d.measure !== "cases") return MEASURE_LABEL[d.measure];
  if (d.scope.startsWith("product:")) return `${productById(d.scope.slice(8)).name} sold`;
  if (d.scope.startsWith("brand:")) return `${d.scope.slice(6)} sold`;
  return "Quantity sold";
}
function toKpi(d: KpiDraft, id: string): Kpi {
  return {
    id,
    label: d.label.trim() || suggestedLabel(d),
    measure: d.measure,
    target: toNumber(d.target),
    unit: d.unit.trim() || suggestedUnit(d),
    productId: d.measure === "cases" && d.scope.startsWith("product:") ? d.scope.slice(8) : null,
    brand: d.measure === "cases" && d.scope.startsWith("brand:") ? d.scope.slice(6) : null,
  };
}

const NEW_PRODUCT = "__new";
// The face of network-form's Picker. The scope list is grouped, and Picker would file its create option under the
// first group instead of at the end, so this one Select is built here.
const FIELD_TRIGGER = "h-9 w-full justify-between rounded-bz-md border-bz-line bg-bz-paper px-3 text-[12.5px] font-normal hover:border-bz-text-soft";

function KpiFields({ value: d, onChange, invalid }: { value: KpiDraft; onChange: (d: KpiDraft) => void; invalid?: boolean }) {
  const products = useStore(productsStore);
  const brands = [...new Set(products.map((p) => p.brand.trim()).filter(Boolean))].sort();
  const scopeOptions: SelectOption[] = [
    { value: "all", label: "All products" },
    ...brands.map((b) => ({ value: `brand:${b}`, label: b, group: "Brand" })),
    ...products.map((p) => ({ value: `product:${p.id}`, label: p.name, hint: p.pack || undefined, group: "Product" })),
    { value: NEW_PRODUCT, label: "New product", group: "Product" },
  ];
  const scopeLabel = scopeOptions.find((o) => o.value === d.scope)?.label ?? "All products";
  // The quick add answers after this render, so it reads the draft as it is then.
  const latest = React.useRef(d);
  latest.current = d;
  const set = (patch: Partial<KpiDraft>) => onChange({ ...d, ...patch });
  return (
    <div className="flex flex-col gap-3">
      <Field label="What it counts">
        <Picker
          value={d.measure}
          onChange={(v) => set({ measure: v as KpiMeasure })}
          placeholder={MEASURE_LABEL[d.measure]}
          ariaLabel={MEASURE_HINT[d.measure]}
          options={(["sales", "cases", "branded"] as const).map((m) => ({ value: m, label: MEASURE_LABEL[m], hint: MEASURE_HINT[m] }))}
        />
      </Field>
      {d.measure === "cases" && (
        <Field label="Of">
          <Select
            trigger="ghost"
            className={FIELD_TRIGGER}
            width={320}
            value={d.scope}
            label={scopeLabel}
            options={scopeOptions}
            onChange={(v) => (v === NEW_PRODUCT ? openQuickAdd("product", { onCreated: (id) => onChange({ ...latest.current, scope: `product:${id}` }) }) : set({ scope: v }))}
          />
        </Field>
      )}
      <Pair>
        <Field label="Target">
          <input inputMode="numeric" value={d.target} onChange={(e) => set({ target: e.target.value })} placeholder={d.measure === "sales" ? "2,000,000" : "500"} className={cn(INPUT, NUM, invalid && "border-bz-red-mark")} />
          {invalid && <span className="text-[10.5px] text-bz-red">Enter a number above 0.</span>}
        </Field>
        <Field label="Unit">
          <input value={d.unit} onChange={(e) => set({ unit: e.target.value })} placeholder={suggestedUnit(d)} className={INPUT} />
        </Field>
      </Pair>
      <Field label="Name">
        <input value={d.label} onChange={(e) => set({ label: e.target.value })} placeholder={suggestedLabel(d)} className={INPUT} />
      </Field>
    </div>
  );
}

/** Add, change or remove one goal of a campaign. */
export function KpiDialog({ open, campaignId, kpi, onClose }: { open: boolean; campaignId: string; kpi?: Kpi; onClose: () => void }) {
  // Two open dialogs would both answer Esc, so this one stands down while a quick add is up.
  const quickAdd = useStore(quickAddStore);
  const [d, setD] = React.useState<KpiDraft>(blankKpi);
  const [tried, setTried] = React.useState(false);
  React.useEffect(() => {
    if (!open) return;
    setD(kpi ? draftOf(kpi) : blankKpi());
    setTried(false);
  }, [open, kpi]);

  const bad = toNumber(d.target) <= 0;
  const save = () => {
    setTried(true);
    if (bad) return;
    const all = kpisStore.get()[campaignId] ?? [];
    const k = toKpi(d, kpi?.id ?? nextId("K-", all.map((x) => x.id), 1));
    kpisStore.set((m) => ({ ...m, [campaignId]: kpi ? all.map((x) => (x.id === kpi.id ? k : x)) : [...all, k] }));
    logEvent(campaignId, kpi ? `changed the goal ${k.label} · target ${npr(k.target)} ${k.unit}` : `added the goal ${k.label} · target ${npr(k.target)} ${k.unit}`);
    onClose();
  };
  const remove = () => {
    if (!kpi) return;
    kpisStore.set((m) => ({ ...m, [campaignId]: (m[campaignId] ?? []).filter((x) => x.id !== kpi.id) }));
    logEvent(campaignId, `removed the goal ${kpi.label}`);
    onClose();
  };

  return (
    <Dialog
      open={open && !quickAdd}
      eyebrow={campaignId}
      title={kpi ? "Edit goal" : "Add goal"}
      onClose={onClose}
      foot={
        <>
          {kpi && (
            <button type="button" className={cn(DANGER_BTN, "mr-auto")} onClick={remove}>
              Remove
            </button>
          )}
          <button type="button" className={GHOST} onClick={onClose}>
            Cancel
          </button>
          <button type="button" className={BTN} onClick={save}>
            {kpi ? "Save" : "Add goal"}
          </button>
        </>
      }
    >
      <KpiFields value={d} onChange={setD} invalid={tried && bad} />
    </Dialog>
  );
}

// ── The campaign ────────────────────────────────────────────────────────────

type Run = "dated" | "draft" | "ended";
const RUN_OPTIONS: SelectOption[] = [
  { value: "dated", label: "Runs on its dates", hint: "Planned before it starts, live while it runs" },
  { value: "draft", label: "Draft", hint: "Still being planned" },
  { value: "ended", label: "Ended", hint: "Stopped, whatever the dates say" },
];

/** New campaign (no `campaign`) or edit one — the body and foot of a sheet; the host supplies the RecordShell. */
export function CampaignSheet({ campaign, onCancel, onSaved }: { campaign?: Campaign; onCancel: () => void; onSaved: (id: string) => void }) {
  const types = useStore(typesStore);
  const products = useStore(productsStore);
  const brandsOf = useStore(campaignBrandStore);
  const [name, setName] = React.useState(campaign?.name ?? "");
  const [from, setFrom] = React.useState(campaign?.from ?? SF_TODAY);
  const [to, setTo] = React.useState(campaign?.to ?? addDays(SF_TODAY, 30));
  const [brand, setBrand] = React.useState(campaign ? brandsOf[campaign.id] ?? "" : "");
  const [budget, setBudget] = React.useState<number | null>(campaign ? campaign.budget : null);
  const [objective, setObjective] = React.useState(campaign?.objective ?? "");
  const [typeIds, setTypeIds] = React.useState<string[]>(campaign?.audience.typeIds ?? []);
  const [run, setRun] = React.useState<Run>(campaign?.status === "draft" ? "draft" : campaign?.status === "ended" ? "ended" : "dated");
  const [kpi, setKpi] = React.useState<KpiDraft>(blankKpi);
  const [tried, setTried] = React.useState(false);
  const [refusal, setRefusal] = React.useState<string | null>(null);
  // A multi-select stays open after a pick; remounting it closes its menu before the quick add opens over it.
  const [menus, setMenus] = React.useState(0);

  const budgetN = budget ?? 0;
  const datesBad = !from || !to || to < from;
  const problem = !name.trim() ? "A name is required." : !from || !to ? "Set the start and end dates." : to < from ? "The end date is before the start." : !budgetN ? "Enter a budget above 0." : null;
  const brands = [...new Set(products.map((p) => p.brand.trim()).filter(Boolean))].sort();

  const save = () => {
    setTried(true);
    if (problem) return setRefusal(problem);
    const status: Campaign["status"] = run === "draft" ? "draft" : run === "ended" ? "ended" : from > SF_TODAY ? "planned" : "live";
    const audience: Campaign["audience"] = { typeIds, outlets: 0 };
    const id = campaign?.id ?? nextId("CMP-", campaignsStore.get().map((c) => c.id));
    const base: Campaign = campaign
      ? { ...campaign, name: name.trim(), objective: objective.trim(), status, from, to, audience, budget: budgetN }
      : { id, name: name.trim(), objective: objective.trim(), status, from, to, audience, budget: budgetN, spent: 0, schemeIds: [], brandingIds: [], eventIds: [], tasks: [], kpi: [], owner: STAFF_NAME };
    const c: Campaign = { ...base, audience: { ...audience, outlets: audienceOf(base, customersStore.get()).length } };
    campaignsStore.set((cs) => (campaign ? cs.map((x) => (x.id === id ? c : x)) : [c, ...cs]));
    campaignBrandStore.set((b) => {
      const next = { ...b };
      if (brand.trim()) next[id] = brand.trim();
      else delete next[id];
      return next;
    });
    if (campaign) {
      const changed = [
        campaign.name !== c.name && "name",
        (campaign.from !== c.from || campaign.to !== c.to) && "dates",
        campaign.budget !== c.budget && `budget to NPR ${npr(c.budget)}`,
        campaign.objective !== c.objective && "objective",
        campaign.audience.typeIds.join() !== typeIds.join() && "audience",
        campaign.status !== c.status && `status to ${status}`,
        (brandsOf[id] ?? "") !== brand.trim() && "brand",
      ].filter(Boolean);
      if (changed.length) logEvent(id, `changed the ${changed.join(", ")}`);
    } else {
      logEvent(id, `created the campaign with a budget of NPR ${npr(budgetN)}`);
      if (toNumber(kpi.target) > 0) {
        const k = toKpi(kpi, "K-1");
        kpisStore.set((m) => ({ ...m, [id]: [k] }));
        logEvent(id, `added the goal ${k.label} · target ${npr(k.target)} ${k.unit}`);
      }
    }
    onSaved(id);
  };

  // An id whose master was deleted stays listed, so it can be seen and unticked.
  const typeOptions: SelectOption[] = [...types.map((t) => ({ value: t.id, label: t.plural })), ...typeIds.filter((id) => !types.some((t) => t.id === id)).map((id) => ({ value: id, label: "Deleted type" }))];
  const addType = () => {
    setMenus((n) => n + 1);
    openQuickAdd("type", { onCreated: (id) => setTypeIds((v) => [...v, id]) });
  };

  return (
    <SheetFrame
      onCommit={save}
      refusal={refusal}
      onDismissRefusal={() => setRefusal(null)}
      foot={
        <>
          <button type="button" className={cn(GHOST, "ml-auto")} onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className={BTN} onClick={save}>
            {campaign ? "Save" : "Create campaign"}
          </button>
        </>
      }
    >
      {/* A sheet that takes the page keeps the panel's measure, so a field never runs the width of a wide screen. */}
      <div className="w-full max-w-[720px]">
        <div className="grid grid-cols-1 gap-3 px-5 py-4 sm:grid-cols-2">
          <Field label="Name" required className="sm:col-span-2">
            <input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Tihar push" className={cn(INPUT, tried && !name.trim() && "border-bz-red-mark")} />
          </Field>
          <Field label="Starts" required>
            <DateField value={from} onChange={setFrom} today={SF_TODAY} ariaLabel="Starts" className="h-9 w-full px-3 text-[12.5px]" />
          </Field>
          <Field label="Ends" required>
            <DateField value={to} onChange={setTo} today={SF_TODAY} ariaLabel="Ends" className={cn("h-9 w-full px-3 text-[12.5px]", tried && datesBad && "border-bz-red-mark")} />
          </Field>
          <Field label="Budget" required>
            <MoneyInput value={budget} onChange={setBudget} blank placeholder="500,000" ariaLabel="Budget in NPR" />
          </Field>
          <Field label="Brand">
            <SuggestInput value={brand} onChange={setBrand} suggestions={brands} />
          </Field>
          <Field label="Objective" className="sm:col-span-2">
            <textarea value={objective} onChange={(e) => setObjective(e.target.value)} placeholder="Place our new noodles in 200 shops before Tihar." className={TEXTAREA} />
          </Field>
          {/* Only an edit has a Status field beside this one; on a new campaign it takes the whole row. */}
          <Field label="Customer types" className={campaign ? undefined : "sm:col-span-2"}>
            <MultiPicker key={`types-${menus}`} value={typeIds} onChange={setTypeIds} options={typeOptions} placeholder="Every type" addLabel="New customer type" onAdd={addType} />
          </Field>
          {campaign && (
            <Field label="Status">
              <Picker value={run} onChange={(v) => setRun(v as Run)} placeholder="Runs on its dates" options={RUN_OPTIONS} />
            </Field>
          )}
        </div>

        {!campaign && (
          <>
            <div className="flex items-center gap-2 px-5 pb-2 pt-2">
              <h3 className="m-0 text-[12px] font-semibold text-bz-text">First goal</h3>
              <span className="text-[11px] text-bz-text-soft">optional</span>
            </div>
            <div className="px-5 pb-5">
              <KpiFields value={kpi} onChange={setKpi} />
            </div>
          </>
        )}
      </div>
    </SheetFrame>
  );
}
