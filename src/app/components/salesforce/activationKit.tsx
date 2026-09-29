import * as React from "react";
import { createStore, useStore } from "../sales/store";
import { ActivityList } from "../sales/record";
import { NoteFoot } from "../sales/parts";
import type { HistoryEvent } from "../sales/orders";
import { PEOPLE } from "../productivity/shared";
import { POSM, PRODUCTS, REPS, SF_NOW, SF_TODAY, TERRITORIES } from "./data";
import type { BrandingStage, Campaign, PosmItem, Scheme, SchemeStatus, SfEvent } from "./data";
import { customerById, npr } from "./engine";
import { brandingStore, campaignsStore, eventsStore, posmStore, schemesStore } from "./store";

// ════════════════════════════════════════════════════════════════════════════
// ACTIVATION KIT — what Campaigns, Branding and Events share
//
// The three pages are one loop (a campaign holds branding jobs and events), so
// the link writer, the POSM stock and the record activity live here once. In
// the app: POSM is an item family with its own stock, the installer is the
// vendor of a service PO, and History is api/record-history (research/C §4–6).
// ════════════════════════════════════════════════════════════════════════════

export const ME_ID = "EMP-101";

// ── Stamps ──────────────────────────────────────────────────────────────────

const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
/** The activity list sorts on "Sep 4, 14:10" — keep every stamp in that shape. */
export function stamp(iso: string, time = "09:00") {
  const [, m, d] = iso.slice(0, 10).split("-").map(Number);
  return `${MON[m - 1]} ${d}, ${time}`;
}
export const nowStamp = () => stamp(SF_TODAY, SF_NOW);
export const addDays = (iso: string, n: number) => {
  const t = new Date(`${iso}T00:00:00Z`);
  t.setUTCDate(t.getUTCDate() + n);
  return t.toISOString().slice(0, 10);
};
export const daysBetween = (a: string, b: string) => Math.round((Date.parse(b) - Date.parse(a)) / 86_400_000);

/** A requester is stored as a name ("Arun Rai", "Ramesh Adhikari (portal)"); History needs a person id. */
export const personIdByName = (name: string) => PEOPLE.find((p) => p.name === name)?.id ?? REPS.find((r) => name.startsWith(r.name))?.id ?? null;

// ── History and notes ───────────────────────────────────────────────────────

type Note = { id: string; subject: string; authorId: string; when: string; body: string; title?: string; direction?: "Inbound" | "Outbound" };
type Change = HistoryEvent & { subject: string };

export const notesStore = createStore<Note[]>([
  { id: "an-1", subject: "campaign:CMP-07", authorId: "EMP-118", when: "Sep 2, 16:20", body: "Keep the chiller display claims inside the scheme budget — no top-ups this season." },
  { id: "an-2", subject: "branding:BR-305", authorId: "EMP-313", when: "Sep 4, 10:05", body: "Owner agrees to the side wall. Needs to be done before Ghatasthapana." },
  { id: "an-3", subject: "event:EV-41", authorId: "EMP-321", when: "Sep 3, 17:40", body: "Hotel holds the hall till 6 pm. Dinner for 80 booked." },
]);
export const changesStore = createStore<Change[]>([]);

let seq = 1;
const uid = (p: string) => `${p}-${Date.now().toString(36)}-${seq++}`;
export function logChange(subject: string, what: string) {
  changesStore.set((cs) => [...cs, { id: uid("chg"), subject, whoId: ME_ID, when: nowStamp(), what }]);
}

/** History (seeded from the record, then every change made here) and notes, interleaved. */
export function RecordActivity({ subject, seed }: { subject: string; seed: HistoryEvent[] }) {
  const notes = useStore(notesStore);
  const changes = useStore(changesStore);
  const comments = notes.filter((n) => n.subject === subject);
  const history = [...seed, ...changes.filter((c) => c.subject === subject)];
  return <ActivityList comments={comments} history={history} />;
}
export function RecordNoteFoot({ subject }: { subject: string }) {
  return <NoteFoot onSend={(n) => notesStore.set((ns) => [...ns, { id: uid("note"), subject, authorId: ME_ID, when: nowStamp(), body: n.body, title: n.title, direction: n.direction }])} />;
}

// ── POSM stock and installers ───────────────────────────────────────────────

export { posmStore };
export const posmById = (id: string) => posmStore.get().find((p) => p.id === id);
/** Who installs a job — the vendor of its service PO, or one of our merchandisers. Not on BrandingJob yet. */
export const SEED_INSTALLERS: Record<string, string> = { "BR-301": "Coolex Traders", "BR-302": "PrintHub Nepal" };
export const installerStore = createStore<Record<string, string>>({ ...SEED_INSTALLERS });
export const INSTALLERS = [...new Set(POSM.map((p) => p.vendor)), ...REPS.filter((r) => r.role === "Merchandiser").map((r) => `${r.name} (merchandiser)`)];

// ── Campaign extras ─────────────────────────────────────────────────────────

/** Brand of a campaign — not on the Campaign shape; a new campaign writes it here. */
export const campaignBrandStore = createStore<Record<string, string>>({ "CMP-07": "Himal Fresh", "CMP-08": "Chau Chau", "CMP-05": "Chau Chau" });

export function seasonOf(from: string) {
  const m = Number(from.slice(5, 7));
  const y = Number(from.slice(0, 4)) + 57;
  if (m >= 9 && m <= 11) return `Dashain–Tihar ${y}`;
  if (m >= 6 && m <= 8) return `Monsoon ${y}`;
  if (m === 12 || m <= 2) return `Winter ${y}`;
  return `Spring ${y}`;
}

export const CAMPAIGN_TONE: Record<Campaign["status"], "good" | "info" | "neutral" | "off"> = { live: "good", planned: "info", draft: "neutral", ended: "off" };
export const CAMPAIGN_LABEL: Record<Campaign["status"], string> = { live: "Live", planned: "Planned", draft: "Draft", ended: "Ended" };
export const SCHEME_TONE: Record<SchemeStatus, "good" | "info" | "neutral" | "warn" | "off"> = { live: "good", scheduled: "info", draft: "neutral", paused: "warn", ended: "off" };
export const SCHEME_LABEL: Record<SchemeStatus, string> = { live: "Live", scheduled: "Scheduled", draft: "Draft", paused: "Paused", ended: "Ended" };
export const STAGE_LABEL: Record<BrandingStage, string> = { requested: "Requested", approved: "Approved", installing: "Installing", installed: "Installed", rejected: "Rejected" };
export const STAGE_TONE: Record<BrandingStage, "warn" | "info" | "good" | "off"> = { requested: "warn", approved: "info", installing: "info", installed: "good", rejected: "off" };
export const EVENT_LABEL: Record<SfEvent["status"], string> = { planned: "Planned", live: "On now", done: "Done" };

export const campaignName = (id: string | null) => (id ? campaignsStore.get().find((c) => c.id === id)?.name ?? id : null);
export const customerName = (id: string) => customerById(id)?.name ?? id;
export const territoryName = (id: string) => TERRITORIES.find((t) => t.id === id)?.name ?? id;

/** Is a territory inside any of the given regions / areas / territories (the AREA tree)? */
export function inTerritories(territoryId: string, roots: string[]) {
  if (!roots.length) return true;
  let t = TERRITORIES.find((x) => x.id === territoryId);
  while (t) {
    if (roots.includes(t.id)) return true;
    t = TERRITORIES.find((x) => x.id === t!.parentId);
  }
  return false;
}

export function schemeText(s: Scheme) {
  const m = s.mechanic;
  switch (m.kind) {
    case "free-goods":
      return `Buy ${m.buyQty} get ${m.getQty} free`;
    case "slab":
      return m.slabs.length > 1 ? `${m.slabs[0].pct}–${m.slabs[m.slabs.length - 1].pct}% off by quantity` : `${m.slabs[0].pct}% off from ${m.slabs[0].minQty}`;
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
  const cost = PRODUCTS.find((p) => p.id === itemId)?.cost ?? 0;
  return s.budget.used * cost;
}

// ── The campaign link writer ────────────────────────────────────────────────

export type LinkKind = "scheme" | "branding" | "event";
const LIST_KEY = { scheme: "schemeIds", branding: "brandingIds", event: "eventIds" } as const;
const SUBJECT = { scheme: "scheme", branding: "branding", event: "event" } as const;
export const KIND_WORD: Record<LinkKind, string> = { scheme: "scheme", branding: "branding job", event: "event" };

/**
 * Put an item in a campaign (or take it out with `campaignId = null`). The item's own `campaignId` is the truth;
 * the campaign's id list is kept in step so pages that read either agree.
 */
export function linkToCampaign(kind: LinkKind, itemId: string, campaignId: string | null, label: string) {
  const key = LIST_KEY[kind];
  let from: string | null = null;
  const setId = <T extends { id: string; campaignId: string | null }>(xs: T[]) =>
    xs.map((x) => {
      if (x.id !== itemId) return x;
      from = x.campaignId;
      return { ...x, campaignId };
    });
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
  const fromId = from as string | null;
  if (campaignId) logChange(`campaign:${campaignId}`, `added the ${KIND_WORD[kind]} ${label}`);
  if (fromId && fromId !== campaignId) logChange(`campaign:${fromId}`, `${campaignId ? "moved" : "removed"} the ${KIND_WORD[kind]} ${label}${campaignId ? ` to ${campaignName(campaignId)}` : ""}`);
  logChange(`${SUBJECT[kind]}:${itemId}`, campaignId ? `put it in ${campaignName(campaignId)}` : `took it out of ${campaignName(fromId)}`);
}

