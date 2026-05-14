import "../../styles/style.css";
import * as React from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  BookOpen,
  Building2,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  DollarSign,
  FileSpreadsheet,
  FileText,
  Landmark,
  Network,
  Package,
  Receipt,
  ShieldCheck,
  ShoppingCart,
  Tags,
  TrendingDown,
  Warehouse,
  Workflow,
} from "lucide-react";
import {
  BadgeGreen,
  Bento,
  BentoGrid,
  Container,
  DotGrid,
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
          <BadgeGreen style={{ marginBottom: 28 }}>Built for Buyers</BadgeGreen>

          <Heading level={2} style={{ marginBottom: 36 }}>
            From first RFQ to final ledger post,{" "}{<br className="hidden md:block"/>}
            <Heading.Muted>procurement that runs itself.</Heading.Muted>
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

        {/* Page-specific mock — editorial dark panel + PO card ─── */}
        <div className="bz-hero-visual mx-auto grid w-full max-w-[1100px] grid-cols-1 gap-3 sm:grid-cols-5">
          <HeroOlivePanel />
          <HeroPurchaseOrderCard />
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
          Purchase order
        </div>

        <div className="flex flex-col gap-2.5">
          {/* Floating approval chip */}
          <div className="flex items-center justify-between rounded-bz-lg bg-bz-paper p-3 shadow-[0_18px_40px_-22px_rgba(0,0,0,0.6)]">
            <div className="flex items-center gap-2.5">
              <span className="flex size-7 items-center justify-center rounded-bz-pill border border-bz-line text-bz-text">
                <CheckCircle2 size={14} strokeWidth={2} />
              </span>
              <span className="text-[13px] font-medium text-bz-text">
                PO-8821
              </span>
            </div>
            <span className="rounded-bz-pill bg-bz-paper-warm px-2.5 py-1 text-[10.5px] font-medium text-bz-text-muted">
              Approved
            </span>
          </div>

          {/* Primary action — pill-dark button */}
          <button
            type="button"
            className="flex items-center justify-center gap-2 rounded-bz-lg bg-bz-deep py-3.5 text-[13.5px] font-medium text-bz-text-on-dark transition-colors hover:bg-bz-olive-dark"
          >
            Issue purchase order
            <ArrowUpRight size={14} strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  );
}

function HeroPurchaseOrderCard() {
  const rows = [
    { label: "Raw materials",  value: "$36,800" },
    { label: "Logistics fee",  value: "$4,200",  muted: true },
    { label: "VAT (10%)",      value: "$7,200",  muted: true },
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
        {/* Vendor / Order no. pair */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Vendor",    value: "Axis Mfg · USD" },
            { label: "Order no.", value: "PO-8821" },
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
          Purchase order lines
        </p>

        {/* Line item rows */}
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

        {/* PO total — emphasized total row */}
        <div className="mt-1 flex items-center justify-between rounded-bz-lg bg-bz-paper-warm px-4 py-3.5">
          <span className="text-[13px] text-bz-text-muted">PO total</span>
          <span className="text-[22px] font-medium tabular-nums text-bz-text">
            $48,200
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
          <ApprovalChainBento />
          <VendorScorecardBento />
          <ThreeWayMatchBento />
          <AuditTrailBento />
        </BentoGrid>
      </Container>
    </Section>
  );
}

function ApprovalChainBento() {
  const rows: Array<{ label: string; status: "ok" | "review" | "muted"; sub: string }> = [
    { label: "Manager approval", status: "ok",     sub: "Cleared · 2 min"   },
    { label: "CFO review > $50k", status: "review", sub: "Awaiting · routed" },
    { label: "Compliance log",   status: "muted",  sub: "Auto-posted"       },
  ];
  return (
    <Bento tone="paper" hover minHeight={360}>
      <Bento.Header
        title="Approval chain"
        icon={<Network size={26} strokeWidth={1.4} color="#1F3422" />}
      />
      <Bento.Desc>
        Dynamic multi-level approval routing with conditional logic.
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
        Maintain a high-performance supplier network with automated ratings.
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

function ThreeWayMatchBento() {
  const docs = [
    { label: "PO-2024-8821",  role: "", amt: "$48,200", ok: true },
    { label: "GRN-990-22",    role: "",  amt: "$48,200", ok: true },
    { label: "INV-AX-402",    role: "", amt: "$48,200", ok: true },
  ];
  return (
    <Bento tone="leaf" hover minHeight={300}>
      <Bento.Header
        title="3-way matching"
        icon={<ClipboardCheck size={26} strokeWidth={1.4} color="#1F3422" />}
      />
      <Bento.Desc style={{ color: "#1F3422", opacity: 0.78 }}>
        PO, goods receipt and vendor invoice reconciled automatically.
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
    { type: "GOODS_RECEIPT",  id: "#GRN-990-22"   },
    { type: "VENDOR_INVOICE", id: "#INV-AX-402"   },
  ];
  return (
    <Bento tone="dark" hover minHeight={300}>
      <Bento.Header
        title="Audit-grade trail"
        icon={<ShieldCheck size={26} strokeWidth={1.4} color="#DBE9B8" />}
      />
      <Bento.Desc>
        Every procurement event quote, PO, receipt, invoice links to its source document and
        ledger entry.
      </Bento.Desc>
      <div className="pb-12"></div>
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
// [03] REPORTING — "Click any spend line, see the full procurement trail."
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
          description="From quarterly spend down to the originating RFQ every figure on a procurement dashboard."
          titleMaxWidth={780}
        />

        <BentoGrid cols={2} gap={20}>
          <ReportingCell
            title="One-click spend dashboards"
            body="From quarterly commitments down to the line item consolidated across every entity."
            visual={<SpendSummaryVisual />}
          />
          <ReportingCell
            title="Drill from spend to purchase orders"
            body="Every spend figure resolves to its originating RFQ, PO, and goods receipt in a single click."
            visual={<PurchaseDrillVisual />}
          />
          <ReportingCell
            title="Price variance detection, built-in"
            body="Vendor price deviations and budget overruns surface automatically."
            visual={<PriceVarianceVisual />}
          />
          <ReportingCell
            title="Export the way auditors want it"
            body="PDF, Excel and CSV for every PO list, approval log and vendor spend summary."
            visual={<PurchasingExportVisual />}
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

function SpendSummaryVisual() {
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
            Total spend
          </span>
        </div>
        <div className="flex items-center justify-between rounded-bz-md bg-bz-paper-warm px-3 py-2.5">
          <span className="block h-[3px] w-14 rounded-bz-pill bg-bz-line" />
          <span className="text-[18px] font-medium tabular-nums text-bz-text">
            $3.61M
          </span>
        </div>
      </div>
    </div>
  );
}

function PurchaseDrillVisual() {
  const path = [
    { label: "Q3 Spend"   },
    { label: "Direct mat." },
    { label: "Axis Mfg"   },
    { label: "PO-8821", final: true },
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

function PriceVarianceVisual() {
  const alerts = [
    {
      icon: AlertTriangle,
      title: "Axis Mfg · Unit price",
      delta: "+8.2%",
      tone: "bad" as const,
    },
    {
      icon: TrendingDown,
      title: "Helio Components",
      delta: "−4.1%",
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

function PurchasingExportVisual() {
  const formats = [
    { icon: FileText,        label: "PDF",   active: true  },
    { icon: FileSpreadsheet, label: "Excel"                },
    { icon: BookOpen,        label: "CSV"                  },
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
// [04] CONNECTIVITY — purchasing connected to inventory and finance
// ════════════════════════════════════════════════════════════════════════════

const SOURCES_TOP = [
  { icon: Tags,         label: "RFQs",      sub: "Bid · Score"        },
  { icon: ShoppingCart, label: "POs",        sub: "Approve · Issue"    },
  { icon: Warehouse,    label: "Receipts",   sub: "Match · Reconcile"  },
] as const;

const SOURCES_BOTTOM = [
  { icon: Package,  label: "Inventory",   sub: "Update · Replenish" },
  { icon: Receipt,  label: "AP invoices", sub: "3-way · Pay"        },
  { icon: Landmark, label: "Finance",     sub: "Post · Reconcile"   },
] as const;

const GL_ROWS = [
  { time: "14:32", source: "Purch · PO-8821",  debit: "Inventory",   credit: "AP · VAT",       amt: "$48,200", fresh: true },
  { time: "14:28", source: "RFQ · 7702",        debit: "Commit",      credit: "Budget reserve", amt: "$48,200"              },
  { time: "14:25", source: "GRN · 990-22",      debit: "Inventory",   credit: "GR/IR",          amt: "$36,800"              },
  { time: "14:21", source: "Purch · PO-8809",   debit: "Direct mat.", credit: "AP",             amt: "$12,400"              },
  { time: "14:18", source: "Purch · PO-8804",   debit: "Inventory",   credit: "AP · VAT",       amt: "$24,600"              },
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
          description="Every step in the procurement cycle RFQ, PO, receipt, invoice auto-posts to the General Ledger in real time."
          titleMaxWidth={780}
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

          {/* Live purchasing hub panel */}
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
