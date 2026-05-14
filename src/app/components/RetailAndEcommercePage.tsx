import {
  CheckCircle2,
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
  Heading,
  HeroCanvas,
  Pill,
  PillGroup,
  Section,
  SectionHead,
  StatTile,
  StatusChip,
  StepCard,
  StripeBar,
} from "./bz";

// ── DATA ─────────────────────────────────────────────────────────────────────

const CHANNEL_MIX = [
  { name: "Web Store",    pct: 54, gmv: "$26.1k", orders: 847  },
  { name: "Mobile App",   pct: 31, gmv: "$15.0k", orders: 573  },
  { name: "Marketplace",  pct: 12, gmv: "$5.8k",  orders: 278  },
  { name: "In-store POS", pct: 3,  gmv: "$1.4k",  orders: 149  },
];

const FUNNEL_STAGES = [
  { label: "Visitors",    count: "12,400", pct: 100 },
  { label: "Add to Cart", count: "4,712",  pct: 38  },
  { label: "Checkout",    count: "2,344",  pct: 19  },
  { label: "Purchased",   count: "1,397",  pct: 11  },
];

const CAPABILITIES = [
  {
    icon: ShoppingCart,
    title: "Omnichannel Order Management",
    desc: "Capture and route orders from web, mobile app, marketplace, and POS into one unified queue — with full status visibility end-to-end.",
  },
  {
    icon: RefreshCw,
    title: "Real-Time Inventory Sync",
    desc: "One inventory pool across every channel. Live reservation, automatic reorder triggers, and zero oversell — from a single source of truth.",
  },
  {
    icon: Monitor,
    title: "POS Billing",
    desc: "Touch-screen billing for retail chains and standalone stores. Barcode scan, multi-payment, loyalty redemption, and end-of-day reconciliation in one terminal.",
  },
  {
    icon: Tag,
    title: "Product Catalog & Pricing",
    desc: "Manage SKUs, variants, pricing rules, and promotions centrally. Publish to all channels instantly — one change, zero divergence.",
  },
  {
    icon: Users,
    title: "Customer & Loyalty CRM",
    desc: "Unified customer profiles with full purchase history, CLV scoring, loyalty tier, and segmentation — enabling personalised campaigns and retention flows.",
  },
  {
    icon: Truck,
    title: "Smart Fulfilment Routing",
    desc: "Auto-assign each order to the closest stocked location with optimal carrier selection — balancing speed, cost, and SLA compliance automatically.",
  },
];

// ── HERO MOCK ─────────────────────────────────────────────────────────────────

function RetailCommandPanel() {
  return (
    <div className="flex flex-1 flex-col overflow-hidden rounded-bz-2xl border border-white/[0.08] bg-bz-paper">
      <div className="flex items-center justify-between border-b border-bz-line-soft px-5 py-3.5">
        <StatusChip variant="live">Live · 1,847 orders</StatusChip>
        <div className="flex items-center gap-1.5">
          {/* <span className="text-[11px] text-bz-text-muted">GMV</span> */}
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

// ── HERO ──────────────────────────────────────────────────────────────────────

function HeroSection() {
  return (
    <Section tone="b" pad="hero">
      <Container>
        <div className="flex flex-col items-center text-center">
          <BadgeGreen style={{ marginBottom: 28 }}>
            Sell everywhere, fulfil flawlessly 🛍
          </BadgeGreen>
          <Heading level={2} style={{ marginBottom: 36 }}>
            Sell everywhere.{" "}
            <Heading.Muted>
              Fulfil flawlessly and know your margin today.
            </Heading.Muted>
          </Heading>
          <PillGroup>
            <Pill variant="dark" withArrowUpRight href="https://system.bizakerp.com/account/self-register">
              Get Started
            </Pill>
            <Pill variant="light" withArrow href="/contact">
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

// ── [01] CAPABILITIES ─────────────────────────────────────────────────────────

function CapabilitiesSection() {
  return (
    <Section tone="a">
      <Container>
        <SectionHead
          index="01"
          label="The platform"
          title={<>Six modules. <Heading.Muted>One retail operating system.</Heading.Muted></>}
          titleMaxWidth={620}
        />
        <BentoGrid cols={3}>
          {CAPABILITIES.map(({ icon: Icon, title, desc }) => (
            <Bento key={title} tone="paper" hover>
              <Bento.Header title={title} icon={<Icon size={16} />} />
              <Bento.Desc>{desc}</Bento.Desc>
            </Bento>
          ))}
        </BentoGrid>
      </Container>
    </Section>
  );
}

// ── STEP VISUALS ──────────────────────────────────────────────────────────────

// Sync — shared inventory pool diagram
function ChannelSyncVisual() {
  return (
    <div className="flex w-full flex-col items-center justify-between gap-6">

      {/* Three channels */}
      <div className="relative flex w-full justify-around">
        {[
          { code: "WEB", label: "Web Store"   },
          { code: "MOB", label: "Mobile App"  },
          { code: "MKT", label: "Marketplace" },
        ].map((ch) => (
          <div key={ch.code} className="flex flex-col items-center gap-1.5">
            <div className="rounded-bz-md border border-bz-line-soft bg-white px-4 py-2.5 text-center">
              <div className="text-[10px] font-bold text-bz-text">{ch.code}</div>
              <div className="mt-0.5 text-[9px] text-bz-text-muted">{ch.label}</div>
            </div>
            <div className="h-5 w-px bg-bz-line" />
          </div>
        ))}
        <div className="absolute bottom-0 left-[13%] right-[13%] h-px bg-bz-line" />
      </div>

      {/* Central inventory pool */}
      <div className="w-full rounded-bz-lg border border-bz-line bg-white px-6 py-3 text-center shadow-sm">
        <div className="text-[13px] font-bold text-bz-text">Shared Inventory Pool</div>
        <div className="mt-0.5 text-[10px] text-bz-text-muted">SKU-2201 · Leather Bag · 48 units available</div>
      </div>

      {/* Result row */}
      <div className="flex w-full items-center justify-between rounded-bz-md border border-bz-line-soft bg-white px-4 py-2.5">
        <span className="text-[10.5px] text-bz-text-muted">Oversell incidents</span>
        <span className="text-[13px] font-bold tabular-nums text-bz-text">0</span>
      </div>
    </div>
  );
}

// Fulfill — order stage progression
function OrderFulfillmentVisual() {
  return (
    <div className="flex w-full flex-col gap-5">

      {/* Order identity */}
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-bz-line bg-white text-[11px] font-bold text-bz-text">
          841
        </div>
        <div>
          <div className="text-[13px] font-semibold text-bz-text">#ORD-9841</div>
          <div className="text-[11px] text-bz-text-muted">Web Store · Leather Bag × 1 · $129.00</div>
        </div>
      </div>

      <div className="h-px w-full bg-bz-line-soft" />

      {/* Stage progress */}
      <div className="flex flex-col gap-3">
        {[
          { label: "Placed",  pct: 100 },
          { label: "Picking", pct: 100 },
          { label: "Packed",  pct: 72  },
          { label: "Shipped", pct: 0   },
        ].map((s) => (
          <div key={s.label} className="flex items-center gap-3">
            <span className="w-14 shrink-0 text-[10px] text-bz-text-muted">{s.label}</span>
            <div className="flex-1"><StripeBar pct={s.pct} /></div>
            <span className="w-8 text-right text-[10px] tabular-nums text-bz-text-muted">
              {s.pct}%
            </span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between rounded-bz-md border border-bz-line-soft bg-white px-4 py-2.5">
        <span className="text-[10.5px] text-bz-text-muted">Auto-routed to nearest warehouse</span>
        <span className="text-[11px] font-bold text-bz-leaf-deep">On track</span>
      </div>
    </div>
  );
}

// Analyze — SKU margin spotlight
function MarginAnalyticsVisual() {
  return (
    <div className="flex w-full flex-col items-center justify-between gap-5">

      <div className="w-full text-[10px] font-semibold uppercase tracking-[0.14em] text-bz-text-soft">
        Top SKU · margin today
      </div>

      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <div className="bz-stat-num" style={{ fontSize: 72, lineHeight: 1 }}>62%</div>
        <div className="mt-2 text-[12px] text-bz-text-muted">Leather Bag · Black — gross margin</div>
      </div>

      <div className="grid w-full grid-cols-3 divide-x divide-bz-line-soft overflow-hidden rounded-bz-md border border-bz-line-soft bg-white">
        {[
          { label: "Units sold", val: "184" },
          { label: "Revenue",    val: "$23.7k" },
          { label: "Margin",     val: "62%"  },
        ].map((s) => (
          <div key={s.label} className="py-3 text-center">
            <div className="text-[14px] font-bold tabular-nums text-bz-text">{s.val}</div>
            <div className="text-[9.5px] text-bz-text-muted">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── [02] HOW IT WORKS ─────────────────────────────────────────────────────────

function HowItWorksSection() {
  return (
    <Section tone="b">
      <Container>
        <SectionHead
          index="02"
          label="How it works"
          title={<>From channel sync to customer delight — <Heading.Muted>tracked at every step.</Heading.Muted></>}
          titleMaxWidth={680}
        />
        <div className="flex flex-col gap-5">
          <StepCard
            number="01"
            tag="Sync"
            title="Unify every channel into one shared inventory pool."
            bullets={["A single stock count powers every storefront, POS terminal, and marketplace listing — oversells become impossible."]}
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
            bullets={["Live GMV, channel attribution, and margin-per-SKU — updated the moment a sale completes, not at month-end."]}
            visual={<MarginAnalyticsVisual />}
          />
        </div>
      </Container>
    </Section>
  );
}

// ── [03] SALE-TO-LEDGER ───────────────────────────────────────────────────────

function SaleLedgerVisual() {
  return (
    <div className="h-full w-full rounded-bz-xl border border-bz-line-soft bg-bz-paper p-5">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-[10.5px] font-semibold text-bz-text">#ORD-9841 · Leather Bag</span>
      </div>
      <div className="mt-3 border-t border-bz-line-soft pt-3">
        <div className="mb-2.5 grid grid-cols-[1fr_auto] gap-x-6">
          <span className="text-[9.5px] font-semibold uppercase tracking-[0.1em] text-bz-text-soft">
            Account
          </span>
          <span className="text-right text-[9.5px] font-semibold uppercase tracking-[0.1em] text-bz-text-soft">
            Amount
          </span>
        </div>
        {[
          { account: "DR  Accounts Receivable", amount: "129.00"  },
          { account: "CR  Sales Revenue",        amount: "129.00"  },
          { account: "DR  Cost of Goods Sold",   amount: "47.00"   },
          { account: "CR  Inventory",             amount: "47.00"   },
        ].map((row) => (
          <div key={row.account} className="grid grid-cols-[1fr_auto] gap-x-6 py-1.5">
            <span className="text-[11px] text-bz-text">{row.account}</span>
            <span className="text-right text-[11px] tabular-nums text-bz-text">{row.amount}</span>
          </div>
        ))}
      </div>
      <div className="mt-2.5 flex items-center gap-1.5 border-t border-bz-line-soft pt-2.5">
        <CheckCircle2 size={11} className="text-bz-leaf-deep" />
        <span className="text-[10px] font-medium text-bz-text-muted">
          Auto-posted to GL · 0 manual entries
        </span>
      </div>
    </div>
  );
}

function SaleToLedgerSection() {
  return (
    <Section tone="a">
      <Container>
        <BigCard
          text={{
            title: "Every sale auto-posts to inventory.",
            body: "When an order completes, Bizak reserves the stock, decrements the channel balance.",
            bullets: [
              "COGS and revenue post together in a single balanced entry per order."
            ],
            cta: {
              variant: "accent",
              withArrow: true,
              href: "/contact",
              children: "Request Demo",
            },
          }}
          visual={<SaleLedgerVisual />}
        />
      </Container>
    </Section>
  );
}

// ── [04] METRICS ──────────────────────────────────────────────────────────────

function MetricsSection() {
  return (
    <Section tone="b">
      <Container>
        <SectionHead
          index="03"
          label="The results"
          title={<>Numbers retailers <Heading.Muted>actually move.</Heading.Muted></>}
          titleMaxWidth={540}
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatTile value="3.8×"  desc="Faster fulfilment versus manual order routing and dispatch." />
          <StatTile value="99.1%" desc="Inventory accuracy across all channels after go-live." />
          <StatTile value="40%"   desc="Reduction in channel oversell incidents after connecting to one pool." />
          <StatTile value="0"     desc="Manual journal entries required at order close." />
        </div>
      </Container>
    </Section>
  );
}

// ── PAGE ──────────────────────────────────────────────────────────────────────

export function RetailAndEcommercePage() {
  return (
    <main>
      <HeroSection />
      <CapabilitiesSection />
      <HowItWorksSection />
      <SaleToLedgerSection />
      <MetricsSection />
    </main>
  );
}
