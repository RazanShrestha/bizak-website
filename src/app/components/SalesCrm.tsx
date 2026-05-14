import "../../styles/style.css";
import * as React from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  Building2,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  ClipboardList,
  FileSpreadsheet,
  FileText,
  FolderKanban,
  LineChart,
  Mail,
  Package,
  ShieldCheck,
  ShoppingCart,
  Target,
  TrendingDown,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import {
  BadgeGreen,
  Bento,
  BentoGrid,
  Container,
  DotGrid,
  EntityRow,
  Heading,
  Pill,
  PillGroup,
  Section,
  SectionHead,
  StatusChip,
} from "./bz";

// ════════════════════════════════════════════════════════════════════════════
// CONTENT DATA
// ════════════════════════════════════════════════════════════════════════════

const FEATURES = [
  {
    icon: Target,
    title: "Pipeline Management",
    desc: "Track every deal through configurable stages with custom fields, weighted probabilities and automated stage transitions.",
  },
  {
    icon: FileText,
    title: "Quote & Proposal",
    desc: "Generate multi-line quotes and convert them to sales orders in one click — price lists, discounts and approval routing built in.",
  },
  {
    icon: Users,
    title: "Contact 360",
    desc: "Full customer history — calls, emails, orders and invoices — visible on a single screen without switching tabs.",
  },
  {
    icon: Zap,
    title: "Sales Automation",
    desc: "Auto-assign leads, schedule follow-up tasks and escalate stale deals on configurable timers — zero manual chasing.",
  },
  {
    icon: LineChart,
    title: "Opportunity Tracking",
    desc: "Win/loss analysis, stage duration tracking and rep performance scoring updated in real time as deals move.",
  },
  {
    icon: TrendingUp,
    title: "Revenue Forecasting",
    desc: "Probability-weighted pipeline forecasts updated every time a deal moves — committed, best-case and worst-case in one view.",
  },
] as const;

const METRICS = [
  {
    value: "30%",
    label: "Faster deal closure",
    desc: "Auto-routed follow-ups and stage automation halve average sales cycles.",
  },
  {
    value: "2×",
    label: "Pipeline visibility",
    desc: "Real-time stage tracking across all reps, regions and product lines.",
  },
  {
    value: "0",
    label: "Manual journal entries",
    desc: "Every quote, order and invoice posts straight to the General Ledger automatically.",
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
          <BadgeGreen style={{ marginBottom: 28 }}>Pipeline to Revenue</BadgeGreen>

          <Heading level={2} style={{ marginBottom: 36 }}>
            Track every lead, close every deal,{" "}
            <br className="hidden sm:block" />
            <Heading.Muted>post every sale to the ledger automatically.</Heading.Muted>
          </Heading>

          <PillGroup>
            <Pill variant="dark" withArrowUpRight href="https://system.bizakerp.com/account/self-register">
              Get Started
            </Pill>
            <Pill variant="light" href="/contact">
              Request Demo
            </Pill>
          </PillGroup>
        </div>

        {/* Page-specific mock — editorial dark panel + pipeline card ─── */}
        <div className="bz-hero-visual mx-auto grid w-full max-w-[1100px] grid-cols-1 gap-3 sm:grid-cols-5">
          <HeroOlivePanel />
          <HeroPipelineCard />
        </div>
      </Container>
    </Section>
  );
}

function HeroOlivePanel() {
  return (
    <div className="relative overflow-hidden rounded-bz-2xl bg-bz-olive p-5 sm:col-span-2 sm:min-h-[460px]">
      <DotGrid tone="dark" />

      <div
        aria-hidden
        className="pointer-events-none absolute -right-12 -top-12 size-44 rounded-bz-pill bg-bz-olive-soft/40"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-20 -left-10 size-36 rounded-bz-pill bg-bz-olive-soft/30"
      />

      <div className="relative flex h-full min-h-[280px] flex-col justify-between">
        <div className="flex items-center gap-2 text-[10.5px] font-medium uppercase tracking-[0.12em] text-white/[0.55]">
          <span className="size-1.5 rounded-bz-pill bg-bz-fire" />
          Pipeline · live
        </div>

        <div className="flex flex-col gap-2.5">
          {/* Floating deal chip */}
          <div className="flex items-center justify-between rounded-bz-lg bg-bz-paper p-3 shadow-[0_18px_40px_-22px_rgba(0,0,0,0.6)]">
            <div className="flex items-center gap-2.5">
              <span className="flex size-7 items-center justify-center rounded-bz-pill border border-bz-line text-bz-text">
                <CheckCircle2 size={14} strokeWidth={2} />
              </span>
              <span className="text-[13px] font-medium text-bz-text">
                Axeon · Proposal
              </span>
            </div>
            <span className="rounded-bz-pill bg-bz-paper-warm px-2.5 py-1 text-[10.5px] font-medium text-bz-text-muted">
              $112K
            </span>
          </div>

          {/* Primary action button */}
          <button
            type="button"
            className="flex items-center justify-center gap-2 rounded-bz-lg bg-bz-deep py-3.5 text-[13.5px] font-medium text-bz-text-on-dark transition-colors hover:bg-bz-olive-dark"
          >
            Close the deal
            <ArrowUpRight size={14} strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  );
}

function HeroPipelineCard() {
  const rows = [
    { label: "Closed Won",        value: "$1.54M" },
    { label: "Active Proposals",  value: "$2.31M", muted: true },
    { label: "New Leads · Q3",   value: "$620K",  muted: true },
  ];
  return (
    <div className="relative overflow-hidden rounded-bz-2xl bg-bz-paper sm:col-span-3 sm:min-h-[460px]">
      {/* Dark olive header strip */}
      <div className="flex items-center justify-between bg-bz-olive px-5 py-4">
        <span className="text-[16px] font-medium tracking-tight text-bz-text-on-dark">
          Bizak
          <sup className="ml-0.5 text-[8px] opacity-60">®</sup>
        </span>
        <div className="flex flex-col items-end gap-1.5">
          <span className="block h-[3px] w-9 rounded-bz-pill bg-white/30" />
          <span className="block h-[3px] w-7 rounded-bz-pill bg-white/20" />
        </div>
      </div>

      <div className="flex flex-col gap-4 p-5">
        {/* Quarter / Rep pair */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Quarter",  value: "Q3 · 2024" },
            { label: "Rep team", value: "6 active reps" },
          ].map((p) => (
            <div
              key={p.label}
              className="rounded-bz-md border border-bz-line-soft p-3"
            >
              <p className="text-[10px] uppercase tracking-[0.08em] text-bz-text-muted">
                {p.label}
              </p>
              <p className="mt-1.5 text-[13px] font-medium text-bz-text">
                {p.value}
              </p>
              <span className="mt-2 block h-[3px] w-12 rounded-bz-pill bg-bz-line-soft" />
            </div>
          ))}
        </div>

        <p className="text-[10.5px] font-medium uppercase tracking-[0.08em] text-bz-text-soft">
          Live pipeline
        </p>

        {/* Pipeline rows */}
        <div className="flex flex-col gap-2">
          {rows.map((r, i) => (
            <div
              key={r.label}
              className={
                i === 0
                  ? "flex items-center justify-between rounded-bz-md border border-bz-line-soft p-3"
                  : "flex items-center justify-between px-1"
              }
            >
              {i === 0 ? (
                <>
                  <div className="flex items-center gap-2.5">
                    <span className="flex size-7 items-center justify-center rounded-bz-sm bg-bz-paper-warm text-bz-text">
                      <Target size={13} strokeWidth={1.8} />
                    </span>
                    <span className="text-[12.5px] font-medium text-bz-text">
                      {r.label}
                    </span>
                  </div>
                  <span className="text-[13px] font-medium tabular-nums text-bz-text">
                    {r.value}
                  </span>
                </>
              ) : (
                <>
                  <span className="text-[12px] text-bz-text-muted">{r.label}</span>
                  <span className="block h-[3px] w-16 rounded-bz-pill bg-bz-line-soft" />
                </>
              )}
            </div>
          ))}
        </div>

        {/* Total pipeline — emphasized total row */}
        <div className="mt-1 flex items-center justify-between rounded-bz-lg bg-bz-paper-warm px-4 py-3.5">
          <span className="text-[13px] text-bz-text-muted">Total pipeline</span>
          <span className="text-[22px] font-medium tabular-nums text-bz-text">
            $4.48M
          </span>
        </div>
      </div>
    </div>
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
              A connected sales system,{" "}
              <Heading.Muted>built for revenue control.</Heading.Muted>
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
              <Heading.Muted>for the modern sales team.</Heading.Muted>
            </>
          }
          titleMaxWidth={720}
        />

        <BentoGrid cols={2}>
          <PipelineIntelligenceBento />
          <DealControlBento />
          <QuoteToCashBento />
          <CrmIntegrationBento />
        </BentoGrid>
      </Container>
    </Section>
  );
}

function PipelineIntelligenceBento() {
  const rows = [
    { flag: "🇺🇸", name: "Axeon Logistics",  amount: "$112K" },
    { flag: "🇩🇪", name: "Meier Systems",    amount: "$88K"  },
    { flag: "🇬🇧", name: "Northwind Retail", amount: "$74K"  },
  ];
  return (
    <Bento tone="paper" hover minHeight={360}>
      <Bento.Header
        title="Pipeline intelligence"
        icon={<LineChart size={26} strokeWidth={1.4} color="#1F3422" />}
      />
      <Bento.Desc>
        Track every open deal by rep, stage and value across all regions.
      </Bento.Desc>
      <Bento.Footer tone="light" className="flex flex-col gap-1.5">
        {rows.map((r) => (
          <EntityRow key={r.name} flag={r.flag} name={r.name} amount={r.amount} />
        ))}
      </Bento.Footer>
    </Bento>
  );
}

function DealControlBento() {
  const rows: Array<{
    abbr: string;
    label: string;
    status: "ok" | "review" | "muted";
  }> = [
    { abbr: "M",  label: "Manager approval",    status: "ok"     },
    { abbr: "VP", label: "VP sign-off > $50k",  status: "review" },
  ];
  return (
    <Bento tone="dark" hover dotGrid minHeight={360}>
      <Bento.Header
        title="Deal control"
        icon={<ShieldCheck size={26} strokeWidth={1.4} color="#DBE9B8" />}
      />
      <Bento.Desc>
        Maintain strict deal hygiene with conditional routing and discount controls.
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

function QuoteToCashBento() {
  const bars = [
    { label: "Quotes sent",    pct: 82 },
    { label: "Orders placed",  pct: 61 },
    { label: "Revenue posted", pct: 44 },
  ];
  return (
    <Bento tone="leaf" hover minHeight={300}>
      <Bento.Header
        title="Quote-to-cash flow"
        icon={<FileText size={26} strokeWidth={1.4} color="#1F3422" />}
      />
      <Bento.Desc style={{ color: "#1F3422", opacity: 0.78 }}>
        Quote, order, invoice and revenue posting — all in one unbroken flow.
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

function CrmIntegrationBento() {
  const trail = [
    { trail: "Quote_QT-8821",     ref: "#approved" },
    { trail: "Sales_Order_1041",  ref: "#posted"   },
  ];
  return (
    <Bento tone="dark" hover minHeight={300}>
      <Bento.Header
        title="CRM integration"
        icon={<ClipboardList size={26} strokeWidth={1.4} color="#DBE9B8" />}
      />
      <Bento.Desc>
        Every deal posts to the ledger{<br/>}with zero re-keying.
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
// [03] REPORTING — "Click any deal, see its full history."
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
              <Heading.Muted>see its full history.</Heading.Muted>
            </>
          }
          description="From the pipeline total down to every email, quote and journal entry — every figure is live, traceable and audit-ready."
          titleMaxWidth={780}
        />

        <BentoGrid cols={2} gap={20}>
          <ReportingCell
            title="One-click pipeline reports"
            body="Weighted pipeline, win-rate and rep performance consolidated across every region."
            visual={<PipelineReportVisual />}
          />
          <ReportingCell
            title="Drill from total to deal"
            body="Every revenue figure resolves to its originating deal and journal entry in a single click."
            visual={<DrillTrailVisual />}
          />
          <ReportingCell
            title="Stalled deal detection, built-in"
            body="Deals past their expected close date, reps below quota and pipeline gaps surfaced automatically."
            visual={<AnomalyVisual />}
          />
          <ReportingCell
            title="Export the way sales ops wants it"
            body="Pipeline, forecast and activity reports in PDF, Excel or CSV — ready for board packs."
            visual={<ExportVisual />}
          />
        </BentoGrid>
      </Container>
    </Section>
  );
}

function ReportingCell({
  title,
  body,
  visual,
}: {
  title: string;
  body: string;
  visual: React.ReactNode;
}) {
  return (
    <Bento
      tone="paper"
      hover
      minHeight={460}
      style={{ background: "var(--bz-section-b)" }}
    >
      <div className="flex h-full flex-col items-center text-center text-wrap">
        <h3 className="bz-bento-title max-w-[440px] text-balance">{title}</h3>

        <div className="my-auto flex w-full items-center justify-center py-8">
          {visual}
        </div>

        <p className="max-w-[420px] text-[13.5px] leading-[1.65] text-bz-text-muted">
          {body}
        </p>
      </div>
    </Bento>
  );
}

// ── Reporting visuals ────────────────────────────────────────────────────────

function PipelineReportVisual() {
  return (
    <div className="w-full max-w-[300px] overflow-hidden rounded-bz-2xl bg-bz-paper-warm shadow-[0_18px_40px_-28px_rgba(0,0,0,0.18)]">
      <div className="flex items-center justify-between bg-bz-olive px-4 py-3">
        <span className="text-[13px] font-medium tracking-tight text-bz-text-on-dark">
          Bizak<sup className="ml-0.5 text-[7px] opacity-60">®</sup>
        </span>
        <div className="flex flex-col items-end gap-1">
          <span className="block h-[3px] w-7 rounded-bz-pill bg-white/30" />
          <span className="block h-[3px] w-5 rounded-bz-pill bg-white/20" />
        </div>
      </div>
      <div className="flex flex-col gap-3 bg-bz-paper p-4">
        <div className="flex items-center justify-between">
          <span className="block h-[3px] w-20 rounded-bz-pill bg-bz-line-soft" />
          <span className="text-[10.5px] uppercase tracking-[0.08em] text-bz-text-soft">
            Pipeline
          </span>
        </div>
        <div className="flex items-center justify-between rounded-bz-md bg-bz-paper-warm px-3 py-2.5">
          <span className="block h-[3px] w-14 rounded-bz-pill bg-bz-line" />
          <span className="text-[18px] font-medium tabular-nums text-bz-text">
            $4.48M
          </span>
        </div>
      </div>
    </div>
  );
}

function DrillTrailVisual() {
  const path = [
    { label: "Pipeline"  },
    { label: "Q3 Won"    },
    { label: "Axeon"     },
    { label: "SO-1041", final: true },
  ];
  return (
    <div className="flex max-w-[340px] flex-wrap items-center justify-center gap-1.5">
      {path.map((p, i) => (
        <React.Fragment key={p.label}>
          <span
            className={[
              "rounded-bz-md px-2.5 py-1.5 text-[11.5px] font-medium tabular-nums",
              p.final
                ? "bg-bz-olive text-bz-text-on-dark"
                : "border border-bz-line-soft bg-bz-paper text-bz-text",
            ].join(" ")}
          >
            {p.label}
          </span>
          {i !== path.length - 1 && (
            <ChevronRight size={12} strokeWidth={2.2} className="text-bz-text-soft" />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

function AnomalyVisual() {
  const alerts = [
    {
      icon: AlertTriangle,
      title: "Axeon deal stalled",
      delta: "+18d",
      tone: "bad" as const,
    },
    {
      icon: TrendingDown,
      title: "Avg discount rate",
      delta: "−8%",
      tone: "good" as const,
    },
  ];
  return (
    <div className="flex w-full max-w-[300px] flex-col gap-2">
      {alerts.map(({ icon: Icon, title, delta, tone }) => {
        const chip =
          tone === "bad"
            ? "bg-rose-500/10 text-rose-600"
            : "bg-bz-leaf text-[#1F3422]";
        return (
          <div
            key={title}
            className="flex items-center gap-3 rounded-bz-lg border border-bz-line-soft bg-bz-paper px-3.5 py-3"
          >
            <span
              className={`flex size-8 shrink-0 items-center justify-center rounded-bz-md ${chip}`}
            >
              <Icon size={14} strokeWidth={2} />
            </span>
            <span className="flex-1 text-left text-[12.5px] font-medium text-bz-text">
              {title}
            </span>
            <span
              className={`rounded-bz-pill px-2 py-0.5 text-[10.5px] font-medium tabular-nums ${chip}`}
            >
              {delta}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function ExportVisual() {
  const formats = [
    { icon: FileText,        label: "PDF",   active: true  },
    { icon: FileSpreadsheet, label: "Excel"                },
    { icon: ClipboardList,   label: "CSV"                  },
  ];
  return (
    <div className="flex w-full max-w-[320px] items-center justify-center gap-2.5">
      {formats.map(({ icon: Icon, label, active }) => (
        <div
          key={label}
          className={[
            "flex w-[88px] flex-col items-center gap-2 rounded-bz-lg border px-3 py-4 transition-colors",
            active
              ? "border-bz-olive bg-bz-olive text-bz-text-on-dark"
              : "border-bz-line-soft bg-bz-paper text-bz-text",
          ].join(" ")}
        >
          <span
            className={[
              "flex size-9 items-center justify-center rounded-bz-md",
              active ? "bg-white/[0.08]" : "bg-bz-paper-warm",
            ].join(" ")}
          >
            <Icon size={15} strokeWidth={1.8} />
          </span>
          <span className="text-[11.5px] font-medium">{label}</span>
        </div>
      ))}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// [04] CONNECTIVITY — "One CRM. Every module."
// ════════════════════════════════════════════════════════════════════════════

const SOURCES_TOP = [
  { icon: Mail,         label: "Marketing",  sub: "Leads · Campaigns"    },
  { icon: ShoppingCart, label: "Finance",    sub: "Invoice · Revenue"    },
  { icon: Package,      label: "Purchasing", sub: "PO · Vendor pricing"  },
] as const;

const SOURCES_BOTTOM = [
  { icon: Building2,    label: "Inventory",  sub: "Stock · Pricing"      },
  { icon: FolderKanban, label: "Projects",   sub: "Timesheets · Billing" },
  { icon: Users,        label: "HR",         sub: "Commissions · Targets"},
] as const;

const CRM_ROWS = [
  { time: "14:32", source: "Axeon · DL-2046",     debit: "Quote",   credit: "Sales Order",  amt: "$112K", fresh: true  },
  { time: "14:28", source: "Meier · DL-1988",     debit: "Lead",    credit: "Qualified",    amt: "$88K"               },
  { time: "14:25", source: "Northwind · DL-1847", debit: "Order",   credit: "Invoice · AR", amt: "$74K"               },
  { time: "14:20", source: "Atlas · DL-1741",     debit: "Invoice", credit: "Revenue",      amt: "$51K"               },
  { time: "14:16", source: "Lumen · DL-1690",     debit: "Quote",   credit: "Won · Posted", amt: "$220K"              },
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
              One CRM.{" "}
              <Heading.Muted>Every module.</Heading.Muted>
            </>
          }
          description="Every deal in Bizak flows to the General Ledger in real time — no re-keying, no blind spots."
          titleMaxWidth={760}
        />
        <div className="pb-8"></div>

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

          {/* Live CRM panel */}
          <div className="relative my-4 overflow-hidden rounded-bz-2xl bg-bz-olive-soft p-5 sm:my-0 sm:p-7">
            <DotGrid tone="dark" />
            <div className="relative">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex size-9 items-center justify-center rounded-bz-md bg-bz-fire text-[#1F3422]">
                    <Target size={15} strokeWidth={2} />
                  </span>
                  <div>
                    <p className="text-[14px] font-medium text-bz-text-on-dark">Sales Pipeline</p>
                    <p className="text-[10.5px] uppercase tracking-[0.08em] text-white/[0.55]">
                      Live deal engine
                    </p>
                  </div>
                </div>
                <StatusChip variant="live">Live</StatusChip>
              </div>

              <div className="overflow-x-auto rounded-bz-lg border border-white/[0.08]">
                <div className="flex flex-col">
                  {CRM_ROWS.map((r, i) => (
                    <div
                      key={i}
                      className={[
                        "flex items-center gap-3 px-4 py-3 min-w-[480px]",
                        i !== CRM_ROWS.length - 1 && "border-b border-white/[0.06]",
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
                  <span className="font-medium tabular-nums text-bz-text-on-dark">84</span> deals
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
              <Heading.Muted>on sales operations.</Heading.Muted>
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
