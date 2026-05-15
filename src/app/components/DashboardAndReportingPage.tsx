import React from "react";
import {
  Section,
  Container,
  SectionHead,
  BigCard,
  StepCard,
  Pill,
  PillGroup,
  Heading,
  BadgeGreen,
  MiniBars,
  StatusChip,
  DotGrid,
} from "./bz";
import { Settings } from "lucide-react";

// ─── DATA ─────────────────────────────────────────────────────────────────────

const HERO_KPIS = [
  { label: "Cash Position", value: "$4.2M",  delta: "Healthy"      },
  { label: "Gross Margin",  value: "41.2%",  delta: "+1.4pp"       },
  { label: "Entities",      value: "4 live", delta: "Consolidated" },
];

const HERO_BARS = [42, 50, 48, 58, 64, 61, 72, 69, 78, 80, 84, 91];

const HERO_INSIGHTS = [
  { text: "AR overdue > 60d: $48.2K",   warn: true  },
  { text: "Budget on track: Marketing", warn: false },
  { text: "Q3 close: 3 days remaining", warn: false },
];

const STREAM_ENTRIES = [
  { module: "Finance",       ref: "SO-1041",  event: "AR / Revenue posted",     stat: "$48,200", live: true  },
  { module: "Sales",         ref: "INV-2046", event: "Pipeline entry refreshed", stat: "$12,400", live: true  },
  { module: "Inventory",     ref: "SH-77",    event: "Fill rate updated",        stat: "96.2%",   live: false },
  { module: "Manufacturing", ref: "WO-441",   event: "OEE target posted",        stat: "87.4%",   live: false },
  { module: "Projects",      ref: "TM-1182",  event: "Timesheet auto-billed",    stat: "14.5h",   live: false },
  { module: "Distribution",  ref: "DO-889",   event: "Delivery rate refreshed",  stat: "98.1%",   live: false },
];

const ROLE_PROFILES = [
  { name: "CFO",        tagline: "Financial control",      kpis: ["Cash position", "Gross margin", "Entity P&L"],  active: true  },
  { name: "Finance",    tagline: "Close & reconciliation", kpis: ["AR aging", "AP due", "Open items"],             active: false },
  { name: "Operations", tagline: "Throughput & fill",      kpis: ["OEE target", "Fill rate", "Order backlog"],     active: false },
  { name: "Sales",      tagline: "Pipeline & collections", kpis: ["Open orders", "Overdue AR", "Forecast"],        active: false },
];

const DRILL_LEVELS = [
  { type: "Dashboard KPI",   value: "Net Income",            stat: "$920.4K",    depth: 0 },
  { type: "P&L Line",        value: "Marketing Expenses",    stat: "$48.2K",     depth: 1 },
  { type: "Journal Entry",   value: "JE-2841 · Auto-posted", stat: "",           depth: 2 },
  { type: "Source Document", value: "Invoice PI-0492",       stat: "$48.2K",     depth: 3 },
];

const REPORT_TYPES = [
  { abbr: "P&L",  sub: "Income"           },
  { abbr: "BS",   sub: "Balance Sheet"    },
  { abbr: "CF",   sub: "Cash Flow"        },
  { abbr: "AR",   sub: "AR Aging"         },
  { abbr: "BvA",  sub: "Budget vs Actual" },
  { abbr: "TAX",  sub: "Tax Summary"      },
  { abbr: "INV",  sub: "Inventory"        },
  { abbr: "HR",   sub: "Payroll"          },
];

const SCHEDULES = [
  { name: "Executive P&L", freq: "Mon · 08:00",   fmt: "PDF" },
  { name: "Cash Flow",     freq: "Daily · 07:00", fmt: "XLS" },
  { name: "Inventory",     freq: "Daily · 06:00", fmt: "CSV" },
];

const IMPACT_STATS = [
  {
    value: "60%",
    label: "Faster month-end",
    desc: "Automated reconciliation and instant cross-module consolidation close without a single manual export.",
  },
  {
    value: "40+",
    label: "Report templates",
    desc: "Financial, operational and compliance reports ready on day one customise any of them in minutes.",
  },
  {
    value: "100%",
    label: "Audit coverage",
    desc: "Every figure traces to its originating transaction. Full digital trail, timestamped per user.",
  },
];

// ─── HERO MOCK ─────────────────────────────────────────────────────────────────

// Top: full-width dark KPI command bar
function HeroLiveBoard() {
  return (
    <div className="relative overflow-hidden rounded-bz-2xl bg-bz-olive px-5 py-5">
      <DotGrid tone="dark" />
      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-bz-fire shrink-0" />
            <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/60">
              Live · CFO View
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-1">
            {["CFO", "Finance", "Ops", "Sales"].map((tab, i) => (
              <span
                key={tab}
                className={`px-2.5 py-1 rounded-bz-pill text-[10px] font-semibold ${
                  i === 0 ? "bg-bz-fire/[0.15] text-bz-fire" : "text-white/40"
                }`}
              >
                {tab}
              </span>
            ))}
          </div>
          <StatusChip variant="live">Live</StatusChip>
        </div>

        {/* 3 KPI tiles */}
        <div className="grid grid-cols-3 gap-2.5">
          {HERO_KPIS.map((kpi) => (
            <div
              key={kpi.label}
              className="rounded-bz-xl bg-white/[0.06] border border-white/[0.08] px-3 md:px-5 py-3 md:py-4"
            >
              <p className="text-[8.5px] font-semibold uppercase tracking-[0.10em] text-white/40 mb-1.5">
                {kpi.label}
              </p>
              <p className="text-[18px] md:text-[26px] font-bold text-bz-text-on-dark leading-none mb-2">
                {kpi.value}
              </p>
              <span className="text-[8px] font-bold text-bz-fire bg-bz-fire/[0.12] px-1.5 py-0.5 rounded-bz-pill">
                {kpi.delta}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Bottom-left: revenue trend chart with period selector + YTD metrics
function HeroRevenueTrend() {
  const ytdMetrics = [
    { label: "YTD Revenue", value: "$18.4M" },
    { label: "vs Budget",   value: "+6.2%"  },
    { label: "Forecast",    value: "$22.1M" },
  ];
  return (
    <div className="rounded-bz-2xl border border-bz-line bg-bz-surface overflow-hidden flex flex-col h-full">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-bz-line-soft shrink-0">
        <span className="text-[11px] font-semibold text-bz-text">Revenue · 12 months</span>
        <div className="flex items-center gap-0.5">
          {["Q1", "Q2", "Q3", "Q4"].map((p, i) => (
            <span
              key={p}
              className={`px-2 py-0.5 rounded-bz-sm text-[9.5px] font-medium ${
                i === 3 ? "bg-bz-paper-warm text-bz-text" : "text-bz-text-muted"
              }`}
            >
              {p}
            </span>
          ))}
        </div>
      </div>

      <div className="px-5 pt-5 pb-4 flex-1">
        <MiniBars values={HERO_BARS} height={56} highlightLast />
      </div>

      <div className="grid grid-cols-3 border-t border-bz-line-soft shrink-0">
        {ytdMetrics.map((m, i) => (
          <div
            key={m.label}
            className={`px-4 py-3 ${i < 2 ? "border-r border-bz-line-soft" : ""}`}
          >
            <p className="text-[8.5px] font-semibold uppercase tracking-[0.08em] text-bz-text-muted mb-1">
              {m.label}
            </p>
            <p className="text-[13px] font-bold text-bz-text">{m.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// Bottom-right: scheduled report delivery panel
function HeroReportSidebar() {
  return (
    <div className="rounded-bz-2xl border border-bz-line bg-bz-paper overflow-hidden flex flex-col h-full">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-bz-line-soft shrink-0">
        <span className="text-[11px] font-semibold text-bz-text">Scheduled reports</span>
        <span className="text-[9px] font-semibold text-bz-text-muted bg-bz-paper-warm px-2 py-0.5 rounded-bz-pill">
          3 active
        </span>
      </div>

      <div className="flex flex-col divide-y divide-bz-line-soft flex-1">
        {SCHEDULES.map((s) => (
          <div key={s.name} className="flex items-center justify-between gap-3 px-5 py-3.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-1.5 h-1.5 rounded-full bg-bz-fire shrink-0" />
              <div className="min-w-0">
                <p className="text-[12px] font-medium text-bz-text truncate">{s.name}</p>
                <p className="text-[10px] text-bz-text-muted mt-0.5">{s.freq}</p>
              </div>
            </div>
            <span className="text-[9px] font-bold text-bz-leaf-deep bg-bz-leaf-deep/[0.12] px-2 py-0.5 rounded-bz-pill shrink-0">
              {s.fmt}
            </span>
          </div>
        ))}
      </div>

      <div className="px-5 py-3.5 border-t border-bz-line-soft bg-bz-paper-warm/40 shrink-0">
        <p className="text-[10.5px] text-bz-text-muted leading-snug">
          <span className="font-semibold text-bz-text">Next delivery</span>
          {" "}· Cash Flow at 07:00 tomorrow
        </p>
      </div>
    </div>
  );
}

// ─── DRILL VISUAL ──────────────────────────────────────────────────────────────

function DrillZoomVisual() {
  return (
    <div className="flex flex-col gap-2 w-full">
      {DRILL_LEVELS.map((l, i) => (
        <div
          key={l.type}
          className={`rounded-bz-lg border px-4 py-3 ${
            i === 0
              ? "border-bz-fire/40 bg-bz-fire/[0.06]"
              : "border-bz-line-soft bg-bz-surface"
          }`}
          style={{ marginLeft: `${l.depth * 10}px` }}
        >
          <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-bz-text-muted mb-1">
            {l.type}
          </p>
          <div className="flex items-center justify-between gap-2">
            <p
              className={`text-[12.5px] font-semibold leading-snug ${
                i === 0 ? "text-bz-text" : "text-bz-text-muted"
              }`}
            >
              {l.value}
            </p>
            {l.stat && (
              <p
                className={`text-[11.5px] font-medium tabular-nums shrink-0 ${
                  i === 0 ? "text-bz-text" : "text-bz-text-soft"
                }`}
              >
                {l.stat}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── REPORT CATALOG VISUAL ────────────────────────────────────────────────────

function ReportCatalogVisual() {
  return (
    <div className="w-full flex flex-col gap-5">
      <div>
        <p className="text-[9px] font-bold uppercase tracking-[0.10em] text-white/40 mb-3">
          Report catalog · 40+ templates
        </p>
        <div className="grid grid-cols-4 gap-2">
          {REPORT_TYPES.map(({ abbr, sub }) => (
            <div key={abbr} className="bg-white/[0.08] rounded-bz-md py-3 text-center">
              <div className="text-[12px] font-bold text-bz-text-on-dark">{abbr}</div>
              <div className="text-[8px] text-white/40 uppercase tracking-[0.05em] mt-0.5 leading-tight">
                {sub}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <p className="text-[9px] font-bold uppercase tracking-[0.10em] text-white/40 mb-3">
          Scheduled delivery
        </p>
        <div className="flex flex-col gap-1.5">
          {SCHEDULES.map((s) => (
            <div
              key={s.name}
              className="flex items-center justify-between gap-3 rounded-bz-md bg-white/[0.05] px-3 py-2.5"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-1 h-1 rounded-full bg-bz-fire shrink-0" />
                <span className="text-[11px] text-white/80 truncate">{s.name}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[9px] text-white/40 hidden sm:inline">{s.freq}</span>
                <span className="text-[9px] font-bold text-bz-fire bg-bz-fire/[0.12] px-1.5 py-0.5 rounded">
                  {s.fmt}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── SECTIONS ─────────────────────────────────────────────────────────────────

function HeroSection() {
  return (
    <Section tone="b" pad="hero">
      <Container>
        <div className="flex flex-col items-center text-center">
          <BadgeGreen style={{ marginBottom: 28 }}>Platform Capability</BadgeGreen>
          <Heading level={2} style={{ marginBottom: 36 }}>
            Your entire business,{" "}
            <Heading.Muted>visible in one place.</Heading.Muted>
          </Heading>
          <PillGroup>
            <Pill
              variant="dark"
              withArrowUpRight
              href="https://system.bizakerp.com/account/self-register"
            >
              Get Started
            </Pill>
            <Pill variant="light" withArrow href="/contact">
              Request Demo
            </Pill>
          </PillGroup>
        </div>

        {/* Mosaic: full-width dark KPI board + chart + report schedule */}
        <div className="bz-hero-visual mx-auto w-full max-w-[1140px] flex flex-col gap-3">
          <HeroLiveBoard />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <HeroRevenueTrend />
            </div>
            <div className="hidden md:block md:col-span-1">
              <HeroReportSidebar />
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}

// Live data stream every module posts to the dashboard in real-time
function DataStreamSection() {
  return (
    <Section tone="a">
      <Container>
        <SectionHead
          index="01"
          label="Live data"
          title={
            <>
              One platform.{" "}
              <Heading.Muted>Every transaction, live.</Heading.Muted>
            </>
          }
          description="Every event across Finance, Sales, Inventory, Manufacturing, Projects and Distribution posts to your dashboard the moment it happens."
        />

        <div className="rounded-bz-xl overflow-hidden border border-bz-line-soft">
          {/* Stream header */}
          <div className="flex items-center justify-between px-5 py-3 bg-bz-paper border-b border-bz-line-soft">
            <div className="flex items-center gap-2.5">
              <StatusChip variant="live">Live</StatusChip>
              <span className="text-[10px] font-medium text-bz-text-muted">
                6 modules streaming
              </span>
            </div>
            <span className="text-[10px] text-bz-text-muted hidden sm:inline">
              247 entries posted today
            </span>
          </div>

          {/* Stream rows */}
          <div className="flex flex-col divide-y divide-bz-line-soft">
            {STREAM_ENTRIES.map((entry) => (
              <div
                key={entry.ref}
                className={`flex items-center gap-4 px-5 py-4 ${
                  entry.live ? "bg-bz-fire/[0.03]" : ""
                }`}
              >
                {/* Module tag */}
                <span
                  className={`text-[10.5px] font-semibold shrink-0 w-28 hidden sm:block uppercase tracking-[0.07em] ${
                    entry.live ? "text-bz-text" : "text-bz-text-muted"
                  }`}
                >
                  {entry.module}
                </span>

                {/* Ref */}
                <span className="text-[11px] text-bz-text-soft w-20 shrink-0 hidden md:block tabular-nums">
                  {entry.ref}
                </span>

                {/* Event description */}
                <p
                  className={`flex-1 text-[13px] min-w-0 truncate ${
                    entry.live ? "font-medium text-bz-text" : "text-bz-text-muted"
                  }`}
                >
                  <span className="sm:hidden font-semibold text-bz-text">
                    {entry.module} ·{" "}
                  </span>
                  {entry.event}
                </p>

                {/* Stat */}
                <span
                  className={`text-[12.5px] font-bold tabular-nums shrink-0 ${
                    entry.live ? "text-bz-text" : "text-bz-text-soft"
                  }`}
                >
                  {entry.stat}
                </span>

                {/* Live indicator */}
                <div
                  className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    entry.live ? "bg-bz-fire" : "bg-bz-line"
                  }`}
                />
              </div>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}

// Role-based dashboards flat 4-col panel inside a dark section
function RoleIntelligenceSection() {
  return (
    <Section tone="dark">
      <Container>
        <SectionHead
          tone="dark"
          index="02"
          label="Role-based intelligence"
          title={
            <>
              Every role.{" "}
              <Heading.Muted>Their view, by default.</Heading.Muted>
            </>
          }
          description="Every function in your business gets a pre-configured dashboard scoped to the data they need."
        />

        {/* Role panel: gap-px grid creates thin dividers without per-item border logic */}
        <div className="rounded-bz-2xl overflow-hidden bg-bz-olive-soft">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-white/[0.08]">
            {ROLE_PROFILES.map((r) => (
              <div
                key={r.name}
                className={`flex flex-col gap-5 p-7 lg:p-8 ${
                  r.active ? "bg-bz-olive-dark" : "bg-bz-olive-soft"
                }`}
              >
                <div>
                  <p
                    className={`text-[22px] font-bold leading-none mb-1.5 ${
                      r.active ? "text-bz-fire" : "text-bz-text-on-dark"
                    }`}
                  >
                    {r.name}
                  </p>
                  <p className="text-[11px] text-white/50">{r.tagline}</p>
                </div>

                <div className="flex flex-col gap-2.5">
                  {r.kpis.map((kpi) => (
                    <div key={kpi} className="flex items-center gap-2">
                      <div
                        className={`w-1 h-1 rounded-full shrink-0 ${
                          r.active ? "bg-bz-fire" : "bg-white/30"
                        }`}
                      />
                      <span
                        className={`text-[12.5px] ${
                          r.active ? "text-white/90" : "text-white/55"
                        }`}
                      >
                        {kpi}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-auto">
                  <span
                    className={`text-[9px] font-bold uppercase tracking-[0.10em] px-2.5 py-1 rounded-bz-pill ${
                      r.active
                        ? "bg-bz-fire/[0.15] text-bz-fire"
                        : "bg-white/[0.06] text-white/40"
                    }`}
                  >
                    {r.active ? "Active" : "Default"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Customisation note */}
        <div className="mt-4 rounded-bz-xl border border-white/[0.08] bg-white/[0.03] px-5 sm:px-6 py-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5">
            <div className="hidden sm:flex w-8 h-8 rounded-bz-md bg-white/[0.06] items-center justify-center shrink-0">
              <Settings size={14} className="text-white/70" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-bz-text-on-dark mb-1">
                Users customise on top of role defaults
              </p>
              <p className="text-[12px] text-white/55 leading-relaxed">
                Add, remove or reorder any widget. KPI tiles, trend lines, bar charts, AR aging tables.
              </p>
            </div>
            <div className="flex items-baseline gap-1.5 sm:shrink-0">
              <span className="text-[32px] font-bold text-bz-text-on-dark leading-none">12+</span>
              <span className="text-[11px] text-white/50">widget types</span>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}

// Drill to origin StepCard showing the 3-click audit trail
function DrillToOriginSection() {
  return (
    <Section tone="b">
      <Container>
        <SectionHead
          index="03"
          label="Full audit trail"
          title={
            <>
              Click any number.{" "}
              <Heading.Muted>Trace any entry.</Heading.Muted>
            </>
          }
          description="Every dashboard KPI connects to the original transaction in one click."
          titleMaxWidth={720}
          spacing="tight"
        />
        <StepCard
          number="03"
          tag="Click → drill → source"
          title="From dashboard to source document in three clicks."
          bullets={[
            "Click any KPI to open the underlying report line.",
          ]}
          visual={<DrillZoomVisual />}
        />
      </Container>
    </Section>
  );
}

// Reports & delivery BigCard (dark 2-col) with catalog + schedule visual
function ReportsSection() {
  return (
    <Section tone="a">
      <Container>
        <SectionHead
          index="04"
          label="Reports & delivery"
          title={
            <>
              40+ templates.{" "}
              <Heading.Muted>Delivered automatically.</Heading.Muted>
            </>
          }
          description="Pre-built reports for every function. Set a schedule once and Bizak handles the rest."
        />
        <BigCard
          text={{
            title: "40+ reports, ready on day one.",
            body: "Every standard financial and operational report, pre-built and live.",
            bullets: [
              "Income, balance sheet, cash flow, AR aging, BvA, tax and payroll",
              "Drag-and-drop custom builder filters, groupings, calculated columns",
            ],
            cta: {
              variant: "accent",
              withArrow: true,
              href: "/contact",
              children: "Request Demo",
            },
          }}
          visual={<ReportCatalogVisual />}
        />
      </Container>
    </Section>
  );
}

// Impact horizontal typographic stat strip, no cards
function ImpactSection() {
  return (
    <Section tone="b">
      <Container>
        <SectionHead
          index="05"
          label="Efficiency"
          title={
            <>
              Measurable results.{" "}
              <Heading.Muted>Every team.</Heading.Muted>
            </>
          }
          spacing="tight"
          titleMaxWidth={520}
        />
        <div className="grid grid-cols-1 sm:grid-cols-3 border-t border-bz-line-soft pt-10">
          {IMPACT_STATS.map((s, i) => (
            <div
              key={s.label}
              className={[
                "py-8 sm:py-0",
                i === 0 && "sm:pr-10",
                i === 1 && "sm:px-10 sm:border-l sm:border-r sm:border-bz-line-soft",
                i === 2 && "sm:pl-10",
                i < 2 && "border-b border-bz-line-soft sm:border-b-0",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <div className="bz-stat-num" style={{ fontSize: 52, marginBottom: 10 }}>
                {s.value}
              </div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-bz-text-muted mb-3">
                {s.label}
              </div>
              <p className="text-[13.5px] text-bz-text-muted leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export function DashboardAndReportingPage() {
  return (
    <>
      <HeroSection />
      <DataStreamSection />
      <RoleIntelligenceSection />
      <DrillToOriginSection />
      <ReportsSection />
      <ImpactSection />
    </>
  );
}
