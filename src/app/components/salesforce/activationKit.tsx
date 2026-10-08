import type { BrandingJob, BrandingStage, Campaign, Customer, HubOrder, Scheme, SchemeStatus, SfEvent } from "./data";
import { customerById, evaluate, npr, productById } from "./engine";
import { persistentStore } from "./persist";
import { logEvent } from "./records";
import { brandingStore, campaignsStore, customersStore, eventsStore, posmStore, repsStore, schemesStore } from "./store";

// ════════════════════════════════════════════════════════════════════════════
// ACTIVATION KIT — what Campaigns, Branding and Events share
//
// The three pages are one loop (a campaign holds offers, branding jobs and
// events), so the link writer, the campaign measures and the extras the shared
// shapes don't carry live here once. In the app: POSM is an item family with
// its own stock, the installer is the vendor of a service PO, and a campaign
// measure is a saved query over sales orders and branding jobs.
// ════════════════════════════════════════════════════════════════════════════

// ── Dates ───────────────────────────────────────────────────────────────────

export const addDays = (iso: string, n: number) => {
  const t = new Date(`${iso}T00:00:00Z`);
  t.setUTCDate(t.getUTCDate() + n);
  return t.toISOString().slice(0, 10);
};
export const daysBetween = (a: string, b: string) => Math.round((Date.parse(b) - Date.parse(a)) / 86_400_000);

/** "1,20,000" or "120000" typed into a money box → 120000. */
export const toNumber = (s: string) => Number(s.replace(/[^\d.]/g, "")) || 0;

// ── Extras the shared shapes don't carry (persistent, keyed by record id) ───

/** Who installs a branding job — a POSM vendor or one of our merchandisers. Not on BrandingJob. */
export const installerStore = persistentStore<Record<string, string>>("growth.installers", {}, () => ({ "BR-301": "Coolex Traders", "BR-302": "PrintHub Nepal" }));

/** A campaign's brand (free text, like Product.brand). Not on Campaign. */
export const campaignBrandStore = persistentStore<Record<string, string>>("growth.campaignBrand", {}, () => ({ "CMP-07": "Himal Fresh", "CMP-08": "Chau Chau", "CMP-05": "Chau Chau" }));

/**
 * What a campaign is measured by. Only the target is typed in — the actual is always counted (kpiActual), so
 * Campaign.kpi (which stores an actual) is not used.
 */
export type KpiMeasure = "sales" | "cases" | "branded";
export type Kpi = { id: string; label: string; measure: KpiMeasure; target: number; unit: string; productId: string | null; brand: string | null };
export const kpisStore = persistentStore<Record<string, Kpi[]>>("growth.kpis", {}, () => ({
  "CMP-07": [
    { id: "K-1", label: "Himal Fresh volume", measure: "cases", target: 18_000, unit: "cases", productId: null, brand: "Himal Fresh" },
    { id: "K-2", label: "Outlets branded", measure: "branded", target: 180, unit: "outlets", productId: null, brand: null },
  ],
  "CMP-08": [{ id: "K-1", label: "Cup Noodles sold", measure: "cases", target: 2_400, unit: "ctn", productId: "P-153", brand: null }],
  "CMP-05": [{ id: "K-1", label: "Noodle volume", measure: "cases", target: 6_000, unit: "ctn", productId: null, brand: "Chau Chau" }],
}));

export const MEASURE_LABEL: Record<KpiMeasure, string> = { sales: "Sales value", cases: "Quantity sold", branded: "Outlets branded" };
export const MEASURE_HINT: Record<KpiMeasure, string> = {
  sales: "Approved orders in the campaign dates from customers in its audience, before tax.",
  cases: "Units of a product or brand on those orders.",
  branded: "Customers with an installed branding job in this campaign.",
};
export const MEASURE_UNIT: Record<KpiMeasure, string> = { sales: "NPR", cases: "cases", branded: "outlets" };

// ── Labels ──────────────────────────────────────────────────────────────────

export const CAMPAIGN_TONE: Record<Campaign["status"], "good" | "info" | "neutral" | "off"> = { live: "good", planned: "info", draft: "neutral", ended: "off" };
export const CAMPAIGN_LABEL: Record<Campaign["status"], string> = { live: "Live", planned: "Planned", draft: "Draft", ended: "Ended" };
export const SCHEME_TONE: Record<SchemeStatus, "good" | "info" | "neutral" | "warn" | "off"> = { live: "good", scheduled: "info", draft: "neutral", paused: "warn", ended: "off" };
export const SCHEME_LABEL: Record<SchemeStatus, string> = { live: "Live", scheduled: "Scheduled", draft: "Draft", paused: "Paused", ended: "Ended" };
export const STAGE_LABEL: Record<BrandingStage, string> = { requested: "Requested", approved: "Approved", installing: "Installing", installed: "Installed", rejected: "Rejected" };
export const STAGE_TONE: Record<BrandingStage, "warn" | "info" | "good" | "off"> = { requested: "warn", approved: "info", installing: "info", installed: "good", rejected: "off" };
export const EVENT_LABEL: Record<SfEvent["status"], string> = { planned: "Planned", live: "On now", done: "Done" };

/** A draft or ended campaign keeps its status; otherwise its dates say whether it is planned, live or over. */
export function statusNow(c: Campaign, today: string): Campaign["status"] {
  if (c.status === "draft" || c.status === "ended") return c.status;
  return today < c.from ? "planned" : today > c.to ? "ended" : "live";
}

export const campaignName =(id: string | null) => (id ? campaignsStore.get().find((c) => c.id === id)?.name ?? "Deleted campaign" : null);
export const customerName = (id: string) => customerById(id)?.name ?? "Deleted customer";
export const posmName = (id: string) => posmStore.get().find((p) => p.id === id)?.name ?? "Deleted POSM item";

/** Who can install: the vendors on the POSM items and our merchandisers. */
export function installerOptions() {
  const vendors = [...new Set(posmStore.get().map((p) => p.vendor.trim()).filter(Boolean))];
  const merch = repsStore.get().filter((r) => r.role === "Merchandiser").map((r) => `${r.name} (merchandiser)`);
  return [...vendors, ...merch];
}

/** A campaign's audience is its customer types; none picked = every customer. */
export const inAudience = (c: Campaign, x: Customer | undefined) => !!x && (!c.audience.typeIds.length || c.audience.typeIds.includes(x.typeId));
export const audienceOf = (c: Campaign, customers: Customer[] = customersStore.get()) => customers.filter((x) => inAudience(c, x));

export function schemeText(s: Scheme) {
  const m = s.mechanic;
  switch (m.kind) {
    case "free-goods":
      return `Buy ${m.buyQty} get ${m.getQty} free`;
    case "slab":
      return m.slabs.length > 1 ? `${m.slabs[0].pct}–${m.slabs[m.slabs.length - 1].pct}% off by quantity` : m.slabs.length ? `${m.slabs[0].pct}% off from ${m.slabs[0].minQty}` : "Off by quantity";
    case "combo":
      return `Combo · ${m.getQty} free`;
    case "invoice-value":
      return `${m.pct}% off orders over NPR ${npr(m.minValue)}`;
    case "first-order":
      return `${m.pct}% off a first order`;
    case "target-rebate":
      return `${m.pct}% rebate on NPR ${npr(m.target)}`;
    case "display":
      return `NPR ${npr(m.amount)} a month for display`;
    case "early-payment":
      return `${m.pct}% off if paid in ${m.withinDays} days`;
  }
}

/** What a scheme has cost so far: value budgets report it; a free-goods budget counts units, valued at cost. */
export function schemeSpend(s: Scheme) {
  if (!s.budget) return 0;
  if (s.budget.kind === "value") return s.budget.used;
  const m = s.mechanic;
  const itemId = m.kind === "free-goods" ? (m.getItemId === "same" ? m.buyItemIds[0] : m.getItemId) : m.kind === "combo" ? m.getItemId : null;
  return itemId ? s.budget.used * productById(itemId).cost : 0;
}

// ── Spend: rolled up from what the campaign holds ───────────────────────────

export type LinkKind = "scheme" | "branding" | "event";
export type Bucket = { key: LinkKind; label: string; spent: number; committed: number };

export function jobCost(b: BrandingJob) {
  return (posmStore.get().find((p) => p.id === b.posmId)?.cost ?? 0) * b.qty;
}

/** Schemes: their budget use. Branding: POSM cost once installing (committed when approved). Events: cost once done. */
export function campaignSpend(c: Campaign, schemes: Scheme[], branding: BrandingJob[], events: SfEvent[]) {
  const mySchemes = schemes.filter((s) => s.campaignId === c.id);
  const myJobs = branding.filter((b) => b.campaignId === c.id);
  const myEvents = events.filter((e) => e.campaignId === c.id);
  const buckets: Bucket[] = [
    { key: "scheme", label: "Schemes", spent: mySchemes.reduce((s, x) => s + schemeSpend(x), 0), committed: 0 },
    {
      key: "branding",
      label: "Branding",
      spent: myJobs.filter((b) => b.stage === "installing" || b.stage === "installed").reduce((s, b) => s + jobCost(b), 0),
      committed: myJobs.filter((b) => b.stage === "approved").reduce((s, b) => s + jobCost(b), 0),
    },
    {
      key: "event",
      label: "Events",
      spent: myEvents.filter((e) => e.status === "done").reduce((s, e) => s + e.cost, 0),
      committed: myEvents.filter((e) => e.status !== "done").reduce((s, e) => s + e.cost, 0),
    },
  ];
  return { buckets, spent: buckets.reduce((s, b) => s + b.spent, 0), committed: buckets.reduce((s, b) => s + b.committed, 0) };
}

// ── Measures: counted, never typed in ───────────────────────────────────────

/** Approved hub orders dated inside the campaign, from customers in its audience, each valued by the engine. */
export function campaignOrders(c: Campaign, hub: HubOrder[]): { order: HubOrder; value: number }[] {
  const schemes = schemesStore.get();
  return hub
    .filter((o) => o.status === "approved")
    .filter((o) => {
      const d = o.at.slice(0, 10);
      return d >= c.from && d <= c.to && inAudience(c, customerById(o.customerId));
    })
    .map((o) => {
      const ev = evaluate(o.customerId, o.lines, schemes, { date: o.at.slice(0, 10) });
      return { order: o, value: ev.total - ev.tax };
    });
}

export function kpiActual(k: Kpi, c: Campaign, orders: { order: HubOrder; value: number }[], branding: BrandingJob[]) {
  if (k.measure === "sales") return orders.reduce((s, o) => s + o.value, 0);
  if (k.measure === "branded") return new Set(branding.filter((b) => b.campaignId === c.id && b.stage === "installed").map((b) => b.customerId)).size;
  const counts = (productId: string) => (k.productId ? productId === k.productId : k.brand ? productById(productId).brand === k.brand : true);
  return orders.reduce((s, o) => s + o.order.lines.filter((l) => counts(l.productId)).reduce((n, l) => n + l.qty, 0), 0);
}

/** What a quantity measure counts: "Cup Noodles 60g", "all Himal Fresh", or "all products". */
export function kpiScope(k: Kpi) {
  if (k.measure !== "cases") return null;
  return k.productId ? productById(k.productId).name : k.brand ? `All ${k.brand}` : "All products";
}

// ── The campaign link writer ────────────────────────────────────────────────

const LIST_KEY = { scheme: "schemeIds", branding: "brandingIds", event: "eventIds" } as const;
export const KIND_WORD: Record<LinkKind, string> = { scheme: "scheme", branding: "branding job", event: "event" };

/**
 * Put an item in a campaign (or take it out with `campaignId = null`). The item's own `campaignId` is the truth;
 * the campaign's id list is kept in step so pages that read either agree.
 */
export function linkToCampaign(kind: LinkKind, itemId: string, campaignId: string | null, label: string) {
  const key = LIST_KEY[kind];
  const list: { id: string; campaignId: string | null }[] = kind === "scheme" ? schemesStore.get() : kind === "branding" ? brandingStore.get() : eventsStore.get();
  const from = list.find((x) => x.id === itemId)?.campaignId ?? null;
  const setId = <T extends { id: string; campaignId: string | null }>(xs: T[]) => xs.map((x) => (x.id === itemId ? { ...x, campaignId } : x));
  if (kind === "scheme") schemesStore.set(setId);
  else if (kind === "branding") brandingStore.set(setId);
  else eventsStore.set(setId);
  campaignsStore.set((cs) =>
    cs.map((c) => {
      const has = c[key].includes(itemId);
      if (c.id === campaignId && !has) return { ...c, [key]: [...c[key], itemId] };
      if (c.id !== campaignId && has) return { ...c, [key]: c[key].filter((x) => x !== itemId) };
      return c;
    }),
  );
  if (from === campaignId) return;
  if (campaignId) logEvent(campaignId, `added the ${KIND_WORD[kind]} ${label}`);
  if (from) logEvent(from, `${campaignId ? "moved" : "removed"} the ${KIND_WORD[kind]} ${label}${campaignId ? ` to ${campaignName(campaignId)}` : ""}`);
  logEvent(itemId, campaignId ? `put it in the campaign ${campaignName(campaignId)}` : `took it out of the campaign ${campaignName(from)}`);
}
