import {
  Container,
  Section,
  SectionHeading,
  Card,
  Button,
  IconBadge,
  PillBadge,
  HeroBadge,
  Eyebrow,
} from "./marketing";
import {
  ClipboardList,
  DollarSign,
  CheckCircle2,
  Building2,
  Package,
  LineChart,
  ShieldCheck,
  FileText,
  Clock,
  TrendingUp,
  TrendingDown,
  Sparkles,
  AlertTriangle,
  ChevronRight,
  ShoppingCart,
  Factory,
  FolderKanban,
  Landmark,
  Activity,
  Scale,
  ArrowUpRight,
  Database,
  CircleDollarSign,
  BookOpen,
} from "lucide-react";

// ─── 1. HERO ──────────────────────────────────────────────────────────────────
function HeroSection() {
  return (
    <Section pad="hero" className="biz-mesh">
      <Container width="narrow">
        <div className="flex flex-col items-center text-center">
          <HeroBadge>Financial Module</HeroBadge>
          <h1
            className="mt-4 font-bold text-bz-text leading-[1.1] tracking-[-0.03em]
                       text-[clamp(36px,5.4vw,60px)] max-w-[820px]"
          >
            Control your finances with
            <br />
            <span className="text-bz-sage">clarity</span> and confidence
          </h1>
          <p className="mt-6 text-[17px] leading-[1.7] text-bz-text-muted max-w-[600px]">
            Streamline financial operations from ledger to report. Centralise cash flow, automate
            reconciliation and manage vendor payments in one high-fidelity interface.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Button variant="primary" size="lg" href="/contact" withArrow>
              Request Demo
            </Button>
            <Button variant="outline" size="lg" href="#features">
              View features
            </Button>
          </div>
        </div>

        <HeroDashboard />
      </Container>
    </Section>
  );
}

function HeroDashboard() {
  const stats = [
    { label: "Cash Position", value: "$1.24M" },
    { label: "Total Liabilities", value: "$482.4k" },
    { label: "Avg. DPO", value: "34.2 Days" },
  ];
  const nodes: Array<{ label: string; sub: string; active: boolean }> = [
    { label: "JE", sub: "Entry", active: false },
    { label: "AP", sub: "Approval", active: false },
    { label: "RECO", sub: "Reconciliation", active: true },
    { label: "BS", sub: "Reporting", active: false },
  ];

  return (
    <div className="mt-16 max-w-[1100px] mx-auto rounded-bz-2xl bg-bz-surface border border-bz-border
                    shadow-[0_25px_60px_-15px_rgba(0,0,0,0.12)] p-2">
      <div className="rounded-bz-xl bg-bz-bg border border-bz-border p-6 md:p-8 flex gap-8 flex-wrap">
        {/* Sidebar mock */}
        <div className="w-[200px] shrink-0 flex flex-col gap-4">
          <div className="h-10 rounded-bz-md bg-bz-border" />
          <div className="flex flex-col gap-2">
            <div className="h-3 rounded bg-bz-border-soft w-[75%]" />
            <div className="h-3 rounded bg-bz-border-soft w-[50%]" />
            <div className="h-3 rounded bg-bz-border-soft w-[65%]" />
          </div>
          <div className="pt-2 flex flex-col gap-2">
            <div className="h-8 rounded-bz-sm bg-bz-border-soft" />
            <div className="h-8 rounded-bz-sm bg-bz-border-soft" />
          </div>
        </div>

        {/* Content mock */}
        <div className="flex-1 min-w-[280px]">
          <div className="grid grid-cols-3 gap-4 mb-6">
            {stats.map((s) => (
              <div
                key={s.label}
                className="px-5 py-4 rounded-bz-lg bg-bz-surface border border-bz-border"
              >
                <p className="text-[9px] font-bold text-bz-text-soft uppercase tracking-[0.08em] mb-1.5">
                  {s.label}
                </p>
                <p className="text-[22px] font-bold text-bz-text">{s.value}</p>
              </div>
            ))}
          </div>

          <div className="px-7 py-7 rounded-bz-lg bg-bz-surface border border-bz-border">
            <div className="flex justify-between items-center mb-8">
              <h4 className="font-bold text-bz-text text-[14px]">Financial Workflow</h4>
              <PillBadge tone="accent" dot>
                LIVE
              </PillBadge>
            </div>

            <div className="relative flex justify-between items-center px-4">
              <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-px bg-bz-border" />
              {nodes.map((n) => (
                <div
                  key={n.label}
                  className={[
                    "relative z-10 size-11 rounded-full flex items-center justify-center text-[9px] font-bold",
                    n.active
                      ? "bg-bz-deep text-white shadow-[0_4px_12px_rgba(0,0,0,0.2)] ring-4 ring-white"
                      : "bg-bz-bg text-bz-text-soft border border-bz-border",
                  ].join(" ")}
                >
                  {n.label}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-3 px-2">
              {nodes.map((n) => (
                <span
                  key={n.sub}
                  className={[
                    "text-[9px] font-bold uppercase tracking-[0.08em]",
                    n.active ? "text-bz-text" : "text-bz-text-soft",
                  ].join(" ")}
                >
                  {n.sub}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── 2. FEATURE GRID ──────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: ClipboardList,
    title: "General Ledger",
    desc: "Centralise journal entries, chart of accounts and financial periods with high-fidelity accuracy.",
  },
  {
    icon: DollarSign,
    title: "Accounts Payable",
    desc: "Automate invoice processing and vendor payments with dynamic multi-level approval chains.",
  },
  {
    icon: CheckCircle2,
    title: "Smart Reconciliation",
    desc: "AI-driven bank statement matching that instantly reconciles ledger accounts with real-world bank data.",
  },
  {
    icon: Building2,
    title: "Multi-Entity Sync",
    desc: "Effortlessly manage global subsidiaries with automated intercompany eliminations and consolidations.",
  },
  {
    icon: Package,
    title: "Fixed Assets",
    desc: "Track depreciation, maintenance and asset lifecycle events automatically within the ledger.",
  },
  {
    icon: LineChart,
    title: "Real-time Reporting",
    desc: "Generate GAAP and IFRS compliant financial statements instantly at the click of a button.",
  },
];

function FeatureGridSection() {
  return (
    <Section tone="white" id="features">
      <Container>
        <SectionHeading
          eyebrow="Overview"
          title={
            <>
              A structured financial system
              <br />
              built for operational control
            </>
          }
          maxWidth={680}
          className="mb-14"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <Card key={title} tone="soft" pad="lg" hover="lift">
              <IconBadge tone="sage" size="md" className="mb-5">
                <Icon className="size-5" strokeWidth={1.8} />
              </IconBadge>
              <h3 className="font-bold text-[15px] text-bz-text mb-2">{title}</h3>
              <p className="text-[13px] text-bz-text-muted leading-[1.65]">{desc}</p>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}

// ─── 3. TECHNICAL SHOWCASE (dark) ─────────────────────────────────────────────
function TechnicalShowcaseSection() {
  return (
    <Section tone="dark">
      <Container>
        <SectionHeading
          eyebrow="Technical Showcase"
          eyebrowTone="accent"
          title={
            <>
              High-fidelity tools for the
              <br />
              modern finance team
            </>
          }
          tone="light"
          maxWidth={680}
          className="mb-14"
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <MultiEntityCard />
          <FinancialControlCard />
          <CashFlowCard />
          <FinancialIntegrationCard />
        </div>
      </Container>
    </Section>
  );
}

function MultiEntityCard() {
  const m = [
    { label: "Consolidated", value: "99.8%", accent: true },
    { label: "Tax Compl.", value: "A+" },
    { label: "Eliminations", value: "100%" },
  ];
  return (
    <Card tone="dark" pad="lg" className="min-h-[420px] flex flex-col justify-between">
      <div>
        <IconBadge tone="darkSurface" size="sm" className="mb-5">
          <Building2 className="size-4 text-bz-accent" strokeWidth={1.8} />
        </IconBadge>
        <h3 className="text-[18px] font-bold mb-2.5">Multi-Entity Management</h3>
        <p className="text-[13px] text-white/60 leading-[1.65] mb-9">
          Consolidate multiple subsidiaries with varying currencies into a single source of truth in
          seconds.
        </p>
      </div>
      <div className="bg-white/[0.04] rounded-bz-xl border border-white/10 p-5">
        <div className="flex items-center gap-3.5 mb-5">
          <div className="size-10 rounded-full bg-white/[0.06] flex items-center justify-center text-bz-accent font-bold text-[12px]">
            GL
          </div>
          <div>
            <p className="text-[13px] font-bold">Global Entities</p>
            <p className="text-[10px] text-white/40 uppercase tracking-[0.08em]">
              4 Active Markets
            </p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 text-center">
          {m.map((x) => (
            <div key={x.label}>
              <p className="text-[9px] text-white/40 uppercase tracking-[0.08em] mb-1">
                {x.label}
              </p>
              <p
                className={[
                  "text-[17px] font-bold",
                  x.accent ? "text-bz-accent" : "text-white",
                ].join(" ")}
              >
                {x.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

function FinancialControlCard() {
  const rows: Array<{
    abbr: string;
    label: string;
    chipBg: string;
    chipColor: string;
    status: "green" | "yellow" | null;
  }> = [
    { abbr: "M", label: "Manager Approval", chipBg: "bg-blue-500/20", chipColor: "text-blue-400", status: "green" },
    { abbr: "CF", label: "CFO Review > $50k", chipBg: "bg-bz-accent-mid", chipColor: "text-bz-accent", status: "yellow" },
    { abbr: "L", label: "Compliance Log", chipBg: "bg-white/[0.06]", chipColor: "text-white/40", status: null },
  ];
  return (
    <Card tone="dark" pad="lg" className="min-h-[420px] flex flex-col justify-between">
      <div>
        <IconBadge tone="darkSurface" size="sm" className="mb-5">
          <ShieldCheck className="size-4 text-bz-accent" strokeWidth={1.8} />
        </IconBadge>
        <h3 className="text-[18px] font-bold mb-2.5">Financial Control</h3>
        <p className="text-[13px] text-white/60 leading-[1.65] mb-7">
          Maintain strict fiscal hygiene with intelligent conditional routing and budget checks.
        </p>
      </div>
      <div className="flex flex-col gap-2.5">
        {rows.map((r) => (
          <div
            key={r.label}
            className={[
              "px-4 py-3.5 rounded-bz-md bg-white/[0.04] border border-white/10",
              "flex items-center justify-between",
              r.status === null && "opacity-50",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <div className="flex items-center gap-3">
              <div
                className={[
                  "size-7 rounded-bz-sm flex items-center justify-center text-[9px] font-bold",
                  r.chipBg,
                  r.chipColor,
                ].join(" ")}
              >
                {r.abbr}
              </div>
              <span className="text-[12px] font-medium text-white">{r.label}</span>
            </div>
            {r.status && (
              <div
                className={[
                  "size-4 rounded-full flex items-center justify-center",
                  r.status === "green" ? "bg-emerald-500/20" : "bg-yellow-500/20",
                ].join(" ")}
              >
                <div
                  className={[
                    "size-1.5 rounded-full",
                    r.status === "green" ? "bg-emerald-500" : "bg-yellow-400",
                  ].join(" ")}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}

function CashFlowCard() {
  const bars = [
    { pct: 75, color: "bg-bz-accent" },
    { pct: 50, color: "bg-white/40" },
    { pct: 25, color: "bg-blue-400" },
  ];
  return (
    <Card tone="dark" pad="lg" className="min-h-[360px] flex flex-col justify-between">
      <div>
        <IconBadge tone="darkSurface" size="sm" className="mb-5">
          <FileText className="size-4 text-bz-accent" strokeWidth={1.8} />
        </IconBadge>
        <h3 className="text-[18px] font-bold mb-2.5">Cash Flow Management</h3>
        <p className="text-[13px] text-white/60 leading-[1.65] mb-9">
          Dynamic forecasting and debt management with real-time aging reports.
        </p>
      </div>
      <div className="bg-white/[0.04] rounded-t-bz-xl border border-white/10 border-b-0 p-5">
        <div className="flex flex-col gap-3.5">
          {bars.map((b, i) => (
            <div
              key={i}
              className="h-2 bg-white/[0.06] rounded-bz-pill relative overflow-hidden"
            >
              <div
                className={`absolute inset-y-0 left-0 rounded-bz-pill ${b.color}`}
                style={{ width: `${b.pct}%` }}
              />
            </div>
          ))}
        </div>

       
      </div>
    </Card>
  );
}

function FinancialIntegrationCard() {
  const trail = [
    { trail: "Journal_Entry", ref: "#JE-2024-8821" },
    { trail: "Bank_Statement", ref: "#BS-990-22" },
    { trail: "Vendor_Invoice", ref: "#INV-AX-402" },
  ];
  return (
    <Card tone="dark" pad="lg" className="min-h-[360px]">
      <div className="flex justify-between items-start mb-5">
        <IconBadge tone="darkSurface" size="sm">
          <ClipboardList className="size-4 text-bz-accent" strokeWidth={1.8} />
        </IconBadge>
        <div className="text-right">
          <p className="text-[9px] font-bold text-white/40 uppercase tracking-[0.08em] mb-1">
            Audit Score
          </p>
          <p className="text-[26px] font-bold text-bz-accent leading-none">100%</p>
        </div>
      </div>
      <h3 className="text-[18px] font-bold mb-2.5">Financial Integration</h3>
      <p className="text-[13px] text-white/60 leading-[1.65] mb-7">
        Direct ledger posting and automated 3-way matching for absolute financial integrity.
      </p>
      <div>
        <div className="flex justify-between pb-2.5 border-b border-white/[0.06]
                        text-[9px] font-bold text-white/40 uppercase tracking-[0.08em]">
          <span>Digital Trail</span>
          <span>Source Node</span>
          <span>State</span>
        </div>
        {trail.map((r) => (
          <div
            key={r.trail}
            className="flex justify-between items-center py-2.5 border-b border-white/[0.04]
                       text-[10px] font-bold"
          >
            <span className="text-white">{r.trail}</span>
            <span className="text-white/60">{r.ref}</span>
            <div className="size-3 rounded-full bg-emerald-500/15 flex items-center justify-center">
              <div className="size-1 rounded-full bg-emerald-500" />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ─── 4. REPORTING — creative redesign ─────────────────────────────────────────
//   Concept: "Click any number, see its source."
//   12-col bento. Row 1: Live P&L (7) + Pre-built reports (5).
//   Row 2: Anomaly detection (5) + Drill-down audit trail (7).
function ReportingSection() {
  return (
    <Section tone="light">
      <Container>
        <SectionHeading
          eyebrow="Reporting"
          title={
            <>
              Click any number,
              <br />
              <span className="text-bz-sage">see its source.</span>
            </>
          }
          description="From the income statement down to the originating journal entry — every figure is live, traceable and audit-ready."
          maxWidth={720}
          className="mb-14"
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <LivePnLCard />
          <PreBuiltReportsCard />
          <AnomalyAlertsCard />
          <DrillTrailCard />
        </div>
      </Container>
    </Section>
  );
}

type PnLRow = {
  label: string;
  value: string;
  delta: string;
  trend: "up" | "down";
  intent: "good" | "bad" | "neutral";
  emphasis?: boolean;
};

function LivePnLCard() {
  const rows: PnLRow[] = [
    { label: "Revenue",            value: "$4.82M",  delta: "+12.4%", trend: "up",   intent: "good"    },
    { label: "Gross Profit",       value: "$2.91M",  delta: "60.3% margin", trend: "up", intent: "neutral" },
    { label: "Operating Expenses", value: "($1.84M)",delta: "+4.1%",  trend: "up",   intent: "bad"     },
    { label: "EBITDA",             value: "$1.07M",  delta: "+18.6%", trend: "up",   intent: "good"    },
    { label: "Net Income",         value: "$812K",   delta: "+22.1%", trend: "up",   intent: "good", emphasis: true },
  ];

  return (
    <Card pad="lg" className="lg:col-span-7">
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <IconBadge tone="sage" size="sm">
              <FileText className="size-4" strokeWidth={1.8} />
            </IconBadge>
            <h3 className="text-[16px] font-bold text-bz-text">Income Statement</h3>
          </div>
          <p className="text-[12px] text-bz-text-muted">
            Auto-consolidated from 4 entities · synced 2 minutes ago
          </p>
        </div>
        <div className="flex items-center gap-2">
          <PillBadge tone="neutral">FY2024 · Q3</PillBadge>
          <PillBadge tone="accent" dot>
            LIVE
          </PillBadge>
        </div>
      </div>

      <div className="rounded-bz-lg border border-bz-border overflow-hidden">
        {rows.map((r, i) => (
          <div
            key={r.label}
            className={[
              "flex items-center justify-between px-5 py-4",
              i !== rows.length - 1 && "border-b border-bz-border-soft",
              r.emphasis && "bg-bz-bg",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <div className="flex items-center gap-3 min-w-0">
              <span
                className={[
                  "size-1.5 rounded-full shrink-0",
                  r.emphasis ? "bg-bz-accent" : "bg-bz-border",
                ].join(" ")}
              />
              <span
                className={[
                  "text-[14px] truncate",
                  r.emphasis ? "font-bold text-bz-text" : "font-medium text-bz-text",
                ].join(" ")}
              >
                {r.label}
              </span>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {r.emphasis && (
                <svg width="64" height="20" viewBox="0 0 64 20" className="hidden sm:block">
                  <path
                    d="M0,15 L10,12 L20,14 L30,9 L40,10 L50,5 L64,2"
                    fill="none"
                    stroke="var(--bz-sage)"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
              )}
              <span
                className={[
                  "tabular-nums",
                  r.emphasis ? "text-[18px] font-bold text-bz-text" : "text-[14px] font-semibold text-bz-text",
                ].join(" ")}
              >
                {r.value}
              </span>
              <DeltaPill delta={r.delta} trend={r.trend} intent={r.intent} />
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mt-5 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <PillBadge tone="neutral">PDF</PillBadge>
          <PillBadge tone="neutral">XBRL</PillBadge>
          <PillBadge tone="neutral">Excel</PillBadge>
        </div>
        <a
          href="#"
          className="inline-flex items-center gap-1 text-[12px] font-bold text-bz-sage hover:text-bz-sage-hover"
        >
          Drill into accounts
          <ArrowUpRight className="size-3.5" strokeWidth={2} />
        </a>
      </div>
    </Card>
  );
}

function DeltaPill({
  delta,
  trend,
  intent,
}: {
  delta: string;
  trend: "up" | "down";
  intent: "good" | "bad" | "neutral";
}) {
  const TrendIcon = trend === "up" ? TrendingUp : TrendingDown;
  const tone =
    intent === "good"
      ? "bg-bz-sage-soft text-bz-sage"
      : intent === "bad"
      ? "bg-rose-500/10 text-rose-500"
      : "bg-bz-bg text-bz-text-muted border border-bz-border";
  return (
    <span
      className={[
        "inline-flex items-center gap-1 px-2 py-1 rounded-bz-pill",
        "text-[10.5px] font-bold tabular-nums",
        tone,
      ].join(" ")}
    >
      <TrendIcon className="size-3" strokeWidth={2.4} />
      {delta}
    </span>
  );
}

function PreBuiltReportsCard() {
  const reports = [
    { icon: FileText, name: "Income Statement", sub: "Live · streaming",   live: true  },
    { icon: Scale,    name: "Balance Sheet",    sub: "Updated 2m ago"                  },
    { icon: Activity, name: "Cash Flow",        sub: "Updated 5m ago"                  },
    { icon: Clock,    name: "AR Aging Report",  sub: "Updated 8m ago"                  },
    { icon: Clock,    name: "AP Aging Report",  sub: "Updated 12m ago"                 },
  ];
  return (
    <Card pad="lg" className="lg:col-span-5">
      <div className="flex items-start justify-between mb-5">
        <div>
          <Eyebrow>Always-on reports</Eyebrow>
          <h3 className="text-[16px] font-bold text-bz-text mt-1.5">Pre-built statements</h3>
        </div>
        <PillBadge tone="neutral">38 total</PillBadge>
      </div>

      <div className="flex flex-col gap-2">
        {reports.map(({ icon: Icon, name, sub, live }) => (
          <div
            key={name}
            className={[
              "group flex items-center gap-4 px-4 py-3.5 rounded-bz-lg border transition-colors",
              live
                ? "bg-bz-bg border-bz-accent-mid"
                : "bg-bz-surface border-bz-border-soft hover:border-bz-border",
            ].join(" ")}
          >
            <div
              className={[
                "size-9 rounded-bz-md flex items-center justify-center shrink-0",
                live ? "bg-bz-accent text-bz-deep" : "bg-bz-bg text-bz-sage",
              ].join(" ")}
            >
              <Icon className="size-4" strokeWidth={1.8} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13.5px] font-semibold text-bz-text truncate">{name}</p>
              <p className="text-[11px] text-bz-text-muted">{sub}</p>
            </div>
            {live ? (
              <PillBadge tone="accent" dot>
                LIVE
              </PillBadge>
            ) : (
              <ChevronRight className="size-4 text-bz-text-soft group-hover:text-bz-sage transition-colors" strokeWidth={2} />
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}

function AnomalyAlertsCard() {
  const alerts: Array<{
    icon: React.ElementType;
    title: string;
    sub: string;
    delta: string;
    intent: "bad" | "good" | "neutral";
  }> = [
    {
      icon: TrendingUp,
      title: "Marketing OpEx",
      sub: "Review Q3 brand campaigns",
      delta: "+18.4% vs budget",
      intent: "bad",
    },
    {
      icon: AlertTriangle,
      title: "AR aged 60+ rising",
      sub: "12 invoices · $284k overdue",
      delta: "Action needed",
      intent: "bad",
    },
    {
      icon: TrendingDown,
      title: "Travel expense",
      sub: "Tracking under target",
      delta: "−22% MoM",
      intent: "good",
    },
  ];

  return (
    <Card pad="lg" className="lg:col-span-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <Eyebrow>Anomaly detection</Eyebrow>
          <h3 className="text-[16px] font-bold text-bz-text mt-1.5">Variance, surfaced for you</h3>
        </div>
        <span className="inline-flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-[0.08em] text-bz-text-muted">
          <span className="size-1.5 rounded-full bg-bz-accent biz-pulse-glow" />
          Watching
        </span>
      </div>

      <div className="flex flex-col gap-2.5">
        {alerts.map(({ icon: Icon, title, sub, delta, intent }) => {
          const tone =
            intent === "bad"
              ? "bg-rose-500/10 text-rose-500"
              : intent === "good"
              ? "bg-bz-sage-soft text-bz-sage"
              : "bg-bz-bg text-bz-text-muted";
          return (
            <div
              key={title}
              className="flex items-center gap-3.5 px-4 py-3.5 rounded-bz-lg bg-bz-surface border border-bz-border"
            >
              <div className={`size-9 rounded-bz-md flex items-center justify-center shrink-0 ${tone}`}>
                <Icon className="size-4" strokeWidth={2} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-bz-text">{title}</p>
                <p className="text-[11px] text-bz-text-muted">{sub}</p>
              </div>
              <span
                className={[
                  "shrink-0 px-2 py-1 rounded-bz-pill text-[10.5px] font-bold tabular-nums",
                  tone,
                ].join(" ")}
              >
                {delta}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function DrillTrailCard() {
  const path = [
    { label: "Net Income",       value: "$812K"   },
    { label: "Operating Expenses", value: "$1.84M" },
    { label: "Marketing",        value: "$284K"   },
    { label: "Q3 Brand Campaign", value: "$48,200", final: true },
  ];
  const journal = [
    { date: "14 · Sep", ref: "JE-2024-8412", desc: "Brand agency · Sept retainer", amt: "$24,000" },
    { date: "21 · Sep", ref: "JE-2024-8593", desc: "Digital ads · Q3 LinkedIn", amt: "$18,400" },
    { date: "28 · Sep", ref: "JE-2024-8721", desc: "Event sponsorship · DXTalks", amt: "$5,800" },
  ];
  return (
    <Card pad="lg" className="lg:col-span-7">
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <Eyebrow>Audit Trail</Eyebrow>
          <h3 className="text-[16px] font-bold text-bz-text mt-1.5">
            Every number resolves to its source
          </h3>
        </div>
        <PillBadge tone="sage">
          <Sparkles className="size-3 mr-0.5" strokeWidth={2} />
          One click
        </PillBadge>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-6">
        {path.map((p, i) => (
          <div key={p.label} className="flex items-center gap-2">
            <div
              className={[
                "px-3 py-2 rounded-bz-md text-[11.5px] font-bold tabular-nums flex items-center gap-2",
                p.final
                  ? "bg-bz-deep text-white"
                  : "bg-bz-bg text-bz-text border border-bz-border",
              ].join(" ")}
            >
              <span className={p.final ? "text-white/50" : "text-bz-text-muted"}>{p.label}</span>
              <span>{p.value}</span>
            </div>
            {i !== path.length - 1 && (
              <ChevronRight className="size-3.5 text-bz-text-soft" strokeWidth={2.2} />
            )}
          </div>
        ))}
      </div>

      <div className="rounded-bz-lg border border-bz-border-soft overflow-hidden">
        <div className="grid grid-cols-[80px_1fr_100px] gap-3 px-4 py-2.5 bg-bz-bg
                        text-[9.5px] font-bold uppercase tracking-[0.08em] text-bz-text-soft">
          <span>Date</span>
          <span>Reference · Description</span>
          <span className="text-right">Amount</span>
        </div>
        {journal.map((j, i) => (
          <div
            key={j.ref}
            className={[
              "grid grid-cols-[80px_1fr_100px] gap-3 px-4 py-3 items-center",
              i !== journal.length - 1 && "border-b border-bz-border-soft",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <span className="text-[11px] font-medium text-bz-text-muted">{j.date}</span>
            <div className="min-w-0">
              <p className="text-[12px] font-bold text-bz-text">{j.ref}</p>
              <p className="text-[11px] text-bz-text-muted truncate">{j.desc}</p>
            </div>
            <span className="text-right text-[13px] font-bold text-bz-text tabular-nums">
              {j.amt}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ─── 5. CONNECTIVITY — creative redesign ──────────────────────────────────────
//   Concept: "One ledger. Every module."
//   Six source-module chips (3 top + 3 bottom) feed a centered Live General Ledger
//   panel that streams 5 auto-posted journal rows.
function ConnectivitySection() {
  const sourcesTop = [
    { icon: ShoppingCart,   label: "Sales",        sub: "Invoice · Cash" },
    { icon: Database,       label: "Purchasing",   sub: "PO · 3-way match" },
    { icon: Package,        label: "Inventory",    sub: "COGS · Asset sync" },
  ];
  const sourcesBottom = [
    { icon: Factory,       label: "Manufacturing", sub: "Work order · WIP" },
    { icon: FolderKanban,  label: "Projects",      sub: "Timesheet · Cost" },
    { icon: Landmark,      label: "Banking",       sub: "Reconcile · Fees" },
  ];

  const journal = [
    { time: "14:32", source: "SALES",    sourceTone: "sage",    dr: "AR", cr: "Revenue · Tax",       amt: "$48,200",  fresh: true  },
    { time: "14:28", source: "PURCH",    sourceTone: "accent",  dr: "Inventory", cr: "AP",            amt: "$12,450"               },
    { time: "14:25", source: "PAYROLL",  sourceTone: "neutral", dr: "Wages", cr: "Cash",              amt: "$284,100"              },
    { time: "14:21", source: "BANK",     sourceTone: "neutral", dr: "Bank Fees", cr: "Cash",          amt: "$182"                  },
    { time: "14:18", source: "INVENT",   sourceTone: "sage",    dr: "COGS", cr: "Inventory",          amt: "$36,800"               },
  ];

  return (
    <Section tone="dark">
      <Container width="narrow">
        <SectionHeading
          eyebrow="Connected by design"
          eyebrowTone="accent"
          title={
            <>
              One ledger.
              <br />
              <span className="text-bz-accent">Every module.</span>
            </>
          }
          description="Every event in Bizak — a shipment, a payment, a payroll run — auto-posts to the General Ledger in real time. No manual coding. No month-end catch-up."
          tone="light"
          align="center"
          maxWidth={720}
          className="mb-16"
        />

        <div className="relative max-w-[1100px] mx-auto">
          {/* Top row of sources */}
          <div className="grid grid-cols-3 gap-3 sm:gap-5 mb-3">
            {sourcesTop.map((s) => (
              <SourceChip key={s.label} icon={s.icon} label={s.label} sub={s.sub} />
            ))}
          </div>

          {/* Connector row top */}
          <div className="grid grid-cols-3 gap-3 sm:gap-5 h-8">
            {sourcesTop.map((_, i) => (
              <Connector key={i} direction="down" />
            ))}
          </div>

          {/* Live General Ledger panel */}
          <Card tone="dark" pad="lg" className="overflow-hidden">
            <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-bz-md bg-bz-accent flex items-center justify-center text-bz-deep">
                  <BookOpen className="size-4" strokeWidth={2} />
                </div>
                <div>
                  <p className="text-[14px] font-bold text-white">General Ledger</p>
                  <p className="text-[10.5px] text-white/40 uppercase tracking-[0.08em]">
                    Auto-posting engine
                  </p>
                </div>
              </div>
              <PillBadge tone="accent" dot>
                LIVE
              </PillBadge>
            </div>

            <div className="rounded-bz-lg border border-white/10 overflow-hidden">
              <div className="hidden md:grid grid-cols-[68px_92px_1fr_120px_72px] gap-3 px-4 py-2.5
                              bg-white/[0.04] text-[9.5px] font-bold uppercase tracking-[0.08em] text-white/40">
                <span>Time</span>
                <span>Source</span>
                <span>Debit · Credit</span>
                <span className="text-right">Amount</span>
                <span></span>
              </div>
              {journal.map((j, i) => (
                <div
                  key={i}
                  className={[
                    "grid grid-cols-[68px_92px_1fr_120px_72px] gap-3 px-4 py-3 items-center",
                    i !== journal.length - 1 && "border-b border-white/[0.06]",
                    j.fresh && "bg-bz-accent/[0.04]",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <span className="text-[11px] tabular-nums text-white/50">{j.time}</span>
                  <SourceTag tone={j.sourceTone as "sage" | "accent" | "neutral"} label={j.source} />
                  <p className="text-[12px] text-white/80 truncate">
                    <span className="text-white font-semibold">{j.dr}</span>
                    <span className="mx-1.5 text-white/30">↔</span>
                    <span>{j.cr}</span>
                  </p>
                  <span className="text-right text-[13px] font-bold text-white tabular-nums">
                    {j.amt}
                  </span>
                  <span className="text-right">
                    {j.fresh ? (
                      <PillBadge tone="accent">JUST</PillBadge>
                    ) : (
                      <CheckCircle2 className="size-4 text-emerald-400/70 ml-auto" strokeWidth={1.8} />
                    )}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between mt-5 flex-wrap gap-3
                            text-[11px] text-white/50">
              <span className="inline-flex items-center gap-2">
                <CircleDollarSign className="size-3.5 text-bz-accent" strokeWidth={2} />
                <span className="font-bold tabular-nums text-white">247</span> entries auto-posted today
              </span>
              <span className="font-bold tracking-[0.08em] uppercase text-[10.5px]">
                0 manual journal entries
              </span>
            </div>
          </Card>

          {/* Connector row bottom */}
          <div className="grid grid-cols-3 gap-3 sm:gap-5 h-8">
            {sourcesBottom.map((_, i) => (
              <Connector key={i} direction="up" />
            ))}
          </div>

          {/* Bottom row of sources */}
          <div className="grid grid-cols-3 gap-3 sm:gap-5 mt-3">
            {sourcesBottom.map((s) => (
              <SourceChip key={s.label} icon={s.icon} label={s.label} sub={s.sub} />
            ))}
          </div>
        </div>

        {/* Trust pills */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
          {[
            { icon: ShieldCheck, label: "No manual coding"      },
            { icon: Activity,    label: "Real-time posting"     },
            { icon: ClipboardList, label: "Full audit trail"    },
            { icon: Building2,   label: "Multi-entity ready"    },
          ].map(({ icon: Icon, label }) => (
            <span
              key={label}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-bz-pill
                         bg-white/[0.04] border border-white/10
                         text-[11px] font-bold uppercase tracking-[0.08em] text-white/70"
            >
              <Icon className="size-3.5 text-bz-accent" strokeWidth={2} />
              {label}
            </span>
          ))}
        </div>
      </Container>
    </Section>
  );
}

function SourceChip({
  icon: Icon,
  label,
  sub,
}: {
  icon: React.ElementType;
  label: string;
  sub: string;
}) {
  return (
    <div className="px-4 py-3.5 rounded-bz-lg bg-white/[0.04] border border-white/10
                    flex items-center gap-3 min-w-0">
      <div className="size-9 rounded-bz-md bg-white/[0.06] border border-white/10
                      flex items-center justify-center text-white/80 shrink-0">
        <Icon className="size-4" strokeWidth={1.8} />
      </div>
      <div className="min-w-0">
        <p className="text-[12.5px] font-bold text-white truncate">{label}</p>
        <p className="text-[10px] uppercase tracking-[0.08em] text-white/40 truncate">{sub}</p>
      </div>
    </div>
  );
}

function Connector({ direction }: { direction: "up" | "down" }) {
  return (
    <div className="relative flex items-center justify-center">
      <span className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-white/10" />
      <span
        className={[
          "absolute size-1.5 rounded-full bg-bz-accent biz-pulse-glow",
          direction === "down" ? "bottom-0" : "top-0",
        ].join(" ")}
      />
    </div>
  );
}

function SourceTag({
  tone,
  label,
}: {
  tone: "sage" | "accent" | "neutral";
  label: string;
}) {
  const cls =
    tone === "sage"
      ? "bg-bz-sage-soft text-bz-sage border border-bz-sage-mid"
      : tone === "accent"
      ? "bg-bz-accent-soft text-bz-accent border border-bz-accent-mid"
      : "bg-white/[0.06] text-white/70 border border-white/10";
  return (
    <span
      className={[
        "inline-flex items-center justify-center w-fit px-2 py-0.5 rounded-bz-sm",
        "text-[9.5px] font-bold uppercase tracking-[0.08em] tabular-nums",
        cls,
      ].join(" ")}
    >
      {label}
    </span>
  );
}

// ─── 6. METRICS ──────────────────────────────────────────────────────────────
function MetricsSection() {
  const metrics = [
    {
      value: "60%",
      label: "Faster Month-End",
      desc: "Automated reconciliation and elimination workflows reduce close times by more than half.",
    },
    {
      value: "40%",
      label: "Reduced Errors",
      desc: "Eliminate manual data entry errors with direct bank feeds and automated ledger posting.",
    },
    {
      value: "100%",
      label: "Audit Compliance",
      desc: "A complete digital paper trail for every transaction, ensuring effortless regulatory reporting.",
    },
  ];
  return (
    <Section tone="white">
      <Container>
        <SectionHeading
          eyebrow="Efficiency"
          title="Measurable impact on financial operations"
          align="center"
          maxWidth={780}
          className="mb-14"
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {metrics.map((m) => (
            <Card key={m.label} pad="lg" hover="lift" className="text-center">
              <p className="text-[clamp(40px,4vw,52px)] font-bold text-bz-text tracking-[-0.03em] mb-3">
                {m.value}
              </p>
              <p className="text-[10px] font-bold text-bz-text-soft uppercase tracking-[0.12em] mb-4">
                {m.label}
              </p>
              <p className="text-[13px] text-bz-text-muted leading-[1.65]">{m.desc}</p>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}

// ─── 7. CTA ──────────────────────────────────────────────────────────────────
//   Closing CTA must use tone="dark" (the olive-tinted bz-deep) for visual
//   consistency with the by-industry pages' IndustryCta. See
//   /docs/BIZAK_PRODUCT_OVERVIEW.md §7.1.
function CTASection() {
  return (
    <Section tone="dark" pad="default">
      <Container width="narrow">
        <div className="flex flex-col items-center text-center gap-7">
          <SectionHeading
            title={
              <>
                Take full control of
                <br />
                your financial operations
              </>
            }
            description="Join 50,000+ companies scaling with Bizak. Start your 14-day free trial today."
            tone="light"
            align="center"
            maxWidth={640}
          />
          <div className="flex flex-wrap justify-center gap-3">
            <Button variant="accent" size="lg" href="/contact" withArrow>
              Request Demo
            </Button>
            <Button variant="ghostDark" size="lg" href="/contact">
              Contact Sales
            </Button>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 mt-2 text-[12px] text-white/45">
            <span className="inline-flex items-center gap-2">
              <CheckCircle2 className="size-3.5 text-bz-accent" strokeWidth={2} />
              GAAP &amp; IFRS ready
            </span>
            <span className="inline-flex items-center gap-2">
              <CheckCircle2 className="size-3.5 text-bz-accent" strokeWidth={2} />
              SOC 2 Type II
            </span>
            <span className="inline-flex items-center gap-2">
              <CheckCircle2 className="size-3.5 text-bz-accent" strokeWidth={2} />
              Multi-currency
            </span>
          </div>
        </div>
      </Container>
    </Section>
  );
}

// ─── PAGE EXPORT ──────────────────────────────────────────────────────────────
export function FinancialManagementPage() {
  return (
    <>
      <HeroSection />
      <FeatureGridSection />
      <TechnicalShowcaseSection />
      <ReportingSection />
      <ConnectivitySection />
      <MetricsSection />
      <CTASection />
    </>
  );
}
