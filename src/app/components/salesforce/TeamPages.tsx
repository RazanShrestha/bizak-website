import * as React from "react";
import { useNavigate } from "react-router";
import { Pencil, Table2, Trash2, Users } from "lucide-react";
import { cn } from "../ui/utils";
import { BTN, Chip, Dialog, Field, GHOST, GHOST_SM, INPUT, LABEL, MenuItem, MenuSep, Meter, NUM, Refusal, Segmented, Stat, Statline } from "../sales/bzw";
import type { Column, PanelCtx } from "../sales/DocDesk";
import { Amount, useMedia } from "../sales/orders";
import { Cell, CellGrid, ConfirmDialog, Section } from "../sales/parts";
import { Block, MoneyList, RecordShell } from "../sales/record";
import { useStore } from "../sales/store";
import type { Customer, Rep, RoutePlan, Target } from "./data";
import { customerById, dayTime, npr } from "./engine";
import { DAY_STATUS, THIS_MONTH, dayLabel, incentiveOf, initialsOf, monthLabel, outcomeOf, pct, repActuals, repArea, repCustomers, repDay, shortDay } from "./field-data";
import type { Actuals, DayStatus, RepDay } from "./field-data";
import { useFieldStores } from "./field-kit";
import { lastPing, placeOf, placeText } from "./geo";
import { MapLink } from "./geo-kit";
import { openQuickAdd } from "./quickadd";
import { logEvent } from "./records";
import { plansOfRep, routeName, unplanRep } from "./routes";
import { customersStore, ledgerStore, repSessionStore, repsStore, targetsStore } from "./store";
import { FxDesk, pillTone } from "./fx-desk";
import { SfActivity, SfNoteFoot, Who, chipTone, sfPath } from "./sf";
import { TargetsPage } from "./TargetsPage";

// ════════════════════════════════════════════════════════════════════════════
// FIELD SALES · REPS — the people in the field
//
// A `FxDesk` of reps and a `RecordShell` panel. A rep's customers are the ones
// they own and the ones on the routes planned for them (`repCustomers`);
// everything else on the row and in the panel is counted (field-data): today's
// beat, this month's sales and outlets against the target. Targets are their
// own page (TargetsPage).
// ════════════════════════════════════════════════════════════════════════════

const ROLES: Rep["role"][] = ["Sales rep", "Merchandiser", "Area manager"];
const DAY_STATES = Object.keys(DAY_STATUS) as DayStatus[];

/** `plans` = the rep's route-days on the plan, Monday first. */
type Row = { r: Rep; d: RepDay; pool: Customer[]; plans: RoutePlan[]; a: Actuals; t: Target | undefined };

/** "Kathmandu West · Fri" */
const planText = (p: RoutePlan) => `${routeName(p.routeId)} · ${dayLabel(p.day).slice(0, 3)}`;
const salesPct = (x: Row) => (x.t ? pct(x.a.sales, x.t.salesTarget) : 0);

export function RepsPage() {
  const navigate = useNavigate();
  const s = useFieldStores();
  // A rep's sales are what the hub billed, so an invoice landing re-counts the desk.
  useStore(ledgerStore);
  const lg = useMedia("(min-width: 1024px)");
  const xl = useMedia("(min-width: 1280px)");

  const rows: Row[] = s.reps.map((r) => ({ r, d: repDay(r), pool: repCustomers(r), plans: plansOfRep(r.id).sort((a, b) => a.day - b.day), a: repActuals(r.id), t: s.targets.find((t) => t.repId === r.id && t.month === THIS_MONTH) }));
  const covered = new Set(rows.flatMap((x) => x.pool.map((c) => c.id))).size;
  const roleSplit = ROLES.map((role) => {
    const n = rows.filter((x) => x.r.role === role).length;
    return `${n} ${role.toLowerCase()}${n === 1 ? "" : "s"}`;
  }).join(" · ");

  // The name column never collapses: the lower-value columns are dropped as the list narrows.
  const columns: Column<Row>[] = [
    ...(lg
      ? [
          {
            key: "routes",
            label: "Routes",
            width: "72px",
            align: "right" as const,
            render: (x: Row) => (
              <span className={cn(NUM, !x.plans.length && "text-bz-text-soft")} title={x.plans.map(planText).join(", ") || "Not on the plan"}>
                {x.plans.length}
              </span>
            ),
          },
        ]
      : []),
    ...(lg ? [{ key: "customers", label: "Customers", width: "72px", align: "right" as const, render: (x: Row) => <span className={NUM}>{x.pool.length}</span> }] : []),
    ...(xl
      ? [
          {
            key: "outlets",
            label: "Outlets",
            width: "76px",
            align: "right" as const,
            render: (x: Row) => (
              <span className={NUM} title={`Outlets visited in ${monthLabel(THIS_MONTH)}`}>
                {x.a.outlets}
                {x.t ? <span className="text-bz-text-soft"> / {x.t.outletsTarget}</span> : null}
              </span>
            ),
          },
        ]
      : []),
    ...(xl ? [{ key: "target", label: "Target", width: "72px", render: (x: Row) => (x.t && x.t.salesTarget > 0 ? <Meter thin pct={salesPct(x)} /> : <span className="text-bz-text-soft">—</span>) }] : []),
  ];
  // Where the Routes column is not drawn the sub line says where the rep works.
  const areaInSub = !lg;

  return (
    <FxDesk<Row>
      place="reps"
      section="salesforce/team"
      noun={["rep", "reps"]}
      rows={rows}
      noOf={(x) => x.r.id}
      rowLabel={(x) => x.r.name}
      numberLabel="ID"
      numberWidth="72px"
      partyLabel="Rep"
      amountLabel="Month sales"
      showPeriod={false}
      searchText={(x) => `${x.r.id} ${x.r.name} ${x.r.role} ${x.r.phone} ${x.plans.map((p) => routeName(p.routeId)).join(" ")}`}
      searchPlaceholder="Name, role or route"
      stats={[
        { label: "Reps", value: rows.length, title: roleSplit },
        { label: "Customers covered", value: `${covered} of ${s.customers.length}`, title: "Owned by a rep or on a route planned for one" },
      ]}
      picks={[{ key: "field", label: "In the field today", value: rows.filter((x) => x.d.visits.length > 0).length, test: (x) => x.d.visits.length > 0, title: "With a visit today" }]}
      views={[
        { key: "all", label: "Reps", icon: Table2, groups: (rs) => [{ key: "all", label: "", rows: rs }] },
        { key: "role", label: "By role", icon: Users, groups: (rs) => ROLES.map((role) => ({ key: role, label: `${role}s`, rows: rs.filter((x) => x.r.role === role) })).filter((g) => g.rows.length) },
      ]}
      filters={[
        ...ROLES.map((role) => ({ value: `role:${role}`, label: role, group: "Role", test: (x: Row) => x.r.role === role })),
        ...DAY_STATES.map((k) => ({ value: `day:${k}`, label: DAY_STATUS[k].label, group: "Today", test: (x: Row) => x.d.status === k })),
      ]}
      sorts={[
        { key: "name", label: "Name", by: (x) => x.r.name.toLowerCase() },
        { key: "sales", label: "Month sales", by: (x) => x.a.sales, desc: true },
        { key: "customers", label: "Customers", by: (x) => x.pool.length, desc: true },
      ]}
      columns={columns}
      primary={(x) => ({
        title: (
          <span className="flex min-w-0 items-center gap-2">
            <span className="hidden shrink-0 md:inline-flex">
              <Who name={x.r.name} size={18} />
            </span>
            <span className="min-w-0 truncate">{x.r.name}</span>
          </span>
        ),
        // From 768px the avatar leads the name, so the second line starts under the name, not under the avatar.
        sub: <span className="md:pl-[26px]">{areaInSub ? `${x.r.role} · ${repArea(x.r)}` : x.r.role}</span>,
        subOnDesktop: true,
      })}
      status={(x) => ({ label: DAY_STATUS[x.d.status].label, tone: pillTone(DAY_STATUS[x.d.status].tone) })}
      statusLabel="Today"
      amount={(x) => ({ value: <Amount value={x.a.sales} />, sub: x.t ? `${salesPct(x)}% of ${npr(x.t.salesTarget)}` : "No target" })}
      newLabel="New rep"
      onNew={() => openQuickAdd("rep", { onCreated: (id) => navigate(sfPath(`team/${id}`)) })}
      renderPanel={(x, ctx) => <RepPanel key={x.r.id} row={x} ctx={ctx} />}
    />
  );
}

// ── The record ──────────────────────────────────────────────────────────────

function RepPanel({ row, ctx }: { row: Row; ctx: PanelCtx }) {
  const navigate = useNavigate();
  const s = useFieldStores();
  const [editing, setEditing] = React.useState(false);
  const [removing, setRemoving] = React.useState(false);
  const { r: rep, d, a, t: target, pool, plans } = row;
  const st = DAY_STATUS[d.status];
  const entries = s.plan.filter((e) => e.repId === rep.id);
  const seen = lastPing(rep.id);
  const recent = s.visits
    .filter((v) => v.repId === rep.id)
    .sort((x, y) => y.date.localeCompare(x.date) || (y.checkIn ?? "").localeCompare(x.checkIn ?? ""))
    .slice(0, 5);
  const month = monthLabel(THIS_MONTH);
  const visitCols = "sm:grid-cols-[112px_minmax(0,1fr)_minmax(0,1.2fr)]";
  const when = (date: string, checkIn: string | null) => `${shortDay(date)}${checkIn ? `, ${checkIn}` : ""}`;

  return (
    <RecordShell
      ctx={ctx}
      no={rep.id}
      chips={<Chip tone={chipTone(st.tone)}>{st.label}</Chip>}
      title={
        <span className="inline-flex items-center gap-2">
          <Who name={rep.name} size={22} />
          {rep.name}
        </span>
      }
      meta={[<span key="role">{rep.role}</span>, <span key="area">{repArea(rep)}</span>, ...(rep.phone ? [<span key="phone" className={NUM}>{rep.phone}</span>] : [])]}
      menu={(close) => (
        <>
          <MenuItem icon={Pencil} onClick={() => (close(), setEditing(true))}>
            Edit
          </MenuItem>
          <MenuSep />
          <MenuItem icon={Trash2} danger onClick={() => (close(), setRemoving(true))}>
            Remove rep…
          </MenuItem>
        </>
      )}
      foot={<SfNoteFoot id={rep.id} />}
    >
      <div className="border-b border-bz-line-soft px-5 pb-2.5 pt-2">
        <Statline>
          <Stat label="Sales this month" value={<Amount value={a.sales} currency="NPR" />} title={`${a.orders} approved order${a.orders === 1 ? "" : "s"} in ${month}`} />
          {target && target.salesTarget > 0 && <Stat label="Of target" value={`${pct(a.sales, target.salesTarget)}%`} meter={pct(a.sales, target.salesTarget)} />}
          <Stat label="Outlets visited" value={a.outlets} sub={target ? `of ${target.outletsTarget}` : undefined} title={`Outlets with a finished visit in ${month}`} />
          <Stat label="New outlets" value={a.newOutlets} sub={target ? `of ${target.newOutletsTarget}` : undefined} title={`Shops whose first order came from ${rep.name} in ${month}`} />
        </Statline>
      </div>

      <Block
        title="Today"
        right={
          <button type="button" className={GHOST_SM} onClick={() => navigate(sfPath(`today/${rep.id}`))}>
            Open the day
          </button>
        }
      >
        {d.planned || d.visits.length ? (
          <CellGrid>
            <Cell label="Beat">
              {d.visited} of {d.planned} planned outlets visited
            </Cell>
            <Cell label="Orders">
              {d.orders.length ? (
                <>
                  <span className={NUM}>{d.orders.length}</span>
                  <span className="text-bz-text-soft"> · </span>
                  <Amount value={d.orderValue} currency="NPR" />
                </>
              ) : (
                <span className="text-bz-text-soft">None</span>
              )}
            </Cell>
            {d.current && <Cell label="Now at">{customerById(d.current.customerId)?.name ?? "A removed customer"}</Cell>}
          </CellGrid>
        ) : (
          <p className="m-0 text-[11.5px] text-bz-text-soft">No beat and no visits today.</p>
        )}
      </Block>

      <Block
        title={`Target · ${month}`}
        right={
          <button type="button" className={GHOST_SM} onClick={() => navigate(sfPath("targets"))}>
            {target ? "Change" : "Set target"}
          </button>
        }
      >
        {target ? (
          <>
            <div className="overflow-hidden rounded-bz-md border border-bz-line-soft">
              <TargetLine label="Sales" figure={`${npr(a.sales)} of ${npr(target.salesTarget)}`} value={pct(a.sales, target.salesTarget)} />
              <TargetLine label="Outlets visited" figure={`${a.outlets} of ${target.outletsTarget}`} value={pct(a.outlets, target.outletsTarget)} />
              <TargetLine label="New outlets" figure={`${a.newOutlets} of ${target.newOutletsTarget}`} value={pct(a.newOutlets, target.newOutletsTarget)} />
            </div>
            <MoneyList rows={[{ label: "Incentive so far", value: <Amount value={incentiveOf(target, a)} currency="NPR" /> }]} />
          </>
        ) : (
          <p className="m-0 text-[11.5px] text-bz-text-soft">No target for {month}.</p>
        )}
      </Block>

      <Block
        title="Details"
        right={
          <button type="button" className={GHOST_SM} onClick={() => setEditing(true)}>
            <Pencil size={11} /> Edit
          </button>
        }
      >
        <CellGrid>
          <Cell label="Routes">
            {plans.length ? (
              plans.map((p) => (
                <button key={p.id} type="button" className="block max-w-full truncate text-left hover:underline hover:underline-offset-2" onClick={() => navigate(sfPath(`routes/${p.routeId}`))}>
                  {planText(p)}
                </button>
              ))
            ) : (
              <span className="text-bz-text-soft">None yet</span>
            )}
          </Cell>
          <Cell label="Customers">
            <span className={NUM}>{pool.length}</span>
            <span className="block text-[10.5px] text-bz-text-soft">{pool.filter((c) => c.repId === rep.id).length} owned</span>
          </Cell>
          <Cell label="Plan">
            <button type="button" className="text-left hover:underline hover:underline-offset-2" onClick={() => navigate(sfPath(`plan/${rep.id}`))}>
              {entries.length ? `${entries.length} entr${entries.length === 1 ? "y" : "ies"} in the week` : "Nothing planned"}
            </button>
          </Cell>
          <Cell label="Phone">{rep.phone ? <span className={NUM}>{rep.phone}</span> : <span className="text-bz-text-soft">—</span>}</Cell>
          <Cell label="Last location" wide>
            {seen ? (
              <span className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                <span>
                  {dayTime(seen.at)} · {placeText(placeOf(seen, seen.at.startsWith(d.date) ? d.stops.map((x) => x.customerId) : []))}
                </span>
                <MapLink p={seen} />
              </span>
            ) : (
              <span className="text-bz-text-soft">None yet</span>
            )}
          </Cell>
        </CellGrid>
      </Block>

      <div className="border-b border-bz-line-soft">
        <Section
          title="Recent visits"
          count={recent.length}
          summary={recent.map((v) => customerById(v.customerId)?.name ?? "Removed customer").join(" · ") || "None"}
          defaultOpen={recent.length > 0}
          right={
            recent.length ? (
              <button type="button" className={GHOST_SM} onClick={() => navigate(sfPath("visits"))}>
                All visits
              </button>
            ) : undefined
          }
        >
          {recent.length === 0 ? (
            <p className="m-0 text-[11.5px] text-bz-text-soft">No visits yet.</p>
          ) : (
            <div className="overflow-hidden rounded-bz-md border border-bz-line-soft">
              <div className={cn("hidden gap-3 border-b border-bz-line bg-bz-paper-warm px-3 py-1.5 sm:grid", visitCols, LABEL)}>
                <span>Date</span>
                <span>Customer</span>
                <span>Outcome</span>
              </div>
              {recent.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => navigate(sfPath(`visits/${v.id}`))}
                  className={cn("grid w-full grid-cols-[minmax(0,1fr)] items-center gap-x-3 border-b border-bz-line-soft px-3 py-2 text-left text-[12px] last:border-0 hover:bg-bz-paper-warm", visitCols)}
                >
                  <span className={cn("hidden text-bz-text-muted sm:block", NUM)}>{when(v.date, v.checkIn)}</span>
                  <span className="min-w-0 truncate font-medium text-bz-text">
                    {customerById(v.customerId)?.name ?? "Removed customer"}
                    <span className={cn("block text-[10.5px] font-normal text-bz-text-soft sm:hidden", NUM)}>{when(v.date, v.checkIn)}</span>
                  </span>
                  <span className="min-w-0 truncate text-bz-text-muted">{outcomeOf(v)}</span>
                </button>
              ))}
            </div>
          )}
        </Section>
      </div>

      <SfActivity ids={[rep.id]} />

      {editing && (
        <RepDialog
          rep={rep}
          onClose={() => setEditing(false)}
          onSaved={(name) => {
            setEditing(false);
            ctx.show("success", `${name} saved`);
          }}
        />
      )}
      <RemoveRepDialog
        open={removing}
        rep={rep}
        onClose={() => setRemoving(false)}
        onRemoved={() => {
          ctx.show("info", `${rep.name} removed`);
          ctx.go(null);
        }}
      />
    </RecordShell>
  );
}

/** One goal of the month: what was counted against what was set, as a thin meter. */
function TargetLine({ label, figure, value }: { label: string; figure: string; value: number }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-bz-line-soft px-3 py-2 last:border-0 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_96px_44px]">
      <span className="min-w-0">
        <span className="block truncate text-[12.5px] text-bz-text">{label}</span>
        <span className={cn("block truncate text-[10.5px] text-bz-text-soft sm:hidden", NUM)}>{figure}</span>
      </span>
      <span className={cn("hidden truncate text-right text-[12px] text-bz-text-muted sm:block", NUM)}>{figure}</span>
      <span className="hidden sm:block">
        <Meter thin pct={value} />
      </span>
      <span className={cn("text-right text-[12.5px] font-semibold text-bz-text", NUM)}>{value}%</span>
    </div>
  );
}

// ── Edit ────────────────────────────────────────────────────────────────────

function RepDialog({ rep, onClose, onSaved }: { rep: Rep; onClose: () => void; onSaved: (name: string) => void }) {
  const s = useFieldStores();
  const [name, setName] = React.useState(rep.name);
  const [role, setRole] = React.useState<Rep["role"]>(rep.role);
  const [phone, setPhone] = React.useState(rep.phone);
  const [error, setError] = React.useState<string | null>(null);

  const save = () => {
    const n = name.trim();
    if (!n) return setError("Enter the rep's name.");
    if (s.reps.some((r) => r.id !== rep.id && r.name.toLowerCase() === n.toLowerCase())) return setError(`There is already a rep called ${n}.`);
    const row: Rep = { ...rep, name: n, initials: initialsOf(n), role, phone: phone.trim() };
    const changes: string[] = [];
    if (rep.name !== row.name) changes.push(`name to ${row.name}`);
    if (rep.role !== row.role) changes.push(`role to ${row.role}`);
    if (rep.phone !== row.phone) changes.push(`phone to ${row.phone || "none"}`);
    repsStore.set((list) => list.map((r) => (r.id === rep.id ? row : r)));
    if (changes.length) logEvent(row.id, `changed ${changes.join(", ")}`);
    onSaved(row.name);
  };

  return (
    <Dialog
      open
      onClose={onClose}
      eyebrow={rep.id}
      title={`Edit ${rep.name}`}
      foot={
        <>
          <button type="button" className={GHOST} onClick={onClose}>
            Cancel
          </button>
          <button type="button" className={BTN} onClick={save}>
            Save
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <Field label="Name" required>
          <input autoFocus className={INPUT} value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label="Role">
          <Segmented<Rep["role"]> value={role} onChange={setRole} options={ROLES.map((r) => ({ value: r, label: r }))} size="sm" />
        </Field>
        <Field label="Phone">
          <input className={INPUT} value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" />
        </Field>
        {error && <Refusal text={error} onDismiss={() => setError(null)} sticky />}
      </div>
    </Dialog>
  );
}

// ── Remove ──────────────────────────────────────────────────────────────────

function RemoveRepDialog({ open, rep, onClose, onRemoved }: { open: boolean; rep: Rep; onClose: () => void; onRemoved: () => void }) {
  const s = useFieldStores();
  const owned = s.customers.filter((c) => c.repId === rep.id);
  const entries = s.plan.filter((e) => e.repId === rep.id);
  const remove = () => {
    repsStore.set((list) => list.filter((r) => r.id !== rep.id));
    unplanRep(rep.id);
    targetsStore.set((t) => t.filter((x) => x.repId !== rep.id));
    if (owned.length) customersStore.set((cs) => cs.map((c) => (c.repId === rep.id ? { ...c, repId: null } : c)));
    for (const c of owned) logEvent(c.id, `lost its rep: ${rep.name} was removed`);
    if (repSessionStore.get().repId === rep.id) repSessionStore.set(() => ({ repId: null }));
    logEvent(rep.id, `removed ${rep.name}`);
    onClose();
    onRemoved();
  };
  return (
    <ConfirmDialog
      open={open}
      eyebrow={rep.id}
      title={`Remove ${rep.name}?`}
      body={
        <>
          {entries.length ? `${entries.length} plan entr${entries.length === 1 ? "y is" : "ies are"} removed. ` : ""}
          {owned.length ? `${owned.length} customer${owned.length === 1 ? " loses" : "s lose"} their rep. ` : ""}
          Past visits and orders keep the name.
        </>
      }
      confirm="Remove"
      danger
      onClose={onClose}
      onConfirm={remove}
    />
  );
}

// ── Routes ──────────────────────────────────────────────────────────────────

export { TargetsPage };

export const TEAM_ROUTES = [
  { path: "design/salesforce/team", Component: RepsPage },
  { path: "design/salesforce/team/:no", Component: RepsPage },
  { path: "design/salesforce/targets", Component: TargetsPage },
];
