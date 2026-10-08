import * as React from "react";
import { useNavigate } from "react-router";
import { ListTree, Table2 } from "lucide-react";
import { cn } from "../ui/utils";
import { Meter, NUM } from "../sales/bzw";
import { Amount } from "../sales/orders";
import { useStore } from "../sales/store";
import { SF_TODAY } from "./data";
import type { Campaign } from "./data";
import { day, npr } from "./engine";
import { brandingStore, campaignsStore, customersStore, eventsStore, hubStore, posmStore, productsStore, schemesStore } from "./store";
import { FxDesk, pillTone } from "./fx-desk";
import { sfPath } from "./sf";
import { CAMPAIGN_LABEL, CAMPAIGN_TONE, campaignBrandStore, campaignOrders, campaignSpend, kpiActual, kpisStore, statusNow } from "./activationKit";
import { CampaignPanel, NewCampaign } from "./CampaignDetail";
import type { CampaignRow, Goal } from "./CampaignDetail";

// ════════════════════════════════════════════════════════════════════════════
// GROWTH · CAMPAIGNS — the season's containers
//
// A campaign is the place a season's schemes, branding and events meet a goal
// and a budget (research/C §4.3). Its spend rolls up from what it holds and its
// goals are counted from approved orders and installs — nothing is typed in
// but the targets. The desk is a `FxDesk`; the campaign is its record panel.
// ════════════════════════════════════════════════════════════════════════════

const STATUSES: Campaign["status"][] = ["live", "planned", "draft", "ended"];
const ORDER: Record<Campaign["status"], number> = { live: 0, planned: 1, draft: 2, ended: 3 };
const spentPct = (r: CampaignRow) => (r.money.spent / Math.max(1, r.c.budget)) * 100;

export function CampaignsPage() {
  const navigate = useNavigate();
  const campaigns = useStore(campaignsStore);
  const schemes = useStore(schemesStore);
  const branding = useStore(brandingStore);
  const events = useStore(eventsStore);
  const hub = useStore(hubStore);
  const brands = useStore(campaignBrandStore);
  const kpis = useStore(kpisStore);
  // What the rules read through the stores: the audience (customers), a goal's product, a job's cost.
  const customers = useStore(customersStore);
  const products = useStore(productsStore);
  const posm = useStore(posmStore);

  const rows = React.useMemo<CampaignRow[]>(
    () =>
      campaigns
        .map((c) => {
          const mine = kpis[c.id] ?? [];
          // Only a goal counted from orders needs the campaign's orders priced.
          const orders = mine.some((k) => k.measure !== "branded") ? campaignOrders(c, hub) : [];
          const goals: Goal[] = mine.map((k) => {
            const actual = kpiActual(k, c, orders, branding);
            return { k, actual, pct: (actual / Math.max(1, k.target)) * 100 };
          });
          return { c, st: statusNow(c, SF_TODAY), brand: brands[c.id] ?? "", money: campaignSpend(c, schemes, branding, events), goals };
        })
        .sort((a, b) => ORDER[a.st] - ORDER[b.st] || a.c.from.localeCompare(b.c.from)),
    [campaigns, schemes, branding, events, hub, brands, kpis, customers, products, posm],
  );

  const is = (s: Campaign["status"]) => (r: CampaignRow) => r.st === s;
  const running = rows.filter((r) => r.st !== "ended");
  const budget = running.reduce((s, r) => s + r.c.budget, 0);
  const spent = running.reduce((s, r) => s + r.money.spent, 0);
  const brandNames = [...new Set(rows.map((r) => r.brand).filter(Boolean))].sort();

  return (
    <FxDesk<CampaignRow>
      place="campaigns"
      section="salesforce/campaigns"
      noun={["campaign", "campaigns"]}
      rows={rows}
      noOf={(r) => r.c.id}
      showPeriod={false}
      searchText={(r) => `${r.c.id} ${r.c.name} ${r.brand} ${r.c.objective}`}
      searchPlaceholder="Name or brand"
      partyLabel="Campaign"
      amountLabel="Spent"
      stats={
        rows.length
          ? [
              { label: "Budget", value: <Amount value={budget} currency="NPR" />, title: "Of campaigns that have not ended" },
              { label: "Spent", value: <Amount value={spent} />, title: budget ? `${Math.round((spent / budget) * 100)}% of that budget` : undefined },
            ]
          : []
      }
      picks={rows.length ? [{ key: "live", label: "Live", value: rows.filter(is("live")).length, test: is("live"), title: "Running today" }] : []}
      views={[
        { key: "status", label: "By status", icon: ListTree, groups: (rs) => STATUSES.map((s) => ({ key: s, label: CAMPAIGN_LABEL[s], rows: rs.filter(is(s)), collapsed: s === "ended" })) },
        { key: "register", label: "Register", icon: Table2, groups: (rs) => [{ key: "all", label: "", rows: rs }] },
      ]}
      filters={[
        ...STATUSES.map((s) => ({ value: `st:${s}`, label: CAMPAIGN_LABEL[s], group: "Status", test: is(s) })),
        ...brandNames.map((b) => ({ value: `brand:${b}`, label: b, group: "Brand", test: (r: CampaignRow) => r.brand === b })),
      ]}
      sorts={[
        { key: "start", label: "Start date", by: (r) => r.c.from + r.c.id },
        { key: "end", label: "End date", by: (r) => r.c.to + r.c.id },
        { key: "budget", label: "Budget", by: (r) => r.c.budget, desc: true },
        { key: "spent", label: "Spent", by: (r) => r.money.spent, desc: true },
        { key: "name", label: "Name", by: (r) => r.c.name.toLowerCase() },
      ]}
      columns={[
        { key: "goal", label: "Goal", width: "136px", render: (r) => (r.goals[0] ? <GoalCell g={r.goals[0]} /> : <span className="text-bz-text-soft">No goal</span>) },
      ]}
      primary={(r) => ({
        title: r.c.name,
        sub: (
          <>
            {day(r.c.from)} – {day(r.c.to)}
            {r.brand ? ` · ${r.brand}` : ""}
          </>
        ),
        subOnDesktop: true,
      })}
      status={(r) => ({ label: CAMPAIGN_LABEL[r.st], tone: pillTone(CAMPAIGN_TONE[r.st]) })}
      amount={(r) => {
        const over = r.money.spent > r.c.budget;
        return {
          value: <Amount value={r.money.spent} className={over ? "text-bz-red" : undefined} />,
          sub: (
            <>
              <span className="my-1 block">
                <Meter thin pct={spentPct(r)} danger={over} />
              </span>
              <span className={cn(NUM, over && "text-bz-red")}>
                {Math.round(spentPct(r))}% of {npr(r.c.budget)}
              </span>
            </>
          ),
        };
      }}
      newLabel="New campaign"
      onNew={() => navigate(sfPath("campaigns/new"))}
      renderNew={(ctx) => <NewCampaign ctx={ctx} />}
      renderPanel={(r, ctx) => <CampaignPanel key={r.c.id} r={r} ctx={ctx} />}
    />
  );
}

/** The first goal's progress: a thin meter over "62% · Himal Fresh volume". */
function GoalCell({ g }: { g: Goal }) {
  return (
    <span title={`${g.k.label} · ${npr(g.actual)} of ${npr(g.k.target)} ${g.k.unit}`}>
      <span className="mb-1 block">
        <Meter thin pct={g.pct} />
      </span>
      <span className={cn("block truncate text-[11px] text-bz-text-soft", NUM)}>
        {Math.round(g.pct)}% · {g.k.label}
      </span>
    </span>
  );
}

// The campaign used to be a page of its own at this same address; it is now the desk's record (⤢ gives it the page).
export const CAMPAIGNS_ROUTES = [
  { path: "design/salesforce/campaigns", Component: CampaignsPage },
  { path: "design/salesforce/campaigns/:no", Component: CampaignsPage },
];
