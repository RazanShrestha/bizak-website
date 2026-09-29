import * as React from "react";
import { useNavigate } from "react-router";
import { cn } from "../ui/utils";
import { NUM } from "../sales/bzw";
import { useStore } from "../sales/store";
import { CUSTOMER_TYPES, DEALER_ID, DEALER_SECONDARY, TERRITORIES } from "./data";
import type { Customer, Scheme, SchemeMechanic, Source } from "./data";
import { evaluate } from "./engine";
import { SOURCE_LABEL } from "./HomePage";
import { customersStore, hubStore, schemesStore } from "./store";
import { SfShell, sfPath } from "./shell";
import { Figures, Money, Page, PageIntro, Section } from "./ui";
import { VISITS, ctype, planStore, territoryName, withOrder } from "./field-data";
import { BarLine, Micro } from "./field-kit";

// ════════════════════════════════════════════════════════════════════════════
// INSIGHTS — a quiet analysis page
//
// One statline, then plain bars and numbers: where the month's sales came
// from (channel, customer type, territory), what the live schemes cost and
// returned, and how much of the network the plan covers. No chart library.
//
// Month-to-date sales per customer are seeded here (data.ts has none);
// scheme maths is never redone — each scheme's spend rate comes from running
// the hub's orders through `evaluate`.
// ════════════════════════════════════════════════════════════════════════════

const DAYS_IN = 4;

function hashOf(s: string) {
  let h = 2166136261;
  for (const ch of s) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0;
  return h;
}
const unit = (s: string) => (hashOf(s) % 10_000) / 10_000;

/** Month-to-date sales per customer, 1–4 Sep, by type. About a quarter of shops have not bought yet. */
const MTD_RANGE: Record<string, [number, number]> = {
  "T-SS": [720_000, 1_100_000],
  "T-DIST": [260_000, 620_000],
  "T-DEAL": [90_000, 260_000],
  "T-MT": [280_000, 520_000],
  "T-HRC": [18_000, 64_000],
  "T-INST": [0, 42_000],
  "T-WHOL": [30_000, 90_000],
  "T-RET": [3_000, 22_000],
};
function mtdOf(c: Customer) {
  const [lo, hi] = MTD_RANGE[c.typeId] ?? [0, 0];
  if ((c.typeId === "T-RET" || c.typeId === "T-WHOL") && unit(`${c.id}:b`) < 0.26) return 0;
  if (c.status === "on hold") return 0;
  return Math.round((lo + unit(c.id) * (hi - lo)) / 100) * 100;
}
/** The same four days of August, for "vs last month". */
const lastMonthOf = (c: Customer) => Math.round(mtdOf(c) * (0.84 + unit(`${c.id}:l`) * 0.26));

/** Which channel each customer's orders come in through — portal users order online, chains send POs to the office. */
function channelMix(c: Customer): Partial<Record<Source, number>> {
  const portal = c.portalUsers.length > 0;
  switch (c.typeId) {
    case "T-MT":
    case "T-INST":
      return { "back-office": 1 };
    case "T-HRC":
      return { rep: 0.8, whatsapp: 0.2 };
    case "T-RET":
      return { rep: 0.9, whatsapp: 0.1 };
    case "T-WHOL":
      return portal ? { portal: 0.5, rep: 0.5 } : { rep: 0.85, whatsapp: 0.15 };
    default:
      return portal ? { portal: 0.65, rep: 0.25, whatsapp: 0.1 } : { rep: 0.6, whatsapp: 0.25, "back-office": 0.15 };
  }
}

/**
 * Assumed uplift over a no-scheme baseline, by mechanic. The app reads a baseline period instead; the mockup has
 * no history, so the share is fixed per mechanic and said so on the page.
 */
const UPLIFT: Partial<Record<SchemeMechanic["kind"], number>> = { "free-goods": 0.18, slab: 0.12, combo: 0.2, "invoice-value": 0.06, "first-order": 0.6 };
const MECHANIC: Record<SchemeMechanic["kind"], string> = {
  "free-goods": "Free goods",
  slab: "Volume slab",
  combo: "Combo",
  "invoice-value": "Order value discount",
  "first-order": "First order",
  "target-rebate": "Target rebate",
  display: "Display",
  "early-payment": "Early payment",
};

const pctOf = (a: number, b: number) => (b ? Math.round((a / b) * 100) : 0);

export function InsightsPage() {
  const navigate = useNavigate();
  const customers = useStore(customersStore);
  const hub = useStore(hubStore);
  const schemes = useStore(schemesStore);
  const plan = useStore(planStore);

  const mtd = React.useMemo(() => new Map(customers.map((c) => [c.id, mtdOf(c)])), [customers]);
  const lvl = (c: Customer) => ctype(c).level;
  const primary = customers.filter((c) => lvl(c) === "primary");
  const primaryMtd = primary.reduce((s, c) => s + mtd.get(c.id)!, 0);
  const primaryLast = primary.reduce((s, c) => s + lastMonthOf(c), 0);
  const allMtd = customers.reduce((s, c) => s + mtd.get(c.id)!, 0);

  // Network secondary: the logged-in dealer reports its own (DEALER_SECONDARY); the other distributors are
  // scaled from it by how many shops each serves. A super-stockist sells to distributors, so it is left out.
  const distributors = customers.filter((c) => c.typeId === "T-DIST");
  const served = (id: string) => customers.filter((c) => c.parentId === id).length;
  const base = DEALER_SECONDARY[DEALER_SECONDARY.length - 1].value;
  const secondary = distributors.map((d) => ({ d, value: d.id === DEALER_ID ? base : Math.round((base * served(d.id)) / Math.max(1, served(DEALER_ID)) * (0.88 + unit(`${d.id}:s`) * 0.3) / 1000) * 1000 }));
  const secondaryMtd = secondary.reduce((s, x) => s + x.value, 0);

  const calls = VISITS.filter((v) => v.state === "done");
  const productive = calls.filter(withOrder);
  const strike = pctOf(productive.length, calls.length);
  const lpc = productive.length ? productive.reduce((s, v) => s + v.lines, 0) / productive.length : 0;

  // ── By channel
  const bySource = (Object.keys(SOURCE_LABEL) as Source[]).map((src) => ({ src, value: customers.reduce((s, c) => s + mtd.get(c.id)! * (channelMix(c)[src] ?? 0), 0) }));
  const maxSrc = Math.max(1, ...bySource.map((x) => x.value));

  // ── By customer type
  const byType = CUSTOMER_TYPES.map((t) => {
    const list = customers.filter((c) => c.typeId === t.id);
    return { t, n: list.length, billed: list.filter((c) => mtd.get(c.id)! > 0).length, value: list.reduce((s, c) => s + mtd.get(c.id)!, 0) };
  }).filter((x) => x.n);
  const maxType = Math.max(1, ...byType.map((x) => x.value));

  // ── Territories
  const byTerr = TERRITORIES.filter((t) => t.level === "territory")
    .map((t) => {
      const list = customers.filter((c) => c.territoryId === t.id);
      const value = list.reduce((s, c) => s + mtd.get(c.id)!, 0);
      const last = list.reduce((s, c) => s + lastMonthOf(c), 0);
      return { t, value, change: last ? Math.round(((value - last) / last) * 100) : 0, billed: list.filter((c) => mtd.get(c.id)! > 0).length, n: list.length };
    })
    .sort((a, b) => b.value - a.value);
  const maxTerr = Math.max(1, byTerr[0]?.value ?? 1);

  // ── Schemes: spend rate and reach from the hub via evaluate, scaled to the month's eligible sales.
  const liveOrderSchemes = schemes.filter((s) => s.status === "live" && s.applies === "order");
  const evals = hub.filter((o) => o.status !== "rejected").map((o) => ({ o, e: evaluate(o.customerId, o.lines, schemes) }));
  const schemeRows = liveOrderSchemes.map((s: Scheme) => {
    const eligibleOrders = evals.filter((x) => !s.typeIds.length || s.typeIds.includes(customers.find((c) => c.id === x.o.customerId)?.typeId ?? ""));
    const got = eligibleOrders.map((x) => ({ x, a: x.e.applied.find((a) => a.schemeId === s.id) })).filter((y) => y.a);
    const hubSpend = got.reduce((sum, y) => sum + y.a!.benefit, 0);
    const hubSales = got.reduce((sum, y) => sum + y.x.e.total, 0);
    const reach = eligibleOrders.length ? got.length / eligibleOrders.length : 0;
    const eligibleMtd = customers.filter((c) => !s.typeIds.length || s.typeIds.includes(c.typeId)).reduce((sum, c) => sum + mtd.get(c.id)!, 0);
    const salesWith = eligibleMtd * reach;
    const spend = hubSales ? salesWith * (hubSpend / hubSales) : 0;
    const incremental = salesWith * (UPLIFT[s.mechanic.kind] ?? 0);
    return { s, got: got.length, of: eligibleOrders.length, spend, incremental, roi: spend ? incremental / spend : 0 };
  });
  const totalSpend = schemeRows.reduce((s, x) => s + x.spend, 0);
  const totalInc = schemeRows.reduce((s, x) => s + x.incremental, 0);

  // ── Coverage: plan and visits per visited type
  const visitedTypes = CUSTOMER_TYPES.filter((t) => t.visitsPer4w > 0);
  const onPlan = new Set(plan.map((e) => e.customerId));
  const seen = new Set(VISITS.filter((v) => v.checkIn && v.state !== "skipped").map((v) => v.customerId));
  const coverage = visitedTypes
    .map((t) => {
      const list = customers.filter((c) => c.typeId === t.id);
      return { t, n: list.length, planned: list.filter((c) => onPlan.has(c.id)).length, seen: list.filter((c) => seen.has(c.id)).length };
    })
    .filter((x) => x.n);
  const outlets = customers.filter((c) => ctype(c).visitsPer4w > 0);
  const offPlan = outlets.filter((c) => !onPlan.has(c.id)).length;
  const notBilled = customers.filter((c) => (c.typeId === "T-RET" || c.typeId === "T-WHOL") && mtd.get(c.id) === 0).length;

  const change = pctOf(primaryMtd - primaryLast, primaryLast);

  return (
    <SfShell page="insights">
      <Page>
        <PageIntro>Month to date, 1–{DAYS_IN} September, against the same days of August.</PageIntro>

        <Figures
          items={[
            { label: "Primary sales", value: <Money value={primaryMtd} />, sub: `${change >= 0 ? "+" : ""}${change}% vs last month` },
            { label: "Secondary sales", value: <Money value={secondaryMtd} />, sub: `reported by ${distributors.length} distributors` },
            { label: "Strike rate", value: `${strike}%`, sub: `${productive.length} of ${calls.length} visits ordered` },
            { label: "Lines per call", value: lpc.toFixed(1), sub: "on visits with an order" },
            { label: "Scheme ROI", value: totalSpend ? `${(totalInc / totalSpend).toFixed(1)}×` : "—", sub: "incremental ÷ spend", onClick: () => navigate(sfPath("schemes")) },
          ]}
        />

        <div className="mt-12 grid gap-12 lg:grid-cols-2">
          <Section title="Sales by channel" hint="all orders">
            <ul className="m-0 flex list-none flex-col gap-3.5 p-0">
              {bySource.map((x) => (
                <li key={x.src}>
                  <BarLine label={SOURCE_LABEL[x.src]} figure={x.value ? <><Money value={x.value} code={false} /> · {pctOf(x.value, allMtd)}%</> : "—"} pct={(x.value / maxSrc) * 100} />
                </li>
              ))}
            </ul>
            <p className="m-0 mt-4 text-[11px] text-bz-text-soft">{pctOf(bySource.filter((x) => x.src !== "rep").reduce((s, x) => s + x.value, 0), allMtd)}% of the month's value came in without a rep taking the order.</p>
          </Section>

          <Section title="By customer type">
            <ul className="m-0 flex list-none flex-col gap-3.5 p-0">
              {byType.map((x) => (
                <li key={x.t.id}>
                  <BarLine
                    label={x.t.plural}
                    figure={<Money value={x.value} code={false} />}
                    pct={(x.value / maxType) * 100}
                    sub={x.t.level === "secondary" ? `${x.billed} of ${x.n} bought · billed by their distributor` : `${x.billed} of ${x.n} bought`}
                    onClick={() => navigate(`${sfPath("customers")}?type=${x.t.id}`)}
                  />
                </li>
              ))}
            </ul>
          </Section>
        </div>

        <Section title="Territories" className="mt-14" hint="by sales this month">
          <div className="grid gap-x-12 gap-y-8 lg:grid-cols-2">
            {[
              { label: "Top", rows: byTerr.slice(0, 3) },
              { label: "Bottom", rows: byTerr.slice(-3).reverse() },
            ].map((g) => (
              <div key={g.label}>
                <Micro className="mb-3">{g.label}</Micro>
                <ul className="m-0 flex list-none flex-col gap-3.5 p-0">
                  {g.rows.map((x) => (
                    <li key={x.t.id}>
                      <BarLine
                        label={`${x.t.name} · ${territoryName(x.t.parentId ?? "")}`}
                        figure={<Money value={x.value} code={false} />}
                        pct={(x.value / maxTerr) * 100}
                        tone={g.label === "Bottom" && x.change < 0 ? "warn" : "good"}
                        sub={`${x.change >= 0 ? "+" : ""}${x.change}% vs last month · ${x.billed} of ${x.n} customers bought`}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Scheme performance" count={schemeRows.length} className="mt-14" hint="live schemes applied on orders">
          <div className="hidden grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_72px] gap-6 border-b border-bz-line-soft px-1 pb-2 md:grid">
            {["Scheme", "Spend", "Incremental", "Return"].map((h, i) => (
              <Micro key={h} className={cn(i > 0 && "text-right")}>
                {h}
              </Micro>
            ))}
          </div>
          <div className="divide-y divide-bz-line-soft border-b border-bz-line-soft">
            {schemeRows.map((x) => (
              <button
                key={x.s.id}
                type="button"
                onClick={() => navigate(sfPath(`schemes/${x.s.id}`))}
                className="grid w-full grid-cols-3 items-center gap-x-6 gap-y-2 px-1 py-3 text-left transition-colors hover:bg-bz-paper-warm/60 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_72px]"
              >
                <span className="col-span-3 min-w-0 md:col-span-1">
                  <span className="block truncate text-[12.5px] font-medium text-bz-text">{x.s.name}</span>
                  <span className="block truncate text-[11px] text-bz-text-soft">
                    {MECHANIC[x.s.mechanic.kind]} · {x.got ? `on ${x.got} of ${x.of} eligible hub orders` : "not on a hub order yet"}
                  </span>
                </span>
                <span className="md:text-right">
                  <Micro className="md:hidden">Spend</Micro>
                  <Money value={x.spend} code={false} className="text-[12px] text-bz-text" />
                </span>
                <span className="md:text-right">
                  <Micro className="md:hidden">Incremental</Micro>
                  <Money value={x.incremental} code={false} className="text-[12px] text-bz-text" />
                </span>
                <span className={cn("text-[12.5px] font-semibold md:text-right", NUM, x.roi && x.roi < 1 ? "text-bz-red" : "text-bz-text")}>
                  <Micro className="md:hidden">Return</Micro>
                  {x.roi ? `${x.roi.toFixed(1)}×` : "—"}
                </span>
              </button>
            ))}
          </div>
          <p className="m-0 mt-4 text-[11px] leading-relaxed text-bz-text-soft">
            Spend and reach come from pricing the hub's orders with the scheme engine, scaled to the month's sales. Incremental value assumes a fixed uplift per mechanic until a baseline period is recorded.
          </p>
        </Section>

        <Section title="Outlet coverage" className="mt-14" hint="journey plan and visits, Wed – today">
          <div className="grid gap-x-12 gap-y-4 lg:grid-cols-2">
            {coverage.map((x) => (
              <BarLine
                key={x.t.id}
                label={x.t.plural}
                figure={`${x.planned} of ${x.n} on a plan`}
                pct={pctOf(x.planned, x.n)}
                tone={pctOf(x.planned, x.n) < 80 ? "warn" : "good"}
                sub={`${x.seen} visited · ${x.t.visitsPer4w} visits in 4 weeks each`}
                onClick={() => navigate(sfPath("plan"))}
              />
            ))}
          </div>
          <p className="m-0 mt-5 text-[11.5px] text-bz-text-muted">
            {offPlan} of {outlets.length} visited outlets are on no plan. {notBilled} shops have not bought this month.
          </p>
        </Section>
      </Page>
    </SfShell>
  );
}

export const INSIGHTS_ROUTES = [{ path: "design/salesforce/insights", Component: InsightsPage }];
