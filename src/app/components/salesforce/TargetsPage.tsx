import * as React from "react";
import { Award, ChevronLeft, ChevronRight, Eraser, Footprints, MoreHorizontal, Pencil, Plus, Store, Target as TargetIcon } from "lucide-react";
import { cn } from "../ui/utils";
import { BTN, INPUT, MenuItem, NUM, Popover, ToastHost, useToast } from "../sales/bzw";
import { Amount } from "../sales/orders";
import { useStore } from "../sales/store";
import { SF_TODAY } from "./data";
import type { Target } from "./data";
import { npr } from "./engine";
import { INCENTIVE_RULE, THIS_MONTH, incentiveOf, monthLabel, pct, repActuals } from "./field-data";
import { useFieldStores } from "./field-kit";
import { Gauge, HEAD_BTN, Kpi, Panel, TickBar, short } from "./fx";
import { FxEmpty } from "./fx-table";
import { openQuickAdd } from "./quickadd";
import { logEvent } from "./records";
import { ledgerStore, targetsStore } from "./store";
import { SfShell, Who } from "./sf";

// ════════════════════════════════════════════════════════════════════════════
// TEAM · TARGETS — one month's goals per rep
//
// Four figures for the team, then one row per rep: the month's sales on a dial,
// outlets on a tick bar, new outlets, and the incentive they come to. The three
// goals are edited in the row — click a figure — and saved by the row. Actuals
// are never stored: they are counted from approved orders and finished visits
// (field-data `repActuals`) and follow the month shown.
// ════════════════════════════════════════════════════════════════════════════

type Goal = { sales: number; outlets: number; fresh: number };
type GoalField = keyof Goal;
/** The one row being edited: what is typed, and the field the click landed on. */
type Edit = { repId: string; goal: Goal; focus: GoalField };

const whole = (n: number) => Math.max(0, Math.round(n || 0));
const goalOf = (t: Target | undefined): Goal => ({ sales: t?.salesTarget ?? 0, outlets: t?.outletsTarget ?? 0, fresh: t?.newOutletsTarget ?? 0 });
const sameGoal = (a: Goal, b: Goal) => whole(a.sales) === whole(b.sales) && whole(a.outlets) === whole(b.outlets) && whole(a.fresh) === whole(b.fresh);
const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

/** "2026-09" moved by `d` months. */
function stepMonth(m: string, d: number) {
  const n = Number(m.slice(0, 4)) * 12 + Number(m.slice(5, 7)) - 1 + d;
  return `${Math.floor(n / 12)}-${String((n % 12) + 1).padStart(2, "0")}`;
}
const daysIn = (m: string) => new Date(Date.UTC(Number(m.slice(0, 4)), Number(m.slice(5, 7)), 0)).getUTCDate();

const SALES_RULE = "Approved orders credited to the rep in the month, including orders billed to a shop's distributor";
const OUTLETS_RULE = "Outlets the rep finished a visit at in the month";
const NEW_RULE = "Shops whose first order came from the rep in the month, direct or through their distributor";

/** A table from 1000px of panel; below that a rep is a card — the name, then the four figures under their captions. */
const TRACKS = "@[1000px]:grid-cols-[minmax(170px,1.2fr)_minmax(210px,1.3fr)_minmax(150px,1fr)_104px_108px_128px]";
const CAP = "mb-1 block text-[11px] text-bz-text-soft @[1000px]:hidden";
/** A figure that opens its row for editing: the wash on hover says so. */
const CELL_BTN = "-mx-2 block w-[calc(100%+1rem)] min-w-0 rounded-[10px] px-2 py-1.5 text-left transition-colors hover:bg-bz-paper-warm focus-visible:outline-2 focus-visible:outline-bz-fire";
const ICON = "flex size-8 shrink-0 items-center justify-center rounded-bz-md text-bz-text-soft transition-colors hover:bg-bz-paper-warm hover:text-bz-text focus-visible:outline-2 focus-visible:outline-bz-fire";
const STEP = "flex h-full w-8 shrink-0 items-center justify-center text-bz-text-muted transition-colors hover:bg-bz-paper-warm hover:text-bz-text focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-bz-fire";

export function TargetsPage() {
  const s = useFieldStores();
  // Sales are what the hub billed, so an invoice landing re-counts the page.
  useStore(ledgerStore);
  const { toast, show, dismiss } = useToast();
  const [month, setMonthRaw] = React.useState(THIS_MONTH);
  const [edit, setEdit] = React.useState<Edit | null>(null);
  const [menu, setMenu] = React.useState<{ repId: string; anchor: HTMLElement } | null>(null);

  // A row that closes hands focus back to its own verb, so the keyboard stays where the work was.
  const verbs = React.useRef(new Map<string, HTMLButtonElement>());
  const back = React.useRef<string | null>(null);
  React.useEffect(() => {
    if (edit || !back.current) return;
    verbs.current.get(back.current)?.focus({ preventScroll: true });
    back.current = null;
  }, [edit]);
  const verbRef = (repId: string) => (el: HTMLButtonElement | null) => {
    if (el) verbs.current.set(repId, el);
    else verbs.current.delete(repId);
  };

  const stored = (repId: string, m: string) => s.targets.find((x) => x.repId === repId && x.month === m);
  const sentence = (t: Target) => `set the ${monthLabel(t.month)} target: NPR ${npr(t.salesTarget)} sales, ${t.outletsTarget} outlets, ${t.newOutletsTarget} new outlets`;

  /** Write the open row, if what was typed differs from what is stored. */
  const write = (e: Edit) => {
    const rep = s.reps.find((r) => r.id === e.repId);
    const row: Target = { repId: e.repId, month, salesTarget: whole(e.goal.sales), outletsTarget: whole(e.goal.outlets), newOutletsTarget: whole(e.goal.fresh) };
    if (!rep || sameGoal(goalOf(row), goalOf(stored(e.repId, month)))) return;
    targetsStore.set((list) => (list.some((x) => x.repId === row.repId && x.month === row.month) ? list.map((x) => (x.repId === row.repId && x.month === row.month ? row : x)) : [...list, row]));
    logEvent(row.repId, sentence(row));
    show("success", `${rep.name}'s target saved`);
  };
  const close = (save: boolean) => {
    if (!edit) return;
    if (save) write(edit);
    back.current = edit.repId;
    setEdit(null);
  };
  /** One row edits at a time: opening another saves the one that was open, as leaving a row of a grid does. */
  const open = (repId: string, focus: GoalField) => {
    if (edit?.repId === repId) return;
    if (edit) write(edit);
    setEdit({ repId, goal: goalOf(stored(repId, month)), focus });
  };
  const setMonth = (m: string) => {
    if (edit) write(edit);
    setEdit(null);
    setMonthRaw(m);
  };
  const type = (patch: Partial<Goal>) => setEdit((e) => (e ? { ...e, goal: { ...e.goal, ...patch } } : e));

  const clear = (repId: string, name: string) => {
    const was = stored(repId, month);
    if (!was) return;
    targetsStore.set((list) => list.filter((x) => !(x.repId === repId && x.month === month)));
    logEvent(repId, `cleared the ${monthLabel(month)} target`);
    setEdit((e) => (e?.repId === repId ? null : e));
    show("success", `${name}'s target cleared`, {
      label: "Undo",
      run: () => {
        targetsStore.set((list) => [...list.filter((x) => !(x.repId === was.repId && x.month === was.month)), was]);
        logEvent(repId, sentence(was));
      },
    });
  };

  if (!s.reps.length) {
    return (
      <SfShell current="targets">
        <div className="h-full overflow-y-auto px-4 pb-8 [scrollbar-width:thin] md:px-6">
          <Panel>
            <FxEmpty title="No reps yet.">
              <button type="button" className={BTN} onClick={() => openQuickAdd("rep")}>
                <Plus size={13} /> New rep
              </button>
            </FxEmpty>
          </Panel>
        </div>
      </SfShell>
    );
  }

  const rows = s.reps
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((r) => {
      const t = stored(r.id, month);
      const editing = edit?.repId === r.id;
      const draft = editing && !sameGoal(edit.goal, goalOf(t)) ? edit.goal : undefined;
      const g = draft ?? goalOf(t);
      const a = repActuals(r.id, month);
      // What the row counts against: the stored target, or what is being typed.
      const eff: Target | undefined = t || draft ? { repId: r.id, month, salesTarget: whole(g.sales), outletsTarget: whole(g.outlets), newOutletsTarget: whole(g.fresh) } : undefined;
      return { r, t, a, eff, ed: editing ? edit : null, dirty: !!draft, incentive: incentiveOf(eff, a) };
    });

  const withT = rows.filter((x) => x.eff);
  const salesT = withT.reduce((n, x) => n + x.eff!.salesTarget, 0);
  const salesA = rows.reduce((n, x) => n + x.a.sales, 0);
  const outletsT = withT.reduce((n, x) => n + x.eff!.outletsTarget, 0);
  const outletsA = rows.reduce((n, x) => n + x.a.outlets, 0);
  const newT = withT.reduce((n, x) => n + x.eff!.newOutletsTarget, 0);
  const newA = rows.reduce((n, x) => n + x.a.newOutlets, 0);
  const incentive = rows.reduce((n, x) => n + x.incentive, 0);
  const earning = rows.filter((x) => x.incentive > 0).length;
  const now = month === THIS_MONTH;

  const figures = [
    { label: "Team", value: salesT ? `${short(salesA)} of ${short(salesT)}` : short(salesA), title: SALES_RULE },
    ...(now ? [{ label: "Day", value: `${Number(SF_TODAY.slice(8, 10))} of ${daysIn(month)}`, title: "How far into the month today is" }] : []),
  ];
  const menuRow = menu ? rows.find((x) => x.r.id === menu.repId) : undefined;

  return (
    <SfShell
      current="targets"
      meta={figures.map((m, i) => (
        <span key={m.label} title={m.title} className="inline-flex items-center gap-1.5 whitespace-nowrap max-md:hidden">
          {i > 0 && <span aria-hidden className="mr-1.5 size-[3px] rounded-bz-pill bg-bz-line" />}
          <span className="text-bz-text-soft">{m.label}</span>
          <span className="font-semibold text-bz-text">{m.value}</span>
        </span>
      ))}
      actions={
        <>
          {!now && (
            <button type="button" className={HEAD_BTN} onClick={() => setMonth(THIS_MONTH)}>
              This month
            </button>
          )}
          <div className="inline-flex h-9 shrink-0 items-center overflow-hidden rounded-bz-md border border-bz-line-soft bg-bz-surface">
            <button type="button" className={STEP} onClick={() => setMonth(stepMonth(month, -1))} title="Previous month" aria-label="Previous month">
              <ChevronLeft size={15} />
            </button>
            <span aria-live="polite" className={cn("min-w-[118px] px-1 text-center text-[12.5px] font-medium text-bz-text", NUM)}>
              {monthLabel(month)}
            </span>
            <button type="button" className={STEP} onClick={() => setMonth(stepMonth(month, 1))} title="Next month" aria-label="Next month">
              <ChevronRight size={15} />
            </button>
          </div>
        </>
      }
    >
      <div className="h-full overflow-y-auto px-4 pb-8 [scrollbar-width:thin] md:px-6">
        <div className="grid grid-cols-1 gap-3">
          {/* ── Four figures ── */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Kpi
              icon={TargetIcon}
              label="Team sales"
              unit="NPR"
              value={short(salesA)}
              title={`${SALES_RULE}. NPR ${npr(salesA)}${salesT ? ` of NPR ${npr(salesT)}` : ""}.`}
              extra={salesT > 0 && <TickBar pct={pct(salesA, salesT)} ink="accent" ticks={18} className="w-24" />}
              note={salesT ? `${pct(salesA, salesT)}% of ${short(salesT)}` : "no target set"}
            />
            <Kpi
              icon={Footprints}
              label="Outlets visited"
              value={outletsA}
              title={OUTLETS_RULE}
              extra={outletsT > 0 && <TickBar pct={pct(outletsA, outletsT)} ink="accent" ticks={18} className="w-24" />}
              note={outletsT ? `${pct(outletsA, outletsT)}% of ${outletsT}` : "no target set"}
            />
            <Kpi
              icon={Store}
              label="New outlets"
              value={newA}
              title={NEW_RULE}
              extra={newT > 0 && <TickBar pct={pct(newA, newT)} ink="accent" ticks={18} className="w-24" />}
              note={newT ? `${pct(newA, newT)}% of ${newT}` : "no target set"}
            />
            <Kpi icon={Award} label={now ? "Incentive so far" : "Incentive"} unit="NPR" value={short(incentive)} title={`${INCENTIVE_RULE} NPR ${npr(incentive)} for ${monthLabel(month)}.`} note={earning ? `${earning} of ${plural(rows.length, "rep")}` : "none yet"} />
          </div>

          {/* ── By rep ── */}
          <Panel title="By rep" flush right={<span className={cn("mr-1.5 text-[11px] text-bz-text-soft", NUM)}>{`${withT.length} of ${rows.length} with a target`}</span>}>
            <div className="@container">
              <div className={cn("hidden h-10 items-center gap-x-4 border-b border-bz-line-soft px-4 text-[12px] text-bz-text-soft @[1000px]:grid", TRACKS)}>
                <span>Rep</span>
                <span title={SALES_RULE}>Sales</span>
                <span title={OUTLETS_RULE}>Outlets</span>
                <span title={NEW_RULE}>New outlets</span>
                <span className="text-right" title={INCENTIVE_RULE}>
                  Incentive
                </span>
                <span />
              </div>

              <div role="list" aria-label={`Targets for ${monthLabel(month)}`} className="border-t border-bz-line-soft @[1000px]:border-t-0">
                {rows.map(({ r, t, a, eff, ed, dirty, incentive: inc }) => {
                  const editing = !!ed;
                  const sales = eff?.salesTarget ?? 0;
                  const outlets = eff?.outletsTarget ?? 0;
                  const fresh = eff?.newOutletsTarget ?? 0;
                  return (
                    <div
                      key={r.id}
                      role="listitem"
                      data-bzw-editing={editing ? "" : undefined}
                      onKeyDown={
                        editing
                          ? (e) => {
                              if (e.key === "Escape") (e.preventDefault(), e.stopPropagation(), close(false));
                              else if (e.key === "Enter" && (e.target as HTMLElement).tagName === "INPUT") (e.preventDefault(), close(true));
                            }
                          : undefined
                      }
                      className={cn(
                        "relative grid grid-cols-2 gap-x-4 gap-y-3 border-b border-bz-line-soft px-4 py-3.5 transition-colors last:border-b-0 @[620px]:grid-cols-4 @[1000px]:min-h-16 @[1000px]:items-center @[1000px]:py-2",
                        TRACKS,
                        editing && "bg-[color-mix(in_srgb,var(--fx-accent)_9%,var(--bz-surface))]",
                      )}
                    >
                      {editing && <span aria-hidden className="absolute inset-y-0 left-0 w-0.5 bg-[var(--fx-accent)]" />}

                      {/* Who, and the row's verb: one line of the card; the first and the last track of the table. */}
                      <div className="col-span-full flex min-w-0 items-center gap-3 @[1000px]:contents">
                        <span className="flex min-w-0 flex-1 items-center gap-3">
                          <Who name={r.name} size={32} />
                          <span className="min-w-0">
                            <span className="block truncate text-[13px] font-semibold text-bz-text">{r.name}</span>
                            <span className="block truncate text-[11.5px] text-bz-text-soft">{r.role}</span>
                          </span>
                        </span>
                        <span className="flex shrink-0 items-center justify-end gap-1.5 @[1000px]:order-last">
                          {editing ? (
                            <>
                              <button type="button" className={cn(HEAD_BTN, "h-8 px-2.5")} onClick={() => close(false)} title="Cancel (Esc)">
                                Cancel
                              </button>
                              <button type="button" className={cn(BTN, "h-8 px-3 text-[12.5px]")} disabled={!dirty} onClick={() => close(true)} title="Save (Enter)">
                                Save
                              </button>
                            </>
                          ) : t ? (
                            <span className="flex items-center gap-0.5">
                              <button ref={verbRef(r.id)} type="button" className={ICON} onClick={() => open(r.id, "sales")} title="Edit target" aria-label={`Edit ${r.name}'s target`}>
                                <Pencil size={14} />
                              </button>
                              <button type="button" className={ICON} onClick={(e) => setMenu({ repId: r.id, anchor: e.currentTarget })} title="More" aria-label={`More for ${r.name}`} aria-haspopup="menu" aria-expanded={menu?.repId === r.id}>
                                <MoreHorizontal size={15} />
                              </button>
                            </span>
                          ) : (
                            <button ref={verbRef(r.id)} type="button" className={cn(HEAD_BTN, "h-8")} onClick={() => open(r.id, "sales")}>
                              Set target
                            </button>
                          )}
                        </span>
                      </div>

                      {/* Sales */}
                      <div className="min-w-0">
                        <span className={CAP}>Sales</span>
                        {ed ? (
                          <Typing lead={`${short(a.sales)} of`}>
                            <GoalInput money focus={ed.focus === "sales"} value={ed.goal.sales} onChange={(v) => type({ sales: v })} label={`${r.name}'s sales target, in NPR`} />
                          </Typing>
                        ) : (
                          <button
                            type="button"
                            onClick={() => open(r.id, "sales")}
                            title={`NPR ${npr(a.sales)}${sales ? ` of NPR ${npr(sales)}` : ""} · ${plural(a.orders, "approved order")}`}
                            className={cn(CELL_BTN, "flex items-center gap-3")}
                          >
                            <Gauge pct={sales ? pct(a.sales, sales) : 0} ink="accent" label={sales ? `${pct(a.sales, sales)}%` : "—"} className="w-[72px] shrink-0" />
                            <span className={cn("min-w-0", NUM)}>
                              <span className="block truncate text-[13px] font-semibold text-bz-text">{short(a.sales)}</span>
                              <span className="block truncate text-[11.5px] text-bz-text-soft">{sales ? `of ${short(sales)}` : "no target"}</span>
                            </span>
                          </button>
                        )}
                      </div>

                      {/* Outlets */}
                      <div className="min-w-0">
                        <span className={CAP}>Outlets</span>
                        {ed ? (
                          <Typing lead={`${a.outlets} of`}>
                            <GoalInput focus={ed.focus === "outlets"} value={ed.goal.outlets} onChange={(v) => type({ outlets: v })} label={`${r.name}'s outlet target`} />
                          </Typing>
                        ) : (
                          <button type="button" onClick={() => open(r.id, "outlets")} title={`${plural(a.outlets, "outlet")} visited${outlets ? ` of ${outlets}` : ""}`} className={CELL_BTN}>
                            <span className="block max-w-[220px]">
                              <span className={cn("flex items-baseline gap-1.5", NUM)}>
                                <span className="text-[13px] font-semibold text-bz-text">{a.outlets}</span>
                                {outlets > 0 && <span className="text-[11.5px] text-bz-text-soft">of {outlets}</span>}
                                {outlets > 0 && <span className="ml-auto text-[11.5px] text-bz-text-soft">{pct(a.outlets, outlets)}%</span>}
                              </span>
                              {outlets > 0 && <TickBar pct={pct(a.outlets, outlets)} ink="accent" ticks={28} className="mt-1.5 h-2.5" />}
                            </span>
                          </button>
                        )}
                      </div>

                      {/* New outlets */}
                      <div className="min-w-0">
                        <span className={CAP}>New outlets</span>
                        {ed ? (
                          <Typing lead={`${a.newOutlets} of`}>
                            <GoalInput focus={ed.focus === "fresh"} value={ed.goal.fresh} onChange={(v) => type({ fresh: v })} label={`${r.name}'s new outlet target`} />
                          </Typing>
                        ) : (
                          <button type="button" onClick={() => open(r.id, "fresh")} title={`${plural(a.newOutlets, "new outlet")}${fresh ? ` of ${fresh} · ${pct(a.newOutlets, fresh)}%` : ""}`} className={CELL_BTN}>
                            <span className={cn("flex items-baseline gap-1.5", NUM)}>
                              <span className="text-[13px] font-semibold text-bz-text">{a.newOutlets}</span>
                              {fresh > 0 && <span className="text-[11.5px] text-bz-text-soft">of {fresh}</span>}
                            </span>
                          </button>
                        )}
                      </div>

                      {/* Incentive */}
                      <div className="min-w-0 @[1000px]:text-right" title={INCENTIVE_RULE}>
                        <span className={CAP}>Incentive</span>
                        <span className={cn("block py-1.5 text-[13px]", inc ? "font-semibold text-bz-text" : "text-bz-text-soft")}>
                          <Amount value={inc} />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Panel>
        </div>
      </div>

      <Popover open={!!menu} anchor={menu?.anchor ?? null} onClose={() => setMenu(null)} align="right" width={188}>
        <MenuItem
          icon={Pencil}
          onClick={() => {
            const id = menu?.repId;
            setMenu(null);
            if (id) open(id, "sales");
          }}
        >
          Edit target
        </MenuItem>
        <MenuItem
          icon={Eraser}
          danger
          disabled={!menuRow?.t}
          onClick={() => {
            setMenu(null);
            if (menuRow) clear(menuRow.r.id, menuRow.r.name);
          }}
        >
          Clear target
        </MenuItem>
      </Popover>
      <ToastHost toast={toast} onDismiss={dismiss} />
    </SfShell>
  );
}

/** A goal being typed, after what has been counted against it: "10.9L of [ 1,600,000 ]". */
function Typing({ lead, children }: { lead: string; children: React.ReactNode }) {
  return (
    <span className="flex min-w-0 max-w-[240px] items-center gap-2">
      <span className={cn("shrink-0 whitespace-nowrap text-[12px] text-bz-text-soft", NUM)}>{lead}</span>
      {children}
    </span>
  );
}

/** A whole number at the module's control height. Money shows its thousands while the field is not being typed in. */
function GoalInput({ value, onChange, label, focus, money }: { value: number; onChange: (v: number) => void; label: string; focus?: boolean; money?: boolean }) {
  const ref = React.useRef<HTMLInputElement>(null);
  const [raw, setRaw] = React.useState<string | null>(null);
  // The field the click landed on takes the cursor as the row opens.
  React.useEffect(() => {
    if (focus) ref.current?.focus({ preventScroll: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <input
      ref={ref}
      inputMode="numeric"
      aria-label={label}
      placeholder="0"
      value={raw ?? (value ? (money ? value.toLocaleString("en-US") : String(value)) : "")}
      onFocus={(e) => {
        const el = e.currentTarget;
        setRaw(value ? String(value) : "");
        window.setTimeout(() => el.select(), 0);
      }}
      onBlur={() => setRaw(null)}
      onChange={(e) => {
        const t = e.target.value.replace(/[^\d]/g, "").slice(0, 12);
        setRaw(t);
        onChange(Number(t) || 0);
      }}
      className={cn(INPUT, "min-w-0 flex-1 bg-bz-surface px-2.5 text-right text-[13px]", NUM)}
    />
  );
}
