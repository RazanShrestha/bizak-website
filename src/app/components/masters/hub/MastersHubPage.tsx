import * as React from "react";
import { Navigate, useNavigate, useParams, useSearchParams } from "react-router";
import { AppFrame } from "../../sales/AppFrame";
import { ToastHost, useToast } from "../../sales/bzw";
import { MastersHub } from "../kit";
import type { MasterKindConfig } from "../kit";
import { MASTERS_TODAY } from "../seed/currencies";
import { useCurrencyKind } from "./kinds/currency";
import { useDepartmentKind } from "./kinds/department";
import { useLocationKind } from "./kinds/location";
import { useTaxKind } from "./kinds/tax";
import { useUnitKind } from "./kinds/unit";
import { useKindRead } from "./shared";
import { useMastersChannel } from "../jump/channel";
import type { HubCtx, KindBundle, Perm } from "./shared";

// ════════════════════════════════════════════════════════════════════════════
// MASTERS HUB PAGE — `/design/masters[/:kind[/:no]]` (spec §2, §4, §9.1)
//
// Every tier-2 and tier-3 master in one page under Setup (the rail's
// Settings glyph). ONE component serves all its URLs (bzw trap 18):
//   masters                → the last kind this reader used (else Currencies)
//   masters/:kind          → that kind's table
//   masters/:kind/new      → tier 2: the create sheet · tier 3: the add row focused
//   masters/:kind/:id      → tier 2: that record's sheet · tier 3: the row current
// Kept on every link: ?org= and the mockup's state switches. The table's
// search and statline pick live in ?q= / ?pick= (trap 30).
//
// Mockup switches (per kind in the URL): ?slow=1 first read · ?fail=1 failed
// read + Retry · ?empty=1 a tenant with none · ?perm=read view only ·
// ?perm=none no access (the kind leaves the list).
//
// Kinds not redesigned yet (D-12) are listed and open their current page.
// ════════════════════════════════════════════════════════════════════════════

const LAST_KIND = "view.masters-hub";
const TIER2 = new Set(["currencies", "taxes", "locations"]);

/** Not redesigned in v1 (D-12): listed, opening their current page. */
const LEGACY: MasterKindConfig[] = [
  { key: "categories", label: "Categories", group: "Items", count: 3, legacyHref: "/app/main/user-management/master/item-category/list" },
  { key: "attributes", label: "Attributes", group: "Items", legacyHref: "/app/main/user-management/master/item-attribute/list" },
  { key: "brands", label: "Brands", group: "Items", legacyHref: "/app/main/user-management/master/brand/list" },
  { key: "price-levels", label: "Price levels", group: "Money", legacyHref: "/design/master-record" },
  { key: "payment-terms", label: "Payment terms", group: "Money", legacyHref: "/design/master-record" },
  { key: "classes", label: "Classes", group: "Organisation", legacyHref: "/app/main/user-management/master/class/list" },
];

export function MastersHubPage() {
  const { kind } = useParams();
  if (!kind) {
    let last = "currencies";
    try {
      last = localStorage.getItem(LAST_KIND) ?? last;
    } catch {
      /* private window: start at Currencies */
    }
    return <Navigate to={`/design/masters/${last}${window.location.search}`} replace />;
  }
  return (
    <AppFrame title="Masters" rail="Settings">
      <HubBody kind={kind} />
    </AppFrame>
  );
}

function HubBody({ kind }: { kind: string }) {
  const { no } = useParams();
  const navigate = useNavigate();
  const [search, setSearch] = useSearchParams();
  const { toast, show, dismiss } = useToast();
  // A currency page opened from a document (a new tab) reads the opener's rates.
  useMastersChannel();

  React.useEffect(() => {
    try {
      localStorage.setItem(LAST_KIND, kind);
    } catch {
      /* per-reader convenience only */
    }
  }, [kind]);

  // Links keep ?org= and the state switches; a kind change drops the table's own ?q= / ?pick=.
  const keep = (dropQuery: boolean) => {
    const p = new URLSearchParams(search);
    if (dropQuery) (p.delete("q"), p.delete("pick"));
    const s = p.toString();
    return s ? `?${s}` : "";
  };
  const open = (id: string | null) => navigate(`/design/masters/${kind}${id ? `/${encodeURIComponent(id)}` : ""}${keep(false)}`);
  const permParam = search.get("perm");
  const perm: Perm = permParam === "read" || permParam === "none" ? permParam : "full";
  const read = useKindRead(kind, search);
  // Tier 2: the record whose sheet is open. Tier 3: the row to mark current (no sheet).
  const openId = no ?? null;

  // Each kind builds from the same context; only the active one carries the URL's rights and read state.
  const base = { show, today: MASTERS_TODAY, open, openId: null, perm: "full" as Perm, read: { loading: false, failed: false, empty: false, retry: () => {} } };
  const ctxFor = (k: string): HubCtx => (k === kind ? { ...base, perm, read, openId } : base);
  const units = useUnitKind(ctxFor("units"));
  const currencies = useCurrencyKind(ctxFor("currencies"));
  const taxes = useTaxKind(ctxFor("taxes"));
  const departments = useDepartmentKind(ctxFor("departments"));
  const locations = useLocationKind(ctxFor("locations"));
  const bundles: Record<string, KindBundle> = { units, currencies, taxes, departments, locations };

  const kinds: MasterKindConfig<any>[] = [
    units.config,
    ...LEGACY.filter((k) => k.group === "Items"),
    currencies.config,
    taxes.config,
    ...LEGACY.filter((k) => k.group === "Money"),
    locations.config,
    departments.config,
    ...LEGACY.filter((k) => k.group === "Organisation"),
  ];
  const active = bundles[kind];

  // Tier 3 `…/new` puts the cursor in the add row (the hub's N does the same).
  React.useEffect(() => {
    if (!active || TIER2.has(kind) || no !== "new") return;
    const id = window.setTimeout(() => {
      document.querySelector<HTMLElement>('[role="grid"] [data-cell^="ghost|"]')?.click();
    }, 50);
    return () => window.clearTimeout(id);
  }, [kind, no, !!active]);

  if (!active) return <Navigate to={`/design/masters/currencies${keep(true)}`} replace />;

  return (
    <>
      <MastersHub
        kinds={kinds}
        active={kind}
        onPick={(k) => {
          if (!k.legacyHref) return navigate(`/design/masters/${k.key}${keep(true)}`);
          if (k.legacyHref.startsWith("/design/")) return navigate(k.legacyHref);
          show("info", `${k.label} open their current page (not redesigned yet).`);
        }}
        openId={openId}
        onOpen={open}
        sheet={active.sheet}
        query={{ q: search.get("q") ?? "", pick: search.get("pick") }}
        onQuery={({ q, pick }) => {
          const p = new URLSearchParams(search);
          q ? p.set("q", q) : p.delete("q");
          pick ? p.set("pick", pick) : p.delete("pick");
          setSearch(p, { replace: true });
        }}
      />
      {active.overlays}
      <ToastHost toast={toast} onDismiss={dismiss} />
    </>
  );
}
