import "../../styles/style.css";
import * as React from "react";
import {
  Activity,
  Receipt,
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
  Heading,
  BadgeGreen,
  HeroCanvas,
  HeroCard,
  Bento,
  BentoGrid,
  BigCard,
  StepCard,
  Marquee,
  Carousel,
  Accordion,
  FlagsRow,
  DataRow,
  MiniBars,
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
// CONTENT DATA — all page copy + structured data lives at the top of the file.
// Sections compose primitives + this data.
// ════════════════════════════════════════════════════════════════════════════

const LOGOS_BASE = "https://raw.githubusercontent.com/gilbarbara/logos/main/logos";
const LOGOS = [
  "microsoft", "shopify", "slack", "salesforce", "hubspot", "stripe",
  "adobe", "oracle", "atlassian", "notion", "figma",
];
const BANKS = [
  "microsoft-azure", "stripe", "xero", "quickbooks",
  "shopify", "salesforce", "hubspot", "slack", "zapier",
];

const FLAGS = ["🇺🇸","🇬🇧","🇩🇪","🇫🇷","🇪🇸","🇮🇹","🇳🇱","🇨🇦","🇯🇵","🇸🇬","🇦🇺","🇧🇷","🇮🇳"];

const PLATFORM_BENTOS = [
  { tone: "dark",  icon: Layers,     title: <>One ledger,<br/>every module</>,         desc: "Every transaction posts the right journals automatically — no re-keying." },
  { tone: "fire",  icon: Activity,   title: <>Real-time,<br/>not month-end</>,         desc: "Live cash, AR, AP and inventory. No batch posting." },
  { tone: "paper", icon: TrendingUp, title: <>Click any number,<br/>see its source</>, desc: "Drill from net income to the originating invoice. 100% audit coverage." },
  { tone: "paper", icon: Globe2,     title: <>Multi-entity,<br/>native</>,             desc: "Multi-currency, intercompany, branch-level P&L — from day one." },
] as const;

const MULTI_ENTITY_ROWS = [
  { ccy: "USD", flag: "🇺🇸", amount: "$2.14M", pct: 44 },
  { ccy: "EUR", flag: "🇪🇺", amount: "€1.28M", pct: 28 },
  { ccy: "GBP", flag: "🇬🇧", amount: "£820k",  pct: 18 },
  { ccy: "JPY", flag: "🇯🇵", amount: "¥58.6M", pct: 10 },
];

const TESTIMONIALS = [
  { quote: "Bizak gave us one place for finance, inventory and sales. We replaced six disconnected tools in our first month.", name: "David Richardson", role: "CEO, Apex Manufacturing", initials: "DR" },
  { quote: "Month-end close dropped from 9 days to 2. Our finance team finally has time to actually look at the numbers.", name: "Sara Okafor", role: "CFO, Helio Distribution", initials: "SO" },
  { quote: "Multi-entity, multi-currency just works. Consolidation that used to need a separate tool is now built in.", name: "Anestis Goudas", role: "Group Controller, Northwind Retail", initials: "AG" },
];

const TESTI_STATS = [
  { value: "50,000+", desc: "Companies powered by Bizak." },
  { value: "60%",     desc: "Faster month-end close." },
  { value: "99.8%",   desc: "Consolidation accuracy." },
];

const FAQS = [
  { q: "How long does Bizak take to deploy?",                a: "Most teams go live in one business day. Pick the modules you need (finance, inventory, sales, manufacturing, projects), invite your team, and start running. No 9-month implementation." },
  { q: "Can we adopt module by module?",                     a: "Yes. Start with one (e.g. finance) and add inventory, sales or manufacturing later. Existing tools can stay connected via 200+ integrations during the transition." },
  { q: "Is Bizak built for multi-entity, multi-currency?",   a: "Yes, from day one. Multi-currency FX translation, intercompany elimination, branch-level P&L — without a separate consolidation tool. 99.8% consolidation accuracy." },
  { q: "Is Bizak secure and audit-ready?",                   a: "Yes. SOC-2 Type II, GDPR-ready, full audit trail on every change, role-based access, SSO. Every figure in a report resolves to its source transaction." },
];

// ════════════════════════════════════════════════════════════════════════════
// HERO
// ════════════════════════════════════════════════════════════════════════════

function HeroSection() {
  return (
    <Section tone="b" pad="hero">
      <Container>
        <div className="flex flex-col items-center text-center">
          <div className="mb-7">
            <BadgeGreen>Now Live, Globally 🎉</BadgeGreen>
          </div>

          <Heading level={2} className="mb-9">
            The operating system for modern business,{" "}
            <Heading.Muted>handling finance, inventory and operations in one place.</Heading.Muted>
          </Heading>

          <div className="flex flex-wrap justify-center gap-[10px]">
            <Pill variant="dark" withTick href="https://system.bizakerp.com/account/self-register">
              Get Started
            </Pill>
            <Pill variant="light" iconLeft={<Sparkles size={13} />} href="/contact">
              Book a demo
            </Pill>
          </div>
        </div>

        <HeroCanvas>
          <HeroCardLedger />
          <HeroCardInvoice />
        </HeroCanvas>

        <LogoStrip />
      </Container>
    </Section>
  );
}

function HeroCardLedger() {
  return (
    <HeroCard
      icon={<Activity size={12} />}
      title="Live ledger"
      badge="Live"
      badgeVariant="live"
      eyebrow="Cash position"
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
  );
}

function HeroCardInvoice() {
  return (
    <HeroCard
      icon={<Receipt size={12} />}
      title="Invoice INV-2046"
      badge="Posted"
      badgeVariant="posted"
      eyebrow="Apex Manufacturing GmbH"
      value="$12,400.00"
    >
      <div className="flex flex-col gap-1.5 rounded-bz-lg bg-bz-paper-warm px-3 py-2.5">
        <DataRow label="AR" value="+$12,400.00" />
        <DataRow label="Revenue · VAT 19%" value="+$11,000 · +$1,400" />
      </div>
    </HeroCard>
  );
}

function LogoStrip() {
  return (
    <div className="mt-14 mb-2">
      <p className="mb-[22px] text-center text-[12.5px] text-bz-text-muted">
        Trusted by thousands of teams &amp; organisations
      </p>
      <Marquee speed="36s">
        {LOGOS.map((slug) => (
          <img
            key={slug}
            src={`${LOGOS_BASE}/${slug}.svg`}
            alt={slug}
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
              "Finance, sales, inventory, manufacturing — pick what you need.",
              "Pre-configured for your industry. Live in one business day.",
            ]}
            cta={{ variant: "dark", withTick: true, href: "/product", children: "Learn more" }}
            visual={<StepVisualSetup />}
          />
          <StepCard
            number="02"
            tag="Connect"
            title="Every transaction, live on one ledger"
            bullets={[
              "Sales, shipments, payroll — all auto-post the right journals.",
              "Real-time books. No close-the-books marathon.",
            ]}
            cta={{ variant: "dark", withTick: true, href: "/FinancialManagement", children: "Learn more" }}
            visual={<StepVisualConnect />}
          />
          <StepCard
            number="03"
            tag="Scale"
            title="From one branch to global"
            bullets={[
              "Multi-entity, multi-currency, branch-level P&L from day one.",
              "99.8% consolidation accuracy — no separate close tool.",
            ]}
            cta={{ variant: "dark", withTick: true, href: "/MulticompanyAndBranches", children: "Learn more" }}
            visual={<StepVisualScale />}
          />
        </div>

        <div className="mt-10">
          <FlagsRow
            prefix="Available in 120+ countries"
            flags={FLAGS}
            suffix="with localised tax and compliance"
          />
        </div>
      </Container>
    </Section>
  );
}

// Step visuals — page-specific mocks. Each composes primitives.
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
    { entity: "Bizak US", flag: "🇺🇸", amount: "$1.24M" },
    { entity: "Bizak EU", flag: "🇪🇺", amount: "€880k" },
    { entity: "Bizak UK", flag: "🇬🇧", amount: "£420k" },
    { entity: "Bizak JP", flag: "🇯🇵", amount: "¥28M" },
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
        <span className="text-[11px] text-bz-text-muted">Group total (USD)</span>
        <span className="bz-stat-num" style={{ fontSize: 18 }}>$3.18M</span>
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
            <>
              <Pill variant="dark" withTick href="https://system.bizakerp.com/account/self-register">Get Started</Pill>
              <Pill variant="light" iconLeft={<Sparkles size={13} />} href="/contact">Book a demo</Pill>
            </>
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
                <Bento.Desc
                  style={b.tone === "fire" ? { color: "#1F3422", opacity: 0.78 } : undefined}
                >
                  {b.desc}
                </Bento.Desc>
              </Bento>
            );
          })}
        </BentoGrid>

        <BanksRow />
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
          <div className="mb-3 text-[10.5px] font-medium uppercase tracking-[0.18em] text-white/[0.45]">
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
              <span className="text-[11.5px] text-white/[0.62]">Open invoices</span>
              <span className="text-[16px] font-medium text-bz-text-on-dark">32</span>
            </div>
            <div className="flex items-center justify-between rounded-bz-lg bg-white/[0.06] px-3 py-2.5">
              <span className="text-[11.5px] text-white/[0.62]">Stock alerts</span>
              <span className="text-[16px] font-medium text-bz-text-on-dark">6</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BanksRow() {
  return (
    <div className="mt-10">
      <p className="mb-[18px] text-center text-[12.5px] text-bz-text-muted">
        Works with the systems you already use.
      </p>
      <Marquee speed="44s">
        {BANKS.map((slug) => (
          <img
            key={slug}
            src={`${LOGOS_BASE}/${slug}.svg`}
            alt={slug}
            className="bz-marquee-logo"
          />
        ))}
      </Marquee>
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
            <>
              <Pill variant="dark" withTick href="https://system.bizakerp.com/account/self-register">Get Started</Pill>
              <Pill variant="light" iconLeft={<Sparkles size={13} />} href="/contact">Book a demo</Pill>
            </>
          }
        />

        <BentoGrid cols={3}>
          {/* Auto-posted journals */}
          <Bento tone="dark" hover minHeight={280}>
            <h3 className="bz-bento-title">Auto-posted journals</h3>
            <Bento.Desc className="mb-[22px]">
              247 entries auto-coded yesterday — finance teams stop coding transactions.
            </Bento.Desc>
            <Pill variant="leaf" href="/FinancialManagement" className="self-start">Learn more</Pill>
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
            <Pill variant="dark" href="/DocumentManagement" className="self-start">Learn more</Pill>
            <Bento.Footer tone="light" className="flex flex-col justify-center gap-1.5">
              <AuditRow initial="S" name="Sara" what="Approved INV-2046" t="1m" />
              <AuditRow initial="J" name="James" what="Updated SK-402" t="3m" />
            </Bento.Footer>
          </Bento>

          {/* AI bank reconciliation */}
          <Bento tone="leaf" hover minHeight={280}>
            <h3 className="bz-bento-title">AI bank reconciliation</h3>
            <Bento.Desc className="mb-[22px]" style={{ color: "#1F3422", opacity: 0.78 }}>
              AI-driven matching that learns your transactions — 40% fewer manual fixes.
            </Bento.Desc>
            <Pill variant="dark" href="/DashboardAndReporting" className="self-start">Learn more</Pill>
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

        {/* Big card — Multi-entity consolidation */}
        <div className="mt-[18px]">
          <BigCard
            text={{
              title: "Multi-entity consolidation",
              body: "Roll up branches, currencies and subsidiaries into one set of reports — no separate consolidation tool.",
              bullets: [
                "FX translation, applied automatically",
                "Intercompany elimination with audit trail",
                "99.8% consolidation accuracy",
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
      <div className="bz-stat-num" style={{ fontSize: 28 }}>$4.82M</div>

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
            <div className="relative mt-8 flex flex-wrap gap-2">
              <Pill variant="accent" href="/HelpCenter" withArrow>Visit help center</Pill>
              <Pill variant="ghostDark" href="/contact">Talk to support</Pill>
            </div>
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
