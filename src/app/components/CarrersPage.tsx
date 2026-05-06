import { useState } from "react";
import {
  ArrowUpRight,
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
import { Container, Section, SectionHeading, Button, Card, Stat, IconBadge, PillBadge } from "./marketing";
import { cn } from "./ui/utils";

const DEPT_BARS = [
  { name: "Engineering", count: 47, open: 5, pct: 94 },
  { name: "Product", count: 12, open: 3, pct: 60 },
  { name: "Go-to-Market", count: 28, open: 4, pct: 78 },
  { name: "Finance & Ops", count: 8, open: 2, pct: 40 },
  { name: "Customer Ops", count: 15, open: 2, pct: 55 },
];

const RECENT_JOINS = [
  { name: "Priya S.", role: "Senior Backend", days: 3 },
  { name: "Marcus W.", role: "Enterprise AE", days: 12 },
  { name: "Aiko N.", role: "Product Designer", days: 18 },
];

const VALUES: { num: string; title: string; body: string; Icon: LucideIcon }[] = [
  {
    num: "01",
    title: "Move with conviction",
    body: "We decide fast, commit fully, and course-correct with data — not committees. Velocity is a feature.",
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
  { Icon: DollarSign, label: "Competitive Salary", sub: "Top-of-market pay benchmarked quarterly" },
  { Icon: BarChart3,  label: "Equity Package",     sub: "Meaningful ownership in what you build" },
  { Icon: Globe,      label: "Remote-First",       sub: "Work from anywhere, always" },
  { Icon: Clock,      label: "Flexible Hours",     sub: "Async-first, no micromanagement" },
  { Icon: Heart,      label: "Health & Wellness",  sub: "Comprehensive medical, dental, vision" },
  { Icon: BookOpen,   label: "$2k Learning Budget", sub: "Books, courses, conferences — your call" },
  { Icon: Laptop,     label: "Home Office Stipend", sub: "$800 to set up your ideal workspace" },
  { Icon: MapPin,     label: "Team Retreats",      sub: "Annual global offsite, quarterly meetups" },
];

type Job = { title: string; type: string; location: string };
type Department = { dept: string; color: string; jobs: Job[] };

const OPEN_ROLES: Department[] = [
  {
    dept: "Engineering",
    color: "#4F8EF7",
    jobs: [
      { title: "Staff Frontend Engineer", type: "Full-time", location: "Remote" },
      { title: "Senior Backend Engineer", type: "Full-time", location: "Remote / Kathmandu" },
      { title: "Platform & DevOps Engineer", type: "Full-time", location: "Remote" },
      { title: "Senior Mobile Engineer (React Native)", type: "Full-time", location: "Remote" },
      { title: "Security Engineer", type: "Full-time", location: "Remote" },
    ],
  },
  {
    dept: "Product & Design",
    color: "#B57BF5",
    jobs: [
      { title: "Senior Product Manager — ERP Core", type: "Full-time", location: "Remote" },
      { title: "Senior Product Designer", type: "Full-time", location: "Remote" },
      { title: "UX Researcher", type: "Full-time", location: "Remote" },
    ],
  },
  {
    dept: "Go-to-Market",
    color: "#F5A623",
    jobs: [
      { title: "Enterprise Account Executive — APAC", type: "Full-time", location: "Singapore / Remote" },
      { title: "Senior Solutions Engineer", type: "Full-time", location: "Remote" },
      { title: "Head of Content & SEO", type: "Full-time", location: "Remote" },
      { title: "Sales Development Representative", type: "Full-time", location: "Remote" },
    ],
  },
  {
    dept: "Finance & Operations",
    color: "#3ECFAD",
    jobs: [
      { title: "Senior Financial Analyst", type: "Full-time", location: "Kathmandu / Remote" },
      { title: "Revenue Operations Manager", type: "Full-time", location: "Remote" },
    ],
  },
  {
    dept: "Customer Success",
    color: "#FF6B6B",
    jobs: [
      { title: "Senior Implementation Consultant", type: "Full-time", location: "Remote" },
      { title: "Customer Success Manager", type: "Full-time", location: "Remote" },
    ],
  },
];

const PROCESS_STEPS = [
  { num: "01", label: "Apply",       detail: "5 min",     desc: "Submit your application. No cover letter required — we value clarity over formality." },
  { num: "02", label: "Intro Call",  detail: "30 min",    desc: "A relaxed conversation with our recruiter. We want to understand your story and goals." },
  { num: "03", label: "Assessment",  detail: "3–5 days",  desc: "A focused take-home or live exercise relevant to your role. Fair, scoped, and paid." },
  { num: "04", label: "Team Rounds", detail: "2–3 hrs",   desc: "Meet the people you'd work with. Ask hard questions — we'll do the same." },
  { num: "05", label: "Offer",       detail: "48 hrs",    desc: "We move fast. Expect a clear, competitive offer with full transparency on equity." },
];

// ─── HERO ─────────────────────────────────────────────────────────────────────
function HeroSection() {
  const totalOpen = OPEN_ROLES.reduce((s, d) => s + d.jobs.length, 0);
  const totalTeam = DEPT_BARS.reduce((s, d) => s + d.count, 0);

  return (
    <Section tone="dark" pad="hero">
      <Container width="narrow" className="relative">
        <div className="grid gap-16 lg:gap-[64px] lg:grid-cols-[55fr_45fr] items-center">
          {/* Left */}
          <div>
            <PillBadge tone="accent" dot className="mb-8">
              {totalOpen} open roles · hiring now
            </PillBadge>

            <SectionHeading
              title={<>Build what the <span className="text-bz-accent">world runs on.</span></>}
              description="Bizak powers over 50,000 businesses across 120+ countries. Join the team making enterprise software feel effortless — and building the next chapter of global commerce."
              level="h1"
              tone="light"
              maxWidth={560}
            />

            <div className="mt-12 flex gap-4 flex-wrap">
              <Button variant="accent" size="lg" href="#open-roles" withArrow>
                View Open Roles
              </Button>
              <Button variant="ghostDark" size="lg" href="#culture">
                Our Culture
              </Button>
            </div>

            <div className="mt-14 pt-12 border-t border-white/10 flex gap-10">
              <Stat value={`${totalTeam}+`} label="Team members" tone="light" size="md" />
              <Stat value="120+" label="Countries" tone="light" size="md" />
              <Stat value={`${totalOpen}`} label="Open roles" tone="light" size="md" />
            </div>
          </div>

          {/* Right — Team Pulse panel */}
          <Card tone="dark" pad="md">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-white/35">
                  Team Pulse
                </div>
                <div className="text-[18px] font-bold mt-0.5">Live Headcount</div>
              </div>
              <PillBadge tone="live" dot>LIVE</PillBadge>
            </div>

            <div className="flex flex-col gap-3.5 mb-6">
              {DEPT_BARS.map((d) => (
                <div key={d.name}>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-[13px] font-medium text-white/70">{d.name}</span>
                    <div className="flex gap-3">
                      <span className="text-[12px] text-white/45">{d.count} total</span>
                      <span className="text-[12px] font-semibold text-bz-accent">{d.open} open</span>
                    </div>
                  </div>
                  <div className="h-1 bg-white/10 rounded-bz-pill overflow-hidden">
                    <div
                      className="h-full bg-bz-sage rounded-bz-pill"
                      style={{ width: `${d.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2.5 mb-5">
              {[
                { label: "Avg. time to hire", val: "18 days" },
                { label: "Offer acceptance", val: "94%" },
                { label: "Internal mobility", val: "38%" },
                { label: "Employee NPS", val: "72" },
              ].map((kpi) => (
                <div
                  key={kpi.label}
                  className="bg-white/[0.04] border border-white/10 rounded-bz-md px-3.5 py-3"
                >
                  <div className="text-[20px] font-bold">{kpi.val}</div>
                  <div className="text-[11px] text-white/40 mt-0.5">{kpi.label}</div>
                </div>
              ))}
            </div>

            <div className="border-t border-white/10 pt-4">
              <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-white/30 mb-3">
                Recently joined
              </div>
              {RECENT_JOINS.map((j, i) => (
                <div
                  key={j.name}
                  className={cn(
                    "flex items-center gap-2.5",
                    i < RECENT_JOINS.length - 1 && "mb-2.5",
                  )}
                >
                  <div
                    className="size-7 rounded-full flex items-center justify-center text-[12px] font-bold text-white shrink-0"
                    style={{ background: `hsl(${i * 120}, 55%, 50%)` }}
                  >
                    {j.name[0]}
                  </div>
                  <div className="flex-1">
                    <div className="text-[13px] font-medium">{j.name}</div>
                    <div className="text-[11px] text-white/40">{j.role}</div>
                  </div>
                  <div className="text-[11px] text-bz-accent">{j.days}d ago</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </Container>
    </Section>
  );
}

// ─── VALUES ───────────────────────────────────────────────────────────────────
function ValuesSection() {
  return (
    <Section id="culture" tone="white">
      <Container width="narrow">
        <SectionHeading
          eyebrow="Our Culture"
          title="Principles that shape how we work"
          description="We don't just ship software — we're building a company that attracts and keeps exceptional people. These aren't posters on a wall; they're the decisions we make every day."
          maxWidth={640}
          className="mb-16"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {VALUES.map(({ num, title, body, Icon }, i) => (
            <Card
              key={num}
              tone={i % 2 === 0 ? "soft" : "light"}
              pad="lg"
              hover="lift"
              className="relative overflow-hidden"
            >
              <span
                aria-hidden
                className="absolute -top-4 right-6 text-bz-sage/[0.07] font-black leading-none select-none pointer-events-none"
                style={{ fontSize: 120 }}
              >
                {num}
              </span>

              <IconBadge tone="sage" size="lg" className="mb-6">
                <Icon className="size-5" />
              </IconBadge>

              <div className="text-[22px] font-bold tracking-[-0.015em] text-bz-text mb-3">
                {title}
              </div>
              <p className="text-[15px] text-bz-text-muted leading-[1.7]">{body}</p>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}

// ─── BENEFITS ─────────────────────────────────────────────────────────────────
function BenefitsSection() {
  return (
    <Section tone="dark">
      <Container width="narrow" className="relative">
        <div className="flex flex-wrap items-end justify-between gap-10 mb-14">
          <SectionHeading
            eyebrow="Why Bizak"
            eyebrowTone="accent"
            title="Built-in perks, not an afterthought"
            tone="light"
            maxWidth={480}
          />
          <p className="text-[16px] text-white/50 leading-[1.7] max-w-[380px]">
            We invest in our people because building world-class software requires world-class conditions.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {BENEFITS.map(({ Icon, label, sub }) => (
            <Card key={label} tone="dark" pad="sm" hover="glow">
              <IconBadge tone="accent" size="md" className="mb-4">
                <Icon className="size-5" />
              </IconBadge>
              <div className="text-[14px] font-bold mb-1.5">{label}</div>
              <div className="text-[13px] text-white/45 leading-[1.5]">{sub}</div>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}

// ─── OPEN ROLES ───────────────────────────────────────────────────────────────
function OpenRolesSection() {
  const [activeDept, setActiveDept] = useState<string | null>(null);
  const displayed = activeDept ? OPEN_ROLES.filter((d) => d.dept === activeDept) : OPEN_ROLES;

  return (
    <Section id="open-roles" tone="light">
      <Container width="narrow">
        <div className="flex flex-wrap items-end justify-between gap-6 mb-12">
          <SectionHeading
            eyebrow="Open Roles"
            title="Find your next challenge"
          />

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveDept(null)}
              className={cn(
                "px-4 h-9 rounded-bz-pill border text-[13px] font-semibold transition-colors duration-150",
                activeDept === null
                  ? "bg-bz-sage text-white border-bz-sage"
                  : "bg-transparent text-bz-text-muted border-bz-border hover:bg-bz-bg",
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
                  onClick={() => setActiveDept((prev) => (prev === d.dept ? null : d.dept))}
                  className={cn(
                    "px-4 h-9 rounded-bz-pill border text-[13px] font-semibold transition-colors duration-150",
                    !isActive && "bg-transparent text-bz-text-muted border-bz-border hover:bg-bz-bg",
                  )}
                  style={
                    isActive
                      ? { borderColor: d.color, color: d.color, background: `${d.color}18` }
                      : undefined
                  }
                >
                  {d.dept}
                </button>
              );
            })}
          </div>
        </div>

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
                  <Card
                    key={job.title}
                    pad="sm"
                    className="flex items-center justify-between gap-4 hover:border-bz-sage/40 hover:shadow-[0_4px_20px_rgba(0,0,0,0.05)]"
                  >
                    <div className="flex-1">
                      <div className="text-[15px] font-bold text-bz-text mb-1">
                        {job.title}
                      </div>
                      <div className="flex gap-3 text-[12px] text-bz-text-muted">
                        <span>{job.type}</span>
                        <span className="self-center size-[3px] rounded-full bg-bz-border" />
                        <span>{job.location}</span>
                      </div>
                    </div>
                    <Button variant="primary" size="sm" href="/contact" withArrow>
                      Apply
                    </Button>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}

// ─── PROCESS ──────────────────────────────────────────────────────────────────
function ProcessSection() {
  return (
    <Section tone="white">
      <Container width="narrow">
        <SectionHeading
          eyebrow="Hiring Process"
          title="No mystery, no maze"
          description="We respect your time. Here's exactly what to expect from first click to signed offer."
          align="center"
          maxWidth={500}
          className="mb-20"
        />

        <div className="relative grid grid-cols-2 md:grid-cols-5 gap-y-10">
          {/* connector line (desktop only) */}
          <div
            aria-hidden
            className="hidden md:block absolute top-8 left-[10%] right-[10%] h-px bg-bz-border z-0"
          />

          {PROCESS_STEPS.map((step, i) => (
            <div
              key={step.num}
              className="relative z-10 flex flex-col items-center text-center px-3"
            >
              <div
                className={cn(
                  "size-16 rounded-full border-2 flex items-center justify-center mb-6 transition-colors duration-200",
                  i === 0
                    ? "bg-bz-deep border-bz-deep text-white"
                    : "bg-bz-surface border-bz-border text-bz-text",
                )}
              >
                <span className="text-[13px] font-bold tracking-[0.04em]">{step.num}</span>
              </div>
              <div className="text-[16px] font-bold text-bz-text mb-1">{step.label}</div>
              <PillBadge tone="sage" className="mb-3">{step.detail}</PillBadge>
              <p className="text-[13px] text-bz-text-muted leading-[1.6]">{step.desc}</p>
            </div>
          ))}
        </div>

        <Card tone="soft" pad="md" className="mt-20 flex flex-wrap items-center gap-5">
          <div className="size-10 rounded-full bg-bz-sage flex items-center justify-center shrink-0">
            <BadgeCheck className="size-5 text-white" />
          </div>
          <div className="flex-1 min-w-[260px]">
            <div className="text-[15px] font-bold text-bz-text mb-1">
              Our commitment to every candidate
            </div>
            <div className="text-[14px] text-bz-text-muted leading-[1.6]">
              You'll always hear back from us — even if it's a no. We share detailed feedback after every technical stage, and we'll never leave you ghosted or waiting more than 5 business days.
            </div>
          </div>
          <div className="flex gap-6 shrink-0">
            <Stat value="5" label="day response SLA" align="center" size="sm" />
            <Stat value="100%" label="feedback rate" align="center" size="sm" />
          </div>
        </Card>
      </Container>
    </Section>
  );
}

// ─── CTA ──────────────────────────────────────────────────────────────────────
function CTASection() {
  return (
    <Section tone="dark">
      <Container width="narrow" className="relative max-w-[900px] text-center">
        <PillBadge tone="accent" dot className="mb-8">
          Open to all backgrounds
        </PillBadge>

        <SectionHeading
          title={
            <>
              Don't see the right fit?{" "}
              <span className="text-bz-accent">We still want to hear from you.</span>
            </>
          }
          description="We're always looking for exceptional people. Send us a note about who you are and what you'd want to build — the right role might not exist yet."
          tone="light"
          align="center"
          maxWidth={580}
        />

        <div className="mt-12 flex gap-4 justify-center flex-wrap">
          <Button variant="accent" size="lg" href="/contact" withArrow>
            Send a speculative application
          </Button>
          <Button variant="ghostDark" size="lg" href="#open-roles">
            Browse open roles
          </Button>
        </div>

        <div className="mt-16 pt-7 border-t border-white/10 flex justify-center gap-12 flex-wrap">
          <Stat value="50,000+" label="businesses powered" tone="light" size="sm" align="center" />
          <Stat value="120+" label="countries" tone="light" size="sm" align="center" />
          <Stat value="4.9★" label="Glassdoor rating" tone="light" size="sm" align="center" />
          <Stat value="Remote" label="first culture" tone="light" size="sm" align="center" />
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
      <ProcessSection />
      <CTASection />
    </>
  );
}
