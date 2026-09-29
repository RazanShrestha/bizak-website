import * as React from "react";
import { Link } from "react-router";
import { cn } from "../ui/utils";
import { Checkbox, Field, GHOST_SM, INPUT, NUM, Segmented, Switch, TEXTAREA, ToastHost, useToast } from "../sales/bzw";
import { createStore, useStore } from "../sales/store";
import { SF_TODAY } from "./data";
import { customersStore, modulesStore, typesStore } from "./store";
import { sfPath } from "./shell";
import { PageIntro, TypeMark, idColor } from "./ui";
import { RecordActivity, RecordNoteFoot, logChange } from "./network-log";
import { FormBlock, SaveBar, SetupFrame } from "./setup-frame";

// ════════════════════════════════════════════════════════════════════════════
// SETUP · PORTAL — what the dealer portal is and what dealers may do on it
//
// One settings form with a sticky save bar that appears only when something
// changed (DESIGN-DIRECTION rule 6). "Who gets it" is not stored here: it is
// the customer type's portal setting, so ticking a type writes the type.
// ════════════════════════════════════════════════════════════════════════════

type Can = "order" | "statement" | "pay" | "claims" | "rfq" | "dms" | "branding";
type PortalSettings = { brand: string; can: Record<Can, boolean>; approval: "auto" | "review"; minOrder: number; cutoff: string; welcome: string };

export const portalStore = createStore<PortalSettings>({
  brand: "Bizak Nepal · Dealer portal",
  can: { order: true, statement: true, pay: true, claims: true, rfq: true, dms: true, branding: true },
  approval: "auto",
  minOrder: 25_000,
  cutoff: "15:00",
  welcome: "Namaste. Order, pay and track your account here. Your rep sees what you do and can help on the phone.",
});

const CAN: { key: Can; label: string; hint: string }[] = [
  { key: "order", label: "Place orders", hint: "At their own price list, with schemes applied as they add to the cart" },
  { key: "statement", label: "See their statement", hint: "Ledger, invoices, credit notes and ageing" },
  { key: "pay", label: "Pay online", hint: "eSewa, Khalti, Fonepay or bank — becomes a receipt for you to confirm" },
  { key: "claims", label: "Raise claims", hint: "Scheme, damage and display claims with photos" },
  { key: "rfq", label: "Request quotations", hint: "For large or special orders — you answer with an estimate" },
  { key: "dms", label: "Report secondary sales and stock", hint: "Only for types that have their own customers" },
  { key: "branding", label: "Request branding", hint: "Sign boards, standees and coolers" },
];

export function PortalTab() {
  const saved = useStore(portalStore);
  const types = useStore(typesStore);
  const customers = useStore(customersStore);
  const modules = useStore(modulesStore);
  const { toast, show, dismiss } = useToast();
  const savedWho = types.filter((t) => t.portal === "dealer").map((t) => t.id);
  const [d, setD] = React.useState<PortalSettings>(saved);
  const [who, setWho] = React.useState<string[]>(savedWho);
  const portalOn = modules.find((m) => m.key === "dealer-portal")?.on ?? false;
  const dmsOn = modules.find((m) => m.key === "secondary")?.on ?? false;
  const dirty = JSON.stringify(d) !== JSON.stringify(saved) || [...who].sort().join() !== [...savedWho].sort().join();

  const whoCustomers = customers.filter((c) => who.includes(c.typeId));
  const withUsers = whoCustomers.filter((c) => c.portalUsers.length > 0);
  const seenToday = whoCustomers.reduce((s, c) => s + c.portalUsers.filter((u) => u.lastSeen === SF_TODAY).length, 0);
  const error = !d.brand.trim() ? "Give the portal a name." : !/^\d{2}:\d{2}$/.test(d.cutoff) ? "Set a cut-off time." : null;

  const discard = () => {
    setD(saved);
    setWho(savedWho);
  };
  const save = () => {
    if (error) return;
    const changes: string[] = [];
    if (d.brand !== saved.brand) changes.push(`renamed the portal to ${d.brand}`);
    (Object.keys(d.can) as Can[]).forEach((k) => {
      if (d.can[k] !== saved.can[k]) changes.push(`turned ${d.can[k] ? "on" : "off"} “${CAN.find((c) => c.key === k)!.label}”`);
    });
    if (d.approval !== saved.approval) changes.push(d.approval === "auto" ? "set portal orders within credit to approve by themselves" : "set every portal order to go to review");
    if (d.minOrder !== saved.minOrder) changes.push(`set the minimum order to NPR ${d.minOrder.toLocaleString("en-US")}`);
    if (d.cutoff !== saved.cutoff) changes.push(`set the order cut-off to ${d.cutoff}`);
    if (d.welcome !== saved.welcome) changes.push("changed the welcome message");
    const added = who.filter((t) => !savedWho.includes(t));
    const removed = savedWho.filter((t) => !who.includes(t));
    added.forEach((t) => changes.push(`gave ${types.find((x) => x.id === t)?.plural} the dealer portal`));
    removed.forEach((t) => changes.push(`took the dealer portal from ${types.find((x) => x.id === t)?.plural}`));
    const next = { ...d, brand: d.brand.trim() };
    portalStore.set(() => next);
    setD(next);
    if (added.length || removed.length) typesStore.set((ts) => ts.map((t) => (added.includes(t.id) ? { ...t, portal: "dealer" } : removed.includes(t.id) ? { ...t, portal: "none" } : t)));
    changes.forEach((w) => logChange("setup:portal", w));
    show("success", "Portal settings saved. Dealers see them the next time they sign in.");
  };

  const initials = d.brand
    .split(/[\s·]+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <SetupFrame tab="portal" width="narrow">
      <PageIntro>
        The dealer portal is where dealers order, pay and track their account. {withUsers.length} of {whoCustomers.length} customers who get it have a user; {seenToday} signed in today.
      </PageIntro>

      {!portalOn && (
        <p className="m-0 mb-8 rounded-bz-md bg-bz-paper-warm px-3 py-2.5 text-[12px] text-bz-text-muted">
          The dealer portal is switched off.{" "}
          <Link to={sfPath("setup")} className="font-medium text-bz-text underline underline-offset-2">
            Switch it on in Modules
          </Link>{" "}
          — these settings apply once it is on.
        </p>
      )}

      <div className="flex flex-col gap-8">
        <FormBlock title="Brand" hint="What dealers see at the top of every page.">
          <div className="flex flex-wrap items-start gap-4">
            <div className="flex flex-col items-center gap-2">
              <span className="flex size-14 items-center justify-center rounded-bz-lg border border-dashed border-bz-line bg-bz-paper text-[17px] font-bold text-bz-text-muted" aria-label="Logo placeholder">
                {initials || "B"}
              </span>
              <button type="button" className={GHOST_SM} onClick={() => show("info", "Logo upload comes with the app. The initials stand in until then.")}>
                Upload logo
              </button>
            </div>
            <Field label="Portal name" required className="min-w-[220px] flex-1">
              <input value={d.brand} onChange={(e) => setD((x) => ({ ...x, brand: e.target.value }))} className={INPUT} />
            </Field>
          </div>
        </FormBlock>

        <FormBlock title="Who gets it" hint="Set on the customer type. Ticking a type here gives all its customers the portal.">
          <ul className="m-0 list-none divide-y divide-bz-line-soft border-y border-bz-line-soft p-0">
            {types.map((t) => {
              const n = customers.filter((c) => c.typeId === t.id).length;
              const on = who.includes(t.id);
              return (
                <li key={t.id}>
                  <label className="flex cursor-pointer items-center gap-3 px-1 py-2.5">
                    <Checkbox on={on} onChange={(v) => setWho((w) => (v ? [...w, t.id] : w.filter((x) => x !== t.id)))} label={t.plural} />
                    <TypeMark name={t.plural} color={t.color} className="min-w-0 flex-1 text-[12.5px] text-bz-text" />
                    <span className="shrink-0 text-[11px] text-bz-text-soft">{t.portal === "retailer" && !on ? "On the retailer app" : `${n} ${n === 1 ? "customer" : "customers"}`}</span>
                  </label>
                </li>
              );
            })}
          </ul>
        </FormBlock>

        <FormBlock title="What dealers can do">
          <ul className="m-0 list-none divide-y divide-bz-line-soft border-y border-bz-line-soft p-0">
            {CAN.map((c) => {
              const blocked = c.key === "dms" && !dmsOn;
              return (
                <li key={c.key} className="flex items-start gap-4 px-1 py-3">
                  <span className="min-w-0 flex-1">
                    <span className={cn("block text-[12.5px]", blocked ? "text-bz-text-muted" : "text-bz-text")}>{c.label}</span>
                    <span className="block text-[11px] text-bz-text-soft">{blocked ? "Needs Secondary sales, which is off in Modules" : c.hint}</span>
                  </span>
                  <Switch on={d.can[c.key] && !blocked} onChange={(v) => !blocked && setD((x) => ({ ...x, can: { ...x.can, [c.key]: v } }))} label={c.label} />
                </li>
              );
            })}
          </ul>
        </FormBlock>

        <FormBlock title="Orders" hint="Portal orders arrive in the Orders hub with the same price, scheme and credit checks as a rep's.">
          <div className="flex flex-col gap-5">
            <Field label="Approval" hint={d.approval === "auto" ? "Orders within credit become a sales order at once. The rest go to review." : "Every portal order waits in the Orders hub for someone to approve it."}>
              <Segmented<"auto" | "review">
                value={d.approval}
                onChange={(v) => setD((x) => ({ ...x, approval: v }))}
                options={[
                  { value: "auto", label: "Approve within credit" },
                  { value: "review", label: "Always review" },
                ]}
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Minimum order value" hint="Smaller carts can't be submitted.">
                <label className="relative block">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[11px] font-medium text-bz-text-soft">NPR</span>
                  <input
                    inputMode="numeric"
                    value={d.minOrder ? d.minOrder.toLocaleString("en-US") : ""}
                    onChange={(e) => setD((x) => ({ ...x, minOrder: Number(e.target.value.replace(/[^\d]/g, "")) || 0 }))}
                    className={cn(INPUT, "pl-11", NUM)}
                    placeholder="0"
                  />
                </label>
              </Field>
              <Field label="Cut-off time" hint="Orders after this ship the next working day.">
                <input type="time" value={d.cutoff} onChange={(e) => setD((x) => ({ ...x, cutoff: e.target.value }))} className={cn(INPUT, NUM)} />
              </Field>
            </div>
          </div>
        </FormBlock>

        <FormBlock title="Welcome message" hint="Shown on the dealer's home page. Keep it to a line or two.">
          <textarea value={d.welcome} onChange={(e) => setD((x) => ({ ...x, welcome: e.target.value.slice(0, 280) }))} className={TEXTAREA} rows={3} />
          <p className={cn("m-0 mt-1 text-right text-[10.5px] text-bz-text-soft", NUM)}>{d.welcome.length} / 280</p>
        </FormBlock>
      </div>

      <div className="mt-10 flex items-center gap-3 rounded-bz-md border border-bz-line-soft px-4 py-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-bz-md text-[11px] font-bold text-white" style={{ background: idColor(2) }}>
          {initials || "B"}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[12.5px] font-semibold text-bz-text">{d.brand || "Your portal"}</span>
          <span className="block truncate text-[11px] text-bz-text-soft">{d.welcome}</span>
        </span>
        <Link to="/design/dealer" className="shrink-0 text-[11.5px] text-bz-text-soft hover:text-bz-text">
          Open the portal
        </Link>
      </div>

      <RecordActivity subject="setup:portal" className="mt-12" />
      <RecordNoteFoot subject="setup:portal" inline />

      {dirty && (
        <div className="sticky bottom-4 z-10 mt-8 rounded-bz-lg border border-bz-line bg-bz-surface px-4 py-3 shadow-[var(--bz-shadow-panel)]">
          <SaveBar error={error} onDiscard={discard} onSave={save} />
        </div>
      )}
      <ToastHost toast={toast} onDismiss={dismiss} />
    </SetupFrame>
  );
}
