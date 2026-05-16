import "../../styles/style.css";
import {
  ArrowDown,
  Boxes,
  Factory,
  FolderKanban,
  Layers,
  MapPin,
  ShieldCheck,
  ShoppingCart,
  Unplug,
  Users,
  Wallet,
  Zap,
} from "lucide-react";
import {
  Section,
  Container,
  SectionHead,
  Heading,
  Eyebrow,
  Pill,
  PillGroup,
  BadgeGreen,
  FlagsRow,
} from "./bz";

// ════════════════════════════════════════════════════════════════════════════
// CONTENT DATA all page copy + structured data lives at the top.
// Sections below are composition of bz/ primitives + this data.
// ════════════════════════════════════════════════════════════════════════════

// Hero "what Bizak is" band four ideas, no vanity metrics.
const PILLARS = [
  { icon: Layers,      value: "One system",  desc: "Finance, inventory, sales and operations, unified on a single platform." },
  { icon: Zap,         value: "Real-time",   desc: "Every transaction posts the moment it happens, so the books stay live." },
  { icon: ShieldCheck, value: "Audit-ready", desc: "Every figure traces back to the transaction that created it." },
  { icon: MapPin,      value: "Regional",    desc: "Tuned for the tax, compliance and workflows of South Asia." },
];

// The disconnected stack Bizak set out to replace.
const LEGACY_STACK = [
  "A spreadsheet for everything",
  "A standalone accounting tool",
  "A pile of apps that never agree",
];

// What the platform covers shown on the dark "what we're building" section.
const MODULES = [
  { icon: Wallet,       name: "Financial Management",  desc: "General ledger, receivables, payables and live financial statements." },
  { icon: Boxes,        name: "Inventory & Warehouse", desc: "Real-time stock, multi-location control, lot and serial tracking." },
  { icon: Users,        name: "Sales & CRM",           desc: "Quotes, orders, invoicing and the full customer record in one place." },
  { icon: ShoppingCart, name: "Purchasing",            desc: "Vendor management, purchase orders and three-way matching." },
  { icon: Factory,      name: "Manufacturing",         desc: "Production planning, bills of material, routing and work orders." },
  { icon: FolderKanban, name: "Projects & Costing",    desc: "Project profitability, time tracking and billing, job by job." },
];

// The convictions that shaped the product.
const PRINCIPLES = [
  {
    n: "01",
    title: "One system beats ten tools.",
    body: "Every disconnected app is a reconciliation waiting to happen. We would rather build one place that finance, sales, inventory and operations all trust.",
  },
  {
    n: "02",
    title: "Real-time, or it isn't true.",
    body: "A number that is a month old is history, not information. Bizak posts every transaction the moment it happens.",
  },
  {
    n: "03",
    title: "Every figure must trace home.",
    body: "If you cannot click a total and land on the transaction that created it, it is not a number you can stand behind.",
  },
  {
    n: "04",
    title: "Build it to outlive the trend.",
    body: "We build the durable way, with clean architecture and no shortcuts, because businesses run on this software for years.",
  },
];

const FLAGS = ["🇳🇵","🇮🇳","🇧🇩","🇱🇰","🇵🇰","🇧🇹","🇲🇻"];

// ════════════════════════════════════════════════════════════════════════════
// HERO badge + mission heading + a "what Bizak is" summary band
// ════════════════════════════════════════════════════════════════════════════

function HeroSection() {
  return (
    <Section tone="b" pad="hero">
      <Container>
        <div className="flex flex-col items-center text-center">
          <BadgeGreen style={{ marginBottom: 28 }}>About Bizak</BadgeGreen>
          <Heading level={2} className="max-w-[860px]" style={{ marginBottom: 36 }}>
            Complexity shouldn't be the price of growth.{" "}
            <Heading.Muted>So we built a system that removes it.</Heading.Muted>
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

        <div className="bz-hero-visual mx-auto w-full max-w-[1180px]">
          <div className="overflow-hidden rounded-bz-2xl border border-bz-line bg-bz-surface">
            <div className="flex items-center justify-between border-b border-bz-line-soft px-5 py-4 md:px-7">
              <span className="text-[15px] font-medium tracking-tight text-bz-text">
                Bizak<sup className="ml-0.5 text-[8px] opacity-60">®</sup>
              </span>
              <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-bz-text-soft">
                Built for South Asia
              </span>
            </div>
            <div className="grid grid-cols-2 gap-px bg-bz-line-soft md:grid-cols-4">
              {PILLARS.map(({ icon: Icon, value, desc }) => (
                <div key={value} className="bg-bz-surface p-5 md:p-6">
                  <span className="mb-3 flex size-9 items-center justify-center rounded-bz-md bg-bz-section-b">
                    <Icon size={17} strokeWidth={1.7} className="text-bz-text" />
                  </span>
                  <div className="text-[16px] font-medium text-bz-text">{value}</div>
                  <p className="mt-1.5 text-[12.5px] leading-[1.5] text-bz-text-muted">
                    {desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// [01] WHY WE EXIST origin story + the stack-to-system visual
// ════════════════════════════════════════════════════════════════════════════

function OriginSection() {
  return (
    <Section tone="a">
      <Container>
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <Eyebrow index="01" className="mb-5">Why we exist</Eyebrow>
            <Heading level={2}>
              Growth kept making companies harder to run.{" "}
              <Heading.Muted>We're here to reverse that.</Heading.Muted>
            </Heading>
            <p className="mt-6 text-[15px] leading-[1.7] text-bz-text-muted">
              We kept seeing the same thing across South Asia: capable, ambitious
              businesses held back not by their teams, but by their tools. Numbers
              scattered across spreadsheets and disconnected apps, and no quick
              way to answer one question, where do we stand right now?
            </p>
            <p className="mt-4 text-[15px] leading-[1.7] text-bz-text-muted">
              Bizak began as a refusal to accept that as normal. Finance,
              inventory, sales and operations belong on one system, sharing one
              source of truth, built for how businesses in this region actually
              work.
            </p>
          </div>
          <OriginVisual />
        </div>
      </Container>
    </Section>
  );
}

function OriginVisual() {
  return (
    <div className="rounded-bz-2xl border border-bz-line bg-bz-surface p-5 shadow-[var(--bz-shadow-lift)] md:p-6">
      <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.16em] text-bz-text-soft">
        How most companies still run
      </p>
      <div className="flex flex-col gap-2">
        {LEGACY_STACK.map((t) => (
          <div
            key={t}
            className="flex items-center gap-2.5 rounded-bz-md border border-bz-line-soft bg-bz-section-b px-3.5 py-3"
          >
            <Unplug size={14} strokeWidth={1.8} className="shrink-0 text-bz-text-soft" />
            <span className="text-[13px] text-bz-text-muted">{t}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-col items-center gap-1 py-3.5">
        <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-bz-text-soft">
          Consolidated into
        </span>
        <ArrowDown size={16} strokeWidth={2} className="text-bz-text-muted" />
      </div>

      <div className="rounded-bz-xl bg-bz-olive p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-bz-md bg-white/[0.08]">
              <Layers size={16} strokeWidth={1.7} className="text-bz-leaf" />
            </span>
            <span className="text-[15px] font-medium text-bz-text-on-dark">Bizak</span>
          </div>
          <span className="text-[10.5px] font-medium uppercase tracking-[0.12em] text-bz-leaf">
            One system
          </span>
        </div>
        <p className="mt-3 text-[13px] leading-[1.65] text-white/[0.7]">
          Finance, inventory, sales and operations on one ledger. One source of
          truth, every transaction live.
        </p>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// [02] WHAT WE'RE BUILDING the platform's scope on the olive showcase
// ════════════════════════════════════════════════════════════════════════════

function PlatformSection() {
  return (
    <Section tone="dark">
      <Container>
        <SectionHead
          index="02"
          label="What we're building"
          tone="dark"
          title={<>One platform for the whole business, <Heading.Muted>not another app to bolt on.</Heading.Muted></>}
          titleMaxWidth={720}
        />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {MODULES.map(({ icon: Icon, name, desc }) => (
            <div
              key={name}
              className="rounded-bz-xl border border-white/[0.07] bg-white/[0.04] p-5"
            >
              <span className="mb-3.5 flex size-9 items-center justify-center rounded-bz-md bg-white/[0.07]">
                <Icon size={17} strokeWidth={1.7} className="text-bz-leaf" />
              </span>
              <div className="text-[15px] font-medium text-bz-text-on-dark">{name}</div>
              <p className="mt-1.5 text-[13px] leading-[1.6] text-white/[0.6]">{desc}</p>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// [03] WHAT WE BELIEVE a numbered manifesto
// ════════════════════════════════════════════════════════════════════════════

function PrinciplesSection() {
  return (
    <Section tone="b">
      <Container>
        <SectionHead
          index="03"
          label="What we believe"
          title={<>Four convictions <Heading.Muted>behind every line of Bizak.</Heading.Muted></>}
        />
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {PRINCIPLES.map((p) => (
            <div
              key={p.n}
              className="bz-hover-card rounded-bz-2xl border border-bz-line bg-bz-surface p-7 md:p-9"
            >
              <div
                className="bz-stat-num mb-4"
                style={{ fontSize: "clamp(28px, 4vw, 38px)", color: "var(--bz-leaf-deep)" }}
              >
                {p.n}
              </div>
              <h3 className="bz-bento-title">{p.title}</h3>
              <p className="bz-bento-desc">{p.body}</p>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// [04] THE MISSION the mission as the heading, regional focus as the close
// ════════════════════════════════════════════════════════════════════════════

function MissionSection() {
  return (
    <Section tone="a">
      <Container>
        <SectionHead
          index="04"
          label="The mission"
          title={<>Give every company one place <Heading.Muted>to run its entire business on.</Heading.Muted></>}
          description="Wherever you operate across South Asia and whatever you make, the goal is the same: replace the disconnected stack with one system your whole company can trust, from a first invoice to a full consolidation."
          titleMaxWidth={720}
        />
        <FlagsRow
          prefix="One platform, localised"
          flags={FLAGS}
          suffix="for businesses across South Asia."
        />
      </Container>
    </Section>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PAGE Header + Footer are owned by the route layout in routes.tsx
// ════════════════════════════════════════════════════════════════════════════

export function AboutPage() {
  return (
    <main>
      <HeroSection />
      <OriginSection />
      <PlatformSection />
      <PrinciplesSection />
      <MissionSection />
    </main>
  );
}
