import "../../styles/style.css";
import * as React from "react";
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock,
  Contact,
  DollarSign,
  FileText,
  Landmark,
  Link2,
  Package,
  Receipt,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Users,
  UsersRound,
  Workflow,
} from "lucide-react";
import {
  BadgeGreen,
  Bento,
  BentoGrid,
  Container,
  DataRow,
  DotGrid,
  EntityRow,
  Heading,
  HeroCanvas,
  HeroCard,
  MiniBars,
  Pill,
  Section,
  SectionHead,
  StatusChip,
  StripeBar,
} from "./bz";

// ════════════════════════════════════════════════════════════════════════════
// CONTENT DATA
// ════════════════════════════════════════════════════════════════════════════

const CAPABILITIES = [
  {
    icon: UsersRound,
    title: "Lead Management",
    desc: "Centralise lead details, scoring and contact history in a unified customer view.",
  },
  {
    icon: Workflow,
    title: "Deal Pipeline",
    desc: "Dynamic deal stages based on probability, department and project complexity.",
  },
  {
    icon: Contact,
    title: "Customer 360",
    desc: "Instant customer insights with full history of communication, deals and invoices.",
  },
  {
    icon: FileText,
    title: "Quotation & Orders",
    desc: "Direct quote generation with real-time pricing and automated sales-order creation.",
  },
  {
    icon: Activity,
    title: "Activity Tracking",
    desc: "Deal stages update automatically on every interaction, email or status change.",
  },
  {
    icon: BarChart3,
    title: "Sales Reporting",
    desc: "Deep insights into conversion patterns and revenue-growth opportunities.",
  },
] as const;

const METRICS = [
  {
    value: "30%",
    label: "Faster closure",
    desc: "Automated follow-ups and approval routing cut sales-cycle times in half.",
  },
  {
    value: "25%",
    label: "Higher conversion",
    desc: "Data-driven win-probability scoring lifts close rates on enterprise pipeline.",
  },
  {
    value: "100%",
    label: "Audit coverage",
    desc: "Every quote, order and invoice posts straight to the ledger with full trail.",
  },
] as const;

// ════════════════════════════════════════════════════════════════════════════
// [HERO]
// ════════════════════════════════════════════════════════════════════════════

function HeroSection() {
  return (
    <Section tone="b" pad="hero">
      <Container>
        <div className="flex flex-col items-center text-center">
          <BadgeGreen style={{ marginBottom: 28 }}>Sales &amp; CRM</BadgeGreen>

          <Heading level={2} style={{ marginBottom: 36 }}>
            From first lead to final payment,{" "}
            <Heading.Muted>one connected pipeline on one ledger.</Heading.Muted>
          </Heading>

          <div className="flex flex-wrap justify-center gap-[10px]">
            <Pill variant="dark" withTick href="/contact">
              Request Demo
            </Pill>
            <Pill variant="light" iconLeft={<Sparkles size={13} />} href="#features">
              View features
            </Pill>
          </div>
        </div>

        <HeroCanvas>
          <HeroCard
            icon={<Users size={12} />}
            title="Live pipeline"
            badge="Live"
            badgeVariant="live"
            eyebrow="Open opportunities · Q3"
            value="$84.2M"
          >
            <div className="rounded-bz-lg bg-bz-paper-warm p-3">
              <DataRow
                label="Deals advanced this week"
                value="32 stage moves"
                emphasis
                className="mb-1.5"
              />
              <MiniBars values={[35, 55, 48, 72, 60, 84, 92]} highlightLast />
            </div>
          </HeroCard>

          <HeroCard
            icon={<Receipt size={12} />}
            title="Sales Order SO-1041"
            badge="Posted"
            badgeVariant="posted"
            eyebrow="Axeon Logistics · Won"
            value="$48,200"
          >
            <div className="flex flex-col gap-1.5 rounded-bz-lg bg-bz-paper-warm px-3 py-2.5">
              <DataRow label="AR" value="+$48,200.00" />
              <DataRow label="Revenue · VAT 19%" value="+$40,505 · +$7,695" />
            </div>
          </HeroCard>
        </HeroCanvas>
      </Container>
    </Section>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// [01] FOUNDATIONS
// ════════════════════════════════════════════════════════════════════════════

function FoundationsSection() {
  return (
    <Section tone="a" id="features">
      <Container>
        <SectionHead
          index="01"
          label="Overview"
          title={
            <>
              A structured sales system,{" "}
              <Heading.Muted>built for operational control.</Heading.Muted>
            </>
          }
          titleMaxWidth={760}
        />

        <BentoGrid cols={3}>
          {CAPABILITIES.map(({ icon: Icon, title, desc }) => (
            <Bento key={title} tone="paper" hover minHeight={220}>
              <Bento.Header
                title={title}
                icon={<Icon size={26} strokeWidth={1.4} color="#1F3422" />}
              />
              <Bento.Desc>{desc}</Bento.Desc>
            </Bento>
          ))}
        </BentoGrid>
      </Container>
    </Section>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// [02] TECHNICAL SHOWCASE
// ════════════════════════════════════════════════════════════════════════════

function TechnicalShowcaseSection() {
  return (
    <Section tone="b">
      <Container>
        <SectionHead
          index="02"
          label="Technical showcase"
          title={
            <>
              High-fidelity tools{" "}
              <Heading.Muted>for the modern sales team.</Heading.Muted>
            </>
          }
          titleMaxWidth={720}
        />

        <BentoGrid cols={2}>
          <PipelineIntelligenceBento />
          <SmartFollowupsBento />
          <QuotationBuilderBento />
          <CustomerInsightsBento />
        </BentoGrid>
      </Container>
    </Section>
  );
}

function PipelineIntelligenceBento() {
  const metrics = [
    { label: "Win probability", value: "92.4%", accent: true },
    { label: "Lead grade", value: "A+" },
    { label: "Touchpoints", value: "12 total" },
  ];
  return (
    <Bento tone="dark" hover dotGrid minHeight={360}>
      <Bento.Header
        title="Pipeline intelligence"
        icon={<ShieldCheck size={26} strokeWidth={1.4} color="#DBE9B8" />}
      />
      <Bento.Desc>
        Maintain a high-performance sales engine with automated win-probability scoring and
        real-time stage tracking.
      </Bento.Desc>
      <Bento.Footer tone="dark" className="flex flex-col gap-3.5">
        <div className="flex items-center gap-3">
          <span className="inline-flex size-10 items-center justify-center rounded-bz-md bg-white/[0.06] text-[12px] font-semibold text-bz-fire">
            AX
          </span>
          <div className="min-w-0">
            <p className="truncate text-[12.5px] font-medium text-bz-text-on-dark">
              Axeon Logistics
            </p>
            <p className="truncate text-[10.5px] uppercase tracking-[0.08em] text-white/[0.55]">
              Active prospect · Enterprise tier
            </p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 border-t border-white/[0.06] pt-3">
          {metrics.map((m) => (
            <div key={m.label}>
              <div className="mb-1 text-[9.5px] font-medium uppercase tracking-[0.08em] text-white/[0.55]">
                {m.label}
              </div>
              <div
                className={
                  m.accent
                    ? "text-[13px] font-medium tabular-nums text-bz-fire"
                    : "text-[13px] font-medium tabular-nums text-bz-text-on-dark"
                }
              >
                {m.value}
              </div>
            </div>
          ))}
        </div>
      </Bento.Footer>
    </Bento>
  );
}

function SmartFollowupsBento() {
  const rows: Array<{ label: string; status: "ok" | "review" | "muted" }> = [
    { label: "Sequence approval", status: "ok" },
    { label: "Review pipeline > $50k", status: "review" },
    { label: "Engagement log", status: "muted" },
  ];
  return (
    <Bento tone="paper" hover minHeight={360}>
      <Bento.Header
        title="Smart follow-ups"
        icon={<Link2 size={26} strokeWidth={1.4} color="#1F3422" />}
      />
      <Bento.Desc>
        Dynamic multi-level engagement chains with conditional routing — every touch logged, every
        deal nudged forward.
      </Bento.Desc>
      <Bento.Footer tone="light" className="flex flex-col gap-1.5">
        {rows.map((r) => (
          <div
            key={r.label}
            className="flex items-center justify-between rounded-bz-md bg-bz-paper-warm px-3 py-2.5"
          >
            <span className="text-[12px] font-medium text-bz-text">{r.label}</span>
            <span
              className={
                r.status === "ok"
                  ? "size-1.5 rounded-bz-pill bg-emerald-500"
                  : r.status === "review"
                  ? "size-1.5 rounded-bz-pill bg-bz-fire"
                  : "size-1.5 rounded-bz-pill bg-bz-line"
              }
            />
          </div>
        ))}
      </Bento.Footer>
    </Bento>
  );
}

function QuotationBuilderBento() {
  return (
    <Bento tone="leaf" hover minHeight={300}>
      <Bento.Header
        title="Quotation builder"
        icon={<FileText size={26} strokeWidth={1.4} color="#1F3422" />}
      />
      <Bento.Desc style={{ color: "#1F3422", opacity: 0.78 }}>
        Generate quotes in seconds with live pricing, approval routing and one-click conversion to
        sales orders.
      </Bento.Desc>
      <Bento.Footer className="bg-[rgba(31,52,34,0.08)] flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[10.5px] font-medium uppercase tracking-[0.08em] text-[#1F3422]">
            QT-2024-8821
          </span>
          <span className="rounded-bz-pill bg-amber-500/15 px-2 py-0.5 text-[9.5px] font-medium uppercase tracking-[0.06em] text-amber-700">
            Pending
          </span>
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="h-1.5 w-full overflow-hidden rounded-bz-pill bg-[rgba(31,52,34,0.12)]">
            <div className="h-full w-[88%] rounded-bz-pill bg-[#1F3422]" />
          </div>
          <div className="h-1.5 w-3/4 overflow-hidden rounded-bz-pill bg-[rgba(31,52,34,0.12)]">
            <div className="h-full w-[62%] rounded-bz-pill bg-[#1F3422]" />
          </div>
        </div>
      </Bento.Footer>
    </Bento>
  );
}

function CustomerInsightsBento() {
  const trail = [
    { trail: "Purchase_Order", ref: "#PO-2024-8821" },
    { trail: "Goods_Receipt", ref: "#GRN-990-22" },
    { trail: "Vendor_Invoice", ref: "#INV-AX-402" },
  ];
  return (
    <Bento tone="dark" hover minHeight={300}>
      <Bento.Header
        title="Customer insights"
        icon={<Contact size={26} strokeWidth={1.4} color="#DBE9B8" />}
      />
      <Bento.Desc>
        Direct ledger posting with automated 3-way matching across orders, receipts and invoices —
        100% audit score on every transaction.
      </Bento.Desc>
      <Bento.Footer tone="dark" className="flex flex-col gap-1.5">
        {trail.map((r) => (
          <div
            key={r.ref}
            className="flex items-center justify-between rounded-bz-md bg-white/[0.04] px-3 py-2"
          >
            <span className="text-[11.5px] text-bz-text-on-dark">{r.trail}</span>
            <span className="text-[10.5px] text-white/[0.62]">{r.ref}</span>
          </div>
        ))}
      </Bento.Footer>
    </Bento>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// [03] REPORTING — sales intelligence
// ════════════════════════════════════════════════════════════════════════════

function ReportingSection() {
  return (
    <Section tone="a">
      <Container>
        <SectionHead
          index="03"
          label="Reporting"
          title={
            <>
              Click any deal,{" "}
              <Heading.Muted>see the full revenue trail.</Heading.Muted>
            </>
          }
          description="From quarterly revenue down to the originating quote — every figure on a sales dashboard resolves to its source transaction."
          titleMaxWidth={780}
        />

        <BentoGrid cols={12}>
          <Bento tone="paper" span={8} minHeight={420}>
            <RevenueAnalyticsPanel />
          </Bento>
          <Bento tone="paper" span={4} minHeight={420}>
            <SalesKpiPanel />
          </Bento>
          <Bento tone="paper" span={5} minHeight={380}>
            <TopAccountsPanel />
          </Bento>
          <Bento tone="paper" span={7} minHeight={380}>
            <DealTrailPanel />
          </Bento>
        </BentoGrid>
      </Container>
    </Section>
  );
}

function RevenueAnalyticsPanel() {
  return (
    <>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="mb-1.5 flex items-center gap-2">
            <span className="inline-flex size-7 items-center justify-center rounded-bz-md bg-bz-leaf text-[#1F3422]">
              <TrendingUp size={14} strokeWidth={1.8} />
            </span>
            <h3 className="text-[15px] font-medium text-bz-text">Executive revenue analytics</h3>
          </div>
          <p className="text-[12px] text-bz-text-muted">
            Consolidated global entity performance · synced 2 minutes ago
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StatusChip variant="posted">FY2024</StatusChip>
          <StatusChip variant="live">Live</StatusChip>
        </div>
      </div>

      <div className="relative h-[220px] overflow-hidden rounded-bz-lg border border-bz-line-soft bg-bz-paper-warm p-4">
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 800 200"
          fill="none"
          preserveAspectRatio="none"
        >
          <path
            d="M0 150C50 150 100 80 150 100C200 120 250 180 300 160C350 140 400 40 450 60C500 80 550 140 600 120C650 100 700 20 750 40"
            stroke="var(--bz-olive)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <path
            d="M0 120C50 120 100 150 150 130C200 110 250 80 300 100C350 120 400 160 450 140C500 120 550 40 600 60"
            stroke="var(--bz-text-muted)"
            strokeDasharray="8 8"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
        <div className="absolute left-1/2 top-[28%] -translate-x-1/2 rounded-bz-md border border-bz-line-soft bg-bz-paper px-3 py-2 text-center whitespace-nowrap">
          <div className="mb-0.5 text-[9px] font-medium uppercase tracking-[0.1em] text-bz-text-muted">
            Peak revenue
          </div>
          <div className="text-[15px] font-medium tabular-nums text-bz-text">$1.24M</div>
          <div className="text-[9px] text-bz-text-muted">Vendor: Asia Manufacturing</div>
        </div>
      </div>

      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-5">
        <div className="flex items-center gap-2">
          <StatusChip variant="posted">PDF</StatusChip>
          <StatusChip variant="posted">Excel</StatusChip>
          <StatusChip variant="posted">CSV</StatusChip>
        </div>
        <a
          href="#"
          className="inline-flex items-center gap-1 text-[12px] font-medium text-bz-text hover:text-bz-text-muted"
        >
          Drill into deals
          <ArrowUpRight size={13} strokeWidth={2} />
        </a>
      </div>
    </>
  );
}

function SalesKpiPanel() {
  const tiles: Array<{
    icon: React.ElementType;
    label: string;
    value: string;
    sub?: string;
    intent?: "good" | "bad" | "neutral";
    bar?: number;
  }> = [
    { icon: TrendingUp, label: "Win rate", value: "64.2%", sub: "↑ 4.2%", intent: "good" },
    { icon: DollarSign, label: "Avg deal", value: "$428k", sub: "Target met", intent: "neutral" },
    { icon: Clock, label: "Cycle time", value: "3.2d", sub: "↓ 12%", intent: "good" },
    { icon: CheckCircle2, label: "Quota util.", value: "74%", bar: 74 },
  ];
  return (
    <>
      <div className="mb-4 flex items-start justify-between">
        <div>
          <div className="text-[11px] font-medium uppercase tracking-[0.12em] text-bz-text-muted">
            This quarter
          </div>
          <h3 className="mt-1.5 text-[15px] font-medium text-bz-text">Sales KPIs</h3>
        </div>
        <StatusChip variant="posted">Q3</StatusChip>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {tiles.map(({ icon: Icon, label, value, sub, intent, bar }) => (
          <div
            key={label}
            className="rounded-bz-lg border border-bz-line-soft bg-bz-paper-warm p-3.5"
          >
            <Icon size={18} strokeWidth={1.8} className="text-bz-text" />
            <div className="mt-3.5">
              <div className="mb-1 text-[10px] font-medium uppercase tracking-[0.1em] text-bz-text-muted">
                {label}
              </div>
              <div className="text-[18px] font-medium tabular-nums text-bz-text">{value}</div>
              {sub && (
                <div
                  className={
                    intent === "good"
                      ? "mt-1 text-[10.5px] font-medium text-emerald-700"
                      : intent === "bad"
                      ? "mt-1 text-[10.5px] font-medium text-rose-600"
                      : "mt-1 text-[10.5px] font-medium text-bz-text-muted"
                  }
                >
                  {sub}
                </div>
              )}
              {bar !== undefined && (
                <div className="mt-2.5">
                  <StripeBar pct={bar} />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function TopAccountsPanel() {
  const accounts = [
    { flag: "🇺🇸", name: "Axeon Logistics", amount: "$1.24M", pct: 38 },
    { flag: "🇩🇪", name: "Helio Distribution", amount: "€820k", pct: 24 },
    { flag: "🇬🇧", name: "Northwind Retail", amount: "£540k", pct: 18 },
    { flag: "🇯🇵", name: "Sakai Manufacturing", amount: "¥28M", pct: 12 },
  ];
  return (
    <>
      <div className="mb-4 flex items-start justify-between">
        <div>
          <div className="text-[11px] font-medium uppercase tracking-[0.12em] text-bz-text-muted">
            By revenue
          </div>
          <h3 className="mt-1.5 text-[15px] font-medium text-bz-text">Top accounts</h3>
        </div>
        <StatusChip variant="posted">YTD</StatusChip>
      </div>

      <div className="flex flex-col gap-2.5">
        {accounts.map((a) => (
          <div key={a.name}>
            <EntityRow flag={a.flag} name={a.name} amount={a.amount} />
            <div className="mt-1.5">
              <StripeBar pct={a.pct} />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function DealTrailPanel() {
  const path = [
    { label: "Q3 Revenue", value: "$4.82M" },
    { label: "Enterprise", value: "$1.84M" },
    { label: "Axeon", value: "$1.24M" },
    { label: "SO-1041", value: "$48,200", final: true },
  ];
  const events = [
    { date: "14 · Sep", ref: "QT-2024-8821", desc: "Quote issued · Net 30",       amt: "$48,200" },
    { date: "21 · Sep", ref: "SO-1041",      desc: "Sales order · Approved",      amt: "$48,200" },
    { date: "28 · Sep", ref: "INV-2046",     desc: "Invoice posted · AR / Rev.",  amt: "$48,200" },
  ];
  return (
    <>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-[11px] font-medium uppercase tracking-[0.12em] text-bz-text-muted">
            Audit trail
          </div>
          <h3 className="mt-1.5 text-[15px] font-medium text-bz-text">
            Revenue → deal → invoice
          </h3>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-bz-pill bg-bz-leaf px-2.5 py-1 text-[10.5px] font-medium text-[#1F3422]">
          <Sparkles size={11} strokeWidth={2} />
          One click
        </span>
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-2">
        {path.map((p, i) => (
          <div key={p.label} className="flex items-center gap-2">
            <div
              className={[
                "flex items-center gap-2 rounded-bz-md px-3 py-2 text-[11.5px] font-medium tabular-nums",
                p.final
                  ? "bg-bz-olive text-bz-text-on-dark"
                  : "border border-bz-line-soft bg-bz-paper text-bz-text",
              ].join(" ")}
            >
              <span className={p.final ? "text-white/[0.62]" : "text-bz-text-muted"}>{p.label}</span>
              <span>{p.value}</span>
            </div>
            {i !== path.length - 1 && (
              <ChevronRight size={13} strokeWidth={2.2} className="text-bz-text-soft" />
            )}
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-bz-lg border border-bz-line-soft">
        <div className="hidden grid-cols-[80px_1fr_100px] gap-3 bg-bz-paper-warm px-4 py-2.5 text-[10px] font-medium uppercase tracking-[0.08em] text-bz-text-soft sm:grid">
          <span>Date</span>
          <span>Reference · Description</span>
          <span className="text-right">Amount</span>
        </div>
        {events.map((e, i) => (
          <div
            key={e.ref}
            className={[
              "grid grid-cols-[60px_1fr_90px] items-center gap-3 px-4 py-3 sm:grid-cols-[80px_1fr_100px]",
              i !== events.length - 1 && "border-b border-bz-line-soft",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <span className="text-[11px] text-bz-text-muted">{e.date}</span>
            <div className="min-w-0">
              <p className="text-[12px] font-medium text-bz-text">{e.ref}</p>
              <p className="truncate text-[11px] text-bz-text-muted">{e.desc}</p>
            </div>
            <span className="text-right text-[12.5px] font-medium tabular-nums text-bz-text">
              {e.amt}
            </span>
          </div>
        ))}
      </div>
    </>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// [04] CONNECTIVITY — sales connected to inventory and finance
// ════════════════════════════════════════════════════════════════════════════

const SOURCES_TOP = [
  { icon: Users,        label: "Leads",     sub: "Score · Route"      },
  { icon: FileText,     label: "Quotes",    sub: "Approve · Convert"  },
  { icon: ShoppingCart, label: "Orders",    sub: "Fulfil · Invoice"   },
] as const;

const SOURCES_BOTTOM = [
  { icon: Package,      label: "Inventory", sub: "Reserve · Ship"     },
  { icon: Receipt,      label: "Invoices",  sub: "AR · Revenue"       },
  { icon: Landmark,     label: "Finance",   sub: "Post · Reconcile"   },
] as const;

const GL_ROWS = [
  { time: "14:32", source: "Sales · SO-1041",  debit: "AR",         credit: "Revenue · VAT", amt: "$48,200", fresh: true },
  { time: "14:28", source: "Quote · QT-8821",  debit: "Pipeline",   credit: "Forecast",      amt: "$48,200"              },
  { time: "14:25", source: "Inventory · SH-77",debit: "COGS",       credit: "Inventory",     amt: "$36,800"              },
  { time: "14:21", source: "Sales · SO-1038",  debit: "AR",         credit: "Revenue",       amt: "$12,400"              },
  { time: "14:18", source: "Sales · SO-1035",  debit: "AR",         credit: "Revenue · VAT", amt: "$24,600"              },
];

function ConnectivitySection() {
  return (
    <Section tone="dark">
      <Container width="narrow">
        <SectionHead
          index="04"
          label="Connected by design"
          tone="dark"
          title={
            <>
              Sales connected{" "}
              <Heading.Muted>directly to inventory and finance.</Heading.Muted>
            </>
          }
          description="Every step in the sales cycle — quote, order, shipment, invoice — auto-posts to the General Ledger in real time. No re-keying, no spreadsheet reconciliation."
          titleMaxWidth={780}
        />

        <div className="relative mx-auto max-w-[1100px]">
          {/* Top row of sources */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
            {SOURCES_TOP.map((s) => (
              <SourceChip key={s.label} icon={s.icon} label={s.label} sub={s.sub} />
            ))}
          </div>

          <div className="hidden h-8 grid-cols-3 gap-4 sm:grid">
            {SOURCES_TOP.map((_, i) => (
              <Connector key={i} />
            ))}
          </div>

          {/* Live GL panel */}
          <div className="relative my-4 overflow-hidden rounded-bz-2xl bg-bz-olive-soft p-5 sm:my-0 sm:p-7">
            <DotGrid tone="dark" />
            <div className="relative">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex size-9 items-center justify-center rounded-bz-md bg-bz-fire text-[#1F3422]">
                    <BookOpen size={15} strokeWidth={2} />
                  </span>
                  <div>
                    <p className="text-[14px] font-medium text-bz-text-on-dark">Sales hub</p>
                    <p className="text-[10.5px] uppercase tracking-[0.08em] text-white/[0.55]">
                      Auto-posting engine
                    </p>
                  </div>
                </div>
                <StatusChip variant="live">Live</StatusChip>
              </div>

              <div className="overflow-x-auto rounded-bz-lg border border-white/[0.08]">
                <div className="flex flex-col">
                  {GL_ROWS.map((r, i) => (
                    <div
                      key={i}
                      className={[
                        "flex items-center gap-3 px-4 py-3 min-w-[480px]",
                        i !== GL_ROWS.length - 1 && "border-b border-white/[0.06]",
                        r.fresh && "bg-white/[0.04]",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      <span className="w-[52px] shrink-0 text-[11px] tabular-nums text-white/[0.55]">
                        {r.time}
                      </span>
                      <span className="w-[140px] shrink-0 text-[11.5px] text-white/[0.72]">
                        {r.source}
                      </span>
                      <p className="min-w-0 flex-1 truncate text-[12px] text-white/[0.85]">
                        <span className="font-medium text-bz-text-on-dark">{r.debit}</span>
                        <span className="mx-1.5 text-white/[0.4]">→</span>
                        <span>{r.credit}</span>
                      </p>
                      <span className="w-[90px] shrink-0 text-right text-[12.5px] font-medium tabular-nums text-bz-text-on-dark">
                        {r.amt}
                      </span>
                      <span className="w-[60px] shrink-0 text-right">
                        {r.fresh ? (
                          <StatusChip variant="live">Just</StatusChip>
                        ) : (
                          <CheckCircle2 size={14} strokeWidth={1.8} className="ml-auto text-emerald-400/70" />
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-[11px] text-white/[0.55]">
                <span className="inline-flex items-center gap-2">
                  <DollarSign size={13} strokeWidth={2} className="text-bz-fire" />
                  <span className="font-medium tabular-nums text-bz-text-on-dark">142</span>{" "}
                  sales events posted today
                </span>
                <span className="text-[10.5px] font-medium uppercase tracking-[0.08em]">
                  0 manual entries
                </span>
              </div>
            </div>
          </div>

          <div className="hidden h-8 grid-cols-3 gap-4 sm:grid">
            {SOURCES_BOTTOM.map((_, i) => (
              <Connector key={i} />
            ))}
          </div>

          {/* Bottom row of sources */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
            {SOURCES_BOTTOM.map((s) => (
              <SourceChip key={s.label} icon={s.icon} label={s.label} sub={s.sub} />
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
          {[
            { icon: ShieldCheck, label: "No re-keying" },
            { icon: Activity,    label: "Real-time posting" },
            { icon: TrendingUp,  label: "Win-probability scored" },
            { icon: BookOpen,    label: "Full deal audit trail" },
          ].map(({ icon: Icon, label }) => (
            <span
              key={label}
              className="inline-flex items-center gap-2 rounded-bz-pill border border-white/[0.08] bg-white/[0.04] px-3.5 py-2 text-[11px] font-medium uppercase tracking-[0.08em] text-white/[0.72]"
            >
              <Icon size={13} strokeWidth={2} className="text-bz-fire" />
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
    <div className="flex min-w-0 items-center gap-3 rounded-bz-lg border border-white/[0.08] bg-white/[0.04] px-4 py-3.5">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-bz-md border border-white/[0.08] bg-white/[0.06] text-white/[0.85]">
        <Icon size={15} strokeWidth={1.8} />
      </span>
      <div className="min-w-0">
        <p className="truncate text-[12.5px] font-medium text-bz-text-on-dark">{label}</p>
        <p className="truncate text-[10px] uppercase tracking-[0.08em] text-white/[0.55]">{sub}</p>
      </div>
    </div>
  );
}

function Connector() {
  return (
    <div className="relative flex items-center justify-center">
      <span className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-white/[0.12]" />
      <span className="absolute bottom-0 size-1.5 rounded-bz-pill bg-bz-fire" />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// [05] METRICS
// ════════════════════════════════════════════════════════════════════════════

function MetricsSection() {
  return (
    <Section tone="b">
      <Container>
        <SectionHead
          index="05"
          label="Efficiency"
          title={
            <>
              Measurable impact{" "}
              <Heading.Muted>on every deal you close.</Heading.Muted>
            </>
          }
          titleMaxWidth={720}
        />

        <BentoGrid cols={3}>
          {METRICS.map((m) => (
            <Bento key={m.label} tone="paper" hover minHeight={220}>
              <div className="bz-stat-num" style={{ fontSize: 48, marginBottom: 12 }}>
                {m.value}
              </div>
              <div className="mb-3 text-[11px] font-medium uppercase tracking-[0.12em] text-bz-text-muted">
                {m.label}
              </div>
              <Bento.Desc>{m.desc}</Bento.Desc>
            </Bento>
          ))}
        </BentoGrid>
      </Container>
    </Section>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PAGE
// ════════════════════════════════════════════════════════════════════════════

export function SalesAndCrmPage() {
  return (
    <main>
      <HeroSection />
      <FoundationsSection />
      <TechnicalShowcaseSection />
      <ReportingSection />
      <ConnectivitySection />
      <MetricsSection />
    </main>
  );
}
