import * as React from "react";
import { Link } from "react-router";
import { Plus, Store, TriangleAlert } from "lucide-react";
import { cn } from "../ui/utils";
import { BTN, Checkbox, Dialog, Field, GHOST, INPUT, NUM, Switch, TEXTAREA, ToastHost, useToast } from "../sales/bzw";
import { useKeys } from "../sales/orders";
import { useStore } from "../sales/store";
import { SF_TODAY } from "./data";
import type { Announcement, PortalCan, PortalSettings } from "./data";
import { day, npr } from "./engine";
import { HEAD_BTN, Panel } from "./fx";
import { FxTable } from "./fx-table";
import type { FxColumn } from "./fx-table";
import { MoneyInput } from "./network-form";
import { nextId } from "./persist";
import { openQuickAdd } from "./quickadd";
import { logEvent } from "./records";
import { SfActivity, SfNoteFoot, SfShell, TypeMark } from "./sf";
import { announcementsStore, customersStore, modulesStore, portalSettingsStore, typesStore } from "./store";
import { FField, SaveBar, SettingRow, goToField, overlayUp, setupPath } from "./setup-frame";
import type { StagedChange, Toast } from "./setup-frame";

// ════════════════════════════════════════════════════════════════════════════
// SETUP · DEALER PORTAL — what the portal is and what dealers may do on it
//
// The settings are staged: a save bar comes up only while something changed,
// and nothing here saves by itself (an approval ceiling is money). "Who gets
// it" is not stored here: it is the customer type's portal setting, so ticking
// a type writes the type. Portal orders within credit and up to
// `autoApproveUpTo` are approved on arrival (owner decision #4). Announcements
// are saved as they are posted — they are records, not settings — and dealers
// see them on the portal home.
// ════════════════════════════════════════════════════════════════════════════

const RECORD = "setup:portal";

const CAN: { key: PortalCan; label: string; hint: string }[] = [
  { key: "order", label: "Place orders", hint: "At their own price, with offers applied as they fill the cart" },
  { key: "statement", label: "See their statement", hint: "Invoices, payments, credit notes and what is overdue" },
  { key: "pay", label: "Pay", hint: "Bank transfer or cheque with proof — a payment you confirm in Receipts" },
  { key: "claims", label: "Raise claims", hint: "Scheme, damage and display claims with photos" },
  { key: "rfq", label: "Send price requests", hint: "For large or special orders — you answer with an estimate" },
  { key: "dms", label: "Report their own sales", hint: "Only for types that sell to their own customers" },
  { key: "branding", label: "Request branding", hint: "Sign boards, standees and coolers" },
];

export function PortalPlace() {
  const { toast, show, dismiss } = useToast();
  const saved = useStore(portalSettingsStore);
  const types = useStore(typesStore);
  const customers = useStore(customersStore);
  const modules = useStore(modulesStore);
  const savedWho = types.filter((t) => t.portal === "dealer").map((t) => t.id);
  const [d, setD] = React.useState<PortalSettings>(saved);
  const [who, setWho] = React.useState<string[]>(savedWho);
  const [tried, setTried] = React.useState(false);
  const portalOn = modules.find((m) => m.key === "dealer-portal")?.on ?? false;
  const dms = modules.find((m) => m.key === "secondary");
  const dmsOn = dms?.on ?? false;

  const whoCustomers = customers.filter((c) => who.includes(c.typeId));
  const withUsers = whoCustomers.filter((c) => c.portalUsers.length > 0);
  const errors = { brand: !d.brand.trim() ? "Give the portal a name." : null, cutoff: !/^\d{2}:\d{2}$/.test(d.cutoff) ? "Set a cut-off time." : null };

  const whoChanged = [...who].sort().join() !== [...savedWho].sort().join();
  const staged: [string, string, boolean][] = [
    ["brand", "Portal name", d.brand !== saved.brand],
    ["welcome", "Welcome message", d.welcome !== saved.welcome],
    ["who", "Who gets it", whoChanged],
    ...CAN.map((c): [string, string, boolean] => [`can:${c.key}`, c.label, d.can[c.key] !== saved.can[c.key]]),
    ["autoApproveUpTo", "Auto-approve up to", d.autoApproveUpTo !== saved.autoApproveUpTo],
    ["minOrder", "Minimum order", d.minOrder !== saved.minOrder],
    ["cutoff", "Order cut-off", d.cutoff !== saved.cutoff],
  ];
  const changes: StagedChange[] = staged.filter(([, , on]) => on).map(([field, label]) => ({ key: field, label, field }));

  const discard = () => {
    setD(saved);
    setWho(savedWho);
    setTried(false);
  };
  const save = () => {
    setTried(true);
    if (errors.brand) return goToField("brand");
    if (errors.cutoff) return goToField("cutoff");
    const log: string[] = [];
    if (d.brand.trim() !== saved.brand) log.push(`renamed the portal to ${d.brand.trim()}`);
    (Object.keys(d.can) as PortalCan[]).forEach((k) => {
      if (d.can[k] !== saved.can[k]) log.push(`turned ${d.can[k] ? "on" : "off"} “${CAN.find((c) => c.key === k)?.label ?? k}”`);
    });
    if (d.autoApproveUpTo !== saved.autoApproveUpTo) log.push(d.autoApproveUpTo ? `set portal orders up to NPR ${npr(d.autoApproveUpTo)} to approve on arrival` : "set every portal order to wait for review");
    if (d.minOrder !== saved.minOrder) log.push(d.minOrder ? `set the minimum order to NPR ${npr(d.minOrder)}` : "removed the minimum order");
    if (d.cutoff !== saved.cutoff) log.push(`set the order cut-off to ${d.cutoff}`);
    if (d.welcome !== saved.welcome) log.push("changed the welcome message");
    const added = who.filter((t) => !savedWho.includes(t));
    const removed = savedWho.filter((t) => !who.includes(t));
    const next = { ...d, brand: d.brand.trim() };
    portalSettingsStore.set(() => next);
    setD(next);
    if (added.length || removed.length) {
      typesStore.set((ts) => ts.map((t) => (added.includes(t.id) ? { ...t, portal: "dealer" } : removed.includes(t.id) ? { ...t, portal: "none" } : t)));
      added.forEach((t) => {
        log.push(`gave ${types.find((x) => x.id === t)?.plural ?? t} the dealer portal`);
        logEvent(t, "gave it the dealer portal");
      });
      removed.forEach((t) => {
        log.push(`took the dealer portal from ${types.find((x) => x.id === t)?.plural ?? t}`);
        logEvent(t, "took the dealer portal away");
      });
    }
    log.forEach((w) => logEvent(RECORD, w));
    setTried(false);
    show("success", "Portal settings saved");
  };
  useKeys({
    "mod+s": (e) => {
      if (!changes.length || overlayUp()) return;
      e.preventDefault();
      save();
    },
  });

  return (
    <SfShell
      current="setup:portal"
      actions={
        <Link to="/design/dealer" className={HEAD_BTN}>
          <Store size={14} className="text-bz-text-muted" />
          Open the dealer portal
        </Link>
      }
    >
      <div className="relative h-full min-h-0">
        <div className={cn("h-full overflow-y-auto px-4 [scrollbar-width:thin] md:px-6", changes.length > 0 ? "pb-24" : "pb-8")}>
          <div className="flex max-w-[880px] flex-col gap-3">
            {!portalOn && (
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-[14px] border border-[color-mix(in_srgb,var(--bz-amber)_36%,transparent)] bg-[color-mix(in_srgb,var(--bz-amber)_10%,transparent)] py-2 pl-4 pr-2 text-[13px] text-bz-text">
                <TriangleAlert size={14} className="shrink-0 text-bz-amber-ink" />
                <span className="min-w-0 flex-1">The dealer portal is switched off.</span>
                <Link to={setupPath("modules")} className={cn(HEAD_BTN, "h-8")}>
                  Modules
                </Link>
              </div>
            )}

            <Panel title="Portal">
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FField field="brand" label="Portal name" required changed={d.brand !== saved.brand} error={tried ? errors.brand : null}>
                    <input value={d.brand} onChange={(e) => setD((x) => ({ ...x, brand: e.target.value }))} aria-label="Portal name" className={cn(INPUT, tried && errors.brand && "border-bz-red-mark")} />
                  </FField>
                </div>
                <FField field="welcome" label="Welcome message" title="Shown on the dealer's home page" changed={d.welcome !== saved.welcome} aside={`${d.welcome.length} / 280`}>
                  <textarea value={d.welcome} onChange={(e) => setD((x) => ({ ...x, welcome: e.target.value.slice(0, 280) }))} rows={2} aria-label="Welcome message" className={cn(TEXTAREA, "min-h-[60px]")} />
                </FField>
                <FField
                  field="who"
                  label="Customer types that get it"
                  changed={whoChanged}
                  aside={
                    whoCustomers.length > 0 ? (
                      <span title="A customer's people are invited from the customer">
                        {withUsers.length} of {whoCustomers.length} customers have a user
                      </span>
                    ) : undefined
                  }
                >
                  {types.length === 0 ? (
                    <p className="m-0 flex flex-wrap items-center gap-x-3 gap-y-2 text-[13px] text-bz-text-muted">
                      No customer types yet.
                      <button type="button" className={cn(HEAD_BTN, "h-8 px-2.5")} onClick={() => openQuickAdd("type")}>
                        <Plus size={13} className="text-bz-text-muted" /> New customer type
                      </button>
                    </p>
                  ) : (
                    <ul className="m-0 list-none overflow-hidden rounded-[10px] border border-bz-line-soft p-0">
                      {types.map((t) => {
                        const n = customers.filter((c) => c.typeId === t.id).length;
                        const on = who.includes(t.id);
                        return (
                          <li key={t.id} className="border-t border-bz-line-soft first:border-t-0">
                            <label className={cn("flex min-h-11 cursor-pointer items-center gap-3 px-3 transition-colors", on ? "bg-[color-mix(in_srgb,var(--fx-accent)_7%,transparent)]" : "hover:bg-bz-paper-warm/50")}>
                              <Checkbox on={on} onChange={(v) => setWho((w) => (v ? [...w, t.id] : w.filter((x) => x !== t.id)))} label={t.plural} />
                              <TypeMark name={t.plural} color={t.color} className="min-w-0 flex-1 gap-2 text-[13px] text-bz-text" />
                              <span className={cn("shrink-0 text-[12px] text-bz-text-soft", NUM)}>{t.portal === "retailer" && !on ? "On the retailer app" : `${n} ${n === 1 ? "customer" : "customers"}`}</span>
                            </label>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </FField>
              </div>
            </Panel>

            <Panel title="What dealers can do" flush>
              {CAN.map((c) => {
                const blocked = c.key === "dms" && !dmsOn;
                return (
                  <SettingRow key={c.key} field={`can:${c.key}`} label={c.label} title={c.hint} quiet={blocked} changed={d.can[c.key] !== saved.can[c.key]}>
                    {blocked ? (
                      // Not a dead switch: it can't be on while the module it reports to is off.
                      <Link to={setupPath("modules")} title={`${dms?.name ?? "Its module"} is off in Modules`} className="text-[12px] text-bz-text-muted underline-offset-2 hover:text-bz-text hover:underline">
                        Needs {dms?.name ?? "its module"}
                      </Link>
                    ) : (
                      <Switch on={d.can[c.key]} onChange={(v) => setD((x) => ({ ...x, can: { ...x.can, [c.key]: v } }))} label={c.label} />
                    )}
                  </SettingRow>
                );
              })}
            </Panel>

            <Panel title="Ordering">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <FField field="autoApproveUpTo" label="Auto-approve up to" title="An order within credit and up to this amount is approved at once. 0 = every portal order waits for review." changed={d.autoApproveUpTo !== saved.autoApproveUpTo}>
                  <MoneyInput value={d.autoApproveUpTo} onChange={(v) => setD((x) => ({ ...x, autoApproveUpTo: v ?? 0 }))} ariaLabel="Auto-approve up to" />
                </FField>
                <FField field="minOrder" label="Minimum order" title="Smaller carts can't be sent. 0 = no minimum." changed={d.minOrder !== saved.minOrder}>
                  <MoneyInput value={d.minOrder} onChange={(v) => setD((x) => ({ ...x, minOrder: v ?? 0 }))} ariaLabel="Minimum order" />
                </FField>
                <FField field="cutoff" label="Cut-off time" title="Orders after this ship the next working day" changed={d.cutoff !== saved.cutoff} error={tried ? errors.cutoff : null}>
                  <input type="time" value={d.cutoff} onChange={(e) => setD((x) => ({ ...x, cutoff: e.target.value }))} aria-label="Order cut-off" className={cn(INPUT, NUM, tried && errors.cutoff && "border-bz-red-mark")} />
                </FField>
              </div>
            </Panel>

            <Announcements show={show} />

            <Panel flush>
              <SfActivity ids={[RECORD]} />
              <SfNoteFoot id={RECORD} />
            </Panel>
          </div>
        </div>

        <SaveBar changes={changes} onSave={save} onDiscard={discard} />
        <ToastHost toast={toast} onDismiss={dismiss} lifted={changes.length > 0} />
      </div>
    </SfShell>
  );
}

/** News for dealers, newest first — saved as soon as it is posted, shown on the portal home. */
function Announcements({ show }: { show: Toast }) {
  const list = useStore(announcementsStore);
  const [editing, setEditing] = React.useState<Announcement | "new" | null>(null);
  const sorted = [...list].sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));

  const post = (title: string, body: string) => {
    const id = nextId("AN-", list.map((a) => a.id));
    announcementsStore.set((as) => [...as, { id, title, body, date: SF_TODAY }]);
    logEvent(RECORD, `posted the announcement “${title}”`);
    show("success", "Announcement posted");
  };
  const change = (a: Announcement, title: string, body: string) => {
    if (title === a.title && body === a.body) return;
    announcementsStore.set((as) => as.map((x) => (x.id === a.id ? { ...x, title, body } : x)));
    logEvent(RECORD, `changed the announcement “${title}”`);
    show("success", "Announcement saved");
  };
  const remove = (a: Announcement) => {
    announcementsStore.set((as) => as.filter((x) => x.id !== a.id));
    logEvent(RECORD, `took down the announcement “${a.title}”`);
    show("success", "Announcement taken down");
  };

  const when = (a: Announcement) => (a.date === SF_TODAY ? "Today" : day(a.date));
  const columns: FxColumn<Announcement>[] = [
    {
      key: "title",
      label: "Announcement",
      width: "minmax(0,1fr)",
      role: "primary",
      render: (a) => (
        <span className="block min-w-0 leading-snug">
          <span className="block truncate font-semibold text-bz-text">{a.title}</span>
          {a.body && <span className="block truncate text-[11.5px] text-bz-text-soft">{a.body}</span>}
        </span>
      ),
    },
    { key: "date", label: "Posted", width: "88px", align: "right", role: "figure", render: (a) => <span className={cn("whitespace-nowrap text-bz-text-muted", NUM)}>{when(a)}</span> },
  ];

  return (
    <Panel
      title="Announcements"
      flush
      right={
        <button type="button" className={cn(HEAD_BTN, "h-8 px-2.5")} onClick={() => setEditing("new")}>
          <Plus size={13} className="text-bz-text-muted" /> New announcement
        </button>
      }
    >
      {/* The table is the panel's body, so it gives up its own card. */}
      <div className="border-t border-bz-line-soft">
        <FxTable<Announcement>
          label="Announcements"
          rows={sorted}
          idOf={(a) => a.id}
          columns={columns}
          noun={["announcement", "announcements"]}
          rowLabel={(a) => a.title}
          onOpen={setEditing}
          current={editing && editing !== "new" ? editing.id : null}
          pageSize={6}
          keys={false}
          className="rounded-none border-0 bg-transparent"
          empty={<p className="m-0 px-4 py-4 text-[12px] text-bz-text-soft">No announcements yet.</p>}
        />
      </div>
      {editing && (
        <AnnouncementDialog
          key={editing === "new" ? "new" : editing.id}
          announcement={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSave={(title, body) => (editing === "new" ? post(title, body) : change(editing, title, body), setEditing(null))}
          onRemove={() => (editing !== "new" && remove(editing), setEditing(null))}
        />
      )}
    </Panel>
  );
}

function AnnouncementDialog({ announcement, onClose, onSave, onRemove }: { announcement: Announcement | null; onClose: () => void; onSave: (title: string, body: string) => void; onRemove: () => void }) {
  const [title, setTitle] = React.useState(announcement?.title ?? "");
  const [body, setBody] = React.useState(announcement?.body ?? "");
  const [tried, setTried] = React.useState(false);
  const titleRef = React.useRef<HTMLInputElement>(null);
  const t = title.trim();
  const commit = () => {
    setTried(true);
    if (!t) return titleRef.current?.focus();
    onSave(t, body.trim());
  };
  return (
    <Dialog
      open
      title={announcement ? "Edit announcement" : "New announcement"}
      onClose={onClose}
      foot={
        <>
          {announcement && (
            <button type="button" onClick={onRemove} title="Dealers stop seeing it" className="mr-auto inline-flex h-9 items-center rounded-bz-md px-1 text-[12px] font-semibold text-bz-red underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-bz-fire">
              Take it down
            </button>
          )}
          <button type="button" className={GHOST} onClick={onClose}>
            Cancel
          </button>
          <button type="button" className={BTN} onClick={commit}>
            {announcement ? "Save" : "Post"}
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <Field
          label="Title"
          required
          hint={
            tried && !t ? (
              <span role="alert" className="text-bz-red">
                Enter a title.
              </span>
            ) : undefined
          }
        >
          <input ref={titleRef} autoFocus value={title} onChange={(e) => setTitle(e.target.value.slice(0, 80))} aria-label="Title" className={cn(INPUT, tried && !t && "border-bz-red-mark")} />
        </Field>
        <Field label="Text">
          <textarea value={body} onChange={(e) => setBody(e.target.value.slice(0, 280))} rows={2} aria-label="Text" className={TEXTAREA} />
        </Field>
      </div>
    </Dialog>
  );
}
