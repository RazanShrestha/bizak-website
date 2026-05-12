import "../../styles/style.css";
import * as React from "react";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  BookOpen,
  Building2,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  ClipboardList,
  Clock,
  Database,
  DollarSign,
  Factory,
  FileText,
  FolderKanban,
  Landmark,
  Layers,
  LineChart,
  Package,
  Scale,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import {
  Accordion,
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
  JournalRow,
  MiniBars,
  Pill,
  Section,
  SectionHead,
  StatTile,
  StatusChip,
} from "./bz";

// ════════════════════════════════════════════════════════════════════════════
// CONTENT DATA
// ════════════════════════════════════════════════════════════════════════════

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
] as const;

const METRICS = [
  {
    value: "60%",
    label: "Faster month-end",
    desc: "Automated reconciliation and intercompany elimination cut close times in half.",
  },
  {
    value: "40%",
    label: "Fewer errors",
    desc: "Direct bank feeds and auto-posted journals replace manual data entry.",
  },
  {
    value: "100%",
    label: "Audit coverage",
    desc: "A complete digital paper trail behind every figure, ready for regulatory review.",
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
          <BadgeGreen style={{ marginBottom: 28 }}>
            Financial Module · Live, Globally 🎉
          </BadgeGreen>

          <Heading level={2} style={{ marginBottom: 36 }}>
            Control your finances with clarity{" "}
            <Heading.Muted>and close the books in hours, not weeks.</Heading.Muted>
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
            icon={<Activity size={12} />}
            title="Live ledger"
            badge="Live"
            badgeVariant="live"
            eyebrow="Cash position · 4 entities"
            value="$1,242,180"
          >
            <div className="rounded-bz-lg bg-bz-paper-warm p-3">
              <DataRow
                label="Today's journal entries"
                value="247 auto-posted"
                emphasis
                className="mb-1.5"
              />
              <MiniBars values={[40, 65, 50, 80, 60, 88, 92]} highlightLast />
            </div>
          </HeroCard>

          <HeroCard
            icon={<FileText size={12} />}
            title="Reconciliation"
            badge="Posted"
            badgeVariant="posted"
            eyebrow="Bank feed · Citi Operating"
            value="$482,400"
          >
            <div className="flex flex-col gap-1.5 rounded-bz-lg bg-bz-paper-warm px-3 py-2.5">
              <DataRow label="Matched lines" value="184 / 184" />
              <DataRow label="Variance flagged" value="$0.00" />
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
              A structured financial system,{" "}
              <Heading.Muted>built for operational control.</Heading.Muted>
            </>
          }
          titleMaxWidth={760}
        />

        <BentoGrid cols={3}>
          {FEATURES.map(({ icon: Icon, title, desc }) => (
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
              <Heading.Muted>for the modern finance team.</Heading.Muted>
            </>
          }
          titleMaxWidth={720}
        />

        <BentoGrid cols={2}>
          <MultiEntityBento />
          <FinancialControlBento />
          <CashFlowBento />
          <AuditIntegrationBento />
        </BentoGrid>
      </Container>
    </Section>
  );
}

function MultiEntityBento() {
  const rows = [
    { ccy: "USD", flag: "🇺🇸", amount: "$2.14M" },
    { ccy: "EUR", flag: "🇪🇺", amount: "€1.28M" },
    { ccy: "GBP", flag: "🇬🇧", amount: "£820k" },
  ];
  return (
    <Bento tone="paper" hover minHeight={360}>
      <Bento.Header
        title="Multi-entity management"
        icon={<Building2 size={26} strokeWidth={1.4} color="#1F3422" />}
      />
      <Bento.Desc>
        Consolidate subsidiaries across currencies into a single source of truth — FX translation and
        intercompany eliminations included.
      </Bento.Desc>
      <Bento.Footer tone="light" className="flex flex-col gap-1.5">
        {rows.map((r) => (
          <EntityRow key={r.ccy} flag={r.flag} name={r.ccy} amount={r.amount} />
        ))}
      </Bento.Footer>
    </Bento>
  );
}

function FinancialControlBento() {
  const rows: Array<{
    abbr: string;
    label: string;
    status: "ok" | "review" | "muted";
  }> = [
    { abbr: "M", label: "Manager approval", status: "ok" },
    { abbr: "CF", label: "CFO review > $50k", status: "review" },
    { abbr: "L", label: "Compliance log", status: "muted" },
  ];
  return (
    <Bento tone="dark" hover dotGrid minHeight={360}>
      <Bento.Header
        title="Financial control"
        icon={<ShieldCheck size={26} strokeWidth={1.4} color="#DBE9B8" />}
      />
      <Bento.Desc>
        Maintain strict fiscal hygiene with conditional routing, budget checks and full approval logs
        on every payment.
      </Bento.Desc>
      <Bento.Footer tone="dark" className="flex flex-col gap-1.5">
        {rows.map((r) => (
          <div
            key={r.label}
            className="flex items-center justify-between rounded-bz-md bg-white/[0.04] px-3 py-2"
          >
            <div className="flex items-center gap-2.5">
              <span className="inline-flex size-6 items-center justify-center rounded-bz-sm bg-white/[0.06] text-[9.5px] font-semibold text-bz-leaf">
                {r.abbr}
              </span>
              <span className="text-[12px] text-bz-text-on-dark">{r.label}</span>
            </div>
            <span
              className={
                r.status === "ok"
                  ? "size-1.5 rounded-bz-pill bg-emerald-400"
                  : r.status === "review"
                  ? "size-1.5 rounded-bz-pill bg-bz-fire"
                  : "size-1.5 rounded-bz-pill bg-white/[0.22]"
              }
            />
          </div>
        ))}
      </Bento.Footer>
    </Bento>
  );
}

function CashFlowBento() {
  const bars = [
    { label: "Inflow · AR", pct: 78 },
    { label: "Outflow · AP", pct: 54 },
    { label: "Forecast · 30d", pct: 26 },
  ];
  return (
    <Bento tone="leaf" hover minHeight={300}>
      <Bento.Header
        title="Cash flow management"
        icon={<FileText size={26} strokeWidth={1.4} color="#1F3422" />}
      />
      <Bento.Desc style={{ color: "#1F3422", opacity: 0.78 }}>
        Dynamic forecasting and aged-debt tracking with real-time AR / AP visibility.
      </Bento.Desc>
      <Bento.Footer className="bg-[rgba(31,52,34,0.08)] flex flex-col gap-2.5">
        {bars.map((b) => (
          <div key={b.label}>
            <div className="mb-1 flex items-center justify-between text-[11px] text-[#1F3422]">
              <span>{b.label}</span>
              <span className="font-medium">{b.pct}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-bz-pill bg-[rgba(31,52,34,0.12)]">
              <div
                className="h-full rounded-bz-pill bg-[#1F3422]"
                style={{ width: `${b.pct}%` }}
              />
            </div>
          </div>
        ))}
      </Bento.Footer>
    </Bento>
  );
}

function AuditIntegrationBento() {
  const trail = [
    { trail: "Journal_Entry", ref: "#JE-2024-8821" },
    { trail: "Bank_Statement", ref: "#BS-990-22" },
    { trail: "Vendor_Invoice", ref: "#INV-AX-402" },
  ];
  return (
    <Bento tone="dark" hover minHeight={300}>
      <Bento.Header
        title="Financial integration"
        icon={<ClipboardList size={26} strokeWidth={1.4} color="#DBE9B8" />}
      />
      <Bento.Desc>
        Direct ledger posting and automated 3-way matching across every connected system, with a
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
// [03] REPORTING — "Click any number, see its source."
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
              Click any number,{" "}
              <Heading.Muted>see its source.</Heading.Muted>
            </>
          }
          description="From the income statement down to the originating journal entry — every figure is live, traceable and audit-ready."
          titleMaxWidth={780}
        />

        <BentoGrid cols={12}>
          <Bento tone="paper" span={7} minHeight={460}>
            <LivePnLPanel />
          </Bento>
          <Bento tone="paper" span={5} minHeight={460}>
            <PreBuiltReportsPanel />
          </Bento>
          <Bento tone="paper" span={5} minHeight={420}>
            <AnomalyAlertsPanel />
          </Bento>
          <Bento tone="paper" span={7} minHeight={420}>
            <DrillTrailPanel />
          </Bento>
        </BentoGrid>
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

function LivePnLPanel() {
  const rows: PnLRow[] = [
    { label: "Revenue",            value: "$4.82M",   delta: "+12.4%",        trend: "up",   intent: "good"    },
    { label: "Gross Profit",       value: "$2.91M",   delta: "60.3% margin",  trend: "up",   intent: "neutral" },
    { label: "Operating Expenses", value: "($1.84M)", delta: "+4.1%",         trend: "up",   intent: "bad"     },
    { label: "EBITDA",             value: "$1.07M",   delta: "+18.6%",        trend: "up",   intent: "good"    },
    { label: "Net Income",         value: "$812K",    delta: "+22.1%",        trend: "up",   intent: "good", emphasis: true },
  ];

  return (
    <>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="mb-1.5 flex items-center gap-2">
            <span className="inline-flex size-7 items-center justify-center rounded-bz-md bg-bz-leaf text-[#1F3422]">
              <FileText size={14} strokeWidth={1.8} />
            </span>
            <h3 className="text-[15px] font-medium text-bz-text">Income Statement</h3>
          </div>
          <p className="text-[12px] text-bz-text-muted">
            Auto-consolidated from 4 entities · synced 2 minutes ago
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StatusChip variant="posted">FY2024 · Q3</StatusChip>
          <StatusChip variant="live">Live</StatusChip>
        </div>
      </div>

      <div className="overflow-hidden rounded-bz-lg border border-bz-line-soft">
        {rows.map((r, i) => (
          <div
            key={r.label}
            className={[
              "flex items-center justify-between gap-3 px-4 py-3.5",
              i !== rows.length - 1 && "border-b border-bz-line-soft",
              r.emphasis && "bg-bz-paper-warm",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <div className="flex min-w-0 items-center gap-2.5">
              <span
                className={[
                  "size-1.5 shrink-0 rounded-bz-pill",
                  r.emphasis ? "bg-bz-fire" : "bg-bz-line",
                ].join(" ")}
              />
              <span
                className={[
                  "truncate text-[13.5px]",
                  r.emphasis ? "font-medium text-bz-text" : "text-bz-text",
                ].join(" ")}
              >
                {r.label}
              </span>
            </div>
            <div className="flex shrink-0 items-center gap-2.5">
              <span
                className={[
                  "tabular-nums",
                  r.emphasis ? "text-[17px] font-medium text-bz-text" : "text-[13.5px] font-medium text-bz-text",
                ].join(" ")}
              >
                {r.value}
              </span>
              <DeltaChip delta={r.delta} trend={r.trend} intent={r.intent} />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-5">
        <div className="flex items-center gap-2">
          <StatusChip variant="posted">PDF</StatusChip>
          <StatusChip variant="posted">XBRL</StatusChip>
          <StatusChip variant="posted">Excel</StatusChip>
        </div>
        <a
          href="#"
          className="inline-flex items-center gap-1 text-[12px] font-medium text-bz-text hover:text-bz-text-muted"
        >
          Drill into accounts
          <ArrowUpRight size={13} strokeWidth={2} />
        </a>
      </div>
    </>
  );
}

function DeltaChip({
  delta,
  trend,
  intent,
}: {
  delta: string;
  trend: "up" | "down";
  intent: "good" | "bad" | "neutral";
}) {
  const TrendIcon = trend === "up" ? TrendingUp : TrendingDown;
  const cls =
    intent === "good"
      ? "bg-bz-leaf text-[#1F3422]"
      : intent === "bad"
      ? "bg-rose-500/10 text-rose-600"
      : "bg-bz-paper-warm text-bz-text-muted";
  return (
    <span
      className={[
        "inline-flex items-center gap-1 rounded-bz-pill px-2 py-0.5",
        "text-[10.5px] font-medium tabular-nums",
        cls,
      ].join(" ")}
    >
      <TrendIcon size={11} strokeWidth={2.4} />
      {delta}
    </span>
  );
}

function PreBuiltReportsPanel() {
  const reports = [
    { icon: FileText, name: "Income Statement", sub: "Live · streaming",   live: true  },
    { icon: Scale,    name: "Balance Sheet",    sub: "Updated 2m ago"                  },
    { icon: Activity, name: "Cash Flow",        sub: "Updated 5m ago"                  },
    { icon: Clock,    name: "AR Aging Report",  sub: "Updated 8m ago"                  },
    { icon: Clock,    name: "AP Aging Report",  sub: "Updated 12m ago"                 },
  ];
  return (
    <>
      <div className="mb-4 flex items-start justify-between">
        <div>
          <div className="text-[11px] font-medium uppercase tracking-[0.12em] text-bz-text-muted">
            Always-on reports
          </div>
          <h3 className="mt-1.5 text-[15px] font-medium text-bz-text">Pre-built statements</h3>
        </div>
        <StatusChip variant="posted">38 total</StatusChip>
      </div>

      <div className="flex flex-col gap-2">
        {reports.map(({ icon: Icon, name, sub, live }) => (
          <div
            key={name}
            className={[
              "group flex items-center gap-3 rounded-bz-lg border px-3.5 py-3 transition-colors",
              live
                ? "border-bz-line bg-bz-paper-warm"
                : "border-bz-line-soft bg-bz-paper hover:border-bz-line",
            ].join(" ")}
          >
            <span
              className={[
                "flex size-9 shrink-0 items-center justify-center rounded-bz-md",
                live ? "bg-bz-fire text-[#1F3422]" : "bg-bz-paper-warm text-bz-text",
              ].join(" ")}
            >
              <Icon size={14} strokeWidth={1.8} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium text-bz-text">{name}</p>
              <p className="text-[11px] text-bz-text-muted">{sub}</p>
            </div>
            {live ? (
              <StatusChip variant="live">Live</StatusChip>
            ) : (
              <ChevronRight size={15} strokeWidth={2} className="text-bz-text-soft" />
            )}
          </div>
        ))}
      </div>
    </>
  );
}

function AnomalyAlertsPanel() {
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
    <>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="text-[11px] font-medium uppercase tracking-[0.12em] text-bz-text-muted">
            Anomaly detection
          </div>
          <h3 className="mt-1.5 text-[15px] font-medium text-bz-text">Variance, surfaced for you</h3>
        </div>
        <span className="inline-flex items-center gap-1.5 text-[10.5px] font-medium uppercase tracking-[0.08em] text-bz-text-muted">
          <span className="size-1.5 rounded-bz-pill bg-bz-fire" />
          Watching
        </span>
      </div>

      <div className="flex flex-col gap-2.5">
        {alerts.map(({ icon: Icon, title, sub, delta, intent }) => {
          const cls =
            intent === "bad"
              ? "bg-rose-500/10 text-rose-600"
              : intent === "good"
              ? "bg-bz-leaf text-[#1F3422]"
              : "bg-bz-paper-warm text-bz-text-muted";
          return (
            <div
              key={title}
              className="flex items-center gap-3 rounded-bz-lg border border-bz-line-soft bg-bz-paper px-3.5 py-3"
            >
              <span className={`flex size-9 shrink-0 items-center justify-center rounded-bz-md ${cls}`}>
                <Icon size={15} strokeWidth={2} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-medium text-bz-text">{title}</p>
                <p className="text-[11px] text-bz-text-muted">{sub}</p>
              </div>
              <span
                className={[
                  "shrink-0 rounded-bz-pill px-2 py-0.5 text-[10.5px] font-medium tabular-nums",
                  cls,
                ].join(" ")}
              >
                {delta}
              </span>
            </div>
          );
        })}
      </div>
    </>
  );
}

function DrillTrailPanel() {
  const path = [
    { label: "Net Income",         value: "$812K"                  },
    { label: "Operating Expenses", value: "$1.84M"                 },
    { label: "Marketing",          value: "$284K"                  },
    { label: "Q3 Brand Campaign",  value: "$48,200", final: true   },
  ];
  const journal = [
    { date: "14 · Sep", ref: "JE-2024-8412", desc: "Brand agency · Sept retainer",  amt: "$24,000" },
    { date: "21 · Sep", ref: "JE-2024-8593", desc: "Digital ads · Q3 LinkedIn",     amt: "$18,400" },
    { date: "28 · Sep", ref: "JE-2024-8721", desc: "Event sponsorship · DXTalks",   amt: "$5,800"  },
  ];
  return (
    <>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-[11px] font-medium uppercase tracking-[0.12em] text-bz-text-muted">
            Audit trail
          </div>
          <h3 className="mt-1.5 text-[15px] font-medium text-bz-text">
            Every number resolves to its source
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
        {journal.map((j, i) => (
          <div
            key={j.ref}
            className={[
              "grid grid-cols-[60px_1fr_90px] items-center gap-3 px-4 py-3 sm:grid-cols-[80px_1fr_100px]",
              i !== journal.length - 1 && "border-b border-bz-line-soft",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <span className="text-[11px] text-bz-text-muted">{j.date}</span>
            <div className="min-w-0">
              <p className="text-[12px] font-medium text-bz-text">{j.ref}</p>
              <p className="truncate text-[11px] text-bz-text-muted">{j.desc}</p>
            </div>
            <span className="text-right text-[12.5px] font-medium tabular-nums text-bz-text">
              {j.amt}
            </span>
          </div>
        ))}
      </div>
    </>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// [04] CONNECTIVITY — "One ledger. Every module."
// ════════════════════════════════════════════════════════════════════════════

const SOURCES_TOP = [
  { icon: ShoppingCart, label: "Sales",      sub: "Invoice · Cash"     },
  { icon: Database,     label: "Purchasing", sub: "PO · 3-way match"   },
  { icon: Package,      label: "Inventory",  sub: "COGS · Asset sync"  },
] as const;

const SOURCES_BOTTOM = [
  { icon: Factory,      label: "Manufacturing", sub: "Work order · WIP" },
  { icon: FolderKanban, label: "Projects",      sub: "Timesheet · Cost" },
  { icon: Landmark,     label: "Banking",       sub: "Reconcile · Fees" },
] as const;

const GL_ROWS = [
  { time: "14:32", source: "Sales · SO-1041",   debit: "AR",         credit: "Revenue · VAT", amt: "$48,200",  fresh: true  },
  { time: "14:28", source: "Purch · PO-882",    debit: "Inventory",  credit: "AP",            amt: "$12,450"               },
  { time: "14:25", source: "Payroll · Sept",    debit: "Wages",      credit: "Cash",          amt: "$284,100"              },
  { time: "14:21", source: "Bank · Fees",       debit: "Bank Fees",  credit: "Cash",          amt: "$182"                  },
  { time: "14:18", source: "Inventory · SH-77", debit: "COGS",       credit: "Inventory",     amt: "$36,800"               },
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
              One ledger.{" "}
              <Heading.Muted>Every module.</Heading.Muted>
            </>
          }
          description="Every event in Bizak — a shipment, a payment, a payroll run — auto-posts to the General Ledger in real time. No manual coding. No month-end catch-up."
          titleMaxWidth={760}
        />

        <div className="relative mx-auto max-w-[1100px]">
          {/* Top row of sources */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
            {SOURCES_TOP.map((s) => (
              <SourceChip key={s.label} icon={s.icon} label={s.label} sub={s.sub} />
            ))}
          </div>

          {/* Connector row */}
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
                    <p className="text-[14px] font-medium text-bz-text-on-dark">General Ledger</p>
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
                  <CircleDollarSign size={13} strokeWidth={2} className="text-bz-fire" />
                  <span className="font-medium tabular-nums text-bz-text-on-dark">247</span> entries
                  auto-posted today
                </span>
                <span className="text-[10.5px] font-medium uppercase tracking-[0.08em]">
                  0 manual journal entries
                </span>
              </div>
            </div>
          </div>

          {/* Connector row */}
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
            { icon: ShieldCheck,    label: "No manual coding"  },
            { icon: Activity,       label: "Real-time posting" },
            { icon: ClipboardList,  label: "Full audit trail"  },
            { icon: Building2,      label: "Multi-entity ready" },
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
              <Heading.Muted>on financial operations.</Heading.Muted>
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

export function FinancialManagementPage() {
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
