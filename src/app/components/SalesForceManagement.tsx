import {
  Section, Container, SectionHeading, Button, Card,
  IconBadge, HeroBadge, HeroCentered,
} from "./marketing";
import {
  MapPin, Route, ShoppingBag, UserCheck, Map, Smartphone,
  Activity, Workflow, BarChart3, WifiOff, Globe, DollarSign,
  TrendingUp, Users, Network, ClipboardList, Send, ArrowRight,
} from "lucide-react";

// ─── DATA ─────────────────────────────────────────────────────────────────────

const CAPABILITIES = [
  { Icon: MapPin,     title: "Field Visit Tracking",  desc: "GPS-stamped visits and meeting logs flow straight into the customer record no end-of-day report writing." },
  { Icon: Route,      title: "Beat & Route Planning", desc: "Daily beat plans optimized for travel time so reps spend the day selling, not driving." },
  { Icon: ShoppingBag,title: "On-Spot Order Booking", desc: "Capture orders at the counter and reserve inventory the moment they're booked." },
  { Icon: UserCheck,  title: "Geofenced Attendance",  desc: "Check-ins verified against the actual outlet location proxy attendance is structurally impossible." },
  { Icon: Map,        title: "Territory Management",  desc: "Visual territory mapping balances workload across reps and exposes coverage gaps before they cost you." },
  { Icon: Smartphone, title: "Offline-First Mobile",  desc: "Reps keep working through dead zones; the app delta-syncs the moment a signal returns." },
];

const METRICS = [
  { value: "Clearer", label: "Better Visibility",      desc: "Transparent tracking across every territory eliminates blind spots in execution." },
  { value: "Higher",  label: "Increased Productivity", desc: "Optimized beats and automated logs let reps focus on selling, not paperwork." },
  { value: "Faster",  label: "Higher Conversion",      desc: "On-spot order booking shortens the cycle and raises order accuracy." },
];

const FLOW_STEPS = [
  { Icon: ClipboardList, label: "Plan Beat",     sub: "Assign route" },
  { Icon: MapPin,        label: "Check-In",      sub: "Geofence verify" },
  { Icon: ShoppingBag,   label: "Capture Order", sub: "Reserve stock" },
  { Icon: Send,          label: "Auto-Post",     sub: "To ledger & CRM" },
];

// ─── HERO VISUAL ──────────────────────────────────────────────────────────────

function HeroDashboard() {
  const agents = [
    { initials: "RK", name: "Rakesh K.",   territory: "North-West",  status: "On Visit",  pct: 86, accent: true  },
    { initials: "AM", name: "Anita M.",    territory: "South Hub",   status: "In Transit",pct: 64, accent: false },
    { initials: "SP", name: "Sumit P.",    territory: "Central",     status: "Order Captured", pct: 92, accent: true },
    { initials: "DV", name: "Divya V.",    territory: "East Bypass", status: "Checked In",pct: 71, accent: false },
  ];

  const feed = [
    { tag: "ORDER",   text: "₹84,200 booked at Plaza Hub",   time: "2m" },
    { tag: "VISIT",   text: "Check-in Sector 14 Outlet",   time: "5m" },
    { tag: "ROUTE",   text: "Re-route applied traffic",    time: "9m" },
    { tag: "VISIT",   text: "Meeting closed at Greenfield",  time: "12m" },
  ];

  return (
    <div className="max-w-[1100px] mx-auto rounded-bz-2xl border border-bz-border bg-bz-surface overflow-hidden p-2">
      <div className="bg-bz-bg rounded-[14px] border border-bz-border p-5 md:p-7">
        {/* Top KPI strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-5">
          {[
            { label: "ACTIVE AGENTS",      value: "124",   accent: false },
            { label: "VISITS TODAY",       value: "1,284", accent: false },
            { label: "ORDERS BOOKED",      value: "₹12.8L",accent: true  },
            { label: "COVERAGE",           value: "94.2%", accent: false },
          ].map(s => (
            <div key={s.label} className="p-4 bg-bz-surface rounded-bz-md border border-bz-border">
              <p className="text-[9px] text-bz-text-muted font-bold uppercase tracking-[0.1em] mb-1.5">{s.label}</p>
              <p className={`text-[20px] md:text-[22px] font-bold ${s.accent ? "text-bz-sage" : "text-bz-text"}`}>{s.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-4 md:gap-5">
          {/* Active Agents */}
          <div className="bg-bz-surface rounded-bz-md border border-bz-border p-5 md:p-6">
            <div className="flex justify-between items-center mb-5">
              <h4 className="font-bold text-bz-text text-[13px]">Active Agents</h4>
              <span className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.1em] text-bz-text-muted">
                <span className="w-1.5 h-1.5 rounded-full bg-bz-sage biz-pulse-glow" /> Live
              </span>
            </div>
            <div className="flex flex-col gap-2.5">
              {agents.map(a => (
                <div key={a.initials} className="flex items-center gap-3 px-3 py-2.5 rounded-bz-md border border-bz-border bg-bz-bg/50">
                  <div className="w-8 h-8 rounded-full bg-bz-sage/15 text-bz-sage flex items-center justify-center text-[11px] font-bold tracking-tight">
                    {a.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-bold text-bz-text leading-tight">{a.name}</p>
                    <p className="text-[10px] text-bz-text-muted">{a.territory} · {a.status}</p>
                  </div>
                  <div className="hidden sm:flex w-[60px] h-1.5 bg-bz-border/60 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${a.accent ? "bg-bz-sage" : "bg-bz-text/40"}`}
                      style={{ width: `${a.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Live Field Feed */}
          <div className="bg-bz-surface rounded-bz-md border border-bz-border p-5 md:p-6 flex flex-col">
            <div className="flex justify-between items-center mb-5">
              <h4 className="font-bold text-bz-text text-[13px]">Live Field Feed</h4>
              <span className="text-[9px] font-bold bg-bz-bg px-2 py-1 rounded-bz-sm text-bz-text-muted uppercase tracking-[0.1em]">Auto-Sync</span>
            </div>
            <div className="flex flex-col gap-2.5 flex-1">
              {feed.map((f, i) => (
                <div key={i} className="flex items-start gap-3 pb-2.5 border-b border-bz-border/60 last:border-0 last:pb-0">
                  <div className={`px-1.5 py-0.5 rounded-bz-sm text-[8px] font-black tracking-[0.1em] ${
                    f.tag === "ORDER" ? "bg-bz-accent text-bz-text" :
                    f.tag === "VISIT" ? "bg-bz-sage/15 text-bz-sage" :
                                         "bg-bz-bg text-bz-text-muted border border-bz-border"
                  }`}>
                    {f.tag}
                  </div>
                  <p className="flex-1 text-[11px] text-bz-text leading-snug">{f.text}</p>
                  <span className="text-[9px] text-bz-text-muted shrink-0">{f.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── FIELD-TO-LEDGER FLOW ─────────────────────────────────────────────────────

function FlowStripSection() {
  return (
    <Section tone="light" pad="compact">
      <Container>
        <SectionHeading
          eyebrow="Field-to-Ledger Flow"
          title="From beat plan to general ledger one continuous thread"
          description="Every field action posts to the same database the rest of your business runs on. No CSVs, no nightly batch, no reconciliation."
          align="center"
          maxWidth={680}
          className="mb-12"
        />
        <div className="flex flex-col md:flex-row md:items-stretch gap-3 md:gap-0">
          {FLOW_STEPS.map((step, i) => (
            <div key={step.label} className="flex flex-1 items-center gap-3 md:gap-2">
              <div className="flex-1 flex items-center gap-4 px-5 py-5 rounded-bz-xl bg-bz-surface border border-bz-border">
                <IconBadge tone="sage" size="md">
                  <step.Icon className="size-5" />
                </IconBadge>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-bz-text-muted uppercase tracking-[0.1em] mb-0.5">Step {i + 1}</p>
                  <p className="text-[14px] font-bold text-bz-text leading-tight">{step.label}</p>
                  <p className="text-[11px] text-bz-text-muted mt-0.5">{step.sub}</p>
                </div>
              </div>
              {i < FLOW_STEPS.length - 1 && (
                <ArrowRight className="hidden md:block size-4 text-bz-text-muted/40 shrink-0 mx-1" />
              )}
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}

// ─── DARK SHOWCASE ────────────────────────────────────────────────────────────

function TechShowcaseSection() {
  return (
    <Section tone="dark">
      <Container>
        <SectionHeading
          eyebrow="Enterprise Control"
          title={<>High-fidelity tools for the<br />modern sales force</>}
          tone="light"
          maxWidth={640}
          className="mb-16"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Live Field Tracking */}
          <div className="bg-white/[0.03] rounded-[24px] border border-white/[0.05] p-9 flex flex-col justify-between min-h-[450px]">
            <div>
              <Activity className="size-5 text-bz-accent mb-6" />
              <h3 className="text-[22px] font-bold text-white mb-3">Live Field Tracking</h3>
              <p className="text-[13px] text-white/40 leading-[1.65] mb-12">
                Real-time telemetry of every agent's movement, with idle time and visit-duration metrics surfaced for managers.
              </p>
            </div>
            <div className="bg-white/[0.04] rounded-bz-xl border border-white/[0.08] p-6">
              <div className="flex items-center gap-3.5 mb-6">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold text-bz-accent text-[13px]">FT</div>
                <div>
                  <p className="text-[13px] font-bold text-white mb-0.5">Field Telemetry</p>
                  <p className="text-[9px] text-white/40 uppercase tracking-[0.1em]">Active Agents: 124</p>
                </div>
              </div>
              <div className="grid grid-cols-3 text-center gap-3">
                {[
                  { label: "AVG. VISIT", value: "42m", accent: true },
                  { label: "EFFICIENCY", value: "A+",  accent: false },
                  { label: "IDLE TIME",  value: "4.2%",accent: false },
                ].map(m => (
                  <div key={m.label}>
                    <p className="text-[9px] text-white/40 uppercase tracking-[0.05em] mb-1">{m.label}</p>
                    <p className={`text-[18px] font-bold ${m.accent ? "text-bz-accent" : "text-white"}`}>{m.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Route Optimization */}
          <div className="bg-white/[0.03] rounded-[24px] border border-white/[0.05] p-9 flex flex-col justify-between min-h-[450px]">
            <div>
              <Workflow className="size-5 text-bz-accent mb-6" />
              <h3 className="text-[22px] font-bold text-white mb-3">Route Optimization</h3>
              <p className="text-[13px] text-white/40 leading-[1.65] mb-8">
                Dynamic re-routing reacts to live traffic and urgent client requests the rep just gets the next stop.
              </p>
            </div>
            <div className="flex flex-col gap-2.5">
              {[
                { abbr: "TR", label: "Traffic Update",  dot: "bg-green-500", dim: false },
                { abbr: "AL", label: "Algo Re-routing", dot: "bg-amber-500", dim: false },
                { abbr: "ST", label: "Static Path",     dot: "",             dim: true  },
              ].map(row => (
                <div key={row.label} className={`px-4 py-3.5 bg-white/[0.04] rounded-bz-lg border border-white/[0.06] flex items-center justify-between${row.dim ? " opacity-40" : ""}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-bz-sm bg-bz-accent/15 text-bz-accent flex items-center justify-center text-[9px] font-bold">{row.abbr}</div>
                    <span className="text-[12px] font-semibold text-white/60">{row.label}</span>
                  </div>
                  {row.dot && <div className={`w-2 h-2 rounded-full ${row.dot}`} />}
                </div>
              ))}
            </div>
          </div>

          {/* Performance Monitoring */}
          <div className="bg-white/[0.03] rounded-[24px] border border-white/[0.05] p-9 flex flex-col justify-between min-h-[400px]">
            <div>
              <BarChart3 className="size-5 text-bz-accent mb-6" />
              <h3 className="text-[22px] font-bold text-white mb-3">Performance Monitoring</h3>
              <p className="text-[13px] text-white/40 leading-[1.65] mb-12">
                Gamified leaderboards and per-rep KPI tracking that surface coaching moments before they become missed targets.
              </p>
            </div>
            <div className="bg-white/[0.04] rounded-t-[14px] border border-white/[0.08] border-b-0 p-6 flex-1 flex flex-col justify-end">
              <div className="flex flex-col gap-4">
                {[
                  { pct: 75, color: "bg-bz-accent" },
                  { pct: 50, color: "bg-white/40" },
                  { pct: 25, color: "bg-bz-accent/50" },
                ].map((bar, i) => (
                  <div key={i} className="h-2 bg-white/[0.08] rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${bar.color}`} style={{ width: `${bar.pct}%` }} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Offline-first Mobile Sync */}
          <div className="bg-white/[0.03] rounded-[24px] border border-white/[0.05] p-9 min-h-[400px]">
            <div className="flex justify-between items-start mb-6">
              <WifiOff className="size-5 text-bz-accent" />
              <div className="text-right">
                <p className="text-[9px] text-white/40 font-bold uppercase tracking-[0.15em] mb-1">Sync Score</p>
                <p className="text-[24px] font-bold text-bz-accent">100%</p>
              </div>
            </div>
            <h3 className="text-[22px] font-bold text-white mb-3">Offline-first Mobile Sync</h3>
            <p className="text-[13px] text-white/40 leading-[1.65] mb-8">
              Encrypted local storage with delta-sync the moment connectivity returns nothing captured in the field is ever lost.
            </p>
            <div>
              <div className="flex justify-between pb-2 border-b border-white/[0.05] text-[9px] font-bold text-white/40 uppercase">
                <span>Activity Log</span><span>Rep ID</span><span>State</span>
              </div>
              {[
                { activity: "Order_Captured",   id: "#RE-2024-81" },
                { activity: "Check_In_Log",     id: "#CH-990-22"  },
                { activity: "Route_Completion", id: "#RT-AX-402"  },
              ].map(row => (
                <div key={row.id} className="flex justify-between items-center py-2.5 border-b border-white/[0.04]">
                  <span className="text-[11px] font-bold text-white tracking-tight">{row.activity}</span>
                  <span className="text-[11px] text-white/40">{row.id}</span>
                  <div className="w-3 h-3 rounded-full bg-green-500/15 flex items-center justify-center">
                    <div className="w-1 h-1 rounded-full bg-green-500" />
                  </div>
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
  const cards = [
    { Icon: Users,      label: "Visits per day",  value: "12.4k", sub: "↑ 14%" },
    { Icon: DollarSign, label: "Sales per rep",   value: "$1.8k", sub: "↑ 8%"  },
    { Icon: Globe,      label: "Coverage",        value: "94%",   sub: "↑ 2%"  },
  ];
  return (
    <Section tone="light">
      <Container>
        <SectionHeading
          eyebrow="Intelligence"
          title="Actionable intelligence that drives field results"
          align="center"
          className="mb-14"
        />
        <div className="grid grid-cols-1 lg:grid-cols-[3fr_1fr] gap-6">
          <div className="bg-bz-surface rounded-bz-2xl border border-bz-border p-10 shadow-sm">
            <div className="flex justify-between items-start mb-12">
              <div>
                <h3 className="text-[18px] font-bold text-bz-text mb-1.5">Visits vs. Coverage Trend</h3>
                <p className="text-[9px] text-bz-text-muted font-bold uppercase tracking-[0.1em]">Field Productivity Feed</p>
              </div>
              <span className="text-[9px] font-bold bg-bz-bg px-3 py-1 rounded-bz-sm text-bz-text-muted">W42-2024</span>
            </div>
            <div className="relative h-[240px]">
              <svg viewBox="0 0 400 100" preserveAspectRatio="none" className="w-full h-full">
                <path d="M0,80 Q50,20 100,60 T200,40 T300,70 T400,20" fill="none" stroke="var(--bz-sage)" strokeWidth="3" strokeLinecap="round" />
                <path d="M0,90 Q50,50 100,80 T200,60 T300,90 T400,50" fill="none" stroke="var(--bz-border)" strokeDasharray="4 4" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <div className="absolute top-[20%] left-1/2 -translate-x-1/2 bg-bz-deep text-white px-5 py-3 rounded-bz-xl shadow-lg text-center whitespace-nowrap">
                <p className="text-[7px] uppercase tracking-[0.15em] opacity-60 mb-1">Peak Identified</p>
                <p className="text-[18px] font-bold">12.4k</p>
                <p className="text-[7px] opacity-60">Territory: North-West</p>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            {cards.map(c => (
              <div key={c.label} className="p-6 bg-bz-surface border border-bz-border rounded-bz-xl shadow-sm">
                <div className="w-8 h-8 bg-bz-bg rounded-bz-md flex items-center justify-center mb-4">
                  <c.Icon className="size-4 text-bz-text-muted" />
                </div>
                <p className="text-[9px] text-bz-text-muted font-bold uppercase tracking-[0.1em] mb-1">{c.label}</p>
                <p className="text-[20px] font-bold text-bz-text">{c.value}</p>
                <p className="text-[9px] font-bold text-green-700 mt-1">{c.sub}</p>
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
          eyebrow="Universal Connectivity"
          title={<>Field automation connected directly<br />to your core business systems</>}
          tone="light"
          align="center"
          maxWidth={560}
          className="mb-24"
        />
        <div className="flex flex-col items-center gap-6 md:flex-row md:gap-0 md:flex-wrap md:justify-center">
          <div className="flex-1 max-w-[280px] bg-white/[0.04] p-9 rounded-[36px] border border-white/[0.05]">
            <div className="w-14 h-14 rounded-bz-xl bg-white/10 flex items-center justify-center mb-6">
              <TrendingUp className="size-7 text-white/60" />
            </div>
            <h4 className="text-[20px] font-bold text-white mb-3">Sales CRM</h4>
            <p className="text-[13px] text-white/50 leading-[1.65] mb-7">
              Every visit, order and check-in updates the CRM in real time no manual sync, no lost touches.
            </p>
            <div className="flex justify-between items-center px-4 py-2 bg-black/30 rounded-bz-lg border border-white/[0.05]">
              <span className="text-[9px] font-bold text-white/50 uppercase">CRM SYNC</span>
              <span className="text-[9px] font-bold text-bz-accent">Active</span>
            </div>
          </div>

          <div className="hidden md:block w-16 h-px bg-bz-accent/30 flex-shrink-0" />

          <div className="flex-shrink-0 flex flex-col items-center gap-4">
            <div className="w-28 h-28 rounded-full bg-bz-accent flex items-center justify-center">
              <Network className="size-10 text-bz-text" strokeWidth={1.8} />
            </div>
            <div className="text-[10px] font-black tracking-[0.3em] text-bz-accent uppercase">SFA Hub</div>
          </div>

          <div className="hidden md:block w-16 h-px bg-bz-accent/30 flex-shrink-0" />

          <div className="flex-1 max-w-[280px] bg-white/[0.04] p-9 rounded-[36px] border border-white/[0.05]">
            <div className="w-14 h-14 rounded-bz-xl bg-white/10 flex items-center justify-center mb-6">
              <DollarSign className="size-7 text-white/60" />
            </div>
            <h4 className="text-[20px] font-bold text-white mb-3">Finance &amp; ERP</h4>
            <p className="text-[13px] text-white/50 leading-[1.65] mb-7">
              On-the-spot orders post directly to the ledger and reserve inventory the moment they're booked.
            </p>
            <div className="flex justify-between items-center px-4 py-2 bg-black/30 rounded-bz-lg border border-white/[0.05]">
              <span className="text-[9px] font-bold text-white/50 uppercase">LEDGER SYNC</span>
              <span className="text-[9px] font-bold text-bz-accent">Auto-Post</span>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}

// ─── PAGE EXPORT ──────────────────────────────────────────────────────────────

export function SalesForceManagementPage() {
  return (
    <>
      <HeroCentered
        badge={<HeroBadge>Field Execution Platform</HeroBadge>}
        title={<>Empower your field sales team<br />to perform at scale</>}
        description="Track field activity, plan beats, capture orders and post to the ledger in real time one system from rep's pocket to GL."
        actions={
          <>
            <Button variant="accent" size="lg" href="/contact" withArrow>Start Free Trial</Button>
            <Button variant="outline" size="lg">Watch Demo</Button>
          </>
        }
        visual={<HeroDashboard />}
      />

      <Section tone="white">
        <Container>
          <SectionHeading
            eyebrow="Features &amp; Utility"
            title={<>A structured management system<br />built for field sales control</>}
            maxWidth={640}
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

      <FlowStripSection />
      <TechShowcaseSection />
      <IntelligenceSection />
      <ConnectivitySection />

      <Section tone="white">
        <Container>
          <SectionHeading eyebrow="Measurable Impact" title="The results of precision field management" align="center" className="mb-16" />
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
            title={<>Take full control of your<br /><span className="text-bz-accent">sales force management</span></>}
            description="Join the companies running their field operations on Bizak. From beat plan to ledger entry all in one system."
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
