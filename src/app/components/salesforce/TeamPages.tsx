import * as React from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowRight } from "lucide-react";
import { cn } from "../ui/utils";
import { BTN, GHOST, INPUT_SM, NUM } from "../sales/bzw";
import { useStore } from "../sales/store";
import { REPS, SF_TODAY } from "./data";
import type { Rep } from "./data";
import { SfShell, sfPath } from "./shell";
import { Dot, Fact, Figures, List, Money, Page, PageIntro, Progress, Row, Section, SidePanel } from "./ui";
import { DAY_STATUS, INCENTIVE_RULE, VISITS, VISIT_STATE, addHistory, custById, incentiveOf, outletsOf, planStore, repArea, repById, repDay, targetsStore, territoryName, visitsIn4w, withOrder } from "./field-data";
import type { HistoryItem, TargetRow } from "./field-data";
import { BarLine, Block, HistoryNotes, Initials, Micro, VisitMark, shortDay } from "./field-kit";
import { strikeRate } from "./FieldPages";

// ════════════════════════════════════════════════════════════════════════════
// TEAM — Reps and Targets
//
// Reps: who is in the field team, how their day is going and how the month
// stands against target; the panel is the person — territories, target, the
// last visits, History and Notes. Targets: the month for everyone in one calm
// table, and an inline edit mode that saves from a sticky bar.
// ════════════════════════════════════════════════════════════════════════════

const MONTH = "Sep 2026";
const DAY_OF_MONTH = Number(SF_TODAY.slice(8));
const pct = (a: number, b: number) => (b ? Math.round((a / b) * 100) : 0);
const num = (n: number) => Math.round(n).toLocaleString("en-US");

const ROLE_PLURAL: Record<Rep["role"], string> = { "Sales rep": "sales reps", Merchandiser: "merchandisers", "Area manager": "area managers" };

/** The seeded trail of a person's record — who set them up, who set their target. */
function repSeedHistory(r: Rep, t: TargetRow | undefined): HistoryItem[] {
  const out: HistoryItem[] = [{ id: `${r.id}-t`, who: "Sneha Maharjan", what: `assigned ${r.territoryIds.map(territoryName).join(", ")}`, when: "17 Jul, 11:20" }];
  if (t) out.push({ id: `${r.id}-g`, who: "Sneha Maharjan", what: `set the ${t.month} target — NPR ${num(t.salesTarget)}, ${t.outletsTarget} outlets`, when: "1 Sep, 10:15" });
  return out;
}

// ── Reps ────────────────────────────────────────────────────────────────────

export function RepsPage() {
  const { repId } = useParams();
  const navigate = useNavigate();
  const targets = useStore(targetsStore);
  const days = React.useMemo(() => REPS.map((r) => repDay(r.id)), []);
  const out = days.filter((d) => d.status === "on-beat" || d.status === "idle").length;
  const sales = targets.reduce((s, t) => s + t.salesActual, 0);
  const goal = targets.reduce((s, t) => s + t.salesTarget, 0);
  const roles = (Object.keys(ROLE_PLURAL) as Rep["role"][]).map((k) => ({ k, n: REPS.filter((r) => r.role === k).length })).filter((x) => x.n);
  const open = repById(repId);

  return (
    <SfShell page="team" panel={open && <RepPanel key={open.id} rep={open} onClose={() => navigate(sfPath("team"))} />}>
      <Page width="full">
        <PageIntro>
          {REPS.length} people in the field team — {roles.map((x) => `${x.n} ${x.n === 1 ? ROLE_PLURAL[x.k].replace(/s$/, "") : ROLE_PLURAL[x.k]}`).join(", ")}.
        </PageIntro>

        <Figures
          items={[
            { label: "Out now", value: `${out} of ${REPS.length}`, sub: "on their beat", onClick: () => navigate(sfPath("today")) },
            { label: `Sales · ${MONTH}`, value: <Money value={sales} />, sub: `${pct(sales, goal)}% of target` },
            { label: "Outlets visited", value: targets.reduce((s, t) => s + t.outletsActual, 0), sub: `of ${targets.reduce((s, t) => s + t.outletsTarget, 0)} this month` },
            { label: "New outlets", value: targets.reduce((s, t) => s + t.newOutlets, 0), sub: "this month", onClick: () => navigate(sfPath("targets")) },
          ]}
        />

        <Section title="People" count={REPS.length} className="mt-12">
          <List>
            {days.map((d) => {
              const r = d.rep;
              const t = targets.find((x) => x.repId === r.id);
              const s = DAY_STATUS[d.status];
              return (
                <Row
                  key={r.id}
                  active={r.id === repId}
                  onClick={() => navigate(sfPath(`team/${r.id}`))}
                  lead={<Initials rep={r} />}
                  title={r.name}
                  sub={`${r.role} · ${r.territoryIds.map(territoryName).join(", ")}`}
                  meta={[
                    <Dot key="s" tone={s.tone}>
                      {s.label}
                    </Dot>,
                    <span key="p" className="flex w-36 items-center gap-2">
                      {t ? (
                        <>
                          <Progress pct={pct(t.salesActual, t.salesTarget)} className="flex-1" />
                          <span className={cn("w-9 text-right text-[11px] text-bz-text-soft", NUM)}>{pct(t.salesActual, t.salesTarget)}%</span>
                        </>
                      ) : (
                        <span className="text-[11px] text-bz-text-soft">No target</span>
                      )}
                    </span>,
                  ]}
                  trail={
                    <span className="flex flex-col items-end gap-1">
                      {t ? <Money value={t.salesActual} /> : <span className="text-bz-text-soft">—</span>}
                      <Dot tone={s.tone} className="md:hidden">
                        {s.label}
                      </Dot>
                    </span>
                  }
                />
              );
            })}
          </List>
          <p className="m-0 mt-4 text-[11px] text-bz-text-soft">Sales are this month's, against the month's target.</p>
        </Section>
      </Page>
    </SfShell>
  );
}

function RepPanel({ rep, onClose }: { rep: Rep; onClose: () => void }) {
  const navigate = useNavigate();
  const targets = useStore(targetsStore);
  const plan = useStore(planStore);
  const t = targets.find((x) => x.repId === rep.id);
  const d = repDay(rep.id);
  const s = DAY_STATUS[d.status];
  const perWeek = visitsIn4w(plan.filter((e) => e.repId === rep.id)) / 4;
  const recent = VISITS.filter((v) => v.repId === rep.id && v.state !== "pending").sort((a, b) => a.date.localeCompare(b.date) || (a.checkIn ?? "99").localeCompare(b.checkIn ?? "99"));
  const skipped = recent.filter((v) => v.state === "skipped" || v.state === "missed").length;
  const ordered = recent.filter(withOrder).length;
  return (
    <SidePanel
      open
      onClose={onClose}
      eyebrow={rep.role}
      title={rep.name}
      meta={
        <>
          <Dot tone={s.tone}>{s.label}</Dot>
          <span>{repArea(rep)}</span>
          <a href={`tel:${rep.phone}`} className={cn("hover:text-bz-text", NUM)}>
            {rep.phone}
          </a>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-x-6 gap-y-4">
        <Fact label="Territories" className="col-span-2">
          {rep.territoryIds.map(territoryName).join(", ")}
        </Fact>
        <Fact label="Outlets">{outletsOf(rep).length}</Fact>
        <Fact label="On the plan">{`${Math.round(perWeek * 10) / 10} visits a week`}</Fact>
      </div>

      <Block
        title="Today"
        aside={
          <button type="button" onClick={() => navigate(sfPath(`today/${rep.id}`))} className="inline-flex items-center gap-1 hover:text-bz-text">
            Open the day <ArrowRight size={11} />
          </button>
        }
      >
        <p className="m-0 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px] text-bz-text">
          <Dot tone={s.tone}>{s.label}</Dot>
          <span className={NUM}>
            {d.checkedIn} of {d.visits.length} outlets
          </span>
          {d.orderValue > 0 && <Money value={d.orderValue} className="text-bz-text-muted" />}
        </p>
      </Block>

      <Block title={`Target · ${MONTH}`} aside={t ? `day ${DAY_OF_MONTH} of 30` : undefined}>
        {t ? (
          <div className="flex flex-col gap-4">
            <BarLine label="Sales" figure={`${num(t.salesActual)} / ${num(t.salesTarget)}`} pct={pct(t.salesActual, t.salesTarget)} />
            <BarLine label="Outlets visited" figure={`${t.outletsActual} / ${t.outletsTarget}`} pct={pct(t.outletsActual, t.outletsTarget)} />
            <BarLine label="New outlets" figure={`${t.newOutlets} / ${t.newTarget}`} pct={pct(t.newOutlets, t.newTarget)} />
            <p className="m-0 flex items-baseline justify-between text-[12px] text-bz-text-muted">
              <span>Incentive earned</span>
              <Money value={incentiveOf(t)} className="text-bz-text" />
            </p>
          </div>
        ) : (
          <p className="m-0 text-[11.5px] text-bz-text-soft">No personal target — {rep.role === "Area manager" ? "measured on the area's total." : "set one on Targets."}</p>
        )}
      </Block>

      <Block title="Recent visits" aside={recent.length ? `Wed – today · ${strikeRate(recent)}% with an order` : undefined}>
        {recent.length === 0 ? (
          <p className="m-0 text-[11.5px] text-bz-text-soft">No visits yet.</p>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-1.5">
              {recent.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => navigate(sfPath(`visits/${v.id}`))}
                  className="flex size-6 items-center justify-center rounded-bz-sm hover:bg-bz-paper-warm"
                  title={`${shortDay(v.date)}${v.checkIn ? `, ${v.checkIn}` : ""} · ${custById(v.customerId).name} · ${withOrder(v) ? `order NPR ${num(v.orderValue)}` : VISIT_STATE[v.state].label}`}
                >
                  <VisitMark state={withOrder(v) || v.state !== "done" ? v.state : "pending"} size={withOrder(v) ? 10 : 8} />
                </button>
              ))}
            </div>
            <p className="m-0 mt-2 text-[11px] text-bz-text-soft">
              {ordered} with an order · {recent.length - ordered - skipped} without · {skipped} skipped or missed
            </p>
          </>
        )}
      </Block>

      <HistoryNotes recordKey={`rep:${rep.id}`} seed={repSeedHistory(rep, t)} />
    </SidePanel>
  );
}

// ── Targets ─────────────────────────────────────────────────────────────────

type Draft = Record<string, { salesTarget: number; outletsTarget: number; newTarget: number }>;
const FIELDS = [
  { key: "salesTarget", label: "sales target", money: true },
  { key: "outletsTarget", label: "outlets target", money: false },
  { key: "newTarget", label: "new-outlets target", money: false },
] as const;

function TargetInput({ value, onChange, label, wide }: { value: number; onChange: (n: number) => void; label: string; wide?: boolean }) {
  return (
    <input
      aria-label={label}
      inputMode="numeric"
      value={value ? value.toLocaleString("en-US") : ""}
      onFocus={(e) => e.currentTarget.select()}
      onChange={(e) => onChange(Number(e.target.value.replace(/[^\d]/g, "")) || 0)}
      className={cn(INPUT_SM, "inline-block text-right", NUM, wide ? "w-28" : "w-16")}
    />
  );
}

function Cell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <Micro className="mb-1 md:hidden">{label}</Micro>
      {children}
    </div>
  );
}

export function TargetsPage() {
  const navigate = useNavigate();
  const targets = useStore(targetsStore);
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState<Draft>({});
  const rows = [...targets].sort((a, b) => b.salesActual / b.salesTarget - a.salesActual / a.salesTarget);
  const val = (t: TargetRow, k: keyof Draft[string]) => draft[t.repId]?.[k] ?? t[k];
  const changes = targets.flatMap((t) => FIELDS.filter((f) => draft[t.repId] && draft[t.repId][f.key] !== t[f.key]).map((f) => ({ t, f })));
  const set = (t: TargetRow, k: keyof Draft[string], n: number) =>
    setDraft((d) => ({ ...d, [t.repId]: { salesTarget: val(t, "salesTarget"), outletsTarget: val(t, "outletsTarget"), newTarget: val(t, "newTarget"), ...d[t.repId], [k]: n } }));
  const save = () => {
    for (const { t, f } of changes) {
      const next = draft[t.repId][f.key];
      addHistory(`rep:${t.repId}`, `changed the ${MONTH} ${f.label} from ${f.money ? `NPR ${num(t[f.key])}` : t[f.key]} to ${f.money ? `NPR ${num(next)}` : next}`);
    }
    targetsStore.set((s) => s.map((t) => (draft[t.repId] ? { ...t, ...draft[t.repId] } : t)));
    setDraft({});
    setEditing(false);
  };
  const discard = () => setDraft({});
  const earned = targets.reduce((s, t) => s + incentiveOf(t), 0);
  const noTarget = REPS.filter((r) => !targets.some((t) => t.repId === r.id));

  return (
    <SfShell page="targets">
      <Page width="wide" className="pb-0">
        <PageIntro
          actions={
            editing ? (
              <button type="button" onClick={() => (discard(), setEditing(false))} className={GHOST}>
                Stop editing
              </button>
            ) : (
              <button type="button" onClick={() => setEditing(true)} className={GHOST}>
                Edit targets
              </button>
            )
          }
        >
          {MONTH} · day {DAY_OF_MONTH} of 30. Incentive: {INCENTIVE_RULE.toLowerCase()}.
        </PageIntro>

        <Figures
          items={[
            { label: "Team sales", value: <Money value={targets.reduce((s, t) => s + t.salesActual, 0)} />, sub: `${pct(targets.reduce((s, t) => s + t.salesActual, 0), targets.reduce((s, t) => s + t.salesTarget, 0))}% of NPR ${num(targets.reduce((s, t) => s + t.salesTarget, 0))}` },
            { label: "Outlets visited", value: targets.reduce((s, t) => s + t.outletsActual, 0), sub: `of ${targets.reduce((s, t) => s + t.outletsTarget, 0)}` },
            { label: "New outlets", value: targets.reduce((s, t) => s + t.newOutlets, 0), sub: `of ${targets.reduce((s, t) => s + t.newTarget, 0)}` },
            { label: "Incentives earned", value: <Money value={earned} />, sub: "so far this month" },
          ]}
        />

        <Section title="By person" count={rows.length} className="mt-12">
          <div className="hidden grid-cols-[minmax(0,1.3fr)_minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.8fr)] gap-6 border-b border-bz-line-soft px-1 pb-2 md:grid">
            {["Person", "Sales", "Outlets visited", "New outlets", "Incentive"].map((h, i) => (
              <Micro key={h} className={cn(i === 4 && "text-right")}>
                {h}
              </Micro>
            ))}
          </div>
          <div className="divide-y divide-bz-line-soft border-b border-bz-line-soft">
            {rows.map((t) => {
              const r = repById(t.repId)!;
              const edited = changes.some((c) => c.t.repId === t.repId);
              return (
                <div key={t.repId} className={cn("grid grid-cols-2 items-start gap-x-6 gap-y-4 px-1 py-4 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.8fr)] md:items-center", edited && "bg-bz-fire/5")}>
                  <button type="button" onClick={() => navigate(sfPath(`team/${r.id}`))} className="col-span-2 flex min-w-0 items-center gap-3 text-left md:col-span-1">
                    <Initials rep={r} />
                    <span className="min-w-0">
                      <span className="block truncate text-[12.5px] font-medium text-bz-text hover:underline hover:underline-offset-2">{r.name}</span>
                      <span className="block truncate text-[11px] text-bz-text-soft">{repArea(r)}</span>
                    </span>
                  </button>
                  <Cell label="Sales">
                    <span className={cn("mb-1.5 flex flex-wrap items-center gap-x-1 text-[12px] text-bz-text", NUM)}>
                      {num(t.salesActual)}
                      <span className="text-bz-text-soft">/</span>
                      {editing ? <TargetInput wide label={`${r.name} sales target`} value={val(t, "salesTarget")} onChange={(n) => set(t, "salesTarget", n)} /> : <span className="text-bz-text-soft">{num(t.salesTarget)}</span>}
                    </span>
                    <Progress pct={pct(t.salesActual, val(t, "salesTarget"))} />
                  </Cell>
                  <Cell label="Outlets visited">
                    <span className={cn("mb-1.5 flex items-center gap-x-1 text-[12px] text-bz-text", NUM)}>
                      {t.outletsActual}
                      <span className="text-bz-text-soft">/</span>
                      {editing ? <TargetInput label={`${r.name} outlets target`} value={val(t, "outletsTarget")} onChange={(n) => set(t, "outletsTarget", n)} /> : <span className="text-bz-text-soft">{t.outletsTarget}</span>}
                    </span>
                    <Progress pct={pct(t.outletsActual, val(t, "outletsTarget"))} />
                  </Cell>
                  <Cell label="New outlets">
                    <span className={cn("mb-1.5 flex items-center gap-x-1 text-[12px] text-bz-text", NUM)}>
                      {t.newOutlets}
                      <span className="text-bz-text-soft">/</span>
                      {editing ? <TargetInput label={`${r.name} new-outlets target`} value={val(t, "newTarget")} onChange={(n) => set(t, "newTarget", n)} /> : <span className="text-bz-text-soft">{t.newTarget}</span>}
                    </span>
                    <Progress pct={pct(t.newOutlets, val(t, "newTarget"))} />
                  </Cell>
                  <Cell label="Incentive">
                    <span className="block text-[12.5px] font-medium text-bz-text md:text-right">
                      <Money value={incentiveOf(t)} />
                    </span>
                  </Cell>
                </div>
              );
            })}
          </div>
          {noTarget.length > 0 && (
            <p className="m-0 mt-4 text-[11px] text-bz-text-soft">
              {noTarget.map((r) => `${r.name} (${r.role.toLowerCase()})`).join(", ")} {noTarget.length === 1 ? "has" : "have"} no personal target.
            </p>
          )}
        </Section>
        <div className="h-8" />

        {changes.length > 0 && (
          <div className="sticky bottom-0 z-10 -mx-4 border-t border-bz-line bg-bz-surface/95 px-4 py-3 backdrop-blur md:-mx-8 md:px-8">
            <div className="flex flex-wrap items-center gap-3">
              <span className="min-w-0 flex-1 text-[12px] text-bz-text-muted">
                {changes.length} {changes.length === 1 ? "change" : "changes"} to {MONTH} targets — not saved yet.
              </span>
              <button type="button" onClick={discard} className={GHOST}>
                Discard
              </button>
              <button type="button" onClick={save} className={BTN}>
                Save targets
              </button>
            </div>
          </div>
        )}
      </Page>
    </SfShell>
  );
}

// ── Routes ──────────────────────────────────────────────────────────────────

export const TEAM_ROUTES = [
  { path: "design/salesforce/team", Component: RepsPage },
  { path: "design/salesforce/team/:repId", Component: RepsPage },
  { path: "design/salesforce/targets", Component: TargetsPage },
];
