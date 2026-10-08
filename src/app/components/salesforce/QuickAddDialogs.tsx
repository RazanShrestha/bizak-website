import * as React from "react";
import { useNavigate } from "react-router";
import { BTN, Dialog, Field, GHOST, INPUT, Segmented, Switch, ToastHost, useToast } from "../sales/bzw";
import { useStore } from "../sales/store";
import { SF_TODAY } from "./data";
import type { Customer, CustomerType, Level, LedgerEntry, Portal, Product, Rep } from "./data";
import { npr } from "./engine";
import { nextId } from "./persist";
import { closeQuickAdd, quickAddStore, QUICK_ADD_LABEL } from "./quickadd";
import type { QuickAddKind } from "./quickadd";
import { logEvent } from "./records";
import { coordsText } from "./geo";
import type { GeoFix } from "./geo";
import { UseMyLocation } from "./geo-kit";
import { customersStore, ledgerStore, playbooksStore, productsStore, repsStore, typesStore } from "./store";
import { IntInput, More, MoneyInput, Pair, Picker, SuggestInput } from "./network-form";
import { LEVEL_LABEL, PORTAL_LABEL, getsSentence, initialsOf, nextColor, toneForBrand } from "./network-model";

// ════════════════════════════════════════════════════════════════════════════
// QUICK ADD — a master in a small dialog, from anywhere
//
// SfShell renders <QuickAddHost/> once; `openQuickAdd(kind)` (quickadd.ts)
// asks for a dialog. A picker inside a dialog can ask for ANOTHER master
// ("+ Add a customer type" in the customer dialog): that one is pushed on a
// local stack and shown instead, and when it is saved (or cancelled) the first
// dialog comes back with what was typed and the new record picked. Only the
// top dialog is open — two open bzw Dialogs would both answer Esc.
// ════════════════════════════════════════════════════════════════════════════

type Preset = Record<string, string>;
type Push = (kind: QuickAddKind, onCreated: (id: string) => void, preset?: Preset) => void;
type Frame = { key: number; kind: QuickAddKind; preset?: Preset; onCreated?: (id: string) => void };
type FormProps = { open: boolean; preset?: Preset; onCancel: () => void; onDone: (id: string, name: string) => void; push: Push };

let seq = 0;
const frameKeys = new WeakMap<object, number>();
const keyOf = (o: object) => {
  if (!frameKeys.has(o)) frameKeys.set(o, ++seq);
  return frameKeys.get(o)!;
};

const addDays = (iso: string, days: number) => new Date(Date.parse(iso) + days * 86_400_000).toISOString().slice(0, 10);

// Not `sfPath` from shell.tsx: the shell renders this host, so importing it back would be a cycle.
const sfPath = (p: string) => `/design/salesforce/${p}`;

/** Where a new record of each kind can be seen. */
const RECORD_PATH: Record<QuickAddKind, (id: string) => string> = {
  customer: (id) => sfPath(`customers/${id}`),
  product: (id) => sfPath(`products/${id}`),
  rep: (id) => sfPath(`team/${id}`),
  type: (id) => sfPath(`setup/types/${id}`),
};

export function QuickAddHost() {
  const base = useStore(quickAddStore);
  const navigate = useNavigate();
  const { toast, show, dismiss } = useToast();
  const [nested, setNested] = React.useState<Frame[]>([]);
  React.useEffect(() => setNested([]), [base]);

  const frames: Frame[] = base ? [{ key: keyOf(base), ...base }, ...nested] : [];
  const push: Push = (kind, onCreated, preset) => setNested((n) => [...n, { key: ++seq, kind, onCreated, preset }]);
  const close = (i: number) => (i === 0 ? closeQuickAdd() : setNested((n) => n.slice(0, i - 1)));
  const done = (i: number, id: string, name: string) => {
    const f = frames[i];
    f.onCreated?.(id);
    close(i);
    if (i === 0 && !f.onCreated) show("success", `${QUICK_ADD_LABEL[f.kind]} ${name} added.`, { label: "Open", run: () => navigate(RECORD_PATH[f.kind](id)) });
  };

  return (
    <>
      {frames.map((f, i) => {
        const props: FormProps = { open: i === frames.length - 1, preset: f.preset, onCancel: () => close(i), onDone: (id, name) => done(i, id, name), push };
        return f.kind === "customer" ? (
          <CustomerForm key={f.key} {...props} />
        ) : f.kind === "product" ? (
          <ProductForm key={f.key} {...props} />
        ) : f.kind === "rep" ? (
          <RepForm key={f.key} {...props} />
        ) : (
          <TypeForm key={f.key} {...props} />
        );
      })}
      <ToastHost toast={toast} onDismiss={dismiss} />
    </>
  );
}

/** The dialog frame every quick-add form shares: Enter submits, the first problem shows after a try. */
function QuickDialog({ open, title, eyebrow, saveLabel, error, onCancel, onSave, children }: { open: boolean; title: string; eyebrow?: string; saveLabel: string; error: string | null; onCancel: () => void; onSave: () => void; children: React.ReactNode }) {
  const formId = React.useId();
  const [tried, setTried] = React.useState(false);
  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    setTried(true);
    if (!error) onSave();
  };
  return (
    <Dialog
      open={open}
      title={title}
      eyebrow={eyebrow}
      onClose={onCancel}
      foot={
        <>
          {tried && error && <span className="mr-auto text-[11.5px] text-bz-red">{error}</span>}
          <button type="button" className={GHOST} onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" form={formId} className={BTN}>
            {saveLabel}
          </button>
        </>
      }
    >
      <form id={formId} onSubmit={submit} className="flex flex-col gap-4">
        {children}
        <button type="submit" hidden aria-hidden tabIndex={-1} />
      </form>
    </Dialog>
  );
}

// ── Customer type ───────────────────────────────────────────────────────────

function TypeForm({ open, preset, onCancel, onDone }: FormProps) {
  const types = useStore(typesStore);
  const playbooks = useStore(playbooksStore);
  const [d, setD] = React.useState<Omit<CustomerType, "id">>(() => ({
    name: preset?.name ?? "",
    plural: "",
    level: (preset?.level as Level) ?? "primary",
    priceOff: 0,
    creditDays: 30,
    creditStop: "hard",
    graceDays: 7,
    portal: "none",
    ownCustomers: false,
    playbookId: null,
    visitsPer4w: 4,
    color: nextColor(typesStore.get()),
    blurb: "",
  }));
  const set = <K extends keyof CustomerType>(k: K, v: CustomerType[K]) => setD((x) => ({ ...x, [k]: v }));
  const name = d.name.trim();
  const error = !name ? "Give the type a name." : types.some((t) => t.name.trim().toLowerCase() === name.toLowerCase()) ? `There is already a type called ${name}.` : null;

  const save = () => {
    const id = nextId("TY-", types.map((t) => t.id));
    typesStore.set((ts) => [...ts, { ...d, id, name, plural: d.plural.trim() || `${name}s` }]);
    logEvent(id, "created it");
    onDone(id, name);
  };

  return (
    <QuickDialog open={open} title="New customer type" saveLabel="Add type" error={error} onCancel={onCancel} onSave={save}>
      <p className="m-0 text-[11.5px] text-bz-text-soft">A type is the rulebook for a group of customers: their price, credit and portal.</p>
      <Field label="Name" required>
        <input autoFocus value={d.name} onChange={(e) => set("name", e.target.value)} className={INPUT} placeholder="e.g. Distributor" />
      </Field>
      <Field label="Level">
        <Segmented<Level>
          size="sm"
          value={d.level}
          onChange={(v) => set("level", v)}
          options={(["primary", "secondary", "direct"] as Level[]).map((l) => ({ value: l, label: LEVEL_LABEL[l] }))}
        />
      </Field>
      <Pair>
        <Field label="Price">
          <IntInput value={d.priceOff} onChange={(v) => set("priceOff", v)} max={90} suffix="% off list" ariaLabel="Percent off the list price" />
        </Field>
        <Field label="Credit">
          <IntInput value={d.creditDays} onChange={(v) => set("creditDays", v)} max={365} suffix="days to pay" ariaLabel="Credit days" />
        </Field>
      </Pair>
      <Field label="Over the limit or overdue">
        <Segmented<"hard" | "soft">
          size="sm"
          value={d.creditStop}
          onChange={(v) => set("creditStop", v)}
          options={[
            { value: "hard", label: "Block" },
            { value: "soft", label: "Warn" },
          ]}
        />
      </Field>
      <Field label="Portal">
        <Segmented<Portal>
          size="sm"
          value={d.portal}
          onChange={(v) => set("portal", v)}
          options={(["dealer", "retailer", "none"] as Portal[]).map((p) => ({ value: p, label: p === "none" ? "None" : PORTAL_LABEL[p] }))}
        />
      </Field>
      <label className="flex items-start gap-3">
        <Switch on={d.ownCustomers} onChange={(v) => set("ownCustomers", v)} label="Sells to its own customers" />
        <span className="min-w-0">
          <span className="block text-[12px] text-bz-text">Sells to its own customers</span>
          <span className="block text-[11px] text-bz-text-soft">Like a distributor: other customers can be served by it.</span>
        </span>
      </label>
      <More>
        <Field label="Plural">
          <input value={d.plural} onChange={(e) => set("plural", e.target.value)} className={INPUT} placeholder={name ? `${name}s` : "e.g. Distributors"} />
        </Field>
        <Pair>
          <Field label="Overdue grace">
            <IntInput value={d.graceDays} onChange={(v) => set("graceDays", v)} max={90} suffix="days" ariaLabel="Grace days" />
          </Field>
          <Field label="Rep visits per 4 weeks">
            <IntInput value={d.visitsPer4w} onChange={(v) => set("visitsPer4w", v)} max={28} ariaLabel="Visits per 4 weeks" />
          </Field>
        </Pair>
      </More>
      {name && <p className="m-0 rounded-bz-md bg-bz-paper-warm/70 px-3 py-2 text-[11.5px] leading-relaxed text-bz-text-muted">{getsSentence({ ...d, id: "", name }, playbooks)}</p>}
    </QuickDialog>
  );
}

// ── Product ─────────────────────────────────────────────────────────────────

const UNITS = ["case", "ctn", "pcs", "kg", "box"];

function ProductForm({ open, preset, onCancel, onDone }: FormProps) {
  const products = useStore(productsStore);
  const [d, setD] = React.useState({ name: preset?.name ?? "", code: "", brand: preset?.brand ?? "", category: "", unit: "case", pack: "", listPrice: 0, cost: null as number | null });
  const set = <K extends keyof typeof d>(k: K, v: (typeof d)[K]) => setD((x) => ({ ...x, [k]: v }));
  const name = d.name.trim();
  const code = d.code.trim();
  const error = !name
    ? "Give the product a name."
    : d.listPrice <= 0
      ? "Set a list price."
      : code && products.some((p) => p.code.toLowerCase() === code.toLowerCase())
        ? `Another product already has the code ${code}.`
        : null;

  const save = () => {
    const id = nextId("P-", products.map((p) => p.id));
    const p: Product = { id, code: code || id, name, brand: d.brand.trim(), category: d.category.trim(), unit: d.unit.trim() || "pcs", pack: d.pack.trim(), listPrice: d.listPrice, cost: d.cost ?? 0, tone: toneForBrand(d.brand, products) };
    productsStore.set((ps) => [...ps, p]);
    logEvent(id, "created it");
    onDone(id, name);
  };

  return (
    <QuickDialog open={open} title="New product" saveLabel="Add product" error={error} onCancel={onCancel} onSave={save}>
      <Field label="Name" required>
        <input autoFocus value={d.name} onChange={(e) => set("name", e.target.value)} className={INPUT} placeholder="e.g. Mango juice 1L" />
      </Field>
      <Field label="Brand">
        <SuggestInput value={d.brand} onChange={(v) => set("brand", v)} suggestions={products.map((p) => p.brand)} placeholder="e.g. Himal Fresh" />
      </Field>
      <Pair>
        <Field label={`List price per ${d.unit || "unit"}, before tax`} required>
          <MoneyInput value={d.listPrice || null} onChange={(v) => set("listPrice", v ?? 0)} blank ariaLabel="List price" />
        </Field>
        <Field label="Sold by">
          <SuggestInput value={d.unit} onChange={(v) => set("unit", v)} suggestions={[...UNITS, ...products.map((p) => p.unit)]} placeholder="case" />
        </Field>
      </Pair>
      <More>
        <Pair>
          <Field label="Code">
            <input value={d.code} onChange={(e) => set("code", e.target.value)} className={INPUT} placeholder="Automatic" />
          </Field>
          <Field label="Pack">
            <input value={d.pack} onChange={(e) => set("pack", e.target.value)} className={INPUT} placeholder="e.g. 12 × 1L" />
          </Field>
        </Pair>
        <Field label="Category">
          <SuggestInput value={d.category} onChange={(v) => set("category", v)} suggestions={products.map((p) => p.category)} placeholder="e.g. Beverages" />
        </Field>
        <Field label="Cost">
          <MoneyInput value={d.cost} onChange={(v) => set("cost", v)} blank ariaLabel="Cost" />
        </Field>
      </More>
    </QuickDialog>
  );
}

// ── Rep ─────────────────────────────────────────────────────────────────────

const ROLES: Rep["role"][] = ["Sales rep", "Merchandiser", "Area manager"];

function RepForm({ open, preset, onCancel, onDone }: FormProps) {
  const reps = useStore(repsStore);
  const [name, setName] = React.useState(preset?.name ?? "");
  const [role, setRole] = React.useState<Rep["role"]>("Sales rep");
  const [phone, setPhone] = React.useState("");
  const n = name.trim();
  const error = !n ? "Give the rep a name." : reps.some((r) => r.name.trim().toLowerCase() === n.toLowerCase()) ? `There is already a rep called ${n}.` : null;

  const save = () => {
    const id = nextId("EMP-", reps.map((r) => r.id));
    repsStore.set((rs) => [...rs, { id, name: n, initials: initialsOf(n), role, phone: phone.trim() }]);
    logEvent(id, "created it");
    onDone(id, n);
  };

  return (
    <QuickDialog open={open} title="New rep" saveLabel="Add rep" error={error} onCancel={onCancel} onSave={save}>
      <Field label="Name" required>
        <input autoFocus value={name} onChange={(e) => setName(e.target.value)} className={INPUT} placeholder="Full name" />
      </Field>
      <Field label="Role">
        <Segmented<Rep["role"]> size="sm" value={role} onChange={setRole} options={ROLES.map((r) => ({ value: r, label: r }))} />
      </Field>
      <More>
        <Field label="Mobile">
          <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" className={INPUT} placeholder="98XXXXXXXX" />
        </Field>
      </More>
    </QuickDialog>
  );
}

// ── Customer ────────────────────────────────────────────────────────────────

export type CustomerDraft = {
  name: string;
  typeId: string;
  repId: string;
  parentId: string;
  tier: Customer["tier"];
  city: string;
  phone: string;
  creditLimit: number | null;
};

/**
 * The customer's own fields, for the quick-add dialog and the panel's Edit. `onAdd` creates a missing master
 * (a stacked quick-add here; openQuickAdd from the panel). `selfId` keeps a customer from serving itself.
 */
export function CustomerFields({ d, set, onAdd, selfId, blockedParents }: { d: CustomerDraft; set: <K extends keyof CustomerDraft>(k: K, v: CustomerDraft[K]) => void; onAdd?: Push; selfId?: string; blockedParents?: Set<string> }) {
  const types = useStore(typesStore);
  const reps = useStore(repsStore);
  const customers = useStore(customersStore);
  const type = types.find((t) => t.id === d.typeId);
  const servers = customers.filter((c) => c.id !== selfId && !blockedParents?.has(c.id) && types.find((t) => t.id === c.typeId)?.ownCustomers);

  return (
    <>
      <Field label="Type" required hint={type ? `${LEVEL_LABEL[type.level]} · ${type.priceOff ? `${type.priceOff}% off` : "list price"} · ${type.creditDays} days' credit · ${PORTAL_LABEL[type.portal]}` : undefined}>
        <Picker
          value={d.typeId || null}
          onChange={(v) => set("typeId", v)}
          placeholder={types.length ? "Pick a type" : "No customer types yet"}
          options={types.map((t) => ({ value: t.id, label: t.name, hint: LEVEL_LABEL[t.level] }))}
          addLabel="Add a customer type"
          onAdd={onAdd && (() => onAdd("type", (id) => set("typeId", id)))}
        />
      </Field>
      <Field label="Rep">
        <Picker
          value={d.repId || null}
          onChange={(v) => set("repId", v)}
          placeholder={reps.length ? "No rep" : "No reps yet"}
          options={[...(d.repId ? [{ value: "", label: "No rep" }] : []), ...reps.map((r) => ({ value: r.id, label: r.name, hint: r.role }))]}
          addLabel="Add a rep"
          onAdd={onAdd && (() => onAdd("rep", (id) => set("repId", id)))}
        />
      </Field>
      {(servers.length > 0 || d.parentId) && (
        <Field label="Served by">
          <Picker
            value={d.parentId}
            onChange={(v) => set("parentId", v)}
            placeholder="You — billed direct"
            options={[{ value: "", label: "You — billed direct" }, ...servers.map((c) => ({ value: c.id, label: c.name, hint: types.find((t) => t.id === c.typeId)?.name }))]}
          />
        </Field>
      )}
      <Field label="Credit limit" hint="0 = cash only">
        <MoneyInput value={d.creditLimit} onChange={(v) => set("creditLimit", v)} blank placeholder="No check" ariaLabel="Credit limit" />
      </Field>
    </>
  );
}

/** Tier, city and phone — the customer fields a first-time user can leave alone. */
export function CustomerMoreFields({ d, set }: { d: CustomerDraft; set: <K extends keyof CustomerDraft>(k: K, v: CustomerDraft[K]) => void }) {
  return (
    <>
      <Field label="Tier">
        <Segmented<Customer["tier"]> size="sm" value={d.tier} onChange={(v) => set("tier", v)} options={(["A", "B", "C"] as const).map((t) => ({ value: t, label: t }))} />
      </Field>
      <Pair>
        <Field label="City">
          <input value={d.city} onChange={(e) => set("city", e.target.value)} className={INPUT} placeholder="e.g. Butwal" />
        </Field>
        <Field label="Phone">
          <input value={d.phone} onChange={(e) => set("phone", e.target.value)} inputMode="tel" className={INPUT} placeholder="e.g. 071-540221" />
        </Field>
      </Pair>
    </>
  );
}

function CustomerForm({ open, preset, onCancel, onDone, push }: FormProps) {
  const customers = useStore(customersStore);
  const [d, setD] = React.useState<CustomerDraft>(() => ({
    name: preset?.name ?? "",
    typeId: preset?.typeId ?? "",
    repId: preset?.repId ?? "",
    parentId: preset?.parentId ?? "",
    tier: "B",
    city: "",
    phone: "",
    creditLimit: null,
  }));
  const [opening, setOpening] = React.useState<number | null>(null);
  const [loc, setLoc] = React.useState<GeoFix | null>(null);
  const set = <K extends keyof CustomerDraft>(k: K, v: CustomerDraft[K]) => setD((x) => ({ ...x, [k]: v }));
  const name = d.name.trim();
  const error = !name
    ? "Give the customer a name."
    : !d.typeId
      ? "Pick a customer type."
      : customers.some((c) => c.name.trim().toLowerCase() === name.toLowerCase())
        ? `There is already a customer called ${name}.`
        : null;

  const save = () => {
    const id = nextId("C-", customers.map((c) => c.id), 4);
    const c: Customer = {
      id,
      code: id,
      name,
      typeId: d.typeId,
      parentId: d.parentId || null,
      tier: d.tier,
      repId: d.repId || null,
      city: d.city.trim(),
      phone: d.phone.trim(),
      creditLimit: d.creditLimit,
      location: loc ? { lat: loc.lat, lng: loc.lng } : null,
      since: SF_TODAY,
      portalUsers: [],
      status: "active",
    };
    customersStore.set((cs) => [...cs, c]);
    logEvent(id, "created it");
    if (loc) logEvent(id, `set its location from this device to ${coordsText(loc)} (± ${loc.accuracy} m)`);
    if (opening && opening > 0) {
      const days = typesStore.get().find((t) => t.id === d.typeId)?.creditDays ?? 0;
      const row: LedgerEntry = { id: nextId("L-", ledgerStore.get().map((r) => r.id), 4), customerId: id, date: SF_TODAY, doc: "Opening balance", kind: "Opening", debit: opening, credit: 0, due: addDays(SF_TODAY, days) };
      ledgerStore.set((l) => [...l, row]);
      logEvent(id, `recorded an opening balance of NPR ${npr(opening)}`);
    }
    onDone(id, name);
  };

  return (
    <QuickDialog open={open} title="New customer" saveLabel="Add customer" error={error} onCancel={onCancel} onSave={save}>
      <Field label="Name" required>
        <input autoFocus value={d.name} onChange={(e) => set("name", e.target.value)} className={INPUT} placeholder="e.g. Sagarmatha Distributors" />
      </Field>
      <CustomerFields d={d} set={set} onAdd={push} />
      <More>
        <CustomerMoreFields d={d} set={set} />
        <Field label="Opening balance owed">
          <MoneyInput value={opening} onChange={setOpening} blank placeholder="Nothing owed" ariaLabel="Opening balance" />
        </Field>
        <Field label="Location" hint={loc ? `${coordsText(loc)} · ± ${loc.accuracy} m` : undefined}>
          <div className="flex flex-wrap items-start gap-2">
            <UseMyLocation small onFix={setLoc} label={loc ? "Use my location again" : "Use my current location"} />
            {loc && (
              <button type="button" onClick={() => setLoc(null)} className="h-8 px-2 text-[11.5px] text-bz-text-soft hover:text-bz-text">
                Clear
              </button>
            )}
          </div>
        </Field>
      </More>
    </QuickDialog>
  );
}
