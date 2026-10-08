import * as React from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { CirclePause, CirclePlay, Network, Plus, Shapes, Table2, UserRound } from "lucide-react";
import { Amount, useMedia } from "../sales/orders";
import { useStore } from "../sales/store";
import type { Customer, CustomerType, Rep, Route } from "./data";
import { accountOf, creditCheck, typeOf } from "./engine";
import type { Account, Evaluation } from "./engine";
import { STATUS_LABEL, repById } from "./network-model";
import { openQuickAdd } from "./quickadd";
import { logEvent } from "./records";
import { FxDesk } from "./fx-desk";
import { TypeMark, Who, sfPath } from "./sf";
import { customersStore, ledgerStore, repsStore, routesStore, typesStore } from "./store";
import { CustomerPanel, holdCustomer, releaseCustomer } from "./customer-panel";
import { NotAvailable, wasRemoved } from "./customers-kit";

// ════════════════════════════════════════════════════════════════════════════
// CUSTOMERS — everyone you sell to
//
// One desk, three groupings of the same rows: the register, the network (who
// serves whom — "served by" is the customer's own parentId) and by type. What a
// customer owes is COUNTED from the ledger (engine.accountOf), never read from
// the customer. A link may arrive with `?type=`; it lands as a filter chip.
// A customer opens at /customers/:no (its id).
// ════════════════════════════════════════════════════════════════════════════

/** `routes` = the routes the customer is walked on (owner decision #28) — usually one. */
type Row = { c: Customer; t: CustomerType; hasType: boolean; a: Account; credit: Evaluation["credit"]; parent: Customer | undefined; rep: Rep | undefined; kids: Customer[]; routes: Route[] };

const STATUSES: Customer["status"][] = ["active", "onboarding", "on hold"];

export function CustomersPage() {
  const { no } = useParams();
  const [search] = useSearchParams();
  const navigate = useNavigate();
  const customers = useStore(customersStore);
  const types = useStore(typesStore);
  const reps = useStore(repsStore);
  const ledger = useStore(ledgerStore);
  const routes = useStore(routesStore);
  // The name column never collapses: below 1024px the type and status leave the grid and the type joins the sub line.
  const roomy = useMedia("(min-width: 1024px)");

  const open = (id: string) => navigate(sfPath(`customers/${id}`));
  const add = () => openQuickAdd("customer", { onCreated: open });
  // `customers/new` is a link other desks may follow; a customer is made in the quick-add dialog.
  React.useEffect(() => {
    if (no !== "new") return;
    navigate(sfPath("customers"), { replace: true });
    add();
  }, [no]); // eslint-disable-line react-hooks/exhaustive-deps

  const rank = (c: Customer) => {
    const i = types.findIndex((t) => t.id === c.typeId);
    return i < 0 ? 99 : i;
  };
  // The type is read inside accountOf (grace days), so a type edit re-counts too.
  const rows = React.useMemo<Row[]>(
    () =>
      customers.map((c) => ({
        c,
        t: typeOf(c),
        hasType: types.some((t) => t.id === c.typeId),
        a: accountOf(c.id, ledger),
        credit: creditCheck(c, 0),
        parent: c.parentId ? customers.find((x) => x.id === c.parentId) : undefined,
        rep: repById(c.repId, reps),
        kids: customers.filter((x) => x.parentId === c.id),
        routes: routes.filter((r) => r.stops.some((s) => s.customerId === c.id)),
      })),
    [customers, types, reps, ledger, routes],
  );
  // A customer whose type asks for visits and that is on no route: nobody is due there.
  const noRoute = (r: Row) => r.t.visitsPer4w > 0 && r.routes.length === 0;
  const byId = new Map(rows.map((r) => [r.c.id, r]));
  const order = (a: Customer, b: Customer) => rank(a) - rank(b) || a.name.localeCompare(b.name);
  const overdue = rows.filter((r) => r.a.overdue > 0);
  const atLimit = (r: Row) => r.credit.limit !== null && r.credit.limit > 0 && r.credit.available === 0;

  const arrived = search.get("type") ? [`type:${search.get("type")}`] : [];
  const gone = !!no && no !== "new" && !byId.has(no) && !wasRemoved(no);

  return (
    <FxDesk<Row>
      place="customers"
      section="salesforce/customers"
      noun={["customer", "customers"]}
      numberLabel="Code"
      numberWidth="84px"
      amountLabel="Owes"
      showPeriod={false}
      searchPlaceholder="Name, code, city or phone"
      rows={rows}
      noOf={(r) => r.c.id}
      numberOf={(r) => r.c.code}
      rowLabel={(r) => r.c.name}
      searchText={(r) => `${r.c.name} ${r.c.code} ${r.c.city} ${r.c.phone}`}
      initialFilters={arrived.length ? arrived : undefined}
      stats={[{ label: "Outstanding", value: <Amount value={rows.reduce((s, r) => s + r.a.outstanding, 0)} currency="NPR" />, title: "What every customer owes, counted from the ledger" }]}
      picks={[
        { key: "overdue", label: "Overdue", value: <Amount value={overdue.reduce((s, r) => s + r.a.overdue, 0)} />, test: (r) => r.a.overdue > 0, danger: overdue.length > 0, title: `${overdue.length} ${overdue.length === 1 ? "customer has" : "customers have"} a bill past its due date` },
        { key: "limit", label: "At limit", value: rows.filter(atLimit).length, test: atLimit, title: "Nothing left of the credit limit" },
        { key: "norep", label: "No rep", value: rows.filter((r) => !r.rep).length, test: (r) => !r.rep },
        { key: "noroute", label: "No route", value: rows.filter(noRoute).length, test: noRoute, title: "Its type asks for visits and it is on no route" },
        { key: "portal", label: "On the portal", value: rows.filter((r) => r.c.portalUsers.length > 0).length, test: (r) => r.c.portalUsers.length > 0, title: "Has a user who can sign in" },
      ]}
      views={[
        { key: "all", label: "All", icon: Table2, groups: (rs) => [{ key: "all", label: "", rows: rs }] },
        {
          key: "network",
          label: "Network",
          icon: Network,
          // A customer whose "served by" was deleted sits with the ones billed direct, where it is found.
          groups: (rs) => {
            const suppliers = [...new Set(rs.filter((r) => r.parent).map((r) => r.parent!.id))].map((id) => byId.get(id)!.c).sort(order);
            return [{ key: "direct", label: "Billed by you", rows: rs.filter((r) => !r.parent) }, ...suppliers.map((s) => ({ key: s.id, label: `Served by ${s.name}`, rows: rs.filter((r) => r.parent?.id === s.id) }))];
          },
        },
        {
          key: "type",
          label: "By type",
          icon: Shapes,
          groups: (rs) => [...types.map((t) => ({ key: t.id, label: t.plural, rows: rs.filter((r) => r.c.typeId === t.id) })), { key: "none", label: "No type", rows: rs.filter((r) => !r.hasType) }],
        },
      ]}
      filters={[
        ...types.map((t) => ({ value: `type:${t.id}`, label: t.name, group: "Type", test: (r: Row) => r.c.typeId === t.id })),
        { value: "type:none", label: "No type", group: "Type", test: (r: Row) => !r.hasType },
        ...STATUSES.map((s) => ({ value: `st:${s}`, label: STATUS_LABEL[s], group: "Status", test: (r: Row) => r.c.status === s })),
        ...reps.map((p) => ({ value: `rep:${p.id}`, label: p.name, hint: p.role, group: "Rep", test: (r: Row) => r.c.repId === p.id })),
        ...routes.map((x) => ({ value: `route:${x.id}`, label: x.name, group: "Route", test: (r: Row) => r.routes.some((y) => y.id === x.id) })),
        { value: "route:none", label: "No route", group: "Route", test: (r: Row) => r.routes.length === 0 },
      ]}
      sorts={[
        { key: "type", label: "Type", by: (r) => `${String(rank(r.c)).padStart(2, "0")} ${r.c.name.toLowerCase()}` },
        { key: "az", label: "Name", by: (r) => r.c.name.toLowerCase() },
        { key: "owes", label: "Owes most", by: (r) => r.a.outstanding, desc: true },
        { key: "overdue", label: "Overdue most", by: (r) => r.a.overdue, desc: true },
      ]}
      columns={[
        ...(roomy ? [{ key: "type", label: "Type", width: "124px", render: (r: Row) => <TypeMark name={r.hasType ? r.t.name : "No type"} color={r.t.color} /> }] : []),
        { key: "rep", label: "Rep", width: "24px", render: (r: Row) => <Who name={r.rep?.name} /> },
      ]}
      primary={(r) => ({
        title: r.c.name,
        // The route joins the line once the type has its own column: below that the line is already full.
        sub: [
          roomy ? "" : r.hasType ? r.t.name : "No type",
          r.c.city,
          r.parent ? `served by ${r.parent.name}` : r.c.parentId ? "served by a deleted customer" : "billed by you",
          roomy && r.routes.length ? `route ${r.routes[0].name}${r.routes.length > 1 ? ` +${r.routes.length - 1}` : ""}` : "",
        ]
          .filter(Boolean)
          .join(" · "),
        subOnDesktop: true,
      })}
      status={(r) => ({ label: STATUS_LABEL[r.c.status], tone: r.c.status === "on hold" ? "bad" : r.c.status === "onboarding" ? "warn" : "good" })}
      amount={(r) => ({
        value: <Amount value={r.a.outstanding} className={r.a.outstanding ? undefined : "font-normal text-bz-text-soft"} />,
        sub: r.a.overdue > 0 ? (
          <span className="text-bz-red">
            <Amount value={r.a.overdue} className="text-bz-red" /> overdue
          </span>
        ) : undefined,
      })}
      rowVerb={(r) => (r.c.status === "on hold" ? null : { label: "New order", icon: Plus, run: () => navigate(`${sfPath("orders/new")}?customer=${r.c.id}`) })}
      bulk={[
        {
          label: "Assign rep",
          icon: UserRound,
          enabled: (rs) => rs.length > 0,
          hidden: () => reps.length === 0,
          choose: { options: reps.map((p) => ({ value: p.id, label: p.name, hint: p.role })), placeholder: "Rep" },
          run: (rs, repId) => {
            const rep = reps.find((p) => p.id === repId);
            if (!rep) return { done: 0, skipped: [], verb: "assigned" };
            const todo = rs.filter((r) => r.c.repId !== rep.id);
            const ids = new Set(todo.map((r) => r.c.id));
            customersStore.set((cs) => cs.map((x) => (ids.has(x.id) ? { ...x, repId: rep.id } : x)));
            todo.forEach((r) => logEvent(r.c.id, `gave it to ${rep.name}`));
            const skip = rs.filter((r) => r.c.repId === rep.id);
            return { done: todo.length, skipped: skip.map((r) => `${r.c.name} is already with ${rep.name}`), skippedIds: skip.map((r) => r.c.id), verb: `given to ${rep.name}` };
          },
        },
        {
          label: "Put on hold",
          icon: CirclePause,
          enabled: (rs) => rs.some((r) => r.c.status !== "on hold"),
          hidden: (rs) => rs.every((r) => r.c.status === "on hold"),
          title: "New orders from every channel are blocked",
          run: (rs) => {
            const todo = rs.filter((r) => r.c.status !== "on hold");
            const skip = rs.filter((r) => r.c.status === "on hold");
            todo.forEach((r) => holdCustomer(r.c));
            return { done: todo.length, skipped: skip.map((r) => `${r.c.name} is already on hold`), skippedIds: skip.map((r) => r.c.id), verb: "put on hold" };
          },
        },
        {
          label: "Release",
          icon: CirclePlay,
          enabled: (rs) => rs.some((r) => r.c.status === "on hold"),
          hidden: (rs) => !rs.some((r) => r.c.status === "on hold"),
          run: (rs) => {
            const todo = rs.filter((r) => r.c.status === "on hold");
            const skip = rs.filter((r) => r.c.status !== "on hold");
            todo.forEach((r) => releaseCustomer(r.c));
            return { done: todo.length, skipped: skip.map((r) => `${r.c.name} is not on hold`), skippedIds: skip.map((r) => r.c.id), verb: "released" };
          },
        },
      ]}
      // It has nothing to export, so the shared Export chip stands down.
      exportMenu={<></>}
      newLabel="New customer"
      onNew={add}
      renderPanel={(r, ctx) => <CustomerPanel key={r.c.id} c={r.c} ctx={ctx} />}
      renderExtra={({ go }) => gone && <NotAvailable text="This customer isn't available." back="Back to customers" onBack={() => go(null)} />}
    />
  );
}

export const CUSTOMERS_ROUTES = [
  { path: "design/salesforce/customers", Component: CustomersPage },
  { path: "design/salesforce/customers/:no", Component: CustomersPage },
];
