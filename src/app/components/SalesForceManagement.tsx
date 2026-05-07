import {
  Section, Container, SectionHeading, Button, Card,
  IconBadge, HeroBadge, HeroCentered,
} from "./marketing";
import {
  MapPin, Route, ShoppingBag, UserCheck, Map, Smartphone,
  Activity, Workflow, BarChart3, WifiOff, Globe, DollarSign,
  TrendingUp, Users, Network,
} from "lucide-react";

// ─── DATA ─────────────────────────────────────────────────────────────────────

const CAPABILITIES = [
  { Icon: MapPin,     title: "Field Visit Tracking",     desc: "Automated GPS-stamped visits and meeting logs ensure absolute transparency in field execution." },
  { Icon: Route,      title: "Route Planning",            desc: "Daily route optimization reduces travel time and fuel costs for every field agent." },
  { Icon: ShoppingBag,title: "Order Booking",             desc: "Capture digital orders on-the-spot with instant cloud synchronization to central inventory." },
  { Icon: UserCheck,  title: "Attendance & Check-ins",    desc: "Geofenced check-ins eliminate proxy attendance and verify presence at client locations." },
  { Icon: Map,        title: "Territory Management",      desc: "Dynamic visual mapping for territory balancing and efficient sales force assignment." },
  { Icon: Smartphone, title: "Mobile App Support",        desc: "Robust offline-first capabilities ensure field reps stay productive even without a signal." },
];

const METRICS = [
  { value: "50%", label: "Better Visibility",        desc: "Transparent tracking across all territories eliminates blind spots in execution." },
  { value: "30%", label: "Increased Productivity",    desc: "Optimized routes and automated logs allow reps to focus on selling, not travel." },
  { value: "20%", label: "Higher Conversion",         desc: "Seamless on-spot order booking reduces lead time and increases order accuracy." },
];

// ─── HERO VISUAL ──────────────────────────────────────────────────────────────

function HeroDashboard() {
  return (
    <div className="max-w-[1100px] mx-auto rounded-bz-2xl border border-bz-border bg-bz-surface overflow-hidden p-2">
      <div className="bg-bz-bg rounded-[14px] border border-bz-border p-8 flex gap-8 flex-wrap">
        <div className="w-[200px] flex-shrink-0">
          <div className="h-9 bg-bz-border rounded-bz-md mb-4" />
          <div className="h-3 bg-bz-border/50 rounded-bz-sm mb-2 w-3/4" />
          <div className="h-3 bg-bz-border/50 rounded-bz-sm mb-6 w-1/2" />
          <div className="h-9 bg-bz-border/40 rounded-bz-md mb-2" />
          <div className="h-9 bg-bz-border/40 rounded-bz-md" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="grid grid-cols-3 gap-4 mb-5">
            {[
              { label: "TOTAL VISITS",       value: "12.4k" },
              { label: "TERRITORY COVERAGE", value: "94.2%" },
              { label: "CONVERSION RATE",    value: "22.8%" },
            ].map(s => (
              <div key={s.label} className="p-5 bg-bz-surface rounded-bz-md border border-bz-border">
                <p className="text-[9px] text-bz-text-muted font-bold uppercase tracking-[0.1em] mb-1.5">{s.label}</p>
                <p className="text-[24px] font-bold text-bz-text">{s.value}</p>
              </div>
            ))}
          </div>

          <div className="bg-bz-surface rounded-bz-md border border-bz-border p-7 relative overflow-hidden min-h-[200px]">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-bold text-bz-text text-[14px]">Real-time Coverage Heatmap</h4>
              <div className="flex gap-1.5">
                {["bg-red-400", "bg-bz-accent", "bg-bz-text"].map(c => (
                  <div key={c} className={`w-2 h-2 rounded-full ${c}`} />
                ))}
              </div>
            </div>
            <div className="h-[120px] rounded-bz-md bg-bz-bg relative overflow-hidden">
              <svg width="100%" height="100%" className="absolute inset-0">
                {[1, 2, 3, 4, 5].map(i => (
                  <line key={`v${i}`} x1={`${i * 16.7}%`} y1="0" x2={`${i * 16.7}%`} y2="100%" stroke="rgba(0,0,0,0.06)" strokeWidth="1" />
                ))}
                {[1, 2, 3].map(i => (
                  <line key={`h${i}`} x1="0" y1={`${i * 25}%`} x2="100%" y2={`${i * 25}%`} stroke="rgba(0,0,0,0.06)" strokeWidth="1" />
                ))}
                <circle cx="30%" cy="40%" r="45" fill="var(--bz-sage)" fillOpacity="0.22" />
                <circle cx="62%" cy="55%" r="58" fill="var(--bz-sage)" fillOpacity="0.10" />
                <circle cx="78%" cy="28%" r="32" fill="var(--bz-accent)" fillOpacity="0.45" />
              </svg>
            </div>
            <div className="absolute bottom-3 right-3 w-20 bg-bz-deep rounded-[14px] p-1.5 border-2 border-bz-deep-2 shadow-lg">
              <div className="bg-bz-surface rounded-bz-sm py-2.5 flex flex-col items-center text-center">
                <UserCheck className="size-4 text-bz-sage" />
                <p className="text-[6px] font-bold text-bz-text-muted uppercase tracking-[0.08em] mt-1.5">Checked In</p>
                <p className="text-[7px] font-bold text-bz-text leading-tight mt-0.5">Central Plaza Hub</p>
              </div>
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
          eyebrow="Enterprise Control"
          title={<>High-fidelity tools for the<br />modern sales force</>}
          tone="light"
          maxWidth={640}
          className="mb-16"
        />
        <div className="grid grid-cols-2 gap-5">
          {/* Live Field Tracking */}
          <div className="bg-white/[0.03] rounded-[24px] border border-white/[0.05] p-9 flex flex-col justify-between min-h-[450px]">
            <div>
              <Activity className="size-5 text-bz-accent mb-6" />
              <h3 className="text-[22px] font-bold text-white mb-3">Live Field Tracking</h3>
              <p className="text-[13px] text-white/40 leading-[1.65] mb-12">
                Real-time telemetry of every agent's movement, including idle time and visit duration metrics.
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
                Dynamic re-routing algorithms respond to real-time traffic conditions and urgent client requests.
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
                Gamified leaderboards and individual KPI tracking drive healthy competition and team excellence.
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
              Encrypted local storage with automatic delta-syncing when connectivity is restored.
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
        <div className="grid grid-cols-[3fr_1fr] gap-6">
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
        <div className="flex items-center justify-center flex-wrap">
          <div className="flex-1 max-w-[280px] bg-white/[0.04] p-9 rounded-[36px] border border-white/[0.05]">
            <div className="w-14 h-14 rounded-bz-xl bg-white/10 flex items-center justify-center mb-6">
              <TrendingUp className="size-7 text-white/60" />
            </div>
            <h4 className="text-[20px] font-bold text-white mb-3">Sales CRM</h4>
            <p className="text-[13px] text-white/50 leading-[1.65] mb-7">
              Every visit, order and check-in updates the CRM in real time — no manual sync, no lost touches.
            </p>
            <div className="flex justify-between items-center px-4 py-2 bg-black/30 rounded-bz-lg border border-white/[0.05]">
              <span className="text-[9px] font-bold text-white/50 uppercase">CRM SYNC</span>
              <span className="text-[9px] font-bold text-bz-accent">Active</span>
            </div>
          </div>

          <div className="w-16 h-px bg-bz-accent/30 flex-shrink-0" />

          <div className="flex-shrink-0 flex flex-col items-center gap-4">
            <div className="w-28 h-28 rounded-full bg-bz-accent flex items-center justify-center">
              <Network className="size-10 text-bz-text" strokeWidth={1.8} />
            </div>
            <div className="text-[10px] font-black tracking-[0.3em] text-bz-accent uppercase">SFA Hub</div>
          </div>

          <div className="w-16 h-px bg-bz-accent/30 flex-shrink-0" />

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
        description="Track field activity, manage routes, and monitor performance in real time with Bizak's intelligent sales force automation system."
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
            description="Join 50,000+ companies running their field operations on Bizak. From beat plan to ledger entry — all in one system."
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
