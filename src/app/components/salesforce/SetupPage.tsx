import * as React from "react";
import { Navigate, useParams } from "react-router";
import { sfPath } from "./shell";
import { SETUP_TABS } from "./setup-frame";
import type { SetupTab } from "./setup-frame";
import { ModulesTab } from "./setup-modules";
import { TypesTab } from "./setup-types";
import { PlaybooksTab } from "./setup-playbooks";
import { PortalTab } from "./setup-portal";

// ════════════════════════════════════════════════════════════════════════════
// SETUP — the rules that shape Sales force for one tenant
//
// modules · customer types · playbooks · portal. `/setup` is Modules; each
// other tab has its own URL (`/setup/types`…), and a record inside a tab opens
// with `?id=`. Each tab lives in its own `setup-*.tsx`.
// ════════════════════════════════════════════════════════════════════════════

export function SetupPage() {
  const { tab } = useParams();
  if (tab && !SETUP_TABS.includes(tab as SetupTab)) return <Navigate to={sfPath("setup")} replace />;
  const t = (tab ?? "modules") as SetupTab;
  if (t === "types") return <TypesTab />;
  if (t === "playbooks") return <PlaybooksTab />;
  if (t === "portal") return <PortalTab />;
  return <ModulesTab />;
}

export const SETUP_ROUTES = [
  { path: "design/salesforce/setup", Component: SetupPage },
  { path: "design/salesforce/setup/:tab", Component: SetupPage },
];
