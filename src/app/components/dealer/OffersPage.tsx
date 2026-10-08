import * as React from "react";
import { CalendarDays, Check, Gift, Megaphone } from "lucide-react";
import { cn } from "../ui/utils";
import { Dialog, Field, NUM, TEXTAREA } from "../sales/bzw";
import { useStore } from "../sales/store";
import { SF_TODAY } from "../salesforce/data";
import type { BrandingStage, Scheme } from "../salesforce/data";
import { day, daysUntil, evaluate, npr } from "../salesforce/engine";
import { nextId } from "../salesforce/persist";
import { logEvent } from "../salesforce/records";
import { announcementsStore, brandingStore, campaignsStore, eventsStore, ledgerStore, posmStore, schemesStore } from "../salesforce/store";
import { Dot, EmptyNote, Progress, Section } from "../salesforce/ui";
import { DealerShell } from "./shell";
import { LIME, PageHead, PhotoSlot, QtyStepper, SOFT } from "./kit";
import { billedBetween, cap, isFirstOrder, liveFor, notify, rsvpStore, schemeItemIds, schemeSentence, soonFor, useCart, useDealer } from "./portal";
import type { Tone } from "./portal";

// ════════════════════════════════════════════════════════════════════════════
// OFFERS — what the dealer gets from the company right now
//
// Every offer is one plain sentence (portal.schemeSentence), never a rule
// table. Below: the campaigns it is part of, the branding it asked for, the
// events it can go to, and the company's announcements.
// ════════════════════════════════════════════════════════════════════════════

const WHEN: Record<Scheme["applies"], string> = { order: "On your orders", period: "Over the period", claim: "Claim it", payment: "When you pay" };
const STAGE: Record<BrandingStage, { label: string; tone: Tone }> = {
  requested: { label: "Asked for", tone: "warn" },
  approved: { label: "Approved", tone: "info" },
  installing: { label: "Being put up", tone: "info" },
  installed: { label: "Up", tone: "good" },
  rejected: { label: "Not approved", tone: "danger" },
};

export function DealerOffersPage() {
  return (
    <DealerShell page="offers">
      <Offers />
    </DealerShell>
  );
}

function Offers() {
  const s = useDealer();
  const d = s.c;
  const schemes = useStore(schemesStore);
  const campaigns = useStore(campaignsStore);
  const branding = useStore(brandingStore);
  const posm = useStore(posmStore);
  const events = useStore(eventsStore);
  const news = useStore(announcementsStore);
  const rsvpAll = useStore(rsvpStore);
  const cart = useCart(d.id);
  const [ask, setAsk] = React.useState(false);

  const rsvp = rsvpAll[d.id] ?? {};
  const live = liveFor(schemes, d);
  const soon = soonFor(schemes, d);
  const cartEv = React.useMemo(() => evaluate(d.id, cart, schemes, { firstOrder: isFirstOrder(d.id) }), [d.id, cart, schemes]);
  const mine = new Set([...live, ...soon].map((x) => x.id));
  // An empty audience list means everyone: every type.
  const myCampaigns = campaigns.filter((c) => (c.status === "live" || c.status === "planned") && c.to >= SF_TODAY && (c.schemeIds.some((id) => mine.has(id)) || c.audience.typeIds.length === 0 || c.audience.typeIds.includes(d.typeId)));
  const myCampaignIds = new Set(myCampaigns.map((c) => c.id));
  const myBranding = branding.filter((b) => b.customerId === d.id).sort((a, b) => b.requestedOn.localeCompare(a.requestedOn));
  const upcoming = events.filter((e) => e.date >= SF_TODAY && e.status !== "done" && e.kind !== "Sampling" && (!e.campaignId || myCampaignIds.has(e.campaignId))).sort((a, b) => a.date.localeCompare(b.date));
  const latestNews = [...news].sort((a, b) => b.date.localeCompare(a.date));
  const canBrand = s.settings.can.branding;

  const toggle = (id: string) => {
    const going = !rsvp[id];
    rsvpStore.set((r) => ({ ...r, [d.id]: { ...(r[d.id] ?? {}), [id]: going } }));
    eventsStore.set((es) => es.map((e) => (e.id === id ? { ...e, confirmed: Math.max(0, e.confirmed + (going ? 1 : -1)) } : e)));
    logEvent(id, going ? `${d.name} is coming` : `${d.name} is no longer coming`, s.userName);
    notify(going ? "You're on the list" : "You're off the list", "info");
  };

  return (
    <>
      <PageHead title="Offers for you" sub={`What ${s.company} gives you right now as a ${s.type.name.toLowerCase()}${d.city ? ` in ${d.city}` : ""}.`} />

      <Section title="Live now" count={live.length}>
        {live.length === 0 ? (
          <p className="m-0 text-[12.5px] text-bz-text-muted">No offers for you today. When {s.company} starts one, it shows here and applies in your cart by itself.</p>
        ) : (
          <ul className="m-0 grid list-none gap-x-12 gap-y-8 p-0 md:grid-cols-2">
            {live.map((x) => (
              <OfferItem key={x.id} s={x} got={cartEv.applied.find((a) => a.schemeId === x.id)?.text} hint={cartEv.hints.find((h) => h.schemeId === x.id)} />
            ))}
          </ul>
        )}
      </Section>

      {soon.length > 0 && (
        <Section title="Starting soon" count={soon.length} className="mt-14">
          <ul className="m-0 grid list-none gap-x-12 gap-y-8 p-0 md:grid-cols-2">
            {soon.map((x) => (
              <OfferItem key={x.id} s={x} soon />
            ))}
          </ul>
        </Section>
      )}

      {myCampaigns.length > 0 && (
        <Section title="Campaigns you are part of" count={myCampaigns.length} className="mt-14">
          <ul className="m-0 list-none divide-y divide-bz-line-soft border-y border-bz-line-soft p-0">
            {myCampaigns.map((c) => {
              const forMe = c.schemeIds.filter((id) => mine.has(id)).map((id) => schemes.find((x) => x.id === id)?.name).filter(Boolean);
              return (
                <li key={c.id} className="flex gap-3 px-1 py-4">
                  <Megaphone size={15} className="mt-0.5 shrink-0 text-bz-text-soft" />
                  <div className="min-w-0 flex-1">
                    <p className="m-0 text-[12.5px] font-medium text-bz-text">{c.name}</p>
                    {c.objective && <p className="m-0 mt-0.5 text-[11.5px] leading-relaxed text-bz-text-muted">{c.objective}</p>}
                    <p className="m-0 mt-1.5 text-[11px] text-bz-text-soft">
                      {day(c.from)} – {day(c.to)}
                      {forMe.length > 0 && ` · for you: ${forMe.join(", ")}`}
                    </p>
                  </div>
                  <Dot tone={c.status === "live" && c.from <= SF_TODAY ? "good" : "neutral"}>{c.status === "live" && c.from <= SF_TODAY ? "On now" : `Starts ${day(c.from)}`}</Dot>
                </li>
              );
            })}
          </ul>
        </Section>
      )}

      <div className="mt-14 grid gap-14 lg:grid-cols-2">
        {canBrand && (
          <Section
            title="Branding for your shop"
            count={myBranding.length}
            action={
              posm.length > 0 && (
                <button type="button" onClick={() => setAsk(true)} className={cn(SOFT, "h-9")}>
                  Request branding
                </button>
              )
            }
          >
            {myBranding.length === 0 ? (
              <EmptyNote>{posm.length ? "Ask for a sign board, standee or cooler and track it here." : `${cap(s.company)} has no branding items to offer yet.`}</EmptyNote>
            ) : (
              <ul className="m-0 list-none divide-y divide-bz-line-soft border-y border-bz-line-soft p-0">
                {myBranding.map((b) => {
                  const item = posm.find((p) => p.id === b.posmId);
                  return (
                    <li key={b.id} className="flex min-h-[56px] items-center gap-3 px-1 py-2.5">
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[12.5px] font-medium text-bz-text">
                          {item?.name ?? "Branding item"}
                          {b.qty > 1 && ` × ${b.qty}`}
                        </span>
                        <span className="block truncate text-[11px] text-bz-text-soft">
                          {b.id} · asked {day(b.requestedOn)} by {b.requestedBy.replace(" (portal)", "")}
                          {b.note && ` · ${b.note}`}
                        </span>
                      </span>
                      <Dot tone={STAGE[b.stage].tone}>{STAGE[b.stage].label}</Dot>
                    </li>
                  );
                })}
              </ul>
            )}
          </Section>
        )}

        <Section title="Events" count={upcoming.length}>
          {upcoming.length === 0 ? (
            <EmptyNote>Meets and launches you are invited to show here.</EmptyNote>
          ) : (
            <ul className="m-0 list-none divide-y divide-bz-line-soft border-y border-bz-line-soft p-0">
              {upcoming.map((e) => {
                const going = !!rsvp[e.id];
                const inDays = daysUntil(e.date);
                return (
                  <li key={e.id} className="flex min-h-[64px] items-center gap-3 px-1 py-3">
                    <CalendarDays size={15} className="shrink-0 text-bz-text-soft" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[12.5px] font-medium text-bz-text">{e.name}</span>
                      <span className={cn("block truncate text-[11px] text-bz-text-soft", NUM)}>
                        {day(e.date)}
                        {inDays === 0 ? " · today" : inDays <= 14 ? ` · in ${inDays} ${inDays === 1 ? "day" : "days"}` : ""}
                        {e.place && ` · ${e.place}`}
                      </span>
                    </span>
                    <button type="button" aria-pressed={going} onClick={() => toggle(e.id)} className={cn(SOFT, "h-9 w-[100px] shrink-0 px-2.5", going && "border-bz-text")}>
                      {going ? (
                        <>
                          <Check size={13} /> Going
                        </>
                      ) : (
                        "I'll come"
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </Section>
      </div>

      <Section title={`News from ${s.company}`} count={latestNews.length} className="mt-14">
        {latestNews.length === 0 ? (
          <p className="m-0 text-[12.5px] text-bz-text-muted">No announcements yet.</p>
        ) : (
          <ul className="m-0 flex list-none flex-col gap-5 p-0">
            {latestNews.map((a) => (
              <li key={a.id} className="flex gap-3">
                <Megaphone size={15} className="mt-0.5 shrink-0 text-bz-text-soft" />
                <div className="min-w-0">
                  <p className="m-0 text-[12.5px] font-medium text-bz-text">{a.title}</p>
                  <p className="m-0 mt-0.5 text-[11.5px] leading-relaxed text-bz-text-muted">{a.body}</p>
                  <p className="m-0 mt-1 text-[10.5px] text-bz-text-soft">{day(a.date)}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Section>

      {canBrand && <BrandingDialog open={ask} onClose={() => setAsk(false)} />}
    </>
  );
}

function OfferItem({ s: x, got, hint, soon }: { s: Scheme; got?: string; hint?: { text: string; progress: number }; soon?: boolean }) {
  const s = useDealer();
  const ledger = useStore(ledgerStore);
  const m = x.mechanic;
  const bought = m.kind === "target-rebate" ? billedBetween(ledger, s.c.id, x.from, x.to) : null;
  const items = schemeItemIds(x).length;
  return (
    <li className="flex gap-3">
      <Gift size={15} className="mt-0.5 shrink-0 text-bz-text-soft" />
      <div className="min-w-0 flex-1">
        <p className="m-0 text-[10px] font-semibold uppercase tracking-[0.14em] text-bz-text-soft">{soon ? `From ${day(x.from)}` : WHEN[x.applies]}</p>
        <p className="m-0 mt-1 text-[12.5px] font-medium text-bz-text">{x.name}</p>
        <p className="m-0 mt-0.5 text-[12px] leading-relaxed text-bz-text-muted">{schemeSentence(x)}</p>
        <p className="m-0 mt-1 text-[11px] text-bz-text-soft">
          Until {day(x.to)}
          {items > 0 && !soon && " · it applies by itself in your cart"}
        </p>
        {got && <p className="m-0 mt-2 text-[11px] font-medium text-bz-pos-deep">In your cart now: {got}</p>}
        {!got && hint && (
          <div className="mt-2 max-w-[320px]">
            <Progress pct={hint.progress * 100} tone="warn" />
            <p className="m-0 mt-1 text-[11px] text-bz-text-soft">In your cart: {hint.text.charAt(0).toLowerCase() + hint.text.slice(1)}</p>
          </div>
        )}
        {bought !== null && m.kind === "target-rebate" && m.target > 0 && (
          <div className="mt-2 max-w-[320px]">
            <Progress pct={(bought / m.target) * 100} tone="warn" />
            <p className={cn("m-0 mt-1 text-[11px] text-bz-text-soft", NUM)}>
              NPR {npr(bought)} billed so far · NPR {npr(Math.max(0, m.target - bought))} to go
            </p>
          </div>
        )}
      </div>
    </li>
  );
}

function BrandingDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const s = useDealer();
  const posm = useStore(posmStore);
  const [posmId, setPosmId] = React.useState<string | null>(null);
  const [qty, setQty] = React.useState(1);
  const [note, setNote] = React.useState("");
  const [photos, setPhotos] = React.useState(0);
  React.useEffect(() => {
    if (!open) return;
    setPosmId(posmStore.get()[0]?.id ?? null);
    setQty(1);
    setNote("");
    setPhotos(0);
  }, [open]);

  const send = () => {
    if (!posmId) return;
    const id = nextId("BR-", brandingStore.get().map((b) => b.id), 3);
    brandingStore.set((bs) => [
      { id, customerId: s.c.id, posmId, qty: Math.max(1, qty), stage: "requested", requestedBy: `${s.userName} (portal)`, requestedOn: SF_TODAY, campaignId: null, proof: false, note: [note.trim(), photos ? `${photos} photo${photos === 1 ? "" : "s"} of the spot.` : ""].filter(Boolean).join(" "), installedOn: null },
      ...bs,
    ]);
    logEvent(id, "asked for it in the dealer portal", s.userName);
    notify(`Request ${id} sent to ${s.company}`);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      eyebrow="Branding"
      title="What would you like put up?"
      foot={
        <>
          <button type="button" onClick={onClose} className={SOFT}>
            Cancel
          </button>
          <button type="button" disabled={!posmId} onClick={send} className={LIME}>
            Send request
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-1.5" role="radiogroup" aria-label="Branding item">
        {posm.map((p) => {
          const on = p.id === posmId;
          return (
            <button key={p.id} type="button" role="radio" aria-checked={on} onClick={() => setPosmId(p.id)} className={cn("flex h-10 items-center gap-2 rounded-bz-md border px-3 text-left text-[12.5px] transition-colors", on ? "border-bz-text bg-bz-fire/10 font-semibold text-bz-text" : "border-bz-line-soft text-bz-text-muted hover:bg-bz-paper-warm")}>
              <span className="flex-1">{p.name}</span>
              {on && <Check size={13} />}
            </button>
          );
        })}
      </div>
      <div className="mt-4 flex flex-col gap-4">
        <Field label="How many">
          <QtyStepper value={qty} onChange={(v) => setQty(Math.max(1, v))} />
        </Field>
        <Field label="Where should it go">
          <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Front of the shop, above the counter…" className={cn(TEXTAREA, "min-h-[64px] bg-bz-surface")} />
        </Field>
        <Field label="Photo of the spot">
          <PhotoSlot count={photos} onAdd={() => setPhotos((n) => Math.min(3, n + 1))} onClear={() => setPhotos(0)} />
        </Field>
      </div>
    </Dialog>
  );
}
