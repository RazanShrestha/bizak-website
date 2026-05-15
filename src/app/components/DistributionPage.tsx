import {
  Layers,
  PackageCheck,
  RefreshCw,
  Route,
  ScanBarcode,
  Truck,
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
} from "./bz";

// ════════════════════════════════════════════════════════════════════════════
// DATA
// ════════════════════════════════════════════════════════════════════════════

const ORDERS_IN_FLIGHT = [
  { id: "DO-8841", dest: "Kathmandu, NP", stage: "Shipped",    pct: 94 },
  { id: "DO-8842", dest: "Delhi, IN",     stage: "Picking",    pct: 61 },
  { id: "DO-8843", dest: "Mumbai, IN",    stage: "Processing", pct: 27 },
];

const DISPATCH_SUMMARY = [
  { label: "Shipped today",  value: "142" },
  { label: "In Transit",     value: "37"  },
  { label: "Awaiting pick",  value: "11"  },
];

const ROUTES = [
  { id: "RTE-41", badge: "A", name: "Nepal Run", status: "In Transit", pct: 94 },
  { id: "RTE-42", badge: "B", name: "India Run", status: "Dispatched",  pct: 61 },
];

const DISPATCH_EVENTS = [
  { id: "DO-8841", what: "Delivery order · Kathmandu",  flow: "COGS posted · $5,760",  t: "2m" },
  { id: "DO-8842", what: "Pick scan · Delhi run",       flow: "Progress 45% → 61%",    t: "4m" },
];

const CAPABILITIES = [
  { icon: RefreshCw,    title: "Smart Replenishment",   desc: "Reorder points with lead-time awareness auto-PO fires before you run out, no manual trigger." },
  { icon: ScanBarcode,  title: "Barcode & QR Scanning", desc: "Receive, pick, and transfer via mobile scan. Every movement recorded the moment it happens." },
  { icon: Layers,       title: "Unit Conversions",      desc: "Buy in pallets, sell in cases, track in kilograms all on the same item master." },
  { icon: Route,        title: "Multi-channel Sync",    desc: "Orders from e-commerce, B2B portals, and POS flow into one unified fulfillment queue." },
  { icon: PackageCheck, title: "Batch Traceability",    desc: "Track every lot from receipt to delivery FIFO, FEFO, and one-click recall for compliance." },
  { icon: Truck,        title: "Carrier Integration",   desc: "Push shipment details to carriers and pull live tracking events back automatically." },
];

const SKU_MARGINS = [
  { sku: "SKU-1042", desc: "Organic Wheat 25kg", margin: "40.6%", up: true  },
  { sku: "SKU-2011", desc: "Cold-press Oil 1L",  margin: "33.3%", up: true  },
  { sku: "SKU-3301", desc: "Frozen Dairy Mix",   margin: "26.7%", up: false },
];

const COST_COMPONENTS = ["Freight", "Duty", "Handling"];

// ════════════════════════════════════════════════════════════════════════════
// HERO MOCK
// ════════════════════════════════════════════════════════════════════════════

function DispatchBoardPanel() {
  return (
    <div className="flex flex-1 flex-col overflow-hidden rounded-bz-2xl border border-white/[0.08] bg-bz-paper">
      <div className="flex items-center justify-between border-b border-bz-line-soft px-5 py-3.5">
        <StatusChip variant="live">Live Dispatch</StatusChip>
        <div className="flex items-center gap-1.5">
          <span className="text-[15px] font-bold tabular-nums text-bz-text">96.2%</span>
          <span className="text-[10px] font-semibold text-bz-leaf-deep">↑ +1.4%</span>
        </div>
      </div>

      <div className="grid flex-1 grid-cols-1 divide-y divide-bz-line-soft sm:grid-cols-[3fr_2fr] sm:divide-x sm:divide-y-0">
        <div className="p-5">
          <p className="mb-3.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-bz-text-soft">
            Orders in Flight
          </p>
          <div className="flex flex-col gap-4">
            {ORDERS_IN_FLIGHT.map((o) => (
              <div key={o.id}>
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <span className="text-[10.5px] font-medium text-bz-text">{o.id}</span>
                  <span className="text-[10px] text-bz-text-muted">{o.dest}</span>
                  <span
                    className={[
                      "ml-auto shrink-0 text-[9px] font-semibold uppercase tracking-[0.1em]",
                      o.pct >= 90
                        ? "text-bz-leaf-deep"
                        : o.pct >= 50
                        ? "text-bz-text"
                        : "text-bz-text-muted",
                    ].join(" ")}
                  >
                    {o.stage}
                  </span>
                </div>
                <StripeBar pct={o.pct} />
              </div>
            ))}
          </div>
        </div>

        <div className="p-5">
          <p className="mb-3.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-bz-text-soft">
            Today's Summary
          </p>
          <div className="flex flex-col gap-2.5">
            {DISPATCH_SUMMARY.map((s) => (
              <div
                key={s.label}
                className="flex items-center justify-between rounded-bz-md border border-bz-line-soft bg-white px-3.5 py-2.5"
              >
                <span className="text-[10.5px] text-bz-text-muted">{s.label}</span>
                <span className="text-[15px] font-bold tabular-nums text-bz-text">{s.value}</span>
              </div>
            ))}
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
            On-time delivery, Live
          </BadgeGreen>
          <Heading level={2} style={{ marginBottom: 36 }}>
            Every order. Every warehouse. Every route.{" "}{<br className="hidden md:block"/>}
            <Heading.Muted>
              One operating system for distribution.
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
            <DispatchBoardPanel />
          </div>
        </HeroCanvas>
      </Container>
    </Section>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// [01] THE PLATFORM warehouse status panel + event feed + feature bentos
// ════════════════════════════════════════════════════════════════════════════

function CapabilitiesSection() {
  return (
    <Section tone="a">
      <Container>
        <SectionHead
          index="01"
          label="The platform"
          title={<>Six modules. <Heading.Muted>One distribution system.</Heading.Muted></>}
          titleMaxWidth={620}
          actions={
            <PillGroup>
              <Pill variant="dark" withArrowUpRight href="https://system.bizakerp.com/account/self-register">Get Started</Pill>
              <Pill variant="light" href="/contact">Request Demo</Pill>
            </PillGroup>
          }
        />

        <DispatchFloorPanel />

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

function DispatchFloorPanel() {
  return (
    <div className="grid grid-cols-1 gap-[18px] lg:grid-cols-[1.4fr_1fr]">
      {/* Route status dark olive panel */}
      <div className="relative flex flex-col overflow-hidden rounded-bz-2xl bg-bz-olive p-7">
        <DotGrid tone="dark" />
        <div className="relative flex flex-col flex-1">
          <div className="mb-5 flex items-start justify-between gap-3">
            <div className="text-[10.5px] font-medium uppercase tracking-[0.18em] text-white/[0.55]">
              Dispatch floor · all routes
            </div>
            <StatusChip variant="live">Live</StatusChip>
          </div>

          <div className="mt-auto grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {ROUTES.map((r) => (
              <div
                key={r.id}
                className="rounded-bz-xl border border-white/[0.06] bg-white/[0.04] p-3.5"
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-bz-pill bg-bz-leaf text-[10.5px] font-semibold text-[#1F3422]">
                      {r.badge}
                    </span>
                    <span className="text-[11.5px] font-medium text-bz-text-on-dark">
                      {r.id} · {r.name}
                    </span>
                  </div>
                  <span className="text-[10.5px] text-white/[0.72]">{r.status}</span>
                </div>
                <StripeBar pct={r.pct} tone="dark" />
                <div className="mt-1.5 text-[10px] text-white/[0.55]">
                  Completion {r.pct}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Dispatch event feed light panel */}
      <div className="rounded-bz-2xl border border-bz-line-soft bg-bz-paper p-6">
        <div className="mb-4 flex items-start justify-between gap-3 pb-24">
          <div>
            <div className="text-[11px] text-bz-text-muted">Dispatch event feed</div>
            <div className="bz-stat-num" style={{ fontSize: 20 }}>last 60 seconds</div>
          </div>
          <div className="flex items-center gap-1.5 rounded-bz-pill bg-[#F4F5EF] px-2.5 py-1">
            <span className="h-1.5 w-1.5 rounded-bz-pill bg-bz-leaf-deep" />
            <span className="text-[10.5px] font-medium text-bz-text">Streaming</span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {DISPATCH_EVENTS.map((f) => (
            <div key={f.id} className="rounded-bz-lg bg-bz-paper-warm px-3 py-2.5">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[11.5px] font-medium text-bz-text">{f.id}</span>
                <span className="text-[10.5px] text-bz-text-muted">{f.t}</span>
              </div>
              <div className="mt-0.5 flex flex-wrap items-center justify-between gap-x-3 gap-y-0.5">
                <span className="text-[11px] text-bz-text-muted">{f.what}</span>
                <span className="text-[10.5px] text-bz-text">{f.flow}</span>
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

function PurchaseOrderVisual() {
  return (
    <div className="w-full max-w-[380px] rounded-bz-xl border border-bz-line-soft bg-bz-paper p-4 shadow-[0_10px_28px_rgba(15,20,17,0.06)]">
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="text-[11px] text-bz-text-muted">PO-3041 · ABC Trading Co.</span>
        <StatusChip variant="posted">Approved</StatusChip>
      </div>
      <div className="mb-3 ml-3 flex flex-col gap-1.5 border-l border-bz-line-soft pl-3">
        {[
          { ref: "RM-4021", name: "Steel Sheet",  qty: "×240 KG"  },
          { ref: "RM-4031", name: "Bearing Seal", qty: "×480 PCS" },
        ].map((l) => (
          <div key={l.ref} className="flex items-center justify-between gap-2 rounded-bz-md bg-bz-paper-warm px-3 py-2">
            <span className="text-[11px] font-medium text-bz-text">{l.ref}</span>
            <span className="text-[10.5px] text-bz-text-muted">{l.name} · {l.qty}</span>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 divide-x divide-bz-line-soft overflow-hidden rounded-bz-md border border-bz-line-soft">
        {["PO", "GRN", "Invoice"].map((label) => (
          <div key={label} className="py-2 text-center">
            <div className="text-[11px] font-semibold text-bz-leaf-deep">✓</div>
            <div className="text-[9.5px] text-bz-text-muted">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PickListVisual() {
  return (
    <div className="w-full max-w-[380px] rounded-bz-xl border border-bz-line-soft bg-bz-paper p-4 shadow-[0_10px_28px_rgba(15,20,17,0.06)]">
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="text-[11px] text-bz-text-muted">PL-2044 · DO-8841 · Kathmandu</span>
        <StatusChip variant="live">Picking</StatusChip>
      </div>
      <div className="mb-3 rounded-bz-md bg-bz-paper-warm px-3 py-2.5">
        <div className="mb-0.5 text-[11.5px] font-medium text-bz-text">Pick List PL-2044</div>
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="w-10 shrink-0 text-[10px] text-bz-text-muted">Line 1</span>
          <div className="flex-1"><StripeBar pct={100} /></div>
          <span className="w-7 text-right text-[10.5px] font-semibold tabular-nums text-bz-leaf-deep">✓</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-10 shrink-0 text-[10px] text-bz-text-muted">Line 2</span>
          <div className="flex-1"><StripeBar pct={100} /></div>
          <span className="w-7 text-right text-[10.5px] font-semibold tabular-nums text-bz-leaf-deep">✓</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-10 shrink-0 text-[10px] font-semibold text-bz-text">Line 3</span>
          <div className="flex-1"><StripeBar pct={0} /></div>
          <span className="w-7 text-right text-[10.5px] font-semibold tabular-nums text-bz-text-muted">·</span>
        </div>
      </div>
      <div className="mt-3">
        <DataRow label="Progress" value="2 / 3 lines" emphasis />
      </div>
    </div>
  );
}

function ShipmentSettleVisual() {
  return (
    <div className="w-full max-w-[380px] rounded-bz-xl border border-bz-line-soft bg-bz-paper p-4 shadow-[0_10px_28px_rgba(15,20,17,0.06)]">
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="text-[11px] text-bz-text-muted">INV-8841 · Auto-invoice on dispatch</span>
        <StatusChip variant="posted">Sent</StatusChip>
      </div>
      <div className="mb-3 rounded-bz-md bg-bz-paper-warm px-4 py-3 text-center">
        <div className="bz-stat-num" style={{ fontSize: 32 }}>$5,760</div>
      </div>
      <div className="grid grid-cols-2 divide-x divide-bz-line-soft overflow-hidden rounded-bz-md border border-bz-line-soft">
        {[
          { label: "COGS",    val: "DR" },
          { label: "Revenue", val: "CR" },
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
          title={<>From first PO to paid invoice <Heading.Muted>tracked at every step.</Heading.Muted></>}
          titleMaxWidth={680}
        />
        <div className="flex flex-col gap-5">
          <StepCard
            number="01"
            tag="Source & Order"
            title="Vendor management, POs, and 3-way matching."
            bullets={["3-way match (PO · GRN · Invoice) posts receipt to the ledger instantly."]}
            visual={<PurchaseOrderVisual />}
          />
          <StepCard
            number="02"
            tag="Warehouse & Dispatch"
            title="FIFO-routed picks, barcode scanning, carrier links."
            bullets={["Barcode or QR scan to confirm each pick line zero paper travellers."]}
            visual={<PickListVisual />}
          />
          <StepCard
            number="03"
            tag="Deliver & Settle"
            title="Auto-invoice on shipment, COGS posted the same second."
            bullets={["COGS and revenue post to the ledger automatically the moment you dispatch."]}
            visual={<ShipmentSettleVisual />}
          />
        </div>
      </Container>
    </Section>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// [03] MARGIN INTELLIGENCE
// ════════════════════════════════════════════════════════════════════════════

function SkuMarginsVisual() {
  return (
    <div className="w-full max-w-[380px] rounded-bz-xl bg-bz-paper p-5 text-bz-text">
      <div className="mb-2.5 flex items-center justify-between gap-3">
        <div className="text-[11.5px] text-bz-text-muted">Per-SKU margin</div>
        <PackageCheck size={16} color="#1F3422" />
      </div>
      <div className="bz-stat-num" style={{ fontSize: 28 }}>40.6%</div>
      <div className="mb-4 pb-6 text-[11px] text-bz-text-muted"></div>

      <div className="flex flex-col gap-1.5">
        {SKU_MARGINS.map((s) => (
          <div
            key={s.sku}
            className="flex items-center justify-between gap-2 rounded-bz-md bg-bz-paper-warm px-3 py-2"
          >
            <div className="flex min-w-0 items-center gap-2">
              <span className={["h-1.5 w-1.5 shrink-0 rounded-full", s.up ? "bg-bz-leaf-deep" : "bg-bz-text-soft"].join(" ")} />
              <span className="text-[11px] font-medium text-bz-text">{s.sku}</span>
              <span className="truncate text-[10.5px] text-bz-text-muted">{s.desc}</span>
            </div>
            <span className={["text-[10.5px] font-semibold tabular-nums", s.up ? "text-bz-leaf-deep" : "text-bz-text-muted"].join(" ")}>
              {s.margin}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5 pt-8">
        {COST_COMPONENTS.map((m) => (
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

function MarginIntelligenceSection() {
  return (
    <Section tone="a">
      <Container>
        <SectionHead
          index="03"
          label="Margin intelligence"
          title={<>Every shipment, <Heading.Muted>landed cost to profit automatically.</Heading.Muted></>}
          titleMaxWidth={680}
        />
        <BigCard
          text={{
            title: "Your true margin, live on every SKU.",
            bullets: [
              "Landed cost calculation: freight + duty + handling per unit.",
              "Live P&L per SKU no month-end manual costing run.",
            ],
            cta: { variant: "accent", withArrow: true, href: "/contact", children: "Talk to Sales" },
          }}
          visual={<SkuMarginsVisual />}
        />
      </Container>
    </Section>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// [04] DISTRIBUTION, ON ONE LEDGER
// ════════════════════════════════════════════════════════════════════════════

function OneLedgerSection() {
  return (
    <Section tone="dark">
      <Container>
        <SectionHead
          index="04"
          label="One ledger"
          tone="dark"
          title={<>Every distribution event, <Heading.Muted>auto-posted to the same ledger that closes the books.</Heading.Muted></>}
          titleMaxWidth={780}
        />

        <BentoGrid cols={3}>
          <Bento tone="dark" hover dotGrid minHeight={260}>
            <Bento.Header
              title={<>PO receipt →<br />Inventory charged</>}
              icon={<PackageCheck size={22} strokeWidth={1.4} color="#DBE9B8" />}
            />
            <Bento.Desc>
              Goods receipt debits Inventory at landed cost the moment the GRN is confirmed.
            </Bento.Desc>
            <Bento.Footer tone="dark" className="flex flex-col gap-1.5">
              <JournalRow tone="dark" txn="GRN-3041 · receipt" debit="Inventory" credit="Accounts Payable" />
            </Bento.Footer>
          </Bento>

          <Bento tone="dark" hover dotGrid minHeight={260}>
            <Bento.Header
              title={<>Shipment →<br />COGS recognised</>}
              icon={<Truck size={22} strokeWidth={1.4} color="#DBE9B8" />}
            />
            <Bento.Desc>
              Dispatching an order credits Inventory and debits COGS zero manual entries.
            </Bento.Desc>
            <Bento.Footer tone="dark" className="flex flex-col gap-1.5">
              <JournalRow tone="dark" txn="DO-8841 · dispatch" debit="Cost of Goods Sold" credit="Inventory" />
            </Bento.Footer>
          </Bento>

          <Bento tone="dark" hover dotGrid minHeight={260}>
            <Bento.Header
              title={<>Invoice →<br />AR auto-posted</>}
              icon={<Layers size={22} strokeWidth={1.4} color="#DBE9B8" />}
            />
            <Bento.Desc>
              Auto-generated invoice debits Accounts Receivable and credits Revenue on the same ledger.
            </Bento.Desc>
            <Bento.Footer tone="dark" className="flex flex-col gap-1.5">
              <JournalRow tone="dark" txn="INV-8841 · invoice" debit="Accounts Receivable" credit="Revenue" />
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

export function DistributionPage() {
  return (
    <main>
      <HeroSection />
      <CapabilitiesSection />
      <HowItWorksSection />
      <MarginIntelligenceSection />
      <OneLedgerSection />
    </main>
  );
}
