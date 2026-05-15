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
import { Settings } from "lucide-react";

// ─── DATA ─────────────────────────────────────────────────────────────────────

const HERO_ENTITIES = [
  { flag: "🇳🇵", curr: "NPR", rev: "Rs 18.4M",  trend: "+8.2%"  },
  { flag: "🇮🇳", curr: "INR", rev: "₹9.6M",     trend: "+4.1%"  },
  { flag: "🇧🇩", curr: "BDT", rev: "৳7.8M",     trend: "+6.3%"  },
  { flag: "🇱🇰", curr: "LKR", rev: "Rs 11.2M",  trend: "+11.8%" },
  { flag: "🇵🇰", curr: "PKR", rev: "₨6.8M",     trend: "+3.2%"  },
];

const HERO_CLOSE_STEPS = [
  { step: "FX Translation",    note: "5 currencies → NPR" },
  { step: "IC Eliminations",   note: "Rs 4.1M eliminated" },
  { step: "Minority Interest", note: "12.5% BD, 20% LK"   },
  { step: "Group P&L",         note: "Rs 48.2M QTD"       },
];

const TREE_NODES = [
  { label: "Bizak Holdings",     scope: "Group",     indent: 0 },
  { label: "Nepal",              scope: "Region",    indent: 1 },
  { label: "Bizak Nepal Pvt.",   scope: "Entity",    indent: 2 },
  { label: "↳ Pokhara Branch",   scope: "Branch",    indent: 3 },
  { label: "India",              scope: "Region",    indent: 1 },
  { label: "Bizak India Pvt.",   scope: "Entity",    indent: 2 },
  { label: "↳ Mumbai WH",        scope: "Warehouse", indent: 3 },
];

const ENTITY_STREAM = [
  { entity: "Bizak Nepal", ref: "IC-2412", event: "IC invoice auto-posted both sides",  stat: "Rs 24,800",  live: true  },
  { entity: "Bizak India", ref: "FX-0841", event: "FX translation updated · INR/NPR",   stat: "₹22,840",    live: true  },
  { entity: "Bizak Lanka", ref: "EC-0199", event: "Entity close triggered · Q3",        stat: "Rs 9.6M",    live: false },
  { entity: "Bizak BD",    ref: "EL-0042", event: "Elimination tag auto-set · IC",      stat: "৳11.2M",     live: false },
  { entity: "Bizak PK",    ref: "TX-0392", event: "VAT 13% posted · period",            stat: "₨6.8M",      live: false },
  { entity: "Bizak Bhutan",ref: "FX-0842", event: "BTN/NPR daily rate applied",         stat: "Nu 2.8M",    live: false },
];

const ENTITY_PROFILES = [
  {
    flag: "🇳🇵",
    name: "Nepal",
    tagline: "Bizak Nepal Pvt. · NPR",
    config: ["Multi-location P&L", "Nepal VAT 13%", "Local Chart of Accounts"],
    active: true,
  },
  {
    flag: "🇮🇳",
    name: "India",
    tagline: "Bizak India Pvt. · INR",
    config: ["GST · IGST/CGST/SGST", "E-invoicing", "India Standard CoA"],
    active: false,
  },
  {
    flag: "🇱🇰",
    name: "Sri Lanka",
    tagline: "Bizak Lanka Pvt. · LKR",
    config: ["VAT 18%", "Multi-branch", "Sri Lanka CoA"],
    active: false,
  },
  {
    flag: "🇧🇩",
    name: "Bangladesh",
    tagline: "Bizak BD Ltd. · BDT",
    config: ["VAT 15%", "Local tax rules", "BDT/NPR FX"],
    active: false,
  },
];

const FAQS = [
  { q: "How long does a group close take?",              a: "Under 90 seconds. FX translation, intercompany eliminations, minority interest and the group P&L all run on demand, so consolidation is a button rather than a month-end project." },
  { q: "How are intercompany transactions handled?",     a: "Automatically. When one entity sells to another, a single invoice posts the AR and AP on both sides, in both currencies, at the transaction-date FX rate, with elimination tags pre-applied for close." },
  { q: "Can each entity keep its own books?",            a: "Yes. Every subsidiary, branch or cost centre gets its own chart of accounts, tax engine, fiscal calendar and reporting currency, while still rolling up to one group ledger." },
  { q: "Does Bizak handle local tax rules?",             a: "Tax engines ship pre-configured for South Asian regimes, covering VAT, GST, withholding tax and e-invoicing, assigned per entity. A new subsidiary is online and compliant in one afternoon." },
];

// ─── HERO MOCK ─────────────────────────────────────────────────────────────────

// Top: full-width dark entity overview bar
function HeroGroupBoard() {
  return (
    <div className="relative overflow-hidden rounded-bz-2xl bg-bz-olive px-5 py-5">
      <DotGrid tone="dark" />
      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-bz-fire shrink-0" />
            <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/60">
              Live · Group Console
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-[10px] text-white/40 font-medium">Group Revenue</span>
            <span className="text-[13px] font-bold text-bz-text-on-dark">Rs 48.2M</span>
            <span className="text-[9px] font-bold text-bz-fire bg-bz-fire/[0.12] px-1.5 py-0.5 rounded-bz-pill">
              +12.4%
            </span>
          </div>
        </div>

        {/* Entity tiles: 3 on mobile, 6 on md (5 entities + IC elimination) */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2.5">
          {HERO_ENTITIES.map((e, idx) => (
            <div
              key={e.curr}
              className={`rounded-bz-xl bg-white/[0.06] border border-white/[0.08] px-3 md:px-4 py-3 ${
                idx >= 3 ? "hidden md:block" : ""
              }`}
            >
              <div className="flex items-center gap-1.5 mb-2">
                <span className="text-[14px] leading-none">{e.flag}</span>
                <span className="text-[8.5px] font-bold uppercase tracking-[0.08em] text-white/40">
                  {e.curr}
                </span>
              </div>
              <p className="text-[16px] md:text-[20px] font-bold text-bz-text-on-dark leading-none mb-2">
                {e.rev}
              </p>
              <span className="text-[8px] font-bold text-bz-fire bg-bz-fire/[0.12] px-1.5 py-0.5 rounded-bz-pill">
                {e.trend}
              </span>
            </div>
          ))}
          {/* IC Eliminations tile desktop only */}
          <div className="hidden md:block rounded-bz-xl bg-bz-fire/[0.08] border border-bz-fire/[0.20] px-3 md:px-4 py-3">
            <div className="text-[8.5px] font-bold uppercase tracking-[0.08em] text-bz-fire/70 mb-2">
              IC Elim.
            </div>
            <p className="text-[16px] md:text-[20px] font-bold text-bz-fire leading-none mb-2">
              Rs 4.1M
            </p>
            <span className="text-[8px] font-bold text-bz-fire bg-bz-fire/[0.12] px-1.5 py-0.5 rounded-bz-pill">
              Auto
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Bottom-left: live IC auto-posting panel (light surface)
function HeroICAutoPost() {
  return (
    <div className="rounded-bz-2xl border border-bz-line bg-bz-surface overflow-hidden flex flex-col h-full">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-bz-line-soft shrink-0">
        <span className="text-[11px] font-semibold text-bz-text">Intercompany · Auto-posting</span>
        <StatusChip variant="live">Live</StatusChip>
      </div>

      <div className="flex flex-col gap-2.5 px-5 py-4 flex-1">
        {/* Seller side */}
        <div className="rounded-bz-md bg-bz-paper-warm border border-bz-line-soft p-3">
          <p className="text-[9px] font-bold tracking-[0.10em] uppercase text-bz-text-muted mb-2"></p>
          <div className="flex justify-between text-[11.5px] mb-1.5">
            <span className="text-bz-text-muted">AR Intercompany</span>
            <span className="font-bold text-bz-text">DR Rs 24,800</span>
          </div>
          <div className="flex justify-between text-[11.5px]">
            <span className="text-bz-text-muted">Revenue IC Sales</span>
            <span className="text-bz-text-soft">CR Rs 24,800</span>
          </div>
        </div>

        {/* IC reference divider */}
        <div className="flex items-center gap-2 py-0.5">
          <div className="h-px flex-1 bg-bz-line-soft" />
          <span className="text-[9px] font-bold text-bz-text-muted uppercase tracking-[0.08em]">
            IC-2412 · FX 0.921
          </span>
          <div className="h-px flex-1 bg-bz-line-soft" />
        </div>

        {/* Buyer side */}
        <div className="rounded-bz-md bg-bz-paper-warm border border-bz-line-soft p-3">
          <p className="text-[9px] font-bold tracking-[0.10em] uppercase text-bz-text-muted mb-2"></p>
          <div className="flex justify-between text-[11.5px] mb-1.5">
            <span className="text-bz-text-muted">Expense IC Purchases</span>
            <span className="text-bz-text-soft">DR ₹22,840</span>
          </div>
          <div className="flex justify-between text-[11.5px]">
            <span className="text-bz-text-muted">AP Intercompany</span>
            <span className="font-bold text-bz-text">CR ₹22,840</span>
          </div>
        </div>
      </div>

      <div className="px-5 py-3.5 border-t border-bz-line-soft bg-bz-paper-warm/40 shrink-0">
        <p className="text-[10.5px] text-bz-text-muted leading-snug">
          <span className="font-semibold text-bz-text">Zero manual entries</span>
          {" "}· Elimination tagged automatically
        </p>
      </div>
    </div>
  );
}

// Bottom-right: group close steps panel (paper surface)
function HeroGroupClosePanel() {
  return (
    <div className="rounded-bz-2xl border border-bz-line bg-bz-paper overflow-hidden flex flex-col h-full">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-bz-line-soft shrink-0">
        <span className="text-[11px] font-semibold text-bz-text">Group Close</span>
        <span className="text-[9px] font-semibold text-bz-text-muted bg-bz-paper-warm px-2 py-0.5 rounded-bz-pill">
          87s total
        </span>
      </div>

      <div className="flex flex-col divide-y divide-bz-line-soft flex-1">
        {HERO_CLOSE_STEPS.map((s) => (
          <div key={s.step} className="flex items-center justify-between gap-3 px-5 py-3.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-1.5 h-1.5 rounded-full bg-bz-fire shrink-0" />
              <div className="min-w-0">
                <p className="text-[12px] font-medium text-bz-text truncate">{s.step}</p>
                <p className="text-[10px] text-bz-text-muted mt-0.5">{s.note}</p>
              </div>
            </div>
            <span className="text-[9px] font-bold text-bz-leaf-deep bg-bz-leaf-deep/[0.12] px-2 py-0.5 rounded-bz-pill shrink-0">
              Done
            </span>
          </div>
        ))}
      </div>

      <div className="px-5 py-3.5 border-t border-bz-line-soft bg-bz-paper-warm/40 shrink-0">
        <p className="text-[10.5px] text-bz-text-muted leading-snug">
          <span className="font-semibold text-bz-text">Last group close</span>
          {" "}· Today, 08:41 AM
        </p>
      </div>
    </div>
  );
}

// ─── STEP-CARD VISUAL ─────────────────────────────────────────────────────────

function EntityTreeVisual() {
  return (
    <div className="w-full rounded-bz-lg border border-bz-line bg-bz-surface overflow-hidden text-[12px]">
      <div className="flex justify-between px-3 py-2 bg-bz-paper-warm border-b border-bz-line">
        <span className="text-[9px] font-bold tracking-[0.12em] uppercase text-bz-text-muted">Node</span>
        <span className="text-[9px] font-bold tracking-[0.12em] uppercase text-bz-text-muted">Scope</span>
      </div>
      {TREE_NODES.map((n) => (
        <div
          key={n.label}
          className="flex justify-between items-center py-2 pr-3 border-t border-bz-line-soft"
          style={{ paddingLeft: `${12 + n.indent * 10}px` }}
        >
          <span className="text-bz-text">{n.label}</span>
          <span className="text-bz-text-muted font-semibold text-[11px]">{n.scope}</span>
        </div>
      ))}
    </div>
  );
}

// ─── BIGCARD VISUAL ───────────────────────────────────────────────────────────

function AutoICVisual() {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="rounded-bz-md bg-white/[0.08] border border-white/[0.12] p-3">
        <div className="text-[9px] font-bold tracking-[0.1em] uppercase text-white/50 mb-2">
          Seller · Bizak Nepal Pvt.
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-[11.5px]">
            <span className="text-white/55">AR Intercompany</span>
            <span className="font-bold text-bz-fire">DR Rs 24,800</span>
          </div>
          <div className="flex justify-between text-[11.5px]">
            <span className="text-white/55">Revenue IC Sales</span>
            <span className="text-white/75">CR Rs 24,800</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 py-0.5">
        <div className="h-px flex-1 bg-bz-fire/25" />
        <span className="text-[9px] font-bold text-bz-fire/60 uppercase tracking-[0.1em]">
          IC Ref: IC-2412 · FX 0.921
        </span>
        <div className="h-px flex-1 bg-bz-fire/25" />
      </div>

      <div className="rounded-bz-md bg-white/[0.08] border border-white/[0.12] p-3">
        <div className="text-[9px] font-bold tracking-[0.1em] uppercase text-white/50 mb-2">
          Buyer · Bizak India Pvt.
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-[11.5px]">
            <span className="text-white/55">Expense IC Purchases</span>
            <span className="text-white/75">DR ₹22,840</span>
          </div>
          <div className="flex justify-between text-[11.5px]">
            <span className="text-white/55">AP Intercompany</span>
            <span className="font-bold text-bz-fire">CR ₹22,840</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 pt-1">
        {["Auto-posted", "FX at 0.921", "Elimination tagged", "Zero manual entry"].map((t) => (
          <span
            key={t}
            className="text-[9px] font-bold px-2 py-1 rounded-bz-pill bg-bz-fire/[0.15] text-bz-fire tracking-[0.04em]"
          >
            {t}
          </span>
        ))}
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
            One ERP. Many entities.{" "}
            <Heading.Muted>Zero spreadsheet rollups.</Heading.Muted>
          </Heading>
          <PillGroup>
            <Pill
              variant="dark"
              withArrowUpRight
              href="https://system.bizakerp.com/account/self-register"
            >
              Get Started
            </Pill>
            <Pill variant="light" href="/contact">
              Request Demo
            </Pill>
          </PillGroup>
        </div>

        {/* Mosaic: full-width dark entity board + IC auto-post panel + group close panel */}
        <div className="bz-hero-visual mx-auto w-full max-w-[1140px] flex flex-col gap-3">
          <HeroGroupBoard />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <HeroICAutoPost />
            </div>
            <div className="hidden md:block md:col-span-1">
              <HeroGroupClosePanel />
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}

// Cross-entity activity stream every entity posts to the group view in real-time
function EntityStreamSection() {
  return (
    <Section tone="a">
      <Container>
        <SectionHead
          index="01"
          label="Cross-entity activity"
          title={
            <>
              One ledger.{" "}{<br/>}
              <Heading.Muted>Every entity, live.</Heading.Muted>
            </>
          }
          description="Every IC posting, FX update, VAT submission, and entity close event across all subsidiaries and branches."
        />

        <div className="rounded-bz-xl overflow-hidden border border-bz-line-soft">
          {/* Stream header */}
          <div className="flex items-center justify-between px-5 py-3 bg-bz-paper border-b border-bz-line-soft">
            <div className="flex items-center gap-2.5">
              <StatusChip variant="live">Live</StatusChip>
              <span className="text-[10px] font-medium text-bz-text-muted">
                6 entities streaming
              </span>
            </div>
            <span className="text-[10px] text-bz-text-muted hidden sm:inline">
              34 cross-entity events today
            </span>
          </div>

          {/* Stream rows */}
          <div className="flex flex-col divide-y divide-bz-line-soft">
            {ENTITY_STREAM.map((entry) => (
              <div
                key={entry.ref}
                className={`flex items-center gap-4 px-5 py-4 ${
                  entry.live ? "bg-bz-fire/[0.03]" : ""
                }`}
              >
                {/* Entity tag */}
                <span
                  className={`text-[10.5px] font-semibold shrink-0 w-28 hidden sm:block uppercase tracking-[0.07em] ${
                    entry.live ? "text-bz-text" : "text-bz-text-muted"
                  }`}
                >
                  {entry.entity}
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
                    {entry.entity} ·{" "}
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

// Entity profiles flat 4-col panel inside a dark section
function EntityProfilesSection() {
  return (
    <Section tone="dark">
      <Container>
        <SectionHead
          tone="dark"
          index="02"
          label="Entity configuration"
          title={
            <>
              Every entity.{" "}
              <Heading.Muted>Its own books, by default.</Heading.Muted>
            </>
          }
          description="Each subsidiary, branch, or cost centre gets its own chart of accounts, tax engine, fiscal calendar, and reporting currency."
        />

        {/* Entity panel: gap-px grid creates thin dividers without per-item border logic */}
        <div className="rounded-bz-2xl overflow-hidden bg-bz-olive-soft">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-white/[0.08]">
            {ENTITY_PROFILES.map((e) => (
              <div
                key={e.name}
                className={`flex flex-col gap-5 p-7 lg:p-8 ${
                  e.active ? "bg-bz-olive-dark" : "bg-bz-olive-soft"
                }`}
              >
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[18px] leading-none">{e.flag}</span>
                    <p
                      className={`text-[22px] font-bold leading-none ${
                        e.active ? "text-bz-fire" : "text-bz-text-on-dark"
                      }`}
                    >
                      {e.name}
                    </p>
                  </div>
                  <p className="text-[11px] text-white/50">{e.tagline}</p>
                </div>

                <div className="flex flex-col gap-2.5">
                  {e.config.map((cfg) => (
                    <div key={cfg} className="flex items-center gap-2">
                      <div
                        className={`w-1 h-1 rounded-full shrink-0 ${
                          e.active ? "bg-bz-fire" : "bg-white/30"
                        }`}
                      />
                      <span
                        className={`text-[12.5px] ${
                          e.active ? "text-white/90" : "text-white/55"
                        }`}
                      >
                        {cfg}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-auto">
                  <span
                    className={`text-[9px] font-bold uppercase tracking-[0.10em] px-2.5 py-1 rounded-bz-pill ${
                      e.active
                        ? "bg-bz-fire/[0.15] text-bz-fire"
                        : "bg-white/[0.06] text-white/40"
                    }`}
                  >
                    {e.active ? "Active" : "Configured"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Configuration note */}
        <div className="mt-4 rounded-bz-xl border border-white/[0.08] bg-white/[0.03] px-5 sm:px-6 py-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5">
            <div className="hidden sm:flex w-8 h-8 rounded-bz-md bg-white/[0.06] items-center justify-center shrink-0">
              <Settings size={14} className="text-white/70" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-bz-text-on-dark mb-1">
                New entity online in one afternoon
              </p>
              <p className="text-[12px] text-white/55 leading-relaxed">
                Set currency, tax engine, chart of accounts, and fiscal calendar then it's live and rolling up to the group.
              </p>
            </div>
            <div className="flex items-baseline gap-1.5 sm:shrink-0">
              <span className="text-[18px] font-bold text-bz-text-on-dark leading-none">Regional</span>
              <span className="text-[11px] text-white/50">tax engines</span>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}

// Group hierarchy StepCard showing the entity tree structure
function GroupHierarchySection() {
  return (
    <Section tone="b">
      <Container>
        <SectionHead
          index="03"
          label="Group hierarchy"
          title={
            <>
              From holding to branch.{" "}
              <Heading.Muted>One tree, any depth.</Heading.Muted>
            </>
          }
          description="Model the full group structure holding companies, subsidiaries, branches, and cost centres and roll up P&L at any level."
          titleMaxWidth={720}
          spacing="tight"
        />
        <StepCard
          number="03"
          tag="Model → Configure → Close"
          title="Stand up a subsidiary. Roll up the group. In one afternoon."
          bullets={[
            "Define the hierarchy: group, region, entity, branch no depth limit.",
          ]}
          visual={<EntityTreeVisual />}
        />
      </Container>
    </Section>
  );
}

// Intercompany automation SectionHead + BigCard with auto-IC journal visual
function AutoICSection() {
  return (
    <Section tone="a">
      <Container>
        <SectionHead
          index="04"
          label="Intercompany automation"
          title={
            <>
              One IC invoice.{" "}
              <Heading.Muted>Both sides auto-posted.</Heading.Muted>
            </>
          }
          description="When Bizak Nepal sells to Bizak India, a single transaction creates the AR and AP in both currencies."
        />
        <BigCard
          text={{
            title: "One IC invoice. Both sides auto-posted.",
            bullets: [
              "Mirror posting in both entities, instantly.",
              "FX conversion at the transaction-date rate.",
            ],
            cta: {
              variant: "accent",
              withArrow: true,
              href: "/contact",
              children: "Request Demo",
            },
          }}
          visual={<AutoICVisual />}
        />
      </Container>
    </Section>
  );
}

// FAQ dark intro panel + accordion, all questions closed initially
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

export function MulticompanyAndBranchesPage() {
  return (
    <>
      <HeroSection />
      <EntityStreamSection />
      <EntityProfilesSection />
      <GroupHierarchySection />
      <AutoICSection />
      <FAQSection />
    </>
  );
}
