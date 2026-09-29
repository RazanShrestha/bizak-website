import * as React from "react";
import { CalendarDays, Check, Gift, Megaphone } from "lucide-react";
import { cn } from "../ui/utils";
import { Dialog, Field, NUM, TEXTAREA } from "../sales/bzw";
import { useStore } from "../sales/store";
import { DEALER_ID, POSM, SF_TODAY, TERRITORIES } from "../salesforce/data";
import type { BrandingStage, Scheme } from "../salesforce/data";
import { day, daysUntil, evaluate, typeOf } from "../salesforce/engine";
import { brandingStore, campaignsStore, cartStore, eventsStore, schemesStore } from "../salesforce/store";
import { Dot, EmptyNote, Progress, Section } from "../salesforce/ui";
import { DealerShell } from "./shell";
import { LIME, PageHead, PhotoSlot, QtyStepper, SOFT } from "./kit";
import { COMPANY, dealer, liveForMe, nextNo, notify, portalUserName, purchasedBetween, rsvpStore, schemeItemIds, schemeSentence, soonForMe } from "./portal";

// ════════════════════════════════════════════════════════════════════════════
// OFFERS — what the dealer gets from the company right now
//
// Every offer is one plain sentence (portal.schemeSentence), never a rule
// table. Below: the campaigns it is part of, the branding it asked for, and
// the events it is invited to.
// ════════════════════════════════════════════════════════════════════════════

const WHEN: Record<Scheme["applies"], string> = { order: "On your orders", period: "On the quarter", claim: "Claim it", payment: "When you pay" };
const STAGE: Record<BrandingStage, { label: string; tone: "good" | "warn" | "danger" | "neutral" | "info" }> = {
  requested: { label: "Asked for", tone: "warn" },
  approved: { label: "Approved", tone: "info" },
  installing: { label: "Being put up", tone: "info" },
  installed: { label: "Up", tone: "good" },
  rejected: { label: "Not approved", tone: "danger" },
};

function ancestors(territoryId: string) {
  const out: string[] = [];
  let t = TERRITORIES.find((x) => x.id === territoryId);
  while (t) {
    out.push(t.id);
    t = TERRITORIES.find((x) => x.id === t!.parentId);
  }
  return out;
}

export function DealerOffersPage() {
  const schemes = useStore(schemesStore);
  const campaigns = useStore(campaignsStore);
  const branding = useStore(brandingStore);
  const events = useStore(eventsStore);
  const rsvp = useStore(rsvpStore);
  const cart = useStore(cartStore);
  const [ask, setAsk] = React.useState(false);

  const d = dealer();
  const live = liveForMe(schemes);
  const soon = soonForMe(schemes);
  const cartEv = React.useMemo(() => evaluate(DEALER_ID, cart, schemes), [cart, schemes]);
  const mine = new Set([...live, ...soon].map((s) => s.id));
  const where = ancestors(d.territoryId);
  const myCampaigns = campaigns.filter(
    (c) => (c.status === "live" || c.status === "planned") && c.audience.typeIds.includes(d.typeId) && (c.schemeIds.some((id) => mine.has(id)) || c.audience.territoryIds.length === 0 || c.audience.territoryIds.some((t) => where.includes(t))),
  );
  const myBranding = branding.filter((b) => b.customerId === DEALER_ID).sort((a, b) => b.requestedOn.localeCompare(a.requestedOn));
  const upcoming = events.filter((e) => e.date >= SF_TODAY && e.kind !== "Sampling").sort((a, b) => a.date.localeCompare(b.date));

  const toggle = (id: string) => {
    const going = !rsvp[id];
    rsvpStore.set((r) => ({ ...r, [id]: going }));
    eventsStore.set((es) => es.map((e) => (e.id === id ? { ...e, confirmed: Math.max(0, e.confirmed + (going ? 1 : -1)) } : e)));
    notify(going ? "You're on the list" : "We've taken you off the list", "info");
  };

  return (
    <DealerShell page="offers">
      <PageHead title="Offers for you" sub={`What ${COMPANY} gives you right now as a ${typeOf(d).name.toLowerCase()} in ${d.city}.`} />

      <Section title="Live now" count={live.length}>
        <ul className="m-0 grid list-none gap-x-12 gap-y-8 p-0 md:grid-cols-2">
          {live.map((s) => (
            <OfferItem key={s.id} s={s} got={cartEv.applied.find((a) => a.schemeId === s.id)?.text} hint={cartEv.hints.find((h) => h.schemeId === s.id)} />
          ))}
        </ul>
      </Section>

      {soon.length > 0 && (
        <Section title="Starting soon" count={soon.length} className="mt-14">
          <ul className="m-0 grid list-none gap-x-12 gap-y-8 p-0 md:grid-cols-2">
            {soon.map((s) => (
              <OfferItem key={s.id} s={s} soon />
            ))}
          </ul>
        </Section>
      )}

      {myCampaigns.length > 0 && (
        <Section title="Campaigns you are part of" count={myCampaigns.length} className="mt-14">
          <ul className="m-0 list-none divide-y divide-bz-line-soft border-y border-bz-line-soft p-0">
            {myCampaigns.map((c) => (
              <li key={c.id} className="flex gap-3 px-1 py-4">
                <Megaphone size={15} className="mt-0.5 shrink-0 text-bz-text-soft" />
                <div className="min-w-0 flex-1">
                  <p className="m-0 text-[12.5px] font-medium text-bz-text">{c.name}</p>
                  <p className="m-0 mt-0.5 text-[11.5px] leading-relaxed text-bz-text-muted">{c.objective}</p>
                  <p className="m-0 mt-1.5 text-[11px] text-bz-text-soft">
                    {day(c.from)} – {day(c.to)}
                    {c.schemeIds.filter((id) => mine.has(id)).length > 0 && ` · for you: ${c.schemeIds.filter((id) => mine.has(id)).map((id) => schemes.find((s) => s.id === id)?.name).join(", ")}`}
                  </p>
                </div>
                <Dot tone={c.status === "live" ? "good" : "neutral"}>{c.status === "live" ? "On now" : `Starts ${day(c.from)}`}</Dot>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <div className="mt-14 grid gap-14 lg:grid-cols-2">
        <Section
          title="Branding for your shop"
          count={myBranding.length}
          action={
            <button type="button" onClick={() => setAsk(true)} className={cn(SOFT, "h-9")}>
              Ask for branding
            </button>
          }
        >
          {myBranding.length === 0 ? (
            <EmptyNote>No sign boards or standees asked for yet.</EmptyNote>
          ) : (
            <ul className="m-0 list-none divide-y divide-bz-line-soft border-y border-bz-line-soft p-0">
              {myBranding.map((b) => {
                const item = POSM.find((p) => p.id === b.posmId);
                return (
                  <li key={b.id} className="flex min-h-[56px] items-center gap-3 px-1 py-2.5">
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[12.5px] font-medium text-bz-text">
                        {item?.name ?? b.posmId}
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

        <Section title="Events" count={upcoming.length}>
          {upcoming.length === 0 ? (
            <EmptyNote>No events coming up.</EmptyNote>
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
                        {inDays <= 14 && ` · in ${inDays} days`} · {e.place}
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

      <BrandingDialog open={ask} onClose={() => setAsk(false)} />
    </DealerShell>
  );
}

function OfferItem({ s, got, hint, soon }: { s: Scheme; got?: string; hint?: { text: string; progress: number }; soon?: boolean }) {
  const m = s.mechanic;
  const rebate = m.kind === "target-rebate" ? purchasedBetween(s.from, s.to) : null;
  const items = schemeItemIds(s).length;
  return (
    <li className="flex gap-3">
      <Gift size={15} className="mt-0.5 shrink-0 text-bz-text-soft" />
      <div className="min-w-0 flex-1">
        <p className="m-0 text-[10px] font-semibold uppercase tracking-[0.14em] text-bz-text-soft">{soon ? `From ${day(s.from)}` : WHEN[s.applies]}</p>
        <p className="m-0 mt-1 text-[12.5px] font-medium text-bz-text">{s.name}</p>
        <p className="m-0 mt-0.5 text-[12px] leading-relaxed text-bz-text-muted">{schemeSentence(s)}</p>
        <p className="m-0 mt-1 text-[11px] text-bz-text-soft">
          Until {day(s.to)}
          {items > 0 && !soon && " · it applies by itself in your cart"}
        </p>
        {got && <p className="m-0 mt-2 text-[11px] font-medium text-bz-pos-deep">In your cart now: {got}</p>}
        {!got && hint && (
          <div className="mt-2 max-w-[320px]">
            <Progress pct={hint.progress * 100} tone="warn" />
            <p className="m-0 mt-1 text-[11px] text-bz-text-soft">In your cart: {hint.text.charAt(0).toLowerCase() + hint.text.slice(1)}</p>
          </div>
        )}
        {rebate !== null && m.kind === "target-rebate" && (
          <div className="mt-2 max-w-[320px]">
            <Progress pct={(rebate / m.target) * 100} tone="warn" />
            <p className={cn("m-0 mt-1 text-[11px] text-bz-text-soft", NUM)}>
              NPR {rebate.toLocaleString("en-US")} bought so far · NPR {Math.max(0, m.target - rebate).toLocaleString("en-US")} to go
            </p>
          </div>
        )}
      </div>
    </li>
  );
}

function BrandingDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [posmId, setPosmId] = React.useState(POSM[0].id);
  const [qty, setQty] = React.useState(1);
  const [note, setNote] = React.useState("");
  const [photos, setPhotos] = React.useState(0);
  React.useEffect(() => {
    if (!open) return;
    setPosmId(POSM[0].id);
    setQty(1);
    setNote("");
    setPhotos(0);
  }, [open]);

  const send = () => {
    const id = nextNo(brandingStore.get().map((b) => b.id), "BR-");
    brandingStore.set((bs) => [{ id, customerId: DEALER_ID, posmId, qty: Math.max(1, qty), stage: "requested", requestedBy: `${portalUserName()} (portal)`, requestedOn: SF_TODAY, campaignId: null, proof: false, note: [note.trim(), photos ? `${photos} photo${photos === 1 ? "" : "s"} of the spot.` : ""].filter(Boolean).join(" "), installedOn: null }, ...bs]);
    notify(`Request ${id} sent to ${COMPANY}`);
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
          <button type="button" onClick={send} className={LIME}>
            Send request
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-1.5" role="radiogroup" aria-label="Branding item">
        {POSM.map((p) => {
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
          <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Front of the warehouse, above the counter…" className={cn(TEXTAREA, "min-h-[64px] bg-bz-surface")} />
        </Field>
        <Field label="Photo of the spot">
          <PhotoSlot count={photos} onAdd={() => setPhotos((n) => Math.min(3, n + 1))} onClear={() => setPhotos(0)} />
        </Field>
      </div>
    </Dialog>
  );
}
