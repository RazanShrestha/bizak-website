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
  Heading,
  HeroCanvas,
  Pill,
  PillGroup,
  Section,
  SectionHead,
  StatusChip,
  StepCard,
  StripeBar,
} from "./bz";

// ── DATA ─────────────────────────────────────────────────────────────────────

const ORDERS_IN_FLIGHT = [
  { id: "DO-8841", dest: "Dubai, UAE",   stage: "Shipped",    pct: 94 },
  { id: "DO-8842", dest: "London, UK",   stage: "Picking",    pct: 61 },
  { id: "DO-8843", dest: "Mumbai, IN",   stage: "Processing", pct: 27 },
];

const DISPATCH_SUMMARY = [
  { label: "Shipped today",  value: "142" },
  { label: "In Transit",     value: "37"  },
  { label: "Awaiting pick",  value: "11"  },
];

const BATCH_ROWS = [
  { id: "#B-2025-041", product: "Frozen Dairy Mix",   exp: "2026-03-15", status: "Cleared", ok: true  },
  { id: "#B-2025-042", product: "Organic Wheat Bulk", exp: "2026-08-20", status: "Pending", ok: false },
  { id: "#B-2025-043", product: "Cold-press Oil 1L",  exp: "2025-12-01", status: "Cleared", ok: true  },
];

const SKU_MARGINS = [
  { sku: "SKU-1042", desc: "Organic Wheat 25kg", cost: "$18.40", sell: "$31.00", margin: "40.6%", up: true  },
  { sku: "SKU-2011", desc: "Cold-press Oil 1L",  cost: "$4.80",  sell: "$7.20",  margin: "33.3%", up: true  },
  { sku: "SKU-3301", desc: "Frozen Dairy Mix",   cost: "$12.10", sell: "$16.50", margin: "26.7%", up: false },
];

const CAPABILITIES = [
  { icon: RefreshCw,    title: "Smart Replenishment",   desc: "Reorder points with lead-time awareness — auto-PO fires before you run out, no manual trigger." },
  { icon: ScanBarcode,  title: "Barcode & QR Scanning", desc: "Receive, pick, and transfer via mobile scan. Every movement recorded the moment it happens." },
  { icon: Layers,       title: "Unit Conversions",      desc: "Buy in pallets, sell in cases, track in kilograms — all on the same item master." },
  { icon: Route,        title: "Multi-channel Sync",    desc: "Orders from e-commerce, B2B portals, and POS flow into one unified fulfillment queue." },
  { icon: PackageCheck, title: "Stock Transfers",       desc: "Move goods between warehouses and branches with full in-transit visibility and journal posting." },
  { icon: Truck,        title: "Carrier Integration",   desc: "Push shipment details to carriers and pull live tracking events back — automatically." },
];

// ── HERO MOCK ─────────────────────────────────────────────────────────────────

function DispatchBoardPanel() {
  return (
    <div className="flex flex-1 flex-col overflow-hidden rounded-bz-2xl border border-white/[0.08] bg-bz-paper">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-bz-line-soft px-5 py-3.5">
        <StatusChip variant="live">Live Dispatch · 190 orders today</StatusChip>
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-bz-text-muted">On-time</span>
          <span className="text-[15px] font-bold tabular-nums text-bz-text">96.2%</span>
          <span className="text-[10px] font-semibold text-bz-leaf-deep">↑ +1.4%</span>
        </div>
      </div>

      {/* Body */}
      <div className="grid flex-1 grid-cols-1 divide-y divide-bz-line-soft sm:grid-cols-[3fr_2fr] sm:divide-x sm:divide-y-0">

        {/* Left — orders in flight */}
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

        {/* Right — dispatch summary */}
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

// ── HERO ──────────────────────────────────────────────────────────────────────

function HeroSection() {
  return (
    <Section tone="b" pad="hero">
      <Container>
        <div className="flex flex-col items-center text-center">
          <BadgeGreen style={{ marginBottom: 28 }}>
            96.2% on-time delivery, live 🚚
          </BadgeGreen>

          <Heading level={2} style={{ marginBottom: 36 }}>
            Every order. Every warehouse. Every route.{" "}
            <Heading.Muted>One operating system for distribution.</Heading.Muted>
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
            <DispatchBoardPanel />
          </div>
        </HeroCanvas>
      </Container>
    </Section>
  );
}

// ── STEP VISUALS ──────────────────────────────────────────────────────────────

function PurchaseOrderVisual() {
  return (
    <div className="flex w-full flex-col gap-4">
      <div className="rounded-bz-lg border border-bz-line bg-white px-5 py-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div>
            <div className="text-[11px] font-bold text-bz-text">PO-3041</div>
            <div className="mt-0.5 text-[10px] text-bz-text-muted">ABC Trading Co. · 14 May 2025</div>
          </div>
          <StatusChip variant="posted">Approved</StatusChip>
        </div>
        <div className="flex flex-col gap-2">
          {[
            { ref: "RM-4021", desc: "Steel Sheet 5KG",  qty: "×240", val: "$4,416" },
            { ref: "RM-4031", desc: "Bearing Seal 2PCS", qty: "×480", val: "$1,344" },
          ].map((l) => (
            <div key={l.ref} className="flex items-center gap-2">
              <span className="w-[50px] shrink-0 text-[9.5px] font-medium text-bz-text">{l.ref}</span>
              <span className="flex-1 text-[9.5px] text-bz-text-muted">{l.desc}</span>
              <span className="text-[9.5px] text-bz-text-muted">{l.qty}</span>
              <span className="w-[44px] text-right text-[9.5px] font-semibold tabular-nums text-bz-text">{l.val}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 3-way match */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "PO", ok: true },
          { label: "GRN", ok: true },
          { label: "Invoice", ok: true },
        ].map((m) => (
          <div
            key={m.label}
            className="flex flex-col items-center gap-1.5 rounded-bz-md border border-bz-line-soft bg-white py-3"
          >
            <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-bz-text-soft">{m.label}</span>
            <span className="text-[9.5px] font-semibold text-bz-leaf-deep">Matched</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PickListVisual() {
  const lines = [
    { sku: "SKU-1042", loc: "Zone A · Rack 14", qty: "24 KG", done: true  },
    { sku: "SKU-3301", loc: "Zone B · Shelf 3",  qty: "12 EA", done: true  },
    { sku: "SKU-2011", loc: "Zone A · Bin B-3",  qty: "6 L",   done: false },
  ];
  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-[11px] font-bold text-bz-text">Pick List PL-2044</div>
          <div className="mt-0.5 text-[10px] text-bz-text-muted">DO-8841 · Dubai, UAE</div>
        </div>
        <StatusChip variant="live">Picking</StatusChip>
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-[10px] text-bz-text-muted">Progress</span>
          <span className="text-[10px] font-medium text-bz-text">2 / 3 lines</span>
        </div>
        <StripeBar pct={67} />
      </div>

      <div className="flex flex-col gap-2">
        {lines.map((p) => (
          <div
            key={p.sku}
            className={[
              "flex items-center gap-3 rounded-bz-md border px-3.5 py-2.5",
              p.done
                ? "border-bz-line-soft bg-white"
                : "border-bz-line bg-bz-paper-warm",
            ].join(" ")}
          >
            <div
              className={[
                "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
                p.done ? "border-bz-leaf-deep" : "border-bz-text-soft",
              ].join(" ")}
            >
              {p.done && (
                <span className="text-[8px] font-bold text-bz-leaf-deep">✓</span>
              )}
            </div>
            <div className="flex-1">
              <div className="text-[10.5px] font-medium text-bz-text">{p.sku}</div>
              <div className="text-[9.5px] text-bz-text-muted">{p.loc}</div>
            </div>
            <span className="text-[10px] font-semibold tabular-nums text-bz-text">{p.qty}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ShipmentSettleVisual() {
  return (
    <div className="flex w-full flex-col gap-4">
      <div className="rounded-bz-lg border border-bz-line bg-white px-5 py-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div>
            <div className="text-[11px] font-bold text-bz-text">INV-8841</div>
            <div className="mt-0.5 text-[10px] text-bz-text-muted">From DO-8841 · Dubai, UAE</div>
          </div>
          <StatusChip variant="posted">Sent</StatusChip>
        </div>
        <div className="flex items-center justify-between border-t border-bz-line-soft pt-3">
          <span className="text-[10.5px] text-bz-text-muted">Invoice total</span>
          <span className="text-[14px] font-bold tabular-nums text-bz-text">$5,760.00</span>
        </div>
      </div>

      <div className="rounded-bz-md border border-bz-line-soft bg-bz-paper-warm px-4 py-3">
        <div className="mb-2.5 flex items-center gap-2">
          <span className="text-[9.5px] font-semibold uppercase tracking-[0.14em] text-bz-text-soft">
            Auto-posted
          </span>
          <StatusChip variant="live">Ledger</StatusChip>
        </div>
        <div className="flex flex-col gap-2">
          {[
            { acc: "Accounts Receivable", side: "DR", amt: "$5,760" },
            { acc: "Revenue",             side: "CR", amt: "$5,760" },
          ].map((j) => (
            <DataRow key={j.acc} label={j.acc} value={`${j.side} ${j.amt}`} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── [01] FULFILLMENT FLOW ─────────────────────────────────────────────────────

function FulfillmentFlowSection() {
  return (
    <Section tone="a">
      <Container>
        <SectionHead
          index="01"
          label="End-to-end flow"
          title={
            <>
              From first PO to paid invoice —{" "}
              <Heading.Muted>all on one ledger.</Heading.Muted>
            </>
          }
          titleMaxWidth={680}
        />

        <div className="flex flex-col gap-5">
          <StepCard
            number="01"
            tag="Source & Order"
            title="Vendor management, POs, and 3-way matching"
            bullets={["3-way match (PO · GRN · Invoice) posts receipt to the ledger instantly."]}
            visual={<PurchaseOrderVisual />}
            className="!bg-bz-surface"
          />

          <StepCard
            number="02"
            tag="Warehouse & Dispatch"
            title="FIFO-routed picks, barcode scanning, carrier links"
            bullets={["Barcode or QR scan to confirm each pick line — zero paper travellers."]}
            visual={<PickListVisual />}
            className="!bg-bz-surface"
          />

          <StepCard
            number="03"
            tag="Deliver & Settle"
            title="Auto-invoice on shipment, COGS posted the same second"
            bullets={["COGS and revenue post to the ledger automatically the moment you dispatch."]}
            cta={{ variant: "dark", withArrowUpRight: true, href: "https://system.bizakerp.com/account/self-register", children: "Get Started" }}
            visual={<ShipmentSettleVisual />}
            className="!bg-bz-surface"
          />
        </div>
      </Container>
    </Section>
  );
}

// ── [02] BATCH TRACEABILITY ───────────────────────────────────────────────────

function BatchTableVisual() {
  return (
    <div className="flex w-full flex-col gap-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-bz-text-soft">
        Lot Traceability · Active Batches
      </p>
      <div className="overflow-hidden rounded-bz-lg border border-bz-line-soft bg-white">
        <div className="hidden grid-cols-[1.4fr_2fr_1fr_0.9fr] gap-3 border-b border-bz-line-soft bg-bz-paper-warm px-4 py-2.5 sm:grid">
          {["Batch ID", "Product", "Expiry", "Status"].map((h) => (
            <span key={h} className="text-[9px] font-semibold uppercase tracking-[0.14em] text-bz-text-soft">{h}</span>
          ))}
        </div>
        {BATCH_ROWS.map((b, i) => (
          <div
            key={b.id}
            className={[
              "grid grid-cols-1 gap-0.5 px-4 py-3 sm:grid-cols-[1.4fr_2fr_1fr_0.9fr] sm:items-center sm:gap-3",
              i < BATCH_ROWS.length - 1 ? "border-b border-bz-line-soft" : "",
            ].join(" ")}
          >
            <span className="text-[10.5px] font-medium tabular-nums text-bz-text">{b.id}</span>
            <span className="text-[10.5px] text-bz-text-muted">{b.product}</span>
            <span className="text-[10px] tabular-nums text-bz-text-muted">{b.exp}</span>
            <span className={["text-[9.5px] font-semibold", b.ok ? "text-bz-leaf-deep" : "text-bz-text-muted"].join(" ")}>
              {b.status}
            </span>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 rounded-bz-md border border-bz-line-soft bg-white px-3.5 py-2.5">
        <span className="flex-1 text-[10.5px] text-bz-text-muted">One-click recall by lot or batch number</span>
        <span className="shrink-0 text-[10.5px] font-semibold text-bz-leaf-deep">Compliance-ready</span>
      </div>
    </div>
  );
}

function BatchTraceabilitySection() {
  return (
    <Section tone="b">
      <Container>
        <BigCard
          text={{
            title: "Full lot-to-customer traceability",
            body: "Track every unit from manufacturer receipt to end-customer delivery.",
            bullets: [
              "FIFO, FEFO, and LIFO pick strategies per item category.",
              "Expiry-date alerting with automated hold triggers before breach.",
              // "One-click batch recall — every affected order surfaced in seconds.",
            ],
            cta: { variant: "accent", withArrow: true, href: "/contact", children: "Talk to Sales" },
          }}
          visual={<BatchTableVisual />}
        />
      </Container>
    </Section>
  );
}

// ── [03] OPERATIONS CAPABILITIES ─────────────────────────────────────────────

function OperationsCapabilitiesSection() {
  return (
    <Section tone="a">
      <Container>
        <SectionHead
          index="03"
          label="The platform"
          title={
            <>
              Everything a modern distributor needs.{" "}
              <Heading.Muted>Nothing it doesn't.</Heading.Muted>
            </>
          }
          titleMaxWidth={680}
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

// ── [04] MARGIN INTELLIGENCE ──────────────────────────────────────────────────

function SkuMarginsVisual() {
  return (
    <div className="flex w-full flex-col gap-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-bz-text-soft">
        Per-SKU Margin · Live
      </p>
      <div className="overflow-hidden rounded-bz-lg border border-bz-line-soft bg-white">
        <div className="hidden grid-cols-[1.1fr_2fr_0.8fr_0.8fr_0.8fr] gap-2 border-b border-bz-line-soft bg-bz-paper-warm px-4 py-2.5 sm:grid">
          {["SKU", "Item", "Cost", "Sell", "Margin"].map((h) => (
            <span key={h} className="text-[9px] font-semibold uppercase tracking-[0.14em] text-bz-text-soft">{h}</span>
          ))}
        </div>
        {SKU_MARGINS.map((s, i) => (
          <div
            key={s.sku}
            className={[
              "grid grid-cols-1 gap-0.5 px-4 py-3 sm:grid-cols-[1.1fr_2fr_0.8fr_0.8fr_0.8fr] sm:items-center sm:gap-2",
              i < SKU_MARGINS.length - 1 ? "border-b border-bz-line-soft" : "",
            ].join(" ")}
          >
            <span className="text-[10px] font-medium text-bz-text">{s.sku}</span>
            <span className="text-[10.5px] text-bz-text-muted">{s.desc}</span>
            <span className="text-[10.5px] tabular-nums text-bz-text-muted">{s.cost}</span>
            <span className="text-[10.5px] font-medium tabular-nums text-bz-text">{s.sell}</span>
            <span
              className={[
                "text-[10.5px] font-bold tabular-nums",
                s.up ? "text-bz-leaf-deep" : "text-bz-text-muted",
              ].join(" ")}
            >
              {s.margin}
            </span>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 rounded-bz-md border border-bz-line-soft bg-white px-3.5 py-2.5">
        <span className="flex-1 text-[10.5px] text-bz-text-muted">COGS auto-posted on every shipment</span>
        <span className="shrink-0 text-[10.5px] font-semibold text-bz-leaf-deep">Zero re-keying</span>
      </div>
    </div>
  );
}

function MarginIntelligenceSection() {
  return (
    <Section tone="b">
      <Container>
        <BigCard
          reverse
          text={{
            title: "Per-SKU margin, from landed cost to last cent",
            body: "Freight, duty, and handling baked in — your true margin, live on every SKU.",
            bullets: [
              "Landed cost calculation: freight + duty + handling per unit.",
              "Live P&L per SKU — no month-end manual costing run.",
            ],
            cta: { variant: "accent", withArrowUpRight: true, href: "https://system.bizakerp.com/account/self-register", children: "Free Trial" },
          }}
          visual={<SkuMarginsVisual />}
        />
      </Container>
    </Section>
  );
}

// ── PAGE ──────────────────────────────────────────────────────────────────────

export function DistributionPage() {
  return (
    <>
      <HeroSection />
      <FulfillmentFlowSection />
      <BatchTraceabilitySection />
      <OperationsCapabilitiesSection />
      <MarginIntelligenceSection />
    </>
  );
}
