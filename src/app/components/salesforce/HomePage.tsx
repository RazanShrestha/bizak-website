import * as React from "react";
import { useNavigate } from "react-router";
import { ArrowRight, ClipboardCheck, CreditCard, Footprints, Gift, LayoutGrid, Megaphone } from "lucide-react";
import { cn } from "../ui/utils";
import { NUM } from "../sales/bzw";
import { useStore } from "../sales/store";
import { CUSTOMER_TYPES, REPS, SF_TODAY } from "./data";
import type { Source } from "./data";
import { customerById, evaluate, npr, typeOf } from "./engine";
import { brandingStore, campaignsStore, claimsStore, customersStore, hubStore, schemesStore } from "./store";
import { DAY_START_DUE, repDay } from "./field-data";
import { SfShell, sfPath } from "./shell";
import { Figures, List, Money, Page, PageIntro, Progress, Row, Section } from "./ui";

// ════════════════════════════════════════════════════════════════════════════
// HOME — the reference page for v2's calm direction (DESIGN-DIRECTION.md)
//
// One line of figures, then what needs the manager, then two quiet reads:
// where today's orders came from, and how the live campaigns are doing.
// Nothing here is a chart library; nothing is a tile.
// ════════════════════════════════════════════════════════════════════════════

export const SOURCE_LABEL: Record<Source, string> = { rep: "Reps", portal: "Dealer portal", whatsapp: "WhatsApp", "retailer-app": "Retailer app", "back-office": "Back office" };

export function HomePage() {
  const navigate = useNavigate();
  const hub = useStore(hubStore);
  const schemes = useStore(schemesStore);
  const claims = useStore(claimsStore);
  const branding = useStore(brandingStore);
  const campaigns = useStore(campaignsStore);
  const customers = useStore(customersStore);

  const today = hub.filter((o) => o.at.startsWith(SF_TODAY));
  const valued = today.map((o) => ({ o, total: evaluate(o.customerId, o.lines, schemes).total }));
  const todayValue = valued.reduce((s, x) => s + x.total, 0);
  const review = hub.filter((o) => o.status === "review");
  const claimsOpen = claims.filter((c) => c.status === "submitted");
  const schemeSpend = schemes.filter((s) => s.status === "live" && s.budget?.kind === "value").reduce((s, x) => s + (x.budget?.used ?? 0), 0);
  const days = REPS.map((r) => repDay(r.id));
  const outNow = days.filter((d) => d.status === "on-beat" || d.status === "idle").length;
  const late = days.filter((d) => d.status === "not-started");
  const overCredit = customers.filter((c) => c.overdue > 0 && typeOf(c).level === "primary");

  const needs: { icon: React.ComponentType<{ size?: number; className?: string }>; title: string; sub: string; verb: string; to: string; danger?: boolean }[] = [
    ...review.slice(0, 3).map((o) => {
      const c = customerById(o.customerId)!;
      return { icon: CreditCard, title: `${o.id} from ${c.name}`, sub: `${SOURCE_LABEL[o.source]} · waiting for review`, verb: "Review", to: sfPath(`orders/${o.id}`), danger: true };
    }),
    ...(claimsOpen.length ? [{ icon: ClipboardCheck, title: `${claimsOpen.length} claims to decide`, sub: `NPR ${npr(claimsOpen.reduce((s, c) => s + c.amount, 0))} in total`, verb: "Open claims", to: sfPath("claims") }] : []),
    ...(branding.filter((b) => b.stage === "requested").length ? [{ icon: LayoutGrid, title: `${branding.filter((b) => b.stage === "requested").length} branding requests`, sub: "Sign boards and wall paint asked for", verb: "Open", to: sfPath("branding") }] : []),
    ...late.map((d) => ({ icon: Footprints, title: `${d.rep.name} hasn't started`, sub: `Due at ${DAY_START_DUE} · ${d.visits.length} outlets on today's beat`, verb: "Open day", to: sfPath(`today/${d.rep.id}`) })),
    ...schemes
      .filter((s) => s.status === "live" && s.budget && s.budget.used / s.budget.total > 0.85)
      .map((s) => ({ icon: Gift, title: `${s.name} is almost out of budget`, sub: `${Math.round((s.budget!.used / s.budget!.total) * 100)}% used`, verb: "Open scheme", to: sfPath(`schemes/${s.id}`) })),
  ];

  const bySource = (Object.keys(SOURCE_LABEL) as Source[]).map((src) => {
    const rows = valued.filter((x) => x.o.source === src);
    return { src, n: rows.length, value: rows.reduce((s, x) => s + x.total, 0) };
  });
  const maxSrc = Math.max(1, ...bySource.map((x) => x.value));
  const live = campaigns.filter((c) => c.status === "live" || c.status === "planned");

  return (
    <SfShell page="home">
      <Page>
        <PageIntro>Friday, 4 September — here is what needs you.</PageIntro>

        <Figures
          items={[
            { label: "Orders today", value: <Money value={todayValue} />, sub: `${today.length} orders`, onClick: () => navigate(sfPath("orders")) },
            { label: "Needs review", value: review.length, sub: "over credit or unusual", tone: review.length ? "danger" : undefined, onClick: () => navigate(sfPath("orders")) },
            { label: "In the field", value: `${outNow} of ${REPS.length}`, sub: "reps out now", onClick: () => navigate(sfPath("today")) },
            { label: "Scheme spend", value: <Money value={schemeSpend} />, sub: "this season", onClick: () => navigate(sfPath("schemes")) },
            { label: "Claims to settle", value: claimsOpen.length, sub: <Money value={claimsOpen.reduce((s, c) => s + c.amount, 0)} />, onClick: () => navigate(sfPath("claims")) },
          ]}
        />

        <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          <Section title="Needs you" count={needs.length}>
            <List>
              {needs.map((n, i) => (
                <Row
                  key={i}
                  lead={
                    <span className={cn("flex size-8 items-center justify-center rounded-bz-pill", n.danger ? "bg-bz-red-soft text-bz-red" : "bg-bz-paper-warm text-bz-text-muted")}>
                      <n.icon size={14} />
                    </span>
                  }
                  title={n.title}
                  sub={n.sub}
                  onClick={() => navigate(n.to)}
                  trail={
                    <span className="inline-flex items-center gap-1 text-[11.5px] font-medium text-bz-text-soft group-hover:text-bz-text">
                      {n.verb} <ArrowRight size={12} />
                    </span>
                  }
                />
              ))}
            </List>
          </Section>

          <div>
            <Section title="Where today's orders came from">
              <ul className="m-0 flex list-none flex-col gap-3.5 p-0">
                {bySource.map((s) => (
                  <li key={s.src}>
                    <div className="mb-1.5 flex items-baseline justify-between text-[12px]">
                      <span className="text-bz-text">{SOURCE_LABEL[s.src]}</span>
                      <span className={cn("text-bz-text-muted", NUM)}>
                        {s.n ? (
                          <>
                            <Money value={s.value} code={false} /> · {s.n}
                          </>
                        ) : (
                          "—"
                        )}
                      </span>
                    </div>
                    <Progress pct={(s.value / maxSrc) * 100} />
                  </li>
                ))}
              </ul>
              <p className="m-0 mt-4 text-[11px] text-bz-text-soft">
                {Math.round((bySource.find((s) => s.src === "portal")!.value / Math.max(1, todayValue)) * 100)}% of today's value came in without a rep — through the dealer portal.
              </p>
            </Section>

            <Section title="Campaigns" count={live.length} action={<button type="button" onClick={() => navigate(sfPath("campaigns"))} className="text-[11.5px] text-bz-text-soft hover:text-bz-text">All</button>}>
              <ul className="m-0 flex list-none flex-col gap-5 p-0">
                {live.map((c) => {
                  const k = c.kpi[0];
                  return (
                    <li key={c.id}>
                      <button type="button" onClick={() => navigate(sfPath(`campaigns/${c.id}`))} className="block w-full text-left">
                        <span className="flex items-center gap-2">
                          <Megaphone size={13} className="text-bz-text-soft" />
                          <span className="min-w-0 flex-1 truncate text-[12.5px] font-medium text-bz-text hover:underline">{c.name}</span>
                          <span className="text-[11px] text-bz-text-soft">{c.status === "planned" ? "starts 1 Oct" : `ends ${c.to.slice(8)} Oct`}</span>
                        </span>
                        <span className="mt-2 flex items-center gap-3">
                          <Progress pct={(k.actual / k.target) * 100} className="flex-1" />
                          <span className={cn("shrink-0 text-[11px] text-bz-text-muted", NUM)}>
                            {npr(k.actual)} / {npr(k.target)} {k.unit}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </Section>
          </div>
        </div>

        <Section title="Your trade network" className="mt-14" action={<button type="button" onClick={() => navigate(sfPath("customers"))} className="text-[11.5px] text-bz-text-soft hover:text-bz-text">Customers</button>}>
          <div className="flex flex-wrap gap-x-10 gap-y-4">
            {CUSTOMER_TYPES.map((t) => {
              const n = customers.filter((c) => c.typeId === t.id).length;
              if (!n) return null;
              return (
                <button key={t.id} type="button" onClick={() => navigate(`${sfPath("customers")}?type=${t.id}`)} className="text-left">
                  <span className={cn("block text-[17px] font-semibold text-bz-text", NUM)}>{n}</span>
                  <span className="text-[11.5px] text-bz-text-muted hover:text-bz-text">{t.plural}</span>
                </button>
              );
            })}
          </div>
          {overCredit.length > 0 && <p className="m-0 mt-5 text-[11.5px] text-bz-text-soft">{overCredit.length} of your direct customers have overdue invoices — their new orders go to review.</p>}
          <p className="m-0 mt-1 text-[11.5px] text-bz-text-soft">{REPS.length} people in the field team.</p>
        </Section>
      </Page>
    </SfShell>
  );
}
