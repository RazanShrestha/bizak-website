import * as React from "react";
import { cn } from "../ui/utils";
import { Switch, ToastHost, useToast } from "../sales/bzw";
import { useStore } from "../sales/store";
import type { ModuleKey } from "./data";
import { modulesStore } from "./store";
import { Dot, PageIntro } from "./ui";
import { RecordActivity, RecordNoteFoot, logChange } from "./network-log";
import { SetupFrame } from "./setup-frame";

// ════════════════════════════════════════════════════════════════════════════
// SETUP · MODULES — switch parts of Sales force on and off for this tenant
//
// The switch is real: the shell reads modulesStore, so a module switched off
// takes its pages out of the nav at once. Dependencies are stated, not
// enforced — switching the Orders hub off while the portal is on is allowed,
// and both rows say what that means.
// ════════════════════════════════════════════════════════════════════════════

const GROUPS: { label: string; keys: ModuleKey[] }[] = [
  { label: "Field and orders", keys: ["field", "orders"] },
  { label: "Channels", keys: ["dealer-portal", "retailer-app", "secondary", "van-sales"] },
  { label: "Growth", keys: ["schemes", "campaigns", "branding", "events"] },
  { label: "Money and team", keys: ["claims", "targets", "expenses"] },
];

/** The pages a module owns in the Sales force menu (shell.tsx NAV). */
const PAGES: Partial<Record<ModuleKey, string>> = {
  field: "Today, Plan and Visits",
  orders: "Orders",
  schemes: "Schemes",
  campaigns: "Campaigns",
  branding: "Branding",
  events: "Events",
  claims: "Claims",
  targets: "Targets",
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

export function ModulesTab() {
  const modules = useStore(modulesStore);
  const { toast, show, dismiss } = useToast();
  const on = (k: ModuleKey) => modules.find((m) => m.key === k)?.on ?? false;
  const nameOf = (k: ModuleKey) => modules.find((m) => m.key === k)?.name ?? k;
  const list = (ks: ModuleKey[]) => {
    const names = ks.map(nameOf);
    return names.length > 1 ? `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}` : names[0];
  };

  const set = (k: ModuleKey, v: boolean) => {
    modulesStore.set((ms) => ms.map((m) => (m.key === k ? { ...m, on: v } : m)));
    logChange("setup:modules", `switched ${v ? "on" : "off"} ${nameOf(k)}`);
    const missing = v ? (NEEDS[k]?.keys ?? []).filter((d) => !on(d)) : [];
    const users = !v ? (Object.keys(NEEDS) as ModuleKey[]).filter((m) => on(m) && NEEDS[m]!.keys.includes(k)) : [];
    if (missing.length) {
      show("info", `${nameOf(k)} needs ${list(missing)}.`, {
        label: `Switch ${missing.length > 1 ? "them" : "it"} on`,
        run: () => {
          modulesStore.set((ms) => ms.map((m) => (missing.includes(m.key) ? { ...m, on: true } : m)));
          missing.forEach((d) => logChange("setup:modules", `switched on ${nameOf(d)}`));
        },
      });
    } else if (users.length) {
      show("info", `${nameOf(k)} is off. ${list(users)} ${users.length > 1 ? "rely" : "relies"} on it.`, { label: "Undo", run: () => modulesStore.set((ms) => ms.map((m) => (m.key === k ? { ...m, on: true } : m))) });
    } else {
      show("success", PAGES[k] ? `${nameOf(k)} is ${v ? "on and back in" : "off and out of"} the menu.` : `${nameOf(k)} is ${v ? "on" : "off"}.`);
    }
  };

  const onCount = modules.filter((m) => m.on).length;

  return (
    <SetupFrame tab="modules" width="narrow">
      <PageIntro>
        Switch on only what your team uses. A module that is off leaves the menu, the rep app and the portal. {onCount} of {modules.length} are on.
      </PageIntro>

      {GROUPS.map((g) => (
        <section key={g.label} className="mt-10 first-of-type:mt-0">
          <p className="m-0 mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-bz-text-soft">{g.label}</p>
          <ul className="m-0 list-none divide-y divide-bz-line-soft border-y border-bz-line-soft p-0">
            {g.keys.map((k) => {
              const m = modules.find((x) => x.key === k);
              if (!m) return null;
              const need = NEEDS[k];
              const use = USES[k];
              const broken = m.on && need ? need.keys.filter((d) => !on(d)) : [];
              return (
                <li key={k} className="flex items-start gap-4 px-1 py-4">
                  <div className="min-w-0 flex-1">
                    <p className={cn("m-0 text-[12.5px] font-medium", m.on ? "text-bz-text" : "text-bz-text-muted")}>{m.name}</p>
                    <p className="m-0 mt-0.5 text-[11px] text-bz-text-soft">{m.blurb}</p>
                    {broken.length > 0 ? (
                      <Dot tone="warn" className="mt-1.5 whitespace-normal text-[11px]">
                        {list(broken)} {broken.length > 1 ? "are" : "is"} off — {need!.why.charAt(0).toLowerCase() + need!.why.slice(1)}
                      </Dot>
                    ) : (
                      (need || use || PAGES[k]) && (
                        <p className="m-0 mt-1.5 text-[10.5px] leading-relaxed text-bz-text-soft">
                          {need && <>Needs {list(need.keys)}. </>}
                          {use && <>Works with {list(use.keys)}. </>}
                          {PAGES[k] && <>Off hides {PAGES[k]}.</>}
                        </p>
                      )
                    )}
                  </div>
                  <span className="pt-0.5">
                    <Switch on={m.on} onChange={(v) => set(k, v)} label={`${m.name} ${m.on ? "on" : "off"}`} />
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      <RecordActivity subject="setup:modules" className="mt-12" />
      <RecordNoteFoot subject="setup:modules" inline />
      <ToastHost toast={toast} onDismiss={dismiss} />
    </SetupFrame>
  );
}
