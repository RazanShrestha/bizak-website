import {
  Users,
  CheckCircle,
  FileText,
  ClipboardCheck,
  UsersRound,
  Workflow,
  Contact,
  Activity,
  BarChart3,
  ShieldCheck,
  Link2,
  Home,
  TrendingUp,
  DollarSign,
  Clock,
  Package,
  Landmark,
} from "lucide-react";
import {
  HeroCentered,
  HeroBadge,
  Button,
  Section,
  Container,
  SectionHeading,
  Card,
  IconBadge,
  Eyebrow,
} from "./marketing";

// ─── 1. HERO ─────────────────────────────────────────────────────────────────
function SalesDashboardVisual() {
  const steps = [
    { label: "Lead", active: true, Icon: Users },
    { label: "Qualified", active: true, Icon: CheckCircle },
    { label: "Proposal", active: false, Icon: FileText },
    { label: "Won", active: false, Icon: ClipboardCheck },
  ];

  return (
    <div className="max-w-[1100px] mx-auto">
      <div className="bg-bz-surface rounded-3xl border border-bz-border shadow-[0_25px_60px_-10px_rgba(0,0,0,0.12)] overflow-hidden flex h-auto">
        {/* Sidebar */}
        <div className="hidden md:flex w-[200px] bg-bz-deep flex-shrink-0 p-7 flex-col gap-5">
          {[75, 50, 85, 60].map((w, i) => (
            <div key={i} className="h-3.5 bg-white/10 rounded" style={{ width: `${w}%` }} />
          ))}
        </div>

        {/* Main content */}
        <div className="flex-1 p-6 sm:p-10 bg-bz-bg flex flex-col">
          <div className="grid grid-cols-2 md:grid-cols-3 mb-6 md:mb-10">
            {[
              { label: "Open Leads", value: "142" },
              { label: "Pipeline Value", value: "$84.2k" },
              { label: "Avg. Cycle", value: "4.2 Days" },
            ].map((s, i) => (
              <div key={s.label} className={i > 0 ? "pl-7 border-l border-bz-border ml-7" : ""}>
                <div className="text-[9px] font-bold text-bz-text-muted uppercase tracking-[0.15em] mb-1.5">
                  {s.label}
                </div>
                <div className="text-[28px] sm:text-[36px] font-bold text-bz-text tracking-[-0.03em] tabular-nums">
                  {s.value}
                </div>
              </div>
            ))}
          </div>

          <div className="flex-1 flex flex-col justify-end">
            <div className="flex justify-between items-center mb-6">
              <h4 className="font-bold text-bz-text text-sm">Sales Workflow</h4>
              <span className="bg-bz-accent text-bz-deep text-[9px] font-bold px-2 py-0.5 rounded">LIVE</span>
            </div>
            <div className="relative flex justify-between items-center">
              <div className="absolute left-0 right-0 h-px bg-bz-border top-5 z-0" />
              {steps.map(({ label, active, Icon }) => (
                <div key={label} className="relative z-10 flex flex-col items-center gap-2.5">
                  <div
                    className={
                      active
                        ? "w-10 h-10 rounded-full bg-bz-deep flex items-center justify-center text-white"
                        : "w-10 h-10 rounded-full bg-bz-surface border border-bz-border flex items-center justify-center text-bz-text-muted"
                    }
                  >
                    <Icon size={16} />
                  </div>
                  <span
                    className={
                      active
                        ? "text-[9px] font-bold uppercase text-bz-text"
                        : "text-[9px] font-bold uppercase text-bz-text-muted"
                    }
                  >
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function HeroSection() {
  return (
    <HeroCentered
      badge={<HeroBadge>Sales & CRM</HeroBadge>}
      title={
        <>
          From first lead<br />to final payment.
        </>
      }
      description="Centralize your pipeline, automate approvals, and post every sale straight to the ledger. One system — no re-keying, no spreadsheet reconciliation."
      actions={
        <>
          <Button variant="accent" size="lg" href="/contact" withArrow>
            Request Demo
          </Button>
          <Button variant="outline" size="lg" href="#features">
            View features
          </Button>
        </>
      }
      visual={<SalesDashboardVisual />}
    />
  );
}

// ─── 2. OVERVIEW / FEATURE GRID ───────────────────────────────────────────────
const CAPABILITIES = [
  {
    Icon: UsersRound,
    title: "Lead Management",
    desc: "Centralize lead details, performance ratings, and contact history in a unified view.",
  },
  {
    Icon: Workflow,
    title: "Deal Pipeline",
    desc: "Dynamic deal stages based on probability, department, or project complexity.",
  },
  {
    Icon: Contact,
    title: "Customer 360",
    desc: "Instant customer insights with 3-way matching of communication, deals, and history.",
  },
  {
    Icon: FileText,
    title: "Quotation & Orders",
    desc: "Direct quote generation for real-time financial accuracy and automated contract creation.",
  },
  {
    Icon: Activity,
    title: "Activity Tracking",
    desc: "Deal status updates automatically upon interaction receipt or stage movement.",
  },
  {
    Icon: BarChart3,
    title: "Sales Reporting",
    desc: "Deep insights into conversion patterns and revenue growth opportunities.",
  },
];

function OverviewSection() {
  return (
    <Section tone="white" id="features">
      <Container>
        <SectionHeading
          eyebrow="Overview"
          title={
            <>
              A structured sales system<br />built for operational control
            </>
          }
          maxWidth={700}
          className="mb-14"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {CAPABILITIES.map(({ Icon, title, desc }) => (
            <Card key={title} hover="lift">
              <IconBadge size="md" tone="sage" className="mb-7">
                <Icon className="size-5" />
              </IconBadge>
              <h3 className="text-base font-bold text-bz-text mb-2.5">{title}</h3>
              <p className="text-[13px] text-bz-text-muted leading-[1.65]">{desc}</p>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}

// ─── 3. DARK TECHNICAL SHOWCASE ───────────────────────────────────────────────
function TechShowcaseSection() {
  return (
    <Section tone="deeper">
      <Container>
        <SectionHeading
          eyebrow="Technical Showcase"
          title={
            <>
              High-fidelity tools for the<br />modern sales team
            </>
          }
          tone="light"
          maxWidth={700}
          className="mb-16"
        />

        {/* Top row */}
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-5 mb-5">
          {/* Pipeline Intelligence */}
          <div className="bg-white/[0.04] rounded-3xl p-8 sm:p-11 border border-white/5 relative overflow-hidden">
            <ShieldCheck className="size-[22px] text-white/30" strokeWidth={1.8} />
            <h3 className="text-[22px] font-bold text-white mt-4 mb-2.5">Pipeline Intelligence</h3>
            <p className="text-[13px] text-white/50 max-w-[380px] leading-[1.65] mb-10">
              Maintain a high-performance sales engine with automated win-probability and real-time status tracking.
            </p>
            <div className="bg-white/[0.06] rounded-[18px] p-6 border border-white/10 max-w-[380px]">
              <div className="flex items-center gap-3.5 mb-5">
                <div className="w-12 h-12 rounded-[14px] bg-bz-accent/10 flex items-center justify-center font-bold text-bz-accent text-sm">
                  AX
                </div>
                <div>
                  <div className="text-[13px] font-bold text-white">Axeon Logistics</div>
                  <div className="text-[10px] text-white/50 mt-0.5">• Active Prospect • Enterprise Tier</div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/5">
                {[
                  { label: "Win Probability", value: "92.4%", accent: true },
                  { label: "Lead Grade", value: "A+", accent: false },
                  { label: "Touchpoints", value: "12 Total", accent: false },
                ].map((m) => (
                  <div key={m.label}>
                    <div className="text-[9px] text-white/50 uppercase tracking-[0.05em] mb-1">
                      {m.label}
                    </div>
                    <div className={`text-[13px] font-bold ${m.accent ? "text-bz-accent" : "text-white"}`}>
                      {m.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Smart Follow-ups */}
          <div className="bg-white/[0.04] rounded-3xl p-8 sm:p-9 border border-white/5 flex flex-col">
            <Link2 className="size-[22px] text-white/30" strokeWidth={1.8} />
            <h3 className="text-[22px] font-bold text-white mt-4 mb-2.5">Smart Follow-ups</h3>
            <p className="text-[13px] text-white/50 leading-[1.65] mb-8 flex-1">
              Dynamic multi-level engagement chains with intelligent conditional routing logic.
            </p>
            <div className="flex flex-col gap-2.5">
              {[
                { label: "Sequence Approval", dot: "green" as const, opacity: "opacity-100" },
                { label: "Review Pipeline > $50k", dot: "accent" as const, opacity: "opacity-100" },
                { label: "Engagement Log", dot: "none" as const, opacity: "opacity-40" },
              ].map((row) => (
                <div
                  key={row.label}
                  className={`flex items-center justify-between bg-white/[0.03] px-4 py-3.5 rounded-xl border border-white/5 ${row.opacity}`}
                >
                  <span className="text-[10px] font-bold text-white/60">{row.label}</span>
                  {row.dot === "green" && <div className="w-2 h-2 rounded-full bg-emerald-500" />}
                  {row.dot === "accent" && <div className="w-2 h-2 rounded-full bg-bz-accent" />}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-1 md:grid-cols-[5fr_7fr] gap-5">
          {/* Quotation Builder */}
          <div className="bg-white/[0.04] rounded-3xl p-8 sm:p-9 border border-white/5">
            <FileText className="size-[22px] text-white/30" strokeWidth={1.8} />
            <h3 className="text-[20px] font-bold text-white mt-4 mb-2.5">Quotation Builder</h3>
            <p className="text-[13px] text-white/50 leading-[1.65] mb-9">
              High-fidelity quote generation with precision formatting and real-time status updates.
            </p>
            <div className="bg-white/[0.03] p-5 rounded-[14px] border border-white/5">
              <div className="flex justify-between items-center mb-3.5">
                <span className="text-[9px] text-white/60 font-bold uppercase tracking-[0.1em]">
                  QT-2024-8821
                </span>
                <span className="text-[8px] font-bold text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded uppercase">
                  Pending
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <div className="h-1.5 bg-white/10 rounded-full w-full" />
                <div className="h-1.5 bg-white/10 rounded-full w-3/4" />
              </div>
            </div>
          </div>

          {/* Customer Insights */}
          <div className="bg-white/[0.04] rounded-3xl p-8 sm:p-9 border border-white/5 relative">
            <div className="absolute top-9 right-9 text-right">
              <div className="text-[9px] font-bold text-white/50 uppercase tracking-[0.1em] mb-1">
                Audit Score
              </div>
              <div className="text-[26px] font-black text-bz-accent">100%</div>
            </div>
            <Home className="size-[22px] text-white/30" strokeWidth={1.8} />
            <h3 className="text-[20px] font-bold text-white mt-4 mb-2.5">Customer Insights</h3>
            <p className="text-[13px] text-white/50 leading-[1.65] max-w-[340px] mb-9">
              Direct ledger posting and automated 3-way matching for absolute financial integrity.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse min-w-[420px]">
                <thead>
                  <tr className="border-b border-white/5">
                    {["Digital Trail", "Source Node", "State"].map((h, i) => (
                      <th
                        key={h}
                        className={`text-[9px] font-bold uppercase tracking-[0.1em] text-white/50 pb-3 ${
                          i === 2 ? "text-right" : "text-left"
                        }`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { trail: "Purchase_Order", ref: "#PO-2024-8821" },
                    { trail: "Rec_Warehouse", ref: "#GRN-990-22" },
                    { trail: "Vendor_Invoice", ref: "#INV-AX-402" },
                  ].map((row) => (
                    <tr key={row.trail} className="border-b border-white/[0.04]">
                      <td className="text-[11px] font-semibold text-white py-3">{row.trail}</td>
                      <td className="text-[11px] text-white/60 py-3 tracking-[0.04em]">{row.ref}</td>
                      <td className="py-3 text-right">
                        <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-emerald-500/15">
                          <span className="w-[5px] h-[5px] rounded-full bg-emerald-500" />
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}

// ─── 4. REPORTING / INTELLIGENCE ──────────────────────────────────────────────
function ReportingSection() {
  const stats = [
    {
      Icon: TrendingUp,
      label: "Win Rate",
      value: "64.2%",
      sub: "↑ 4.2%",
      subClass: "text-emerald-700",
    },
    {
      Icon: DollarSign,
      label: "Avg Deal",
      value: "$428k",
      sub: "Target Optimized",
      subClass: "text-bz-text-muted",
    },
    {
      Icon: Clock,
      label: "Cycle Time",
      value: "3.2d",
      sub: "↓ 12%",
      subClass: "text-rose-700",
    },
    {
      Icon: ClipboardCheck,
      label: "Quota Util.",
      value: "74%",
      bar: 74,
    },
  ];

  return (
    <Section tone="white">
      <Container>
        <SectionHeading
          eyebrow="Reporting"
          title="Sales Intelligence"
          align="center"
          className="mb-16"
        />

        <div className="grid grid-cols-1 lg:grid-cols-[3fr_1fr] gap-5 items-start">
          {/* Chart card */}
          <div className="bg-bz-surface p-8 sm:p-11 rounded-[32px] border border-bz-border relative overflow-hidden">
            <div className="flex justify-between items-start mb-12">
              <div>
                <h3 className="text-lg font-bold text-bz-text mb-1.5">Executive Revenue Analytics</h3>
                <p className="text-[13px] text-bz-text-muted">Consolidated global entity performance</p>
              </div>
              <span className="px-3 py-1 bg-bz-bg rounded-md text-[10px] font-bold text-bz-text-muted">
                FY2024
              </span>
            </div>

            <div className="relative h-[220px]">
              <svg width="100%" height="100%" viewBox="0 0 800 200" fill="none" preserveAspectRatio="none">
                <path
                  d="M0 150C50 150 100 80 150 100C200 120 250 180 300 160C350 140 400 40 450 60C500 80 550 140 600 120C650 100 700 20 750 40"
                  stroke="var(--bz-deep)"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M0 120C50 120 100 150 150 130C200 110 250 80 300 100C350 120 400 160 450 140C500 120 550 40 600 60"
                  stroke="var(--bz-text-muted)"
                  strokeDasharray="8 8"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute top-[35%] left-1/2 -translate-x-1/2 bg-bz-surface border border-bz-border shadow-[0_4px_16px_rgba(0,0,0,0.1)] px-4 py-2.5 rounded-[14px] text-center whitespace-nowrap">
                <div className="text-[8px] font-bold text-bz-text-muted uppercase tracking-[0.1em] mb-1">
                  Peak Rev. Identified
                </div>
                <div className="text-base font-bold text-bz-text">$1.24M</div>
                <div className="text-[8px] text-bz-text-muted">Vendor: Asia Manufacturing</div>
              </div>
            </div>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 gap-3.5">
            {stats.map(({ Icon, label, value, sub, subClass, bar }) => (
              <div
                key={label}
                className="bg-bz-bg p-5 rounded-[24px] border border-bz-border"
              >
                <Icon className="size-[22px] text-bz-text" strokeWidth={1.8} />
                <div className="mt-5">
                  <div className="text-[9px] font-bold uppercase tracking-[0.15em] text-bz-text-muted mb-1">
                    {label}
                  </div>
                  <div className="text-[22px] font-bold text-bz-text tracking-[-0.02em]">{value}</div>
                  {sub && <div className={`text-[10px] font-bold mt-1 ${subClass}`}>{sub}</div>}
                  {bar !== undefined && (
                    <div className="mt-2.5 h-1 bg-bz-border rounded-full overflow-hidden">
                      <div
                        className="h-full bg-bz-deep rounded-full"
                        style={{ width: `${bar}%` }}
                      />
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

// ─── 5. CONNECTIVITY ──────────────────────────────────────────────────────────
function ConnectivitySection() {
  return (
    <Section tone="deeper">
      <Container>
        <div className="text-center mb-20">
          <Eyebrow tone="sage" className="mb-5">
            Seamless Connectivity
          </Eyebrow>
          <h2 className="text-[clamp(28px,4vw,44px)] font-semibold text-white tracking-[-0.02em] leading-[1.2] max-w-[520px] mx-auto">
            Sales connected directly to inventory and finance
          </h2>
        </div>

        <div className="flex flex-col items-center gap-8 md:flex-row md:gap-0 md:flex-wrap md:justify-center">
          {/* Inventory node */}
          <div className="flex-1 max-w-[280px] bg-white/[0.04] p-9 rounded-[36px] border border-white/5 text-left">
            <IconBadge size="lg" tone="darkSurface" className="mb-6">
              <Package className="size-7" strokeWidth={1.8} />
            </IconBadge>
            <h4 className="text-xl font-bold text-white mb-3">Inventory</h4>
            <p className="text-[13px] text-white/50 leading-[1.65] mb-7">
              Real-time stock reconciliation and automated replenishment alerts.
            </p>
            <div className="flex justify-between items-center px-4 py-2 bg-black rounded-[10px] border border-white/5">
              <span className="text-[9px] font-bold text-white/50 uppercase">Stock Update</span>
              <span className="text-[9px] font-bold text-bz-accent">+250 units</span>
            </div>
          </div>

          {/* Connector */}
          <div className="hidden md:block w-20 h-px bg-bz-accent/30 flex-shrink-0" />

          {/* Sales Hub */}
          <div className="relative flex-shrink-0">
            <div className="relative z-10 w-[120px] h-[120px] rounded-full bg-bz-accent flex items-center justify-center shadow-[0_0_80px_rgba(199,255,53,0.3)]">
              <Link2 className="size-10 text-bz-deep" strokeWidth={2} />
            </div>
            <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 whitespace-nowrap text-center">
              <div className="text-[10px] font-black tracking-[0.3em] text-bz-accent uppercase">
                Sales Hub
              </div>
            </div>
          </div>

          {/* Connector */}
          <div className="hidden md:block w-20 h-px bg-bz-accent/30 flex-shrink-0" />

          {/* Finance node */}
          <div className="flex-1 max-w-[280px] bg-white/[0.04] p-9 rounded-[36px] border border-white/5 text-left">
            <IconBadge size="lg" tone="darkSurface" className="mb-6">
              <Landmark className="size-7" strokeWidth={1.8} />
            </IconBadge>
            <h4 className="text-xl font-bold text-white mb-3">Finance</h4>
            <p className="text-[13px] text-white/50 leading-[1.65] mb-7">
              Direct ledger posting and automated accounts payable.
            </p>
            <div className="flex justify-between items-center px-4 py-2 bg-black rounded-[10px] border border-white/5">
              <span className="text-[9px] font-bold text-white/50 uppercase">Ledger Entry</span>
              <span className="text-[9px] font-bold text-bz-accent">Auto Match</span>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}

// ─── 6. IMPACT METRICS ────────────────────────────────────────────────────────
const METRICS = [
  {
    value: "30%",
    label: "Faster Closure",
    desc: "Automated follow-ups and approval routing reduce sales cycle times significantly.",
  },
  {
    value: "100%",
    label: "Visibility",
    desc: "Every interaction is logged with a full audit trail for effortless regulatory reporting.",
  },
  {
    value: "25%",
    label: "Higher Conversion",
    desc: "Leverage data-driven negotiation insights to lower your average cost per lead.",
  },
];

function MetricsSection() {
  return (
    <Section tone="white">
      <Container>
        <SectionHeading
          eyebrow="Efficiency"
          title="Measurable impact on operations"
          align="center"
          className="mb-16"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {METRICS.map((m) => (
            <Card key={m.label} hover="lift" className="text-center" pad="lg">
              <div className="text-[52px] font-black text-bz-text mb-3 tracking-[-0.04em] leading-none">
                {m.value}
              </div>
              <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-bz-text-muted mb-4">
                {m.label}
              </div>
              <p className="text-[13px] text-bz-text-muted leading-[1.65]">{m.desc}</p>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}

// ─── 7. CTA SECTION ──────────────────────────────────────────────────────────
function CTASection() {
  return (
    <Section tone="dark">
      <Container width="narrow">
        <div className="text-center max-w-[720px] mx-auto">
          <SectionHeading
            title={
              <>
                Experience the future of{" "}
                <span className="text-bz-accent">business operations</span>
              </>
            }
            description="Join 50,000+ companies scaling with Bizak. Start your 14-day free trial today."
            tone="light"
            align="center"
            maxWidth={720}
          />
          <div className="mt-10 flex gap-4 justify-center flex-wrap">
            <Button
              variant="accent"
              size="lg"
              href="https://system.bizakerp.com/account/self-register"
              withArrow
            >
              Start Free Trial
            </Button>
            <Button variant="ghostDark" size="lg" href="/contact">
              Book a demo
            </Button>
          </div>
        </div>
      </Container>
    </Section>
  );
}

// ─── PAGE EXPORT ──────────────────────────────────────────────────────────────
export function SalesAndCrmPage() {
  return (
    <>
      <HeroSection />
      <OverviewSection />
      <TechShowcaseSection />
      <ReportingSection />
      <ConnectivitySection />
      <MetricsSection />
      <CTASection />
    </>
  );
}
