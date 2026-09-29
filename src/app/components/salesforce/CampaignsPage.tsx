import * as React from "react";
import { useNavigate, useParams } from "react-router";
import { Megaphone, Plus } from "lucide-react";
import { cn } from "../ui/utils";
import { BTN, Dialog, Field, GHOST, INPUT, NUM, Select, TEXTAREA } from "../sales/bzw";
import { useStore } from "../sales/store";
import { BRANDS, SF_TODAY } from "./data";
import type { Campaign } from "./data";
import { day } from "./engine";
import { brandingStore, campaignsStore, eventsStore, schemesStore } from "./store";
import { SfShell, sfPath } from "./shell";
import { Dot, EmptyNote, Figures, List, Money, Page, PageIntro, Progress, Row, Section } from "./ui";
import { CAMPAIGN_LABEL, CAMPAIGN_TONE, ME_ID, campaignBrandStore, logChange, seasonOf } from "./activationKit";
import { CampaignDetail, campaignSpend } from "./CampaignDetail";

// ════════════════════════════════════════════════════════════════════════════
// CAMPAIGNS — the season's containers
//
// A campaign is not a list of settings; it is the place a season's schemes,
// branding and events meet a goal and a budget (research/C §4.3). The list is a
// calm row per campaign with its main measure; the campaign itself is a page.
// ════════════════════════════════════════════════════════════════════════════

const ORDER: Record<Campaign["status"], number> = { live: 0, planned: 1, draft: 2, ended: 3 };

export function CampaignsPage() {
  const { id } = useParams();
  if (id) return <CampaignDetail id={id} />;
  return <CampaignList />;
}

function CampaignList() {
  const navigate = useNavigate();
  const campaigns = useStore(campaignsStore);
  const schemes = useStore(schemesStore);
  const branding = useStore(brandingStore);
  const events = useStore(eventsStore);
  const brands = useStore(campaignBrandStore);
  const [creating, setCreating] = React.useState(false);

  const rows = [...campaigns].sort((a, b) => ORDER[a.status] - ORDER[b.status] || a.from.localeCompare(b.from));
  const running = campaigns.filter((c) => c.status === "live");
  const season = campaigns.filter((c) => c.status !== "ended");
  const spend = (c: Campaign) => campaignSpend(c, schemes, branding, events);
  const seasonBudget = season.reduce((s, c) => s + c.budget, 0);
  const seasonSpent = season.reduce((s, c) => s + spend(c).spent, 0);

  return (
    <SfShell page="campaigns">
      <Page>
        <PageIntro
          actions={
            <button type="button" className={BTN} onClick={() => setCreating(true)}>
              <Plus size={13} /> New campaign
            </button>
          }
        >
          Each campaign groups a season's schemes, branding and events around one goal and one budget.
        </PageIntro>

        <Figures
          items={[
            { label: "Live now", value: running.length, sub: `${season.length - running.length} planned or draft` },
            { label: "Budget this season", value: <Money value={seasonBudget} /> },
            { label: "Spent so far", value: <Money value={seasonSpent} />, sub: seasonBudget ? `${Math.round((seasonSpent / seasonBudget) * 100)}% of budget` : undefined },
          ]}
        />

        <Section title="Campaigns" count={rows.length} className="mt-12">
          {rows.length === 0 ? (
            <EmptyNote
              action={
                <button type="button" className={GHOST} onClick={() => setCreating(true)}>
                  New campaign
                </button>
              }
            >
              No campaigns yet.
            </EmptyNote>
          ) : (
            <List>
              {rows.map((c) => {
                const k = c.kpi[0];
                const pct = k ? (k.actual / Math.max(1, k.target)) * 100 : 0;
                return (
                  <Row
                    key={c.id}
                    onClick={() => navigate(sfPath(`campaigns/${c.id}`))}
                    lead={
                      <span className="flex size-8 items-center justify-center rounded-bz-pill bg-bz-paper-warm text-bz-text-muted">
                        <Megaphone size={14} />
                      </span>
                    }
                    title={c.name}
                    sub={
                      <>
                        {[brands[c.id], seasonOf(c.from)].filter(Boolean).join(" · ")}
                        <span className="md:hidden">
                          {" · "}
                          {day(c.from)} – {day(c.to)}
                          {k ? ` · ${Math.round(pct)}% ${k.label.toLowerCase()}` : ""}
                        </span>
                      </>
                    }
                    meta={[
                      <span key="d" className={cn("inline-block w-[112px]", NUM)}>
                        {day(c.from)} – {day(c.to)}
                      </span>,
                      <span key="k" className="inline-block w-[180px]">
                        {k ? (
                          <>
                            <Progress pct={pct} tone={c.status === "ended" && pct < 100 ? "warn" : "good"} />
                            <span className={cn("mt-1 block truncate text-[11px] text-bz-text-soft", NUM)}>
                              {Math.round(pct)}% · {k.label.toLowerCase()}
                            </span>
                          </>
                        ) : (
                          <span className="text-bz-text-soft">No target set</span>
                        )}
                      </span>,
                    ]}
                    trail={
                      <span className="inline-block w-[70px] text-left">
                        <Dot tone={CAMPAIGN_TONE[c.status]}>{CAMPAIGN_LABEL[c.status]}</Dot>
                      </span>
                    }
                  />
                );
              })}
            </List>
          )}
        </Section>
      </Page>
      <NewCampaignDialog open={creating} onClose={() => setCreating(false)} onCreated={(id) => navigate(sfPath(`campaigns/${id}`))} />
    </SfShell>
  );
}

// ── New campaign ────────────────────────────────────────────────────────────

const UNITS = ["cases", "outlets", "ctn", "NPR"];

function NewCampaignDialog({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: (id: string) => void }) {
  const [name, setName] = React.useState("");
  const [from, setFrom] = React.useState("2026-10-01");
  const [to, setTo] = React.useState("2026-10-31");
  const [brand, setBrand] = React.useState<string | null>(null);
  const [budget, setBudget] = React.useState("");
  const [goal, setGoal] = React.useState("");
  const [target, setTarget] = React.useState("");
  const [unit, setUnit] = React.useState("cases");
  const [tried, setTried] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    setName("");
    setBrand(null);
    setBudget("");
    setGoal("");
    setTarget("");
    setTried(false);
  }, [open]);

  const budgetN = Number(budget.replace(/[^\d]/g, ""));
  const targetN = Number(target.replace(/[^\d]/g, ""));
  const datesBad = !from || !to || to < from;
  const missing = !name.trim() || datesBad || !budgetN;

  const create = () => {
    setTried(true);
    if (missing) return;
    const taken = new Set(campaignsStore.get().map((c) => c.id));
    let n = 9;
    while (taken.has(`CMP-${String(n).padStart(2, "0")}`)) n++;
    const id = `CMP-${String(n).padStart(2, "0")}`;
    const c: Campaign = {
      id,
      name: name.trim(),
      objective: goal.trim(),
      status: from <= SF_TODAY && to >= SF_TODAY ? "live" : "draft",
      from,
      to,
      audience: { typeIds: [], territoryIds: [], outlets: 0 },
      budget: budgetN,
      spent: 0,
      schemeIds: [],
      brandingIds: [],
      eventIds: [],
      tasks: [],
      kpi: targetN ? [{ label: unit === "outlets" ? "Outlets" : unit === "NPR" ? "Sales" : "Volume", target: targetN, actual: 0, unit }] : [],
      owner: ME_ID,
    };
    campaignsStore.set((cs) => [c, ...cs]);
    if (brand) campaignBrandStore.set((b) => ({ ...b, [id]: brand }));
    logChange(`campaign:${id}`, "created the campaign");
    onClose();
    onCreated(id);
  };

  return (
    <Dialog
      open={open}
      title="New campaign"
      onClose={onClose}
      foot={
        <>
          <button type="button" className={GHOST} onClick={onClose}>
            Cancel
          </button>
          <button type="button" className={BTN} onClick={create}>
            Create campaign
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Field label="Name" required>
          <input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Tihar with Crunchy" className={INPUT} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Starts" required>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className={INPUT} />
          </Field>
          <Field label="Ends" required hint={tried && datesBad ? "The end date is before the start." : undefined}>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className={INPUT} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Brand">
            <Select trigger="ghost" className="h-9 w-full justify-between" value={brand} onChange={setBrand} placeholder="Brand" label={brand ?? "Pick a brand"} options={BRANDS.map((b) => ({ value: b, label: b }))} />
          </Field>
          <Field label="Budget (NPR)" required>
            <input inputMode="numeric" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="500,000" className={cn(INPUT, NUM)} />
          </Field>
        </div>
        <Field label="Goal" hint="One sentence the team can remember.">
          <textarea value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="e.g. Place Crunchy Digestive in 200 new outlets before Tihar." className={TEXTAREA} />
        </Field>
        <Field label="Measure it by">
          <div className="flex gap-2">
            <input inputMode="numeric" value={target} onChange={(e) => setTarget(e.target.value)} placeholder="Target" className={cn(INPUT, NUM, "flex-1")} />
            <Select trigger="ghost" className="h-9" value={unit} onChange={setUnit} label={unit} options={UNITS.map((u) => ({ value: u, label: u }))} width={160} />
          </div>
        </Field>
        {tried && missing && <p className="m-0 text-[11.5px] text-bz-red">Add a name, valid dates and a budget.</p>}
      </div>
    </Dialog>
  );
}

export const CAMPAIGNS_ROUTES = [
  { path: "design/salesforce/campaigns", Component: CampaignsPage },
  { path: "design/salesforce/campaigns/:id", Component: CampaignsPage },
];
