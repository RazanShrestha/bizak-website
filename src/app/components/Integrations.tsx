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
  StatusChip,
  DotGrid,
  Accordion,
} from "./bz";
import { Webhook } from "lucide-react";

// ─── DATA ─────────────────────────────────────────────────────────────────────

const HERO_CONNECTORS = [
  { name: "Stripe",     cat: "Payments", count: "1,842 tx",    live: true  },
  { name: "Shopify",    cat: "Commerce", count: "391 orders",  live: true  },
  { name: "Scada", cat: "Equipment",   count: "Connected", live: true  },
  { name: "Plaid",      cat: "Banking",  count: "2 banks",     live: true  },
  { name: "Salesforce", cat: "CRM",      count: "482 records", live: false },
  { name: "NetSuite",        cat: "ERP",      count: "Scheduled",   live: false },
];

const HERO_EVENTS = [
  { connector: "Stripe",     ref: "WH-4412",  event: "charge.succeeded posted",  value: "$2,400",  live: true  },
  { connector: "Shopify",    ref: "ORD-0391",  event: "order.paid → SO-1041",     value: "$3,200",  live: true  },
  { connector: "Scada",      ref: "JE-2841",   event: "Invoice auto-reconciled",  value: "$48,200", live: false },
  { connector: "Plaid",      ref: "TX-9820",   event: "Bank statement cleared",   value: "$0 gap",  live: false },
];

const HERO_HEALTH = [
  { name: "Stripe",     uptime: "99.99%", latency: "182ms" },
  { name: "Shopify",    uptime: "99.97%", latency: "241ms" },
  { name: "Scada",      uptime: "99.94%", latency: "318ms" },
];

const SYNC_EVENTS = [
  { connector: "Stripe",     ref: "WH-4412",  event: "Payment",   stat: "$2,400",   live: true  },
  { connector: "Shopify",    ref: "ORD-0391",  event: "Order", stat: "$3,200",   live: true  },
  { connector: "Scada",      ref: "PO-2841",   event: "Weight",    stat: "18 MT",  live: false },
  { connector: "Plaid",      ref: "TX-9820",   event: "Bank statement",     stat: "$0 gap",   live: false },
  { connector: "Salesforce", ref: "CRM-1182",  event: "Contact",     stat: "482 recs", live: false },
  { connector: "NetSuite",        ref: "MAT-8823",  event: "BOM",    stat: "64 SKUs",  live: false },
];

const CONNECTOR_CATS = [
  { name: "Payments",  tagline: "Cards & transfers",    examples: ["Stripe", "PayPal", "Square"],          active: true  },
  { name: "Commerce",  tagline: "Orders & products",    examples: ["Shopify", "WooCommerce", "Amazon"],    active: false },
  { name: "Banking",   tagline: "Statements & feeds",   examples: ["Plaid", "Bank feed", "Swift"],         active: false },
  { name: "CRM",       tagline: "Contacts & pipeline",  examples: ["Salesforce", "HubSpot", "Pipedrive"],  active: false },
];

const PAYLOAD_LEVELS = [
  { type: "Webhook Payload",  value: "stripe.charge.succeeded",  stat: "WH-4412", depth: 0 },
  { type: "Field Map",        value: "amount → tx_amount_usd",    stat: "$2,400",  depth: 1 },
  { type: "Auto-post",        value: "JE-2841 · Auto-posted",     stat: "",        depth: 2 },
  { type: "Source Document",  value: "Invoice INV-2046",           stat: "$2,400",  depth: 3 },
];

const CONNECTOR_ABBRS = [
  { abbr: "STR", sub: "Payments" }, { abbr: "SHO", sub: "Commerce" },
  { abbr: "QBO", sub: "Ledger"   }, { abbr: "SAL", sub: "CRM"      },
  { abbr: "BNK", sub: "Banking"  }, { abbr: "PAY", sub: "Payroll"  },
  { abbr: "SAP", sub: "ERP"      }, { abbr: "AWS", sub: "Storage"  },
];

const ACTIVE_CONNECTIONS = [
  { name: "Stripe · Payments",   freq: "Webhook · <1s",  fmt: "Live" },
  { name: "Shopify · Commerce",  freq: "Webhook · <1s",  fmt: "Live" },
  { name: "NetSuite · Ledger", freq: "Scheduled · 5m", fmt: "API"  },
];

const FAQS = [
  { q: "How long does a connector take to set up?",           a: "Most connectors go live in under 2 minutes. Authenticate via OAuth or API key, configure field mappings in the visual mapper, and the data starts flowing. No glue code, no maintenance sprints." },
  { q: "What happens when a vendor changes their API?",       a: "Bizak absorbs the change. Every connector is maintained centrally when a vendor releases a breaking API update, the connector is patched before it reaches your pipeline. Your dashboards and recipes keep working without a regression fix sprint." },
  { q: "Can I map custom fields between systems?",            a: "Yes. The visual field mapper lets you drag source schema fields onto Bizak entities, add transforms, lookups, and conditional routes without writing a single line of code." },
  { q: "What if a sync fails or a webhook is lost?",          a: "Every payload gets automatic retry with exponential backoff (3 attempts, 5-minute backoff cap). Unrecoverable payloads land in a queryable dead-letter queue replay any of them in one click with full transform context preserved. No silent drift." },
];

// ─── HERO MOCK ─────────────────────────────────────────────────────────────────

// Top: full-width dark connector grid showing live hub status
function HeroConnectorBoard() {
  return (
    <div className="relative overflow-hidden rounded-bz-2xl bg-bz-olive px-5 py-5">
      <DotGrid tone="dark" />
      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-bz-fire shrink-0" />
            <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/60">
              Integration Hub · 6 active
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-1">
            {["Payments", "Commerce", "Banking", "CRM"].map((tab, i) => (
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

        {/* 2×3 connector tiles */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
          {HERO_CONNECTORS.map((c) => (
            <div
              key={c.name}
              className="rounded-bz-xl bg-white/[0.06] border border-white/[0.08] px-3 md:px-5 py-3 md:py-4"
            >
              <p className="text-[8.5px] font-semibold uppercase tracking-[0.10em] text-white/40 mb-1.5">
                {c.cat}
              </p>
              <p className="text-[15px] md:text-[20px] font-bold text-bz-text-on-dark leading-none mb-2">
                {c.name}
              </p>
              <span className="text-[8px] font-bold text-bz-fire bg-bz-fire/[0.12] px-1.5 py-0.5 rounded-bz-pill">
                {c.count}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Bottom-left: live event feed with aggregate stats footer
function HeroEventFeed() {
  return (
    <div className="rounded-bz-2xl border border-bz-line bg-bz-surface overflow-hidden flex flex-col h-full">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-bz-line-soft shrink-0">
        <span className="text-[11px] font-semibold text-bz-text">Live events · last 60s</span>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-bz-fire" />
          <span className="text-[9.5px] font-medium text-bz-text-muted">2,180 today</span>
        </div>
      </div>

      <div className="flex flex-col divide-y divide-bz-line-soft flex-1">
        {HERO_EVENTS.map((e) => (
          <div
            key={e.ref}
            className={`flex items-center gap-3 px-4 py-3 ${e.live ? "bg-bz-fire/[0.03]" : ""}`}
          >
            <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${e.live ? "bg-bz-fire" : "bg-bz-line"}`} />
            <div className="flex-1 min-w-0">
              <p className={`text-[12px] font-medium truncate ${e.live ? "text-bz-text" : "text-bz-text-muted"}`}>
                {e.event}
              </p>
              <p className="text-[10px] text-bz-text-soft mt-0.5">{e.connector} · {e.ref}</p>
            </div>
            <span className={`text-[11.5px] font-bold tabular-nums shrink-0 ${
              e.live ? "text-bz-text" : "text-bz-text-soft"
            }`}>
              {e.value}
            </span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 border-t border-bz-line-soft shrink-0">
        {[["200+", "Connectors"], ["<2 min", "Avg Setup"], ["99.99%", "Uptime"]].map(([v, l], i) => (
          <div key={l} className={`px-4 py-3 ${i < 2 ? "border-r border-bz-line-soft" : ""}`}>
            <p className="text-[8.5px] font-semibold uppercase tracking-[0.08em] text-bz-text-muted mb-1">{l}</p>
            <p className="text-[13px] font-bold text-bz-text">{v}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// Bottom-right: per-connector health status panel
function HeroHealthSidebar() {
  return (
    <div className="rounded-bz-2xl border border-bz-line bg-bz-paper overflow-hidden flex flex-col h-full">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-bz-line-soft shrink-0">
        <span className="text-[11px] font-semibold text-bz-text">Connection health</span>
        <span className="text-[9px] font-semibold text-bz-text-muted bg-bz-paper-warm px-2 py-0.5 rounded-bz-pill">
          6 active
        </span>
      </div>

      <div className="flex flex-col divide-y divide-bz-line-soft flex-1">
        {HERO_HEALTH.map((c) => (
          <div key={c.name} className="flex items-center justify-between gap-3 px-5 py-3.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-1.5 h-1.5 rounded-full bg-bz-fire shrink-0" />
              <div className="min-w-0">
                <p className="text-[12px] font-medium text-bz-text truncate">{c.name}</p>
                <p className="text-[10px] text-bz-text-muted mt-0.5">{c.latency}</p>
              </div>
            </div>
            <span className="text-[9px] font-bold text-bz-leaf-deep bg-bz-leaf-deep/[0.12] px-2 py-0.5 rounded-bz-pill shrink-0">
              {c.uptime}
            </span>
          </div>
        ))}
      </div>

      <div className="px-5 py-3.5 border-t border-bz-line-soft bg-bz-paper-warm/40 shrink-0">
        <p className="text-[10.5px] text-bz-text-muted leading-snug">
          <span className="font-semibold text-bz-text">All systems operational</span>
          {" "}· p95 latency 412ms ↓18%
        </p>
      </div>
    </div>
  );
}

// ─── PAYLOAD DRILL VISUAL ──────────────────────────────────────────────────────

function PayloadDrillVisual() {
  return (
    <div className="flex flex-col gap-2 w-full">
      {PAYLOAD_LEVELS.map((l, i) => (
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
            <p className={`text-[12.5px] font-semibold leading-snug ${
              i === 0 ? "text-bz-text" : "text-bz-text-muted"
            }`}>
              {l.value}
            </p>
            {l.stat && (
              <p className={`text-[11.5px] font-medium tabular-nums shrink-0 ${
                i === 0 ? "text-bz-text" : "text-bz-text-soft"
              }`}>
                {l.stat}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── CONNECTOR CATALOG VISUAL ─────────────────────────────────────────────────

function ConnectorCatalogVisual() {
  return (
    <div className="w-full flex flex-col gap-5">
      <div>
        <p className="text-[9px] font-bold uppercase tracking-[0.10em] text-white/40 mb-3">
          Connector catalog
        </p>
        <div className="grid grid-cols-4 gap-2">
          {CONNECTOR_ABBRS.map(({ abbr, sub }) => (
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
          Active connections
        </p>
        <div className="flex flex-col gap-1.5">
          {ACTIVE_CONNECTIONS.map((c) => (
            <div
              key={c.name}
              className="flex items-center justify-between gap-3 rounded-bz-md bg-white/[0.05] px-3 py-2.5"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-1 h-1 rounded-full bg-bz-fire shrink-0" />
                <span className="text-[11px] text-white/80 truncate">{c.name}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[9px] text-white/40 hidden sm:inline">{c.freq}</span>
                <span className="text-[9px] font-bold text-bz-fire bg-bz-fire/[0.12] px-1.5 py-0.5 rounded">
                  {c.fmt}
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
          <BadgeGreen style={{ marginBottom: 28 }}>200+ Connectors Live</BadgeGreen>
          <Heading level={2} style={{ marginBottom: 36 }}>
            Every system in your stack,{" "}{<br className="hidden md:block"/>}
            <Heading.Muted>speaking the same language.</Heading.Muted>
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

        {/* Mosaic: full-width connector hub board + event feed + health sidebar */}
        <div className="bz-hero-visual mx-auto w-full max-w-[1140px] flex flex-col gap-3">
          <HeroConnectorBoard />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <HeroEventFeed />
            </div>
            <div className="hidden md:block md:col-span-1">
              <HeroHealthSidebar />
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}

// Live sync stream every connector event posts to Bizak in real-time
function LiveSyncSection() {
  return (
    <Section tone="a">
      <Container>
        <SectionHead
          index="01"
          label="Live sync"
          title={
            <>
              One hub.{" "}
              <Heading.Muted>Every connector event, live.</Heading.Muted>
            </>
          }
          description="Every sync across Payments, Commerce, Banking, CRM, ERP and Payroll posts to Bizak."
        />

        <div className="rounded-bz-xl overflow-hidden border border-bz-line-soft">
          {/* Stream header */}
          <div className="flex items-center justify-between px-5 py-3 bg-bz-paper border-b border-bz-line-soft">
            <div className="flex items-center gap-2.5">
              <StatusChip variant="live">Live</StatusChip>
              <span className="text-[10px] font-medium text-bz-text-muted">
                6 connectors streaming
              </span>
            </div>
            <span className="text-[10px] text-bz-text-muted hidden sm:inline">
              2,180 events posted today
            </span>
          </div>

          {/* Stream rows */}
          <div className="flex flex-col divide-y divide-bz-line-soft">
            {SYNC_EVENTS.map((entry) => (
              <div
                key={entry.ref}
                className={`flex items-center gap-4 px-5 py-4 ${
                  entry.live ? "bg-bz-fire/[0.03]" : ""
                }`}
              >
                {/* Connector tag */}
                <span
                  className={`text-[10.5px] font-semibold shrink-0 w-28 hidden sm:block uppercase tracking-[0.07em] ${
                    entry.live ? "text-bz-text" : "text-bz-text-muted"
                  }`}
                >
                  {entry.connector}
                </span>

                {/* Ref */}
                <span className="text-[11px] text-bz-text-soft w-24 shrink-0 hidden md:block tabular-nums">
                  {entry.ref}
                </span>

                {/* Event description */}
                <p
                  className={`flex-1 text-[13px] min-w-0 truncate ${
                    entry.live ? "font-medium text-bz-text" : "text-bz-text-muted"
                  }`}
                >
                  <span className="sm:hidden font-semibold text-bz-text">
                    {entry.connector} ·{" "}
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

// Connector directory flat 4-col dark panel for each category
function ConnectorDirectorySection() {
  return (
    <Section tone="dark">
      <Container>
        <SectionHead
          tone="dark"
          index="02"
          label="Connector directory"
          title={
            <>
              Every category.{" "}
              <Heading.Muted>Pre-built and maintained.</Heading.Muted>
            </>
          }
          description="200+ connectors across 8 categories. Each one versioned, certified."
        />

        {/* Category panel: gap-px grid creates thin dividers without per-item border logic */}
        <div className="rounded-bz-2xl overflow-hidden bg-bz-olive-soft">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-white/[0.08]">
            {CONNECTOR_CATS.map((cat) => (
              <div
                key={cat.name}
                className={`flex flex-col gap-5 p-7 lg:p-8 ${
                  cat.active ? "bg-bz-olive-dark" : "bg-bz-olive-soft"
                }`}
              >
                <div>
                  <p
                    className={`text-[22px] font-bold leading-none mb-1.5 ${
                      cat.active ? "text-bz-fire" : "text-bz-text-on-dark"
                    }`}
                  >
                    {cat.name}
                  </p>
                  <p className="text-[11px] text-white/50">{cat.tagline}</p>
                </div>

                <div className="flex flex-col gap-2.5">
                  {cat.examples.map((ex) => (
                    <div key={ex} className="flex items-center gap-2">
                      <div
                        className={`w-1 h-1 rounded-full shrink-0 ${
                          cat.active ? "bg-bz-fire" : "bg-white/30"
                        }`}
                      />
                      <span
                        className={`text-[12.5px] ${
                          cat.active ? "text-white/90" : "text-white/55"
                        }`}
                      >
                        {ex}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-auto">
                  <span
                    className={`text-[9px] font-bold uppercase tracking-[0.10em] px-2.5 py-1 rounded-bz-pill ${
                      cat.active
                        ? "bg-bz-fire/[0.15] text-bz-fire"
                        : "bg-white/[0.06] text-white/40"
                    }`}
                  >
                    {cat.active ? "Active" : "Available"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Note box */}
        <div className="mt-4 rounded-bz-xl border border-white/[0.08] bg-white/[0.03] px-5 sm:px-6 py-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5">
            <div className="hidden sm:flex w-8 h-8 rounded-bz-md bg-white/[0.06] items-center justify-center shrink-0">
              <Webhook size={14} className="text-white/70" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-bz-text-on-dark mb-1">
                Custom webhooks and open API for everything else
              </p>
              <p className="text-[12px] text-white/55 leading-relaxed">
                POST to Bizak's webhook endpoint directly, or build against the full REST API for any system not in the catalog.
              </p>
            </div>
            <div className="flex items-baseline gap-1.5 sm:shrink-0">
              <span className="text-[32px] font-bold text-bz-text-on-dark leading-none">8</span>
              <span className="text-[11px] text-white/50">categories</span>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}

// Payload lineage StepCard showing webhook → field map → ledger trace
function PayloadToLedgerSection() {
  return (
    <Section tone="b">
      <Container>
        <SectionHead
          index="03"
          label="Payload lineage"
          title={
            <>
              Click any event.{" "}
              <Heading.Muted>Trace every post.</Heading.Muted>
            </>
          }
          description="Every sync event carries a full audit trail."
          titleMaxWidth={720}
          spacing="tight"
        />
        <StepCard
          number="03"
          tag="Payload → map → ledger"
          title="From raw webhook to posted journal entry in one click."
          bullets={[
            "Click any sync event to open the field mapping that processed it.",
          ]}
          visual={<PayloadDrillVisual />}
        />
      </Container>
    </Section>
  );
}

// Connector marketplace BigCard with catalog + active connections visual
function ConnectorMarketplaceSection() {
  return (
    <Section tone="a">
      <Container>
        <SectionHead
          index="04"
          label="Connector marketplace"
          title={
            <>
              200+ <Heading.Muted>connectors.</Heading.Muted>{" "}
            </>
          }
          description="Pre-built connectors for every major system. Authenticate once the data flows."
        />
        <BigCard
          text={{
            title: "Ready from day one.",
            bullets: [
              "8 categories: payments, commerce, banking, etc",
              "Average setup time under 2 minutes",
            ],
            cta: {
              variant: "accent",
              withArrow: true,
              href: "/contact",
              children: "Request Demo",
            },
          }}
          visual={<ConnectorCatalogVisual />}
        />
      </Container>
    </Section>
  );
}

// FAQ dark intro panel + accordion, same layout as HomePage FAQSection
function FAQSection() {
  return (
    <Section tone="b">
      <Container>
        <div className="grid grid-cols-1 items-start gap-10 md:grid-cols-[1fr_1.3fr]">
          {/* Dark intro panel */}
          <div className="relative flex min-h-[320px] flex-col justify-between overflow-hidden rounded-bz-2xl bg-bz-olive p-8 text-bz-text-on-dark">
            <DotGrid tone="dark" />
            <div className="relative">
              <SectionHead
                index="05"
                label="FAQ"
                tone="dark"
                title={<>Frequently asked <Heading.Muted>questions.</Heading.Muted></>}
                spacing="none"
              />
            </div>
            <PillGroup className="relative mt-8">
              <Pill variant="accent" href="https://system.bizakerp.com/account/self-register" withArrowUpRight>Get Started</Pill>
              <Pill variant="ghostDark" href="/contact" withArrow>Talk to Sales</Pill>
            </PillGroup>
          </div>

          {/* Accordion */}
          <Accordion defaultOpen={null}>
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

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export function Integrations() {
  return (
    <>
      <HeroSection />
      <LiveSyncSection />
      <ConnectorDirectorySection />
      <PayloadToLedgerSection />
      <ConnectorMarketplaceSection />
      <FAQSection />
    </>
  );
}
