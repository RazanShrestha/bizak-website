import "../../styles/style.css";
import {
  ArrowRight,
  ArrowUpRight,
  Award,
  Briefcase,
  Compass,
  Globe2,
  Linkedin,
  Quote,
  Sparkles,
  Twitter,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { ImageWithFallback } from "./figma/ImageWithFallback";
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
  { value: "120+ yrs", label: "Combined leadership experience" },
  { value: "4", label: "Global hubs" },
  { value: "32", label: "Countries served" },
  { value: "18", label: "Industries operated in" },
];

type SocialLink = { label: string; href: string; icon: LucideIcon };

type Founder = {
  name: string;
  role: string;
  shortRole: string;
  image: string;
  bio: string;
  highlights: { value: string; label: string }[];
  social: SocialLink[];
  quote: string;
};

const FOUNDERS: Founder[] = [
  {
    name: "David Richardson",
    role: "Founder & Chief Executive Officer",
    shortRole: "Founder & CEO",
    image:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=900&q=80",
    bio: "David spent fifteen years running operations inside global manufacturers before starting Bizak in 2018. He founded the company on a single conviction that complexity should never be the cost of growth and still spends most weeks in the room with operators figuring out how to take more friction out of their day.",
    highlights: [
      { value: "15 yrs", label: "Operating leader before founding Bizak" },
      { value: "50K+", label: "Customers onboarded under his tenure" },
      { value: "32", label: "Countries on the platform today" },
    ],
    social: [
      { label: "LinkedIn", href: "#", icon: Linkedin },
      { label: "Twitter", href: "#", icon: Twitter },
    ],
    quote:
      "Efficiency is not a feature. It is the foundation every other decision rests on.",
  },
  {
    name: "Priya Khatiwada",
    role: "Co-founder & Chief Technology Officer",
    shortRole: "Co-founder & CTO",
    image:
      "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=900&q=80",
    bio: "Priya leads the engineering organisation that designed Bizak's unified ledger and the modular architecture beneath every product line. Before Bizak, she shipped large-scale financial systems for two of the world's largest banks. She believes the best architecture is the one operators never have to think about.",
    highlights: [
      { value: "200+", label: "Engineers across four hubs" },
      { value: "Zero", label: "Hours of unscheduled downtime in 2025" },
      { value: "9.4M", label: "Monthly transactions on the core engine" },
    ],
    social: [
      { label: "LinkedIn", href: "#", icon: Linkedin },
      { label: "Twitter", href: "#", icon: Twitter },
    ],
    quote:
      "We don't ship debt we ship infrastructure operators can trust for the next decade.",
  },
];

type Leader = {
  name: string;
  role: string;
  bio: string;
  image: string;
  location: string;
};

const LEADERSHIP: Leader[] = [
  {
    name: "Marcus Chen",
    role: "Chief Operating Officer",
    bio: "Runs the global operations function from implementation delivery to customer success across all four hubs.",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80",
    location: "Singapore",
  },
  {
    name: "Sara Lindqvist",
    role: "Chief Financial Officer",
    bio: "Brings two decades of CFO leadership at SaaS scale-ups; oversees finance, legal, and risk for the Bizak group.",
    image:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&q=80",
    location: "London",
  },
  {
    name: "Rohan Sharma",
    role: "Chief Product Officer",
    bio: "Translates operator pain into the Bizak roadmap. Twelve years in B2B product, four shipping ERPs at global scale.",
    image:
      "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=600&q=80",
    location: "Bengaluru",
  },
  {
    name: "Elena Rossi",
    role: "Chief Revenue Officer",
    bio: "Leads global go-to-market. Built and scaled enterprise revenue functions at three of the most-loved B2B brands.",
    image:
      "https://images.unsplash.com/photo-1589571894960-20bbe2828d0a?auto=format&fit=crop&w=600&q=80",
    location: "Milan",
  },
  {
    name: "James Whitford",
    role: "Chief Customer Officer",
    bio: "Owns the post-sale experience implementation, support, success and the renewal rate that follows from it.",
    image:
      "https://images.unsplash.com/photo-1552058544-f2b08422138a?auto=format&fit=crop&w=600&q=80",
    location: "New York",
  },
  {
    name: "Aiko Tanaka",
    role: "Chief People Officer",
    bio: "Designs how Bizak hires, grows, and retains the operators behind the platform. Twenty nationalities, one playbook.",
    image:
      "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=600&q=80",
    location: "Tokyo",
  },
  {
    name: "Daniel Okafor",
    role: "VP, Engineering",
    bio: "Leads the platform and infrastructure teams that keep Bizak running for 50,000+ businesses, every minute of every day.",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80",
    location: "Lagos",
  },
  {
    name: "Hannah Becker",
    role: "VP, Design",
    bio: "Owns the craft bar across product, marketing, and brand. Believes good design is what survives a long operating week.",
    image:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=600&q=80",
    location: "Berlin",
  },
];

type Principle = {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  description: string;
  bullets: string[];
};

const PRINCIPLES: Principle[] = [
  {
    icon: Compass,
    eyebrow: "Principle 01",
    title: "Operator-first thinking",
    description:
      "Every leader at Bizak has run a function finance, ops, support, engineering at scale before. Decisions get made next to the work, not from a distance.",
    bullets: [
      "Direct customer conversations every week",
      "Roadmap reviewed against real operator pain",
      "No leader more than two doors from production data",
    ],
  },
  {
    icon: Sparkles,
    eyebrow: "Principle 02",
    title: "High-trust autonomy",
    description:
      "We hire deeply experienced operators and we get out of their way. Teams own outcomes, set their own rituals, and ship without committee.",
    bullets: [
      "Outcomes set by the team that delivers them",
      "Decisions documented, not debated to death",
      "Annual leadership reviews that go both ways",
    ],
  },
  {
    icon: Globe2,
    eyebrow: "Principle 03",
    title: "Long-term decisions",
    description:
      "Quarterly noise is loud. We optimise for the next decade for the customer who'll still be on Bizak in 2035 and the engineer who'll still be proud of the codebase.",
    bullets: [
      "Architecture choices weighed in years, not sprints",
      "Capital allocated to compounding investments",
      "Compensation tied to multi-year customer outcomes",
    ],
  },
];

type Advisor = {
  name: string;
  role: string;
  background: string;
  initials: string;
};

const ADVISORS: Advisor[] = [
  {
    name: "Maya Hernandez",
    role: "Board Chair",
    background: "Former CEO, FieldOps Industries · 30+ yrs in industrial software",
    initials: "MH",
  },
  {
    name: "Dr. Anders Kjellberg",
    role: "Independent Director",
    background: "Operating Partner, Northrock Capital · Ex-CFO, two NYSE SaaS leaders",
    initials: "AK",
  },
  {
    name: "Renée Yamamoto",
    role: "Advisor Product",
    background: "Former CPO, Stripe Atlas · Built finance products used in 80+ countries",
    initials: "RY",
  },
  {
    name: "Olu Adebayo",
    role: "Advisor Go-to-Market",
    background: "Founder, Bridgepoint GTM · Scaled three category-defining B2B brands",
    initials: "OA",
  },
];

const FOOTPRINT: { city: string; region: string; team: string }[] = [
  { city: "London", region: "EMEA HQ", team: "Finance · GTM · Customer" },
  { city: "Singapore", region: "APAC HQ", team: "Operations · Implementation" },
  { city: "Bengaluru", region: "Engineering Hub", team: "Product · Platform · QA" },
  { city: "New York", region: "Americas Hub", team: "Customer · Partnerships" },
];

// ─── Hero ─────────────────────────────────────────────────────────────────────

function HeroSection() {
  return (
    <Section pad="hero" tone="light" className="biz-mesh overflow-hidden">
      <Container width="narrow" className="relative">
        <div className="flex flex-col items-center text-center">
          <HeroBadge>Leadership Team</HeroBadge>
          <h1 className="mt-4 max-w-[860px] text-[clamp(40px,5.5vw,68px)] font-bold leading-[1.05] tracking-[-0.03em] text-bz-text">
            The operators behind the{" "}
            <span className="relative inline-block">
              operating system
              <span className="absolute inset-x-0 bottom-1 -z-0 h-[10px] rounded-full bg-bz-accent/55" />
            </span>
            .
          </h1>
          <p className="mt-5 max-w-[660px] text-[17px] leading-[1.7] text-bz-text-muted">
            Bizak is led by people who have run the functions our customers run
            finance, operations, product, support at the size and pace of
            mid-market businesses worldwide. Meet the team setting the bar for
            how modern ERP gets built.
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Button variant="primary" size="lg" href="#executive-team" withArrow>
              Meet the team
            </Button>
            <Button variant="outline" size="lg" href="/careers">
              Join our team
            </Button>
          </div>

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

// ─── Founders ─────────────────────────────────────────────────────────────────

function FoundersSection() {
  return (
    <Section tone="white" pad="default">
      <Container>
        <SectionHeading
          eyebrow="Founders"
          title="The people who started Bizak."
          description="Two operators who'd lived the spreadsheet sprawl, decided enough was enough, and set out to build the platform they wished they'd had."
          maxWidth={760}
          className="mb-14"
        />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {FOUNDERS.map((f) => (
            <Card
              key={f.name}
              tone="light"
              pad="lg"
              className="group flex flex-col overflow-hidden p-0"
            >
              <div className="grid grid-cols-1 gap-0 sm:grid-cols-[200px_1fr]">
                <div className="relative aspect-[4/5] w-full overflow-hidden bg-bz-bg sm:aspect-auto">
                  <ImageWithFallback
                    src={f.image}
                    alt={f.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="flex flex-col p-7 md:p-8">
                  <PillBadge tone="sage" dot>
                    {f.shortRole}
                  </PillBadge>
                  <h3 className="mt-4 text-[24px] font-bold tracking-[-0.01em] text-bz-text">
                    {f.name}
                  </h3>
                  <p className="mt-1 text-[13.5px] font-medium text-bz-text-muted">
                    {f.role}
                  </p>
                  <p className="mt-4 text-[14.5px] leading-[1.7] text-bz-text-muted">
                    {f.bio}
                  </p>

                  <div className="mt-6 flex items-center gap-2">
                    {f.social.map(({ icon: SocialIcon, label, href }) => (
                      <a
                        key={label}
                        href={href}
                        aria-label={`${f.name} on ${label}`}
                        className="inline-flex size-9 items-center justify-center rounded-bz-md border border-bz-border bg-bz-surface text-bz-text-muted transition-colors hover:border-bz-sage-mid hover:bg-bz-sage-soft hover:text-bz-sage"
                      >
                        <SocialIcon className="size-[15px]" strokeWidth={1.8} />
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 border-t border-bz-border bg-bz-bg/60">
                {f.highlights.map((h) => (
                  <div
                    key={h.label}
                    className="flex flex-col gap-1 border-r border-bz-border px-5 py-5 last:border-r-0 sm:px-6"
                  >
                    <span className="text-[18px] font-bold tracking-[-0.01em] text-bz-text md:text-[20px]">
                      {h.value}
                    </span>
                    <span className="text-[11.5px] leading-[1.4] text-bz-text-soft">
                      {h.label}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex items-start gap-4 border-t border-bz-border px-7 py-6 md:px-8">
                <Quote
                  className="size-5 shrink-0 text-bz-sage"
                  strokeWidth={1.8}
                  aria-hidden
                />
                <p className="text-[14.5px] italic leading-[1.65] text-bz-text">
                  "{f.quote}"
                </p>
              </div>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}

// ─── Executive team ───────────────────────────────────────────────────────────

function ExecutiveTeamSection() {
  return (
    <Section tone="light" pad="default" id="executive-team">
      <Container>
        <SectionHeading
          eyebrow="Executive team"
          title="Operators leading every function."
          description="Across product, engineering, go-to-market, and customer experience eight leaders, four hubs, one shared bar for craft."
          maxWidth={760}
          className="mb-14"
        />

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {LEADERSHIP.map((l) => (
            <article
              key={l.name}
              className="group flex flex-col overflow-hidden rounded-bz-xl border border-bz-border bg-bz-surface transition-all duration-200 hover:-translate-y-[2px] hover:border-bz-sage-mid hover:shadow-[0_16px_40px_rgba(15,17,14,0.06)]"
            >
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-bz-bg">
                <ImageWithFallback
                  src={l.image}
                  alt={l.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                />
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                />
                <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-bz-pill bg-bz-surface/95 px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-[0.1em] text-bz-text-muted backdrop-blur-sm">
                  <span aria-hidden className="size-1.5 rounded-full bg-bz-sage" />
                  {l.location}
                </span>
              </div>

              <div className="flex flex-1 flex-col p-6">
                <h3 className="text-[17px] font-bold tracking-[-0.01em] text-bz-text">
                  {l.name}
                </h3>
                <p className="mt-1 text-[12.5px] font-semibold uppercase tracking-[0.08em] text-bz-sage">
                  {l.role}
                </p>
                <p className="mt-3 flex-1 text-[13.5px] leading-[1.65] text-bz-text-muted">
                  {l.bio}
                </p>

                <div className="mt-5 flex items-center justify-between border-t border-bz-border-soft pt-4">
                  <a
                    href="#"
                    aria-label={`${l.name} on LinkedIn`}
                    className="inline-flex size-8 items-center justify-center rounded-bz-md border border-bz-border bg-bz-surface text-bz-text-muted transition-colors hover:border-bz-sage-mid hover:bg-bz-sage-soft hover:text-bz-sage"
                  >
                    <Linkedin className="size-[14px]" strokeWidth={1.8} />
                  </a>
                  <span className="inline-flex items-center gap-1 text-[11.5px] font-bold uppercase tracking-[0.08em] text-bz-text-soft transition-colors group-hover:text-bz-sage">
                    Read profile
                    <ArrowUpRight className="size-[12px]" strokeWidth={2.2} />
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </Section>
  );
}

// ─── Principles ───────────────────────────────────────────────────────────────

function PrinciplesSection() {
  return (
    <Section tone="white" pad="default">
      <Container>
        <SectionHeading
          eyebrow="How we lead"
          title="Three principles behind every leadership decision."
          description="They aren't slogans on a wall. They are the tests we put every hire, every roadmap call, and every customer commitment through."
          maxWidth={760}
          className="mb-14"
        />

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {PRINCIPLES.map(({ icon: PrincipleIcon, ...p }, i) => (
            <Card
              key={p.title}
              tone="light"
              pad="lg"
              hover="lift"
              className={i === 1 ? "border-bz-sage-mid" : ""}
            >
              <div className="flex items-start justify-between">
                <IconBadge size="lg" tone={i === 1 ? "accent" : "sage"}>
                  <PrincipleIcon className="size-5" strokeWidth={1.8} />
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

// ─── Quote / Spotlight (dark) ─────────────────────────────────────────────────

function SpotlightSection() {
  return (
    <Section tone="dark" pad="default">
      <Container>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.2fr_1fr] lg:items-center lg:gap-16">
          <div>
            <Eyebrow tone="accent">From the CEO</Eyebrow>
            <Quote
              className="mt-6 size-9 text-bz-accent"
              strokeWidth={1.6}
              aria-hidden
            />
            <p className="mt-6 text-[clamp(22px,2.6vw,34px)] font-medium leading-[1.4] tracking-[-0.01em] text-white">
              "We didn't start Bizak because we wanted to build software. We
              started it because the operators we admired most were drowning in
              tools that should have been helping them. The job every day
              is to give them back their time, their clarity, and their nerve."
            </p>
            <div className="mt-9 flex items-center gap-4">
              <div className="size-12 overflow-hidden rounded-full border border-white/10 bg-white/[0.04]">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80"
                  alt="David Richardson"
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <div className="text-[14px] font-semibold text-white">
                  David Richardson
                </div>
                <div className="text-[12.5px] text-white/60">
                  Founder & CEO · Bizak
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { value: "97%", label: "Customer renewal rate" },
              { value: "4.9", label: "Customer satisfaction (5.0)" },
              { value: "8 wks", label: "Median time to first go-live" },
              { value: "120+", label: "Years of leadership experience" },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-bz-xl border border-white/10 bg-white/[0.04] p-7"
              >
                <Stat value={s.value} label={s.label} tone="light" size="md" />
              </div>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}

// ─── Advisors & Footprint ─────────────────────────────────────────────────────

function AdvisorsSection() {
  return (
    <Section tone="light" pad="default">
      <Container>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[360px_1fr] lg:gap-16">
          <div className="lg:sticky lg:top-[100px] lg:self-start">
            <Eyebrow>Board & advisors</Eyebrow>
            <h2 className="mt-3 text-[34px] font-bold leading-[1.1] tracking-[-0.02em] text-bz-text md:text-[40px]">
              The bench behind the bench.
            </h2>
            <p className="mt-5 text-[15.5px] leading-[1.7] text-bz-text-muted">
              An independent board and a hand-picked advisory group keep us
              honest on governance, customer outcomes, and long-term capital
              decisions. They've each run, scaled, or financed the kind of
              business we serve.
            </p>
            <a
              href="/about"
              className="mt-7 inline-flex items-center gap-1.5 text-[13.5px] font-bold text-bz-sage transition-colors hover:text-bz-sage-hover"
            >
              About Bizak's governance
              <ArrowUpRight className="size-[14px]" strokeWidth={2} />
            </a>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {ADVISORS.map((a, i) => (
              <Card
                key={a.name}
                tone="light"
                pad="lg"
                hover="lift"
                className="flex flex-col"
              >
                <div className="flex items-center justify-between">
                  <div className="flex size-12 items-center justify-center rounded-bz-lg bg-bz-sage-soft text-[14px] font-bold tracking-[-0.01em] text-bz-sage">
                    {a.initials}
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-bz-text-soft">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="mt-6 text-[17px] font-bold tracking-[-0.01em] text-bz-text">
                  {a.name}
                </h3>
                <p className="mt-1 text-[12.5px] font-semibold uppercase tracking-[0.08em] text-bz-sage">
                  {a.role}
                </p>
                <p className="mt-3 text-[14px] leading-[1.7] text-bz-text-muted">
                  {a.background}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}

// ─── Global footprint strip ───────────────────────────────────────────────────

function FootprintSection() {
  return (
    <Section tone="white" pad="compact">
      <Container>
        <div className="rounded-bz-2xl border border-bz-border bg-bz-bg/60 p-8 md:p-10">
          <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div className="max-w-[420px]">
              <Eyebrow>Global footprint</Eyebrow>
              <h3 className="mt-3 text-[22px] font-bold tracking-[-0.01em] text-bz-text md:text-[26px]">
                Four hubs. One leadership team.
              </h3>
              <p className="mt-3 text-[14.5px] leading-[1.7] text-bz-text-muted">
                Every region has a seat at the leadership table the team
                wakes up close to the customers it serves.
              </p>
            </div>

            <div className="grid flex-1 grid-cols-2 gap-4 md:max-w-[640px] md:grid-cols-4">
              {FOOTPRINT.map((f) => (
                <div
                  key={f.city}
                  className="rounded-bz-lg border border-bz-border bg-bz-surface p-5"
                >
                  <span className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-bz-text-soft">
                    {f.region}
                  </span>
                  <div className="mt-2 text-[16px] font-bold tracking-[-0.01em] text-bz-text">
                    {f.city}
                  </div>
                  <div className="mt-1 text-[12px] leading-[1.5] text-bz-text-muted">
                    {f.team}
                  </div>
                </div>
              ))}
            </div>
          </div>
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
                We're hiring
              </PillBadge>
              <h2 className="mt-5 text-[clamp(28px,3.5vw,44px)] font-bold leading-[1.1] tracking-[-0.02em] text-bz-text">
                Build the next chapter of Bizak with us.
              </h2>
              <p className="mt-4 max-w-[560px] text-[16px] leading-[1.7] text-bz-text-muted">
                We're hiring engineers, designers, implementation leads, and
                customer specialists across every hub. If you've ever wanted
                to build the system you wished your last company had this
                is the room.
              </p>
            </div>
            <div className="flex flex-col gap-3 md:items-end">
              <Button variant="primary" size="lg" href="/careers" withArrow>
                See open roles
              </Button>
              <Button variant="outline" size="lg" href="/contact">
                Talk to leadership
              </Button>
            </div>
          </div>

          <div className="relative mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-bz-border pt-7 text-[13px] text-bz-text-muted">
            {[
              { icon: Briefcase, label: "Roles in 4 global hubs" },
              { icon: Users, label: "20+ nationalities, one team" },
              { icon: Award, label: "Top-rated employer 2025" },
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

export function LeadershipTeamPage() {
  return (
    <div>
      <Header />
      <main>
        <HeroSection />
        <FoundersSection />
        <ExecutiveTeamSection />
        <PrinciplesSection />
        <SpotlightSection />
        <AdvisorsSection />
        <FootprintSection />
        <BottomCta />
      </main>
      <Footer />
    </div>
  );
}
