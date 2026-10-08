import * as React from "react";
import { TriangleAlert } from "lucide-react";
import { cn } from "../ui/utils";
import { INPUT, NUM, Switch, ToastHost, useToast } from "../sales/bzw";
import { useStore } from "../sales/store";
import type { ModuleKey } from "./data";
import { Panel, PillTabs } from "./fx";
import { logEvent } from "./records";
import { SfActivity, SfNoteFoot, SfShell } from "./sf";
import { fieldSettingsStore, modulesStore } from "./store";
import { SettingRow } from "./setup-frame";
import type { Toast } from "./setup-frame";

// ════════════════════════════════════════════════════════════════════════════
// SETUP · MODULES — switch parts of Sales force on and off for this tenant
//
// The switch is real: the top-bar areas read modulesStore, so a module switched
// off takes its places out of the module at once. Dependencies are stated, not
// enforced — switching the Orders hub off while the portal is on is allowed,
// and the row says what is missing. The field setting that belongs to the
// module as a whole (the check-in radius) sits beside the field modules.
// ════════════════════════════════════════════════════════════════════════════

/** Setup has no record of its own; its history is filed under this id. */
const RECORD = "setup:modules";

type Row = { id: ModuleKey; name: string; blurb: string; on: boolean };
type Show = "all" | "on" | "off";

const GROUPS: { label: string; keys: ModuleKey[] }[] = [
  { label: "Field and orders", keys: ["field", "orders"] },
  { label: "Channels", keys: ["dealer-portal", "retailer-app", "secondary", "van-sales"] },
  { label: "Growth", keys: ["schemes", "campaigns", "branding", "events"] },
  { label: "Money and team", keys: ["claims", "targets", "expenses"] },
];
/** The page is two columns from 1024px: these groups lead the first, the rest the second. */
const FIRST_COLUMN = ["Field and orders", "Growth"];

/** The places a module owns in the top bar (sf.tsx SF_SECTIONS). */
const PAGES: Partial<Record<ModuleKey, string[]>> = {
  field: ["Live", "Plan", "Visits"],
  orders: ["Orders"],
  schemes: ["Schemes"],
  campaigns: ["Campaigns"],
  branding: ["Branding"],
  events: ["Events"],
  claims: ["Claims"],
  targets: ["Targets"],
};

/** Hard needs: without them the module has nowhere to put its work. */
const NEEDS: Partial<Record<ModuleKey, { keys: ModuleKey[]; why: string }>> = {
  "dealer-portal": { keys: ["orders"], why: "Portal orders land in the Orders hub." },
  "retailer-app": { keys: ["orders"], why: "Retailer app orders land in the Orders hub." },
  "van-sales": { keys: ["field", "orders"], why: "Van sales run on the rep's day and create hub orders." },
  expenses: { keys: ["field"], why: "Travel is claimed against the rep's visits." },
  secondary: { keys: ["dealer-portal"], why: "Distributors report their sales and stock on the portal." },
};
/** Soft links: it works alone, but does more with these on. */
const USES: Partial<Record<ModuleKey, { keys: ModuleKey[]; why: string }>> = {
  campaigns: { keys: ["schemes", "branding", "events"], why: "A campaign groups schemes, branding and events." },
  claims: { keys: ["schemes", "branding"], why: "Scheme and display claims come from schemes and branding." },
  targets: { keys: ["orders", "field"], why: "Targets count hub orders and visits." },
  branding: { keys: ["field"], why: "Reps check branding on their visits." },
};

/** A column of panels; its last one takes up the slack, so both columns end on one line. */
const COLUMN = "flex min-w-0 flex-col gap-3 [&>section:last-child]:flex-1";

const and = (names: string[]) => (names.length > 1 ? `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}` : names[0]);

/** The geofence radius the rep app's check-in measures against (fieldSettingsStore). Saved when the field is left. */
function RadiusRow({ show }: { show: Toast }) {
  const settings = useStore(fieldSettingsStore);
  const [text, setText] = React.useState(String(settings.geofenceMetres));
  const [error, setError] = React.useState<string | null>(null);
  React.useEffect(() => {
    setText(String(settings.geofenceMetres));
    setError(null);
  }, [settings.geofenceMetres]);

  const commit = () => {
    const n = text.trim() === "" ? NaN : Math.round(Number(text));
    if (!Number.isFinite(n) || n < 10 || n > 5000) return setError("Use 10 to 5,000 metres.");
    setError(null);
    setText(String(n));
    const was = settings.geofenceMetres;
    if (n === was) return;
    fieldSettingsStore.set((x) => ({ ...x, geofenceMetres: n }));
    logEvent(RECORD, `set the check-in radius to ${n} m (was ${was} m)`);
    show("success", `Check-in radius is ${n} m.`);
  };

  return (
    <SettingRow
      label="Check-in radius"
      title="A rep counts as at the shop within this distance of its saved location"
      sub={
        error ? (
          <span role="alert" className="text-bz-red">
            {error}
          </span>
        ) : undefined
      }
    >
      <label className="relative block w-[136px]">
        <input
          inputMode="numeric"
          aria-label="Check-in radius, in metres"
          aria-invalid={!!error}
          value={text}
          onFocus={(e) => e.currentTarget.select()}
          onChange={(e) => (setText(e.target.value.replace(/[^\d]/g, "")), setError(null))}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.currentTarget.blur();
            else if (e.key === "Escape") (setText(String(settings.geofenceMetres)), setError(null));
          }}
          className={cn(INPUT, "pr-[58px] text-right", NUM, error && "border-bz-red-mark hover:border-bz-red-mark focus:border-bz-red-mark")}
        />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11.5px] text-bz-text-soft">metres</span>
      </label>
    </SettingRow>
  );
}

export function ModulesPlace() {
  const { toast, show, dismiss } = useToast();
  const modules = useStore(modulesStore);
  const [pick, setPick] = React.useState<Show>("all");
  const on = (k: ModuleKey) => modules.find((m) => m.key === k)?.on ?? false;
  const nameOf = (k: ModuleKey) => modules.find((m) => m.key === k)?.name ?? k;
  const list = (ks: ModuleKey[]) => and(ks.map(nameOf));

  const set = (k: ModuleKey, v: boolean) => {
    modulesStore.set((ms) => ms.map((m) => (m.key === k ? { ...m, on: v } : m)));
    logEvent(RECORD, `switched ${v ? "on" : "off"} ${nameOf(k)}`);
    const missing = v ? (NEEDS[k]?.keys ?? []).filter((d) => !on(d)) : [];
    const users = !v ? (Object.keys(NEEDS) as ModuleKey[]).filter((m) => on(m) && NEEDS[m]!.keys.includes(k)) : [];
    const tabs = PAGES[k];
    if (missing.length) {
      show("info", `${nameOf(k)} needs ${list(missing)}.`, {
        label: `Switch ${missing.length > 1 ? "them" : "it"} on`,
        run: () => {
          modulesStore.set((ms) => ms.map((m) => (missing.includes(m.key) ? { ...m, on: true } : m)));
          missing.forEach((d) => logEvent(RECORD, `switched on ${nameOf(d)}`));
        },
      });
    } else if (users.length) {
      show("info", `${nameOf(k)} is off. ${list(users)} ${users.length > 1 ? "rely" : "relies"} on it.`, {
        label: "Undo",
        run: () => {
          modulesStore.set((ms) => ms.map((m) => (m.key === k ? { ...m, on: true } : m)));
          logEvent(RECORD, `switched on ${nameOf(k)}`);
        },
      });
    } else {
      show("success", tabs ? `${nameOf(k)} is ${v ? "on" : "off"}. ${and(tabs)} ${tabs.length > 1 ? "are" : "is"} ${v ? "back" : "hidden"}.` : `${nameOf(k)} is ${v ? "on" : "off"}.`);
    }
  };

  const rows: Row[] = modules.map((m) => ({ id: m.key, name: m.name, blurb: m.blurb, on: m.on }));
  const onCount = rows.filter((r) => r.on).length;
  const offCount = rows.length - onCount;
  // A view with nothing in it stands down: the last module switched off leaves "On" empty.
  const filter: Show = (pick === "on" && onCount === 0) || (pick === "off" && offCount === 0) ? "all" : pick;
  const shown = rows.filter((r) => filter === "all" || (filter === "on") === r.on);
  /** The modules this one needs that are off — only while it is on itself. */
  const broken = (m: Row) => (m.on ? (NEEDS[m.id]?.keys ?? []).filter((d) => !on(d)) : []);
  /** The row's tooltip: what the module is, what it needs, what it works with, which places it owns. */
  const tip = (m: Row) => {
    const need = NEEDS[m.id];
    const use = USES[m.id];
    const tabs = PAGES[m.id];
    return [m.blurb, need && `Needs ${list(need.keys)}`, use && `Works with ${list(use.keys)}`, tabs && `Off hides ${and(tabs)}`].filter(Boolean).join(". ") + ".";
  };

  const group = (g: (typeof GROUPS)[number]) => {
    const items = g.keys.map((k) => shown.find((r) => r.id === k)).filter((r): r is Row => !!r);
    if (!items.length) return null;
    return (
      <Panel key={g.label} title={g.label} flush right={<span className={cn("mr-1.5 text-[11px] text-bz-text-soft", NUM)}>{`${g.keys.filter(on).length} of ${g.keys.length} on`}</span>}>
        {items.map((m) => {
          const off = broken(m);
          const need = NEEDS[m.id];
          return (
            <SettingRow
              key={m.id}
              label={m.name}
              quiet={!m.on}
              title={tip(m)}
              sub={
                off.length > 0 ? (
                  <span className="inline-flex max-w-full items-start gap-1.5 text-bz-amber-ink" title={need?.why}>
                    <TriangleAlert size={12} className="mt-[2px] shrink-0" />
                    <span className="min-w-0">
                      Needs {list(off)} — {off.length > 1 ? "they are" : "it is"} off
                    </span>
                  </span>
                ) : need ? (
                  <span title={need.why}>Needs {list(need.keys)}</span>
                ) : undefined
              }
            >
              <Switch on={m.on} onChange={(v) => set(m.id, v)} label={`${m.name} ${m.on ? "on" : "off"}`} />
            </SettingRow>
          );
        })}
      </Panel>
    );
  };

  const field = (
    <Panel key="field" title="Field" flush>
      <RadiusRow show={show} />
    </Panel>
  );
  const first = GROUPS.filter((g) => FIRST_COLUMN.includes(g.label));
  const second = GROUPS.filter((g) => !FIRST_COLUMN.includes(g.label));

  return (
    <SfShell current="setup:modules">
      <div className="h-full overflow-y-auto px-4 pb-8 [scrollbar-width:thin] md:px-6">
        <div className="flex max-w-[1120px] flex-col gap-3">
          <PillTabs<Show>
            className="self-start"
            value={filter}
            onChange={setPick}
            options={[
              { value: "all", label: "All" },
              { value: "on", label: "On", count: onCount },
              { value: "off", label: "Off", count: offCount },
            ]}
          />
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {/* The radius belongs with the field modules, so it follows their group. */}
            <div className={COLUMN}>
              {group(first[0])}
              {field}
              {first.slice(1).map((g) => group(g))}
            </div>
            <div className={COLUMN}>{second.map((g) => group(g))}</div>
            <Panel flush className="lg:col-span-2">
              <SfActivity ids={[RECORD]} />
              <SfNoteFoot id={RECORD} />
            </Panel>
          </div>
        </div>
      </div>
      <ToastHost toast={toast} onDismiss={dismiss} />
    </SfShell>
  );
}
