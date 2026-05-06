import "../../styles/style.css";
import {
  ArrowRight,
  ArrowUpRight,
  Briefcase,
  Compass,
  Eye,
  Gauge,
  Globe2,
  Handshake,
  HeartHandshake,
  Lightbulb,
  MessageCircle,
  Quote,
  Rocket,
  Send,
  Share2,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import {
  Button,
  Card,
  Container,
  Eyebrow,
  HeroBadge,
  IconBadge,
  PillBadge,
  Section,
  SectionHeading,
  Stat,
} from "./marketing";

// ─── Data ─────────────────────────────────────────────────────────────────────

const HERO_STATS: { value: string; label: string }[] = [
  { value: "50,000+", label: "Businesses empowered" },
  { value: "32", label: "Countries reached" },
  { value: "1.2M", label: "Hours saved each month" },
  { value: "97%", label: "Customer renewal rate" },
];

const PILLARS: {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  description: string;
  bullets: string[];
}[] = [
  {
    icon: Eye,
    eyebrow: "Pillar 01",
    title: "Clarity",
    description:
      "Operators should never need to guess. Every number, every workflow, every decision deserves a clean line of sight from cause to outcome.",
    bullets: [
      "One source of truth across the business",
      "Real-time dashboards, not month-end reports",
      "Plain-language reporting any team can read",
    ],
  },
  {
    icon: Gauge,
    eyebrow: "Pillar 02",
    title: "Control",
    description:
      "Growth shouldn't mean losing the plot. We build the controls — approvals, audit trails, governance — that let leaders move fast without breaking things.",
    bullets: [
      "Granular roles, permissions, and audit logs",
      "Workflows that enforce policy, not block work",
      "Multi-entity, multi-currency from day one",
    ],
  },
  {
    icon: ShieldCheck,
    eyebrow: "Pillar 03",
    title: "Confidence",
    description:
      "When the system is trustworthy, the team is decisive. Our job is to make every operator feel confident in the data, the process, and the next move.",
    bullets: [
      "Enterprise-grade security on every plan",
      "Reliable cloud, predictable updates",
      "A partner, not just a vendor, after go-live",
    ],
  },
];

const BELIEFS: { icon: LucideIcon; title: string; description: string }[] = [
  {
    icon: Lightbulb,
    title: "Simplicity is hard work",
    description:
      "We earn the right to a clean interface by absorbing the complexity behind it. The product should feel obvious, even when the problem isn't.",
  },
  {
    icon: HeartHandshake,
    title: "Customers are partners",
    description:
      "We win when our customers win. Every roadmap conversation starts with the operators using the product, not the people selling it.",
  },
  {
    icon: Compass,
    title: "Opinions are tools",
    description:
      "We have a point of view about how a business should run — and we ship it. Configurable where it matters, opinionated everywhere else.",
  },
  {
    icon: Globe2,
    title: "Local, then global",
    description:
      "We start where our customers operate — taxes, compliance, languages, currencies — then make the platform work the same way everywhere.",
  },
  {
    icon: Sparkles,
    title: "Craft over checkboxes",
    description:
      "Feature lists don't run businesses, products do. We'd rather ship one workflow that delights than ten that merely exist.",
  },
  {
    icon: Rocket,
    title: "Pace is a feature",
    description:
      "ERPs are legendary for being slow — to roll out, to update, to evolve. We treat speed as a non-negotiable, not an afterthought.",
  },
];

const IMPACT_STATS: { value: string; label: string }[] = [
  { value: "50,000+", label: "Operators rely on Bizak every day" },
  { value: "32", label: "Countries on the platform" },
  { value: "1.2M", label: "Hours of manual work saved monthly" },
  { value: "8 wks", label: "Median time to first go-live" },
];

const WAYS_TO_HELP: {
  icon: LucideIcon;
  tag: string;
  title: string;
  description: string;
  cta: string;
  href: string;
  highlight?: boolean;
}[] = [
  {
    icon: Rocket,
    tag: "Run on Bizak",
    title: "Become a customer",
    description:
      "The most direct way to fuel the mission is to run your business on Bizak. Every team that joins sharpens the platform for the next.",
    cta: "Start a free trial",
    href: "https://system.bizakerp.com/account/self-register",
    highlight: true,
  },
  {
    icon: Share2,
    tag: "Refer & advocate",
    title: "Refer a business",
    description:
      "Know an operator drowning in spreadsheets? Send them our way. Referrals from operators are how the right teams find Bizak.",
    cta: "Refer a business",
    href: "/contact",
  },
  {
    icon: Handshake,
    tag: "Build with us",
    title: "Become a partner",
    description:
      "Implementation, accounting, technology, reseller — partners help bring Bizak to industries and regions we couldn't reach alone.",
    cta: "Apply to partner",
    href: "/partners",
  },
  {
    icon: Briefcase,
    tag: "Join the team",
    title: "Build the product",
    description:
      "Engineers, designers, implementation leads, customer success — the mission moves at the speed of the people behind it.",
    cta: "See open roles",
    href: "/careers",
  },
  {
    icon: MessageCircle,
    tag: "Shape the roadmap",
    title: "Share feedback",
    description:
      "Every release note has a customer behind it. Tell us what's missing, what's broken, what's brilliant — we read all of it.",
    cta: "Send feedback",
    href: "/contact",
  },
  {
    icon: Send,
    tag: "Spread the word",
    title: "Tell your network",
    description:
      "A post, a recommendation, a case study, a quiet word with a peer — operator-to-operator endorsements move our mission farther than any ad.",
    cta: "Get media assets",
    href: "/contact",
  },
];

const COMMITMENTS: { title: string; description: string }[] = [
  {
    title: "We answer the support ticket",
    description:
      "No deflection bots, no 14-step routing. Real specialists, the same day, on every plan.",
  },
  {
    title: "We honour the data",
    description:
      "Your data is yours — exportable, portable, and never held hostage by contract terms.",
  },
  {
    title: "We ship the roadmap",
    description:
      "What we promise in a quarter is what we deliver. If we miss, we explain why — publicly.",
  },
  {
    title: "We pay our partners fairly",
    description:
      "Implementation partners, referrers, affiliates — the economics work for them, or they don't work for us.",
  },
];

// ─── Hero ─────────────────────────────────────────────────────────────────────

function HeroSection() {
  return (
    <Section pad="hero" tone="light" className="biz-mesh overflow-hidden">
      <Container width="narrow" className="relative">
        <div className="flex flex-col items-center text-center">
          <HeroBadge>Our Mission</HeroBadge>
          <h1 className="mt-4 max-w-[860px] text-[clamp(40px,5.5vw,68px)] font-bold leading-[1.05] tracking-[-0.03em] text-bz-text">
            Empower every business to run with{" "}
            <span className="relative inline-block">
              clarity and control
              <span className="absolute inset-x-0 bottom-1 -z-0 h-[10px] rounded-full bg-bz-accent/55" />
            </span>
            .
          </h1>
          <p className="mt-5 max-w-[660px] text-[17px] leading-[1.7] text-bz-text-muted">
            Bizak exists to replace the chaos of disconnected tools, late-night
            spreadsheets, and gut-feel decisions with a calm, connected
            operating system that works for every team in the business — and
            grows with them.
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Button
              variant="primary"
              size="lg"
              href="https://system.bizakerp.com/account/self-register"
              withArrow
            >
              Start a free trial
            </Button>
            <Button variant="outline" size="lg" href="#help">
              Help our mission
            </Button>
          </div>

          {/* Hero stats strip */}
          <div className="mt-14 grid w-full grid-cols-2 gap-x-6 gap-y-8 border-t border-bz-border pt-10 md:grid-cols-4">
            {HERO_STATS.map((s) => (
              <div
                key={s.label}
                className="flex flex-col items-center text-center md:items-start md:text-left"
              >
                <span className="text-[28px] font-bold tracking-[-0.02em] text-bz-text md:text-[32px]">
                  {s.value}
                </span>
                <span className="mt-1 text-[12px] uppercase tracking-[0.1em] text-bz-text-soft">
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}

// ─── Pillars ──────────────────────────────────────────────────────────────────

function PillarsSection() {
  return (
    <Section tone="white" pad="default">
      <Container>
        <SectionHeading
          eyebrow="What we're building"
          title="Three pillars hold up the mission."
          description="Bizak is engineered around three commitments to every operator who runs their business on it. Everything we ship has to serve at least one — and never compromise the others."
          maxWidth={760}
          className="mb-14"
        />

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {PILLARS.map(({ icon: PillarIcon, ...p }, i) => (
            <Card
              key={p.title}
              tone="light"
              pad="lg"
              hover="lift"
              className={i === 1 ? "border-bz-sage-mid" : ""}
            >
              <div className="flex items-start justify-between">
                <IconBadge size="lg" tone={i === 1 ? "accent" : "sage"}>
                  <PillarIcon className="size-5" strokeWidth={1.8} />
                </IconBadge>
                <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-bz-text-soft">
                  {p.eyebrow}
                </span>
              </div>

              <h3 className="mt-7 text-[24px] font-bold tracking-[-0.01em] text-bz-text">
                {p.title}
              </h3>
              <p className="mt-3 text-[14.5px] leading-[1.7] text-bz-text-muted">
                {p.description}
              </p>

              <ul className="mt-7 flex flex-col gap-2.5 border-t border-bz-border pt-6">
                {p.bullets.map((b) => (
                  <li
                    key={b}
                    className="flex items-start gap-2.5 text-[13.5px] leading-[1.55] text-bz-text"
                  >
                    <span
                      aria-hidden
                      className="mt-[7px] size-[6px] shrink-0 rounded-full bg-bz-sage"
                    />
                    {b}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}

// ─── Beliefs ──────────────────────────────────────────────────────────────────

function BeliefsSection() {
  return (
    <Section tone="light" pad="default">
      <Container>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[360px_1fr] lg:gap-16">
          {/* Left intro */}
          <div className="lg:sticky lg:top-[100px] lg:self-start">
            <Eyebrow>What we believe</Eyebrow>
            <h2 className="mt-3 text-[34px] font-bold leading-[1.1] tracking-[-0.02em] text-bz-text md:text-[40px]">
              The principles behind every decision we make.
            </h2>
            <p className="mt-5 text-[15.5px] leading-[1.7] text-bz-text-muted">
              When the work gets ambiguous, these are the beliefs we fall back
              on — in product trade-offs, in how we hire, in how we treat
              customers, and in how we measure whether we're winning.
            </p>
            <a
              href="/about"
              className="mt-7 inline-flex items-center gap-1.5 text-[13.5px] font-bold text-bz-sage transition-colors hover:text-bz-sage-hover"
            >
              Read our company story
              <ArrowUpRight className="size-[14px]" strokeWidth={2} />
            </a>
          </div>

          {/* Beliefs grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {BELIEFS.map(({ icon: BeliefIcon, ...b }, i) => (
              <div
                key={b.title}
                className="group flex flex-col rounded-bz-xl border border-bz-border bg-bz-surface p-7 transition-all duration-200 hover:-translate-y-[2px] hover:border-bz-sage-mid hover:shadow-[0_16px_40px_rgba(15,17,14,0.06)]"
              >
                <div className="flex items-center justify-between">
                  <IconBadge size="md" tone="sage">
                    <BeliefIcon className="size-[18px]" strokeWidth={1.8} />
                  </IconBadge>
                  <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-bz-text-soft">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="mt-6 text-[17px] font-bold tracking-[-0.01em] text-bz-text">
                  {b.title}
                </h3>
                <p className="mt-2.5 text-[14px] leading-[1.7] text-bz-text-muted">
                  {b.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}

// ─── Impact (dark) ────────────────────────────────────────────────────────────

function ImpactSection() {
  return (
    <Section tone="dark" pad="default">
      <Container>
        <SectionHeading
          eyebrow="The mission, in numbers"
          eyebrowTone="accent"
          title="A quiet kind of momentum."
          description="No marketing flourish — just the operators, the hours saved, and the businesses running better than they were last year. The numbers are the report card."
          tone="light"
          maxWidth={720}
          className="mb-14"
        />

        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {IMPACT_STATS.map((s) => (
            <div
              key={s.label}
              className="rounded-bz-xl border border-white/10 bg-white/[0.04] p-7"
            >
              <Stat value={s.value} label={s.label} tone="light" size="lg" />
            </div>
          ))}
        </div>

        {/* Customer quote */}
        <div className="mt-12 rounded-bz-2xl border border-white/10 bg-white/[0.04] p-10 md:p-14">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-[1fr_auto] md:items-center">
            <div className="max-w-[760px]">
              <Quote
                className="size-8 text-bz-accent"
                strokeWidth={1.6}
                aria-hidden
              />
              <p className="mt-6 text-[clamp(20px,2.2vw,28px)] font-medium leading-[1.45] tracking-[-0.01em] text-white">
                "We replaced four disconnected tools and a wall of spreadsheets
                with one platform. Month-end closes that took two weeks now
                wrap in three days — and our finance team finally has the
                evenings back."
              </p>
              <div className="mt-7 flex items-center gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-bz-accent/20 text-[15px] font-bold text-bz-accent">
                  AR
                </div>
                <div>
                  <div className="text-[14px] font-semibold text-white">
                    Anita R.
                  </div>
                  <div className="text-[12.5px] text-white/60">
                    CFO · mid-market manufacturer, 320 staff
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 md:items-end">
              <div className="flex items-center gap-1 text-bz-accent">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="size-[18px] fill-bz-accent"
                    strokeWidth={0}
                  />
                ))}
              </div>
              <span className="text-[12px] uppercase tracking-[0.12em] text-white/60">
                4.9 / 5 — Across 1,200+ reviews
              </span>
              <Button
                variant="ghostDark"
                size="md"
                href="/case-studies"
                withArrow
              >
                Read customer stories
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}

// ─── Help our mission ─────────────────────────────────────────────────────────

function HelpSection() {
  return (
    <Section tone="white" pad="default" id="help">
      <Container>
        <SectionHeading
          eyebrow="Help our mission"
          title="Six ways to walk this with us."
          description="Bizak's mission isn't a one-team project. Customers, partners, advocates, and teammates all push it forward — pick the one that fits where you are right now."
          maxWidth={760}
          className="mb-14"
        />

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {WAYS_TO_HELP.map(({ icon: WayIcon, ...w }) => (
            <Card
              key={w.title}
              tone="light"
              pad="lg"
              hover="lift"
              className={w.highlight ? "border-bz-sage-mid" : ""}
            >
              <div className="flex items-start justify-between">
                <IconBadge size="lg" tone={w.highlight ? "accent" : "sage"}>
                  <WayIcon className="size-5" strokeWidth={1.8} />
                </IconBadge>
                <PillBadge tone={w.highlight ? "accent" : "neutral"} dot={w.highlight}>
                  {w.tag}
                </PillBadge>
              </div>

              <h3 className="mt-7 text-[20px] font-bold tracking-[-0.01em] text-bz-text">
                {w.title}
              </h3>
              <p className="mt-3 text-[14.5px] leading-[1.7] text-bz-text-muted">
                {w.description}
              </p>

              <a
                href={w.href}
                className="mt-7 inline-flex items-center gap-1.5 text-[13.5px] font-bold text-bz-sage transition-colors hover:text-bz-sage-hover"
              >
                {w.cta}
                <ArrowRight className="size-[14px]" />
              </a>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}

// ─── Commitments (light) ──────────────────────────────────────────────────────

function CommitmentsSection() {
  return (
    <Section tone="light" pad="default">
      <Container width="narrow">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-20 lg:items-center">
          <div>
            <Eyebrow>Our promise</Eyebrow>
            <h2 className="mt-3 text-[clamp(28px,3.5vw,44px)] font-bold leading-[1.1] tracking-[-0.02em] text-bz-text">
              Four commitments we won't compromise on.
            </h2>
            <p className="mt-5 text-[15.5px] leading-[1.7] text-bz-text-muted">
              A mission isn't worth much without a contract behind it. These
              are the operating commitments every Bizak customer is owed —
              starting day one, lasting as long as you run on the platform.
            </p>
            <div className="mt-7">
              <Button variant="primary" size="md" href="/contact" withArrow>
                Talk to our team
              </Button>
            </div>
          </div>

          <ul className="flex flex-col">
            {COMMITMENTS.map((c, i) => (
              <li
                key={c.title}
                className="grid grid-cols-[auto_1fr] gap-5 border-b border-bz-border py-6 first:pt-0 last:border-b-0 last:pb-0"
              >
                <span className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-bz-md bg-bz-sage-soft text-[12.5px] font-bold tabular-nums text-bz-sage">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="text-[16.5px] font-bold tracking-[-0.01em] text-bz-text">
                    {c.title}
                  </h3>
                  <p className="mt-1.5 text-[14px] leading-[1.7] text-bz-text-muted">
                    {c.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </Section>
  );
}

// ─── Bottom CTA ───────────────────────────────────────────────────────────────

function BottomCta() {
  return (
    <Section tone="light" pad="default">
      <Container width="narrow">
        <div className="relative overflow-hidden rounded-bz-2xl border border-bz-border bg-bz-surface p-10 md:p-16">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-32 -top-32 h-[420px] w-[420px] rounded-full bg-bz-accent/10 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-24 -left-24 h-[320px] w-[320px] rounded-full bg-bz-sage/10 blur-3xl"
          />

          <div className="relative grid grid-cols-1 items-center gap-10 md:grid-cols-[1fr_auto]">
            <div>
              <PillBadge tone="sage" dot>
                Help our mission
              </PillBadge>
              <h2 className="mt-5 text-[clamp(28px,3.5vw,44px)] font-bold leading-[1.1] tracking-[-0.02em] text-bz-text">
                Help us rewrite how modern business runs.
              </h2>
              <p className="mt-4 max-w-[560px] text-[16px] leading-[1.7] text-bz-text-muted">
                Whether you run a five-person team or a five-thousand-person
                enterprise, we'd love to hear what's on your operating wishlist
                — and find the smallest, fastest way to help.
              </p>
            </div>
            <div className="flex flex-col gap-3 md:items-end">
              <Button variant="primary" size="lg" href="/contact" withArrow>
                Contact our team
              </Button>
              <Button
                variant="outline"
                size="lg"
                href="https://system.bizakerp.com/account/self-register"
              >
                Start a free trial
              </Button>
            </div>
          </div>

          <div className="relative mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-bz-border pt-7 text-[13px] text-bz-text-muted">
            {[
              { icon: Target, label: "Free implementation guidance" },
              { icon: Users, label: "Dedicated success partner" },
              { icon: ShieldCheck, label: "No credit card required" },
            ].map(({ icon: Tick, label }) => (
              <span key={label} className="inline-flex items-center gap-2">
                <Tick className="size-4 text-bz-sage" strokeWidth={1.8} />
                {label}
              </span>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function OurMissionPage() {
  return (
    <div>
      <Header />
      <main style={{ paddingTop: 76 }}>
        <HeroSection />
        <PillarsSection />
        <BeliefsSection />
        <ImpactSection />
        <HelpSection />
        <CommitmentsSection />
        <BottomCta />
      </main>
      <Footer />
    </div>
  );
}
