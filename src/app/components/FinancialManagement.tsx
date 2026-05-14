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
  Database,
  DollarSign,
  Factory,
  FileSpreadsheet,
  FileText,
  FolderKanban,
  Landmark,
  LineChart,
  Package,
  ShieldCheck,
  ShoppingCart,

  TrendingDown,
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
          <BadgeGreen style={{ marginBottom: 28 }}>Financial Module</BadgeGreen>

          <Heading level={2} style={{ marginBottom: 36 }}>
            Control your finances with clarity and{" "}{<br/>}
            <Heading.Muted>close the books in hours, not weeks.</Heading.Muted>
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

        {/* Page-specific mock — editorial dark panel + invoice card ─── */}
        <div className="bz-hero-visual mx-auto grid w-full max-w-[1100px] grid-cols-1 gap-3 sm:grid-cols-5">
          <HeroOlivePanel />
          <HeroStatementCard />
        </div>
      </Container>
    </Section>
  );
}

function HeroOlivePanel() {
  return (
    <div className="relative overflow-hidden rounded-bz-2xl bg-bz-olive p-5 sm:col-span-2 sm:min-h-[460px]">
      <DotGrid tone="dark" />

      {/* Editorial flat accent block — no gradient, just an offset shape */}
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
          Period close
        </div>

        <div className="flex flex-col gap-2.5">
          {/* Floating completion chip */}
          <div className="flex items-center justify-between rounded-bz-lg bg-bz-paper p-3 shadow-[0_18px_40px_-22px_rgba(0,0,0,0.6)]">
            <div className="flex items-center gap-2.5">
              <span className="flex size-7 items-center justify-center rounded-bz-pill border border-bz-line text-bz-text">
                <CheckCircle2 size={14} strokeWidth={2} />
              </span>
              <span className="text-[13px] font-medium text-bz-text">
                Reconciliation
              </span>
            </div>
            <span className="rounded-bz-pill bg-bz-paper-warm px-2.5 py-1 text-[10.5px] font-medium text-bz-text-muted">
              Complete
            </span>
          </div>

          {/* Primary action — pill-dark button */}
          <button
            type="button"
            className="flex items-center justify-center gap-2 rounded-bz-lg bg-bz-deep py-3.5 text-[13.5px] font-medium text-bz-text-on-dark transition-colors hover:bg-bz-olive-dark"
          >
            Close the period
            <ArrowUpRight size={14} strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  );
}

function HeroStatementCard() {
  const rows = [
    { label: "Revenue",          value: "$4,820,000" },
    { label: "Operating expenses", value: "$1,840,000", muted: true },
    { label: "VAT (10%)",        value: "$298,400",   muted: true },
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
        {/* Period / Entities pair */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Period from", value: "Q3 · 2024" },
            { label: "Entities",    value: "4 consolidated" },
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
          Live income statement
        </p>

        {/* Statement rows */}
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
                      <FileText size={13} strokeWidth={1.8} />
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

        {/* Net income — emphasized total row */}
        <div className="mt-1 flex items-center justify-between rounded-bz-lg bg-bz-paper-warm px-4 py-3.5">
          <span className="text-[13px] text-bz-text-muted">Net income</span>
          <span className="text-[22px] font-medium tabular-nums text-bz-text">
            $812,000
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

        <BentoGrid cols={2} gap={20}>
          <ReportingCell
            title="One-click financial statements"
            body="Income, balance sheet and cash flow — auto-consolidated across every entity and refreshed the moment a transaction posts."
            visual={<StatementMockVisual />}
          />
          <ReportingCell
            title="Drill from totals to journals"
            body="Every number resolves to its source journal entry in a single click. A full audit trail behind every figure, by default."
            visual={<DrillTrailVisual />}
          />
          <ReportingCell
            title="Anomaly detection, built-in"
            body="Variance from budget, aged AR, expense outliers — surfaced automatically the moment they emerge, not at month-end."
            visual={<AnomalyVisual />}
          />
          <ReportingCell
            title="Export the way auditors want it"
            body="GAAP, IFRS and locale-specific formats — ready out of the box, exported as PDF, XBRL or Excel without template chasing."
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
      <div className="flex h-full flex-col items-center text-center">
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

function StatementMockVisual() {
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
            Net income
          </span>
        </div>
        <div className="flex items-center justify-between rounded-bz-md bg-bz-paper-warm px-3 py-2.5">
          <span className="block h-[3px] w-14 rounded-bz-pill bg-bz-line" />
          <span className="text-[18px] font-medium tabular-nums text-bz-text">
            $812K
          </span>
        </div>
      </div>
    </div>
  );
}

function DrillTrailVisual() {
  const path = [
    { label: "Net income" },
    { label: "OpEx"       },
    { label: "Marketing"  },
    { label: "JE-2024-8721", final: true },
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
      title: "Marketing OpEx",
      delta: "+18%",
      tone: "bad" as const,
    },
    {
      icon: TrendingDown,
      title: "Travel spend",
      delta: "−22%",
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
    { icon: BookOpen,        label: "XBRL"                 },
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
