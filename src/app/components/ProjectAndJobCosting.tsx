import {
  Section, Container, SectionHeading, Button, Card,
  IconBadge, HeroBadge, HeroCentered,
} from "./marketing";
import {
  CalendarClock, Calculator, BarChart3, Users, Clock, FileText,
  DollarSign, CheckSquare, Grid3x3, TrendingUp, Package, Network,
} from "lucide-react";

// ─── DATA ─────────────────────────────────────────────────────────────────────

const CAPABILITIES = [
  { Icon: CalendarClock, title: "Project Planning",         desc: "Multi-phase milestone tracking with dynamic Gantt visualization and dependency modeling." },
  { Icon: Calculator,    title: "Budgeting & Estimation",    desc: "Hierarchical cost modeling and automated margin guardrails powered by historical analysis." },
  { Icon: BarChart3,     title: "Cost Tracking",             desc: "Real-time ledger integration captures every project expense the moment it's committed in the field." },
  { Icon: Users,         title: "Resource Allocation",       desc: "Optimize workforce and specialized equipment across the entire project portfolio for maximum utilization." },
  { Icon: Clock,         title: "Timesheets",                desc: "High-precision labor tracking linked to job cost codes and site-specific burden multipliers." },
  { Icon: FileText,      title: "Project Billing",           desc: "Automated AIA-style progress billing based on verified site milestones or time-and-materials data." },
];

const METRICS = [
  { value: "20%",  label: "Profitability Increase", desc: "Automated tracking and reconciliation workflows capture leaked revenue immediately." },
  { value: "35%",  label: "Better Cost Control",     desc: "Reduce uncaptured site expenses and labor variances with real-time field data." },
  { value: "100%", label: "Cost Visibility",         desc: "Real-time margin visibility across the entire project lifecycle, from site to C-suite." },
];

// ─── HERO VISUAL ──────────────────────────────────────────────────────────────

function HeroDashboard() {
  const steps = [
    { code: "PLAN",  label: "Planning"   },
    { code: "EST",   label: "Estimation" },
    { code: "TRACK", label: "Tracking", active: true },
    { code: "BILL",  label: "Billing"    },
  ];
  return (
    <div className="max-w-[1100px] mx-auto rounded-bz-2xl border border-bz-border bg-bz-surface overflow-hidden p-2">
      <div className="bg-bz-bg rounded-[14px] border border-bz-border p-8 flex gap-8 flex-wrap">
        <div className="w-[200px] flex-shrink-0">
          <div className="h-10 bg-bz-border rounded-bz-md mb-4" />
          <div className="h-3.5 bg-bz-border/50 rounded-bz-sm mb-2 w-3/4" />
          <div className="h-3.5 bg-bz-border/50 rounded-bz-sm mb-5 w-1/2" />
          <div className="flex flex-col gap-2">
            {[0, 1, 2].map(i => (
              <div key={i} className="h-8 bg-bz-surface border border-bz-border rounded-bz-sm" />
            ))}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: "PROJECT HEALTH", value: "92%",    chip: "STABLE" },
              { label: "BUDGET VS ACTUAL", value: "+$124k", accent: true },
              { label: "COST BREAKDOWN", value: "4 Active" },
            ].map(s => (
              <div key={s.label} className="p-5 bg-bz-surface rounded-bz-md border border-bz-border">
                <p className="text-[9px] text-bz-text-muted font-bold uppercase tracking-[0.1em] mb-1.5">{s.label}</p>
                <p className={`text-[22px] font-bold flex items-center gap-2 ${s.accent ? "text-bz-sage" : "text-bz-text"}`}>
                  {s.value}
                  {s.chip && (
                    <span className="text-[9px] bg-bz-accent/15 text-bz-text px-1.5 py-0.5 rounded-bz-sm font-bold">{s.chip}</span>
                  )}
                </p>
              </div>
            ))}
          </div>

          <div className="p-8 bg-bz-surface rounded-bz-md border border-bz-border">
            <div className="flex justify-between items-center mb-9">
              <h4 className="font-bold text-bz-text text-[14px]">Project Workflow: #PX-904</h4>
              <span className="text-[9px] bg-bz-accent text-bz-text px-2 py-0.5 rounded-bz-sm font-bold">LIVE</span>
            </div>
            <div className="relative flex justify-between items-center px-4">
              <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-bz-border -translate-y-1/2 z-0" />
              {steps.map(s => (
                <div key={s.code} className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center text-[9px] font-bold ${
                  s.active
                    ? "bg-bz-text text-bz-surface border-4 border-bz-surface shadow-md"
                    : "bg-bz-bg text-bz-text-muted border border-bz-border"
                }`}>{s.code}</div>
              ))}
            </div>
            <div className="flex justify-between mt-3 px-2">
              {steps.map(s => (
                <span key={s.code} className={`text-[9px] font-bold uppercase tracking-[0.05em] ${
                  s.active ? "text-bz-text" : "text-bz-text-muted"
                }`}>{s.label}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── DARK SHOWCASE ────────────────────────────────────────────────────────────

function TechShowcaseSection() {
  return (
    <Section tone="dark">
      <Container>
        <SectionHeading
          eyebrow="Technical Showcase"
          title={<>High-fidelity tools for the<br />modern project team</>}
          tone="light"
          maxWidth={640}
          className="mb-16"
        />
        <div className="grid grid-cols-2 gap-5">
          {/* Real-time Job Costing */}
          <div className="bg-white/[0.03] rounded-[24px] border border-white/[0.05] p-9 flex flex-col justify-between min-h-[450px]">
            <div>
              <DollarSign className="size-5 text-bz-accent mb-6" />
              <h3 className="text-[22px] font-bold text-white mb-3">Real-time Job Costing</h3>
              <p className="text-[13px] text-white/40 leading-[1.65] mb-12">
                Track every PO and labor shift against project codes with live reconciliation.
              </p>
            </div>
            <div className="bg-white/[0.04] rounded-bz-xl border border-white/[0.08] p-6">
              {[
                { label: "PO #8841: Concrete",     value: "+$1,200" },
                { label: "Labor Shift: Grade II",  value: "+$4,500" },
                { label: "Logistics: Haulage",     value: "+$890"   },
              ].map((row, i) => (
                <div key={row.label} className={`flex justify-between items-center ${i < 2 ? "pb-4 mb-4 border-b border-white/[0.05]" : ""}`}>
                  <span className="text-[12px] text-white/60">{row.label}</span>
                  <span className="text-[13px] font-bold text-bz-accent">{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Project Control */}
          <div className="bg-white/[0.03] rounded-[24px] border border-white/[0.05] p-9 flex flex-col justify-between min-h-[450px]">
            <div>
              <CheckSquare className="size-5 text-bz-accent mb-6" />
              <h3 className="text-[22px] font-bold text-white mb-3">Project Control</h3>
              <p className="text-[13px] text-white/40 leading-[1.65] mb-8">
                Maintain strict project hygiene with intelligent approval workflows and margin guardrails.
              </p>
            </div>
            <div className="flex flex-col gap-2.5">
              {[
                { abbr: "PM", label: "PM Approval",          dot: "bg-green-500"  },
                { abbr: "EX", label: "Exec Review > $100k",  dot: "bg-amber-500"  },
              ].map(row => (
                <div key={row.label} className="px-4 py-3.5 bg-white/[0.04] rounded-bz-lg border border-white/[0.08] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-bz-sm bg-bz-accent/15 text-bz-accent flex items-center justify-center text-[9px] font-bold">{row.abbr}</div>
                    <span className="text-[12px] font-semibold text-white/60">{row.label}</span>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${row.dot}`} />
                </div>
              ))}
            </div>
          </div>

          {/* Resource Heatmap */}
          <div className="bg-white/[0.03] rounded-[24px] border border-white/[0.05] p-9 flex flex-col justify-between min-h-[400px]">
            <div>
              <Grid3x3 className="size-5 text-bz-accent mb-6" />
              <h3 className="text-[22px] font-bold text-white mb-3">Resource Heatmap</h3>
              <p className="text-[13px] text-white/40 leading-[1.65] mb-12">
                Dynamic workforce utilization across all active job sites.
              </p>
            </div>
            <div className="bg-white/[0.04] rounded-t-[14px] border border-white/[0.08] border-b-0 p-6 flex-1 flex items-center">
              <div className="grid grid-cols-4 gap-2 w-full">
                {[1, 0.4, 0.1, 0.8, 0.6, 0.9, 0.3, 0.5, 0.2, 0.7, 1, 0.4].map((opacity, i) => (
                  <div key={i} className="aspect-square rounded-bz-sm" style={{ background: `rgba(199,255,53,${opacity})` }} />
                ))}
              </div>
            </div>
          </div>

          {/* Profitability */}
          <div className="bg-white/[0.03] rounded-[24px] border border-white/[0.05] p-9 min-h-[400px]">
            <div className="flex justify-between items-start mb-6">
              <TrendingUp className="size-5 text-bz-accent" />
              <div className="text-right">
                <p className="text-[9px] text-white/40 font-bold uppercase tracking-[0.15em] mb-1">NET ROI</p>
                <p className="text-[24px] font-bold text-bz-accent">+24.5%</p>
              </div>
            </div>
            <h3 className="text-[22px] font-bold text-white mb-3">Profitability Analysis</h3>
            <p className="text-[13px] text-white/40 leading-[1.65] mb-8">
              Direct job costing linked to automated revenue recognition for absolute margin integrity.
            </p>
            <div>
              {[
                { project: "Metropolis Tower", health: "A+ Health" },
                { project: "Bridge Deck A",    health: "B+ Health" },
              ].map((row, i) => (
                <div key={row.project} className={`flex justify-between items-center py-3 ${i === 0 ? "border-b border-white/[0.05]" : ""}`}>
                  <span className="text-[12px] font-bold text-white">{row.project}</span>
                  <span className="text-[11px] font-bold text-bz-accent">{row.health}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}

// ─── INTELLIGENCE ─────────────────────────────────────────────────────────────

function IntelligenceSection() {
  const metrics = [
    { label: "MARGIN PER PROJECT", value: "+19.4%", sub: "↑ 2.1%",     pos: true,  accent: true  },
    { label: "COST VARIANCE",       value: "−2.1%",  sub: "Optimized",  pos: false, accent: false },
    { label: "UTILIZATION %",       value: "88.5%",  accent: false },
    { label: "COMPLETION RATE",     value: "94.2%",  accent: false },
  ];
  return (
    <Section tone="light">
      <Container>
        <SectionHeading eyebrow="Reporting" title="Executive Project Analytics" align="center" className="mb-14" />
        <div className="grid grid-cols-[3fr_1fr] gap-6">
          <div className="bg-bz-surface rounded-bz-2xl border border-bz-border p-10 shadow-sm">
            <div className="flex justify-between items-start mb-12">
              <div>
                <h3 className="text-[18px] font-bold text-bz-text mb-1.5">Margin Trends &amp; Variances</h3>
                <p className="text-[11px] text-bz-text-muted">Consolidated performance across 12 active sites</p>
              </div>
              <span className="text-[9px] font-bold bg-bz-bg px-3 py-1 rounded-bz-sm text-bz-text-muted">FY2024</span>
            </div>
            <div className="relative h-[240px]">
              <svg viewBox="0 0 400 100" preserveAspectRatio="none" className="w-full h-full">
                <path d="M0,80 Q50,20 100,60 T200,40 T300,70 T400,20" fill="none" stroke="var(--bz-sage)" strokeWidth="3" strokeLinecap="round" />
                <path d="M0,90 Q50,50 100,80 T200,60 T300,90 T400,50" fill="none" stroke="var(--bz-border)" strokeDasharray="4 4" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <div className="absolute top-[20%] left-1/2 -translate-x-1/2 bg-bz-deep text-white px-5 py-3 rounded-bz-xl shadow-lg text-center whitespace-nowrap">
                <p className="text-[7px] uppercase tracking-[0.15em] opacity-60 mb-1">Peak Margin</p>
                <p className="text-[18px] font-bold">19.4%</p>
                <p className="text-[7px] opacity-60">Project: Metropolis</p>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            {metrics.map(m => (
              <div key={m.label} className="p-6 bg-bz-surface border border-bz-border rounded-bz-xl shadow-sm">
                <p className="text-[9px] text-bz-text-muted font-bold uppercase tracking-[0.1em] mb-1">{m.label}</p>
                <p className={`text-[20px] font-bold ${m.accent ? "text-bz-sage" : "text-bz-text"}`}>{m.value}</p>
                {m.sub && <p className={`text-[9px] font-bold mt-1 ${m.pos ? "text-green-700" : "text-bz-text-muted"}`}>{m.sub}</p>}
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
          eyebrow="Connected System"
          title="Project Intelligence Node"
          tone="light"
          align="center"
          className="mb-24"
        />
        <div className="flex items-center justify-center flex-wrap">
          <div className="flex-1 max-w-[280px] bg-white/[0.04] p-9 rounded-[36px] border border-white/[0.05]">
            <div className="w-14 h-14 rounded-bz-xl bg-white/10 flex items-center justify-center mb-6">
              <DollarSign className="size-7 text-white/60" />
            </div>
            <h4 className="text-[20px] font-bold text-white mb-3">Finance</h4>
            <p className="text-[13px] text-white/50 leading-[1.65] mb-7">
              Project costs flow into the GL the moment they're committed — no batch syncs, no end-of-month surprises.
            </p>
            <div className="flex justify-between items-center px-4 py-2 bg-black/30 rounded-bz-lg border border-white/[0.05]">
              <span className="text-[9px] font-bold text-white/50 uppercase">ERP SYNC</span>
              <span className="text-[9px] font-bold text-bz-accent">Real-time</span>
            </div>
          </div>

          <div className="w-16 h-px bg-bz-accent/30 flex-shrink-0" />

          <div className="flex-shrink-0 flex flex-col items-center gap-4">
            <div className="w-28 h-28 rounded-full bg-bz-accent flex items-center justify-center">
              <Network className="size-10 text-bz-text" strokeWidth={1.8} />
            </div>
            <div className="text-[10px] font-black tracking-[0.3em] text-bz-accent uppercase">Project Hub</div>
          </div>

          <div className="w-16 h-px bg-bz-accent/30 flex-shrink-0" />

          <div className="flex-1 max-w-[280px] bg-white/[0.04] p-9 rounded-[36px] border border-white/[0.05]">
            <div className="w-14 h-14 rounded-bz-xl bg-white/10 flex items-center justify-center mb-6">
              <Package className="size-7 text-white/60" />
            </div>
            <h4 className="text-[20px] font-bold text-white mb-3">Inventory</h4>
            <p className="text-[13px] text-white/50 leading-[1.65] mb-7">
              Material drawdowns charge directly to project codes — every part used is reconciled in real time.
            </p>
            <div className="flex justify-between items-center px-4 py-2 bg-black/30 rounded-bz-lg border border-white/[0.05]">
              <span className="text-[9px] font-bold text-white/50 uppercase">ASSET SYNC</span>
              <span className="text-[9px] font-bold text-bz-accent">Live</span>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}

// ─── PAGE EXPORT ──────────────────────────────────────────────────────────────

export function ProjectAndJobCostingPage() {
  return (
    <>
      <HeroCentered
        badge={<HeroBadge>Enterprise Project Control</HeroBadge>}
        title={<>Track every cost.<br />Protect every project margin.</>}
        description="Manage budgets, allocate resources, and monitor real-time project profitability with precision intelligence."
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
            eyebrow="Capabilities"
            title="Precision engineering for projects"
            maxWidth={680}
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
          <SectionHeading eyebrow="Impact" title="Measurable impact on project margins" align="center" className="mb-16" />
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
            title={<>Take control of your<br /><span className="text-bz-accent">project margins today</span></>}
            description="Join 50,000+ companies running real-time project P&Ls with Bizak — from estimate to final billing."
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
