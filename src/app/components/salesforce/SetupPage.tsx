import { Navigate, useNavigate, useParams, useSearchParams } from "react-router";
import { isSetupKind, setupPath } from "./setup-frame";
import { TypesPlace } from "./setup-types";
import { PlaybooksPlace } from "./setup-playbooks";
import { ModulesPlace } from "./setup-modules";
import { PortalPlace } from "./setup-portal";
import { DataPlace } from "./setup-data";

// ════════════════════════════════════════════════════════════════════════════
// SALES FORCE · SETUP — the rules that shape the module for one tenant
//
// `/design/salesforce/setup[/:kind[/:no]]`, ONE component for every URL:
//   setup                  → the first place (Customer types)
//   setup/:kind            → that place
//   setup/:kind/new        → a list place's form, empty
//   setup/:kind/:no        → a list place's record, in the sheet
// Setup is an area of Sales force — the gear in the top bar, the title's
// chevron — so each place draws itself in `SfShell`. Customer types and
// Playbooks are lists of records; Modules, Dealer portal and Prototype data
// are settings.
// ════════════════════════════════════════════════════════════════════════════

export function SetupPage() {
  const { kind, no } = useParams();
  const [search] = useSearchParams();
  const navigate = useNavigate();
  if (!isSetupKind(kind)) return <Navigate to={setupPath("types")} replace />;
  // A record used to open with `?id=` (the quick add's "Open" still links that way).
  const legacy = search.get("id");
  if (legacy && !no) return <Navigate to={setupPath(kind, legacy)} replace />;
  const open = (id: string | null) => navigate(setupPath(kind, id));
  if (kind === "types") return <TypesPlace openId={no ?? null} open={open} />;
  if (kind === "playbooks") return <PlaybooksPlace openId={no ?? null} open={open} />;
  if (kind === "modules") return <ModulesPlace />;
  if (kind === "portal") return <PortalPlace />;
  return <DataPlace />;
}

export const SETUP_ROUTES = [
  { path: "design/salesforce/setup", Component: SetupPage },
  { path: "design/salesforce/setup/:kind", Component: SetupPage },
  { path: "design/salesforce/setup/:kind/:no", Component: SetupPage },
];
