import { useState } from "react";
import {
  Zap,
  Layers,
  BadgeCheck,
  Users,
  DollarSign,
  BarChart3,
  Globe,
  Clock,
  Heart,
  BookOpen,
  Laptop,
  MapPin,
  type LucideIcon,
} from "lucide-react";
import {
  Section,
  Container,
  SectionHead,
  Bento,
  BentoGrid,
  Pill,
  PillGroup,
  Heading,
  BadgeGreen,
  StatusChip,
} from "./bz";
import { cn } from "./ui/utils";

// ─── DATA ─────────────────────────────────────────────────────────────────────

const ACTIVITY_FEED: { Icon: LucideIcon; text: string; time: string }[] = [
  { Icon: Zap,        text: "v4.2 shipped to 50,000+ customers worldwide",      time: "just now" },
  { Icon: BadgeCheck, text: "PR merged automated close time reduced by 40%",  time: "12m ago"  },
  { Icon: Layers,     text: "Design review complete Inventory v2 approved",   time: "1h ago"   },
  { Icon: Globe,      text: "New enterprise customer onboarded in Singapore",    time: "2h ago"   },
  { Icon: Clock,      text: "Team standup wrapped async for the rest of day", time: "3h ago"   },
];

const CULTURE_PILLARS: { Icon: LucideIcon; title: string; desc: string }[] = [
  { Icon: Laptop,   title: "Remote-first",        desc: "Work from anywhere, always"      },
  { Icon: Clock,    title: "Async culture",        desc: "No 9-5, no micromanagement"      },
  { Icon: BookOpen, title: "$2k learning budget",  desc: "Books, courses, conferences"     },
  { Icon: Globe,    title: "120+ countries",       desc: "One global, diverse team"        },
];

const VALUES: { num: string; title: string; body: string; Icon: LucideIcon }[] = [
  {
    num: "01",
    title: "Move with conviction",
    body: "We decide fast, commit fully, and course-correct with data not committees. Velocity is a feature.",
    Icon: Zap,
  },
  {
    num: "02",
    title: "Think in systems",
    body: "Every problem lives inside a larger system. We understand the whole before optimising a part. Depth over hacks.",
    Icon: Layers,
  },
  {
    num: "03",
    title: "Own every outcome",
    body: "Responsibility doesn't stop at the handoff. We see things through, raise blockers early, and celebrate what ships.",
    Icon: BadgeCheck,
  },
  {
    num: "04",
    title: "Win as one team",
    body: "120 countries, one culture. We build bridges across timezones, functions, and backgrounds because the best ideas ignore org charts.",
    Icon: Users,
  },
];

const BENEFITS: { Icon: LucideIcon; label: string; sub: string }[] = [
  { Icon: DollarSign, label: "Competitive Salary",   sub: "Top-of-market pay benchmarked quarterly" },
  { Icon: BarChart3,  label: "Equity Package",        sub: "Meaningful ownership in what you build" },
  { Icon: Globe,      label: "Remote-First",          sub: "Work from anywhere, always" },
  { Icon: Clock,      label: "Flexible Hours",        sub: "Async-first, no micromanagement" },
  { Icon: Heart,      label: "Health & Wellness",     sub: "Comprehensive medical, dental, vision" },
  { Icon: BookOpen,   label: "$2k Learning Budget",   sub: "Books, courses, conferences your call" },
  { Icon: Laptop,     label: "Home Office Stipend",   sub: "$800 to set up your ideal workspace" },
  { Icon: MapPin,     label: "Team Retreats",         sub: "Annual global offsite, quarterly meetups" },
];

type Job = { title: string; type: string; location: string };
type Department = { dept: string; color: string; jobs: Job[] };

const OPEN_ROLES: Department[] = [
  {
    dept: "Engineering",
    color: "#4F8EF7",
    jobs: [
      { title: "Staff Frontend Engineer",               type: "Full-time", location: "Remote" },
      { title: "Senior Backend Engineer",               type: "Full-time", location: "Remote / Kathmandu" },
      { title: "Platform & DevOps Engineer",            type: "Full-time", location: "Remote" },
      { title: "Senior Mobile Engineer (React Native)", type: "Full-time", location: "Remote" },
      { title: "Security Engineer",                     type: "Full-time", location: "Remote" },
    ],
  },
  {
    dept: "Product & Design",
    color: "#B57BF5",
    jobs: [
      { title: "Senior Product Manager ERP Core", type: "Full-time", location: "Remote" },
      { title: "Senior Product Designer",           type: "Full-time", location: "Remote" },
      { title: "UX Researcher",                     type: "Full-time", location: "Remote" },
    ],
  },
  {
    dept: "Go-to-Market",
    color: "#F5A623",
    jobs: [
      { title: "Enterprise Account Executive APAC", type: "Full-time", location: "Singapore / Remote" },
      { title: "Senior Solutions Engineer",           type: "Full-time", location: "Remote" },
      { title: "Head of Content & SEO",               type: "Full-time", location: "Remote" },
      { title: "Sales Development Representative",    type: "Full-time", location: "Remote" },
    ],
  },
  {
    dept: "Finance & Operations",
    color: "#3ECFAD",
    jobs: [
      { title: "Senior Financial Analyst",   type: "Full-time", location: "Kathmandu / Remote" },
      { title: "Revenue Operations Manager", type: "Full-time", location: "Remote" },
    ],
  },
  {
    dept: "Customer Success",
    color: "#FF6B6B",
    jobs: [
      { title: "Senior Implementation Consultant", type: "Full-time", location: "Remote" },
      { title: "Customer Success Manager",         type: "Full-time", location: "Remote" },
    ],
  },
];

const PROCESS_STEPS = [
  { num: "01", label: "Apply",       detail: "5 min",    desc: "Submit your application. No cover letter required we value clarity over formality." },
  { num: "02", label: "Intro Call",  detail: "30 min",   desc: "A relaxed conversation with our recruiter. We want to understand your story and goals." },
  { num: "03", label: "Assessment",  detail: "3–5 days", desc: "A focused take-home or live exercise relevant to your role. Fair, scoped, and paid." },
  { num: "04", label: "Team Rounds", detail: "2–3 hrs",  desc: "Meet the people you'd work with. Ask hard questions we'll do the same." },
  { num: "05", label: "Offer",       detail: "48 hrs",   desc: "We move fast. Expect a clear, competitive offer with full transparency on equity." },
];

// ─── HERO MOCK ────────────────────────────────────────────────────────────────
// "Team Pulse" careers-specific dark panel with live headcount data,
// 2-column activity feed + culture pillars. No internal HR numbers.
// Sits directly on the section-b surface (no HeroCanvas wrapper).

function CulturePanelMock() {
  return (
    <div className="bz-hero-visual mx-auto w-full max-w-[1040px] rounded-bz-2xl border border-bz-line-soft bg-bz-olive overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-5 pb-4 flex items-center justify-between border-b border-white/[0.08]">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-bz-text-on-dark-muted">
            Bizak Team
          </div>
          <div className="text-[16px] font-semibold text-bz-text-on-dark mt-0.5">
            Remote · Async · Always shipping
          </div>
        </div>
        <StatusChip variant="live">Hiring now</StatusChip>
      </div>

      {/* 2-column body */}
      <div className="grid grid-cols-1 md:grid-cols-[3fr_2fr]">
        {/* Activity feed */}
        <div className="px-6 py-5">
          <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-bz-text-on-dark-muted mb-4">
            Today's highlights
          </div>
          <div className="flex flex-col">
            {ACTIVITY_FEED.map(({ Icon, text, time }, i) => (
              <div
                key={i}
                className={cn(
                  "flex items-center gap-3 py-3",
                  i < ACTIVITY_FEED.length - 1 && "border-b border-white/[0.06]"
                )}
              >
                <div className="w-7 h-7 rounded-full bg-white/[0.06] flex items-center justify-center shrink-0">
                  <Icon size={13} className="text-bz-fire" />
                </div>
                <div className="flex-1 min-w-0 text-[13px] text-bz-text-on-dark-muted leading-[1.4]">
                  {text}
                </div>
                <div className="text-[11px] text-bz-text-on-dark-soft shrink-0 pl-3">
                  {time}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Culture pillars */}
        <div className="px-6 py-5 border-t border-white/[0.08] md:border-t-0 md:border-l border-white/[0.08]">
          <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-bz-text-on-dark-muted mb-4">
            Life at Bizak
          </div>
          <div className="flex flex-col gap-4">
            {CULTURE_PILLARS.map(({ Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-bz-md bg-bz-fire-soft flex items-center justify-center shrink-0">
                  <Icon size={14} className="text-bz-fire" />
                </div>
                <div className="min-w-0">
                  <div className="text-[13px] font-semibold text-bz-text-on-dark">{title}</div>
                  <div className="text-[12px] text-bz-text-on-dark-muted mt-0.5">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SECTIONS ─────────────────────────────────────────────────────────────────

function HeroSection() {
  const totalOpen = OPEN_ROLES.reduce((s, d) => s + d.jobs.length, 0);

  return (
    <Section tone="b" pad="hero">
      <Container>
        <div className="flex flex-col items-center text-center">
          <BadgeGreen style={{ marginBottom: 28 }}>
            {totalOpen} open roles · hiring now
          </BadgeGreen>
          <Heading level={2} style={{ marginBottom: 16 }}>
            Build what the{" "}
            <Heading.Muted>world runs on.</Heading.Muted>
          </Heading>
          <p className="text-[16px] text-bz-text-muted leading-[1.7] max-w-[560px] mb-10">
            Bizak powers 50,000+ businesses across 120+ countries. Join the team making enterprise software feel effortless and building the next chapter of global commerce.
          </p>
          <PillGroup>
            <Pill variant="dark" withArrow href="#open-roles">View Open Roles</Pill>
            <Pill variant="light" withArrow href="#culture">Our Culture</Pill>
          </PillGroup>
        </div>
        <CulturePanelMock />
      </Container>
    </Section>
  );
}

function ValuesSection() {
  return (
    <Section id="culture" tone="a">
      <Container>
        <SectionHead
          index="01"
          label="Our Culture"
          title={
            <>
              Principles that shape{" "}
              <Heading.Muted>how we work.</Heading.Muted>
            </>
          }
          description="We don't just ship software we're building a company that attracts and keeps exceptional people. These aren't posters on a wall; they're the decisions we make every day."
        />
        <BentoGrid cols={2}>
          {VALUES.map(({ num, title, body, Icon }) => (
            <Bento key={num} tone="paper" hover className="relative overflow-hidden">
              <span
                aria-hidden
                className="absolute -top-3 right-4 text-[120px] font-black leading-none select-none pointer-events-none text-bz-text opacity-[0.04]"
              >
                {num}
              </span>
              <div className="flex flex-col gap-5">
                <div className="w-10 h-10 rounded-bz-lg bg-bz-fire-soft flex items-center justify-center shrink-0">
                  <Icon size={18} className="text-bz-text" />
                </div>
                <h3 className="text-[20px] font-bold text-bz-text tracking-[-0.01em]">
                  {title}
                </h3>
                <p className="text-[14px] text-bz-text-muted leading-[1.7]">{body}</p>
              </div>
            </Bento>
          ))}
        </BentoGrid>
      </Container>
    </Section>
  );
}

function BenefitsSection() {
  return (
    <Section tone="b">
      <Container>
        <SectionHead
          index="02"
          label="Why Bizak"
          title={
            <>
              Built for the people{" "}
              <Heading.Muted>who build it.</Heading.Muted>
            </>
          }
          description="We invest in our people because building world-class software requires world-class conditions."
        />
        <BentoGrid cols={4}>
          {BENEFITS.map(({ Icon, label, sub }) => (
            <Bento key={label} tone="paper" hover minHeight={160}>
              <div className="flex flex-col gap-3">
                <div className="w-9 h-9 rounded-bz-lg bg-bz-leaf flex items-center justify-center shrink-0">
                  <Icon size={16} className="text-bz-text" />
                </div>
                <div className="text-[14px] font-bold text-bz-text">{label}</div>
                <div className="text-[13px] text-bz-text-muted leading-[1.55]">{sub}</div>
              </div>
            </Bento>
          ))}
        </BentoGrid>
      </Container>
    </Section>
  );
}

function OpenRolesSection() {
  const [activeDept, setActiveDept] = useState<string | null>(null);
  const displayed = activeDept
    ? OPEN_ROLES.filter((d) => d.dept === activeDept)
    : OPEN_ROLES;

  return (
    <Section id="open-roles" tone="a">
      <Container width="narrow">
        <SectionHead
          index="03"
          label="Open Roles"
          title={
            <>
              Find your next{" "}
              <Heading.Muted>challenge.</Heading.Muted>
            </>
          }
          actions={
            <>
              <button
                type="button"
                onClick={() => setActiveDept(null)}
                className={cn(
                  "px-4 h-9 rounded-bz-pill border text-[13px] font-semibold transition-colors duration-150",
                  activeDept === null
                    ? "bg-bz-deep text-bz-text-on-dark border-bz-deep"
                    : "bg-transparent text-bz-text-muted border-bz-line hover:bg-bz-section-b"
                )}
              >
                All
              </button>
              {OPEN_ROLES.map((d) => {
                const isActive = activeDept === d.dept;
                return (
                  <button
                    key={d.dept}
                    type="button"
                    onClick={() =>
                      setActiveDept((prev) => (prev === d.dept ? null : d.dept))
                    }
                    className={cn(
                      "px-4 h-9 rounded-bz-pill border text-[13px] font-semibold transition-colors duration-150",
                      !isActive &&
                        "bg-transparent text-bz-text-muted border-bz-line hover:bg-bz-section-b"
                    )}
                    style={
                      isActive
                        ? {
                            borderColor: d.color,
                            color: d.color,
                            background: `${d.color}18`,
                          }
                        : undefined
                    }
                  >
                    {d.dept}
                  </button>
                );
              })}
            </>
          }
        />

        <div className="flex flex-col gap-8">
          {displayed.map((group) => (
            <div key={group.dept}>
              <div className="flex items-center gap-3 mb-4">
                <span
                  className="size-2.5 rounded-full shrink-0"
                  style={{ background: group.color }}
                />
                <span className="text-[13px] font-bold text-bz-text tracking-[0.02em]">
                  {group.dept}
                </span>
                <span className="text-[12px] text-bz-text-muted">
                  {group.jobs.length} roles
                </span>
              </div>

              <div className="flex flex-col gap-2.5">
                {group.jobs.map((job) => (
                  <div
                    key={job.title}
                    className="flex items-center justify-between gap-4 px-5 py-4 rounded-bz-lg border border-bz-line-soft bg-bz-surface hover:border-bz-line transition-colors duration-150"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-[15px] font-bold text-bz-text mb-1">
                        {job.title}
                      </div>
                      <div className="flex gap-3 flex-wrap text-[12px] text-bz-text-muted">
                        <span>{job.type}</span>
                        <span className="hidden sm:block self-center size-[3px] rounded-full bg-bz-line" />
                        <span>{job.location}</span>
                      </div>
                    </div>
                    <Pill variant="dark" size="sm" href="/contact">
                      Apply
                    </Pill>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}

function HiringProcessSection() {
  return (
    <Section tone="b">
      <Container width="narrow">
        <SectionHead
          index="04"
          label="Hiring Process"
          title={
            <>
              No mystery,{" "}
              <Heading.Muted>no maze.</Heading.Muted>
            </>
          }
          description="We respect your time. Here's exactly what to expect from first click to signed offer."
        />

        <div className="relative grid grid-cols-1 md:grid-cols-5 gap-y-10">
          <div
            aria-hidden
            className="hidden md:block absolute top-8 left-[10%] right-[10%] h-px bg-bz-line z-0"
          />
          {PROCESS_STEPS.map((step, i) => (
            <div
              key={step.num}
              className="relative z-10 flex flex-col items-center text-center px-2"
            >
              <div
                className={cn(
                  "size-16 rounded-full border-2 flex items-center justify-center mb-5",
                  i === 0
                    ? "bg-bz-deep border-bz-deep text-bz-text-on-dark"
                    : "bg-bz-section-a border-bz-line text-bz-text"
                )}
              >
                <span className="text-[13px] font-bold tracking-[0.04em]">
                  {step.num}
                </span>
              </div>
              <div className="text-[15px] font-bold text-bz-text mb-1.5">
                {step.label}
              </div>
              <span className="inline-flex items-center rounded-bz-pill bg-bz-leaf px-3 py-0.5 text-[11px] font-semibold text-bz-text mb-3">
                {step.detail}
              </span>
              <p className="text-[13px] text-bz-text-muted leading-[1.6]">
                {step.desc}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col sm:flex-row items-start sm:items-center gap-5 p-6 rounded-bz-xl border border-bz-line bg-bz-section-a">
          <div className="size-10 rounded-full bg-bz-fire flex items-center justify-center shrink-0">
            <BadgeCheck className="size-5 text-bz-deep" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[15px] font-bold text-bz-text mb-1">
              Our commitment to every candidate
            </div>
            <div className="text-[14px] text-bz-text-muted leading-[1.6]">
              You'll always hear back from us even if it's a no. We share detailed feedback after every technical stage and won't leave you waiting more than 5 business days.
            </div>
          </div>
          <div className="flex gap-6 shrink-0">
            <div className="text-center">
              <div className="text-[22px] font-bold text-bz-text leading-none">5</div>
              <div className="text-[12px] text-bz-text-muted mt-1">day response SLA</div>
            </div>
            <div className="text-center">
              <div className="text-[22px] font-bold text-bz-text leading-none">100%</div>
              <div className="text-[12px] text-bz-text-muted mt-1">feedback rate</div>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export function CareersPage() {
  return (
    <>
      <HeroSection />
      <ValuesSection />
      <BenefitsSection />
      <OpenRolesSection />
      <HiringProcessSection />
    </>
  );
}
