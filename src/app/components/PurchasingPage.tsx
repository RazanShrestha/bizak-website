import "../../styles/style.css";
import * as React from "react";
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  BookOpen,
  Building2,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Clock,
  DollarSign,
  FileText,
  Landmark,
  Network,
  Package,
  Receipt,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Tags,
  TrendingDown,
  TrendingUp,
  Truck,
  Warehouse,
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
    icon: Building2,
    title: "Vendor management",
    desc: "Centralise supplier details, performance scores and contract history in a unified vendor master.",
  },
  {
    icon: Workflow,
    title: "Custom approval chains",
    desc: "Multi-level routing by amount, department or project — escalate automatically on the rules you set.",
  },
  {
    icon: ClipboardCheck,
    title: "3-way matching",
    desc: "Convert POs to invoices instantly with automated PO ↔ GRN ↔ invoice reconciliation.",
  },
  {
    icon: DollarSign,
    title: "Finance integration",
    desc: "Direct ledger posting on every approved PO — real-time AP, zero manual journals.",
  },
  {
    icon: Package,
    title: "Inventory sync",
    desc: "Stock levels update automatically on goods receipt — no re-keying between modules.",
  },
  {
    icon: BarChart3,
    title: "Spend analytics",
    desc: "Deep insights into purchasing patterns, leakage and savings opportunities across vendors.",
  },
] as const;

const METRICS = [
  {
    value: "40%",
    label: "Faster procurement",
    desc: "Automated RFQs and approval routing cut manual cycle times across the buying team.",
  },
  {
    value: "12%",
    label: "Lower unit cost",
    desc: "Data-driven negotiation insights and vendor scoring lower the average cost per unit.",
  },
  {
    value: "100%",
    label: "Audit coverage",
    desc: "Every PO, GRN and invoice posts straight to the ledger with a full digital trail.",
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
          <BadgeGreen style={{ marginBottom: 28 }}>Purchasing</BadgeGreen>

          <Heading level={2} style={{ marginBottom: 36 }}>
            Control purchasing and vendor relationships,{" "}
            <Heading.Muted>from RFQ to receipt to the ledger.</Heading.Muted>
          </Heading>

          <div className="flex flex-wrap justify-center gap-[10px]">
            <Pill variant="dark" withTick href="/contact">
              Request demo
            </Pill>
            <Pill variant="light" iconLeft={<Sparkles size={13} />} href="#features">
              View features
            </Pill>
          </div>
        </div>

        <HeroCanvas>
          <HeroCard
            icon={<Truck size={12} />}
            title="Open POs"
            badge="Live"
            badgeVariant="live"
            eyebrow="Procurement · Q3"
            value="142"
          >
            <div className="rounded-bz-lg bg-bz-paper-warm p-3">
              <DataRow
                label="Avg. cycle time"
                value="4.2 days"
                emphasis
                className="mb-1.5"
              />
              <MiniBars values={[58, 46, 52, 40, 36, 32, 28]} highlightLast />
            </div>
          </HeroCard>

          <HeroCard
            icon={<Receipt size={12} />}
            title="PO-2024-8821"
            badge="Matched"
            badgeVariant="posted"
            eyebrow="Axeon Logistics · Approved"
            value="$48,200"
          >
            <div className="flex flex-col gap-1.5 rounded-bz-lg bg-bz-paper-warm px-3 py-2.5">
              <DataRow label="AP" value="−$48,200.00" />
              <DataRow label="Goods receipt · VAT 19%" value="GRN-990-22 · +$7,695" />
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
          label="Core capabilities"
          title={
            <>
              A structured procurement system,{" "}
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
              <Heading.Muted>for the modern procurement team.</Heading.Muted>
            </>
          }
          titleMaxWidth={720}
        />

        <BentoGrid cols={2}>
          <VendorScorecardBento />
          <ApprovalChainBento />
          <ThreeWayMatchBento />
          <AuditTrailBento />
        </BentoGrid>
      </Container>
    </Section>
  );
}

function VendorScorecardBento() {
  const metrics = [
    { label: "On-time", value: "99.2%", accent: true },
    { label: "Quality", value: "A+" },
    { label: "Contracts", value: "12 Active" },
  ];
  return (
    <Bento tone="dark" hover dotGrid minHeight={360}>
      <Bento.Header
        title="Vendor scorecard"
        icon={<Building2 size={26} strokeWidth={1.4} color="#DBE9B8" />}
      />
      <Bento.Desc>
        Maintain a high-performance supplier network with automated ratings, contract health and
        real-time status tracking.
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
              Active supplier · Enterprise tier
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

function ApprovalChainBento() {
  const rows: Array<{ label: string; status: "ok" | "review" | "muted"; sub: string }> = [
    { label: "Manager approval", status: "ok", sub: "Cleared · 2 min" },
    { label: "CFO review > $50k", status: "review", sub: "Awaiting · routed" },
    { label: "Compliance log", status: "muted", sub: "Auto-posted" },
  ];
  return (
    <Bento tone="paper" hover minHeight={360}>
      <Bento.Header
        title="Approval chain"
        icon={<Network size={26} strokeWidth={1.4} color="#1F3422" />}
      />
      <Bento.Desc>
        Dynamic multi-level approval routing with conditional logic — every PO touched, every
        threshold escalated.
      </Bento.Desc>
      <Bento.Footer tone="light" className="flex flex-col gap-1.5">
        {rows.map((r) => (
          <div
            key={r.label}
            className="flex items-center justify-between rounded-bz-md bg-bz-paper-warm px-3 py-2.5"
          >
            <div className="min-w-0">
              <p className="text-[12px] font-medium text-bz-text">{r.label}</p>
              <p className="truncate text-[10.5px] uppercase tracking-[0.06em] text-bz-text-muted">
                {r.sub}
              </p>
            </div>
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

function ThreeWayMatchBento() {
  const docs = [
    { label: "PO-2024-8821", role: "Purchase order", amt: "$48,200", ok: true },
    { label: "GRN-990-22", role: "Goods receipt", amt: "$48,200", ok: true },
    { label: "INV-AX-402", role: "Vendor invoice", amt: "$48,200", ok: true },
  ];
  return (
    <Bento tone="leaf" hover minHeight={300}>
      <Bento.Header
        title="3-way matching"
        icon={<ClipboardCheck size={26} strokeWidth={1.4} color="#1F3422" />}
      />
      <Bento.Desc style={{ color: "#1F3422", opacity: 0.78 }}>
        PO, goods receipt and vendor invoice reconcile automatically — exceptions surfaced, the
        rest posted to AP without a keystroke.
      </Bento.Desc>
      <Bento.Footer className="bg-[rgba(31,52,34,0.08)] flex flex-col gap-1.5">
        {docs.map((d) => (
          <div
            key={d.label}
            className="flex items-center justify-between rounded-bz-md bg-bz-paper px-3 py-2"
          >
            <div className="min-w-0">
              <p className="text-[11.5px] font-medium text-bz-text">{d.label}</p>
              <p className="truncate text-[10px] uppercase tracking-[0.06em] text-bz-text-muted">
                {d.role}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-medium tabular-nums text-bz-text">{d.amt}</span>
              <CheckCircle2 size={13} strokeWidth={1.8} className="text-emerald-600" />
            </div>
          </div>
        ))}
      </Bento.Footer>
    </Bento>
  );
}

function AuditTrailBento() {
  const trail = [
    { type: "PURCHASE_ORDER", id: "#PO-2024-8821" },
    { type: "GOODS_RECEIPT", id: "#GRN-990-22" },
    { type: "VENDOR_INVOICE", id: "#INV-AX-402" },
  ];
  return (
    <Bento tone="dark" hover minHeight={300}>
      <Bento.Header
        title="Audit-grade trail"
        icon={<ShieldCheck size={26} strokeWidth={1.4} color="#DBE9B8" />}
      />
      <Bento.Desc>
        Every procurement event — quote, PO, receipt, invoice — links to its source document and
        ledger entry. One click to inspect, anytime.
      </Bento.Desc>
      <Bento.Footer tone="dark" className="flex flex-col gap-1.5">
        {trail.map((r) => (
          <div
            key={r.id}
            className="flex items-center justify-between rounded-bz-md bg-white/[0.04] px-3 py-2"
          >
            <span className="text-[10.5px] font-medium uppercase tracking-[0.06em] text-bz-fire">
              {r.type}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[11.5px] text-bz-text-on-dark">{r.id}</span>
              <ChevronRight size={13} strokeWidth={2} className="text-white/[0.45]" />
            </div>
          </div>
        ))}
      </Bento.Footer>
    </Bento>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// [03] REPORTING — procurement intelligence
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
              Click any spend line,{" "}
              <Heading.Muted>see the full procurement trail.</Heading.Muted>
            </>
          }
          description="From quarterly spend down to the originating RFQ — every figure on a procurement dashboard resolves to its source transaction."
          titleMaxWidth={780}
        />

        <BentoGrid cols={12}>
          <Bento tone="paper" span={8} minHeight={420}>
            <SpendAnalyticsPanel />
          </Bento>
          <Bento tone="paper" span={4} minHeight={420}>
            <ProcurementKpiPanel />
          </Bento>
          <Bento tone="paper" span={5} minHeight={380}>
            <TopVendorsPanel />
          </Bento>
          <Bento tone="paper" span={7} minHeight={380}>
            <SpendTrailPanel />
          </Bento>
        </BentoGrid>
      </Container>
    </Section>
  );
}

function SpendAnalyticsPanel() {
  return (
    <>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="mb-1.5 flex items-center gap-2">
            <span className="inline-flex size-7 items-center justify-center rounded-bz-md bg-bz-leaf text-[#1F3422]">
              <TrendingDown size={14} strokeWidth={1.8} />
            </span>
            <h3 className="text-[15px] font-medium text-bz-text">Executive spend analytics</h3>
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
            d="M0 60C50 70 100 130 150 110C200 90 250 30 300 60C350 90 400 150 450 140C500 130 550 80 600 100C650 120 700 170 750 160"
            stroke="var(--bz-olive)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <path
            d="M0 90C50 95 100 110 150 115C200 120 250 100 300 110C350 120 400 130 450 130C500 130 550 110 600 115C650 120 700 130 750 135"
            stroke="var(--bz-text-muted)"
            strokeDasharray="8 8"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
        <div className="absolute left-1/2 top-[14%] -translate-x-1/2 rounded-bz-md border border-bz-line-soft bg-bz-paper px-3 py-2 text-center whitespace-nowrap">
          <div className="mb-0.5 text-[9px] font-medium uppercase tracking-[0.1em] text-bz-text-muted">
            Peak spend
          </div>
          <div className="text-[15px] font-medium tabular-nums text-bz-text">$1.24M</div>
          <div className="text-[9px] text-bz-text-muted">Vendor: Axis Mfg</div>
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
          Drill into POs
          <ArrowUpRight size={13} strokeWidth={2} />
        </a>
      </div>
    </>
  );
}

function ProcurementKpiPanel() {
  const tiles: Array<{
    icon: React.ElementType;
    label: string;
    value: string;
    sub?: string;
    intent?: "good" | "bad" | "neutral";
    bar?: number;
  }> = [
    { icon: DollarSign, label: "Vendor spend", value: "$428k", sub: "↓ 4.2%", intent: "good" },
    { icon: TrendingDown, label: "Cost variance", value: "0.82%", sub: "Target met", intent: "neutral" },
    { icon: Clock, label: "Cycle time", value: "3.2d", sub: "↓ 12%", intent: "good" },
    { icon: BarChart3, label: "Budget util.", value: "74%", bar: 74 },
  ];
  return (
    <>
      <div className="mb-4 flex items-start justify-between">
        <div>
          <div className="text-[11px] font-medium uppercase tracking-[0.12em] text-bz-text-muted">
            This quarter
          </div>
          <h3 className="mt-1.5 text-[15px] font-medium text-bz-text">Procurement KPIs</h3>
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

function TopVendorsPanel() {
  const vendors = [
    { flag: "🇺🇸", name: "Axis Manufacturing", amount: "$1.24M", pct: 38 },
    { flag: "🇩🇪", name: "Helio Components", amount: "€820k", pct: 24 },
    { flag: "🇬🇧", name: "Northwind Supply", amount: "£540k", pct: 18 },
    { flag: "🇯🇵", name: "Sakai Logistics", amount: "¥28M", pct: 12 },
  ];
  return (
    <>
      <div className="mb-4 flex items-start justify-between">
        <div>
          <div className="text-[11px] font-medium uppercase tracking-[0.12em] text-bz-text-muted">
            By spend
          </div>
          <h3 className="mt-1.5 text-[15px] font-medium text-bz-text">Top vendors</h3>
        </div>
        <StatusChip variant="posted">YTD</StatusChip>
      </div>

      <div className="flex flex-col gap-2.5">
        {vendors.map((v) => (
          <div key={v.name}>
            <EntityRow flag={v.flag} name={v.name} amount={v.amount} />
            <div className="mt-1.5">
              <StripeBar pct={v.pct} />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function SpendTrailPanel() {
  const path = [
    { label: "Q3 Spend", value: "$3.61M" },
    { label: "Direct mat.", value: "$1.62M" },
    { label: "Axis Mfg", value: "$1.24M" },
    { label: "PO-8821", value: "$48,200", final: true },
  ];
  const events = [
    { date: "14 · Sep", ref: "RFQ-7702", desc: "RFQ issued · 3 bidders", amt: "$48,200" },
    { date: "21 · Sep", ref: "PO-8821",  desc: "PO approved · CFO routed", amt: "$48,200" },
    { date: "28 · Sep", ref: "GRN-990",  desc: "Goods receipt · 250 units", amt: "$48,200" },
  ];
  return (
    <>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-[11px] font-medium uppercase tracking-[0.12em] text-bz-text-muted">
            Audit trail
          </div>
          <h3 className="mt-1.5 text-[15px] font-medium text-bz-text">
            Spend → vendor → PO
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
// [04] CONNECTIVITY — purchasing connected to inventory and finance
// ════════════════════════════════════════════════════════════════════════════

const SOURCES_TOP = [
  { icon: Tags,          label: "RFQs",       sub: "Bid · Score"        },
  { icon: ShoppingCart,  label: "POs",        sub: "Approve · Issue"    },
  { icon: Warehouse,     label: "Receipts",   sub: "Match · Reconcile"  },
] as const;

const SOURCES_BOTTOM = [
  { icon: Package,       label: "Inventory",  sub: "Update · Replenish" },
  { icon: Receipt,       label: "AP invoices",sub: "3-way · Pay"        },
  { icon: Landmark,      label: "Finance",    sub: "Post · Reconcile"   },
] as const;

const GL_ROWS = [
  { time: "14:32", source: "Purch · PO-8821",   debit: "Inventory",     credit: "AP · VAT",       amt: "$48,200", fresh: true },
  { time: "14:28", source: "RFQ · 7702",         debit: "Commit",        credit: "Budget reserve", amt: "$48,200"              },
  { time: "14:25", source: "GRN · 990-22",       debit: "Inventory",     credit: "GR/IR",          amt: "$36,800"              },
  { time: "14:21", source: "Purch · PO-8809",    debit: "Direct mat.",   credit: "AP",             amt: "$12,400"              },
  { time: "14:18", source: "Purch · PO-8804",    debit: "Inventory",     credit: "AP · VAT",       amt: "$24,600"              },
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
              Purchasing connected{" "}
              <Heading.Muted>directly to inventory and finance.</Heading.Muted>
            </>
          }
          description="Every step in the procurement cycle — RFQ, PO, receipt, invoice — auto-posts to the General Ledger in real time. No re-keying, no spreadsheet reconciliation."
          titleMaxWidth={780}
        />

        <div className="relative mx-auto max-w-[1100px]">
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

          <div className="relative my-4 overflow-hidden rounded-bz-2xl bg-bz-olive-soft p-5 sm:my-0 sm:p-7">
            <DotGrid tone="dark" />
            <div className="relative">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex size-9 items-center justify-center rounded-bz-md bg-bz-fire text-[#1F3422]">
                    <BookOpen size={15} strokeWidth={2} />
                  </span>
                  <div>
                    <p className="text-[14px] font-medium text-bz-text-on-dark">Purchasing hub</p>
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
                  procurement events posted today
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
            { icon: ClipboardCheck, label: "3-way matched" },
            { icon: BookOpen,    label: "Full PO audit trail" },
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
              <Heading.Muted>on every PO you raise.</Heading.Muted>
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

export function PurchasingPage() {
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
