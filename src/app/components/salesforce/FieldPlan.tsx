import * as React from "react";
import { useSearchParams } from "react-router";
import { cn } from "../ui/utils";
import { GHOST_SM, MenuItem, MenuLabel, NUM, Popover, Select, ToastHost, useToast } from "../sales/bzw";
import { useStore } from "../sales/store";
import { REPS, SF_TODAY } from "./data";
import { SfShell } from "./shell";
import { EmptyNote, Figures, List, Page, PageIntro, Row, Section, TypeMark } from "./ui";
import { TODAY_IDX, WEEK, addHistory, cadenceOf, ctype, custById, outletsOf, planStore, repArea, repById, visitsIn4w } from "./field-data";
import type { Cadence, PlanEntry } from "./field-data";
import { Initials } from "./field-kit";

// ════════════════════════════════════════════════════════════════════════════
// PLAN — one person's week of beats
//
// The journey plan is a weekly pattern (outlet × weekday × cadence), the
// cadence set by the customer type's visits per 4 weeks. One person at a time:
// the week Monday to Saturday, what each day holds, and whether the plan
// covers what the types ask for. Moving an outlet is one click and a day.
// ════════════════════════════════════════════════════════════════════════════

const EVERY_LABEL: Record<Cadence, string | null> = { 1: null, 2: "every 2 weeks", 4: "once in 4 weeks" };
const dayNo = (iso: string) => Number(iso.slice(8));

/** The day picker behind "Move" and "Plan": a small popover of weekdays with each day's load. */
function DayPop({ anchor, onClose, current, load, title, onPick }: { anchor: HTMLElement | null; onClose: () => void; current: number | null; load: number[]; title: string; onPick: (day: number) => void }) {
  return (
    <Popover open={!!anchor} anchor={anchor} onClose={onClose} width={220}>
      <MenuLabel>{title}</MenuLabel>
      {WEEK.map((d, i) => (
        <MenuItem key={d.date} active={i === current} onClick={() => (onPick(i), onClose())}>
          <span className="flex items-center justify-between gap-2">
            <span>
              {d.label}
              {i === TODAY_IDX && <span className="ml-1.5 text-[11px] text-bz-text-soft">today</span>}
            </span>
            <span className={cn("text-[11px] font-normal text-bz-text-soft", NUM)}>{load[i]}</span>
          </span>
        </MenuItem>
      ))}
    </Popover>
  );
}

export function PlanPage() {
  const [search, setSearch] = useSearchParams();
  const plan = useStore(planStore);
  const { toast, show, dismiss } = useToast();
  const busiest = React.useMemo(() => [...REPS].sort((a, b) => outletsOf(b).length - outletsOf(a).length)[0], []);
  const rep = repById(search.get("rep")) ?? busiest;
  const pool = React.useMemo(() => outletsOf(rep), [rep]);
  const mine = plan.filter((e) => e.repId === rep.id);
  const load = WEEK.map((_, i) => mine.filter((e) => e.day === i).length);
  const due = pool.reduce((s, c) => s + ctype(c).visitsPer4w, 0);
  const planned = visitsIn4w(mine);
  const unplanned = pool.filter((c) => !mine.some((e) => e.customerId === c.id));
  const peak = load.indexOf(Math.max(...load));
  const [menu, setMenu] = React.useState<{ el: HTMLElement; entry?: PlanEntry; customerId?: string } | null>(null);

  const move = (e: PlanEntry, day: number) => {
    if (day === e.day) return;
    const before = e.day;
    const name = custById(e.customerId).name;
    planStore.set((s) => s.map((x) => (x.id === e.id ? { ...x, day } : x)));
    addHistory(`rep:${rep.id}`, `moved ${name} from ${WEEK[before].label} to ${WEEK[day].label} on the plan`);
    show("success", `${name} moved to ${WEEK[day].label}.`, { label: "Undo", run: () => planStore.set((s) => s.map((x) => (x.id === e.id ? { ...x, day: before } : x))) });
  };
  const add = (customerId: string, day: number) => {
    const c = custById(customerId);
    const k = cadenceOf(c);
    const entries: PlanEntry[] = [{ id: `PL-${rep.id.slice(4)}-${c.id.slice(2)}-${day}-n`, repId: rep.id, customerId, day, every: k.every }];
    if (k.count === 2) {
      const second = [0, 1, 2, 3, 4, 5].filter((d) => Math.abs(d - day) >= 2).sort((a, b) => load[a] - load[b] || a - b)[0];
      entries.push({ id: `PL-${rep.id.slice(4)}-${c.id.slice(2)}-${second}-n2`, repId: rep.id, customerId, day: second, every: 1 });
    }
    planStore.set((s) => [...s, ...entries]);
    addHistory(`rep:${rep.id}`, `planned ${c.name} on ${entries.map((x) => WEEK[x.day].label).join(" and ")}`);
    show("success", `${c.name} planned on ${entries.map((x) => WEEK[x.day].label).join(" and ")}.`, { label: "Undo", run: () => planStore.set((s) => s.filter((x) => !entries.some((n) => n.id === x.id))) });
  };

  return (
    <SfShell page="plan">
      <Page width="wide">
        <PageIntro
          actions={
            <Select
              value={rep.id}
              trigger="plain"
              onChange={(v) => setSearch({ rep: v }, { replace: true })}
              align="right"
              width={240}
              options={REPS.map((r) => ({ value: r.id, label: r.name, hint: `${r.role} · ${repArea(r)}`, meta: String(outletsOf(r).length) }))}
            >
              <span className="inline-flex h-9 items-center gap-2 rounded-bz-md border border-bz-line bg-bz-surface pl-1.5 pr-3 text-[12px] font-semibold text-bz-text hover:bg-bz-paper-warm">
                <Initials rep={rep} size={24} />
                {rep.name}
              </span>
            </Select>
          }
        >
          {rep.name}'s week, {dayNo(WEEK[0].date)} Aug – {dayNo(WEEK[5].date)} Sep. The plan repeats weekly; a move counts from the outlet's next visit.
        </PageIntro>

        <Figures
          items={[
            { label: "Due in 4 weeks", value: due, sub: `visits for ${pool.length} outlets` },
            { label: "Planned", value: planned, sub: due ? `${Math.round((planned / due) * 100)}% of due` : "—", tone: planned < due ? "danger" : undefined },
            { label: "Not planned", value: unplanned.length, sub: "outlets in 4 weeks", tone: unplanned.length ? "danger" : undefined },
            { label: "Busiest day", value: `${WEEK[peak].short} · ${load[peak]}`, sub: "outlets" },
          ]}
        />

        <div className="mt-12 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {WEEK.map((d, i) => {
            const rows = mine.filter((e) => e.day === i).map((e) => ({ e, c: custById(e.customerId) }));
            const today = d.date === SF_TODAY;
            return (
              <section key={d.date} className="min-w-0">
                <div className={cn("mb-2 flex items-baseline gap-2 border-b pb-2", today ? "border-bz-text" : "border-bz-line-soft")}>
                  <h2 className="m-0 text-[13px] font-semibold text-bz-text">
                    {d.short} <span className={cn("font-normal text-bz-text-soft", NUM)}>{dayNo(d.date)}</span>
                  </h2>
                  {today && <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-bz-text-soft">Today</span>}
                  <span className={cn("ml-auto text-[11px] text-bz-text-soft", NUM)}>{rows.length}</span>
                </div>
                {rows.length === 0 ? (
                  <p className="m-0 py-2 text-[11.5px] text-bz-text-soft">No outlets.</p>
                ) : (
                  <ul className="m-0 flex list-none flex-col p-0">
                    {rows.map(({ e, c }) => {
                      const t = ctype(c);
                      const every = EVERY_LABEL[e.every];
                      return (
                        <li key={e.id}>
                          <button
                            type="button"
                            onClick={(ev) => setMenu({ el: ev.currentTarget, entry: e })}
                            title="Move to another day"
                            className={cn("group block w-full rounded-bz-md px-1.5 py-1.5 text-left transition-colors hover:bg-bz-paper-warm", menu?.entry?.id === e.id && "bg-bz-paper-warm")}
                          >
                            <span className="block truncate text-[12px] font-medium text-bz-text">{c.name}</span>
                            <span className="mt-0.5 flex items-center gap-1.5 text-[11px] text-bz-text-soft">
                              <TypeMark name={t.name} color={t.color} className="text-[11px]" />
                              {every && <span className="truncate">· {every}</span>}
                              <span className="ml-auto hidden text-bz-text-muted group-hover:inline">Move</span>
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>
            );
          })}
        </div>

        <Section title="Not planned in 4 weeks" count={unplanned.length} className="mt-14" hint="on no day of the week">
          {unplanned.length === 0 ? (
            <EmptyNote>All of {rep.name.split(" ")[0]}'s outlets are on the plan.</EmptyNote>
          ) : (
            <List>
              {unplanned.map((c) => {
                const t = ctype(c);
                const k = cadenceOf(c);
                return (
                  <Row
                    key={c.id}
                    title={c.name}
                    sub={`${c.city} · tier ${c.tier}${c.status === "onboarding" ? " · onboarding" : ""}`}
                    meta={[<TypeMark key="t" name={t.name} color={t.color} />, <span key="f">{t.visitsPer4w} visits in 4 weeks</span>]}
                    trail={
                      <button type="button" onClick={(ev) => setMenu({ el: ev.currentTarget, customerId: c.id })} className={GHOST_SM}>
                        Plan{k.count === 2 ? " twice a week" : ""}
                      </button>
                    }
                  />
                );
              })}
            </List>
          )}
        </Section>
      </Page>

      <DayPop
        anchor={menu?.el ?? null}
        onClose={() => setMenu(null)}
        current={menu?.entry?.day ?? null}
        load={load}
        title={menu?.entry ? "Move to" : "Plan on"}
        onPick={(day) => {
          if (menu?.entry) move(menu.entry, day);
          else if (menu?.customerId) add(menu.customerId, day);
        }}
      />
      <ToastHost toast={toast} onDismiss={dismiss} />
    </SfShell>
  );
}
