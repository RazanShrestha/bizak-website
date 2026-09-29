import * as React from "react";
import { Link } from "react-router";
import { ChevronRight, Plus } from "lucide-react";
import { cn } from "../ui/utils";
import { Field, GHOST, INPUT, NUM, NumberField, Segmented, Select, Switch, TEXTAREA, ToastHost, useToast } from "../sales/bzw";
import { useStore } from "../sales/store";
import type { CustomerType, Level, Portal } from "./data";
import { customersStore, playbooksStore, typesStore } from "./store";
import { sfPath } from "./shell";
import { List, PageIntro, Row, SidePanel, idColor } from "./ui";
import { RecordActivity, RecordNoteFoot, logChange } from "./network-log";
import { LEVEL_HINT, LEVEL_LABEL, PORTAL_LABEL, getsSentence } from "./network-model";
import { FormBlock, SaveBar, SetupFrame, linkPlaybook, useSetupSelection } from "./setup-frame";

// ════════════════════════════════════════════════════════════════════════════
// SETUP · CUSTOMER TYPES — the master that decides what each customer gets
//
// Price list, credit policy, portal, own customers (DMS), playbook and visit
// frequency all hang off the type (blueprint §4.1). The editor says it back
// as one sentence — "What a distributor gets" — so a manager can check the
// policy without reading nine fields.
// ════════════════════════════════════════════════════════════════════════════

const blank = (color: number): CustomerType => ({
  id: "",
  name: "",
  plural: "",
  level: "secondary",
  priceOff: 0,
  creditDays: 15,
  creditStop: "hard",
  portal: "none",
  ownCustomers: false,
  playbookId: null,
  visitsPer4w: 4,
  color,
  blurb: "",
});

export function TypesTab() {
  const types = useStore(typesStore);
  const customers = useStore(customersStore);
  const playbooks = useStore(playbooksStore);
  const [sel, setSel] = useSetupSelection();
  const countOf = (id: string) => customers.filter((c) => c.typeId === id).length;
  const open = sel === "new" || types.some((t) => t.id === sel);

  return (
    <SetupFrame tab="types" panel={open && sel ? <TypeEditor key={sel} id={sel} onClose={() => setSel(null)} onSaved={setSel} /> : null}>
      <PageIntro
        actions={
          <button type="button" className={GHOST} onClick={() => setSel("new")}>
            <Plus size={13} /> New type
          </button>
        }
      >
        A type decides a customer's price list, credit, portal, playbook, and whether it sells to customers of its own.
      </PageIntro>

      <List>
        {types.map((t) => {
          const pb = playbooks.find((p) => p.id === t.playbookId);
          const n = countOf(t.id);
          return (
            <Row
              key={t.id}
              active={t.id === sel}
              onClick={() => setSel(t.id)}
              lead={<span className="block size-2.5 rounded-[3px]" style={{ background: idColor(t.color) }} />}
              title={t.name}
              sub={`${LEVEL_LABEL[t.level]} · ${t.priceOff ? `${t.priceOff}% off` : "list price"} · ${t.creditDays} days, ${t.creditStop === "hard" ? "block" : "warn"} · ${PORTAL_LABEL[t.portal]}${t.ownCustomers ? " · own customers" : ""}`}
              meta={[
                <span key="p" className="block w-[150px] truncate">
                  {pb?.name ?? <span className="text-bz-text-soft">No playbook</span>}
                </span>,
              ]}
              trail={
                <span className="block w-[96px] text-[11.5px] font-normal text-bz-text-muted">
                  {n} {n === 1 ? "customer" : "customers"}
                </span>
              }
            />
          );
        })}
      </List>
      <p className="m-0 mt-4 text-[11px] text-bz-text-soft">Changing a type changes every customer of that type from their next order. Orders already placed keep their prices.</p>
    </SetupFrame>
  );
}

function TypeEditor({ id, onClose, onSaved }: { id: string; onClose: () => void; onSaved: (id: string) => void }) {
  const types = useStore(typesStore);
  const playbooks = useStore(playbooksStore);
  const customers = useStore(customersStore);
  const { toast, show, dismiss } = useToast();
  const isNew = id === "new";
  const original = React.useMemo(() => (isNew ? blank(((types.length % 8) + 1) as number) : types.find((t) => t.id === id)!), [isNew, id, types]);
  const [d, setD] = React.useState<CustomerType>(original);
  const [more, setMore] = React.useState(false);
  const set = <K extends keyof CustomerType>(k: K, v: CustomerType[K]) => setD((x) => ({ ...x, [k]: v }));
  const dirty = isNew || JSON.stringify(d) !== JSON.stringify(original);
  const count = customers.filter((c) => c.typeId === id).length;
  const name = d.name.trim();
  const error = !name ? "Give the type a name." : types.some((t) => t.id !== id && t.name.toLowerCase() === name.toLowerCase()) ? `There is already a type called ${name}.` : null;
  const preview: CustomerType = { ...d, name: name || "customer" };

  const save = () => {
    if (error) return;
    const final: CustomerType = { ...d, name, plural: d.plural.trim() || `${name}s` };
    if (isNew) {
      let nid = `T-${name.toUpperCase().replace(/[^A-Z0-9]+/g, "").slice(0, 6) || "NEW"}`;
      while (types.some((t) => t.id === nid)) nid += "X";
      final.id = nid;
      typesStore.set((ts) => [...ts, { ...final, playbookId: null }]);
      if (final.playbookId) linkPlaybook([nid], final.playbookId);
      logChange(`type:${nid}`, "created the type");
      onSaved(nid);
      return;
    }
    const diffs = describe(original, final, playbooks);
    typesStore.set((ts) => ts.map((t) => (t.id === id ? { ...final, playbookId: original.playbookId } : t)));
    if (final.playbookId !== original.playbookId) linkPlaybook([id], final.playbookId);
    diffs.forEach((w) => logChange(`type:${id}`, w));
    setD(final);
    show("success", count ? `${final.name} saved. ${count} customers get the new terms from their next order.` : `${final.name} saved.`);
  };

  return (
    <SidePanel
      open
      width={600}
      onClose={onClose}
      eyebrow={isNew ? "New customer type" : "Customer type"}
      title={isNew ? name || "New type" : original.name}
      meta={
        !isNew && (
          <>
            <span className={NUM}>
              {count} {count === 1 ? "customer" : "customers"}
            </span>
            {count > 0 && (
              <Link to={`${sfPath("customers")}?type=${id}`} className="hover:text-bz-text hover:underline">
                See them
              </Link>
            )}
          </>
        )
      }
      foot={
        dirty ? (
          <SaveBar
            error={error}
            note={isNew ? "A new type has no customers yet." : count ? `Applies to ${count} customers from their next order.` : undefined}
            onDiscard={() => (isNew ? onClose() : setD(original))}
            onSave={save}
            saveLabel={isNew ? "Create type" : "Save"}
          />
        ) : (
          <RecordNoteFoot subject={`type:${id}`} />
        )
      }
    >
      <div className="mb-8 rounded-bz-md bg-bz-paper-warm/70 px-4 py-3">
        <p className="m-0 text-[10px] font-semibold uppercase tracking-[0.14em] text-bz-text-soft">What a {preview.name.toLowerCase()} gets</p>
        <p className="m-0 mt-1.5 text-[12.5px] leading-relaxed text-bz-text">{getsSentence(preview, playbooks)}</p>
      </div>

      <div className="flex flex-col gap-6">
        <FormBlock title="Name">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Name" required>
              <input autoFocus={isNew} value={d.name} onChange={(e) => set("name", e.target.value)} className={INPUT} placeholder="e.g. Sub-dealer" />
            </Field>
            <Field label="Plural" hint="Used in lists and filters.">
              <input value={d.plural} onChange={(e) => set("plural", e.target.value)} className={INPUT} placeholder={name ? `${name}s` : "e.g. Sub-dealers"} />
            </Field>
          </div>
        </FormBlock>

        <FormBlock title="Level" hint={LEVEL_HINT[d.level]}>
          <Segmented<Level>
            value={d.level}
            onChange={(v) => set("level", v)}
            options={[
              { value: "primary", label: "Primary" },
              { value: "secondary", label: "Secondary" },
              { value: "direct", label: "Direct" },
            ]}
          />
        </FormBlock>

        <FormBlock title="Price and credit" hint="The price list is a % off the list price. Over the credit limit, an order is blocked or sent to review.">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Field label="Price list, % off">
              <NumberField value={d.priceOff} onChange={(v) => set("priceOff", v)} max={90} ariaLabel="Percent off the list price" className="w-full" />
            </Field>
            <Field label="Credit days">
              <NumberField value={d.creditDays} onChange={(v) => set("creditDays", v)} max={180} ariaLabel="Credit days" className="w-full" />
            </Field>
            <Field label="Over the limit" className="col-span-2 sm:col-span-1">
              <Segmented<"hard" | "soft">
                size="sm"
                value={d.creditStop}
                onChange={(v) => set("creditStop", v)}
                options={[
                  { value: "hard", label: "Block", title: "The order is refused" },
                  { value: "soft", label: "Warn", title: "The order goes to review" },
                ]}
              />
            </Field>
          </div>
        </FormBlock>

        <FormBlock title="Portal and own customers">
          <Segmented<Portal>
            value={d.portal}
            onChange={(v) => set("portal", v)}
            options={[
              { value: "dealer", label: "Dealer portal" },
              { value: "retailer", label: "Retailer app" },
              { value: "none", label: "None" },
            ]}
          />
          <label className="mt-4 flex items-start gap-3">
            <Switch on={d.ownCustomers} onChange={(v) => set("ownCustomers", v)} label="Has its own customers" />
            <span className="min-w-0">
              <span className="block text-[12.5px] text-bz-text">Has its own customers</span>
              <span className="block text-[11px] text-bz-text-soft">It sells on to retailers and reports those sales and its stock (secondary sales).</span>
            </span>
          </label>
        </FormBlock>

        <FormBlock title="Visits" hint="What the rep does there, and how often.">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Playbook">
              <Select
                trigger="ghost"
                width={260}
                className="w-full justify-between"
                value={d.playbookId ?? "none"}
                onChange={(v) => set("playbookId", v === "none" ? null : v)}
                label={playbooks.find((p) => p.id === d.playbookId)?.name ?? "No playbook"}
                options={[{ value: "none", label: "No playbook", hint: "Reps log a plain visit" }, ...playbooks.map((p) => ({ value: p.id, label: p.name, hint: `${p.items.length} steps` }))]}
              />
            </Field>
            <Field label="Visits per 4 weeks" hint="0 = reps don't visit.">
              <NumberField value={d.visitsPer4w} onChange={(v) => set("visitsPer4w", v)} max={20} ariaLabel="Visits per 4 weeks" className="w-full" />
            </Field>
          </div>
        </FormBlock>

        <FormBlock title="Colour" hint="A small mark next to the type in lists. Never a status.">
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => set("color", n)}
                aria-label={`Colour ${n}`}
                aria-pressed={d.color === n}
                className={cn("size-7 rounded-bz-md border-2 transition-transform", d.color === n ? "scale-110 border-bz-text" : "border-transparent hover:scale-105")}
                style={{ background: idColor(n) }}
              />
            ))}
          </div>
        </FormBlock>

        <section className="border-t border-bz-line-soft pt-4">
          <button type="button" onClick={() => setMore((v) => !v)} aria-expanded={more} className="flex items-center gap-1.5 text-[12px] font-medium text-bz-text-muted hover:text-bz-text">
            <ChevronRight size={13} className={cn("transition-transform duration-150", more && "rotate-90")} /> More
          </button>
          {more && (
            <Field label="Description" hint="Shown when someone picks a type for a customer." className="mt-3">
              <textarea value={d.blurb} onChange={(e) => set("blurb", e.target.value)} className={TEXTAREA} placeholder="Who counts as this type" />
            </Field>
          )}
        </section>
      </div>

      {!isNew && <RecordActivity subject={`type:${id}`} />}
      <ToastHost toast={toast} onDismiss={dismiss} />
    </SidePanel>
  );
}

function describe(a: CustomerType, b: CustomerType, playbooks: { id: string; name: string }[]) {
  const out: string[] = [];
  const pb = (id: string | null) => playbooks.find((p) => p.id === id)?.name ?? "none";
  if (a.name !== b.name) out.push(`renamed the type from ${a.name} to ${b.name}`);
  if (a.plural !== b.plural) out.push(`changed the plural to ${b.plural}`);
  if (a.level !== b.level) out.push(`changed the level from ${LEVEL_LABEL[a.level].toLowerCase()} to ${LEVEL_LABEL[b.level].toLowerCase()}`);
  if (a.priceOff !== b.priceOff) out.push(`changed the price list from ${a.priceOff}% to ${b.priceOff}% off`);
  if (a.creditDays !== b.creditDays) out.push(`changed the credit from ${a.creditDays} to ${b.creditDays} days`);
  if (a.creditStop !== b.creditStop) out.push(`changed the credit stop from ${a.creditStop === "hard" ? "block" : "warn"} to ${b.creditStop === "hard" ? "block" : "warn"}`);
  if (a.portal !== b.portal) out.push(`changed the portal from ${PORTAL_LABEL[a.portal]} to ${PORTAL_LABEL[b.portal]}`);
  if (a.ownCustomers !== b.ownCustomers) out.push(b.ownCustomers ? "switched on own customers" : "switched off own customers");
  if (a.playbookId !== b.playbookId) out.push(`changed the playbook from ${pb(a.playbookId)} to ${pb(b.playbookId)}`);
  if (a.visitsPer4w !== b.visitsPer4w) out.push(`changed visits from ${a.visitsPer4w} to ${b.visitsPer4w} per 4 weeks`);
  if (a.color !== b.color) out.push("changed the colour");
  if (a.blurb !== b.blurb) out.push("changed the description");
  return out;
}
