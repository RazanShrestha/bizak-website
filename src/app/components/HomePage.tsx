import "../../styles/style.css";
import * as React from "react";
import {
  Activity,
  Layers,
  TrendingUp,
  Globe2,
  PiggyBank,
  Sparkles,
} from "lucide-react";
import {
  Section,
  Container,
  SectionHead,
  Pill,
  PillGroup,
  Heading,
  BadgeGreen,
  Bento,
  BentoGrid,
  BigCard,
  StepCard,
  Marquee,
  Carousel,
  Accordion,
  FlagsRow,
  DataRow,
  EntityRow,
  JournalRow,
  ModuleListItem,
  StatTile,
  StatusChip,
  StripeBar,
  Flag,
  Tick,
  DotGrid,
} from "./bz";

// ════════════════════════════════════════════════════════════════════════════
// CONTENT DATA all page copy + structured data lives at the top of the file.
// Sections compose primitives + this data.
// ════════════════════════════════════════════════════════════════════════════

const LOGOS_BASE = "https://raw.githubusercontent.com/gilbarbara/logos/main/logos";
// Client logos served from public/logos/.
const LOGOS = [
  { name: "Abbott",                   file: "abbott.svg" },
  { name: "InDrive",                  file: "indrive.svg" },
  { name: "CloudFactory",             file: "cloudfactory.png" },
  { name: "L&T",                      file: "lnt.svg" },
  { name: "GE",                       file: "ge.svg" },
  { name: "GuardSix",                 file: "guardsix.svg" },
  { name: "Laminar Tiles",            file: "laminar.svg" },
  { name: "Glenmark Pharmaceuticals", file: "glenmark.png" },
  { name: "Abacus Insights",          file: "abacus.svg" },
  { name: "Siemens",                  file: "siemens.svg" },
  { name: "Himal Power Limited",      file: "himalpower.png" },
];
const BANKS = [
  "microsoft-azure", "stripe", "xero", "quickbooks",
  "shopify", "salesforce", "hubspot", "slack", "zapier",
];

const FLAGS = ["🇳🇵","🇮🇳","🇧🇩","🇱🇰","🇵🇰","🇧🇹","🇲🇻"];

const PLATFORM_BENTOS = [
  { tone: "dark",  icon: Layers,     title: <>One ledger,<br/>every module</>,         desc: "Every transaction posts the right journals automatically no re-keying." },
  { tone: "fire",  icon: Activity,   title: <>Real-time,<br/>not month-end</>,         desc: "Live cash, AR, AP and inventory. No batch posting." },
  { tone: "paper", icon: TrendingUp, title: <>Click any number,<br/>see its source</>, desc: "Drill from net income to the originating invoice. 100% audit coverage." },
  { tone: "paper", icon: Globe2,     title: <>Multi-entity,<br/>native</>,             desc: "Multi-currency, intercompany, branch-level P&L from day one." },
] as const;

const MULTI_ENTITY_ROWS = [
  { ccy: "NPR", flag: "🇳🇵", amount: "Rs 2.4M", pct: 44 },
  { ccy: "INR", flag: "🇮🇳", amount: "₹1.6M",   pct: 28 },
  { ccy: "BDT", flag: "🇧🇩", amount: "Tk 1.1M", pct: 18 },
  { ccy: "LKR", flag: "🇱🇰", amount: "Rs 0.6M", pct: 10 },
];

const TESTIMONIALS = [
  { quote: "Bizak gave us one place for finance, inventory and sales. We replaced a stack of disconnected tools in our first month.", name: "David Richardson", role: "CEO, Apex Manufacturing", initials: "DR" },
  { quote: "Month-end close went from dragging on for over a week to wrapping up in days. Our finance team finally has time to actually look at the numbers.", name: "Sara Okafor", role: "CFO, Helio Distribution", initials: "SO" },
  { quote: "Multi-entity, multi-currency just works. Consolidation that used to need a separate tool is now built in.", name: "Anestis Goudas", role: "Group Controller, Northwind Retail", initials: "AG" },
];

const TESTI_STATS = [
  { value: "One ledger",  desc: "Finance, inventory and sales on a single connected system." },
  { value: "Real-time",   desc: "Live books, with no close-the-books marathon." },
  { value: "Audit-ready", desc: "Every figure traces back to its source transaction." },
];

const FAQS = [
  { q: "How long does Bizak take to deploy?",                a: "Most teams go live in one business day. Pick the modules you need (finance, inventory, sales, manufacturing, projects), invite your team, and start running. No 9-month implementation." },
  { q: "Can we adopt module by module?",                     a: "Yes. Start with one (e.g. finance) and add inventory, sales or manufacturing later. Existing tools can stay connected via 200+ integrations during the transition." },
  { q: "Is Bizak built for multi-entity, multi-currency?",   a: "Yes, from day one. Multi-currency FX translation, intercompany elimination, branch-level P&L without a separate consolidation tool. Consolidation you can trust, every period." },
  { q: "Is Bizak secure and audit-ready?",                   a: "Yes. SOC-2 Type II, GDPR-ready, full audit trail on every change, role-based access, SSO. Every figure in a report resolves to its source transaction." },
];

// ════════════════════════════════════════════════════════════════════════════
// HERO split layout: copy left · platform live panel right
// ════════════════════════════════════════════════════════════════════════════

// ── Hero data ────────────────────────────────────────────────────────────────

const HERO_POSTS = [
  { source: "Sales · SO-1041",   entry: "AR → Revenue + VAT",  fresh: true  },
  { source: "Shipment · SH-882", entry: "COGS → Inventory",    fresh: false },
];

const HERO_OPS = [
  { label: "Open orders", value: "32"    },
  { label: "Active SKUs", value: "847"   },
  { label: "Avg. OEE",    value: "87.4%" },
  { label: "Entities",    value: "4"     },
];

function HeroSection() {
  return (
    <Section tone="b" pad="hero">
      <Container>
        <div className="flex flex-col items-center text-center">
          <BadgeGreen style={{ marginBottom: 28 }}>Now Live in South Asia 🎉</BadgeGreen>
          <Heading level={2} style={{ marginBottom: 36 }}>
            The operating system for modern business,{" "}
            <Heading.Muted>finance and ops in one place.</Heading.Muted>
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

        <div className="bz-hero-visual mx-auto grid w-full max-w-[1100px] grid-cols-1 gap-3 sm:grid-cols-5">
          <HeroAutoPostPanel />
          <HeroOverviewCard />
        </div>

        <LogoStrip />
      </Container>
    </Section>
  );
}

function HeroAutoPostPanel() {
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
        <div>
          <div className="mb-5 flex items-center gap-2 text-[10.5px] font-medium uppercase tracking-[0.12em] text-white/[0.55]">
            <span className="size-1.5 animate-pulse rounded-bz-pill bg-bz-fire" />
            Auto-posting engine
          </div>

          <div className="flex flex-col gap-2">
            {HERO_POSTS.map((e, i) => (
              <div
                key={i}
                className={`flex flex-col gap-0.5 rounded-bz-lg px-3.5 py-2.5 ${
                  e.fresh
                    ? "border border-white/[0.06] bg-white/[0.08] shadow-[0_8px_24px_-12px_rgba(0,0,0,0.4)]"
                    : "bg-white/[0.03]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-medium text-bz-text-on-dark">
                    {e.source}
                  </span>
                  {e.fresh && <StatusChip variant="live">Just now</StatusChip>}
                </div>
                <span className="text-[10.5px] text-white/[0.5]">{e.entry}</span>
              </div>
            ))}
          </div>
          <div className="pb-12"></div>
        </div>

        <div className="mt-6">
          <p className="mb-0.5 text-[10px] font-medium uppercase tracking-[0.1em] text-white/[0.45]">
            Entries auto-posted · today
          </p>
          <p className="bz-stat-num bz-stat-num-light" style={{ fontSize: 44 }}>247</p>
          <p className="mt-0.5 text-[11px] text-white/[0.5]">0 manual journal entries</p>
        </div>
      </div>
    </div>
  );
}

function HeroOverviewCard() {
  return (
    <div className="relative overflow-hidden rounded-bz-2xl bg-bz-paper sm:col-span-3 sm:min-h-[460px]">
      {/* Bizak app header */}
      <div className="flex items-center justify-between bg-bz-olive px-5 py-4">
        <span className="text-[15px] font-medium tracking-tight text-bz-text-on-dark">
          Bizak<sup className="ml-0.5 text-[8px] opacity-60">®</sup>
        </span>
        <div className="flex flex-col items-end gap-1.5">
          <span className="block h-[3px] w-9 rounded-bz-pill bg-white/30" />
          <span className="block h-[3px] w-7 rounded-bz-pill bg-white/20" />
        </div>
      </div>

      <div className="flex flex-col gap-4 p-5">
        <p className="text-[10.5px] font-medium uppercase tracking-[0.08em] text-bz-text-soft">
          Business overview · Q1 2024
        </p>

        {/* Revenue primary metric */}
        <div className="flex items-center justify-between rounded-bz-md border border-bz-line-soft p-3">
          <div className="flex items-center gap-2.5">
            <span className="flex size-7 items-center justify-center rounded-bz-sm bg-bz-paper-warm">
              <TrendingUp size={13} strokeWidth={1.8} className="text-bz-text" />
            </span>
            <span className="text-[12.5px] font-medium text-bz-text">Revenue</span>
          </div>
          <span className="text-[20px] font-medium tabular-nums text-bz-text">$4.82M</span>
        </div>

        {/* Operational metrics 2 × 2 */}
        <div className="grid grid-cols-2 gap-2.5">
          {HERO_OPS.map((o) => (
            <div key={o.label} className="rounded-bz-md border border-bz-line-soft p-3">
              <p className="text-[10px] uppercase tracking-[0.08em] text-bz-text-muted">
                {o.label}
              </p>
              <p className="mt-1.5 text-[13px] font-medium text-bz-text">{o.value}</p>
              <span className="mt-2 block h-[3px] w-10 rounded-bz-pill bg-bz-line-soft" />
            </div>
          ))}
        </div>

        {/* Net income emphasized total */}
        <div className="mt-1 flex items-center justify-between rounded-bz-lg bg-bz-paper-warm px-4 py-3.5">
          <span className="text-[13px] text-bz-text-muted">Net income</span>
          <span className="text-[22px] font-medium tabular-nums text-bz-text">$812K</span>
        </div>
      </div>
    </div>
  );
}

function LogoStrip() {
  return (
    <div className="mb-2 mt-14">
      <p className="mb-[22px] text-center text-[12.5px] text-bz-text-muted">
        Trusted by teams across South Asia
      </p>
      <Marquee speed="36s">
        {LOGOS.map(({ name, file }) => (
          <img
            key={file}
            src={`/logos/${file}`}
            alt={name}
            className="bz-marquee-logo"
          />
        ))}
      </Marquee>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// [01] HOW IT WORKS
// ════════════════════════════════════════════════════════════════════════════

function HowItWorksSection() {
  return (
    <Section tone="a">
      <Container>
        <SectionHead
          index="01"
          label="How it works"
          title={<>Replace spreadsheets and run smoothly, <Heading.Muted>across every part of your business.</Heading.Muted></>}
          titleMaxWidth={820}
        />

        <div className="flex flex-col gap-5">
          <StepCard
            number="01"
            tag="Set up"
            title="Pick your modules and go live"
            bullets={[
              "Finance, sales, inventory, manufacturing pick what you need.",
              "Pre-configured for your industry. Live in one business day.",
            ]}
            cta={{ variant: "dark", withArrow: true, href: "/documentation", children: "Learn more" }}
            visual={<StepVisualSetup />}
          />
          <StepCard
            number="02"
            tag="Connect"
            title="Every transaction, live on one ledger"
            bullets={[
              "Sales, shipments, payroll all auto-post the right journals.",
              "Real-time books. No close-the-books marathon.",
            ]}
            cta={{ variant: "dark", withArrow: true, href: "/FinancialManagement", children: "Learn more" }}
            visual={<StepVisualConnect />}
          />
          <StepCard
            number="03"
            tag="Scale"
            title="From one branch to global"
            bullets={[
              "Multi-entity, multi-currency, branch-level P&L from day one.",
              "Consolidation you can trust, with no separate close tool.",
            ]}
            cta={{ variant: "dark", withArrow: true, href: "/MulticompanyAndBranches", children: "Learn more" }}
            visual={<StepVisualScale />}
          />
        </div>

        <div className="mt-10">
          <FlagsRow
            prefix="Available across South Asia"
            flags={FLAGS}
            suffix="with localised tax and compliance"
          />
        </div>
      </Container>
    </Section>
  );
}

// Step visuals page-specific mocks. Each composes primitives.
function StepVisualSetup() {
  const rows = [
    { label: "Financial Management", on: true },
    { label: "Sales & CRM", on: true },
    { label: "Inventory & Warehouse", on: true },
    { label: "Manufacturing", on: false },
  ];
  return (
    <div className="w-full max-w-[380px] rounded-bz-xl border border-bz-line-soft bg-bz-paper p-4 shadow-[0_10px_28px_rgba(15,20,17,0.06)]">
      <div className="mb-3 text-[11px] text-bz-text-muted">Pick your modules</div>
      <div className="flex flex-col gap-2">
        {rows.map((row, i) => (
          <div
            key={i}
            className={`flex items-center justify-between rounded-bz-md px-3 py-2.5 ${row.on ? "bg-bz-paper-warm" : "border border-bz-line-soft bg-bz-paper"}`}
          >
            <span className="text-[13px] text-bz-text">{row.label}</span>
            <div className={`relative h-4 w-7 rounded-bz-pill ${row.on ? "bg-bz-olive" : "bg-bz-line-soft"}`}>
              <div
                className={`absolute top-0.5 h-3 w-3 rounded-bz-pill ${row.on ? "right-0.5 bg-bz-leaf" : "left-0.5 bg-bz-paper"}`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StepVisualConnect() {
  return (
    <div className="w-full max-w-[380px] rounded-bz-xl border border-bz-line-soft bg-bz-paper p-4 shadow-[0_10px_28px_rgba(15,20,17,0.06)]">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[11px] text-bz-text-muted">Auto-posted today</span>
        <span className="bz-stat-num" style={{ fontSize: 20, color: "#1F3422" }}>247</span>
      </div>
      <div className="flex flex-col gap-1.5">
        <JournalRow txn="Sales order SO-1041" debit="AR" credit="Revenue + VAT" />
        <JournalRow txn="Shipment SH-882" debit="COGS" credit="Inventory" />
        <JournalRow txn="Vendor bill VB-216" debit="Expenses" credit="AP" />
      </div>
    </div>
  );
}

function StepVisualScale() {
  const entities = [
    { entity: "Bizak NP", flag: "🇳🇵", amount: "Rs 1.2M" },
    { entity: "Bizak IN", flag: "🇮🇳", amount: "₹2.6M" },
    { entity: "Bizak BD", flag: "🇧🇩", amount: "Tk 1.8M" },
    { entity: "Bizak LK", flag: "🇱🇰", amount: "Rs 0.9M" },
  ];
  return (
    <div className="w-full max-w-[380px] rounded-bz-xl border border-bz-line-soft bg-bz-paper p-4 shadow-[0_10px_28px_rgba(15,20,17,0.06)]">
      <div className="mb-3 text-[11px] text-bz-text-muted">Consolidated P&amp;L · Q1</div>
      <div className="flex flex-col gap-2">
        {entities.map((e) => (
          <EntityRow key={e.entity} flag={e.flag} name={e.entity} amount={e.amount} />
        ))}
      </div>
      <div className="mt-2.5 flex items-center justify-between border-t border-bz-line-soft pt-2.5">
        <span className="text-[11px] text-bz-text-muted">Group total (NPR)</span>
        <span className="bz-stat-num" style={{ fontSize: 18 }}>Rs 6.5M</span>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// [02] PLATFORM
// ════════════════════════════════════════════════════════════════════════════

function PlatformSection() {
  return (
    <Section tone="b">
      <Container>
        <SectionHead
          index="02"
          label="Platform"
          title={<>A unified platform for finance, <Heading.Muted>inventory, sales and operations.</Heading.Muted></>}
          titleMaxWidth={680}
          actions={
            <PillGroup>
              <Pill variant="dark" withArrow href="https://system.bizakerp.com/account/self-register">Get Started</Pill>
              <Pill variant="light" href="/contact">Request Demo</Pill>
            </PillGroup>
          }
        />

        <PlatformDashboard />

        <BentoGrid cols={4} className="mt-6">
          {PLATFORM_BENTOS.map((b, i) => {
            const Icon = b.icon;
            const iconColor =
              b.tone === "dark"  ? "#DBE9B8"
              : b.tone === "fire" ? "#1F3422"
              :                     "#1F3422";
            return (
              <Bento key={i} tone={b.tone} hover dotGrid={b.tone === "dark"} minHeight={200}>
                <Bento.Header
                  title={b.title}
                  icon={<Icon size={26} strokeWidth={1.4} color={iconColor} />}
                />
                <div className="pb-16"></div>
                <Bento.Desc
                  style={b.tone === "fire" ? { color: "#1F3422", opacity: 0.78 } : undefined}
                >
                  {b.desc}
                </Bento.Desc>
              </Bento>
            );
          })}
        </BentoGrid>
      </Container>
    </Section>
  );
}

function PlatformDashboard() {
  const modules = [
    { label: "Dashboard", active: true },
    { label: "Finance", active: false },
    { label: "Inventory", active: false },
    { label: "Manufacturing", active: false },
    { label: "Sales & CRM", active: false },
  ];
  return (
    <div className="relative min-h-[320px] overflow-hidden rounded-bz-2xl bg-bz-olive p-7">
      <DotGrid tone="dark" />
      <div className="relative grid grid-cols-1 gap-[18px] md:grid-cols-[1fr_1.4fr]">
        {/* Sidebar */}
        <div className="rounded-bz-xl border border-white/[0.06] bg-white/[0.04] p-3.5">
          <div className="mb-3 text-[10.5px] font-medium uppercase tracking-[0.18em] text-white/[0.55]">
            Modules
          </div>
          {modules.map((m) => (
            <ModuleListItem key={m.label} active={m.active}>
              {m.label}
            </ModuleListItem>
          ))}
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-3">
          <div className="rounded-bz-xl bg-bz-paper p-4">
            <div className="mb-2.5 flex items-start justify-between">
              <div>
                <div className="text-[11px] text-bz-text-muted">Revenue · Q1</div>
                <div className="bz-stat-num" style={{ fontSize: 26 }}>$1.24M</div>
              </div>
              <StatusChip variant="live">+14.2%</StatusChip>
            </div>
            <svg viewBox="0 0 600 90" width="100%" height="90" preserveAspectRatio="none">
              <path d="M0 65 C 80 60, 140 22, 220 40 S 360 75, 440 45 600 22 600 22 V 90 H 0 Z" fill="rgba(122,130,109,0.18)" />
              <path d="M0 65 C 80 60, 140 22, 220 40 S 360 75, 440 45 600 22 600 22" stroke="#1A2D20" strokeWidth="2" fill="none" strokeLinecap="round" />
            </svg>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center justify-between rounded-bz-lg bg-white/[0.06] px-3 py-2.5">
              <span className="text-[11.5px] text-white/[0.72]">Open invoices</span>
              <span className="text-[16px] font-medium text-bz-text-on-dark">32</span>
            </div>
            <div className="flex items-center justify-between rounded-bz-lg bg-white/[0.06] px-3 py-2.5">
              <span className="text-[11.5px] text-white/[0.72]">Stock alerts</span>
              <span className="text-[16px] font-medium text-bz-text-on-dark">6</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// [03] EXCLUSIVE
// ════════════════════════════════════════════════════════════════════════════

function ExclusiveSection() {
  return (
    <Section tone="a">
      <Container>
        <SectionHead
          index="03"
          label="Exclusive to Bizak"
          title={<>More visibility, less manual work, <Heading.Muted>with features built for finance teams.</Heading.Muted></>}
          titleMaxWidth={720}
          actions={
            <PillGroup>
              <Pill variant="dark" withArrow href="https://system.bizakerp.com/account/self-register">Get Started</Pill>
              <Pill variant="light" href="/contact">Request Demo</Pill>
            </PillGroup>
          }
        />

        <BentoGrid cols={3}>
          {/* Auto-posted journals */}
          <Bento tone="dark" hover minHeight={280}>
            <h3 className="bz-bento-title">Auto-posted journals</h3>
            <Bento.Desc className="mb-[22px]">
              Every entry is auto-coded the moment it posts, so finance teams stop coding transactions.
            </Bento.Desc>
            <Bento.Footer tone="dark" className="flex flex-col justify-center gap-1.5">
              <DataRow tone="dark" label="Shipment → COGS / Inventory" value="auto" />
              <DataRow tone="dark" label="Invoice → AR / Revenue" value="auto" />
            </Bento.Footer>
          </Bento>

          {/* Full audit trail */}
          <Bento tone="paper" hover minHeight={280}>
            <h3 className="bz-bento-title">Full audit trail</h3>
            <Bento.Desc className="mb-[22px]">
              Every figure resolves to its source transaction with user and timestamp.
            </Bento.Desc>
            <Bento.Footer tone="light" className="flex flex-col justify-center gap-1.5">
              <AuditRow initial="S" name="Sara" what="Approved INV-2046" t="1m" />
              <AuditRow initial="J" name="James" what="Updated SK-402" t="3m" />
            </Bento.Footer>
          </Bento>

          {/* AI bank reconciliation */}
          <Bento tone="leaf" hover minHeight={280}>
            <h3 className="bz-bento-title">AI bank reconciliation</h3>
            <Bento.Desc className="mb-[22px]" style={{ color: "#1F3422", opacity: 0.78 }}>
              AI-driven matching that learns your transactions far fewer manual fixes.
            </Bento.Desc>
            <Bento.Footer className="bg-[rgba(31,52,34,0.08)] flex flex-col justify-center gap-2">
              <div className="flex items-center gap-2">
                <Sparkles size={12} color="#1F3422" />
                <span className="text-[11.5px] font-medium text-[#1F3422]">Bizak AI</span>
              </div>
              <div className="text-[12.5px] leading-[1.5] text-bz-text">
                Matched <strong>184 statement lines</strong> to ledger entries this morning.
              </div>
            </Bento.Footer>
          </Bento>
        </BentoGrid>

        {/* Big card Multi-entity consolidation */}
        <div className="mt-[18px]">
          <BigCard
            text={{
              title: "Multi-entity consolidation",
              body: "Roll up branches, currencies and subsidiaries into one set of reports no separate consolidation tool.",
              bullets: [
                "FX translation, applied automatically",
                "Intercompany elimination with audit trail",
                "Consolidation you can trust, every period",
              ],
              cta: {
                variant: "accent",
                withArrow: true,
                href: "/MulticompanyAndBranches",
                children: "Learn more",
              },
            }}
            visual={<MultiEntityVisual />}
          />
        </div>
      </Container>
    </Section>
  );
}

function AuditRow({ initial, what, t }: { initial: string; name: string; what: string; t: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="inline-flex h-[18px] w-[18px] items-center justify-center rounded-bz-pill bg-bz-leaf text-[9.5px] font-semibold text-[#1F3422]">
          {initial}
        </div>
        <span className="text-[11px] text-bz-text">{what}</span>
      </div>
      <span className="text-[10.5px] text-bz-text-muted">{t}</span>
    </div>
  );
}

function MultiEntityVisual() {
  return (
    <div className="w-full max-w-[360px] rounded-bz-xl bg-bz-paper p-5 text-bz-text">
      <div className="mb-2.5 flex items-center justify-between">
        <div className="text-[11.5px] text-bz-text-muted">Group total · Q1</div>
        <PiggyBank size={16} color="#1F3422" />
      </div>
      <div className="bz-stat-num" style={{ fontSize: 28 }}>Rs 9.4M</div>

      <div className="mt-4 flex flex-col gap-2.5">
        {MULTI_ENTITY_ROWS.map((c) => (
          <div key={c.ccy}>
            <div className="mb-1 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flag style={{ width: 20, height: 20, fontSize: 11 }}>{c.flag}</Flag>
                <span className="text-[11.5px] font-medium">{c.ccy}</span>
              </div>
              <span className="text-[11.5px] text-bz-text">{c.amount}</span>
            </div>
            <StripeBar pct={c.pct} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// TESTIMONIALS + STATS
// ════════════════════════════════════════════════════════════════════════════

function TestimonialsSection() {
  return (
    <Section tone="b">
      <Container>
        <div className="rounded-bz-3xl bg-bz-paper p-7 md:p-11">
          <div className="grid grid-cols-1 items-stretch gap-7 md:grid-cols-[1.5fr_1fr] md:gap-11">
            <Carousel
              items={TESTIMONIALS}
              autoAdvance={6000}
              render={(t) => (
                <div className="flex min-h-[240px] flex-col justify-between">
                  <blockquote
                    className="m-0 text-bz-text"
                    style={{
                      fontSize: "clamp(20px, 2.2vw, 26px)",
                      fontWeight: 500,
                      letterSpacing: "-0.015em",
                      lineHeight: 1.35,
                    }}
                  >
                    "{t.quote}"
                  </blockquote>
                  <div className="mt-7 flex items-center gap-3">
                    <div className="bz-avatar-lg">{t.initials}</div>
                    <div>
                      <div className="text-[14px] font-medium text-bz-text">{t.name}</div>
                      <div className="text-[12.5px] text-bz-text-muted">{t.role}</div>
                    </div>
                  </div>
                </div>
              )}
            />

            <div className="grid grid-rows-3 gap-2.5">
              {TESTI_STATS.map((s) => (
                <StatTile key={String(s.value)} value={s.value} desc={s.desc} />
              ))}
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// FAQ
// ════════════════════════════════════════════════════════════════════════════

function FAQSection() {
  return (
    <Section tone="a">
      <Container>
        <div className="grid grid-cols-1 items-start gap-10 md:grid-cols-[1fr_1.3fr]">
          {/* Dark intro panel */}
          <div className="relative flex min-h-[320px] flex-col justify-between overflow-hidden rounded-bz-2xl bg-bz-olive p-8 text-bz-text-on-dark">
            <DotGrid tone="dark" />
            <div className="relative">
              <SectionHead
                index="04"
                label="FAQ"
                tone="dark"
                title={<>Frequently asked <Heading.Muted>questions.</Heading.Muted></>}
                spacing="none"
              />
            </div>
            <PillGroup className="relative mt-8">
              <Pill variant="accent" href="https://system.bizakerp.com/account/self-register" withArrowUpRight>Get Started</Pill>
              <Pill variant="ghostDark" href="/contact">Talk to Sales</Pill>
            </PillGroup>
          </div>

          {/* Accordion */}
          <Accordion>
            {FAQS.map((item, i) => (
              <Accordion.Item key={i} question={item.q}>
                {item.a}
              </Accordion.Item>
            ))}
          </Accordion>
        </div>
      </Container>
    </Section>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PAGE
// ════════════════════════════════════════════════════════════════════════════

export function HomePage() {
  return (
    <main>
      <HeroSection />
      <HowItWorksSection />
      <PlatformSection />
      <ExclusiveSection />
      <TestimonialsSection />
      <FAQSection />
    </main>
  );
}
