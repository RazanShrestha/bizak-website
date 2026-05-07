import "../../styles/style.css";
import { Header } from "./Header";
import { Footer } from "./Footer";
import {
  Section,
  Container,
  SectionHeading,
  Button,
  Card,
  IconBadge,
  HeroBadge,
  HeroCentered,
  Stat,
} from "./marketing";
import {
  Zap,
  SlidersHorizontal,
  Eye,
  Calendar,
  BarChart2,
  Layers,
  Download,
  RefreshCw,
  Bell,
  Share2,
  Database,
  TrendingUp,
  CheckCircle,
  FileSpreadsheet,
} from "lucide-react";

// ─── DATA ──────────────────────────────────────────────────────────────────────

const KPI_DATA = [
  { label: "Total Revenue", value: "$2.84M", delta: "+12.4%" },
  { label: "Net Margin", value: "18.4%", delta: "+2.1pp" },
  { label: "Active Orders", value: "2,841", delta: "+8.7%" },
  { label: "System Uptime", value: "99.2%", delta: "SLA Met" },
];

const FEATURES = [
  {
    Icon: Zap,
    title: "Real-time KPIs",
    desc: "Live metrics that update as transactions occur — no manual refresh, no lag, no guesswork.",
  },
  {
    Icon: SlidersHorizontal,
    title: "Custom Report Builder",
    desc: "Drag-and-drop builder with conditional filters, custom groupings, and calculated columns.",
  },
  {
    Icon: Eye,
    title: "Role-based Views",
    desc: "Every team member sees exactly the data relevant to their role — nothing beyond their scope.",
  },
  {
    Icon: Calendar,
    title: "Scheduled Exports",
    desc: "Auto-deliver reports to any stakeholder by email on a daily, weekly, or custom schedule.",
  },
  {
    Icon: BarChart2,
    title: "Drill-down Analysis",
    desc: "Click any KPI to trace it back to the originating transaction — a full audit-ready chain.",
  },
  {
    Icon: Layers,
    title: "Multi-entity Reporting",
    desc: "Consolidated and per-entity reports across all branches and subsidiaries in one click.",
  },
];

const CHECK_ITEMS = [
  {
    title: "Executive Summary View",
    desc: "Boardroom-ready P&L, revenue trend, and forecast at a glance.",
  },
  {
    title: "Operations Dashboard",
    desc: "Live inventory levels, order pipeline, and fulfillment velocity.",
  },
  {
    title: "Finance Dashboard",
    desc: "AP/AR aging, cash position, and budget vs. actual by cost center.",
  },
  {
    title: "Custom Workspace",
    desc: "Pin the KPIs that matter to your role — drag, resize, personalize.",
  },
];

const TREND_ROWS = [
  { period: "Q2 2024", rev: "$680k", delta: "+9.2%" },
  { period: "Q3 2024", rev: "$812k", delta: "+19.4%" },
  { period: "Q4 2024", rev: "$1.01M", delta: "+24.4%" },
];

const REPORT_TYPES = [
  { abbr: "P&L", sub: "Income" },
  { abbr: "BS", sub: "Balance Sheet" },
  { abbr: "CF", sub: "Cash Flow" },
  { abbr: "AR", sub: "Aging Report" },
  { abbr: "BvA", sub: "Budget vs Actual" },
  { abbr: "TAX", sub: "Tax Summary" },
];

const FLOW_STEPS = [
  { Icon: Database, label: "Data Entry" },
  { Icon: RefreshCw, label: "Auto Sync" },
  { Icon: Zap, label: "KPI Update" },
  { Icon: Bell, label: "Alert Trigger" },
  { Icon: BarChart2, label: "Report Build" },
  { Icon: Share2, label: "Export & Share" },
];

// ─── HERO VISUAL ───────────────────────────────────────────────────────────────

function DashboardMockup() {
  return (
    <div className="w-full max-w-[900px] mx-auto">
      {/* Outer glow ring — adds visible separation from dark hero bg */}
      <div className="rounded-bz-lg border border-white/20 bg-white/[0.06] p-1.5 shadow-[0_0_60px_rgba(199,255,53,0.12)]">
        <div className="rounded-bz-md bg-white/[0.04] px-4 py-5 sm:px-6 flex flex-col gap-5">

          {/* Window chrome */}
          <div className="flex items-center justify-between">
            <div className="flex gap-1.5">
              {(["#ff5f57", "#ffbd2e", "#28c840"] as const).map((bg) => (
                <div
                  key={bg}
                  style={{ background: bg }}
                  className="w-2.5 h-2.5 rounded-full"
                />
              ))}
            </div>
            {/* Analytics Hub label — prominently white so it reads clearly on dark */}
            <span className="text-[11px] font-bold text-white uppercase tracking-[0.12em]">
              Analytics Hub
            </span>
            <div className="flex items-center gap-1.5">
              <div
                className="biz-pulse-glow w-1.5 h-1.5 rounded-full bg-bz-accent shrink-0"
                style={{ boxShadow: "0 0 8px #C7FF35" }}
              />
              <span className="text-[9px] font-bold text-bz-accent uppercase tracking-[0.14em]">
                Live
              </span>
            </div>
          </div>

          {/* KPI cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {KPI_DATA.map((kpi) => (
              <div
                key={kpi.label}
                className="bg-white/[0.07] border border-white/10 rounded-bz-md px-3 py-3.5"
              >
                <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-white/45 mb-2">
                  {kpi.label}
                </p>
                <p className="text-[18px] sm:text-[20px] font-bold text-white mb-1.5">
                  {kpi.value}
                </p>
                <span className="text-[9px] font-bold bg-bz-accent/15 text-bz-accent px-1.5 py-0.5 rounded">
                  {kpi.delta}
                </span>
              </div>
            ))}
          </div>

          {/* Chart area */}
          <div className="bg-white/[0.03] border border-white/[0.07] rounded-bz-md px-4 py-4 sm:px-5">
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="text-[11px] font-bold text-white/85">Revenue Trend</p>
                <p className="text-[9px] text-white/35 mt-0.5 uppercase tracking-[0.08em]">
                  Q4 2024 · All Entities
                </p>
              </div>
              <div className="hidden sm:flex gap-4 items-center">
                {[
                  { color: "var(--bz-accent)", label: "Current" },
                  { color: "rgba(255,255,255,0.2)", label: "Last Year" },
                ].map((leg) => (
                  <div key={leg.label} className="flex items-center gap-1.5">
                    <div
                      style={{ background: leg.color }}
                      className="w-5 h-0.5 rounded-sm"
                    />
                    <span className="text-[8px] text-white/40 font-semibold">
                      {leg.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative h-[90px]">
              <svg
                width="100%"
                height="90"
                viewBox="0 0 400 90"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="dr-area-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#C7FF35" stopOpacity={0.22} />
                    <stop offset="100%" stopColor="#C7FF35" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <path
                  d="M0,78 C40,64 80,58 120,50 S190,34 230,38 S290,26 330,18 L400,10 L400,90 L0,90 Z"
                  fill="url(#dr-area-fill)"
                />
                <path
                  d="M0,78 C40,64 80,58 120,50 S190,34 230,38 S290,26 330,18 L400,10"
                  fill="none"
                  stroke="#C7FF35"
                  strokeWidth="2"
                />
                <path
                  d="M0,84 C50,76 100,74 150,70 S230,62 290,58 S360,54 400,50"
                  fill="none"
                  stroke="rgba(255,255,255,0.18)"
                  strokeWidth="1.5"
                  strokeDasharray="5 4"
                />
                <circle cx="330" cy="18" r="4" fill="#C7FF35" className="biz-pulse-glow" />
              </svg>
              <div
                className="absolute bg-bz-deep border border-bz-accent/30 rounded-bz-md px-3 py-2 whitespace-nowrap"
                style={{ top: 6, left: "76%", transform: "translateX(-50%)" }}
              >
                <p className="text-[8px] text-white/45 uppercase tracking-[0.08em] mb-0.5">
                  Nov Peak
                </p>
                <p className="text-[14px] font-bold text-white">$284k</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// ─── HERO STATS ────────────────────────────────────────────────────────────────

function HeroStats() {
  return (
    <div className="flex flex-wrap justify-center gap-8 md:gap-14 py-6 mb-8 border-y border-white/10">
      {[
        { value: "40+", label: "Report Templates" },
        { value: "Live", label: "Real-time Data" },
        { value: "99.9%", label: "Uptime SLA" },
      ].map((s) => (
        <Stat key={s.label} value={s.value} label={s.label} tone="light" size="md" align="center" />
      ))}
    </div>
  );
}

// ─── FEATURES ──────────────────────────────────────────────────────────────────

function FeaturesSection() {
  return (
    <Section tone="white" id="features">
      <Container>
        <SectionHeading
          eyebrow="Core Capabilities"
          title={<>Built for every kind<br />of decision maker</>}
          description="Whether you're a CFO tracking cash flow or an ops manager watching order velocity, Bizak surfaces the right data in the right format."
          align="center"
          maxWidth={640}
          className="mb-14"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map(({ Icon: FeatureIcon, title, desc }) => (
            <Card key={title} hover="lift" pad="md">
              <IconBadge tone="sage" size="md" className="mb-4">
                <FeatureIcon className="size-5" />
              </IconBadge>
              <h3 className="text-[17px] font-bold text-bz-text mb-2">{title}</h3>
              <p className="text-bz-text-muted leading-[1.7] text-[14px]">{desc}</p>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}

// ─── DASHBOARD TYPES ───────────────────────────────────────────────────────────

function DashboardTypesSection() {
  return (
    <Section tone="light">
      <Container>
        <div className="flex flex-col gap-12 lg:flex-row lg:gap-16 items-center">
          <div className="flex-1">
            <SectionHeading
              eyebrow="Dashboard Flexibility"
              title={<>One platform,<br />every perspective</>}
              description="Bizak adapts to how your organization works — preconfigured views for every function, fully customizable for any role."
              align="left"
              maxWidth={520}
              className="mb-8"
            />
            <ul className="flex flex-col gap-5">
              {CHECK_ITEMS.map((item) => (
                <li key={item.title} className="flex gap-3 items-start">
                  <CheckCircle className="size-[18px] text-bz-sage shrink-0 mt-0.5" />
                  <div className="text-[14px] leading-[1.7]">
                    <span className="font-bold text-bz-text">{item.title}</span>
                    <span className="text-bz-text-muted"> — {item.desc}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="w-full lg:w-[480px] lg:flex-shrink-0">
            <Card tone="soft" pad="md">
              {/* Tab row */}
              <div className="flex gap-2 mb-5">
                {["Executive", "Operations", "Finance"].map((tab, i) => (
                  <span
                    key={tab}
                    className={`text-[11px] font-bold px-3 py-1.5 rounded-bz-md cursor-default ${
                      i === 0
                        ? "bg-bz-accent text-bz-deep"
                        : "text-bz-text-muted border border-bz-border"
                    }`}
                  >
                    {tab}
                  </span>
                ))}
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                {[
                  { label: "Net Revenue", value: "$2.84M", delta: "↑ 12.4%" },
                  { label: "Total Expenses", value: "$1.92M", delta: "↓ 3.1%" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="p-4 bg-bz-surface rounded-bz-md border border-bz-border"
                  >
                    <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-bz-text-muted mb-2">
                      {stat.label}
                    </p>
                    <p className="text-[22px] font-bold text-bz-text mb-1">{stat.value}</p>
                    <span className="text-[10px] font-bold text-green-600">{stat.delta}</span>
                  </div>
                ))}
              </div>

              {/* Sparkline chart */}
              <div className="relative">
                <svg
                  width="100%"
                  height="90"
                  viewBox="0 0 300 90"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id="dr-spark-fill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#C7FF35" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#C7FF35" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0,72 C30,58 60,62 90,46 S150,22 180,30 S240,18 270,10 L300,6 L300,90 L0,90 Z"
                    fill="url(#dr-spark-fill)"
                  />
                  <path
                    d="M0,72 C30,58 60,62 90,46 S150,22 180,30 S240,18 270,10 L300,6"
                    fill="none"
                    stroke="#C7FF35"
                    strokeWidth="2"
                  />
                  <circle cx="270" cy="10" r="3.5" fill="#C7FF35" />
                </svg>
                <div
                  className="absolute bg-bz-surface border border-bz-border rounded-bz-md px-3 py-2 shadow-sm"
                  style={{ top: "8%", left: "72%" }}
                >
                  <p className="text-[10px] font-bold text-bz-text">Peak: Nov 14</p>
                  <p className="text-[9px] text-bz-text-muted mt-0.5">Highest Revenue Day</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </Container>
    </Section>
  );
}

// ─── ANALYTICS SHOWCASE ────────────────────────────────────────────────────────

function AnalyticsSection() {
  return (
    <Section tone="dark">
      <Container>
        <SectionHeading
          eyebrow="Deep Analytics"
          title={<>From raw data to<br />boardroom clarity</>}
          tone="light"
          align="left"
          maxWidth={480}
          className="mb-12"
        />

        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          {/* Revenue Intelligence — span 3 */}
          <div className="md:col-span-3 bg-white/[0.04] border border-white/10 rounded-bz-lg p-6">
            <IconBadge tone="darkSurface" size="sm" className="mb-5">
              <TrendingUp className="size-4" />
            </IconBadge>
            <h3 className="text-[17px] font-bold text-white mb-2">Revenue Intelligence</h3>
            <p className="text-white/55 text-[14px] leading-[1.7] mb-6">
              Multi-period trend analysis with comparative benchmarks against budgets and prior-year actuals.
            </p>
            <svg
              width="100%"
              height="60"
              viewBox="0 0 300 60"
              preserveAspectRatio="none"
              className="mb-5"
            >
              <path
                d="M0,52 C40,42 80,44 120,34 S180,18 210,22 S260,12 300,6"
                fill="none"
                stroke="#C7FF35"
                strokeWidth="2"
              />
              <path
                d="M0,56 C50,52 100,54 150,50 S220,44 300,40"
                fill="none"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="1.5"
                strokeDasharray="5 4"
              />
            </svg>
            <div className="rounded-bz-md overflow-hidden border border-white/10 overflow-x-auto">
              <div className="grid grid-cols-3 px-4 py-2.5 bg-white/[0.05] border-b border-white/10 min-w-[260px]">
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.08em]">Period</span>
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.08em]">Revenue</span>
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.08em]">Δ YoY</span>
              </div>
              {TREND_ROWS.map((row) => (
                <div
                  key={row.period}
                  className="grid grid-cols-3 px-4 py-2.5 border-b border-white/[0.06] last:border-0 min-w-[260px]"
                >
                  <span className="text-[12px] text-white/60">{row.period}</span>
                  <span className="text-[12px] text-white font-semibold">{row.rev}</span>
                  <span className="text-[12px] text-bz-accent font-bold">{row.delta}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Report Library — span 3 */}
          <div className="md:col-span-3 bg-white/[0.04] border border-white/10 rounded-bz-lg p-6">
            <IconBadge tone="darkSurface" size="sm" className="mb-5">
              <FileSpreadsheet className="size-4" />
            </IconBadge>
            <h3 className="text-[17px] font-bold text-white mb-2">Built-in Report Library</h3>
            <p className="text-white/55 text-[14px] leading-[1.7] mb-6">
              40+ ready-to-run templates covering every corner of your business — no configuration required.
            </p>
            <div className="grid grid-cols-3 gap-2.5">
              {REPORT_TYPES.map(({ abbr, sub }) => (
                <div
                  key={abbr}
                  className="bg-white/[0.05] border border-white/10 rounded-bz-md px-3 py-3 text-center"
                >
                  <div className="text-[15px] font-bold text-bz-accent mb-1">{abbr}</div>
                  <div className="text-[9px] text-white/45 uppercase tracking-[0.06em]">{sub}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 40+ stat — span 2 */}
          <div className="md:col-span-2 bg-white/[0.04] border border-white/10 rounded-bz-lg p-6">
            <Stat value="40+" label="Report Templates" tone="light" size="lg" />
            <p className="text-white/55 text-[14px] leading-[1.7] mt-4">
              Preconfigured for finance, ops, HR, and sales — ready in seconds, not hours of setup.
            </p>
          </div>

          {/* Export formats — span 2 */}
          <div className="md:col-span-2 bg-white/[0.04] border border-white/10 rounded-bz-lg p-6">
            <IconBadge tone="darkSurface" size="sm" className="mb-5">
              <Download className="size-4" />
            </IconBadge>
            <h3 className="text-[17px] font-bold text-white mb-2">Export Any Format</h3>
            <p className="text-white/55 text-[14px] mb-5">
              Deliver reports to any system in exactly the format it needs.
            </p>
            <div className="flex flex-col gap-2">
              {[
                { fmt: "PDF", desc: "Branded, print-ready" },
                { fmt: "XLS", desc: "Excel with formulas" },
                { fmt: "CSV", desc: "Raw data pipeline" },
              ].map((f) => (
                <div
                  key={f.fmt}
                  className="flex justify-between items-center px-3 py-2.5 bg-white/[0.05] border border-white/[0.07] rounded-bz-md"
                >
                  <span className="text-[11px] font-bold text-bz-accent">{f.fmt}</span>
                  <span className="text-[10px] text-white/40">{f.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 99.9% accuracy stat — span 2 */}
          <div className="md:col-span-2 bg-white/[0.04] border border-white/10 rounded-bz-lg p-6">
            <Stat value="99.9%" label="Data Accuracy" tone="light" size="lg" />
            <p className="text-white/55 text-[14px] leading-[1.7] mt-4">
              Enterprise-grade reliability with bank-level encryption and zero-data-loss guarantees for every report.
            </p>
          </div>
        </div>
      </Container>
    </Section>
  );
}

// ─── REPORT FLOW ───────────────────────────────────────────────────────────────

function ReportFlowSection() {
  return (
    <Section tone="white">
      <Container>
        <SectionHeading
          eyebrow="Data Pipeline"
          title={
            <>
              From data entry to decision —
              <br className="hidden md:block" />
              {" "}automatically
            </>
          }
          align="center"
          maxWidth={560}
          className="mb-14"
        />

        <div className="relative">
          {/* Animated dashed connector (desktop only) */}
          <div className="hidden md:block absolute top-7 left-[8%] right-[8%] pointer-events-none">
            <svg width="100%" height="2" style={{ overflow: "visible" }}>
              <line
                x1="0%"
                y1="1"
                x2="100%"
                y2="1"
                stroke="#C7FF35"
                strokeWidth="2"
                strokeDasharray="14 8"
                className="biz-flow"
              />
            </svg>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6">
            {FLOW_STEPS.map(({ Icon: StepIcon, label }) => (
              <div key={label} className="flex flex-col items-center gap-3 text-center">
                <div className="relative z-10 w-14 h-14 rounded-full border-2 border-bz-border bg-bz-surface flex items-center justify-center">
                  <StepIcon className="size-5 text-bz-sage" />
                </div>
                <span className="text-[13px] font-semibold text-bz-text-muted">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}

// ─── CTA ───────────────────────────────────────────────────────────────────────

function CTASection() {
  return (
    <Section tone="dark">
      <Container width="narrow">
        <SectionHeading
          title={
            <>
              Make data your{" "}
              <span className="text-bz-accent">competitive advantage</span>
            </>
          }
          description="Join 10,000+ companies using Bizak to turn raw ERP data into instant strategic clarity — live dashboards, automated reports, zero manual effort."
          tone="light"
          align="center"
          maxWidth={580}
          className="mb-10"
        />
        <div className="flex flex-wrap justify-center gap-3">
          <Button
            variant="accent"
            size="lg"
            href="https://system.bizakerp.com/account/self-register"
            withArrow
          >
            Start Free Trial
          </Button>
          <Button variant="ghostDark" size="lg" href="/contact">
            Book a Demo
          </Button>
        </div>
      </Container>
    </Section>
  );
}

// ─── PAGE ───────────────────────────────────────────────────────────────────────

export function DashboardAndReportingPage() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <Header />
      <main>
        <HeroCentered
          tone="dark"
          mesh={false}
          badge={<HeroBadge tone="dark">Analytics & Reporting</HeroBadge>}
          title={
            <>
              Every number.
              <br />
              In real time.
            </>
          }
          description="Bizak transforms scattered ERP data into instant clarity — live KPI dashboards, scheduled reports, and drill-down analysis built for the decisions that matter."
          actions={
            <>
              <Button variant="accent" size="lg" href="/contact" withArrow>
                Request Demo
              </Button>
              <Button variant="ghostDark" size="lg" href="#features">
                Explore Features
              </Button>
            </>
          }
          visual={
            <>
              <HeroStats />
              <DashboardMockup />
            </>
          }
        />
        <FeaturesSection />
        <DashboardTypesSection />
        <AnalyticsSection />
        <ReportFlowSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
