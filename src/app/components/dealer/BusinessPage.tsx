import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "../ui/utils";
import { NUM } from "../sales/bzw";
import { useStore } from "../sales/store";
import { DEALER_ID, DEALER_SECONDARY, DEALER_STOCK, REPS, SF_TODAY } from "../salesforce/data";
import { compact, day, npr, productById } from "../salesforce/engine";
import { cartStore, customersStore, hubStore } from "../salesforce/store";
import { Figures, Flag, Money, ProductThumb, Section } from "../salesforce/ui";
import { DealerShell } from "./shell";
import { PageHead, SOFT } from "./kit";
import { COMPANY, addDays, addToCart } from "./portal";

// ════════════════════════════════════════════════════════════════════════════
// MY BUSINESS — the distributor's own side (DMS lite)
//
// Its stock and how long it lasts, what it sold to retailers month by month,
// and the retailers it serves. The same figures feed the company's view of
// secondary sales, so the page says so.
// ════════════════════════════════════════════════════════════════════════════

/** Below this many days of stock, an item is flagged and a top-up is offered. */
const LOW_DAYS = 7;
/** A top-up brings an item back to this many days of sales. */
const TOPUP_DAYS = 14;
const MONTH_NAME: Record<string, string> = { Jun: "June", Jul: "July", Aug: "August", Sep: "September" };

export function DealerBusinessPage() {
  const cart = useStore(cartStore);
  const customers = useStore(customersStore);
  const hub = useStore(hubStore);
  const [all, setAll] = React.useState(false);

  const stock = DEALER_STOCK.map((s) => {
    const p = productById(s.productId);
    const cover = s.avgDaily > 0 ? s.onHand / s.avgDaily : Infinity;
    return { ...s, p, cover, low: cover < LOW_DAYS, topUp: Math.max(0, Math.ceil(s.avgDaily * TOPUP_DAYS - s.onHand)) };
  }).sort((a, b) => a.cover - b.cover);
  const low = stock.filter((s) => s.low);
  const retailers = customers.filter((c) => c.parentId === DEALER_ID);
  const maxMonth = Math.max(...DEALER_SECONDARY.map((m) => m.value));
  const thisMonth = DEALER_SECONDARY[DEALER_SECONDARY.length - 1];
  const lastMonth = DEALER_SECONDARY[DEALER_SECONDARY.length - 2];

  // A retailer's last order is the latest one any channel sent in for it; the seed carries few, so the rest
  // fall back to a steady spread over the last three weeks.
  const lastOrderOf = (id: string) => {
    const hit = hub.filter((o) => o.customerId === id).sort((a, b) => b.at.localeCompare(a.at))[0];
    if (hit) return hit.at.slice(0, 10);
    const n = Number(id.replace(/\D/g, "")) || 0;
    return addDays(SF_TODAY, -((n * 7) % 21));
  };
  const shownRetailers = all ? retailers : retailers.slice(0, 8);

  return (
    <DealerShell page="business">
      <PageHead title="My business" sub={`Your stock and your sales to retailers. ${COMPANY} sees these figures too, so it can plan your deliveries and offers.`} />

      <Figures
        items={[
          { label: "Running low", value: low.length, sub: `under ${LOW_DAYS} days of stock`, tone: low.length ? "danger" : undefined },
          { label: `Sold in ${MONTH_NAME[thisMonth.month] ?? thisMonth.month}`, value: <Money value={thisMonth.value} />, sub: "so far, to retailers" },
          { label: `Sold in ${MONTH_NAME[lastMonth.month] ?? lastMonth.month}`, value: <Money value={lastMonth.value} />, sub: `${lastMonth.retailers} retailers bought` },
          { label: "Your retailers", value: retailers.length, sub: "on your list" },
        ]}
      />

      <div className="mt-14 grid gap-14 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Section
          title="My stock"
          count={stock.length}
          hint="lowest first"
          action={
            low.length > 0 && (
              <button type="button" onClick={() => addToCart(low.filter((s) => s.topUp > 0 && !cart.some((c) => c.productId === s.productId)).map((s) => ({ productId: s.productId, qty: s.topUp })))} className="text-[11.5px] font-medium text-bz-text-soft hover:text-bz-text">
                Top up all low items
              </button>
            )
          }
        >
          <ul className="m-0 list-none divide-y divide-bz-line-soft border-y border-bz-line-soft p-0">
            {stock.map((s) => {
              const inCart = cart.find((c) => c.productId === s.productId);
              return (
                <li key={s.productId} className="flex min-h-[64px] items-center gap-3 px-1 py-2.5">
                  <ProductThumb product={s.p} size={36} />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="truncate text-[12.5px] font-medium text-bz-text">{s.p.name}</span>
                      {s.low && <Flag>Low</Flag>}
                    </span>
                    <span className={cn("block text-[11px] text-bz-text-soft", NUM)}>
                      {s.onHand} {s.p.unit}s on hand · you sell about {s.avgDaily} a day
                    </span>
                  </span>
                  <span className={cn("w-[64px] shrink-0 text-right text-[12.5px]", NUM, s.low ? "font-semibold text-bz-red" : "text-bz-text")}>
                    {Number.isFinite(s.cover) ? `${Math.floor(s.cover)} days` : "—"}
                  </span>
                  {inCart ? (
                    <span className="inline-flex h-10 w-[92px] shrink-0 items-center justify-end gap-1 text-[11.5px] text-bz-text-muted">
                      <Check size={13} /> In cart
                    </span>
                  ) : s.topUp > 0 && s.cover < TOPUP_DAYS ? (
                    <button type="button" onClick={() => addToCart([{ productId: s.productId, qty: s.topUp }])} className={cn(SOFT, "h-9 w-[92px] shrink-0 px-2")} title={`Brings you to ${TOPUP_DAYS} days of stock`}>
                      Add {s.topUp}
                    </button>
                  ) : (
                    <span className="w-[92px] shrink-0" />
                  )}
                </li>
              );
            })}
          </ul>
          <p className="m-0 mt-3 text-[11px] text-bz-text-soft">Days of stock = what you have ÷ what you sell a day. “Add” tops you up to {TOPUP_DAYS} days.</p>
        </Section>

        <Section title="Your sales to retailers">
          <ul className="m-0 flex list-none flex-col gap-4 p-0">
            {DEALER_SECONDARY.map((m, i) => (
              <li key={m.month}>
                <div className={cn("mb-1.5 flex items-baseline justify-between text-[12px]", NUM)}>
                  <span className="text-bz-text">
                    {MONTH_NAME[m.month] ?? m.month}
                    {i === DEALER_SECONDARY.length - 1 && <span className="text-bz-text-soft"> · so far</span>}
                  </span>
                  <span className="text-bz-text-muted">
                    NPR {compact(m.value)} · {m.retailers} retailers
                  </span>
                </div>
                <span className="block h-2 w-full overflow-hidden rounded-bz-pill bg-bz-line-soft">
                  <span className={cn("block h-full rounded-bz-pill", i === DEALER_SECONDARY.length - 1 ? "bg-bz-leaf-deep" : "bg-bz-pos-deep")} style={{ width: `${(m.value / maxMonth) * 100}%` }} />
                </span>
              </li>
            ))}
          </ul>
          <p className={cn("m-0 mt-4 text-[11px] text-bz-text-soft", NUM)}>
            August was NPR {npr(lastMonth.value - DEALER_SECONDARY[DEALER_SECONDARY.length - 3].value)} up on July.
          </p>
        </Section>
      </div>

      <Section title="My retailers" count={retailers.length} className="mt-14">
        <div className="hidden grid-cols-[minmax(0,1fr)_160px_110px] gap-4 border-b border-bz-line-soft px-1 pb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-bz-text-soft md:grid">
          <span>Retailer</span>
          <span>Our rep</span>
          <span className="text-right">Last order</span>
        </div>
        <ul className="m-0 list-none divide-y divide-bz-line-soft border-b border-bz-line-soft p-0 max-md:border-t">
          {shownRetailers.map((r) => {
            const rep = REPS.find((x) => x.id === r.repId);
            return (
              <li key={r.id} className="grid min-h-[56px] grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 px-1 py-2.5 md:grid-cols-[minmax(0,1fr)_160px_110px]">
                <span className="min-w-0">
                  <span className="block truncate text-[12.5px] font-medium text-bz-text">{r.name}</span>
                  <span className="block truncate text-[11px] text-bz-text-soft">
                    {r.city} · Tier {r.tier}
                    {r.status !== "active" && ` · ${r.status}`}
                  </span>
                </span>
                <span className="hidden truncate text-[12px] text-bz-text-muted md:block">{rep?.name ?? "—"}</span>
                <span className={cn("text-right text-[12px] text-bz-text-muted", NUM)}>{day(lastOrderOf(r.id))}</span>
              </li>
            );
          })}
        </ul>
        {retailers.length > 8 && (
          <button type="button" onClick={() => setAll(!all)} className={cn(SOFT, "mt-4")}>
            {all ? "Show fewer" : `Show all ${retailers.length}`}
          </button>
        )}
      </Section>
    </DealerShell>
  );
}
