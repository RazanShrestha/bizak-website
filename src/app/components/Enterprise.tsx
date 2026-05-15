import "../../styles/style.css";
import {
  Section, Container, SectionHeading, Button, Card,
  IconBadge, HeroBadge, HeroPanel, Icon, Eyebrow,
} from "./marketing";
import { Check, Star } from "lucide-react";
import { Header } from "./Header";
import { Footer } from "./Footer";

// ─── Hero Panel Global Command Center ──────────────────────────────────────
function GlobalCommandPanel() {
  const regions = [
    { id: "AMER",   x: 72,  y: 90,  label: "AMER", users: "3.2K", entities: 14 },
    { id: "EMEA",   x: 180, y: 52,  label: "EMEA", users: "4.1K", entities: 21 },
    { id: "MEA",    x: 238, y: 90,  label: "MEA",  users: "1.8K", entities: 9  },
    { id: "AFRICA", x: 198, y: 130, label: "AFR",  users: "0.9K", entities: 6  },
    { id: "APAC",   x: 326, y: 72,  label: "APAC", users: "2.8K", entities: 17 },
  ];
  const edges: [string, string][] = [
    ["AMER", "EMEA"], ["EMEA", "MEA"], ["MEA", "AFRICA"], ["MEA", "APAC"], ["EMEA", "AFRICA"],
  ];
  const getNode = (id: string) => regions.find(r => r.id === id)!;

  return (
    <div className="relative" style={{ minHeight: 480 }}>
      <div className="absolute pointer-events-none rounded-full" style={{ top: "20%", right: "10%", width: 280, height: 280, background: "rgba(199,255,53,0.07)", filter: "blur(90px)" }} />

      {/* Floating entity-count chip */}
      <div className="biz-glass-dark biz-float-d absolute -top-3 -right-2 z-30 rounded-[14px] flex items-center gap-3" style={{ padding: "12px 18px", boxShadow: "0 20px 50px rgba(0,0,0,0.28)" }}>
        <div className="rounded-[9px] flex items-center justify-center flex-shrink-0" style={{ width: 36, height: 36, background: "rgba(199,255,53,0.15)" }}>
          <Icon name="building" size={18} className="text-bz-accent" />
        </div>
        <div>
          <div className="text-[20px] font-extrabold text-white leading-none">67</div>
          <div className="text-[8px] font-bold uppercase tracking-[0.1em] mt-0.5" style={{ color: "rgba(255,255,255,0.38)" }}>Legal Entities</div>
        </div>
      </div>

      {/* Main dashboard card + revenue chip inner relative so chip overlays the card */}
      <div className="relative">
      <div className="biz-glass-dark biz-float rounded-[20px] overflow-hidden relative z-10" style={{ boxShadow: "0 32px 64px -16px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.08)" }}>
        {/* Browser titlebar */}
        <div className="flex justify-between items-center border-b" style={{ padding: "13px 18px", borderColor: "rgba(255,255,255,0.06)", background: "rgba(26,29,25,0.6)" }}>
          <div className="flex gap-1.5">
            <div className="biz-traffic-dot" style={{ background: "rgba(248,113,113,0.5)" }} />
            <div className="biz-traffic-dot" style={{ background: "rgba(251,191,36,0.5)" }} />
            <div className="biz-traffic-dot" style={{ background: "rgba(74,222,128,0.5)" }} />
          </div>
          <span className="text-[9px] font-bold uppercase tracking-[0.15em]" style={{ color: "rgba(255,255,255,0.45)" }}>
            Bizak · Global Command Center
          </span>
          <div className="flex items-center gap-1.5">
            <div className="biz-pulse-glow w-1.5 h-1.5 rounded-full bg-bz-accent" />
            <span className="text-[7px] font-bold text-bz-accent uppercase tracking-[0.1em]">Live</span>
          </div>
        </div>

        {/* Dashboard body */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 116px" }}>
          {/* Map */}
          <div style={{ padding: "16px 16px 0" }}>
            <svg style={{ width: "100%", height: 158, display: "block" }} viewBox="0 0 390 158" fill="none" overflow="visible">
              {[40, 80, 120].map(y => (
                <line key={y} x1="0" y1={y} x2="390" y2={y} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
              ))}
              {[78, 156, 234, 312].map(x => (
                <line key={x} x1={x} y1="0" x2={x} y2="158" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
              ))}
              {edges.map(([from, to]) => {
                const a = getNode(from), b = getNode(to);
                return (
                  <g key={`${from}-${to}`}>
                    <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="rgba(199,255,53,0.22)" strokeWidth="1.5" />
                    <circle r="2.5" fill="var(--bz-accent)" opacity="0.85">
                      <animateMotion dur="2.8s" repeatCount="indefinite" path={`M${a.x},${a.y} L${b.x},${b.y}`} />
                      <animate attributeName="opacity" values="0;1;0" dur="2.8s" repeatCount="indefinite" />
                    </circle>
                  </g>
                );
              })}
              {regions.map((r) => (
                <g key={r.id}>
                  <circle cx={r.x} cy={r.y} r="14" fill="rgba(199,255,53,0.08)" stroke="rgba(199,255,53,0.32)" strokeWidth="1" />
                  <circle cx={r.x} cy={r.y} r="6" fill="var(--bz-accent)" opacity="0.92" />
                  <circle cx={r.x} cy={r.y} r="10" fill="transparent" stroke="rgba(199,255,53,0.22)" strokeWidth="1">
                    <animate attributeName="r" values="6;16;6" dur="3.2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.7;0;0.7" dur="3.2s" repeatCount="indefinite" />
                  </circle>
                  <text x={r.x} y={r.y + 26} textAnchor="middle" fill="rgba(255,255,255,0.55)" fontSize="6" fontWeight="700" letterSpacing="0.07em">
                    {r.label}
                  </text>
                  <text x={r.x} y={r.y + 35} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="5">
                    {r.entities} entities
                  </text>
                </g>
              ))}
            </svg>

            {/* Region stats bar */}
            <div className="flex border-t" style={{ borderColor: "rgba(255,255,255,0.06)", padding: "10px 0 14px" }}>
              {regions.map((r, i) => (
                <div key={r.id} className="flex-1 text-center px-0.5" style={{ borderRight: i < regions.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                  <div className="text-[10px] font-bold text-white">{r.users}</div>
                  <div className="text-[6px] font-bold uppercase tracking-[0.05em]" style={{ color: "rgba(255,255,255,0.35)" }}>{r.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Compliance sidebar */}
          <div className="flex flex-col border-l" style={{ borderColor: "rgba(255,255,255,0.06)", padding: "18px 14px", background: "rgba(0,0,0,0.15)" }}>
            <div className="text-[7px] font-bold uppercase tracking-[0.14em] mb-3.5" style={{ color: "rgba(199,255,53,0.7)" }}>Compliance</div>
            {["SOC 2 II", "ISO 27001", "GDPR", "HIPAA", "PCI DSS"].map((c) => (
              <div key={c} className="flex items-center gap-1.5 pb-2.5 mb-2.5 border-b" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                <div className="w-[15px] h-[15px] rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "rgba(199,255,53,0.15)" }}>
                  <Check size={8} className="text-bz-accent" strokeWidth={3} />
                </div>
                <span className="text-[8px] font-semibold" style={{ color: "rgba(255,255,255,0.6)" }}>{c}</span>
              </div>
            ))}
            <div className="mt-auto pt-2.5 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              <div className="text-[15px] font-extrabold text-white leading-none">99.99%</div>
              <div className="text-[7px] font-bold uppercase tracking-[0.07em] mt-1" style={{ color: "rgba(255,255,255,0.35)" }}>Uptime SLA</div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating revenue chip positioned relative to the card above */}
      <div className="biz-glass-dark biz-float-s absolute z-20 rounded-[14px]" style={{ bottom: 12, left: -20, padding: "14px 18px", boxShadow: "0 16px 40px rgba(0,0,0,0.4)", minWidth: 160 }}>
        <div className="text-[8px] font-bold uppercase tracking-[0.12em] mb-1.5" style={{ color: "rgba(199,255,53,0.65)" }}>Consolidated Revenue</div>
        <div className="text-[22px] font-extrabold text-white leading-none">$1.2B</div>
        <div className="flex items-center gap-1.5 mt-1.5">
          <div className="h-[3px] flex-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.1)" }}>
            <div className="biz-accent-bar" style={{ width: "78%" }} />
          </div>
          <span className="text-[9px] font-bold text-green-400">+18%</span>
        </div>
      </div>
      </div>{/* end inner card+chip wrapper */}
    </div>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function HeroSection() {
  return (
    <HeroPanel
      badge={<HeroBadge tone="dark">ERP for Enterprise</HeroBadge>}
      title={
        <>
          Unified Command<br />
          for Global<br />
          <span className="text-bz-accent">Operations.</span>
        </>
      }
      description="One platform. 10,000+ users. 67 legal entities. 150+ countries. Bizak Enterprise delivers governance at SAP depth with cloud-native deployment speed live in 20 weeks, not 3 years."
      actions={
        <>
          <Button variant="accent" size="lg" href="/Contact">Request Enterprise Demo</Button>
          <Button variant="ghostDark" size="lg">Watch Overview</Button>
        </>
      }
      stats={[
        { value: "99.99%", label: "Uptime SLA"  },
        { value: "150+",   label: "Countries"   },
        { value: "20 wk",  label: "SLA Go-Live" },
      ]}
      panel={<GlobalCommandPanel />}
    />
  );
}


// ─── Challenges ───────────────────────────────────────────────────────────────
const FINDINGS = [
  {
    id: "F-02",
    icon: "award",
    title: "Global Compliance Complexity",
    desc: "Operating in 30 countries means 30 sets of tax laws, data residency rules, and audit requirements all managed manually.",
    alerts: [
      { label: "GDPR (EU)",           status: "GAP",    color: "#f87171" },
      { label: "VAT Filing (15 co.)", status: "MANUAL", color: "#fbbf24" },
      { label: "Data Residency",      status: "RISK",   color: "#f87171" },
    ],
  },
  {
    id: "F-03",
    icon: "bar",
    title: "Zero Global Visibility",
    desc: "Finance waits 3 weeks for regional month-end packs. By the time the board sees numbers, decisions are already a month late.",
    stats: [
      { label: "Global P&L",     lag: "21 days stale" },
      { label: "Headcount Data", lag: "14 days stale" },
      { label: "Cash Position",  lag: "7 days stale"  },
    ],
  },
  {
    id: "F-04",
    icon: "lock",
    title: "Access Control at Scale",
    desc: "8,000 users across 50 countries with different roles and entities. Granular RBAC without the right platform is an IT nightmare.",
    stats: [
      { label: "Users with excess access", lag: "34%"    },
      { label: "Orphaned accounts",        lag: "1,240"  },
      { label: "Manual role reviews",      lag: "6 mos." },
    ],
  },
  {
    id: "F-05",
    icon: "plug",
    title: "Legacy Integration Debt",
    desc: "Hundreds of brittle point-to-point integrations every upgrade risks breaking a dozen others.",
    bars: [
      { sku: "Salesforce → SAP",  level: 92 },
      { sku: "Oracle → Workday",  level: 78 },
      { sku: "EDI → Warehouse",   level: 45 },
    ],
  },
];

function ChallengesSection() {
  return (
    <Section tone="light">
      <Container>
        <div className="grid items-end gap-4 mb-[52px]" style={{ gridTemplateColumns: "1fr auto" }}>
          <div>
            <Eyebrow>System Audit</Eyebrow>
            <h2 className="mt-3.5 text-[clamp(1.6rem,3.5vw,2.6rem)] font-bold text-bz-text tracking-[-0.02em] leading-tight max-w-[620px]">
              Enterprise complexity exposes every weakness in legacy ERP
            </h2>
            <p className="mt-3.5 text-[17px] text-bz-text-muted leading-[1.7]">
              At scale, every inefficiency compounds. The systems that worked at 500 employees fracture under 5,000 users across 50 entities.
            </p>
          </div>
          <div className="text-center flex-shrink-0 rounded-[10px] px-[18px] py-2.5" style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)" }}>
            <div className="text-[22px] font-extrabold leading-none" style={{ color: "#f87171" }}>5</div>
            <div className="text-[9px] font-bold uppercase tracking-[0.1em] mt-1" style={{ color: "#f87171" }}>Critical Findings</div>
          </div>
        </div>

        <div className="grid gap-[18px]" style={{ gridTemplateColumns: "1.55fr 1fr", gridTemplateRows: "auto auto" }}>
          {/* F-01 wide featured card */}
          <Card tone="soft" pad="lg" className="row-span-2 relative overflow-hidden flex flex-col">
            <div className="absolute -top-1.5 right-4 text-[56px] font-black leading-none pointer-events-none select-none" style={{ color: "rgba(248,113,113,0.05)" }}>F-01</div>
            <div className="flex items-center gap-2.5 mb-5">
              <IconBadge size="md" tone="sage">
                <Icon name="database" size={22} />
              </IconBadge>
              <span className="text-[9px] font-bold uppercase tracking-[0.12em] px-2.5 py-1 rounded-[6px]" style={{ color: "#f87171", background: "rgba(248,113,113,0.08)" }}>Critical Finding</span>
            </div>
            <h3 className="text-[18px] font-bold text-bz-text mb-2.5">Legacy ERP Migration Risk</h3>
            <p className="text-[14px] text-bz-text-muted leading-[1.65] flex-1">SAP and Oracle implementations cost $10M–$100M and take 18–36 months. Customizations compound, consultants multiply, and business disruption is guaranteed. Yet staying on aging infrastructure is equally costly and exposes the organization to mounting technical and security debt.</p>
            <div className="pt-6 border-t border-bz-border flex flex-col gap-2.5 mt-6">
              {[
                { label: "Avg. ERP implementation",  val: "28 months"   },
                { label: "Cost overrun rate",         val: "75% of cos." },
                { label: "On-time delivery rate",     val: "only 22%"    },
                { label: "Post-go-live satisfaction", val: "38%"         },
              ].map((r) => (
                <div key={r.label} className="flex justify-between items-center">
                  <span className="text-[12px] text-bz-text-muted">{r.label}</span>
                  <span className="text-[12px] font-bold" style={{ color: "#f87171" }}>{r.val}</span>
                </div>
              ))}
              <div className="flex items-center gap-1.5 mt-1">
                <div className="biz-pulse-glow w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#f87171" }} />
                <span className="text-[9px] font-bold uppercase tracking-[0.08em]" style={{ color: "#f87171" }}>Industry average, 2024</span>
              </div>
            </div>
          </Card>

          {/* 4 compact finding cards */}
          {FINDINGS.map((f) => (
            <Card key={f.id} tone="soft" pad="md" className="relative overflow-hidden flex flex-col">
              <div className="absolute -top-1 right-3 text-[36px] font-black leading-none pointer-events-none select-none" style={{ color: "rgba(248,113,113,0.05)" }}>{f.id}</div>
              <div className="mb-3.5">
                <IconBadge size="sm" tone="sage">
                  <Icon name={f.icon} size={18} />
                </IconBadge>
              </div>
              <h3 className="text-[15px] font-bold text-bz-text mb-2">{f.title}</h3>
              <p className="text-[13px] text-bz-text-muted leading-[1.6] mb-4 flex-1">{f.desc}</p>
              <div className="border-t border-bz-border pt-3.5">
                {f.alerts && (
                  <div className="flex flex-col gap-1.5">
                    {f.alerts.map((a) => (
                      <div key={a.label} className="flex items-center gap-1.5 px-2 py-[5px] rounded-[6px]" style={{ background: "rgba(248,113,113,0.05)" }}>
                        <Icon name="alert" size={11} style={{ color: a.color, flexShrink: 0 }} />
                        <span className="text-[10px] text-bz-text-muted flex-1">{a.label}</span>
                        <span className="text-[8px] font-bold uppercase" style={{ color: a.color }}>{a.status}</span>
                      </div>
                    ))}
                  </div>
                )}
                {f.stats && (
                  <div className="flex flex-col gap-1.5">
                    {f.stats.map((s) => (
                      <div key={s.label} className="flex justify-between items-center">
                        <span className="text-[11px] text-bz-text-muted">{s.label}</span>
                        <span className="text-[11px] font-bold" style={{ color: "#f87171" }}>{s.lag}</span>
                      </div>
                    ))}
                  </div>
                )}
                {f.bars && (
                  <div className="flex flex-col gap-2">
                    {f.bars.map((b) => (
                      <div key={b.sku}>
                        <div className="flex justify-between mb-[3px]">
                          <span className="text-[9px] text-bz-text-muted tracking-[0.04em]">{b.sku}</span>
                          <span className="text-[9px] font-bold" style={{ color: b.level > 60 ? "#f87171" : "var(--bz-sage)" }}>{b.level}% fragile {b.level > 60 ? "⚠" : ""}</span>
                        </div>
                        <div className="h-1 bg-bz-bg rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${b.level}%`, background: b.level > 60 ? "#f87171" : "var(--bz-sage)" }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}

// ─── Solution ─────────────────────────────────────────────────────────────────
const PILLARS = [
  {
    icon: "globe",
    badgeTone: "accent" as const,
    title: "Global Multi-Entity Engine",
    desc: "Manage unlimited legal entities, currencies, and jurisdictions from one platform. Auto-consolidate with intercompany eliminations, FX revaluation, and IFRS/GAAP-ready financials.",
    metrics: [
      { val: "67+",  lbl: "Legal Entities" },
      { val: "40+",  lbl: "Currencies"     },
    ],
  },
  {
    icon: "shield",
    badgeTone: "sage" as const,
    title: "Enterprise Security & RBAC",
    desc: "SSO, SAML 2.0, SCIM provisioning, and field-level access control. Every user sees exactly what their role permits from CEO to regional AR clerk.",
    metrics: [
      { val: "SAML", lbl: "SSO Ready"      },
      { val: "SCIM", lbl: "Auto-Provision" },
    ],
  },
  {
    icon: "cpu",
    badgeTone: "accent" as const,
    title: "AI Decision Intelligence",
    desc: "Predictive cash flow, anomaly detection on transactions, and AI-generated variance analysis. Turn your ERP data into a board-ready strategic asset.",
    metrics: [
      { val: "13wk",      lbl: "Rolling Forecast"   },
      { val: "Real-time", lbl: "Anomaly Detection"  },
    ],
  },
];

const COMPACT_SOLUTIONS = [
  { icon: "award",      title: "Regulatory Compliance Suite", desc: "Built-in SOX, GDPR, VAT controls. One-click audit trail and compliance reporting." },
  { icon: "plug",       title: "Open Integration Platform",   desc: "RESTful APIs and 300+ pre-built connectors. Replace integration spaghetti with a governed data layer." },
  { icon: "life-buoy",  title: "White-Glove Implementation",  desc: "Dedicated team, guaranteed go-live SLA, and hypercare through your first full close cycle." },
];

function SolutionSection() {
  return (
    <Section tone="white">
      <Container>
        <SectionHeading
          eyebrow="The Solution"
          title="Enterprise-grade from day one. Not bolted on later."
          description="Every critical enterprise capability compliance, multi-entity, security is built into the platform core, not added as a module."
          align="center"
          maxWidth={520}
          className="mb-16"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
          {PILLARS.map((p) => (
            <Card key={p.title} pad="lg" hover="lift" className="flex flex-col">
              <IconBadge size="lg" tone={p.badgeTone} className="mb-[22px]">
                <Icon name={p.icon} size={24} />
              </IconBadge>
              <h3 className="text-[19px] font-bold text-bz-text mb-3 leading-[1.25]">{p.title}</h3>
              <p className="text-[14px] text-bz-text-muted leading-[1.65] flex-1">{p.desc}</p>
              <div className="flex gap-3.5 mt-6 pt-5 border-t border-bz-border">
                {p.metrics.map((m) => (
                  <div key={m.lbl}>
                    <div className="text-[16px] font-extrabold text-bz-text">{m.val}</div>
                    <div className="text-[9px] font-bold text-bz-text-muted uppercase tracking-[0.08em] mt-0.5">{m.lbl}</div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {COMPACT_SOLUTIONS.map((s) => (
            <div key={s.title} className="flex gap-4 px-[22px] py-5 rounded-bz-lg border border-bz-border bg-bz-bg items-start">
              <IconBadge size="sm" tone="sage" className="flex-shrink-0">
                <Icon name={s.icon} size={18} />
              </IconBadge>
              <div>
                <h4 className="text-[14px] font-bold text-bz-text mb-1.5">{s.title}</h4>
                <p className="text-[13px] text-bz-text-muted leading-[1.55]">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}

// ─── Capabilities ─────────────────────────────────────────────────────────────
function CapabilitiesSection() {
  return (
    <Section tone="dark">
      <Container>
        <div className="flex justify-between items-end mb-14 flex-wrap gap-5">
          <div className="max-w-[520px]">
            <Eyebrow tone="accent">Capabilities</Eyebrow>
            <h2 className="mt-3 text-[clamp(1.6rem,3.5vw,2.6rem)] font-bold text-white tracking-[-0.02em] leading-tight">
              Enterprise power. No implementation nightmare.
            </h2>
          </div>
          <div className="flex gap-8">
            {[
              { val: "$1.2B", lbl: "Consolidated Revenue" },
              { val: "67",   lbl: "Legal Entities"        },
              { val: "40+",  lbl: "Currencies"            },
            ].map((s) => (
              <div key={s.lbl} className="text-right">
                <div className="text-[26px] font-extrabold text-bz-accent leading-none">{s.val}</div>
                <div className="text-[9px] font-bold text-white/35 uppercase tracking-[0.1em] mt-1">{s.lbl}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Row 1: Full-width Global Dashboard */}
        <Card tone="dark" pad="lg" className="mb-4" style={{ minHeight: 240 }}>
          <div className="flex items-start gap-12 flex-wrap">
            <div className="flex-1" style={{ minWidth: 280 }}>
              <h3 className="text-[20px] font-bold text-white mb-2.5">Global Consolidated View</h3>
              <p className="text-[14px] text-white/45 leading-[1.65] mb-6">
                Revenue, EBITDA, headcount, and compliance status across every entity live, in a single board-ready view. No Excel. No waiting for regional packs.
              </p>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    {["Region", "Revenue", "EBITDA", "Status"].map((h, i) => (
                      <th key={h} className="text-[9px] font-bold uppercase tracking-[0.1em] text-white/30 pb-2.5" style={{ textAlign: i > 1 ? "right" : "left" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { region: "AMER", revenue: "$420M", ebitda: "22%", status: "healthy" },
                    { region: "EMEA", revenue: "$510M", ebitda: "19%", status: "healthy" },
                    { region: "APAC", revenue: "$270M", ebitda: "17%", status: "review"  },
                  ].map((row) => (
                    <tr key={row.region} className="border-b border-white/[0.04]">
                      <td className="text-[11px] text-white py-2.5 tracking-[0.04em]">{row.region}</td>
                      <td className="text-[11px] text-white/45 py-2.5">{row.revenue}</td>
                      <td className="text-[11px] font-bold text-white/80 py-2.5 text-right">{row.ebitda}</td>
                      <td className="py-2.5 text-right">
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-[0.08em]" style={{ background: row.status === "healthy" ? "rgba(199,255,53,0.12)" : "rgba(251,191,36,0.12)", color: row.status === "healthy" ? "var(--bz-accent)" : "#fbbf24" }}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex-shrink-0" style={{ minWidth: 220 }}>
              <div className="text-[10px] font-bold text-white/30 uppercase tracking-[0.1em] mb-3">12-Month Revenue Trend</div>
              <svg width="220" height="80" viewBox="0 0 220 80" fill="none">
                <defs>
                  <linearGradient id="capGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--bz-accent)" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="var(--bz-accent)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d="M0 68 C 20 62, 40 55, 65 44 S 110 30, 145 22 S 185 14, 220 8" stroke="var(--bz-accent)" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M0 68 C 20 62, 40 55, 65 44 S 110 30, 145 22 S 185 14, 220 8 V 80 H 0 Z" fill="url(#capGrad)" />
                <circle cx="220" cy="8" r="5" fill="var(--bz-accent)" />
                <circle cx="220" cy="8" r="9" fill="none" stroke="rgba(199,255,53,0.3)" strokeWidth="1.5">
                  <animate attributeName="r" values="5;12;5" dur="2.5s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="1;0;1" dur="2.5s" repeatCount="indefinite" />
                </circle>
              </svg>
              <div className="flex gap-5 mt-4">
                {[{ val: "18%", lbl: "YoY Growth" }, { val: "Q1 2025", lbl: "Latest Close" }].map((s) => (
                  <div key={s.lbl}>
                    <div className="text-[18px] font-bold text-bz-accent">{s.val}</div>
                    <div className="text-[9px] font-bold text-white/30 uppercase tracking-[0.08em] mt-0.5">{s.lbl}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Row 2: Identity & Compliance */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <Card tone="dark" pad="lg" style={{ minHeight: 280 }}>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-[18px] font-bold text-white mb-1.5">Identity & Access</h3>
                <p className="text-[13px] text-white/45 leading-[1.6]">SSO, SAML 2.0, SCIM auto-provisioning, and MFA enforcement across all 67 entities.</p>
              </div>
              <div className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 bg-bz-accent/10">
                <Icon name="key" size={20} className="text-bz-accent" />
              </div>
            </div>
            <div className="biz-mono-table">
              <div className="biz-mono-header">
                <span>PROTOCOL</span><span>PROVIDER</span><span>STATUS</span>
              </div>
              {[
                { step: "SAML", module: "Azure AD",   status: "ACTIVE", ok: true  },
                { step: "SCIM", module: "Okta",        status: "ACTIVE", ok: true  },
                { step: "MFA",  module: "All users",   status: "FORCED", ok: true  },
                { step: "RBAC", module: "67 entities", status: "LIVE",   ok: true  },
              ].map((r) => (
                <div key={r.step} className="biz-mono-row">
                  <span>{r.step}</span><span>{r.module}</span>
                  <span style={{ color: r.ok ? "#4ade80" : "rgba(255,255,255,0.3)" }}>{r.status}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card tone="dark" pad="lg" style={{ minHeight: 280 }}>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-[18px] font-bold text-white mb-1.5">Compliance Automation</h3>
                <p className="text-[13px] text-white/45 leading-[1.6]">Automated VAT filing, transfer pricing docs, and audit-ready reports. Close books in 2 days, not 3 weeks.</p>
              </div>
              <div className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 bg-bz-accent/10">
                <Icon name="award" size={20} className="text-bz-accent" />
              </div>
            </div>
            <div className="biz-method-grid">
              {[["2 Days", "Month Close"], ["100%", "Audit Trail"], ["40+", "Tax Regimes"]].map(([val, sub]) => (
                <div key={sub} className="biz-method-box">
                  <div className="biz-method-label">{val}</div>
                  <div className="biz-method-sub">{sub}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Row 3: Tech tiles */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { icon: "cpu",     title: "AI Decision Intelligence", desc: "Predictive cashflow, anomaly detection, and AI-generated variance commentary for every monthly close.", badge: null       },
            { icon: "plug",    title: "Open Integration Platform", desc: "RESTful APIs, webhooks, and 300+ pre-built connectors to replace your integration spaghetti.",        badge: "API-First" },
            { icon: "sliders", title: "Deployment Flexibility",    desc: "Cloud, private cloud, or hybrid. Data residency controls per region. Your infrastructure rules.",       badge: null       },
          ].map((tile) => (
            <Card key={tile.title} tone="dark" pad="lg" className={`relative${tile.badge ? " biz-neon-border" : ""}`} style={{ minHeight: 220 }}>
              {tile.badge && (
                <div className="absolute top-4 right-[18px]">
                  <span className="text-[8px] font-bold text-bz-accent uppercase tracking-[0.2em] opacity-85">{tile.badge}</span>
                </div>
              )}
              <div className="text-bz-accent mb-[18px]"><Icon name={tile.icon} size={32} /></div>
              <h4 className="font-bold text-[16px] text-white mb-2.5">{tile.title}</h4>
              <p className="text-[13px] text-white/45 leading-[1.6]">{tile.desc}</p>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}

// ─── Security & Compliance ────────────────────────────────────────────────────
const CERTIFICATIONS = [
  { name: "SOC 2 Type II",    scope: "All modules",           renewed: "2025"    },
  { name: "ISO 27001:2022",   scope: "Global data centers",   renewed: "2025"    },
  { name: "GDPR",             scope: "EU data processing",    renewed: "Ongoing" },
  { name: "HIPAA",            scope: "Health sector clients", renewed: "Ongoing" },
  { name: "PCI DSS Level 1",  scope: "Payment processing",    renewed: "2025"    },
  { name: "CSA STAR Level 2", scope: "Cloud security",        renewed: "2025"    },
];

const SECURITY_CONTROLS = [
  "End-to-end encryption at rest and in transit",
  "Field-level data masking for PII/PHI",
  "Immutable audit log zero tampering possible",
  "Automated DSAR response tooling (GDPR Art. 17)",
  "Data residency enforcement per entity",
  "Penetration testing bi-annual external audit",
];

function ComplianceSection() {
  return (
    <Section tone="light">
      <Container>
        {/* Security score hero card */}
        <div className="bg-bz-deep rounded-bz-xl mb-10 grid items-center gap-14" style={{ padding: "48px 52px", gridTemplateColumns: "200px 1fr" }}>
          <div className="text-center">
            <div className="relative w-[160px] h-[160px] mx-auto">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
                <circle cx="80" cy="80" r="68" fill="transparent" stroke="rgba(255,255,255,0.06)" strokeWidth="12" />
                <circle cx="80" cy="80" r="68" fill="transparent" stroke="var(--bz-accent)" strokeWidth="12"
                  strokeDasharray={`${2 * Math.PI * 68 * 0.999} ${2 * Math.PI * 68 * 0.001}`}
                  strokeLinecap="round" />
              </svg>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                <div className="text-[32px] font-black text-bz-accent leading-none">A+</div>
                <div className="text-[10px] font-bold uppercase tracking-[0.1em] mt-1" style={{ color: "rgba(255,255,255,0.38)" }}>Security</div>
              </div>
            </div>
            <div className="mt-3.5 text-[12px] leading-[1.5]" style={{ color: "rgba(255,255,255,0.35)" }}>Zero critical findings<br />in 4 consecutive audits</div>
          </div>

          <div>
            <Eyebrow tone="accent">Security & Trust</Eyebrow>
            <h2 className="mt-3 text-[clamp(1.4rem,3vw,2.2rem)] font-bold text-white tracking-[-0.03em] leading-[1.2] mb-4">
              Enterprise security that passes every audit.
            </h2>
            <p className="text-[15px] text-white/45 leading-[1.7] mb-7">
              Security is not a feature at Bizak Enterprise it's the foundation. Every module is built to meet the requirements of the world's most regulated industries.
            </p>
            <div className="flex gap-8 flex-wrap">
              {[
                { val: "6",      lbl: "Major Certifications" },
                { val: "100%",   lbl: "Audit Trail Coverage" },
                { val: "Bi-ann", lbl: "External Pentest"     },
                { val: "0",      lbl: "Critical CVEs (2024)" },
              ].map((s) => (
                <div key={s.lbl}>
                  <div className="text-[22px] font-extrabold text-bz-accent">{s.val}</div>
                  <div className="text-[9px] font-bold text-white/30 uppercase tracking-[0.08em] mt-1">{s.lbl}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8">
          <div>
            <div className="text-[12px] font-bold text-bz-sage uppercase tracking-[0.1em] mb-[18px]">Certifications & Standards</div>
            <div className="grid grid-cols-2 gap-3">
              {CERTIFICATIONS.map((c) => (
                <Card key={c.name} tone="light" pad="sm" className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[13px] font-bold text-bz-text">{c.name}</span>
                    <div className="w-[18px] h-[18px] rounded-full flex items-center justify-center flex-shrink-0 bg-bz-accent/15">
                      <Check size={8} className="text-bz-sage" strokeWidth={3} />
                    </div>
                  </div>
                  <span className="text-[11px] text-bz-text-muted">{c.scope}</span>
                  <span className="text-[10px] font-bold text-bz-sage uppercase tracking-[0.06em]">Renewed {c.renewed}</span>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <div className="text-[12px] font-bold text-bz-sage uppercase tracking-[0.1em] mb-[18px]">Platform Security Controls</div>
            <div className="flex flex-col gap-2.5">
              {SECURITY_CONTROLS.map((c) => (
                <div key={c} className="flex items-center gap-3.5 px-[18px] py-3.5 bg-bz-surface border border-bz-border rounded-[10px]">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 bg-bz-accent/[0.12] border border-bz-sage/20">
                    <Check size={10} className="text-bz-sage" strokeWidth={3} />
                  </div>
                  <span className="text-[13px] text-bz-text leading-[1.4]">{c}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}

// ─── Insights ─────────────────────────────────────────────────────────────────
function InsightsSection() {
  const regions = [
    { label: "AMER", revenue: "$420M", growth: "+14%" },
    { label: "EMEA", revenue: "$510M", growth: "+18%" },
    { label: "APAC", revenue: "$270M", growth: "+22%" },
  ];

  return (
    <Section tone="white">
      <Container>
        <div className="grid grid-cols-2 gap-20 items-center">
          <div>
            <Eyebrow>Global Intelligence</Eyebrow>
            <h2 className="mt-3.5 mb-5 text-[clamp(1.6rem,3.5vw,2.6rem)] font-bold text-bz-text tracking-[-0.02em] leading-[1.2]">
              The global view your board actually needs.
            </h2>
            <p className="text-[17px] text-bz-text-muted leading-[1.7]">
              Stop assembling board packs from regional spreadsheets. Bizak Enterprise consolidates every entity, currency, and jurisdiction into a single live view from P&L to cash position to headcount, in real time.
            </p>
            <ul className="biz-check-list mt-6">
              {[
                { bold: "Live Consolidation Engine",     rest: " Multi-entity P&L, balance sheet, and cash with auto intercompany eliminations and FX revaluation." },
                { bold: "Board-Ready Reports on Demand", rest: " Export IFRS or GAAP-compliant investor-grade packs directly from live data. No Excel required."   },
                { bold: "Predictive Cashflow AI",        rest: " 13-week rolling forecast with AI-powered variance analysis across every entity."                   },
              ].map((item) => (
                <li key={item.bold} className="biz-check-item">
                  <span className="biz-check-icon"><Icon name="check-circle" size={20} /></span>
                  <span><strong>{item.bold}</strong>{item.rest}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative">
            <div className="biz-chart-frame biz-glass">
              <div className="biz-chart-inner">
                <div className="flex gap-2 mb-5">
                  {regions.map((r, i) => (
                    <div key={r.label}
                      className="px-3.5 py-1.5 rounded-[8px] flex items-center gap-1.5 cursor-default text-[11px] font-bold"
                      style={{ background: i === 0 ? "var(--bz-deep)" : "rgba(122,130,109,0.1)", color: i === 0 ? "#fff" : "var(--bz-text-muted)" }}>
                      {r.label}
                      {i === 0 && <span className="text-[9px] font-bold text-bz-accent">{r.growth}</span>}
                    </div>
                  ))}
                </div>

                <div className="h-[220px] bg-bz-surface rounded-[8px] border border-bz-border/50 relative p-4" style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.04)" }}>
                  <svg className="w-full h-full" viewBox="0 0 360 180" fill="none">
                    <defs>
                      <linearGradient id="insGrad1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--bz-accent)" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="var(--bz-accent)" stopOpacity="0" />
                      </linearGradient>
                      <linearGradient id="insGrad2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--bz-sage)" stopOpacity="0.12" />
                        <stop offset="100%" stopColor="var(--bz-sage)" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    {[45, 90, 135].map(y => (
                      <line key={y} x1="0" y1={y} x2="360" y2={y} stroke="rgba(122,130,109,0.07)" strokeWidth="1" />
                    ))}
                    <path d="M0 145 C 45 132, 90 115, 145 92 S 240 64, 290 46 S 335 30, 360 22" stroke="var(--bz-sage)" strokeWidth="2.5" strokeLinecap="round" />
                    <path d="M0 145 C 45 132, 90 115, 145 92 S 240 64, 290 46 S 335 30, 360 22 V 180 H 0 Z" fill="url(#insGrad1)" />
                    <path d="M0 158 C 45 152, 90 144, 145 132 S 240 116, 290 104 S 335 92, 360 86" stroke="rgba(122,130,109,0.45)" strokeWidth="2" strokeDasharray="5 4" />
                    <path d="M0 158 C 45 152, 90 144, 145 132 S 240 116, 290 104 S 335 92, 360 86 V 180 H 0 Z" fill="url(#insGrad2)" />
                    <circle cx="290" cy="46" r="5" fill="var(--bz-accent)" stroke="var(--bz-sage)" strokeWidth="2" />
                    <text x="10" y="140" fill="rgba(122,130,109,0.6)" fontSize="8">AMER</text>
                    <text x="10" y="153" fill="rgba(122,130,109,0.45)" fontSize="8">EMEA</text>
                  </svg>
                  <div className="biz-tooltip">
                    <div className="font-bold text-[11px] text-bz-text">Global: $1.2B ↑</div>
                    <div className="text-[10px] font-bold mt-1 text-green-600">+18% YoY consolidated</div>
                  </div>
                </div>

                <div className="flex mt-4">
                  {regions.map((r, i) => (
                    <div key={r.label} className="flex-1 text-center py-2 px-1" style={{ borderRight: i < regions.length - 1 ? "1px solid var(--bz-border)" : "none" }}>
                      <div className="text-[14px] font-bold text-bz-text">{r.revenue}</div>
                      <div className="text-[9px] font-bold text-bz-sage mt-0.5">{r.label} · {r.growth}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="absolute -bottom-8 -right-8 w-[160px] h-[160px] rounded-full pointer-events-none" style={{ background: "rgba(122,130,109,0.04)", filter: "blur(50px)" }} />
          </div>
        </div>
      </Container>
    </Section>
  );
}

// ─── Implementation Journey ───────────────────────────────────────────────────
const PHASES = [
  { phase: "01", label: "Discovery",      duration: "Weeks 1–2",   icon: "database", desc: "Architecture review, entity mapping, and data audit",             above: true  },
  { phase: "02", label: "Architecture",   duration: "Weeks 3–4",   icon: "layers",   desc: "Security config, RBAC design, and integration blueprint",         above: false },
  { phase: "03", label: "Pilot",          duration: "Weeks 5–8",   icon: "settings", desc: "Single-entity go-live with full team shadowing",                  above: true  },
  { phase: "04", label: "Staged Rollout", duration: "Weeks 9–16",  icon: "sync",     desc: "Phased expansion across all entities and regions",                above: false },
  { phase: "05", label: "Hypercare",      duration: "Weeks 17–20", icon: "life-buoy",desc: "Dedicated support through first full close cycle",                above: true  },
  { phase: "06", label: "Steady State",   duration: "Week 21+",    icon: "rocket",   desc: "CSM-led optimization and continuous improvement program",          above: false },
];

function ImplementationSection() {
  const DOT_H = 52;
  const LABEL_H = 110;
  const TOTAL_H = LABEL_H + DOT_H + LABEL_H;

  return (
    <Section tone="light">
      <Container>
        <SectionHeading
          eyebrow="Implementation"
          title="A proven path from contract to global go-live."
          description="Our dedicated enterprise team follows a structured 20-week playbook. SLA-backed delivery milestones no surprises, no overruns."
          align="center"
          maxWidth={560}
          className="mb-16"
        />

        <div className="overflow-x-auto overflow-y-visible pb-2">
          <div style={{ minWidth: 720, position: "relative", height: TOTAL_H + 32 }}>
            {/* Timeline connector line */}
            <div className="absolute h-px bg-bz-border" style={{
              top: LABEL_H + DOT_H / 2,
              left: "calc(100% / 12)",
              right: "calc(100% / 12)",
              transform: "translateY(-50%)",
            }} />

            <div className="grid h-full" style={{ gridTemplateColumns: `repeat(${PHASES.length}, 1fr)` }}>
              {PHASES.map((p) => (
                <div key={p.phase} className="flex flex-col items-center h-full relative">
                  <div className="flex flex-col justify-end text-center px-1.5" style={{ height: LABEL_H }}>
                    {p.above && (
                      <>
                        <div className="text-[13px] font-bold text-bz-text mb-1">{p.label}</div>
                        <div className="text-[10px] font-bold text-bz-sage bg-bz-accent/15 px-2 py-0.5 rounded-[5px] inline-block mb-1.5 self-center">{p.duration}</div>
                        <div className="text-[11px] text-bz-text-muted leading-[1.4]">{p.desc}</div>
                      </>
                    )}
                  </div>

                  <div className="relative z-10 flex-shrink-0" style={{ width: DOT_H, height: DOT_H }}>
                    <div className="w-full h-full rounded-full bg-bz-surface border-2 border-bz-border flex items-center justify-center" style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.07)" }}>
                      <Icon name={p.icon} size={20} className="text-bz-sage" />
                    </div>
                    <div className="absolute -bottom-[18px] left-1/2 -translate-x-1/2 text-[9px] font-bold text-bz-accent bg-bz-deep px-[7px] py-0.5 rounded whitespace-nowrap">
                      {p.phase}
                    </div>
                  </div>

                  <div className="flex-1 text-center px-1.5 pt-7">
                    {!p.above && (
                      <>
                        <div className="text-[13px] font-bold text-bz-text mb-1">{p.label}</div>
                        <div className="text-[10px] font-bold text-bz-sage bg-bz-accent/15 px-2 py-0.5 rounded-[5px] inline-block mb-1.5">{p.duration}</div>
                        <div className="text-[11px] text-bz-text-muted leading-[1.4]">{p.desc}</div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SLA commitment banner */}
        <div className="mt-12 px-7 py-5 bg-bz-deep rounded-bz-md flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <IconBadge size="md" tone="accent">
              <Icon name="check-circle" size={22} />
            </IconBadge>
            <div>
              <div className="text-[15px] font-bold text-white">SLA-backed implementation milestones</div>
              <div className="text-[13px] text-white/38 mt-0.5">Every delivery phase is contractually guaranteed. Miss a milestone? You receive service credits.</div>
            </div>
          </div>
          <Button variant="accent" size="md" href="/Contact" withArrow>
            Talk to Implementation Team
          </Button>
        </div>
      </Container>
    </Section>
  );
}

// ─── Testimonials ─────────────────────────────────────────────────────────────
const TESTIMONIALS = [
  {
    quote: "We replaced SAP R/3 across 14 subsidiaries in 18 months half the time our previous integrator quoted. The consolidation engine alone saves our finance team 3 weeks every quarter.",
    name: "Fiona Lebedev",
    role: "Group CFO, Meridian Global Holdings",
    metric: "18-month global rollout",
    featured: true,
  },
  {
    quote: "The SSO integration and RBAC took two days to configure. Our previous ERP took 6 months and still had gaps.",
    name: "James Osei",
    role: "CTO, Stratum International",
    metric: "2-day security setup",
    featured: false,
  },
  {
    quote: "Our first external audit after deploying Bizak zero findings. The audit trail and segregation of duties are exactly what the Big 4 need to see.",
    name: "Priya Nair",
    role: "Head of Internal Audit, TerraGroup",
    metric: "Zero audit findings",
    featured: false,
  },
];

function StarRating({ size = 13 }: { size?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={size} style={{ color: "var(--bz-accent)", fill: "var(--bz-accent)" }} strokeWidth={1.5} />
      ))}
    </div>
  );
}

function TestimonialsSection() {
  const featured = TESTIMONIALS.find(t => t.featured)!;
  const small = TESTIMONIALS.filter(t => !t.featured);

  return (
    <Section tone="light">
      <Container>
        <SectionHeading
          eyebrow="Customer Stories"
          title="Enterprise teams that made the move to Bizak"
          align="center"
          className="mb-[52px]"
        />

        <div className="grid gap-5 items-stretch" style={{ gridTemplateColumns: "1fr 1.7fr" }}>
          <Card tone="dark" pad="lg" className="flex flex-col relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-[200px] h-[200px] rounded-full pointer-events-none" style={{ background: "rgba(199,255,53,0.05)", filter: "blur(60px)" }} />
            <StarRating />
            <div className="text-[80px] leading-[0.8] mt-5 flex-shrink-0" style={{ color: "rgba(199,255,53,0.12)" }}>"</div>
            <p className="text-[17px] text-white/85 leading-[1.7] italic flex-1 mt-3">
              {featured.quote}
            </p>
            <div className="mt-8">
              <div className="w-12 h-px bg-bz-accent/30 mb-5" />
              <div className="text-[14px] font-bold text-white">{featured.name}</div>
              <div className="text-[13px] text-white/38 mt-0.5">{featured.role}</div>
              <div className="mt-4 inline-block text-[11px] font-bold text-bz-accent uppercase tracking-[0.1em] bg-bz-accent/10 px-3.5 py-[7px] rounded-[8px]">
                {featured.metric}
              </div>
            </div>
          </Card>

          <div className="flex flex-col gap-5">
            {small.map((t) => (
              <Card key={t.name} pad="lg" className="flex-1 flex flex-col">
                <StarRating size={12} />
                <p className="text-[15px] text-bz-text-muted leading-[1.7] italic flex-1 mt-4">
                  "{t.quote}"
                </p>
                <div className="flex justify-between items-end mt-6">
                  <div>
                    <div className="text-[14px] font-bold text-bz-text">{t.name}</div>
                    <div className="text-[12px] text-bz-text-muted mt-0.5">{t.role}</div>
                  </div>
                  <div className="text-[10px] font-bold text-bz-sage uppercase tracking-[0.07em] bg-bz-sage/[0.08] px-3 py-1.5 rounded-[8px]">
                    {t.metric}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}

// ─── CTA ──────────────────────────────────────────────────────────────────────
function CTASection() {
  return (
    <Section tone="dark">
      <Container width="narrow">
        <SectionHeading
          title={<>Enterprise ERP decisions are made once.<br />Make this one count.</>}
          description="Join global enterprises replacing SAP and Oracle with Bizak. Multi-entity. SOC 2 certified. Live in 20 weeks with your name on the SLA."
          tone="light"
          align="center"
          maxWidth={640}
          className="mb-12"
        />

        <div className="flex justify-center gap-12 flex-wrap mb-12">
          {[
            { val: "99.99%", lbl: "Uptime SLA" },
            { val: "150+",   lbl: "Countries"   },
            { val: "20 wks", lbl: "To Go-Live"  },
            { val: "0",      lbl: "Hidden Fees" },
          ].map((s) => (
            <div key={s.lbl} className="text-center">
              <div className="text-[26px] font-extrabold text-bz-accent leading-none">{s.val}</div>
              <div className="text-[10px] font-bold text-white/35 uppercase tracking-[0.1em] mt-1.5">{s.lbl}</div>
            </div>
          ))}
        </div>

        <div className="flex justify-center gap-4 flex-wrap">
          <Button variant="accent" size="lg" href="/Contact" withArrow>Request Enterprise Demo</Button>
          <Button variant="ghostDark" size="lg" href="/Contact">Talk to Sales</Button>
        </div>

        <p className="text-center mt-6 text-[12px] text-white/25 tracking-[0.02em]">
          No commitment required · Custom pricing for 500+ user organizations
        </p>
      </Container>
    </Section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export function Enterprise() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <Header />
      <main>
        <HeroSection />
        <ChallengesSection />
        <SolutionSection />
        <CapabilitiesSection />
        <ComplianceSection />
        <InsightsSection />
        <ImplementationSection />
        <TestimonialsSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
