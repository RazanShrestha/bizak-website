import * as React from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router";
import {
  Search,
  X,
  Check,
  MoreHorizontal,
  Loader2,
  SearchX,
  MapPin,
  Users,
  ChevronRight,
  ArrowLeft,
  Ban,
  Undo2,
  CircleSlash,
} from "lucide-react";
import { AppShell } from "./SalesOrderListDesignPage";
import { cn } from "./ui/utils";

// ════════════════════════════════════════════════════════════════════════════
// PARTY · ROUTE MAPPING  (assign customers to one delivery route, commit once)
//
// Judgement:
//   • Primary action = curate the party set for ONE chosen route, then commit.
//   • Centre of gravity = the two peer lists + the commit bar. A route is the
//     gate; the party set is the work; Save is the terminal act.
//
// Shape (invented for this page — not a table, form, or inspector):
//   1. Header band   identity + live status + overflow (reset / clear parties)
//   2. Mapping spine a full-width directional strip:  Route → N parties in set
//   3. Dual panes    Routes (single-select, radio) feed Parties (multi-select,
//                    fire-accented checkboxes + tri-state select-all). Choosing
//                    a route LOADS its mapped parties, pre-marks them, and
//                    re-sorts selected-first.
//   4. Docked footer the single commit: Save mapping (+ Reset). Lives in the
//                    AppShell overlay slot so it stays put while content scrolls.
//
// Every count (spine / status badge / select-all / footer) is derived live from
// the party set so they always reconcile.
// ════════════════════════════════════════════════════════════════════════════

const NUM = "tabular-nums";

// ── Data model ────────────────────────────────────────────────────────────────
type RouteRec = {
  id: string;
  name: string;
  code: string;
  mappedPartyIds: string[];
  locked?: boolean;
};
type PartySeed = { id: string; name: string; code: string; city: string };
type Party = PartySeed & { selected: boolean };
type ToastState = { kind: "success" | "warning"; message: string; id: number } | null;

const PARTIES_SEED: PartySeed[] = [
  { id: "p1", name: "Sagarmatha Traders", code: "C-1042", city: "Kathmandu" },
  { id: "p2", name: "Himalayan Distributors", code: "C-1043", city: "Kathmandu" },
  { id: "p3", name: "Annapurna Stores", code: "C-1051", city: "Pokhara" },
  { id: "p4", name: "Everest Wholesale", code: "C-1044", city: "Kathmandu" },
  { id: "p5", name: "Kanchanjunga Mart", code: "C-1067", city: "Bhaktapur" },
  { id: "p6", name: "Pashupati Suppliers", code: "C-1045", city: "Kathmandu" },
  { id: "p7", name: "Bagmati Trading Co.", code: "C-1058", city: "Lalitpur" },
  { id: "p8", name: "Gandaki Enterprises", code: "C-1052", city: "Pokhara" },
  { id: "p9", name: "Lumbini Retail", code: "C-1079", city: "Butwal" },
  { id: "p10", name: "Janaki General Store", code: "C-1088", city: "Janakpur" },
  { id: "p11", name: "Manakamana Mart", code: "C-1073", city: "Chitwan" },
  { id: "p12", name: "Tilicho Traders", code: "C-1053", city: "Pokhara" },
  { id: "p13", name: "Macchapuchhre Suppliers", code: "C-1054", city: "Pokhara" },
  { id: "p14", name: "Gosaikunda Wholesale", code: "C-1059", city: "Lalitpur" },
  { id: "p15", name: "Rara Distributors", code: "C-1091", city: "Nepalgunj" },
  { id: "p16", name: "Phewa Mart", code: "C-1055", city: "Pokhara" },
  { id: "p17", name: "Begnas Stores", code: "C-1056", city: "Pokhara" },
  { id: "p18", name: "Seti Trading", code: "C-1095", city: "Dhangadhi" },
  { id: "p19", name: "Karnali Suppliers", code: "C-1092", city: "Nepalgunj" },
  { id: "p20", name: "Koshi Enterprises", code: "C-1081", city: "Biratnagar" },
  { id: "p21", name: "Mechi Retail", code: "C-1083", city: "Dharan" },
  { id: "p22", name: "Narayani Distributors", code: "C-1075", city: "Birgunj" },
  { id: "p23", name: "Trishuli General", code: "C-1046", city: "Kathmandu" },
  { id: "p24", name: "Marsyangdi Traders", code: "C-1074", city: "Chitwan" },
];

const ROUTES: RouteRec[] = [
  { id: "r1", name: "Kathmandu – Ring Road", code: "KTM-RR-01", mappedPartyIds: ["p1", "p2", "p4", "p6", "p23"] },
  { id: "r2", name: "Kathmandu – New Road Core", code: "KTM-NR-02", mappedPartyIds: ["p1", "p6", "p23"] },
  { id: "r3", name: "Lalitpur – Patan Circuit", code: "LAL-PC-03", mappedPartyIds: ["p7", "p14"] },
  { id: "r4", name: "Bhaktapur – Durbar Belt", code: "BKT-DB-04", mappedPartyIds: ["p5"] },
  { id: "r5", name: "Pokhara – Lakeside", code: "PKR-LS-05", mappedPartyIds: ["p3", "p8", "p12", "p13", "p16", "p17"] },
  { id: "r6", name: "Pokhara – Prithvi Highway", code: "PKR-PH-06", mappedPartyIds: ["p3", "p8", "p13"] },
  { id: "r7", name: "Chitwan – Bharatpur", code: "CTW-BP-07", mappedPartyIds: ["p11", "p24"] },
  { id: "r8", name: "Butwal – Highway Corridor", code: "BTL-HC-08", mappedPartyIds: ["p9"] },
  { id: "r9", name: "Biratnagar – Industrial", code: "BRT-IN-09", mappedPartyIds: ["p20", "p21"] },
  { id: "r10", name: "Birgunj – Border Trade", code: "BRG-BT-10", mappedPartyIds: ["p22"] },
  { id: "r11", name: "Nepalgunj – Mid-West", code: "NPG-MW-11", mappedPartyIds: ["p15", "p19"], locked: true },
  { id: "r12", name: "Janakpur – Eastern Terai", code: "JNK-ET-12", mappedPartyIds: [] },
];

// ════════════════════════════════════════════════════════════════════════════
// ATOMS
// ════════════════════════════════════════════════════════════════════════════

// Non-interactive checkbox VISUAL (the clickable element wraps it as .group, so
// full rows / the bulk button stay single buttons — no nested <button>s).
function CheckBox({
  checked,
  indeterminate = false,
}: {
  checked: boolean;
  indeterminate?: boolean;
}) {
  const filled = checked || indeterminate;
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-[15px] shrink-0 items-center justify-center rounded-bz-sm border transition-colors",
        filled
          ? "border-bz-fire bg-bz-fire text-bz-olive"
          : "border-bz-line bg-bz-surface group-hover:border-bz-text",
      )}
    >
      {indeterminate ? (
        <span className="h-[2px] w-2 rounded-full bg-bz-olive" />
      ) : checked ? (
        <Check size={11} strokeWidth={3.5} />
      ) : null}
    </span>
  );
}

function RouteRadio({ active }: { active: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-4 shrink-0 items-center justify-center rounded-bz-pill border transition-colors",
        active ? "border-bz-fire bg-bz-fire" : "border-bz-line bg-bz-surface group-hover:border-bz-text",
      )}
    >
      {active && <span className="size-1.5 rounded-bz-pill bg-bz-olive" />}
    </span>
  );
}

function SearchField({
  value,
  onChange,
  placeholder,
  ariaLabel,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  ariaLabel: string;
}) {
  return (
    <div className="relative">
      <Search size={13} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-bz-text-muted" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className="h-9 w-full rounded-bz-md border border-bz-line-soft bg-bz-paper py-2 pl-8 pr-8 text-[12.5px] text-bz-text outline-none placeholder:text-bz-text-soft focus:border-bz-text"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="absolute right-2 top-1/2 flex size-5 -translate-y-1/2 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-paper-warm"
        >
          <X size={11} />
        </button>
      )}
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  sub,
}: {
  icon: React.ElementType;
  title: string;
  sub: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <span className="flex size-9 items-center justify-center rounded-bz-md bg-bz-paper-warm text-bz-text-muted">
        <Icon size={15} strokeWidth={1.7} />
      </span>
      <p className="mt-3 text-[12.5px] font-semibold text-bz-text">{title}</p>
      <p className="mt-1 max-w-[260px] text-[11.5px] leading-relaxed text-bz-text-muted">{sub}</p>
    </div>
  );
}

function PaneCaptionRow({
  icon: Icon,
  title,
  sub,
}: {
  icon: React.ElementType;
  title: string;
  sub: React.ReactNode;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <span className="flex size-6 shrink-0 items-center justify-center rounded-bz-sm bg-bz-paper-warm text-bz-text-muted">
        <Icon size={13} />
      </span>
      <div className="min-w-0">
        <p className="text-[12.5px] font-semibold text-bz-text">{title}</p>
        <p className="truncate text-[10.5px] text-bz-text-soft">{sub}</p>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// MAPPING SPINE  — the directional summary:  Route  →  N parties in set
// ════════════════════════════════════════════════════════════════════════════

function MappingSpine({
  route,
  selectedCount,
  total,
  loading,
}: {
  route: RouteRec | null;
  selectedCount: number;
  total: number;
  loading: boolean;
}) {
  return (
    <div className="flex flex-col gap-2.5 rounded-bz-lg border border-bz-line-soft bg-bz-surface p-3 sm:flex-row sm:items-center">
      {/* Route side */}
      <div className="flex min-w-0 flex-1 items-center gap-2.5 rounded-bz-md bg-bz-paper-warm/60 px-3 py-2">
        <span
          className={cn(
            "flex size-7 shrink-0 items-center justify-center rounded-bz-md",
            route ? "bg-bz-fire text-bz-olive" : "bg-bz-surface text-bz-text-soft",
          )}
        >
          <MapPin size={14} />
        </span>
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-bz-text-soft">Route</p>
          <p className={cn("truncate text-[13px] font-semibold", route ? "text-bz-text" : "text-bz-text-soft")}>
            {route ? route.name : "No route selected"}
          </p>
        </div>
        {route?.locked && (
          <span className="ml-auto shrink-0 rounded-bz-sm bg-bz-paper-warm px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-[0.06em] text-bz-text-muted">
            Locked
          </span>
        )}
      </div>

      {/* Connector — points down on mobile, right on desktop */}
      <span className="mx-auto flex size-7 shrink-0 items-center justify-center rounded-bz-pill border border-bz-line-soft bg-bz-paper text-bz-text-muted">
        <ChevronRight size={14} className="rotate-90 sm:rotate-0" />
      </span>

      {/* Parties side */}
      <div className="flex min-w-0 flex-1 items-center gap-2.5 rounded-bz-md bg-bz-paper-warm/60 px-3 py-2">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-bz-md bg-bz-surface text-bz-text-muted">
          <Users size={14} />
        </span>
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-bz-text-soft">Parties in set</p>
          <p className={cn("text-[13px] font-semibold text-bz-text", NUM)}>
            {loading ? (
              <span className="text-bz-text-soft">Loading…</span>
            ) : route ? (
              <>
                {selectedCount} <span className="font-medium text-bz-text-soft">of {total}</span>
              </>
            ) : (
              <span className="text-bz-text-soft">—</span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ROUTE PANE  — searchable single-select list (the gate)
// ════════════════════════════════════════════════════════════════════════════

function RoutePane({
  search,
  onSearch,
  selectedId,
  onSelect,
}: {
  search: string;
  onSearch: (v: string) => void;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? ROUTES.filter((r) => r.name.toLowerCase().includes(q)) : ROUTES;
  }, [search]);

  return (
    <section className="flex flex-col overflow-hidden rounded-bz-lg border border-bz-line-soft bg-bz-surface lg:self-start">
      <div className="flex items-center justify-between gap-3 border-b border-bz-line-soft px-3.5 py-3">
        <PaneCaptionRow icon={MapPin} title="Routes" sub="Pick one to load its parties" />
        <span className={cn("shrink-0 rounded-bz-pill bg-bz-paper-warm px-2 py-0.5 text-[10.5px] font-semibold text-bz-text-muted", NUM)}>
          {filtered.length}/{ROUTES.length}
        </span>
      </div>
      <div className="border-b border-bz-line-soft p-2.5">
        <SearchField value={search} onChange={onSearch} placeholder="Search routes…" ariaLabel="Search routes" />
      </div>
      <div className="min-h-[260px] max-h-[44vh] overflow-y-auto p-1.5 sm:max-h-[52vh]">
        {filtered.length === 0 ? (
          <EmptyState icon={SearchX} title="No routes found" sub={`Nothing matches “${search}”. Clear the search to see every route.`} />
        ) : (
          <ul role="radiogroup" aria-label="Routes" className="flex flex-col gap-1">
            {filtered.map((r) => (
              <RouteRow key={r.id} route={r} active={r.id === selectedId} onSelect={() => onSelect(r.id)} />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function RouteRow({ route, active, onSelect }: { route: RouteRec; active: boolean; onSelect: () => void }) {
  return (
    <li>
      <button
        type="button"
        role="radio"
        aria-checked={active}
        onClick={onSelect}
        className={cn(
          "group relative flex w-full items-center gap-2.5 rounded-bz-md border px-2.5 py-2 text-left transition-colors",
          active
            ? "border-bz-fire/60 bg-bz-fire/[0.08]"
            : "border-transparent hover:border-bz-line-soft hover:bg-bz-paper-warm/50",
        )}
      >
        {active && <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-bz-pill bg-bz-fire" />}
        <RouteRadio active={active} />
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1.5">
            <span className={cn("truncate text-[12.5px] text-bz-text", active ? "font-semibold" : "font-medium")}>
              {route.name}
            </span>
            {route.locked && (
              <span className="shrink-0 rounded-bz-sm bg-bz-paper-warm px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-[0.06em] text-bz-text-muted">
                Locked
              </span>
            )}
          </span>
          <span className="mt-0.5 flex items-center gap-1.5 text-[10.5px] text-bz-text-soft">
            <span className={NUM}>{route.code}</span>
            <span className="size-0.5 rounded-full bg-bz-text-soft" />
            <span className={NUM}>{route.mappedPartyIds.length} mapped</span>
          </span>
        </span>
      </button>
    </li>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PARTY PANE  — searchable multi-select list + tri-state select-all
// ════════════════════════════════════════════════════════════════════════════

function PartyPane({
  parties,
  search,
  onSearch,
  loading,
  routeSelected,
  routeName,
  selectedCount,
  total,
  allSelected,
  someSelected,
  onToggleAll,
  onToggleParty,
}: {
  parties: Party[];
  search: string;
  onSearch: (v: string) => void;
  loading: boolean;
  routeSelected: boolean;
  routeName: string;
  selectedCount: number;
  total: number;
  allSelected: boolean;
  someSelected: boolean;
  onToggleAll: (on: boolean) => void;
  onToggleParty: (id: string) => void;
}) {
  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? parties.filter((p) => p.name.toLowerCase().includes(q)) : parties;
  }, [parties, search]);

  return (
    <section className="flex flex-col overflow-hidden rounded-bz-lg border border-bz-line-soft bg-bz-surface lg:self-start">
      <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-bz-line-soft px-3.5 py-3">
        <PaneCaptionRow
          icon={Users}
          title="Parties"
          sub={
            routeSelected ? (
              <>
                In the set for <span className="font-medium text-bz-text-muted">{routeName}</span>
              </>
            ) : (
              "Pick a route, or build a set manually"
            )
          }
        />
        {loading ? (
          <span className="inline-flex items-center gap-2 rounded-bz-md border border-bz-line-soft bg-bz-surface px-2.5 py-1.5 text-[11.5px] font-medium text-bz-text-muted">
            <Loader2 size={12} className="animate-spin text-bz-fire" /> Loading…
          </span>
        ) : (
          <button
            type="button"
            role="checkbox"
            aria-checked={someSelected ? "mixed" : allSelected}
            onClick={() => onToggleAll(!allSelected)}
            className="group inline-flex items-center gap-2 rounded-bz-md border border-bz-line-soft bg-bz-surface px-2.5 py-1.5 text-[11.5px] font-medium text-bz-text hover:bg-bz-paper-warm"
          >
            <CheckBox checked={allSelected} indeterminate={someSelected} />
            <span>Select all</span>
            <span className={cn("text-bz-text-muted", NUM)}>· {selectedCount}/{total}</span>
          </button>
        )}
      </div>

      <div className="border-b border-bz-line-soft p-2.5">
        <SearchField value={search} onChange={onSearch} placeholder="Search parties…" ariaLabel="Search parties" />
      </div>

      <div className="min-h-[260px] max-h-[44vh] overflow-y-auto p-1.5 sm:max-h-[52vh]">
        {loading ? (
          <PartySkeleton />
        ) : filtered.length === 0 ? (
          <EmptyState icon={SearchX} title="No parties found" sub={`Nothing matches “${search}”. Clear the search to see every party.`} />
        ) : (
          <>
            {!routeSelected && selectedCount === 0 && search.trim() === "" && (
              <p className="mx-1 mb-1.5 rounded-bz-md bg-bz-paper-warm/60 px-2.5 py-2 text-[11px] leading-relaxed text-bz-text-muted">
                No route selected yet — choose a route on the left to preload its parties, or tick parties to build a set manually.
              </p>
            )}
            <ul className="flex flex-col gap-1">
              {filtered.map((p) => (
                <PartyRow key={p.id} party={p} onToggle={() => onToggleParty(p.id)} />
              ))}
            </ul>
          </>
        )}
      </div>
    </section>
  );
}

function PartyRow({ party, onToggle }: { party: Party; onToggle: () => void }) {
  const on = party.selected;
  return (
    <li>
      <button
        type="button"
        role="checkbox"
        aria-checked={on}
        onClick={onToggle}
        className={cn(
          "group flex w-full items-center gap-2.5 rounded-bz-md border px-2.5 py-2 text-left transition-colors",
          on
            ? "border-bz-fire/40 bg-bz-fire/[0.06]"
            : "border-transparent hover:border-bz-line-soft hover:bg-bz-paper-warm/50",
        )}
      >
        <CheckBox checked={on} />
        <span className="min-w-0 flex-1">
          <span className={cn("block truncate text-[12.5px] text-bz-text", on ? "font-semibold" : "font-medium")}>
            {party.name}
          </span>
          <span className="mt-0.5 flex items-center gap-1.5 text-[10.5px] text-bz-text-soft">
            <span className={NUM}>{party.code}</span>
            <span className="size-0.5 rounded-full bg-bz-text-soft" />
            <span>{party.city}</span>
          </span>
        </span>
      </button>
    </li>
  );
}

function PartySkeleton() {
  return (
    <div className="p-1">
      <div className="mb-2 flex items-center gap-2 px-1.5 text-[11px] text-bz-text-muted">
        <Loader2 size={12} className="animate-spin text-bz-fire" /> Loading parties for this route…
      </div>
      <ul className="flex flex-col gap-1">
        {Array.from({ length: 7 }).map((_, i) => (
          <li key={i} className="flex items-center gap-2.5 rounded-bz-md px-2.5 py-2">
            <span className="size-[15px] shrink-0 animate-pulse rounded-bz-sm bg-bz-paper-warm" />
            <span className="flex-1">
              <span className="block h-2.5 w-1/2 animate-pulse rounded-full bg-bz-paper-warm" />
              <span className="mt-1.5 block h-2 w-1/3 animate-pulse rounded-full bg-bz-paper-warm" />
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// DOCKED FOOTER  (lives in AppShell overlay — the single commit)
// ════════════════════════════════════════════════════════════════════════════

function ActionFooter({
  route,
  selectedCount,
  total,
  submitting,
  onReset,
  onSave,
}: {
  route: RouteRec | null;
  selectedCount: number;
  total: number;
  submitting: boolean;
  onReset: () => void;
  onSave: () => void;
}) {
  return (
    <div className="border-t border-bz-line bg-bz-paper px-4 py-3 shadow-[0_-8px_24px_-18px_rgba(15,20,17,0.25)] md:px-8">
      <div className="mx-auto flex max-w-[1320px] items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            className={cn(
              "flex size-8 shrink-0 items-center justify-center rounded-bz-md",
              route ? "bg-bz-fire text-bz-olive" : "bg-bz-paper-warm text-bz-text-soft",
            )}
          >
            <MapPin size={15} />
          </span>
          <div className="min-w-0">
            {route ? (
              <>
                <p className="truncate text-[12.5px] font-semibold text-bz-text">{route.name}</p>
                <p className="text-[11px] text-bz-text-muted">
                  <span className={cn("font-medium text-bz-text", NUM)}>{selectedCount}</span> of{" "}
                  <span className={NUM}>{total}</span> parties in this mapping
                </p>
              </>
            ) : (
              <>
                <p className="text-[12.5px] font-semibold text-bz-text">No route selected</p>
                <p className="text-[11px] text-bz-text-muted">Choose a route to commit a mapping</p>
              </>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={onReset}
            className="hidden h-9 items-center gap-1.5 rounded-bz-md border border-bz-line bg-bz-surface px-3.5 text-[12.5px] font-medium text-bz-text hover:bg-bz-paper-warm sm:inline-flex"
          >
            <Undo2 size={13} /> Reset
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={submitting}
            className="inline-flex h-9 items-center gap-1.5 rounded-bz-md bg-bz-deep px-4 text-[12.5px] font-semibold text-bz-text-on-dark transition-opacity hover:opacity-95 disabled:opacity-60"
          >
            {submitting ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
            {submitting ? "Saving…" : "Save mapping"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// TOAST  (transient, auto-dismissing — success / warning)
// ════════════════════════════════════════════════════════════════════════════

function Toast({ toast, onDismiss }: { toast: ToastState; onDismiss: () => void }) {
  React.useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(onDismiss, 4000);
    return () => window.clearTimeout(t);
  }, [toast, onDismiss]);

  if (!toast) return null;
  const ok = toast.kind === "success";
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[70] flex justify-center px-4">
      <div className="pointer-events-auto flex items-center gap-3 rounded-bz-lg border border-bz-line-soft bg-bz-surface px-3.5 py-2.5 shadow-[0_18px_44px_-20px_rgba(15,20,17,0.22)]">
        <span className={cn("flex size-7 items-center justify-center rounded-bz-pill", ok ? "bg-bz-fire/[0.22]" : "bg-[#FBE7E5]")}>
          {ok ? <Check size={13} className="text-bz-leaf-deep" /> : <Ban size={12} className="text-[#9A2E29]" />}
        </span>
        <p className="text-[12.5px] font-medium text-bz-text">{toast.message}</p>
        <button
          onClick={onDismiss}
          aria-label="Dismiss"
          className="ml-1 flex size-6 items-center justify-center rounded-bz-sm text-bz-text-muted hover:bg-bz-paper-warm"
        >
          <X size={11} />
        </button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// OVERFLOW MENU  (portal popover — secondary actions)
// ════════════════════════════════════════════════════════════════════════════

function OverflowMenu({ onReset, onClearParties }: { onReset: () => void; onClearParties: () => void }) {
  const btnRef = React.useRef<HTMLButtonElement>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const [open, setOpen] = React.useState(false);
  const [pos, setPos] = React.useState<{ top: number; right: number } | null>(null);

  React.useLayoutEffect(() => {
    if (!open || !btnRef.current) {
      setPos(null);
      return;
    }
    const r = btnRef.current.getBoundingClientRect();
    setPos({ top: r.bottom + 6, right: window.innerWidth - r.right });
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (menuRef.current && !menuRef.current.contains(t) && btnRef.current && !btnRef.current.contains(t)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onScroll = () => setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [open]);

  const item =
    "flex w-full items-center gap-2.5 px-3 py-2 text-left text-[12px] text-bz-text hover:bg-bz-paper-warm";

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="More actions"
        title="More actions"
        className={cn(
          "flex size-9 items-center justify-center rounded-bz-md border bg-bz-surface text-bz-text-muted hover:bg-bz-paper-warm hover:text-bz-text",
          open ? "border-bz-text" : "border-bz-line",
        )}
      >
        <MoreHorizontal size={16} />
      </button>
      {open &&
        pos &&
        createPortal(
          <div
            ref={menuRef}
            style={{ position: "fixed", top: pos.top, right: pos.right }}
            className="z-[80] w-52 overflow-hidden rounded-bz-md border border-bz-line bg-bz-surface py-1 shadow-[0_18px_44px_-20px_rgba(15,20,17,0.22)]"
          >
            <button
              type="button"
              className={item}
              onClick={() => {
                setOpen(false);
                onClearParties();
              }}
            >
              <CircleSlash size={13} className="text-bz-text-muted" /> Clear party selection
            </button>
            <button
              type="button"
              className={item}
              onClick={() => {
                setOpen(false);
                onReset();
              }}
            >
              <Undo2 size={13} className="text-bz-text-muted" /> Reset form
            </button>
          </div>,
          document.body,
        )}
    </>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PAGE
// ════════════════════════════════════════════════════════════════════════════

export function PartyRouteMappingDesignPage() {
  const navigate = useNavigate();

  // Data-normalization on load: each seed party is augmented with selected:false.
  const [parties, setParties] = React.useState<Party[]>(() =>
    PARTIES_SEED.map((p) => ({ ...p, selected: false })),
  );
  const [selectedRouteId, setSelectedRouteId] = React.useState<string | null>(null);
  const [routeSearch, setRouteSearch] = React.useState("");
  const [partySearch, setPartySearch] = React.useState("");
  const [loadingParties, setLoadingParties] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [toast, setToast] = React.useState<ToastState>(null);
  const toastId = React.useRef(0);
  const showToast = (kind: "success" | "warning", message: string) =>
    setToast({ kind, message, id: ++toastId.current });

  const selectedRoute = React.useMemo(
    () => ROUTES.find((r) => r.id === selectedRouteId) ?? null,
    [selectedRouteId],
  );
  const selectedCount = React.useMemo(() => parties.filter((p) => p.selected).length, [parties]);
  const total = parties.length;
  const allSelected = total > 0 && selectedCount === total;
  const someSelected = selectedCount > 0 && !allSelected;

  // Route → party cascade: selecting a route LOADS its mapped parties, marks
  // them, and re-sorts selected-first. Re-runs whenever the route changes; the
  // marked set is computed fresh, so switching routes clears the prior set.
  React.useEffect(() => {
    if (selectedRouteId == null) return;
    const route = ROUTES.find((r) => r.id === selectedRouteId);
    setLoadingParties(true);
    const t = window.setTimeout(() => {
      setParties((prev) => {
        const mapped = new Set(route?.mappedPartyIds ?? []);
        const marked = prev.map((p) => ({ ...p, selected: mapped.has(p.id) }));
        const sel = marked.filter((p) => p.selected);
        const rest = marked.filter((p) => !p.selected);
        return [...sel, ...rest]; // selected-first (stable within each group)
      });
      setLoadingParties(false);
    }, 640);
    return () => window.clearTimeout(t);
  }, [selectedRouteId]);

  const onSelectRoute = (id: string) => {
    if (submitting) return;
    if (id === selectedRouteId) {
      // Deselect → clear every party selection.
      setSelectedRouteId(null);
      setParties((prev) => prev.map((p) => ({ ...p, selected: false })));
    } else {
      setSelectedRouteId(id);
    }
  };

  const onToggleAll = (on: boolean) => setParties((prev) => prev.map((p) => ({ ...p, selected: on })));
  const onToggleParty = (id: string) =>
    setParties((prev) => prev.map((p) => (p.id === id ? { ...p, selected: !p.selected } : p)));

  const resetAll = () => {
    setSelectedRouteId(null);
    setParties((prev) => prev.map((p) => ({ ...p, selected: false })));
    setRouteSearch("");
    setPartySearch("");
  };
  const clearParties = () => setParties((prev) => prev.map((p) => ({ ...p, selected: false })));

  const onSave = () => {
    if (submitting) return;
    if (!selectedRouteId) {
      showToast(
        "warning",
        selectedCount > 0
          ? `Choose a route first to assign ${selectedCount === 1 ? "this party" : `these ${selectedCount} parties`} to it.`
          : "Select a route before saving the mapping.",
      );
      return;
    }
    const route = ROUTES.find((r) => r.id === selectedRouteId);
    const ids = parties.filter((p) => p.selected).map((p) => p.id);
    setSubmitting(true);
    window.setTimeout(() => {
      setSubmitting(false);
      if (route?.locked) {
        showToast("warning", `Couldn't save — ${route.name} is locked by an active dispatch run.`);
        return; // failure: keep the working set intact
      }
      showToast("success", `Mapped ${ids.length} ${ids.length === 1 ? "party" : "parties"} to ${route?.name}.`);
      resetAll();
    }, 950);
  };

  return (
    <AppShell
      breadcrumb={
        <>
          <span className="text-bz-text-muted">Operations</span>
          <ChevronRight size={11} className="text-bz-text-soft" />
          <span className="font-semibold text-bz-text">Party–Route Mapping</span>
        </>
      }
      overlay={
        <>
          <ActionFooter
            route={selectedRoute}
            selectedCount={selectedCount}
            total={total}
            submitting={submitting}
            onReset={resetAll}
            onSave={onSave}
          />
          <Toast toast={toast} onDismiss={() => setToast(null)} />
        </>
      }
    >
      {/* Header band */}
      <header className="border-b border-bz-line bg-bz-paper px-4 pb-4 pt-5 md:px-8">
        <button
          onClick={() => navigate("/design/dashboard")}
          title="Back to workspace"
          className="mb-2 inline-flex items-center gap-1.5 text-[11.5px] font-medium text-bz-text-muted hover:text-bz-text"
        >
          <ArrowLeft size={13} /> Back to workspace
        </button>
        <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
          <div className="min-w-0">
            <h1 className="text-[22px] font-semibold tracking-tight text-bz-text md:text-[24px]">Party–Route Mapping</h1>
            <p className="mt-1 max-w-[560px] text-[12.5px] leading-relaxed text-bz-text-muted">
              Choose a delivery route, curate the customers that belong to it, and commit the set in a single save.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-bz-md border px-2.5 py-1.5 text-[11px] font-medium",
                loadingParties
                  ? "border-bz-line-soft bg-bz-surface text-bz-text-muted"
                  : selectedRoute
                  ? "border-bz-fire/40 bg-bz-fire/[0.10] text-bz-text"
                  : "border-bz-line-soft bg-bz-surface text-bz-text-muted",
              )}
            >
              {loadingParties ? (
                <>
                  <Loader2 size={11} className="animate-spin text-bz-fire" /> Loading…
                </>
              ) : selectedRoute ? (
                <>
                  <span className="size-1.5 rounded-bz-pill bg-bz-fire" /> <span className={NUM}>{selectedCount} selected</span>
                </>
              ) : (
                <>
                  <span className="size-1.5 rounded-bz-pill bg-bz-line" /> No route
                </>
              )}
            </span>
            <OverflowMenu onReset={resetAll} onClearParties={clearParties} />
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="px-4 pb-10 pt-4 md:px-8">
        <div className="mx-auto max-w-[1320px]">
          <MappingSpine route={selectedRoute} selectedCount={selectedCount} total={total} loading={loadingParties} />
          <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)]">
            <RoutePane search={routeSearch} onSearch={setRouteSearch} selectedId={selectedRouteId} onSelect={onSelectRoute} />
            <PartyPane
              parties={parties}
              search={partySearch}
              onSearch={setPartySearch}
              loading={loadingParties}
              routeSelected={!!selectedRoute}
              routeName={selectedRoute?.name ?? ""}
              selectedCount={selectedCount}
              total={total}
              allSelected={allSelected}
              someSelected={someSelected}
              onToggleAll={onToggleAll}
              onToggleParty={onToggleParty}
            />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
