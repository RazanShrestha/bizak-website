import * as React from "react";
import { Link } from "react-router";
import { Ban, Check, Plus, Smartphone, Store, TriangleAlert } from "lucide-react";
import { cn } from "../ui/utils";
import { BTN, Dialog, GHOST, INPUT, MenuItem, NUM, Switch, TEXTAREA, ToastHost, useToast } from "../sales/bzw";
import { useKeys } from "../sales/orders";
import { ConfirmDialog } from "../sales/parts";
import { useStore } from "../sales/store";
import type { CustomerType, Level, Playbook, Portal } from "./data";
import { HEAD_BTN, PillTabs, StatusPill } from "./fx";
import type { PillTone } from "./fx";
import { FxEmpty, FxSearch, FxTable } from "./fx-table";
import type { FxColumn } from "./fx-table";
import { IntInput, Picker } from "./network-form";
import { LEVEL_HINT, LEVEL_LABEL, PORTAL_LABEL, nextColor } from "./network-model";
import { nextId } from "./persist";
import { logEvent } from "./records";
import { SfActivity, SfNoteFoot, SfShell, TypeMark, idColor, sfPath } from "./sf";
import { customersStore, playbooksStore, typesStore } from "./store";
import { ChangedDot, Choice, FField, FIELDS, FormSheet, GROUPS, Group, linkPlaybook, overlayUp, setupPath } from "./setup-frame";
import type { ListPlaceProps, Toast } from "./setup-frame";

// ════════════════════════════════════════════════════════════════════════════
// SETUP · CUSTOMER TYPES — the master that decides what each customer gets
//
// Price list, credit policy (limit stop + overdue grace), portal, own
// customers (DMS), playbook and visit frequency all hang off the type
// (blueprint §4.1). The place is the list kit: a roomy table, and the type as
// a form in the floating sheet. A type in use by customers cannot be deleted.
// ════════════════════════════════════════════════════════════════════════════

type Row = CustomerType & { used: number };
type Tab = "all" | Level | "no-playbook";
type IconType = React.ComponentType<{ size?: number; className?: string }>;

const LEVELS: Level[] = ["primary", "secondary", "direct"];
const PORTAL_PILL: Record<Portal, { tone: PillTone; label: string; icon?: IconType }> = {
  dealer: { tone: "good", label: "Dealer portal", icon: Store },
  retailer: { tone: "warn", label: "Retailer app", icon: Smartphone },
  none: { tone: "idle", label: "None" },
};

const blank = (color: number): CustomerType => ({
  id: "",
  name: "",
  plural: "",
  level: "primary",
  priceOff: 0,
  creditDays: 30,
  creditStop: "hard",
  graceDays: 7,
  portal: "none",
  ownCustomers: false,
  playbookId: null,
  visitsPer4w: 4,
  color,
  blurb: "",
});

const customersWord = (n: number) => `${n} ${n === 1 ? "customer" : "customers"}`;
const priceText = (t: CustomerType) => (t.priceOff ? `${t.priceOff}% off list` : "List price");
/** Why a type in use can't go — what the delete dialog says instead of asking. */
const inUse = (n: number) => `${n === 1 ? "1 customer has" : `${n} customers have`} this type. Give ${n === 1 ? "it" : "them"} another type first.`;

export function TypesPlace({ openId, open }: ListPlaceProps) {
  const { toast, show, dismiss } = useToast();
  const types = useStore(typesStore);
  const customers = useStore(customersStore);
  const playbooks = useStore(playbooksStore);
  const searchRef = React.useRef<HTMLInputElement>(null);
  const [q, setQ] = React.useState("");
  const [tab, setTab] = React.useState<Tab>("all");
  const [deleting, setDeleting] = React.useState<Row | null>(null);

  // By trade level, as the trade runs: who buys from you, who buys from them, who buys for themselves.
  const rows = React.useMemo<Row[]>(() => types.map((t) => ({ ...t, used: customers.filter((c) => c.typeId === t.id).length })).sort((a, b) => LEVELS.indexOf(a.level) - LEVELS.indexOf(b.level)), [types, customers]);
  const needle = q.trim().toLowerCase();
  const visible = rows.filter((t) => (tab === "all" || (tab === "no-playbook" ? !t.playbookId : t.level === tab)) && (!needle || `${t.name} ${t.plural} ${t.blurb}`.toLowerCase().includes(needle)));
  const playbookName = (t: Row) => playbooks.find((p) => p.id === t.playbookId)?.name;
  const filtered = !!needle || tab !== "all";

  const remove = (t: Row) => {
    if (t.playbookId) linkPlaybook([t.id], null);
    typesStore.set((ts) => ts.filter((x) => x.id !== t.id));
    logEvent(t.id, `deleted the type ${t.name}`);
    setDeleting(null);
    if (openId === t.id) open(null);
    show("success", `${t.name} deleted`);
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
      key: "type",
      label: "Type",
      width: "minmax(0,1.5fr)",
      role: "primary",
      render: (t) => (
        <span className="block min-w-0 leading-snug" title={t.blurb || undefined}>
          <TypeMark name={t.name} color={t.color} className="flex min-w-0 gap-2 text-[13px] font-semibold text-bz-text [&>span]:size-2.5" />
          {/* What a narrower window's missing columns said moves down here. */}
          <span className="block truncate pl-[18px] text-[11.5px] text-bz-text-soft max-sm:whitespace-normal">
            {LEVEL_LABEL[t.level]}
            <span className="md:hidden"> · {priceText(t)}</span>
            <span className={cn("lg:hidden", NUM)}> · {t.creditDays} days</span>
            {playbookName(t) && <span className="xl:hidden"> · {playbookName(t)}</span>}
          </span>
        </span>
      ),
    },
    { key: "price", label: "Price", width: "minmax(0,0.8fr)", hideBelow: 768, render: (t) => <span className={cn(t.priceOff ? "text-bz-text" : "text-bz-text-muted", NUM)}>{priceText(t)}</span> },
    {
      key: "credit",
      label: "Credit",
      width: "minmax(0,1.1fr)",
      hideBelow: 1024,
      render: (t) => (
        <span className="flex min-w-0 items-center gap-2.5" title={`${t.creditDays} days · ${t.graceDays} days' grace · over the limit or overdue: ${t.creditStop === "hard" ? "block" : "warn"}`}>
          <span className={cn("whitespace-nowrap text-bz-text", NUM)}>{t.creditDays} days</span>
          <StatusPill tone={t.creditStop === "hard" ? "idle" : "warn"} icon={t.creditStop === "hard" ? Ban : TriangleAlert}>
            {t.creditStop === "hard" ? "Block" : "Warn"}
          </StatusPill>
        </span>
      ),
    },
    {
      key: "portal",
      label: "Portal",
      width: "136px",
      role: "state",
      render: (t) => (
        <span className="flex">
          <StatusPill tone={PORTAL_PILL[t.portal].tone} icon={PORTAL_PILL[t.portal].icon} title={t.ownCustomers ? "Sells to its own customers" : undefined}>
            {PORTAL_PILL[t.portal].label}
          </StatusPill>
        </span>
      ),
    },
    { key: "playbook", label: "Playbook", width: "minmax(0,1fr)", hideBelow: 1280, render: (t) => (playbookName(t) ? <span className="text-bz-text-muted">{playbookName(t)}</span> : <span className="text-bz-text-soft">—</span>) },
    {
      key: "used",
      label: "Used by",
      width: "112px",
      align: "right",
      role: "figure",
      render: (t) =>
        t.used > 0 ? (
          <Link to={`${sfPath("customers")}?type=${t.id}`} onClick={(e) => e.stopPropagation()} className={cn("whitespace-nowrap text-bz-text underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-bz-fire", NUM)}>
            {customersWord(t.used)}
          </Link>
        ) : (
          <span className="whitespace-nowrap text-bz-text-soft">Not used</span>
        ),
    },
  ];

  const newButton = (
    <button type="button" className={BTN} onClick={() => open("new")} title="New customer type (N)">
      <Plus size={14} /> New customer type
    </button>
  );
  const none = rows.filter((t) => !t.playbookId).length;

  return (
    <SfShell current="setup:types" actions={newButton}>
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
                    ...LEVELS.map((l) => ({ value: l as Tab, label: LEVEL_LABEL[l] })),
                    // A type with no playbook is not broken — reps log a plain visit there — so its count is quiet.
                    ...(none > 0 || tab === "no-playbook" ? [{ value: "no-playbook" as Tab, label: "No playbook", count: none }] : []),
                  ]}
                />
                <FxSearch ref={searchRef} value={q} onChange={setQ} placeholder="Type name" hint="/" className="w-full sm:ml-auto sm:w-[260px]" />
              </div>
            )}

            <FxTable<Row>
              label="Customer types"
              rows={visible}
              idOf={(t) => t.id}
              columns={columns}
              noun={["customer type", "customer types"]}
              rowLabel={(t) => t.name}
              onOpen={(t) => open(t.id)}
              current={openId}
              keys={!openId}
              empty={
                rows.length === 0 ? (
                  <FxEmpty title="No customer types yet.">{newButton}</FxEmpty>
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

        {openId && <TypeSheet key={openId} id={openId} show={show} onClose={() => open(null)} onOpen={open} onDelete={(id) => setDeleting(rows.find((r) => r.id === id) ?? null)} />}

        <ConfirmDialog
          open={!!deleting && deleting.used === 0}
          eyebrow="Customer type"
          title={`Delete ${deleting?.name ?? ""}?`}
          body="It leaves the list of types. Its history is kept."
          confirm="Delete type"
          danger
          onClose={() => setDeleting(null)}
          onConfirm={() => deleting && remove(deleting)}
        />
        {/* A type in use stays: the dialog states why and offers no commit. */}
        <Dialog
          open={!!deleting && deleting.used > 0}
          size="sm"
          eyebrow="Customer type"
          title={`${deleting?.name ?? ""} can't be deleted`}
          onClose={() => setDeleting(null)}
          foot={
            <button type="button" className={GHOST} onClick={() => setDeleting(null)}>
              Close
            </button>
          }
        >
          {deleting ? inUse(deleting.used) : ""}
        </Dialog>

        <ToastHost toast={toast} onDismiss={dismiss} />
      </div>
    </SfShell>
  );
}

// ── The type, as a form ─────────────────────────────────────────────────────

type SheetProps = { id: string; show: Toast; onClose: () => void; onOpen: (id: string) => void; onDelete: (id: string) => void };

function TypeSheet(props: SheetProps) {
  const types = useStore(typesStore);
  if (props.id !== "new" && !types.some((t) => t.id === props.id))
    return (
      <FormSheet label="Customer type" title="Customer type" onClose={props.onClose}>
        <FxEmpty title="This customer type isn't available.">
          <button type="button" className={HEAD_BTN} onClick={props.onClose}>
            Close
          </button>
        </FxEmpty>
      </FormSheet>
    );
  return <TypeForm {...props} />;
}

function TypeForm({ id, show, onClose, onOpen, onDelete }: SheetProps) {
  const types = useStore(typesStore);
  const playbooks = useStore(playbooksStore);
  const customers = useStore(customersStore);
  const isNew = id === "new";
  const found = types.find((t) => t.id === id);
  const original = React.useMemo(() => (isNew || !found ? blank(nextColor(types)) : found), [isNew, found, types]);
  const [d, setD] = React.useState<CustomerType>(original);
  const [tried, setTried] = React.useState(false);
  const nameRef = React.useRef<HTMLInputElement>(null);
  const set = <K extends keyof CustomerType>(k: K, v: CustomerType[K]) => setD((x) => ({ ...x, [k]: v }));
  const dirty = JSON.stringify(d) !== JSON.stringify(original);
  const changed = (k: keyof CustomerType) => !isNew && d[k] !== original[k];
  const count = customers.filter((c) => c.typeId === id).length;
  const name = d.name.trim();
  const error = !name ? "Give the type a name." : types.some((t) => t.id !== id && t.name.trim().toLowerCase() === name.toLowerCase()) ? `There is already a type called ${name}.` : null;

  const save = () => {
    setTried(true);
    if (error) return nameRef.current?.focus();
    const final: CustomerType = { ...d, name, plural: d.plural.trim() || `${name}s` };
    if (isNew) {
      const nid = nextId("TY-", types.map((t) => t.id));
      typesStore.set((ts) => [...ts, { ...final, id: nid, playbookId: null }]);
      if (final.playbookId) linkPlaybook([nid], final.playbookId);
      logEvent(nid, "created it");
      show("success", `${final.name} created`);
      onOpen(nid);
      return;
    }
    const diffs = describe(original, final, playbooks);
    typesStore.set((ts) => ts.map((t) => (t.id === id ? { ...final, playbookId: original.playbookId } : t)));
    if (final.playbookId !== original.playbookId) linkPlaybook([id], final.playbookId);
    diffs.forEach((w) => logEvent(id, w));
    setD(final);
    setTried(false);
    show("success", count ? `${final.name} saved · ${count === 1 ? "1 customer gets" : `${count} customers get`} it from the next order` : `${final.name} saved`);
  };

  return (
    <FormSheet
      label={isNew ? "New customer type" : `Customer type ${original.name}`}
      title={isNew ? "New customer type" : original.name}
      lead={<span className="block size-3 rounded-[4px]" style={{ background: idColor(d.color) }} />}
      meta={
        isNew ? undefined : (
          <>
            <span>{LEVEL_LABEL[original.level]}</span>
            <span aria-hidden className="size-[3px] rounded-bz-pill bg-bz-line" />
            {count > 0 ? (
              <Link to={`${sfPath("customers")}?type=${id}`} className="underline-offset-2 hover:text-bz-text hover:underline">
                {customersWord(count)}
              </Link>
            ) : (
              <span>Not used</span>
            )}
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
        <Group title="Basics">
          <div className={FIELDS}>
            <FField label="Name" required changed={changed("name")} error={tried ? error : null}>
              <input ref={nameRef} autoFocus={isNew} value={d.name} onChange={(e) => set("name", e.target.value)} aria-label="Name" placeholder="Sub-dealer" className={cn(INPUT, tried && error && "border-bz-red-mark")} />
            </FField>
            <FField label="Plural" changed={changed("plural")}>
              <input value={d.plural} onChange={(e) => set("plural", e.target.value)} aria-label="Plural" placeholder={name ? `${name}s` : "Sub-dealers"} className={INPUT} />
            </FField>
            <FField label="Level" changed={changed("level")} className="sm:col-span-2">
              <Choice<Level> label="Level" value={d.level} onChange={(v) => set("level", v)} options={LEVELS.map((l) => ({ value: l, label: LEVEL_LABEL[l], title: LEVEL_HINT[l] }))} />
            </FField>
          </div>
        </Group>

        <Group title="Price">
          <div className={FIELDS}>
            <FField label="Off the list price" changed={changed("priceOff")}>
              <IntInput value={d.priceOff} onChange={(v) => set("priceOff", v)} max={90} suffix="%" ariaLabel="Percent off the list price" />
            </FField>
          </div>
        </Group>

        <Group title="Credit">
          <div className={FIELDS}>
            <FField label="Credit days" changed={changed("creditDays")}>
              <IntInput value={d.creditDays} onChange={(v) => set("creditDays", v)} max={365} suffix="days" ariaLabel="Credit days" />
            </FField>
            <FField label="Grace days" title="Days a bill may be overdue before new orders are stopped" changed={changed("graceDays")}>
              <IntInput value={d.graceDays} onChange={(v) => set("graceDays", v)} max={90} suffix="days" ariaLabel="Grace days" />
            </FField>
            <FField label="Over the limit or overdue" changed={changed("creditStop")} className="sm:col-span-2">
              <Choice<"hard" | "soft">
                label="Over the limit or overdue"
                value={d.creditStop}
                onChange={(v) => set("creditStop", v)}
                options={[
                  { value: "hard", label: "Block", title: "Blocked until someone allowed to overrides it, with a reason" },
                  { value: "soft", label: "Warn", title: "Goes through with a warning" },
                ]}
              />
            </FField>
          </div>
        </Group>

        <Group title="Portal">
          <div className="flex flex-col gap-4">
            <FField label="Portal" changed={changed("portal")}>
              <Choice<Portal>
                label="Portal"
                value={d.portal}
                onChange={(v) => set("portal", v)}
                options={[
                  { value: "dealer", label: PORTAL_LABEL.dealer },
                  { value: "retailer", label: PORTAL_LABEL.retailer },
                  { value: "none", label: "None" },
                ]}
              />
            </FField>
            <div className="flex min-h-9 items-center justify-between gap-3 rounded-bz-md border border-bz-line-soft px-3 text-[13px] text-bz-text" title="Other customers can be served by it, and it reports those sales">
              <span className="flex min-w-0 items-center gap-1.5">
                <span className="min-w-0 truncate">Sells to its own customers</span>
                {changed("ownCustomers") && <ChangedDot />}
              </span>
              <Switch on={d.ownCustomers} onChange={(v) => set("ownCustomers", v)} label="Sells to its own customers" />
            </div>
          </div>
        </Group>

        <Group title="Visits">
          <div className={FIELDS}>
            <FField label="Playbook" changed={changed("playbookId")}>
              <Picker
                ariaLabel="Playbook"
                width={280}
                value={d.playbookId ?? "none"}
                onChange={(v) => set("playbookId", v === "none" ? null : v)}
                placeholder="No playbook"
                options={[{ value: "none", label: "No playbook" }, ...playbooks.map((p) => ({ value: p.id, label: p.name, hint: `${p.items.length} ${p.items.length === 1 ? "step" : "steps"}` }))]}
                addLabel="New playbook"
                // A playbook is built in its own sheet, so the door opens it in a new tab and this draft stays; the stores keep tabs in step.
                onAdd={() => window.open(setupPath("playbooks", "new"), "_blank", "noopener")}
              />
            </FField>
            <FField label="Visits per 4 weeks" title="0 = reps don't visit" changed={changed("visitsPer4w")}>
              <IntInput value={d.visitsPer4w} onChange={(v) => set("visitsPer4w", v)} max={28} ariaLabel="Visits per 4 weeks" />
            </FField>
          </div>
        </Group>

        <Group title="More">
          <div className="flex flex-col gap-4">
            <FField label="Colour" changed={changed("color")}>
              <div className="flex flex-wrap gap-2" role="group" aria-label="Colour">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => set("color", n)}
                    aria-label={`Colour ${n}`}
                    aria-pressed={d.color === n}
                    className={cn("flex size-7 items-center justify-center rounded-[8px] text-bz-surface transition-transform focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bz-fire", d.color === n ? "shadow-[0_0_0_2px_var(--bz-surface),0_0_0_3px_var(--bz-text-soft)]" : "hover:scale-105")}
                    style={{ background: idColor(n) }}
                  >
                    {d.color === n && <Check size={14} strokeWidth={3} />}
                  </button>
                ))}
              </div>
            </FField>
            <FField label="Description" changed={changed("blurb")}>
              <textarea value={d.blurb} onChange={(e) => set("blurb", e.target.value)} rows={2} aria-label="Description" className={TEXTAREA} />
            </FField>
          </div>
        </Group>
      </div>

      {!isNew && (
        <div className="border-t border-bz-line-soft">
          <SfActivity ids={[id]} />
          <SfNoteFoot id={id} />
        </div>
      )}
    </FormSheet>
  );
}

function describe(a: CustomerType, b: CustomerType, playbooks: Playbook[]) {
  const out: string[] = [];
  const pb = (id: string | null) => playbooks.find((p) => p.id === id)?.name ?? "none";
  const stop = (s: CustomerType["creditStop"]) => (s === "hard" ? "block" : "warn");
  if (a.name !== b.name) out.push(`renamed the type from ${a.name} to ${b.name}`);
  if (a.plural !== b.plural) out.push(`changed the plural to ${b.plural}`);
  if (a.level !== b.level) out.push(`changed the level from ${LEVEL_LABEL[a.level].toLowerCase()} to ${LEVEL_LABEL[b.level].toLowerCase()}`);
  if (a.priceOff !== b.priceOff) out.push(`changed the price from ${a.priceOff}% to ${b.priceOff}% off`);
  if (a.creditDays !== b.creditDays) out.push(`changed the credit from ${a.creditDays} to ${b.creditDays} days`);
  if (a.graceDays !== b.graceDays) out.push(`changed the grace from ${a.graceDays} to ${b.graceDays} days`);
  if (a.creditStop !== b.creditStop) out.push(`changed the credit stop from ${stop(a.creditStop)} to ${stop(b.creditStop)}`);
  if (a.portal !== b.portal) out.push(`changed the portal from ${PORTAL_LABEL[a.portal]} to ${PORTAL_LABEL[b.portal]}`);
  if (a.ownCustomers !== b.ownCustomers) out.push(b.ownCustomers ? "let it sell to its own customers" : "stopped it selling to its own customers");
  if (a.playbookId !== b.playbookId) out.push(`changed the playbook from ${pb(a.playbookId)} to ${pb(b.playbookId)}`);
  if (a.visitsPer4w !== b.visitsPer4w) out.push(`changed visits from ${a.visitsPer4w} to ${b.visitsPer4w} per 4 weeks`);
  if (a.color !== b.color) out.push("changed the colour");
  if (a.blurb !== b.blurb) out.push("changed the description");
  return out;
}
