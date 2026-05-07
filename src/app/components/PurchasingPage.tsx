import {
  Section, Container, SectionHeading, Button, Card,
  IconBadge, HeroBadge, HeroCentered,
} from "./marketing";
import {
  Building2, Network, FileText, DollarSign, Package, BarChart3,
  ChevronRight, Warehouse, TrendingDown, Clock,
} from "lucide-react";

// ─── DATA ─────────────────────────────────────────────────────────────────────

const CAPABILITIES = [
  { Icon: Building2,  title: "Vendor Management",  desc: "Centralize supplier details, performance ratings, and contract history in a unified vendor master." },
  { Icon: Network,    title: "Custom Workflows",   desc: "Dynamic multi-level approval chains based on amount, department, or project code." },
  { Icon: FileText,   title: "Automated Billing",  desc: "Convert POs to invoices instantly with 3-way matching for absolute financial integrity." },
  { Icon: DollarSign, title: "Finance Integration",desc: "Direct ledger posting for real-time financial accuracy and zero manual journal entries." },
  { Icon: Package,    title: "Inventory Sync",     desc: "Stock levels update automatically upon purchase receipt confirmation — no re-keying." },
  { Icon: BarChart3,  title: "Spend Analysis",     desc: "Deep insights into purchasing patterns and cost-saving opportunities across vendors." },
];

const METRICS = [
  { value: "40%",  label: "Faster Procurement", desc: "Automated RFQs and approval routing reduce manual cycle times significantly." },
  { value: "12%",  label: "Lower Costs",         desc: "Data-driven negotiation insights lower your average cost per unit." },
  { value: "100%", label: "Audit Compliance",    desc: "Every transaction logged with a full digital trail for effortless regulatory reporting." },
];

// ─── HERO VISUAL ──────────────────────────────────────────────────────────────

function HeroDashboard() {
  const stats = [
    { label: "Open POs",        value: "142" },
    { label: "Vendor Balances", value: "$84.2k" },
    { label: "Avg. Cycle",      value: "4.2 Days" },
  ];
  const steps = [
    { label: "RFQ",       active: true  },
    { label: "Approval",  active: true  },
    { label: "PO Issued", active: true  },
    { label: "Delivery",  active: false },
  ];
  return (
    <div className="max-w-[960px] mx-auto rounded-bz-2xl border border-bz-border overflow-hidden">
      <div className="bg-bz-deep px-8 py-4 flex items-center justify-between">
        <div className="flex gap-1.5">
          {["#ff5f57", "#ffbd2e", "#28c840"].map(c => (
            <div key={c} className="w-3 h-3 rounded-full" style={{ background: c }} />
          ))}
        </div>
        <span className="text-[11px] font-bold text-white/40 tracking-[0.1em]">BIZAK · PURCHASING</span>
        <div className="w-14" />
      </div>

      <div className="grid grid-cols-3 border-b border-bz-border bg-bz-surface">
        {stats.map((s, i) => (
          <div key={s.label} className={`px-4 sm:px-8 py-5 sm:py-7 text-left${i > 0 ? " border-l border-bz-border" : ""}`}>
            <div className="text-[9px] font-bold uppercase tracking-[0.15em] text-bz-text-muted mb-2">{s.label}</div>
            <div className="text-[32px] font-extrabold text-bz-text tracking-[-0.03em] leading-none">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="px-10 py-10 bg-bz-bg">
        <div className="flex items-center justify-between mb-7">
          <span className="text-[13px] font-bold text-bz-text">Procurement Workflow</span>
          <span className="px-2 py-0.5 bg-bz-accent/20 rounded text-[9px] font-bold text-bz-text">LIVE</span>
        </div>
        <div className="relative flex items-start justify-around">
          <div className="absolute top-5 left-[8%] right-[8%] h-px bg-bz-border" />
          {steps.map(({ label, active }, i) => (
            <div key={i} className="flex flex-col items-center gap-2.5 z-10">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                active ? "bg-bz-sage border-bz-sage" : "bg-bz-surface border-bz-border"
              }`}>
                <div className={`w-2 h-2 rounded-full ${active ? "bg-white" : "bg-bz-sage"}`} />
              </div>
              <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-bz-text">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── TECHNICAL SHOWCASE ───────────────────────────────────────────────────────

function ApprovalRow({ label, active = false, muted = false }: { label: string; active?: boolean; muted?: boolean }) {
  return (
    <div className={`flex items-center gap-3.5 p-4 rounded-bz-xl border ${
      active ? "bg-white/[0.04] border-white/[0.15]" : "bg-white/[0.03] border-white/[0.08]"
    } ${muted ? "opacity-30" : ""}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
        active ? "bg-bz-accent/20" : "bg-bz-sage/20"
      }`}>
        <div className={`w-2 h-2 rounded-full ${active ? "bg-bz-accent" : "bg-bz-sage"}`} />
      </div>
      <span className={`flex-1 text-[12px] font-bold ${active ? "text-bz-accent" : "text-white"}`}>{label}</span>
      <ChevronRight className={`size-3 ${active ? "text-bz-accent" : "text-white/20"}`} />
    </div>
  );
}

function TechShowcaseSection() {
  const trail = [
    { type: "PURCHASE_ORDER", id: "#PO-2024-8821" },
    { type: "REC_WAREHOUSE",  id: "#GRN-990-22"   },
    { type: "VENDOR_INVOICE", id: "#INV-AX-402"   },
  ];
  return (
    <Section tone="dark">
      <Container>
        <SectionHeading
          eyebrow="Technical Showcase"
          title={<>High-fidelity tools for the<br />modern procurement team</>}
          tone="light"
          maxWidth={700}
          className="mb-16"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* Vendor Management — tall left */}
          <div className="md:row-span-2 bg-white/[0.02] rounded-[28px] border border-white/[0.05] p-11 flex flex-col justify-between min-h-[500px]">
            <div>
              <Building2 className="size-5 text-bz-sage mb-5" />
              <h3 className="text-[28px] font-bold text-white mb-3">Vendor Management</h3>
              <p className="text-[14px] text-white/40 leading-[1.65] max-w-[360px]">
                Maintain a high-performance supplier network with automated ratings and real-time status tracking.
              </p>
            </div>
            <div className="bg-white/[0.03] rounded-[24px] border border-white/[0.08] p-6 mt-8">
              <div className="flex items-center gap-5 mb-5">
                <div className="relative">
                  <div className="w-14 h-14 rounded-full bg-bz-sage/20 flex items-center justify-center">
                    <span className="text-[18px] font-bold text-bz-sage">AX</span>
                  </div>
                  <div className="absolute top-0 right-0 w-3.5 h-3.5 rounded-full bg-bz-accent border-2 border-bz-deep" />
                </div>
                <div>
                  <div className="text-[16px] font-bold text-white">Axeon Logistics</div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-bz-accent" />
                    <span className="text-[11px] text-white/30">Active Supplier · Enterprise Tier</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/[0.05]">
                {[{ label: "On-Time", value: "99.2%" }, { label: "Quality", value: "A+" }, { label: "Contracts", value: "12 Active" }].map(m => (
                  <div key={m.label}>
                    <div className="text-[9px] font-bold text-bz-sage uppercase tracking-[0.05em] mb-1.5">{m.label}</div>
                    <div className="text-[20px] font-bold text-white">{m.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Procurement Control — top right */}
          <div className="bg-white/[0.04] rounded-[28px] border border-white/[0.05] p-8">
            <Network className="size-5 text-bz-sage mb-4" />
            <h3 className="text-[22px] font-bold text-white mb-2.5">Procurement Control</h3>
            <p className="text-[13px] text-white/40 leading-[1.65] mb-8 max-w-[380px]">
              Dynamic multi-level approval chains with intelligent conditional routing logic.
            </p>
            <div className="flex flex-col gap-3.5">
              <ApprovalRow label="Manager Approval" />
              <ApprovalRow label="CFO Review > $50k" active />
              <ApprovalRow label="Compliance Log" muted />
            </div>
          </div>

          {/* Financial Integration — bottom right */}
          <div className="bg-white/[0.04] rounded-[28px] border border-white/[0.05] p-8">
            <div className="flex items-start justify-between mb-8">
              <div>
                <DollarSign className="size-5 text-bz-sage mb-4" />
                <h3 className="text-[22px] font-bold text-white mb-2.5">Financial Integration</h3>
                <p className="text-[13px] text-white/40 leading-[1.65] max-w-[240px]">
                  Direct ledger posting and automated 3-way matching for absolute financial integrity.
                </p>
              </div>
              <div className="bg-white/[0.03] border border-white/[0.08] rounded-bz-xl p-4 text-left flex-shrink-0 ml-4">
                <div className="text-[10px] font-bold text-bz-accent mb-1">Audit Score</div>
                <div className="text-[28px] font-bold text-white">100%</div>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex gap-4 px-2 mb-1">
                {["DIGITAL TRAIL", "SOURCE NODE", ""].map((h, i) => (
                  <span key={i} className={`text-[9px] font-bold text-white/35 uppercase tracking-[0.06em] ${i === 1 ? "flex-1" : i === 0 ? "w-[90px]" : "w-8"}`}>{h}</span>
                ))}
              </div>
              {trail.map(r => (
                <div key={r.id} className="flex items-center gap-4 px-3 py-2.5 bg-white/[0.03] rounded-full border border-white/[0.08]">
                  <span className="text-[9px] font-bold text-bz-sage w-[90px] flex-shrink-0">{r.type}</span>
                  <span className="flex-1 text-[13px] text-white/90">{r.id}</span>
                  <ChevronRight className="size-3 text-bz-accent flex-shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}

// ─── PROCUREMENT INTELLIGENCE ─────────────────────────────────────────────────

function IntelligenceSection() {
  const cards = [
    { Icon: DollarSign,   label: "Vendor Spend",  value: "$428k", sub: "−4.2%",           pos: true  },
    { Icon: TrendingDown, label: "Cost Variance",  value: "0.82%", sub: "Target Optimized", pos: false },
    { Icon: Clock,        label: "Cycle Time",     value: "3.2d",  sub: "−12%",            pos: true  },
    { Icon: BarChart3,    label: "Budget Util.",   value: "74%",   bar: 74 },
  ];
  return (
    <Section tone="light">
      <Container>
        <SectionHeading eyebrow="Reporting" title="Procurement Intelligence" align="center" className="mb-16" />
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
          <div className="flex-1 bg-bz-surface rounded-[32px] border border-bz-border p-10">
            <div className="flex items-start justify-between mb-8">
              <div>
                <h3 className="text-[18px] font-bold text-bz-text mb-1">Executive Spend Analytics</h3>
                <p className="text-[13px] text-bz-text-muted">Consolidated global entity performance</p>
              </div>
              <span className="px-3 py-1 bg-bz-bg rounded-bz-sm text-[10px] font-bold text-bz-text-muted">FY2024</span>
            </div>
            <div className="relative h-[240px]">
              <svg viewBox="0 0 744 280" fill="none" className="w-full h-full" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="pGrad" x1="0" x2="0" y1="0" y2="1">
                    <stop stopColor="var(--bz-sage)" stopOpacity="0.18" />
                    <stop offset="1" stopColor="var(--bz-sage)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d="M0 220C80 220 150 140 220 150C290 160 330 220 400 190C470 160 530 70 600 90C670 110 700 160 744 140L744 280 0 280Z" fill="url(#pGrad)" />
                <path d="M0 220C80 220 150 140 220 150C290 160 330 220 400 190C470 160 530 70 600 90C670 110 700 160 744 140" stroke="var(--bz-sage)" strokeLinecap="round" strokeWidth="9" />
                <path d="M0 180C80 180 140 200 220 185C290 170 330 130 400 155C470 180 530 210 600 195C660 180 700 100 744 120" stroke="var(--bz-text-muted)" strokeDasharray="18 18" strokeOpacity="0.35" strokeWidth="5" />
              </svg>
              <div className="absolute top-[20%] right-[18%] bg-bz-surface border border-bz-border rounded-bz-xl p-4 shadow-lg">
                <div className="text-[9px] font-bold text-bz-sage uppercase tracking-[0.05em] mb-1">Peak Spend</div>
                <div className="text-[18px] font-bold text-bz-text mb-0.5">$1.24M</div>
                <div className="text-[9px] text-bz-text-muted">Vendor: Axis Mfg</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full lg:w-[360px] lg:flex-shrink-0">
            {cards.map((c, i) => (
              <div key={i} className="bg-bz-bg rounded-[22px] border border-bz-border p-6 flex flex-col justify-between min-h-[140px]">
                <c.Icon className="size-5 text-bz-text-muted" />
                <div className="mt-4">
                  <div className="text-[9px] font-bold text-bz-text-muted uppercase tracking-[0.1em] mb-1">{c.label}</div>
                  <div className="text-[22px] font-bold text-bz-text mb-1">{c.value}</div>
                  {c.bar !== undefined ? (
                    <div className="h-1.5 bg-bz-border rounded-full overflow-hidden">
                      <div className="h-full bg-bz-sage rounded-full" style={{ width: `${c.bar}%` }} />
                    </div>
                  ) : (
                    <div className={`text-[10px] font-bold ${c.pos ? "text-green-700" : "text-bz-text-muted"}`}>{c.sub}</div>
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

// ─── CONNECTIVITY ─────────────────────────────────────────────────────────────

function ConnectivitySection() {
  return (
    <Section tone="dark">
      <Container>
        <SectionHeading
          eyebrow="Seamless Connectivity"
          title={<>Purchasing connected directly<br />to inventory and finance</>}
          tone="light"
          align="center"
          maxWidth={520}
          className="mb-24"
        />
        <div className="flex flex-col items-center gap-6 md:flex-row md:gap-0 md:flex-wrap md:justify-center">
          <div className="flex-1 max-w-[280px] bg-white/[0.04] p-9 rounded-[36px] border border-white/[0.05]">
            <div className="w-14 h-14 rounded-bz-xl bg-white/10 flex items-center justify-center mb-6">
              <Warehouse className="size-7 text-white/60" />
            </div>
            <h4 className="text-[20px] font-bold text-white mb-3">Inventory</h4>
            <p className="text-[13px] text-white/50 leading-[1.65] mb-7">
              Real-time stock reconciliation and automated replenishment alerts on every receipt.
            </p>
            <div className="flex justify-between items-center px-4 py-2 bg-black/30 rounded-bz-lg border border-white/[0.05]">
              <span className="text-[9px] font-bold text-white/50 uppercase">STOCK UPDATE</span>
              <span className="text-[9px] font-bold text-bz-accent">+250 Units</span>
            </div>
          </div>

          <div className="hidden md:block w-16 h-px bg-bz-accent/30 flex-shrink-0" />

          <div className="flex-shrink-0 flex flex-col items-center gap-4">
            <div className="w-28 h-28 rounded-full bg-bz-accent flex items-center justify-center">
              <Package className="size-10 text-bz-text" strokeWidth={1.8} />
            </div>
            <div className="text-[10px] font-black tracking-[0.3em] text-bz-accent uppercase">Purchasing Hub</div>
          </div>

          <div className="hidden md:block w-16 h-px bg-bz-accent/30 flex-shrink-0" />

          <div className="flex-1 max-w-[280px] bg-white/[0.04] p-9 rounded-[36px] border border-white/[0.05]">
            <div className="w-14 h-14 rounded-bz-xl bg-white/10 flex items-center justify-center mb-6">
              <DollarSign className="size-7 text-white/60" />
            </div>
            <h4 className="text-[20px] font-bold text-white mb-3">Finance</h4>
            <p className="text-[13px] text-white/50 leading-[1.65] mb-7">
              Direct general ledger posting and automated accounts payable on every approved PO.
            </p>
            <div className="flex justify-between items-center px-4 py-2 bg-black/30 rounded-bz-lg border border-white/[0.05]">
              <span className="text-[9px] font-bold text-white/50 uppercase">LEDGER ENTRY</span>
              <span className="text-[9px] font-bold text-bz-accent">Auto-Match</span>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}

// ─── PAGE EXPORT ──────────────────────────────────────────────────────────────

export function PurchasingPage() {
  return (
    <>
      <HeroCentered
        badge={<HeroBadge>Purchasing Module</HeroBadge>}
        title={<>Control purchasing and<br />vendor relationships<br />with precision</>}
        description="Streamline your procurement lifecycle from RFQ to final payment. Centralize vendor communication and automate approval workflows in one unified system."
        actions={
          <>
            <Button variant="accent" size="lg" href="/contact" withArrow>Request Demo</Button>
            <Button variant="outline" size="lg">View features</Button>
          </>
        }
        visual={<HeroDashboard />}
      />

      <Section tone="white">
        <Container>
          <SectionHeading
            eyebrow="Core Capabilities"
            title={<>A structured procurement system<br />built for operational control</>}
            maxWidth={700}
            className="mb-14"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {CAPABILITIES.map(({ Icon, title, desc }) => (
              <Card key={title} hover="lift" pad="md">
                <IconBadge tone="sage" size="md" className="mb-6">
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
      <ConnectivitySection />

      <Section tone="white">
        <Container>
          <SectionHeading
            eyebrow="Efficiency"
            title="Measurable impact on operations"
            align="center"
            className="mb-16"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {METRICS.map(m => (
              <Card key={m.label} hover="lift" pad="lg" className="text-center">
                <div className="text-[52px] font-black text-bz-text tracking-[-0.04em] mb-3">{m.value}</div>
                <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-bz-text-muted mb-4">{m.label}</div>
                <p className="text-[13px] text-bz-text-muted leading-[1.65]">{m.desc}</p>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      <Section tone="dark">
        <Container width="narrow">
          <SectionHeading
            title={<>Take full control of<br />your procurement operations</>}
            description="Join 50,000+ companies running their purchasing on Bizak — from RFQ to receipt, all in one system."
            tone="light"
            align="center"
            maxWidth={580}
            className="mb-10"
          />
          <div className="flex flex-wrap justify-center gap-4">
            <Button variant="accent" size="lg" href="https://system.bizakerp.com/account/self-register" withArrow>
              Start Free Trial
            </Button>
            <Button variant="ghostDark" size="lg" href="/contact">
              Book a Demo
            </Button>
          </div>
        </Container>
      </Section>
    </>
  );
}
