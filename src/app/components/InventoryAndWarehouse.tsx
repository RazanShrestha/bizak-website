import {
  Section,
  Container,
  SectionHeading,
  Button,
  Card,
  IconBadge,
  HeroBadge,
  HeroCentered,
} from "./marketing";
import {
  Warehouse,
  ClipboardList,
  Package,
  RefreshCw,
  DollarSign,
  BarChart3,
  ArrowUpDown,
  BadgeCheck,
  TrendingDown,
  FileText,
  ShoppingCart,
  PackagePlus,
  Truck,
} from "lucide-react";

// ─── DATA ────────────────────────────────────────────────────────────────────

const CAPABILITIES = [
  { Icon: Warehouse,   title: "Multi-warehouse Management", desc: "Manage stock across multiple locations with unified visibility and zone-level control." },
  { Icon: Package,     title: "Live Stock Tracking",        desc: "Real-time quantity updates on every movement — from receipt to dispatch to adjustment." },
  { Icon: ArrowUpDown, title: "Goods Receipt & Dispatch",   desc: "Streamline inbound and outbound operations with automated GRN and delivery notes." },
  { Icon: RefreshCw,   title: "Reorder Management",         desc: "Smart reorder points and automated purchase requests keep stock levels optimized." },
  { Icon: DollarSign,  title: "Stock Valuation",            desc: "FIFO, LIFO, and average cost methods with real-time valuation across all warehouses." },
  { Icon: BarChart3,   title: "Inventory Reporting",        desc: "Comprehensive aging, movement, and valuation reports with one-click export." },
];

const METRICS = [
  { value: "98%", label: "Inventory Accuracy",      desc: "Cycle count discipline and real-time adjustments keep your records consistently reliable." },
  { value: "40%", label: "Lower Stockouts",          desc: "Smart reorder rules prevent stock shortfalls before they impact customer commitments." },
  { value: "25%", label: "Carrying Cost Reduction",  desc: "Optimized reorder quantities and dead-stock alerts cut unnecessary holding expenses." },
];

// ─── HERO VISUAL ──────────────────────────────────────────────────────────────

function HeroDashboard() {
  const heroStats = [
    { label: "Live Stock", value: "1,402", unit: "SKUs" },
    { label: "In Transit", value: "248",   unit: "Orders" },
    { label: "Pending QC", value: "12",    unit: "Batches" },
    { label: "Turn Over",  value: "4.2x",  unit: "Rate" },
  ];
  const flow = [
    { label: "Receiving", Icon: PackagePlus },
    { label: "Storage",   Icon: Warehouse },
    { label: "Shipping",  Icon: Truck },
  ];

  return (
    <div className="max-w-[1100px] mx-auto rounded-bz-2xl border border-bz-border overflow-hidden">
      {/* Top bar */}
      <div className="bg-bz-deep px-8 py-4 flex items-center justify-between">
        <div className="flex gap-1.5">
          {[{ c: "#ff5f57" }, { c: "#ffbd2e" }, { c: "#28c840" }].map(({ c }) => (
            <div key={c} className="w-3 h-3 rounded-full" style={{ background: c }} />
          ))}
        </div>
        <span className="text-[11px] font-bold text-white/40 tracking-[0.1em]">BIZAK · WAREHOUSE CONTROL</span>
        <div className="w-14" />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 border-b border-bz-border bg-bz-surface">
        {heroStats.map((s, i) => (
          <div key={s.label} className={`px-8 py-7 text-left${i > 0 ? " border-l border-bz-border" : ""}`}>
            <div className="text-[9px] font-bold uppercase tracking-[0.15em] text-bz-text-muted mb-2">{s.label}</div>
            <div className="text-[34px] font-extrabold text-bz-text tracking-[-0.03em] leading-none">{s.value}</div>
            <div className="text-[10px] text-bz-text-muted mt-1">{s.unit}</div>
          </div>
        ))}
      </div>

      {/* Warehouse flow */}
      <div className="px-12 py-14 bg-bz-bg flex items-center justify-center">
        {flow.map(({ label, Icon: FlowIcon }, i) => (
          <div key={label} className="flex items-center">
            <div className="px-10 py-5 bg-bz-surface rounded-bz-xl border border-bz-border flex flex-col items-center gap-2.5 min-w-[130px]">
              <div className={`w-10 h-10 rounded-bz-lg flex items-center justify-center ${i === 1 ? "bg-bz-accent" : "bg-bz-bg"}`}>
                <FlowIcon className={`size-5 ${i === 1 ? "text-bz-text" : "text-bz-text-muted"}`} />
              </div>
              <span className="text-[12px] font-bold text-bz-text">{label}</span>
            </div>
            {i < flow.length - 1 && (
              <div className="relative w-16 h-px bg-bz-accent/50 mx-[-1px]">
                <div
                  className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-0 h-0"
                  style={{
                    borderTop: "5px solid transparent",
                    borderBottom: "5px solid transparent",
                    borderLeft: "6px solid var(--bz-accent)",
                    opacity: 0.6,
                  }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── TECH SHOWCASE ────────────────────────────────────────────────────────────

function TechShowcaseSection() {
  return (
    <Section tone="dark">
      <Container>
        <SectionHeading
          eyebrow="Technical Showcase"
          title={<>High-fidelity tools for the<br />modern warehouse team</>}
          tone="light"
          maxWidth={700}
          className="mb-16"
        />

        {/* Top row: 2/3 + 1/3 */}
        <div className="grid grid-cols-3 gap-5 mb-5">

          {/* Warehouse Control */}
          <div className="col-span-2 bg-white/[0.03] rounded-[28px] p-11 border border-white/[0.06]">
            <Warehouse className="size-[22px] text-white/30" />
            <h3 className="text-[22px] font-bold text-white mt-4 mb-2.5">Warehouse Control</h3>
            <p className="text-[13px] text-white/50 max-w-[380px] leading-[1.65] mb-9">
              Full zone-level visibility into live inventory quantities, batch status, and location accuracy across every rack.
            </p>
            <div className="bg-white/[0.04] rounded-bz-2xl p-6 border border-white/[0.05] max-w-[400px]">
              <div className="flex items-center gap-3.5 mb-5">
                <div className="w-12 h-12 rounded-bz-xl bg-bz-accent-soft flex items-center justify-center font-bold text-bz-accent text-[14px]">
                  ZA
                </div>
                <div>
                  <div className="text-[13px] font-bold text-white">Zone A — Main Warehouse</div>
                  <div className="text-[10px] text-white/50 mt-0.5">• Active · Sector 3 · Rack 12–18</div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/[0.05]">
                {[
                  { label: "On-Hand Units", value: "3,842", accent: true },
                  { label: "Utilisation",   value: "78%",   accent: false },
                  { label: "Last Audit",    value: "2d ago", accent: false },
                ].map((m) => (
                  <div key={m.label}>
                    <div className="text-[9px] text-white/50 uppercase tracking-[0.05em] mb-1">{m.label}</div>
                    <div className={`text-[13px] font-bold ${m.accent ? "text-bz-accent" : "text-white"}`}>{m.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Smart Replenishment */}
          <div className="bg-white/[0.03] rounded-[28px] p-9 border border-white/[0.06] flex flex-col">
            <RefreshCw className="size-[22px] text-white/30" />
            <h3 className="text-[22px] font-bold text-white mt-4 mb-2.5">Smart Replenishment</h3>
            <p className="text-[13px] text-white/50 leading-[1.65] mb-8 flex-1">
              Auto-triggered purchase requests with configurable approval chains and priority routing.
            </p>
            <div className="flex flex-col gap-2.5">
              {[
                { label: "PO Approval Pending",       dot: "accent", dim: false },
                { label: "Low Stock Alert — SKU 4821", dot: "green",  dim: false },
                { label: "Reorder Queued",             dot: "none",   dim: true },
              ].map((row) => (
                <div
                  key={row.label}
                  className={`flex items-center justify-between bg-white/[0.04] px-4 py-3.5 rounded-bz-lg border border-white/[0.05]${row.dim ? " opacity-40" : ""}`}
                >
                  <span className="text-[10px] font-bold text-white/60">{row.label}</span>
                  {row.dot === "green"  && <div className="w-2 h-2 rounded-full bg-green-500" />}
                  {row.dot === "accent" && <div className="w-2 h-2 rounded-full bg-bz-accent" />}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom row: 5/12 + 7/12 */}
        <div className="grid grid-cols-12 gap-5">

          {/* Movement Tracking */}
          <div className="col-span-5 bg-white/[0.03] rounded-[28px] p-9 border border-white/[0.06]">
            <ArrowUpDown className="size-[22px] text-white/30" />
            <h3 className="text-[20px] font-bold text-white mt-4 mb-2.5">Movement Tracking</h3>
            <p className="text-[13px] text-white/50 leading-[1.65] mb-8">
              Real-time transfer logs for every inbound and outbound movement with reference tracing.
            </p>
            <div className="flex flex-col gap-3">
              {[
                { label: "Inbound Receipts",    pct: 82, colorClass: "bg-bz-accent" },
                { label: "Outbound Dispatches", pct: 64, colorClass: "bg-bz-accent/50" },
                { label: "Internal Transfers",  pct: 45, colorClass: "bg-bz-accent/25" },
              ].map((bar) => (
                <div key={bar.label}>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-[10px] text-white/60 font-bold">{bar.label}</span>
                    <span className="text-[10px] text-white/50">{bar.pct}%</span>
                  </div>
                  <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${bar.colorClass}`} style={{ width: `${bar.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cycle Counting */}
          <div className="col-span-7 bg-white/[0.03] rounded-[28px] p-9 border border-white/[0.06] relative">
            <div className="absolute top-9 right-9 text-right">
              <div className="text-[9px] font-bold text-white/50 uppercase tracking-[0.1em] mb-1">Accuracy</div>
              <div className="text-[26px] font-black text-bz-accent">99.8%</div>
            </div>
            <ClipboardList className="size-[22px] text-white/30" />
            <h3 className="text-[20px] font-bold text-white mt-4 mb-2.5">Cycle Counting</h3>
            <p className="text-[13px] text-white/50 leading-[1.65] max-w-[340px] mb-8">
              Scheduled and ad-hoc counts with variance detection and automated reconciliation records.
            </p>
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-white/[0.05]">
                  {["Count Ref", "Location", "Status"].map((h, i) => (
                    <th key={h} className={`text-[9px] font-bold uppercase tracking-[0.1em] text-white/50 pb-3 ${i === 2 ? "text-right" : "text-left"}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { ref: "CC-2024-0441", loc: "Zone A / Rack 14" },
                  { ref: "CC-2024-0440", loc: "Zone B / Shelf 3" },
                  { ref: "CC-2024-0439", loc: "Zone A / Rack 12" },
                ].map((row) => (
                  <tr key={row.ref} className="border-b border-white/[0.04]">
                    <td className="text-[11px] font-bold tracking-tight text-white py-3">{row.ref}</td>
                    <td className="text-[11px] text-white/60 py-3">{row.loc}</td>
                    <td className="py-3 text-right">
                      <div className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-green-500/15">
                        <div className="w-[5px] h-[5px] rounded-full bg-green-500" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Container>
    </Section>
  );
}

// ─── INTELLIGENCE ─────────────────────────────────────────────────────────────

function IntelligenceSection() {
  const intelStats = [
    { Icon: ArrowUpDown, label: "Turn Over",  value: "4.2x",  sub: "↑ 0.3x",        positive: true },
    { Icon: BadgeCheck,  label: "Accuracy",   value: "99.8%", sub: "Target Achieved", positive: false },
    { Icon: TrendingDown,label: "Dead Stock", value: "0.82%", sub: "↓ 0.1%",         positive: true },
    { Icon: FileText,    label: "Fulfillment",value: "98.5%", bar: 98 },
  ];

  return (
    <Section tone="light">
      <Container>
        <SectionHeading
          eyebrow="Reporting"
          title="Inventory Intelligence"
          align="center"
          className="mb-16"
        />
        <div className="grid grid-cols-[3fr_1fr] gap-5 items-start">
          {/* Chart card */}
          <div className="bg-bz-surface rounded-[32px] p-11 border border-bz-border">
            <div className="flex justify-between items-start mb-12">
              <div>
                <h3 className="text-[18px] font-bold text-bz-text mb-1.5">Stock Movement Analytics</h3>
                <p className="text-[13px] text-bz-text-muted">Inbound vs. outbound trends across all warehouses</p>
              </div>
              <span className="px-3 py-1 bg-bz-bg rounded-bz-sm text-[10px] font-bold text-bz-text-muted">FY2024</span>
            </div>
            <div className="relative h-[220px]">
              <svg width="100%" height="100%" viewBox="0 0 800 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M0 160C80 160 130 90 200 100C270 110 300 160 370 140C440 120 490 50 560 70C630 90 680 140 750 120L750 200 0 200Z"
                  fill="var(--bz-accent)"
                  fillOpacity="0.1"
                />
                <path
                  d="M0 160C80 160 130 90 200 100C270 110 300 160 370 140C440 120 490 50 560 70C630 90 680 140 750 120"
                  stroke="var(--bz-text)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M0 130C80 130 130 150 200 140C270 130 310 90 380 110C450 130 500 160 560 150C630 140 700 60 750 80"
                  stroke="var(--bz-text-muted)"
                  strokeDasharray="8 8"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute top-[28%] left-1/2 -translate-x-1/2 bg-bz-surface border border-bz-border px-4 py-2.5 rounded-bz-xl text-center whitespace-nowrap">
                <div className="text-[8px] font-bold text-bz-text-muted uppercase tracking-[0.1em] mb-1">Peak Throughput</div>
                <div className="text-[16px] font-bold text-bz-text">12,480 Units</div>
                <div className="text-[8px] text-bz-text-muted">Zone A · Week 42</div>
              </div>
            </div>
          </div>

          {/* Stat mini-cards */}
          <div className="grid grid-cols-2 gap-3.5">
            {intelStats.map((s) => (
              <div key={s.label} className="bg-bz-bg rounded-[24px] p-5 border border-bz-border">
                <s.Icon className="size-5 text-bz-text" />
                <div className="mt-4">
                  <div className="text-[9px] font-bold uppercase tracking-[0.15em] text-bz-text-muted mb-1">{s.label}</div>
                  <div className="text-[20px] font-bold text-bz-text tracking-[-0.02em]">{s.value}</div>
                  {s.sub && (
                    <div className={`text-[10px] font-bold mt-1 ${s.positive ? "text-green-700" : "text-bz-text-muted"}`}>{s.sub}</div>
                  )}
                  {s.bar !== undefined && (
                    <div className="mt-2.5 h-1 bg-bz-border rounded-full overflow-hidden">
                      <div className="h-full bg-bz-text rounded-full" style={{ width: `${s.bar}%` }} />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}

// ─── CONNECTED SYSTEM ─────────────────────────────────────────────────────────

function ConnectedSystemSection() {
  return (
    <Section tone="dark">
      <Container>
        <SectionHeading
          eyebrow="Seamless Connectivity"
          title={<>Inventory connected directly to<br />purchasing and finance</>}
          tone="light"
          align="center"
          maxWidth={520}
          className="mb-24"
        />
        <div className="flex items-center justify-center flex-wrap">

          {/* Purchasing */}
          <div className="flex-1 max-w-[280px] bg-white/[0.04] p-9 rounded-[36px] border border-white/[0.05]">
            <div className="w-[60px] h-[60px] rounded-bz-xl bg-white/10 flex items-center justify-center mb-6">
              <ShoppingCart className="size-7 text-white/60" />
            </div>
            <h4 className="text-[20px] font-bold text-white mb-3">Purchasing</h4>
            <p className="text-[13px] text-white/50 leading-[1.65] mb-7">
              Auto-generated POs when stock hits reorder thresholds, with full approval routing.
            </p>
            <div className="flex justify-between items-center px-4 py-2 bg-black/30 rounded-bz-lg border border-white/[0.05]">
              <span className="text-[9px] font-bold text-white/50 uppercase">AUTO PO</span>
              <span className="text-[9px] font-bold text-bz-accent">Triggered</span>
            </div>
          </div>

          <div className="w-20 h-px bg-bz-accent/30 flex-shrink-0" />

          {/* Inventory Hub */}
          <div className="flex-shrink-0 flex flex-col items-center gap-4">
            <div className="w-28 h-28 rounded-full bg-bz-accent flex items-center justify-center">
              <Warehouse className="size-[42px] text-bz-text" strokeWidth={2} />
            </div>
            <div className="text-[10px] font-black tracking-[0.3em] text-bz-accent uppercase">Inventory Hub</div>
          </div>

          <div className="w-20 h-px bg-bz-accent/30 flex-shrink-0" />

          {/* Finance */}
          <div className="flex-1 max-w-[280px] bg-white/[0.04] p-9 rounded-[36px] border border-white/[0.05]">
            <div className="w-[60px] h-[60px] rounded-bz-xl bg-white/10 flex items-center justify-center mb-6">
              <DollarSign className="size-7 text-white/60" />
            </div>
            <h4 className="text-[20px] font-bold text-white mb-3">Finance</h4>
            <p className="text-[13px] text-white/50 leading-[1.65] mb-7">
              Real-time stock valuation feeds directly into the general ledger for instant P&L updates.
            </p>
            <div className="flex justify-between items-center px-4 py-2 bg-black/30 rounded-bz-lg border border-white/[0.05]">
              <span className="text-[9px] font-bold text-white/50 uppercase">VALUATION</span>
              <span className="text-[9px] font-bold text-bz-accent">Auto Post</span>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}

// ─── PAGE EXPORT ──────────────────────────────────────────────────────────────

export function InventoryAndWarehousePage() {
  return (
    <>
      <HeroCentered
        badge={<HeroBadge>Inventory & Warehouse Module</HeroBadge>}
        title={<>Real-time inventory control<br />without the chaos</>}
        description="Track every item across all warehouses in real time. Automate replenishment, manage movements, and close every cycle count with complete audit accuracy."
        actions={
          <>
            <Button variant="primary" size="lg" href="/contact" withArrow>Request Demo</Button>
            <Button variant="outline" size="lg">View features</Button>
          </>
        }
        visual={<HeroDashboard />}
      />

      {/* Capabilities */}
      <Section tone="white">
        <Container>
          <SectionHeading
            eyebrow="Core Capabilities"
            title={<>Every warehouse operation,<br />precisely under control</>}
            maxWidth={700}
            className="mb-14"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {CAPABILITIES.map(({ Icon, title, desc }) => (
              <Card key={title} hover="lift" pad="md">
                <IconBadge tone="sage" size="md" className="mb-7">
                  <Icon className="size-5" />
                </IconBadge>
                <h3 className="font-bold text-[16px] text-bz-text mb-2.5">{title}</h3>
                <p className="text-[13px] text-bz-text-muted leading-[1.65]">{desc}</p>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      <TechShowcaseSection />
      <IntelligenceSection />
      <ConnectedSystemSection />

      {/* Impact Metrics */}
      <Section tone="white">
        <Container>
          <SectionHeading
            eyebrow="Efficiency"
            title="Measurable impact on operations"
            align="center"
            className="mb-16"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {METRICS.map((m) => (
              <Card key={m.label} hover="lift" pad="lg" className="text-center">
                <div className="text-[52px] font-black text-bz-text tracking-[-0.04em] mb-3">{m.value}</div>
                <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-bz-text-muted mb-4">{m.label}</div>
                <p className="text-[13px] text-bz-text-muted leading-[1.65]">{m.desc}</p>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      {/* Closing CTA */}
      <Section tone="dark">
        <Container width="narrow">
          <SectionHeading
            title={<>Master your inventory<br /><span className="text-bz-accent">operations today</span></>}
            description="Join 500+ enterprises optimizing their global supply chain with Bizak's precision warehouse management system."
            tone="light"
            align="center"
            maxWidth={580}
            className="mb-10"
          />
          <div className="flex flex-wrap justify-center gap-4">
            <Button variant="accent" size="lg" href="https://system.bizakerp.com/account/self-register" withArrow>
              Start Free Trial
            </Button>
            <Button variant="ghostDark" size="lg" href="/Contact">
              Book a demo
            </Button>
          </div>
        </Container>
      </Section>
    </>
  );
}
