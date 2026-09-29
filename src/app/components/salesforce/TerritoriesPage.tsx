import * as React from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { ChevronRight, UserPlus, ArrowRightLeft } from "lucide-react";
import { cn } from "../ui/utils";
import { BTN, Checkbox, Dialog, Field, GHOST, GHOST_SM, NUM, Select, ToastHost, useToast } from "../sales/bzw";
import { useStore } from "../sales/store";
import { REPS, TERRITORIES } from "./data";
import type { Customer, Territory } from "./data";
import { customersStore, hubStore, schemesStore, typesStore } from "./store";
import { SfShell, sfPath } from "./shell";
import { Figures, Money, Page, PageIntro, Section, SidePanel, TypeMark } from "./ui";
import { RecordActivity, RecordNoteFoot, logChange } from "./network-log";
import { LEAF_TERRITORIES, leafTerrIds, monthValue, repAreasStore, repsOn, terrById, terrChildren, terrPath, typeIn } from "./network-model";

// ════════════════════════════════════════════════════════════════════════════
// TERRITORIES — the Area tree (Region › Area › Territory) and who covers it
//
// A calm indented list: each node carries its reps, its customers and this
// month's orders through the hub (valued by the one engine). A node opens in
// the panel (`?t=`), where a manager assigns a rep or moves a customer.
// Rep ↔ territory is local here (REPS is a constant — network-model.ts).
// ════════════════════════════════════════════════════════════════════════════

const LEVEL_NAME: Record<Territory["level"], string> = { region: "Region", area: "Area", territory: "Territory" };

function useNodeStats() {
  const customers = useStore(customersStore);
  const hub = useStore(hubStore);
  const schemes = useStore(schemesStore);
  const areas = useStore(repAreasStore);
  return React.useCallback(
    (id: string) => {
      const leaves = leafTerrIds(id);
      const cust = customers.filter((c) => leaves.includes(c.territoryId));
      return { leaves, cust, reps: repsOn(leaves, areas), value: monthValue(hub, new Set(cust.map((c) => c.id)), schemes) };
    },
    [customers, hub, schemes, areas],
  );
}

export function TerritoriesPage() {
  const [search, setSearch] = useSearchParams();
  const sel = search.get("t");
  const stats = useNodeStats();
  const areas = useStore(repAreasStore);
  const [closed, setClosed] = React.useState<Set<string>>(() => new Set());
  const pick = (id: string | null) => {
    const next = new URLSearchParams(search);
    if (id) next.set("t", id);
    else next.delete("t");
    setSearch(next);
  };
  const toggle = (id: string) =>
    setClosed((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const everything = TERRITORIES.filter((t) => !t.parentId).map((r) => stats(r.id));
  const monthTotal = everything.reduce((s, x) => s + x.value, 0);
  const uncovered = LEAF_TERRITORIES.filter((t) => repsOn([t.id], areas).length === 0);

  const node = (t: Territory, depth: number): React.ReactNode => {
    const s = stats(t.id);
    const kids = terrChildren(t.id);
    const isOpen = !closed.has(t.id);
    const salesReps = s.reps.filter((r) => r.role !== "Area manager");
    return (
      <li key={t.id}>
        <div className={cn("group flex min-h-[52px] items-center gap-2 py-2 pr-1", sel === t.id && "bg-bz-fire/10")}>
          {kids.length > 0 ? (
            <button
              type="button"
              onClick={() => toggle(t.id)}
              aria-expanded={isOpen}
              aria-label={isOpen ? `Collapse ${t.name}` : `Expand ${t.name}`}
              className="flex size-6 shrink-0 items-center justify-center rounded-bz-sm text-bz-text-soft hover:bg-bz-paper-warm hover:text-bz-text"
            >
              <ChevronRight size={13} className={cn("transition-transform duration-150", isOpen && "rotate-90")} />
            </button>
          ) : (
            <span className="w-6 shrink-0" />
          )}
          <button type="button" onClick={() => pick(t.id)} className="min-w-0 flex-1 text-left">
            <span className={cn("block truncate text-bz-text group-hover:underline", depth === 0 ? "text-[13px] font-semibold" : "text-[12.5px] font-medium")}>{t.name}</span>
            <span className="block truncate text-[11px] text-bz-text-soft">
              {LEVEL_NAME[t.level]}
              {kids.length > 0 && ` · ${s.leaves.length} ${s.leaves.length === 1 ? "territory" : "territories"}`}
              <span className="md:hidden"> · {s.cust.length} customers</span>
              {t.level === "territory" && (salesReps.length ? ` · ${salesReps.map((r) => r.name).join(", ")}` : " · no rep")}
            </span>
          </button>
          <span className="hidden w-[150px] shrink-0 md:block">
            <RepMarks ids={s.reps.map((r) => r.id)} />
          </span>
          <span className={cn("hidden w-[80px] shrink-0 text-right text-[11.5px] text-bz-text-muted md:block", NUM)}>{s.cust.length}</span>
          <Money value={s.value} code={false} className={cn("w-[96px] shrink-0 text-right text-[12px]", s.value ? "font-medium text-bz-text" : "text-bz-text-soft")} />
        </div>
        {kids.length > 0 && isOpen && <ul className="m-0 ml-3 list-none border-l border-bz-line-soft p-0 pl-3">{kids.map((k) => node(k, depth + 1))}</ul>}
      </li>
    );
  };

  return (
    <SfShell page="territories" panel={sel && terrById(sel) ? <TerritoryPanel id={sel} onClose={() => pick(null)} onPick={pick} /> : null}>
      <Page width="full" className="max-w-[1160px]">
        <PageIntro>Regions, areas and territories — who covers each, and what it ordered this month.</PageIntro>
        <Figures
          items={[
            { label: "Territories", value: LEAF_TERRITORIES.length, sub: `in ${TERRITORIES.filter((t) => t.level === "region").length} regions` },
            { label: "Reps", value: REPS.length, sub: "covering them" },
            { label: "No rep", value: uncovered.length, sub: uncovered.length ? uncovered.map((t) => t.name).join(", ") : "every territory is covered", tone: uncovered.length ? "danger" : undefined },
            { label: "September orders", value: <Money value={monthTotal} />, sub: "through the orders hub" },
          ]}
        />

        <div className="mt-10">
          <div className="hidden items-center gap-2 pb-2 pr-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-bz-text-soft md:flex">
            <span className="min-w-0 flex-1 pl-8">Territory</span>
            <span className="w-[150px]">Reps</span>
            <span className="w-[80px] text-right">Customers</span>
            <span className="w-[96px] text-right">This month</span>
          </div>
          <ul className="m-0 list-none divide-y divide-bz-line-soft border-y border-bz-line-soft p-0">{terrChildren(null).map((r) => node(r, 0))}</ul>
          <p className="m-0 mt-4 text-[11px] text-bz-text-soft">The tree is the Area master. Add or rename areas there; reps and customers are assigned here.</p>
        </div>
      </Page>
    </SfShell>
  );
}

function RepMarks({ ids }: { ids: string[] }) {
  if (!ids.length) return <span className="text-[11px] text-bz-red">No rep</span>;
  const shown = ids.slice(0, 4);
  return (
    <span className="flex items-center" title={ids.map((i) => REPS.find((r) => r.id === i)?.name).join(", ")}>
      {shown.map((i, k) => {
        const r = REPS.find((x) => x.id === i)!;
        return (
          <span key={i} className={cn("flex size-6 items-center justify-center rounded-bz-pill border-2 border-bz-surface bg-bz-paper-warm text-[9.5px] font-semibold text-bz-text-muted", k > 0 && "-ml-1.5")}>
            {r.initials}
          </span>
        );
      })}
      {ids.length > shown.length && <span className={cn("ml-1 text-[10.5px] text-bz-text-soft", NUM)}>+{ids.length - shown.length}</span>}
    </span>
  );
}

// ── Panel ───────────────────────────────────────────────────────────────────

function TerritoryPanel({ id, onClose, onPick }: { id: string; onClose: () => void; onPick: (id: string) => void }) {
  const navigate = useNavigate();
  const t = terrById(id)!;
  const stats = useNodeStats();
  const s = stats(id);
  const types = useStore(typesStore);
  const areas = useStore(repAreasStore);
  const { toast, show, dismiss } = useToast();
  const [dialog, setDialog] = React.useState<null | "assign" | { move: string | null }>(null);
  const [openType, setOpenType] = React.useState<string | null>(null);
  React.useEffect(() => setOpenType(null), [id]);
  const path = terrPath(id);
  const kids = terrChildren(id);
  const subject = `territory:${id}`;
  const byType = types.map((ty) => ({ ty, rows: s.cust.filter((c) => c.typeId === ty.id) })).filter((g) => g.rows.length);
  const unknown = s.cust.filter((c) => !types.some((ty) => ty.id === c.typeId));
  const visits = s.cust.reduce((sum, c) => sum + typeIn(types, c.typeId).visitsPer4w, 0);
  const fieldReps = s.reps.filter((r) => r.role !== "Area manager");

  const removeRep = (repId: string) => {
    const name = REPS.find((r) => r.id === repId)?.name;
    const before = areas[repId] ?? [];
    repAreasStore.set((a) => ({ ...a, [repId]: (a[repId] ?? []).filter((x) => !s.leaves.includes(x)) }));
    logChange(subject, `took ${name} off ${t.name}`);
    show("info", `${name} no longer covers ${t.name}.`, { label: "Undo", run: () => repAreasStore.set((a) => ({ ...a, [repId]: before })) });
  };

  return (
    <SidePanel
      open
      width={600}
      onClose={onClose}
      eyebrow={`${LEVEL_NAME[t.level]}${path.length > 1 ? ` · ${path.slice(0, -1).map((p) => p.name).join(" › ")}` : ""}`}
      title={t.name}
      meta={
        <>
          <span className={NUM}>{s.cust.length} customers</span>
          <span className={NUM}>
            {s.reps.length} {s.reps.length === 1 ? "rep" : "reps"}
          </span>
          <span>
            <Money value={s.value} /> this month
          </span>
        </>
      }
      actions={
        <Link to={`${sfPath("customers")}?terr=${id}`} className={cn(GHOST_SM, "hidden sm:inline-flex")}>
          Customers
        </Link>
      }
      foot={<RecordNoteFoot subject={subject} />}
    >
      <Section
        title="Reps"
        count={s.reps.length}
        className="mt-2"
        action={
          <button type="button" onClick={() => setDialog("assign")} className={GHOST_SM}>
            <UserPlus size={12} /> Assign rep
          </button>
        }
      >
        {s.reps.length === 0 ? (
          <p className="m-0 text-[11.5px] text-bz-red">Nobody covers {t.name}. Its customers get no visits.</p>
        ) : (
          <ul className="m-0 list-none divide-y divide-bz-line-soft border-y border-bz-line-soft p-0">
            {s.reps.map((r) => {
              const elsewhere = (areas[r.id] ?? []).filter((x) => !s.leaves.includes(x)).map((x) => terrById(x)?.name);
              return (
                <li key={r.id} className="flex items-center gap-3 px-1 py-2">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-bz-pill bg-bz-paper-warm text-[10px] font-semibold text-bz-text-muted">{r.initials}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[12px] font-medium text-bz-text">{r.name}</span>
                    <span className="block truncate text-[11px] text-bz-text-soft">
                      {r.role}
                      {elsewhere.length > 0 && ` · also ${elsewhere.join(", ")}`}
                    </span>
                  </span>
                  <button type="button" onClick={() => removeRep(r.id)} className="shrink-0 text-[11px] text-bz-text-soft hover:text-bz-red">
                    Remove
                  </button>
                </li>
              );
            })}
          </ul>
        )}
        {visits > 0 && (
          <p className="m-0 mt-3 text-[11px] text-bz-text-soft">
            Its customers need about {visits} visits every 4 weeks by their types{fieldReps.length ? ` — ${Math.round(visits / fieldReps.length)} per field rep` : ""}.
          </p>
        )}
      </Section>

      <Section
        title="Customers by type"
        count={s.cust.length}
        className="mt-8"
        action={
          s.cust.length > 0 && (
            <button type="button" onClick={() => setDialog({ move: null })} className={GHOST_SM}>
              <ArrowRightLeft size={12} /> Move customer
            </button>
          )
        }
      >
        {s.cust.length === 0 ? (
          <p className="m-0 text-[11.5px] text-bz-text-soft">No customers here yet.</p>
        ) : (
          <ul className="m-0 list-none divide-y divide-bz-line-soft border-y border-bz-line-soft p-0">
            {[...byType.map((g) => ({ key: g.ty.id, label: g.ty.plural, color: g.ty.color, rows: g.rows })), ...(unknown.length ? [{ key: "?", label: "No type", color: 8, rows: unknown }] : [])].map((g) => {
              const on = openType === g.key;
              return (
                <li key={g.key}>
                  <button type="button" onClick={() => setOpenType(on ? null : g.key)} aria-expanded={on} className="flex w-full items-center gap-2 px-1 py-2.5 text-left hover:bg-bz-paper-warm/60">
                    <ChevronRight size={12} className={cn("shrink-0 text-bz-text-soft transition-transform duration-150", on && "rotate-90")} />
                    <TypeMark name={g.label} color={g.color} className="min-w-0 flex-1 text-[12px] text-bz-text" />
                    <span className={cn("shrink-0 text-[11.5px] text-bz-text-muted", NUM)}>{g.rows.length}</span>
                    <Money value={g.rows.reduce((sum, c) => sum + c.outstanding, 0)} code={false} className="w-[88px] shrink-0 text-right text-[11.5px] text-bz-text-soft" />
                  </button>
                  {on && (
                    <ul className="m-0 mb-2 ml-5 list-none border-l border-bz-line-soft p-0 pl-3">
                      {g.rows.map((c) => (
                        <li key={c.id} className="flex items-center gap-3 py-1.5">
                          <button type="button" onClick={() => navigate(sfPath(`customers/${c.id}`))} className="min-w-0 flex-1 text-left">
                            <span className="block truncate text-[12px] text-bz-text hover:underline">{c.name}</span>
                            <span className="block truncate text-[10.5px] text-bz-text-soft">
                              {terrById(c.territoryId)?.name} · {REPS.find((r) => r.id === c.repId)?.name ?? "no rep"}
                            </span>
                          </button>
                          <button type="button" onClick={() => setDialog({ move: c.id })} className="shrink-0 text-[11px] text-bz-text-soft hover:text-bz-text">
                            Move
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Section>

      {kids.length > 0 && (
        <Section title={t.level === "region" ? "Areas" : "Territories"} count={kids.length} className="mt-8">
          <ul className="m-0 list-none divide-y divide-bz-line-soft border-y border-bz-line-soft p-0">
            {kids.map((k) => {
              const ks = stats(k.id);
              return (
                <li key={k.id}>
                  <button type="button" onClick={() => onPick(k.id)} className="flex w-full items-center gap-3 px-1 py-2 text-left hover:bg-bz-paper-warm/60">
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[12px] font-medium text-bz-text">{k.name}</span>
                      <span className="block truncate text-[11px] text-bz-text-soft">
                        {ks.cust.length} customers · {ks.reps.length ? ks.reps.map((r) => r.name).join(", ") : "no rep"}
                      </span>
                    </span>
                    <Money value={ks.value} code={false} className="shrink-0 text-[12px] text-bz-text" />
                  </button>
                </li>
              );
            })}
          </ul>
        </Section>
      )}

      <RecordActivity subject={subject} />

      <AssignRepDialog open={dialog === "assign"} node={t} leaves={s.leaves} onClose={() => setDialog(null)} onDone={(m) => show("success", m)} />
      <MoveCustomerDialog open={typeof dialog === "object" && dialog !== null} initial={typeof dialog === "object" && dialog ? dialog.move : null} customers={s.cust} onClose={() => setDialog(null)} onDone={(m) => show("success", m)} />
      <ToastHost toast={toast} onDismiss={dismiss} />
    </SidePanel>
  );
}

function AssignRepDialog({ open, node, leaves, onClose, onDone }: { open: boolean; node: Territory; leaves: string[]; onClose: () => void; onDone: (m: string) => void }) {
  const areas = useStore(repAreasStore);
  const [repId, setRepId] = React.useState<string | null>(null);
  React.useEffect(() => setRepId(null), [open]);
  const options = REPS.map((r) => {
    const has = leaves.every((l) => (areas[r.id] ?? []).includes(l));
    const now = (areas[r.id] ?? []).map((x) => terrById(x)?.name).join(", ");
    return { value: r.id, label: r.name, hint: `${r.role}${now ? ` · ${now}` : " · no territory"}`, disabled: has };
  });
  const rep = REPS.find((r) => r.id === repId);
  const save = () => {
    if (!rep) return;
    repAreasStore.set((a) => ({ ...a, [rep.id]: [...new Set([...(a[rep.id] ?? []), ...leaves])] }));
    logChange(`territory:${node.id}`, `assigned ${rep.name}${leaves.length > 1 ? ` to all ${leaves.length} territories` : ""}`);
    onDone(`${rep.name} now covers ${node.name}.`);
    onClose();
  };
  return (
    <Dialog
      open={open}
      eyebrow={node.name}
      title="Assign a rep"
      onClose={onClose}
      foot={
        <>
          <button type="button" className={GHOST} onClick={onClose}>
            Cancel
          </button>
          <button type="button" className={BTN} onClick={save} disabled={!rep}>
            Assign
          </button>
        </>
      }
    >
      <Field label="Rep" hint={leaves.length > 1 ? `Covers every territory in ${node.name}: ${leaves.map((l) => terrById(l)?.name).join(", ")}.` : "Keeps the territories the rep already covers."}>
        <Select trigger="ghost" width={320} value={repId} onChange={setRepId} label={rep?.name ?? "Pick a rep"} className="w-full justify-between" options={options} />
      </Field>
    </Dialog>
  );
}

function MoveCustomerDialog({ open, initial, customers, onClose, onDone }: { open: boolean; initial: string | null; customers: Customer[]; onClose: () => void; onDone: (m: string) => void }) {
  const areas = useStore(repAreasStore);
  const [cid, setCid] = React.useState<string | null>(initial);
  const [to, setTo] = React.useState<string | null>(null);
  const [handOver, setHandOver] = React.useState(true);
  React.useEffect(() => {
    setCid(initial);
    setTo(null);
    setHandOver(true);
  }, [open, initial]);
  const c = customers.find((x) => x.id === cid);
  const target = terrById(to);
  const newRep = to ? REPS.find((r) => r.role !== "Area manager" && (areas[r.id] ?? []).includes(to)) : undefined;
  const save = () => {
    if (!c || !target) return;
    const from = terrById(c.territoryId);
    customersStore.set((cs) => cs.map((x) => (x.id === c.id ? { ...x, territoryId: target.id, repId: handOver && newRep ? newRep.id : x.repId } : x)));
    const what = `moved ${c.name} from ${from?.name} to ${target.name}${handOver && newRep ? `, rep ${newRep.name}` : ""}`;
    logChange(`customer:${c.id}`, what.replace(`moved ${c.name}`, "moved the customer"));
    if (from) logChange(`territory:${from.id}`, what);
    logChange(`territory:${target.id}`, what);
    onDone(`${c.name} moved to ${target.name}.`);
    onClose();
  };
  return (
    <Dialog
      open={open}
      title="Move a customer"
      onClose={onClose}
      foot={
        <>
          <button type="button" className={GHOST} onClick={onClose}>
            Cancel
          </button>
          <button type="button" className={BTN} onClick={save} disabled={!c || !target}>
            Move
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Field label="Customer">
          <Select trigger="ghost" width={320} value={cid} onChange={setCid} label={c?.name ?? "Pick a customer"} className="w-full justify-between" options={customers.map((x) => ({ value: x.id, label: x.name, hint: `${terrById(x.territoryId)?.name} · ${x.city}` }))} searchable />
        </Field>
        <Field label="To territory">
          <Select
            trigger="ghost"
            width={320}
            value={to}
            onChange={setTo}
            label={target?.name ?? "Pick a territory"}
            className="w-full justify-between"
            options={LEAF_TERRITORIES.map((l) => ({ value: l.id, label: l.name, group: terrPath(l.id)[0]?.name, disabled: l.id === c?.territoryId }))}
          />
        </Field>
        <label className="flex items-start gap-2 text-[12px] text-bz-text">
          <Checkbox on={handOver && !!newRep} onChange={setHandOver} label="Hand it to the rep there" />
          <span className={cn(!newRep && "text-bz-text-soft")}>{newRep ? `Hand it to ${newRep.name}, who covers ${target?.name}` : target ? `Nobody covers ${target.name} — the rep stays as it is` : "Hand it to the rep who covers the new territory"}</span>
        </label>
      </div>
    </Dialog>
  );
}

export const TERRITORIES_ROUTES = [{ path: "design/salesforce/territories", Component: TerritoriesPage }];
