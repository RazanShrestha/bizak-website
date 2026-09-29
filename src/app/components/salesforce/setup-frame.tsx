import * as React from "react";
import { useNavigate, useSearchParams } from "react-router";
import { cn } from "../ui/utils";
import { BTN, GHOST } from "../sales/bzw";
import { useStore } from "../sales/store";
import { playbooksStore, typesStore } from "./store";
import { SfShell, sfPath } from "./shell";
import { Page, TextTabs } from "./ui";

// ════════════════════════════════════════════════════════════════════════════
// SETUP · frame and the one link rule between types and playbooks
//
// Setup is where a tenant shapes the module: which parts are on, what each
// customer type gets, what a visit holds, what the portal offers. The four
// tabs share this frame (TextTabs synced to `/setup/:tab`); a record opens in
// the panel with `?id=` so the URL can be sent.
//
// A type follows ONE playbook. The link is stored twice in the seed
// (CustomerType.playbookId and Playbook.forTypeIds), so every write goes
// through `linkPlaybook` and the two can never disagree.
// ════════════════════════════════════════════════════════════════════════════

export type SetupTab = "modules" | "types" | "playbooks" | "portal";
export const SETUP_TABS: SetupTab[] = ["modules", "types", "playbooks", "portal"];

export function SetupFrame({ tab, panel, children, width = "wide" }: { tab: SetupTab; panel?: React.ReactNode; children: React.ReactNode; width?: "narrow" | "wide" }) {
  const navigate = useNavigate();
  const types = useStore(typesStore);
  const playbooks = useStore(playbooksStore);
  return (
    <SfShell page="setup" panel={panel}>
      <Page width={width}>
        <TextTabs<SetupTab>
          className="mb-8"
          value={tab}
          onChange={(v) => navigate(sfPath(v === "modules" ? "setup" : `setup/${v}`))}
          options={[
            { value: "modules", label: "Modules" },
            { value: "types", label: "Customer types", count: types.length },
            { value: "playbooks", label: "Playbooks", count: playbooks.length },
            { value: "portal", label: "Portal" },
          ]}
        />
        {children}
      </Page>
    </SfShell>
  );
}

/** The record open in a setup tab's panel (`?id=`). */
export function useSetupSelection(): [string | null, (id: string | null) => void] {
  const [search, setSearch] = useSearchParams();
  const id = search.get("id");
  const set = React.useCallback(
    (v: string | null) => {
      const next = new URLSearchParams(search);
      if (v) next.set("id", v);
      else next.delete("id");
      setSearch(next);
    },
    [search, setSearch],
  );
  return [id, set];
}

/** Put `typeIds` on playbook `pbId` (or on none), taking them off any other playbook. */
export function linkPlaybook(typeIds: string[], pbId: string | null) {
  playbooksStore.set((ps) =>
    ps.map((p) => {
      const rest = p.forTypeIds.filter((t) => !typeIds.includes(t));
      return p.id === pbId ? { ...p, forTypeIds: [...rest, ...typeIds] } : rest.length === p.forTypeIds.length ? p : { ...p, forTypeIds: rest };
    }),
  );
  typesStore.set((ts) => ts.map((t) => (typeIds.includes(t.id) ? { ...t, playbookId: pbId } : t)));
}

/** The save bar of a setup editor: shown only while there is something to save. */
export function SaveBar({ note, error, onDiscard, onSave, saveLabel = "Save", className }: { note?: React.ReactNode; error?: string | null; onDiscard: () => void; onSave: () => void; saveLabel?: string; className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <span className={cn("min-w-0 flex-1 text-[11.5px]", error ? "text-bz-red" : "text-bz-text-muted")}>{error ?? note ?? "Unsaved changes"}</span>
      <button type="button" className={GHOST} onClick={onDiscard}>
        Discard
      </button>
      <button type="button" className={BTN} onClick={onSave} disabled={!!error}>
        {saveLabel}
      </button>
    </div>
  );
}

/** One labelled block of a setup form: 13px title, a soft hint, then the controls. */
export function FormBlock({ title, hint, children, className }: { title: string; hint?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("border-t border-bz-line-soft pt-6 first:border-t-0 first:pt-0", className)}>
      <h3 className="m-0 text-[13px] font-semibold text-bz-text">{title}</h3>
      {hint && <p className="m-0 mt-1 text-[11px] leading-relaxed text-bz-text-soft">{hint}</p>}
      <div className="mt-3">{children}</div>
    </section>
  );
}
