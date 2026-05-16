import { useState } from "react";
import {
  Rocket,
  GitMerge,
  Globe2,
  MessagesSquare,
  Compass,
  Repeat2,
  Banknote,
  HeartPulse,
  GraduationCap,
  Laptop,
  CalendarClock,
  Plane,
  ShieldCheck,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import {
  Section,
  Container,
  SectionHead,
  Heading,
  BadgeGreen,
  Pill,
  PillGroup,
  Bento,
  BentoGrid,
  BigCard,
  Marquee,
  StatusChip,
  StripeBar,
} from "./bz";
import { cn } from "./ui/utils";

// ─── DATA ─────────────────────────────────────────────────────────────────────

// The team scrolling teammate cards in the hero marquee.
const TEAM: { initials: string; name: string; role: string; city: string; flag: string }[] = [
  { initials: "AR", name: "Aanya Rao",        role: "Staff Engineer",     city: "Bengaluru",  flag: "🇮🇳" },
  { initials: "PS", name: "Prabin Shrestha",  role: "QA Engineer",        city: "Kathmandu",  flag: "🇳🇵" },
  { initials: "RT", name: "Riya Thapa",       role: "Product Designer",   city: "Pokhara",    flag: "🇳🇵" },
  { initials: "DM", name: "Dev Mehta",        role: "Engineering Lead",   city: "Mumbai",     flag: "🇮🇳" },
  { initials: "AH", name: "Anika Hossain",    role: "Product Manager",    city: "Dhaka",      flag: "🇧🇩" },
  { initials: "SF", name: "Sahil Fernando",   role: "Backend Engineer",   city: "Colombo",    flag: "🇱🇰" },
  { initials: "MK", name: "Maya Karki",       role: "Customer Success",   city: "Kathmandu",  flag: "🇳🇵" },
  { initials: "BS", name: "Bilal Siddiqui",   role: "Solutions Engineer", city: "Lahore",     flag: "🇵🇰" },
  { initials: "TS", name: "Tashi Sherpa",     role: "Account Executive",  city: "Thimphu",    flag: "🇧🇹" },
  { initials: "NB", name: "Nisha Bhandari",   role: "Data Engineer",      city: "Bengaluru",  flag: "🇮🇳" },
];

const RELEASE_ROWS = [
  { label: "Modules updated", value: "12"     },
  { label: "Regions live",    value: "South Asia" },
  { label: "Rollout time",    value: "4m 12s" },
  { label: "Manual steps",    value: "0"      },
];

const CULTURE: { Icon: LucideIcon; title: string; desc: string; tone: "paper" | "dark" | "fire" }[] = [
  {
    Icon: Globe2,
    title: "Remote-first, by design",
    desc: "No HQ, no second-class remote. We've been distributed since day one, so you work from wherever you think best.",
    tone: "paper",
  },
  {
    Icon: MessagesSquare,
    title: "Async over interrupt",
    desc: "Decisions live in writing, not in meetings you had to attend. Deep-work blocks are protected and timezones respected.",
    tone: "dark",
  },
  {
    Icon: Compass,
    title: "Ownership, not hierarchy",
    desc: "The person closest to the problem makes the call. Titles open doors; they don't win arguments.",
    tone: "fire",
  },
  {
    Icon: Repeat2,
    title: "Ship to learn",
    desc: "Small changes, shipped weekly, measured honestly. We correct course with data instead of debating it in a room.",
    tone: "paper",
  },
];

const BENEFITS: { Icon: LucideIcon; label: string; sub: string }[] = [
  { Icon: Banknote,      label: "Salary and equity",   sub: "Top-of-market pay, reviewed twice a year, with real ownership." },
  { Icon: HeartPulse,    label: "Health, fully covered", sub: "Medical, dental and vision for you and your family." },
  { Icon: CalendarClock, label: "Flexible time off",   sub: "Take the leave you need, on a 20-day floor, not a ceiling." },
  { Icon: Plane,         label: "Annual offsite",      sub: "The whole company together, somewhere new, once a year." },
];

type Job = { title: string; type: string; location: string };
type Team = { team: string; jobs: Job[] };

const OPEN_ROLES: Team[] = [
  {
    team: "Engineering",
    jobs: [
      { title: "Staff Frontend Engineer",               type: "Full-time", location: "Remote" },
      { title: "Senior Backend Engineer",               type: "Full-time", location: "Remote / Kathmandu" },
      { title: "Platform & DevOps Engineer",            type: "Full-time", location: "Remote" },
      { title: "Senior Mobile Engineer (React Native)", type: "Full-time", location: "Remote" },
      { title: "Security Engineer",                     type: "Full-time", location: "Remote" },
    ],
  },
  {
    team: "Product & Design",
    jobs: [
      { title: "Senior Product Manager, ERP Core", type: "Full-time", location: "Remote" },
      { title: "Senior Product Designer",          type: "Full-time", location: "Remote" },
      { title: "UX Researcher",                    type: "Full-time", location: "Remote" },
    ],
  },
  {
    team: "Go-to-Market",
    jobs: [
      { title: "Enterprise Account Executive, South Asia", type: "Full-time", location: "Kathmandu / Remote" },
      { title: "Senior Solutions Engineer",          type: "Full-time", location: "Remote" },
      { title: "Head of Content & SEO",              type: "Full-time", location: "Remote" },
      { title: "Sales Development Representative",   type: "Full-time", location: "Remote" },
    ],
  },
  {
    team: "Finance & Operations",
    jobs: [
      { title: "Senior Financial Analyst",   type: "Full-time", location: "Kathmandu / Remote" },
      { title: "Revenue Operations Manager", type: "Full-time", location: "Remote" },
    ],
  },
  {
    team: "Customer Success",
    jobs: [
      { title: "Senior Implementation Consultant", type: "Full-time", location: "Remote" },
      { title: "Customer Success Manager",         type: "Full-time", location: "Remote" },
    ],
  },
];

const TOTAL_ROLES = OPEN_ROLES.reduce((s, t) => s + t.jobs.length, 0);

const PROCESS: { n: string; label: string; duration: string; desc: string }[] = [
  { n: "1", label: "Application",     duration: "10 min",       desc: "Tell us about your work, not your life story. No cover letter, no twelve-field form." },
  { n: "2", label: "Intro call",      duration: "30 min",       desc: "A relaxed conversation about your story, your goals, and what you want to build next." },
  { n: "3", label: "Craft interview", duration: "Paid, scoped", desc: "A focused exercise on real, role-relevant work. Take-home or live, your call. We pay for your time." },
  { n: "4", label: "Meet the team",   duration: "2 to 3 hrs",   desc: "Sessions with the people you'd actually work with. Bring hard questions; we will too." },
  { n: "5", label: "Offer",           duration: "Within 48 hrs", desc: "A clear, transparent offer with a full breakdown of salary and equity. No pressure games." },
];

// ─── HERO ─────────────────────────────────────────────────────────────────────
// A scrolling strip of real teammates one remote team across South Asia, in motion.

function TeammateCard({ initials, name, role, city, flag }: (typeof TEAM)[number]) {
  return (
    <div className="flex w-[256px] shrink-0 flex-col gap-3.5 rounded-bz-xl border border-bz-line-soft bg-bz-surface p-4">
      <div className="flex items-center gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-bz-pill bg-bz-leaf text-[13px] font-semibold text-bz-deep">
          {initials}
        </span>
        <div className="min-w-0">
          <div className="truncate text-[13.5px] font-semibold text-bz-text">{name}</div>
          <div className="truncate text-[12px] text-bz-text-muted">{role}</div>
        </div>
      </div>
      <div className="flex items-center gap-1.5 border-t border-bz-line-soft pt-2.5 text-[12px] text-bz-text-muted">
        <span className="text-[13px] leading-none">{flag}</span>
        <span>{city}</span>
      </div>
    </div>
  );
}

function HeroSection() {
  return (
    <Section tone="b" pad="hero">
      <Container>
        <div className="flex flex-col items-center text-center">
          <BadgeGreen style={{ marginBottom: 28 }}>
            {TOTAL_ROLES} open roles · hiring across South Asia 🌏
          </BadgeGreen>
          <Heading level={2} style={{ marginBottom: 20 }}>
            Build what businesses{" "}
            <Heading.Muted>can't operate without.</Heading.Muted>
          </Heading>
          <p className="mb-9 max-w-[580px] text-[16px] leading-[1.7] text-bz-text-muted">
            Bizak runs finance, inventory and operations for growing businesses
            across South Asia. We're the remote-first team behind it, and
            we're growing fast.
          </p>
          <PillGroup>
            <Pill variant="dark" withArrowUpRight href="#open-roles">View open roles</Pill>
            <Pill variant="light" href="#life">Life at Bizak</Pill>
          </PillGroup>
        </div>

        <div className="bz-hero-visual">
          <Marquee speed="60s">
            {TEAM.map((t) => (
              <TeammateCard key={t.name} {...t} />
            ))}
          </Marquee>
        </div>
      </Container>
    </Section>
  );
}

// ─── 01 · THE WORK ────────────────────────────────────────────────────────────
// Why the work matters code here ships to the real economy.

function ReleaseImpactCard() {
  return (
    <div className="w-full max-w-[380px] rounded-bz-xl bg-bz-paper p-5 text-bz-text">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-bz-sm bg-bz-paper-warm">
            <Rocket size={15} strokeWidth={1.7} className="text-bz-text" />
          </span>
          <div>
            <div className="text-[12.5px] font-semibold leading-tight text-bz-text">
              Release v4.2.0
            </div>
            <div className="text-[10.5px] text-bz-text-muted">Production</div>
          </div>
        </div>
        <StatusChip variant="live">Shipped</StatusChip>
      </div>

      <div className="mt-4">
        <div className="mb-1.5 flex items-center justify-between text-[11px] text-bz-text-muted">
          <span>Rollout progress</span>
          <span className="font-semibold text-bz-text">100%</span>
        </div>
        <StripeBar pct={100} />
      </div>

      <div className="mt-4 flex flex-col gap-1.5">
        {RELEASE_ROWS.map((r) => (
          <div
            key={r.label}
            className="flex items-center justify-between rounded-bz-sm border border-bz-line-soft px-3 py-2"
          >
            <span className="text-[12px] text-bz-text-muted">{r.label}</span>
            <span className="text-[12.5px] font-semibold tabular-nums text-bz-text">
              {r.value}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-2 border-t border-bz-line-soft pt-3 text-[11.5px] text-bz-text-muted">
        <GitMerge size={13} className="text-bz-text" />
        Authored by 6 engineers. Merged 2 hours ago.
      </div>
    </div>
  );
}

function TheWorkSection() {
  return (
    <Section tone="a">
      <Container>
        <SectionHead
          index="01"
          label="The work"
          title={
            <>
              You won't be shipping{" "}
              <Heading.Muted>another disposable dashboard.</Heading.Muted>
            </>
          }
          description="Bizak is the ledger growing businesses trust with their money, their stock and their payroll. The work here is infrastructure: measured, owned end to end, and in production fast."
          titleMaxWidth={760}
        />

        <BigCard
          text={{
            title: "Code that reaches the real economy",
            body: "No staging-environment theatre. What you ship runs payroll, posts journals and moves inventory for real companies the moment it lands.",
            bullets: [
              "You scope it, build it, and run it. End to end.",
              "Weekly releases, with no change-freeze bureaucracy.",
              "On call for what you ship, backed by the whole team.",
            ],
            cta: {
              variant: "accent",
              withArrow: true,
              href: "#open-roles",
              children: "See open roles",
            },
          }}
          visual={<ReleaseImpactCard />}
        />
      </Container>
    </Section>
  );
}

// ─── 02 · LIFE AT BIZAK ───────────────────────────────────────────────────────

function LifeAtBizakSection() {
  return (
    <Section id="life" tone="b">
      <Container>
        <SectionHead
          index="02"
          label="Life at Bizak"
          title={
            <>
              A team built for{" "}
              <Heading.Muted>focus, not friction.</Heading.Muted>
            </>
          }
          description="We optimise for the conditions that let good people do their best work: autonomy, quiet, and trust."
        />

        <BentoGrid cols={4}>
          {CULTURE.map(({ Icon, title, desc, tone }) => {
            const iconColor = tone === "dark" ? "#DBE9B8" : "#1F3422";
            return (
              <Bento key={title} tone={tone} hover dotGrid={tone === "dark"}>
                <Bento.Header
                  title={title}
                  icon={<Icon size={24} strokeWidth={1.5} color={iconColor} />}
                />
                <Bento.Desc
                  className="mt-1"
                  style={tone === "fire" ? { color: "#1F3422", opacity: 0.78 } : undefined}
                >
                  {desc}
                </Bento.Desc>
              </Bento>
            );
          })}
        </BentoGrid>

        <div className="mt-4 rounded-bz-2xl border border-bz-line-soft bg-bz-paper p-7 md:p-9">
          <div className="mb-6 text-[12px] font-semibold uppercase tracking-[0.14em] text-bz-text-muted">
            Plus the essentials, properly handled
          </div>
          <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
            {BENEFITS.map(({ Icon, label, sub }) => (
              <div key={label} className="flex gap-3.5">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-bz-md bg-bz-leaf">
                  <Icon size={16} className="text-bz-text" />
                </span>
                <div className="min-w-0">
                  <div className="text-[14px] font-semibold text-bz-text">{label}</div>
                  <div className="mt-1 text-[13px] leading-[1.55] text-bz-text-muted">
                    {sub}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}

// ─── 03 · OPEN ROLES ──────────────────────────────────────────────────────────

function RoleRow({ job }: { job: Job }) {
  return (
    <a
      href="/contact"
      className="group flex items-center justify-between gap-4 rounded-bz-lg border border-bz-line-soft bg-bz-surface px-5 py-4 transition-colors duration-150 hover:border-bz-line"
    >
      <div className="min-w-0">
        <div className="text-[15px] font-semibold text-bz-text">{job.title}</div>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px] text-bz-text-muted">
          <span>{job.type}</span>
          <span className="size-[3px] rounded-bz-pill bg-bz-line" />
          <span>{job.location}</span>
        </div>
      </div>
      <ArrowRight
        size={18}
        className="shrink-0 text-bz-text-muted transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-bz-text"
      />
    </a>
  );
}

function OpenRolesSection() {
  const [activeTeam, setActiveTeam] = useState<string | null>(null);
  const displayed = activeTeam
    ? OPEN_ROLES.filter((t) => t.team === activeTeam)
    : OPEN_ROLES;

  const filters: (string | null)[] = [null, ...OPEN_ROLES.map((t) => t.team)];

  return (
    <Section id="open-roles" tone="a">
      <Container width="narrow">
        <SectionHead
          index="03"
          label="Open roles"
          title={
            <>
              Find the role with{" "}
              <Heading.Muted>your name on it.</Heading.Muted>
            </>
          }
          description="Remote, with a handful of hybrid options. Don't see your exact fit? We still want to hear from you."
        />

        <div className="mb-10 flex flex-wrap gap-2.5">
          {filters.map((f) => {
            const isActive = activeTeam === f;
            return (
              <button
                key={f ?? "all"}
                type="button"
                onClick={() => setActiveTeam(f)}
                className={cn(
                  "h-9 rounded-bz-sm border px-4 text-[13px] font-semibold transition-colors duration-150",
                  isActive
                    ? "border-bz-deep bg-bz-deep text-bz-text-on-dark"
                    : "border-bz-line bg-transparent text-bz-text-muted hover:bg-bz-section-b",
                )}
              >
                {f ?? "All teams"}
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-10">
          {displayed.map((group) => (
            <div key={group.team}>
              <div className="mb-4 flex items-center gap-3">
                <span className="text-[13px] font-semibold text-bz-text">
                  {group.team}
                </span>
                <span className="rounded-bz-sm bg-bz-section-b px-2 py-0.5 text-[11px] font-medium text-bz-text-muted">
                  {group.jobs.length} open
                </span>
              </div>
              <div className="flex flex-col gap-2.5">
                {group.jobs.map((job) => (
                  <RoleRow key={job.title} job={job} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}

// ─── 04 · HOW WE HIRE ─────────────────────────────────────────────────────────

function HiringSection() {
  return (
    <Section tone="b">
      <Container>
        <SectionHead
          index="04"
          label="How we hire"
          title={
            <>
              A process that{" "}
              <Heading.Muted>respects your time.</Heading.Muted>
            </>
          }
          description="Five steps, roughly two weeks, zero mystery. Here is exactly what to expect from first click to signed offer."
        />

        <div className="max-w-[720px]">
          <div className="flex flex-col">
            {PROCESS.map((step, i) => {
              const last = i === PROCESS.length - 1;
              return (
                <div key={step.n} className="flex gap-5 md:gap-7">
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        "grid size-11 shrink-0 place-items-center rounded-bz-pill border text-[14px] font-semibold",
                        last
                          ? "border-bz-fire bg-bz-fire text-bz-deep"
                          : "border-bz-line bg-bz-surface text-bz-text",
                      )}
                    >
                      {step.n}
                    </div>
                    {!last && <div className="my-1.5 w-px flex-1 bg-bz-line" />}
                  </div>
                  <div className={cn("min-w-0", last ? "pb-0" : "pb-9")}>
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h3 className="text-[17px] font-semibold text-bz-text">
                        {step.label}
                      </h3>
                      <span className="rounded-bz-sm bg-bz-leaf px-2 py-0.5 text-[11px] font-semibold text-bz-deep">
                        {step.duration}
                      </span>
                    </div>
                    <p className="mt-2 max-w-[520px] text-[14px] leading-[1.65] text-bz-text-muted">
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex items-start gap-4 rounded-bz-xl border border-bz-line bg-bz-section-a p-5 md:p-6">
            <span className="grid size-10 shrink-0 place-items-center rounded-bz-pill bg-bz-fire">
              <ShieldCheck size={18} className="text-bz-deep" />
            </span>
            <p className="text-[14px] leading-[1.65] text-bz-text">
              <strong className="font-semibold">You'll always hear back.</strong>{" "}
              Even when it's a no, you get a real answer within five business
              days, plus honest feedback after every interview stage.
            </p>
          </div>
        </div>
      </Container>
    </Section>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export function CareersPage() {
  return (
    <main>
      <HeroSection />
      <TheWorkSection />
      <LifeAtBizakSection />
      <OpenRolesSection />
      <HiringSection />
    </main>
  );
}
