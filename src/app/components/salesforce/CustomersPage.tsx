import * as React from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { ChevronRight } from "lucide-react";
import { cn } from "../ui/utils";
import { NUM, SearchField, Segmented, Select } from "../sales/bzw";
import { useStore } from "../sales/store";
import { TERRITORIES } from "./data";
import type { Customer, CustomerType } from "./data";
import { npr } from "./engine";
import { customersStore, typesStore } from "./store";
import { SfShell, sfPath } from "./shell";
import { Dot, EmptyNote, Figures, List, Money, Page, PageIntro, Row, TextTabs, TypeMark } from "./ui";
import { CustomerPanel } from "./customer-panel";
import { STATUS_LABEL, STATUS_TONE, childrenOf, leafTerrIds, parentOf, repById, supplyStore, terrById, typeIn } from "./network-model";

// ════════════════════════════════════════════════════════════════════════════
// CUSTOMERS — the trade network
//
// Every customer with its type, who serves it and what it owes. Two views of the
// same rows: a list (filter by type, territory, search) and the network — super-
// stockist → distributors → retailers as an indented list, never a graph.
// `?type=` is honoured (Home links that way); a customer opens at /customers/:id.
// ════════════════════════════════════════════════════════════════════════════

export function CustomersPage() {
  const { id } = useParams();
  const [search, setSearch] = useSearchParams();
  const navigate = useNavigate();
  const customers = useStore(customersStore);
  const types = useStore(typesStore);
  const supply = useStore(supplyStore);
  const [q, setQ] = React.useState("");

  const type = search.get("type") ?? "all";
  const terr = search.get("terr") ?? "all";
  const view: "list" | "network" = search.get("view") === "network" ? "network" : "list";
  const qs = search.toString();

  const setParam = (k: string, v: string | null) => {
    const next = new URLSearchParams(search);
    if (v) next.set(k, v);
    else next.delete(k);
    setSearch(next, { replace: true });
  };
  const open = (cid: string) => navigate({ pathname: sfPath(`customers/${cid}`), search: qs ? `?${qs}` : "" });
  const close = () => navigate({ pathname: sfPath("customers"), search: qs ? `?${qs}` : "" });

  const terrIds = terr === "all" ? null : new Set(leafTerrIds(terr));
  const needle = q.trim().toLowerCase();
  const matches = (c: Customer) =>
    (type === "all" || c.typeId === type) &&
    (!terrIds || terrIds.has(c.territoryId)) &&
    (!needle || `${c.name} ${c.code} ${c.city} ${c.phone}`.toLowerCase().includes(needle));

  const order = (c: Customer) => {
    const i = types.findIndex((t) => t.id === c.typeId);
    return i < 0 ? 99 : i;
  };
  const shown = customers.filter(matches).sort((a, b) => order(a) - order(b) || a.name.localeCompare(b.name));
  const baseForTabs = customers.filter((c) => (!terrIds || terrIds.has(c.territoryId)) && (!needle || `${c.name} ${c.code} ${c.city} ${c.phone}`.toLowerCase().includes(needle)));
  const countOf = (tid: string) => baseForTabs.filter((c) => c.typeId === tid).length;
  const outstanding = shown.reduce((s, c) => s + c.outstanding, 0);
  const overdue = shown.filter((c) => c.overdue > 0);
  const onPortal = shown.filter((c) => c.portalUsers.length > 0).length;
  const filtered = type !== "all" || terr !== "all" || !!needle;

  const terrOptions = [
    { value: "all", label: "All territories" },
    ...TERRITORIES.filter((t) => t.level !== "region").map((t) => ({
      value: t.id,
      label: t.name,
      hint: t.level === "area" ? "Whole area" : undefined,
      group: TERRITORIES.find((r) => r.id === (t.level === "area" ? t.parentId : terrById(t.parentId)?.parentId))?.name,
    })),
  ];

  return (
    <SfShell page="customers" panel={id ? <CustomerPanel id={id} onClose={close} onOpen={open} /> : null}>
      <Page width="full" className="max-w-[1320px]">
        <PageIntro
          actions={
            <Segmented
              size="sm"
              value={view}
              onChange={(v) => setParam("view", v === "network" ? "network" : null)}
              options={[
                { value: "list", label: "List" },
                { value: "network", label: "Network" },
              ]}
            />
          }
        >
          Every customer, its type and who serves it.
        </PageIntro>

        <Figures
          items={[
            { label: filtered ? "Customers shown" : "Customers", value: shown.length, sub: `of ${customers.length}` },
            { label: "Outstanding", value: <Money value={outstanding} /> },
            { label: "Overdue", value: <Money value={overdue.reduce((s, c) => s + c.overdue, 0)} />, sub: `${overdue.length} customers`, tone: overdue.length ? "danger" : undefined },
            { label: "On the portal", value: onPortal, sub: "with a user who can sign in" },
          ]}
        />

        <div className="mt-10 flex flex-wrap items-center gap-2">
          <div className="-mx-1 min-w-0 max-w-full overflow-x-auto px-1 [scrollbar-width:none]">
            <TextTabs
              className="flex-nowrap"
              value={type}
              onChange={(v) => setParam("type", v === "all" ? null : v)}
              options={[
                { value: "all", label: "All", count: baseForTabs.length },
                ...types.filter((t) => countOf(t.id) > 0 || t.id === type).map((t) => ({ value: t.id, label: t.plural, count: countOf(t.id) })),
              ]}
            />
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <SearchField value={q} onChange={setQ} placeholder="Search name, code, city or phone" className="w-full sm:w-[280px]" />
          <Select
            value={terr}
            onChange={(v) => setParam("terr", v === "all" ? null : v)}
            options={terrOptions}
            label={terr === "all" ? "All territories" : terrById(terr)?.name}
            applied={terr !== "all"}
            width={260}
          />
        </div>

        <div className="mt-5">
          {view === "list" ? (
            shown.length === 0 ? (
              <EmptyNote
                action={
                  <button type="button" onClick={() => (setQ(""), setSearch(new URLSearchParams(), { replace: true }))} className="text-[12px] font-medium text-bz-text underline underline-offset-2">
                    Clear filters
                  </button>
                }
              >
                No customer matches these filters.
              </EmptyNote>
            ) : (
              <>
                <div className="hidden items-center gap-3.5 px-1 pb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-bz-text-soft md:flex">
                  <span className="min-w-0 flex-1 pl-2">Customer</span>
                  <span className="w-[130px]">Rep</span>
                  <span className="w-[96px]">Status</span>
                  <span className="w-[120px] pr-2 text-right">Outstanding</span>
                </div>
                <List>
                  {shown.map((c) => (
                    <CustomerRow key={c.id} c={c} types={types} customers={customers} supply={supply} active={c.id === id} onOpen={open} />
                  ))}
                </List>
              </>
            )
          ) : (
            <NetworkTree customers={customers} types={types} supply={supply} matches={matches} filtered={filtered} activeId={id} onOpen={open} />
          )}
        </div>
      </Page>
    </SfShell>
  );
}

function CustomerRow({ c, types, customers, supply, active, onOpen }: { c: Customer; types: CustomerType[]; customers: Customer[]; supply: Record<string, string>; active: boolean; onOpen: (id: string) => void }) {
  const t = typeIn(types, c.typeId);
  const parent = customers.find((x) => x.id === parentOf(c, supply));
  const rep = repById(c.repId);
  return (
    <Row
      active={active}
      onClick={() => onOpen(c.id)}
      title={c.name}
      sub={
        <>
          <TypeMark name={t.name} color={t.color} className="text-[11px] text-bz-text-soft" /> · {c.city} · {parent ? `served by ${parent.name}` : "billed direct"}
        </>
      }
      meta={[
        <span key="r" className="block w-[130px] truncate">
          {rep?.name ?? "No rep"}
        </span>,
        <span key="s" className="block w-[96px]">
          <Dot tone={STATUS_TONE[c.status]}>{STATUS_LABEL[c.status]}</Dot>
        </span>,
      ]}
      trail={
        <span className="flex w-[120px] flex-col items-end">
          <Money value={c.outstanding} code={false} className={c.outstanding ? "" : "text-bz-text-soft"} />
          {c.overdue > 0 && <span className={cn("text-[11px] font-normal text-bz-red", NUM)}>{npr(c.overdue)} overdue</span>}
          {c.status !== "active" && (
            <Dot tone={STATUS_TONE[c.status]} className="text-[10.5px] font-normal md:hidden">
              {STATUS_LABEL[c.status]}
            </Dot>
          )}
        </span>
      }
    />
  );
}

// ── Network view ────────────────────────────────────────────────────────────

function NetworkTree({
  customers,
  types,
  supply,
  matches,
  filtered,
  activeId,
  onOpen,
}: {
  customers: Customer[];
  types: CustomerType[];
  supply: Record<string, string>;
  matches: (c: Customer) => boolean;
  filtered: boolean;
  activeId: string | undefined;
  onOpen: (id: string) => void;
}) {
  // Open the top tier (a node whose customers serve customers of their own); leave the long retailer lists folded.
  const [openIds, setOpenIds] = React.useState<Set<string>>(
    () =>
      new Set(
        customers
          .filter((c) => {
            const kids = childrenOf(c.id, customers, supply);
            return !parentOf(c, supply) && kids.some((k) => childrenOf(k.id, customers, supply).length > 0);
          })
          .map((c) => c.id),
      ),
  );
  const [directOpen, setDirectOpen] = React.useState(false);
  const toggle = (id: string) =>
    setOpenIds((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const rank = (c: Customer) => {
    const i = types.findIndex((t) => t.id === c.typeId);
    return i < 0 ? 99 : i;
  };
  const sort = (xs: Customer[]) => [...xs].sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name));
  const kidsOf = (id: string) => sort(childrenOf(id, customers, supply));
  const memo = new Map<string, boolean>();
  const visible = (c: Customer, depth = 0): boolean => {
    if (memo.has(c.id)) return memo.get(c.id)!;
    const v = matches(c) || (depth < 6 && kidsOf(c.id).some((k) => visible(k, depth + 1)));
    memo.set(c.id, v);
    return v;
  };

  const tops = customers.filter((c) => !parentOf(c, supply));
  const roots = sort(tops.filter((c) => typeIn(types, c.typeId).ownCustomers || childrenOf(c.id, customers, supply).length > 0)).filter((c) => visible(c));
  const direct = sort(tops.filter((c) => !typeIn(types, c.typeId).ownCustomers && childrenOf(c.id, customers, supply).length === 0)).filter(matches);
  const orphans = sort(customers.filter((c) => {
    const p = parentOf(c, supply);
    return p && !customers.some((x) => x.id === p);
  })).filter(matches);

  const node = (c: Customer, depth: number): React.ReactNode => {
    const t = typeIn(types, c.typeId);
    const kids = kidsOf(c.id).filter((k) => visible(k));
    const all = childrenOf(c.id, customers, supply).length;
    const isOpen = filtered ? true : openIds.has(c.id);
    return (
      <li key={c.id}>
        <div className={cn("group flex min-h-[48px] items-center gap-2 py-1.5 pr-1", activeId === c.id && "bg-bz-fire/10")}>
          {kids.length > 0 ? (
            <button
              type="button"
              onClick={() => toggle(c.id)}
              aria-expanded={isOpen}
              aria-label={isOpen ? `Collapse ${c.name}` : `Expand ${c.name}`}
              className="flex size-6 shrink-0 items-center justify-center rounded-bz-sm text-bz-text-soft hover:bg-bz-paper-warm hover:text-bz-text"
            >
              <ChevronRight size={13} className={cn("transition-transform duration-150", isOpen && "rotate-90")} />
            </button>
          ) : (
            <span className="w-6 shrink-0" />
          )}
          <button type="button" onClick={() => onOpen(c.id)} className="min-w-0 flex-1 text-left">
            <span className={cn("block truncate text-bz-text group-hover:underline", depth === 0 ? "text-[13px] font-semibold" : "text-[12.5px] font-medium")}>{c.name}</span>
            <span className="block truncate text-[11px] text-bz-text-soft">
              <TypeMark name={t.name} color={t.color} className="text-[11px] text-bz-text-soft" /> · {c.city}
              {all > 0 && ` · ${all} ${all === 1 ? "customer" : "customers"}`}
            </span>
          </button>
          {c.overdue > 0 && <span className={cn("hidden shrink-0 text-[11px] text-bz-red sm:block", NUM)}>{npr(c.overdue)} overdue</span>}
          <Money value={c.outstanding} code={false} className={cn("w-[88px] shrink-0 text-right text-[12px]", c.outstanding ? "text-bz-text" : "text-bz-text-soft")} />
        </div>
        {kids.length > 0 && isOpen && (
          <ul className="m-0 ml-3 list-none border-l border-bz-line-soft p-0 pl-3">
            {kids.map((k) => node(k, depth + 1))}
          </ul>
        )}
      </li>
    );
  };

  if (!roots.length && !direct.length && !orphans.length) return <EmptyNote>No customer matches these filters.</EmptyNote>;

  return (
    <div>
      <p className="m-0 mb-3 text-[11.5px] text-bz-text-soft">Who serves whom. Open a branch to see the customers under it; outstanding is what each one owes.</p>
      {roots.length > 0 && (
        <ul className="m-0 list-none divide-y divide-bz-line-soft border-y border-bz-line-soft p-0">
          {roots.map((c) => node(c, 0))}
        </ul>
      )}
      {direct.length > 0 && (
        <div className="mt-8">
          <button type="button" onClick={() => setDirectOpen((v) => !v)} aria-expanded={directOpen || filtered} className="flex items-center gap-2 text-left">
            <ChevronRight size={13} className={cn("text-bz-text-soft transition-transform duration-150", (directOpen || filtered) && "rotate-90")} />
            <span className="text-[13px] font-semibold text-bz-text">Billed by you directly</span>
            <span className={cn("text-[11.5px] text-bz-text-soft", NUM)}>{direct.length}</span>
            <span className="text-[11px] text-bz-text-soft">· dealers, modern trade, HoReCa and institutions with no distributor</span>
          </button>
          {(directOpen || filtered) && (
            <ul className="m-0 mt-2 list-none divide-y divide-bz-line-soft border-y border-bz-line-soft p-0">
              {direct.map((c) => node(c, 1))}
            </ul>
          )}
        </div>
      )}
      {orphans.length > 0 && (
        <p className="m-0 mt-6 text-[11.5px] text-bz-text-soft">{orphans.length} customers point to a distributor that is no longer in the list.</p>
      )}
    </div>
  );
}

export const CUSTOMERS_ROUTES = [
  { path: "design/salesforce/customers", Component: CustomersPage },
  { path: "design/salesforce/customers/:id", Component: CustomersPage },
];
