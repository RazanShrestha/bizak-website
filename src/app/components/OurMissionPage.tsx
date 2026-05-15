import "../../styles/style.css";
import {
  Eye,
  SlidersHorizontal,
  ShieldCheck,
  LifeBuoy,
  Lock,
  Route,
  Handshake,
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
  Bento,
  BentoGrid,
  Tick,
  DotGrid,
} from "./bz";

// ════════════════════════════════════════════════════════════════════════════
// CONTENT DATA all page copy + structured data lives at the top.
// Sections below are composition of bz/ primitives + this data.
// ════════════════════════════════════════════════════════════════════════════

// Hero "mission charter" mock what the company stands for.
const CHARTER_STATS = [
  { value: "One ledger", label: "Across your whole business" },
  { value: "South Asia", label: "Localised for the region" },
  { value: "Days, not weeks", label: "Faster month-end close" },
];

// §01 the contrast: the same business, blind vs. clear.
const STATUS_QUO = [
  { label: "Revenue",       where: "Sales spreadsheet" },
  { label: "Cash position", where: "Accounting tool" },
  { label: "Stock on hand", where: "A separate app" },
];

const ON_BIZAK = [
  { label: "Revenue",       value: "$4.82M" },
  { label: "Cash position", value: "$1.24M" },
  { label: "Stock on hand", value: "847 SKUs" },
];

// §02 the mission, in three parts. Each pillar maps to a product narrative.
const PILLARS = [
  {
    icon: Eye,
    name: "Clarity",
    desc: "Operators should never have to guess. Every number and every workflow earns a clean line of sight from cause to outcome.",
    bullets: [
      "One source of truth across the business",
      "Live dashboards, not month-end reports",
      "Plain-language reporting any team can read",
    ],
  },
  {
    icon: SlidersHorizontal,
    name: "Control",
    desc: "Growth should never mean losing the thread. The right controls let leaders move fast without breaking what works.",
    bullets: [
      "Granular roles, permissions and audit logs",
      "Workflows that enforce policy, not block work",
      "Multi-entity, multi-currency from day one",
    ],
  },
  {
    icon: ShieldCheck,
    name: "Confidence",
    desc: "When the system is trustworthy, the team is decisive. Every operator should feel sure of the data, the process and the next move.",
    bullets: [
      "Enterprise-grade security on every plan",
      "Reliable cloud, predictable updates",
      "A partner after go-live, not just a vendor",
    ],
  },
];

// §03 the principles we fall back on when the work gets ambiguous.
const PRINCIPLES = [
  {
    n: "01",
    title: "Simplicity is earned.",
    body: "We absorb the complexity behind the product so the work in front of you can feel obvious.",
  },
  {
    n: "02",
    title: "Customers are partners.",
    body: "Every roadmap conversation starts with the operators using Bizak, not the people selling it.",
  },
  {
    n: "03",
    title: "We ship a point of view.",
    body: "Bizak is opinionated about how a business should run. Configurable where it matters, decided everywhere else.",
  },
  {
    n: "04",
    title: "Local first, then regional.",
    body: "We start with real taxes, compliance, currencies and languages, then make the platform work the same way across South Asia.",
  },
  {
    n: "05",
    title: "Pace is a feature.",
    body: "ERPs are infamous for being slow to roll out and slower to evolve. We treat speed as non-negotiable.",
  },
];

// §04 the promises every Bizak customer is owed.
const COMMITMENTS = [
  {
    icon: LifeBuoy,
    title: "We answer the ticket.",
    desc: "Real specialists, the same day, on every plan. No deflection bots, no fourteen-step routing.",
  },
  {
    icon: Lock,
    title: "Your data stays yours.",
    desc: "Exportable, portable, and never held hostage by a contract term.",
  },
  {
    icon: Route,
    title: "We ship the roadmap.",
    desc: "What we promise in a quarter is what we deliver. When we miss, we say so publicly.",
  },
  {
    icon: Handshake,
    title: "We pay partners fairly.",
    desc: "Implementers, referrers and affiliates: the economics work for them, or they don't work for us.",
  },
];

// ════════════════════════════════════════════════════════════════════════════
// HERO mission declaration + a "Mission Charter" document mock
// ════════════════════════════════════════════════════════════════════════════

function HeroSection() {
  return (
    <Section tone="b" pad="hero">
      <Container>
        <div className="flex flex-col items-center text-center">
          <BadgeGreen style={{ marginBottom: 28 }}>Our Mission</BadgeGreen>
          <Heading level={2} className="max-w-[880px]" style={{ marginBottom: 36 }}>
            Give every business one system to run on,{" "}
            <Heading.Muted>and the clarity to run it well.</Heading.Muted>
          </Heading>
          <PillGroup>
            <Pill variant="dark" withArrowUpRight href="https://system.bizakerp.com/account/self-register">
              Get Started
            </Pill>
            <Pill variant="light" withArrow href="/contact">
              Request Demo
            </Pill>
          </PillGroup>
        </div>

        <div className="bz-hero-visual mx-auto w-full max-w-[1120px]">
          <MissionCharter />
        </div>
      </Container>
    </Section>
  );
}

function MissionCharter() {
  return (
    <div className="overflow-hidden rounded-bz-2xl border border-bz-line bg-bz-surface">
      {/* Olive header strip */}
      <div className="flex items-center justify-between gap-4 bg-bz-olive px-5 py-4 md:px-7">
        <div className="flex items-center gap-2.5">
          <span className="text-[15px] font-medium tracking-tight text-bz-text-on-dark">
            Bizak<sup className="ml-0.5 text-[8px] opacity-60">®</sup>
          </span>
          <span className="h-3 w-px bg-white/20" />
          <span className="text-[12.5px] text-white/[0.62]">Mission Charter</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="size-1.5 animate-pulse rounded-bz-pill bg-bz-fire" />
          <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-white/[0.55]">
            Live now
          </span>
        </div>
      </div>

      {/* Statement body */}
      <div className="p-6 md:p-10">
        <Eyebrow>Our purpose</Eyebrow>
        <p className="mt-5 max-w-[820px] text-[clamp(20px,2.7vw,31px)] font-medium leading-[1.32] tracking-[-0.015em] text-bz-text">
          Replace the spreadsheet stack with one operating system every
          business can trust.
        </p>
        <p className="mt-3.5 max-w-[640px] text-[clamp(14.5px,1.7vw,17px)] leading-[1.6] text-bz-text-muted">
          Finance, sales, inventory and operations, live on a single source of
          truth.
        </p>
        <div className="mt-7 flex flex-wrap gap-2">
          {["Clarity", "Control", "Confidence"].map((t) => (
            <span
              key={t}
              className="rounded-bz-sm border border-bz-line-soft bg-bz-paper-warm px-2.5 py-1 text-[11.5px] font-medium text-bz-text"
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Proof footer hairline grid */}
      <div className="grid grid-cols-3 gap-px border-t border-bz-line-soft bg-bz-line-soft">
        {CHARTER_STATS.map((s) => (
          <div key={s.label} className="bg-bz-surface px-4 py-5 md:px-7 md:py-6">
            <div className="bz-stat-num" style={{ fontSize: "clamp(20px,3.4vw,28px)" }}>
              {s.value}
            </div>
            <p className="mt-1.5 text-[11.5px] leading-[1.4] text-bz-text-muted">
              {s.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// [01] WHY WE EXIST a before/after contrast: the business blind vs. clear
// ════════════════════════════════════════════════════════════════════════════

function WhyWeExistSection() {
  return (
    <Section tone="a">
      <Container>
        <SectionHead
          index="01"
          label="Why we exist"
          title={
            <>
              Most companies don't run blind by choice.{" "}
              <Heading.Muted>Their tools just never agreed.</Heading.Muted>
            </>
          }
          description="The numbers that should run a business get scattered across spreadsheets and disconnected apps. By the time they're reconciled, the moment to act has passed. That's the problem Bizak exists to end."
          titleMaxWidth={720}
        />

        <div className="grid grid-cols-1 overflow-hidden rounded-bz-2xl border border-bz-line md:grid-cols-2">
          {/* Status quo running blind */}
          <div className="flex flex-col bg-bz-section-b p-6 md:p-9 lg:p-10">
            <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-bz-text-soft">
              The status quo
            </div>
            <h3 className="mt-1.5 text-[18px] font-medium tracking-[-0.01em] text-bz-text">
              Running blind
            </h3>
            <div className="mt-6 flex flex-col gap-2.5">
              {STATUS_QUO.map((r) => (
                <div
                  key={r.label}
                  className="flex items-center justify-between gap-3 rounded-bz-md border border-bz-line-soft bg-bz-surface px-4 py-3"
                >
                  <span className="text-[13.5px] font-medium text-bz-text">
                    {r.label}
                  </span>
                  <span className="text-[12px] text-bz-text-soft">{r.where}</span>
                </div>
              ))}
            </div>
            <p className="mt-auto pt-6 text-[13px] leading-[1.6] text-bz-text-muted">
              Reconciled monthly, at best. Every number lives somewhere else, and
              none of them quite agree.
            </p>
          </div>

          {/* On Bizak running clear */}
          <div className="flex flex-col bg-bz-olive p-6 md:p-9 lg:p-10">
            <div className="flex items-center gap-2">
              <span className="size-1.5 animate-pulse rounded-bz-pill bg-bz-fire" />
              <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-bz-leaf">
                On Bizak
              </span>
            </div>
            <h3 className="mt-1.5 text-[18px] font-medium tracking-[-0.01em] text-bz-text-on-dark">
              Running clear
            </h3>
            <div className="mt-6 flex flex-col gap-2.5">
              {ON_BIZAK.map((r) => (
                <div
                  key={r.label}
                  className="flex items-center justify-between gap-3 rounded-bz-md bg-white/[0.05] px-4 py-3"
                >
                  <span className="flex items-center gap-2 text-[13.5px] font-medium text-bz-text-on-dark">
                    <span className="size-1.5 rounded-bz-pill bg-bz-fire" />
                    {r.label}
                  </span>
                  <span className="text-[13px] font-medium tabular-nums text-bz-leaf">
                    {r.value}
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-auto pt-6 text-[13px] leading-[1.6] text-white/[0.6]">
              One ledger. Every number current, sourced and agreed, the moment a
              transaction happens.
            </p>
          </div>
        </div>
      </Container>
    </Section>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// [02] THE MISSION clarity, control, confidence the three pillars
// ════════════════════════════════════════════════════════════════════════════

function PillarsSection() {
  return (
    <Section tone="b">
      <Container>
        <SectionHead
          index="02"
          label="The mission"
          title={
            <>
              One mission,{" "}
              <Heading.Muted>standing on three pillars.</Heading.Muted>
            </>
          }
          description="Clarity, then control, then confidence. Every feature Bizak ships has to serve one of the three, and weaken none of them."
          titleMaxWidth={620}
        />

        <BentoGrid cols={3}>
          {PILLARS.map((p, i) => {
            const Icon = p.icon;
            return (
              <Bento key={p.name} tone="paper" hover>
                <div className="flex items-center justify-between">
                  <span className="flex size-11 items-center justify-center rounded-bz-lg bg-bz-paper-warm">
                    <Icon size={20} strokeWidth={1.7} className="text-bz-text" />
                  </span>
                  <span className="text-[12px] font-medium tracking-[0.12em] text-bz-text-soft">
                    0{i + 1}
                  </span>
                </div>
                <h3 className="mt-6 text-[21px] font-medium tracking-[-0.01em] text-bz-text">
                  {p.name}
                </h3>
                <p className="mt-2.5 text-[14px] leading-[1.65] text-bz-text-muted">
                  {p.desc}
                </p>
                <ul className="mt-6 mb-0 flex list-none flex-col gap-2.5 border-t border-bz-line-soft pt-5 pl-0">
                  {p.bullets.map((b) => (
                    <li
                      key={b}
                      className="flex items-start gap-2.5 text-[13.5px] leading-[1.5] text-bz-text"
                    >
                      <Tick size="sm" className="mt-[3px]" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </Bento>
            );
          })}
        </BentoGrid>
      </Container>
    </Section>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// [03] WHAT GUIDES US the principles, as a manifesto on the olive slab
// ════════════════════════════════════════════════════════════════════════════

function ManifestoSection() {
  return (
    <Section tone="dark" className="overflow-hidden">
      <DotGrid tone="dark" />
      <Container className="relative">
        <SectionHead
          index="03"
          label="What guides us"
          tone="dark"
          title={
            <>
              The principles behind{" "}
              <Heading.Muted>every decision we make.</Heading.Muted>
            </>
          }
          description="When the work gets ambiguous, these are the beliefs we fall back on, in product trade-offs, in how we hire, and in how we treat the people who run on Bizak."
          titleMaxWidth={640}
        />

        <div className="border-b border-white/[0.1]">
          {PRINCIPLES.map((p) => (
            <div
              key={p.n}
              className="grid gap-2 border-t border-white/[0.1] py-7 md:grid-cols-[88px_minmax(0,1.05fr)_minmax(0,1.5fr)] md:gap-10 md:py-9"
            >
              <span className="text-[12.5px] font-semibold tracking-[0.12em] text-bz-fire">
                {p.n}
              </span>
              <h3 className="text-[18px] font-medium leading-[1.3] tracking-[-0.01em] text-bz-text-on-dark md:text-[20px]">
                {p.title}
              </h3>
              <p className="text-[14px] leading-[1.7] text-white/[0.6]">
                {p.body}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// [04] OUR PROMISE the commitments behind the mission
// ════════════════════════════════════════════════════════════════════════════

function PromiseSection() {
  return (
    <Section tone="a">
      <Container>
        <SectionHead
          index="04"
          label="Our promise"
          title={
            <>
              A mission is only as good{" "}
              <Heading.Muted>as the promises behind it.</Heading.Muted>
            </>
          }
          description="Four commitments every Bizak customer is owed, from day one and for as long as you run on the platform."
          titleMaxWidth={640}
        />

        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-bz-2xl border border-bz-line bg-bz-line-soft sm:grid-cols-2 lg:grid-cols-4">
          {COMMITMENTS.map((c) => {
            const Icon = c.icon;
            return (
              <div
                key={c.title}
                className="flex flex-col bg-bz-surface p-6 md:p-7"
              >
                <span className="flex size-10 items-center justify-center rounded-bz-md bg-bz-paper-warm">
                  <Icon size={18} strokeWidth={1.7} className="text-bz-text" />
                </span>
                <h3 className="mt-5 text-[15.5px] font-medium tracking-[-0.01em] text-bz-text">
                  {c.title}
                </h3>
                <p className="mt-2 text-[13px] leading-[1.6] text-bz-text-muted">
                  {c.desc}
                </p>
              </div>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PAGE Header + Footer are owned by the route layout in routes.tsx
// ════════════════════════════════════════════════════════════════════════════

export function OurMissionPage() {
  return (
    <main>
      <HeroSection />
      <WhyWeExistSection />
      <PillarsSection />
      <ManifestoSection />
      <PromiseSection />
    </main>
  );
}
