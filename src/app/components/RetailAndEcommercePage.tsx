import {
  Monitor,
  RefreshCw,
  ShoppingCart,
  Tag,
  Truck,
  Users,
} from "lucide-react";
import {
  BadgeGreen,
  Bento,
  BentoGrid,
  BigCard,
  Container,
  DataRow,
  DotGrid,
  Heading,
  HeroCanvas,
  JournalRow,
  Pill,
  PillGroup,
  Section,
  SectionHead,
  StatusChip,
  StepCard,
  StripeBar,
  Tick,
} from "./bz";

// ════════════════════════════════════════════════════════════════════════════
// DATA
// ════════════════════════════════════════════════════════════════════════════

const CHANNEL_MIX = [
  { name: "Web Store",    pct: 54, gmv: "$26.1k" },
  { name: "Mobile App",   pct: 31, gmv: "$15.0k" },
  { name: "Marketplace",  pct: 12, gmv: "$5.8k"  },
  { name: "In-store POS", pct: 3,  gmv: "$1.4k"  },
];

const FUNNEL_STAGES = [
  { label: "Visitors",    count: "12,400", pct: 100 },
  { label: "Add to Cart", count: "4,712",  pct: 38  },
  { label: "Checkout",    count: "2,344",  pct: 19  },
  { label: "Purchased",   count: "1,397",  pct: 11  },
];

const ACTIVE_CHANNELS = [
  { id: "WEB", badge: "W", name: "Web Store",  status: "Active", pct: 54 },
  { id: "MOB", badge: "M", name: "Mobile App", status: "Active", pct: 31 },
];

const CHANNEL_EVENTS = [
  { id: "ORD-9841", what: "Web Store · Leather Bag",  flow: "Inventory reserved · 48 → 47", t: "1m" },
  { id: "ORD-9842", what: "Mobile App · Canvas Tote", flow: "Picked · 09:44:18",             t: "3m" },
];

const CAPABILITIES = [
  {
    icon: ShoppingCart,
    title: "Omnichannel Order Management",
    desc: "Capture and route orders from web, mobile app, marketplace, and POS into one unified queue with full status visibility end-to-end.",
  },
  {
    icon: RefreshCw,
    title: "Real-Time Inventory Sync",
    desc: "One inventory pool across every channel. Live reservation, automatic reorder triggers, and zero oversell from a single source of truth.",
  },
  {
    icon: Monitor,
    title: "POS Billing",
    desc: "Touch-screen billing for retail chains and standalone stores. Barcode scan, multi-payment, loyalty redemption, and end-of-day reconciliation in one terminal.",
  },
  {
    icon: Tag,
    title: "Product Catalog & Pricing",
    desc: "Manage SKUs, variants, pricing rules, and promotions centrally. Publish to all channels instantly one change, zero divergence.",
  },
  {
    icon: Users,
    title: "Customer & Loyalty CRM",
    desc: "Unified customer profiles with full purchase history, CLV scoring, loyalty tier, and segmentation enabling personalised campaigns and retention flows.",
  },
  {
    icon: Truck,
    title: "Smart Fulfilment Routing",
    desc: "Auto-assign each order to the closest stocked location with optimal carrier selection balancing speed, cost, and SLA compliance automatically.",
  },
];

const COMPLETED_SALES = [
  { ref: "ORD-9841", desc: "Leather Bag · 1 EA", status: "Auto-posted" },
  { ref: "ORD-9842", desc: "Canvas Tote · 2 EA", status: "Auto-posted" },
];

const ENTRY_SPLIT = ["Revenue", "COGS", "Inventory"];

// ════════════════════════════════════════════════════════════════════════════
// HERO MOCK
// ════════════════════════════════════════════════════════════════════════════

function RetailCommandPanel() {
  return (
    <div className="flex flex-1 flex-col overflow-hidden rounded-bz-2xl border border-white/[0.08] bg-bz-paper">
      <div className="flex items-center justify-between border-b border-bz-line-soft px-5 py-3.5">
        <StatusChip variant="live">Live · 1,847 orders</StatusChip>
        <div className="flex items-center gap-1.5">
          <span className="text-[15px] font-bold tabular-nums text-bz-text">$48.3k</span>
          <span className="text-[10px] font-semibold text-bz-leaf-deep">↑ +18.4%</span>
        </div>
      </div>

      <div className="grid grid-cols-1 divide-y divide-bz-line-soft sm:grid-cols-2 sm:divide-x sm:divide-y-0">
        <div className="p-5">
          <p className="mb-3.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-bz-text-soft">
            Channel Mix
          </p>
          <div className="flex flex-col gap-4">
            {CHANNEL_MIX.map((ch) => (
              <div key={ch.name}>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-[10.5px] font-medium text-bz-text">{ch.name}</span>
                  <span className="text-[10px] text-bz-text-muted">{ch.gmv}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <StripeBar pct={ch.pct} />
                  </div>
                  <span className="w-8 text-right text-[10.5px] font-semibold tabular-nums text-bz-text">
                    {ch.pct}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-5">
          <p className="mb-3.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-bz-text-soft">
            Conversion Funnel
          </p>
          <div className="flex flex-col gap-4">
            {FUNNEL_STAGES.map((s) => (
              <div key={s.label}>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-[10.5px] text-bz-text-muted">{s.label}</span>
                  <span className="text-[10.5px] font-semibold tabular-nums text-bz-text">{s.count}</span>
                </div>
                <StripeBar pct={s.pct} />
              </div>
            ))}
            <div className="mt-0.5 flex items-center justify-between border-t border-bz-line-soft pt-3">
              <span className="text-[10.5px] text-bz-text-muted">Conversion Rate</span>
              <span className="text-[11px] font-bold tabular-nums text-bz-text">11.2%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// HERO
// ════════════════════════════════════════════════════════════════════════════

function HeroSection() {
  return (
    <Section tone="b" pad="hero">
      <Container>
        <div className="flex flex-col items-center text-center">
          <BadgeGreen style={{ marginBottom: 28 }}>
            Sell Stock Settle
          </BadgeGreen>
          <Heading level={2} style={{ marginBottom: 36 }}>
            Sell everywhere. Fulfil flawlessly and{" "}{<br className="hidden md:block"/>}
            <Heading.Muted>
              know your margin today.
            </Heading.Muted>
          </Heading>
          <PillGroup>
            <Pill variant="dark" withArrowUpRight href="https://system.bizakerp.com/account/self-register">
              Get Started
            </Pill>
            <Pill variant="light" href="/contact">
              Request Demo
            </Pill>
          </PillGroup>
        </div>

        <HeroCanvas className="flex flex-col !p-0 [&>.bz-hero-cards]:flex-1 [&>.bz-hero-cards]:flex [&>.bz-hero-cards]:flex-col [&>.bz-hero-cards]:items-stretch">
          <div className="flex flex-1 flex-col p-[56px] max-[720px]:p-9 max-[480px]:p-4">
            <RetailCommandPanel />
          </div>
        </HeroCanvas>
      </Container>
    </Section>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// [01] THE PLATFORM channel map + event feed + feature bentos
// ════════════════════════════════════════════════════════════════════════════

function CapabilitiesSection() {
  return (
    <Section tone="a">
      <Container>
        <SectionHead
          index="01"
          label="The platform"
          title={<>Six modules. <Heading.Muted>One retail operating system.</Heading.Muted></>}
          titleMaxWidth={620}
          actions={
            <PillGroup>
              <Pill variant="dark" withArrowUpRight href="https://system.bizakerp.com/account/self-register">Get Started</Pill>
              <Pill variant="light" href="/contact">Request Demo</Pill>
            </PillGroup>
          }
        />

        <RetailChannelMap />

        <BentoGrid cols={3} className="mt-[18px]">
          {CAPABILITIES.map(({ icon: Icon, title, desc }) => (
            <Bento key={title} tone="paper" hover minHeight={200}>
              <Bento.Header title={title} icon={<Icon size={22} strokeWidth={1.4} color="#1F3422" />} />
              <Bento.Desc>{desc}</Bento.Desc>
            </Bento>
          ))}
        </BentoGrid>
      </Container>
    </Section>
  );
}

function RetailChannelMap() {
  return (
    <div className="grid grid-cols-1 gap-[18px] lg:grid-cols-[1.4fr_1fr]">
      {/* Channel status dark olive panel */}
      <div className="relative flex flex-col overflow-hidden rounded-bz-2xl bg-bz-olive p-7">
        <DotGrid tone="dark" />
        <div className="relative flex flex-col flex-1">
          <div className="mb-5 flex items-start justify-between gap-3">
            <div className="text-[10.5px] font-medium uppercase tracking-[0.18em] text-white/[0.55]">
              Live channels · all active
            </div>
            <StatusChip variant="live">Live</StatusChip>
          </div>

          <div className="mt-auto grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {ACTIVE_CHANNELS.map((ch) => (
              <div
                key={ch.id}
                className="rounded-bz-xl border border-white/[0.06] bg-white/[0.04] p-3.5"
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-bz-pill bg-bz-leaf text-[10.5px] font-semibold text-[#1F3422]">
                      {ch.badge}
                    </span>
                    <span className="text-[11.5px] font-medium text-bz-text-on-dark">
                      {ch.id} · {ch.name}
                    </span>
                  </div>
                  <span className="text-[10.5px] text-white/[0.72]">{ch.status}</span>
                </div>
                <StripeBar pct={ch.pct} tone="dark" />
                <div className="mt-1.5 text-[10px] text-white/[0.55]">
                  GMV share {ch.pct}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Order event feed light panel */}
      <div className="rounded-bz-2xl border border-bz-line-soft bg-bz-paper p-6">
        <div className="mb-4 flex items-start justify-between gap-3 pb-24">
          <div>
            <div className="text-[11px] text-bz-text-muted">Order event feed</div>
            <div className="bz-stat-num" style={{ fontSize: 20 }}>last 60 seconds</div>
          </div>
          <div className="flex items-center gap-1.5 rounded-bz-pill bg-[#F4F5EF] px-2.5 py-1">
            <span className="h-1.5 w-1.5 rounded-bz-pill bg-bz-leaf-deep" />
            <span className="text-[10.5px] font-medium text-bz-text">Streaming</span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {CHANNEL_EVENTS.map((e) => (
            <div key={e.id} className="rounded-bz-lg bg-bz-paper-warm px-3 py-2.5">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[11.5px] font-medium text-bz-text">{e.id}</span>
                <span className="text-[10.5px] text-bz-text-muted">{e.t}</span>
              </div>
              <div className="mt-0.5 flex flex-wrap items-center justify-between gap-x-3 gap-y-0.5">
                <span className="text-[11px] text-bz-text-muted">{e.what}</span>
                <span className="text-[10.5px] text-bz-text">{e.flow}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// STEP VISUALS
// ════════════════════════════════════════════════════════════════════════════

function ChannelSyncVisual() {
  return (
    <div className="w-full max-w-[380px] rounded-bz-xl border border-bz-line-soft bg-bz-paper p-4 shadow-[0_10px_28px_rgba(15,20,17,0.06)]">
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="text-[11px] text-bz-text-muted">Inventory · SKU-2201 · Leather Bag</span>
        <span className="rounded-bz-pill bg-bz-paper-warm px-2 py-0.5 text-[10px] font-semibold text-bz-text">
          48 units
        </span>
      </div>
      <div className="mb-2 rounded-bz-md bg-bz-paper-warm px-3 py-2.5">
        <div className="text-[11.5px] font-medium text-bz-text">Shared Pool · 48 units</div>
      </div>
      <div className="mb-3 ml-3 flex flex-col gap-1.5 border-l border-bz-line-soft pl-3">
        {[
          { ch: "Web Store",    qty: "21 reserved" },
          { ch: "Mobile App",   qty: "15 reserved" },
          { ch: "Marketplace",  qty: "6 reserved"  },
          { ch: "In-store POS", qty: "2 reserved"  },
        ].map((c) => (
          <div
            key={c.ch}
            className="flex items-center justify-between gap-2 rounded-bz-md bg-bz-paper-warm px-3 py-2"
          >
            <span className="text-[11px] font-medium text-bz-text">{c.ch}</span>
            <span className="text-[10.5px] text-bz-text-muted">{c.qty}</span>
          </div>
        ))}
      </div>
      <DataRow label="Oversell incidents" value="0" emphasis />
    </div>
  );
}

function OrderFulfillmentVisual() {
  return (
    <div className="w-full max-w-[380px] rounded-bz-xl border border-bz-line-soft bg-bz-paper p-4 shadow-[0_10px_28px_rgba(15,20,17,0.06)]">
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="text-[11px] text-bz-text-muted">ORD-9841 · WH-02 Fulfilment</span>
        <StatusChip variant="live">Live</StatusChip>
      </div>
      <div className="mb-3 rounded-bz-md bg-bz-paper-warm px-3 py-2.5">
        <div className="mb-0.5 text-[11.5px] font-medium text-bz-text">Web Store · Leather Bag × 1</div>
        <div className="text-[10.5px] text-bz-text-muted">09:44:18 · auto-routed</div>
      </div>
      <div className="flex flex-col gap-2">
        {[
          { label: "Placed",  pct: 100 },
          { label: "Picking", pct: 100 },
          { label: "Packed",  pct: 72  },
          { label: "Shipped", pct: 0   },
        ].map((s) => (
          <div key={s.label} className="flex items-center gap-2">
            <span className="w-12 shrink-0 text-[10px] text-bz-text-muted">{s.label}</span>
            <div className="flex-1"><StripeBar pct={s.pct} /></div>
            <span className="w-7 text-right text-[10px] tabular-nums text-bz-text-muted">{s.pct}%</span>
          </div>
        ))}
      </div>
      <div className="mt-3">
        <DataRow label="Route" value="nearest warehouse" />
      </div>
    </div>
  );
}

function MarginAnalyticsVisual() {
  return (
    <div className="w-full max-w-[380px] rounded-bz-xl border border-bz-line-soft bg-bz-paper p-4 shadow-[0_10px_28px_rgba(15,20,17,0.06)]">
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="text-[11px] text-bz-text-muted">SKU margin · today</span>
        <StatusChip variant="posted">Live</StatusChip>
      </div>
      <div className="mb-3 rounded-bz-md bg-bz-paper-warm px-4 py-3 text-center">
        <div className="bz-stat-num" style={{ fontSize: 32 }}>62%</div>
        <div className="text-[10.5px] text-bz-text-muted">Leather Bag · Black gross margin</div>
      </div>
      <div className="grid grid-cols-3 divide-x divide-bz-line-soft overflow-hidden rounded-bz-md border border-bz-line-soft">
        {[
          { label: "Units sold", val: "184"    },
          { label: "Revenue",    val: "$23.7k" },
          { label: "Margin",     val: "62%"    },
        ].map((s) => (
          <div key={s.label} className="py-2 text-center">
            <div className="text-[13px] font-bold tabular-nums text-bz-text">{s.val}</div>
            <div className="text-[9.5px] text-bz-text-muted">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// [02] HOW IT WORKS
// ════════════════════════════════════════════════════════════════════════════

function HowItWorksSection() {
  return (
    <Section tone="b">
      <Container>
        <SectionHead
          index="02"
          label="How it works"
          title={<>From channel sync to customer delight <Heading.Muted>tracked at every step.</Heading.Muted></>}
          titleMaxWidth={680}
        />
        <div className="flex flex-col gap-5">
          <StepCard
            number="01"
            tag="Sync"
            title="Unify every channel into one shared inventory pool."
            bullets={["A single stock count powers every storefront, POS terminal, and marketplace listing oversells become impossible."]}
            visual={<ChannelSyncVisual />}
          />
          <StepCard
            number="02"
            tag="Fulfil"
            title="Auto-route orders to the nearest stocked location."
            bullets={["Bizak selects the optimal warehouse or store by proximity, carrier SLA, and cost, then tracks the order from pick to delivery."]}
            visual={<OrderFulfillmentVisual />}
          />
          <StepCard
            number="03"
            tag="Analyse"
            title="Know your SKU-level margin and conversion rate in real time."
            bullets={["Live GMV, channel attribution, and margin-per-SKU updated the moment a sale completes, not at month-end."]}
            visual={<MarginAnalyticsVisual />}
          />
        </div>
      </Container>
    </Section>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// [03] SALE TO LEDGER
// ════════════════════════════════════════════════════════════════════════════

function SaleLedgerVisual() {
  return (
    <div className="w-full max-w-[380px] rounded-bz-xl bg-bz-paper p-5 text-bz-text">
      <div className="mb-2.5 flex items-center justify-between gap-3">
        <div className="text-[11.5px] text-bz-text-muted">Orders completed · today</div>
        <ShoppingCart size={16} color="#1F3422" />
      </div>
      <div className="bz-stat-num" style={{ fontSize: 28 }}>$982</div>
      <div className="mb-4 pb-6 text-[11px] text-bz-text-muted">Manual journal entries at sale close</div>

      <div className="flex flex-col gap-1.5">
        {COMPLETED_SALES.map((r) => (
          <div
            key={r.ref}
            className="flex items-center justify-between gap-2 rounded-bz-md bg-bz-paper-warm px-3 py-2"
          >
            <div className="flex min-w-0 items-center gap-2">
              <Tick size="sm" />
              <span className="text-[11px] font-medium text-bz-text">{r.ref}</span>
              <span className="truncate text-[10.5px] text-bz-text-muted">{r.desc}</span>
            </div>
            <span className="text-[10.5px] font-medium text-bz-text">{r.status}</span>
          </div>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5 pt-8">
        {ENTRY_SPLIT.map((m) => (
          <span
            key={m}
            className="rounded-bz-pill bg-[#F4F5EF] px-2.5 py-1 text-[10.5px] font-medium text-bz-text"
          >
            {m}
          </span>
        ))}
      </div>
    </div>
  );
}

function SaleToLedgerSection() {
  return (
    <Section tone="a">
      <Container>
        <SectionHead
          index="03"
          label="Sale to ledger"
          title={<>Every sale, <Heading.Muted>posted to the books automatically.</Heading.Muted></>}
          titleMaxWidth={680}
        />
        <BigCard
          text={{
            title: "Every sale auto-posts to inventory and the books.",
            bullets: [
              "Revenue, COGS, and inventory update in a single balanced entry per order.",
            ],
            cta: { variant: "accent", withArrow: true, href: "/contact", children: "Talk to Sales" },
          }}
          visual={<SaleLedgerVisual />}
        />
      </Container>
    </Section>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// [04] SALE, ON ONE LEDGER
// ════════════════════════════════════════════════════════════════════════════

function OneLedgerSection() {
  return (
    <Section tone="dark">
      <Container>
        <SectionHead
          index="04"
          label="One ledger"
          tone="dark"
          title={<>Every sale event, <Heading.Muted>auto-posted to the same ledger that closes the books.</Heading.Muted></>}
          titleMaxWidth={780}
        />

        <BentoGrid cols={3}>
          <Bento tone="dark" hover dotGrid minHeight={260}>
            <Bento.Header
              title={<>Sale recognised →<br />AR posted</>}
              icon={<ShoppingCart size={22} strokeWidth={1.4} color="#DBE9B8" />}
            />
            <Bento.Desc>
              Revenue and accounts receivable post together the moment an order completes zero manual entries.
            </Bento.Desc>
            <Bento.Footer tone="dark" className="flex flex-col gap-1.5">
              <JournalRow tone="dark" txn="ORD-9841 · sale" debit="Accounts Receivable" credit="Sales Revenue" />
            </Bento.Footer>
          </Bento>

          <Bento tone="dark" hover dotGrid minHeight={260}>
            <Bento.Header
              title={<>COGS →<br />inventory decremented</>}
              icon={<RefreshCw size={22} strokeWidth={1.4} color="#DBE9B8" />}
            />
            <Bento.Desc>
              Cost of goods sold and the matching inventory credit post in the same entry margin is live, not month-end.
            </Bento.Desc>
            <Bento.Footer tone="dark" className="flex flex-col gap-1.5">
              <JournalRow tone="dark" txn="ORD-9841 · COGS" debit="Cost of Goods Sold" credit="Inventory" />
            </Bento.Footer>
          </Bento>

          <Bento tone="dark" hover dotGrid minHeight={260}>
            <Bento.Header
              title={<>Return →<br />entry reversed</>}
              icon={<Tag size={22} strokeWidth={1.4} color="#DBE9B8" />}
            />
            <Bento.Desc>
              Returns reverse both the revenue and inventory entries automatically no manual correction needed.
            </Bento.Desc>
            <Bento.Footer tone="dark" className="flex flex-col gap-1.5">
              <JournalRow tone="dark" txn="ORD-9845 · return" debit="Inventory" credit="Accounts Receivable" />
            </Bento.Footer>
          </Bento>
        </BentoGrid>
      </Container>
    </Section>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PAGE
// ════════════════════════════════════════════════════════════════════════════

export function RetailAndEcommercePage() {
  return (
    <main>
      <HeroSection />
      <CapabilitiesSection />
      <HowItWorksSection />
      <SaleToLedgerSection />
      <OneLedgerSection />
    </main>
  );
}
