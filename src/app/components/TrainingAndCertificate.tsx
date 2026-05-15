import { useMemo, useState } from "react";
import "../../styles/style.css";
import {
  ArrowRight,
  Award,
  BadgeCheck,
  BookOpen,
  Calendar,
  Clock3,
  Compass,
  Factory,
  FileSpreadsheet,
  Filter,
  GraduationCap,
  Languages,
  Linkedin,
  PlayCircle,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Star,
  Trophy,
  Users,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import { cn } from "./ui/utils";
import {
  BadgeGreen,
  Bento,
  BentoGrid,
  BigCard,
  Carousel,
  Container,
  DotGrid,
  Eyebrow,
  Heading,
  Pill,
  PillGroup,
  Section,
  SectionHead,
  StatusChip,
  StripeBar,
  Tick,
} from "./bz";

// ════════════════════════════════════════════════════════════════════════════
// TYPES exported shapes consumed by EnrollmentPage. Do not rename.
// ════════════════════════════════════════════════════════════════════════════

export type TrackKey =
  | "all"
  | "foundations"
  | "finance"
  | "operations"
  | "manufacturing"
  | "admin"
  | "developer";

export type Format = "Self-paced" | "Live cohort" | "Workshop";

export type Level = "Foundational" | "Intermediate" | "Advanced";

export type Course = {
  slug: string;
  track: Exclude<TrackKey, "all">;
  format: Format;
  level: Level;
  title: string;
  description: string;
  duration: string;
  modules: number;
  cert: string;
  language: "English" | "Multi-lingual";
  popular?: boolean;
  price?: string;
};

export type Cohort = {
  slug: string;
  date: string;
  title: string;
  format: string;
  instructor: string;
  seats: string;
  startsAt: string;
  price: string;
};

// ════════════════════════════════════════════════════════════════════════════
// CONTENT DATA
// ════════════════════════════════════════════════════════════════════════════

const TRACKS: { key: TrackKey; label: string; icon: LucideIcon }[] = [
  { key: "all",           label: "All courses",   icon: BookOpen        },
  { key: "foundations",   label: "Foundations",   icon: Compass         },
  { key: "finance",       label: "Finance",       icon: FileSpreadsheet },
  { key: "operations",    label: "Operations",    icon: Workflow        },
  { key: "manufacturing", label: "Manufacturing", icon: Factory         },
  { key: "admin",         label: "Administration",icon: Settings2       },
  { key: "developer",     label: "Developer",     icon: Sparkles        },
];

const FORMATS: Format[] = ["Self-paced", "Live cohort", "Workshop"];

// ── Hero credential fields (sample data inside a product mock) ───────────────

const CERT_FIELDS: { label: string; value: string }[] = [
  { label: "Issued",        value: "12 May 2026"    },
  { label: "Valid until",   value: "12 May 2028"    },
  { label: "Exam score",    value: "94 / 100"       },
  { label: "Credential ID", value: "BZK-2026-04812" },
];

// ── Learning paths the four guided journeys ─────────────────────────────────

type Path = {
  audience: string;
  title: string;
  description: string;
  duration: string;
  modules: string;
  level: Level;
  certName: string;
  icon: LucideIcon;
  popular?: boolean;
};

const PATHS: Path[] = [
  {
    audience: "For new operators",
    title: "Bizak Foundations",
    description:
      "The shared mental model every Bizak user needs modules, navigation, and the daily workflows behind a clean operating week.",
    duration: "5 hours",
    modules: "8 modules",
    level: "Foundational",
    certName: "Certified User",
    icon: Compass,
    popular: true,
  },
  {
    audience: "For finance teams",
    title: "Finance Practitioner",
    description:
      "Master the close, reconciliations and consolidated reporting the daily, monthly and quarterly cadence of a modern finance team.",
    duration: "12 hours",
    modules: "14 modules",
    level: "Intermediate",
    certName: "Finance Practitioner",
    icon: FileSpreadsheet,
  },
  {
    audience: "For ops & supply chain",
    title: "Operations Specialist",
    description:
      "Inventory accuracy, multi-warehouse, purchasing and the workflows that keep stock and orders honest day to day.",
    duration: "10 hours",
    modules: "11 modules",
    level: "Intermediate",
    certName: "Operations Specialist",
    icon: Workflow,
  },
  {
    audience: "For platform admins",
    title: "Solution Architect",
    description:
      "Configure roles, approvals, automations and integrations the full administration toolkit for the people who own the tenant.",
    duration: "18 hours",
    modules: "16 modules",
    level: "Advanced",
    certName: "Certified Solution Architect",
    icon: Settings2,
  },
];

// ── Certification ladder ─────────────────────────────────────────────────────

type Tier = {
  level: string;
  badge: LucideIcon;
  title: string;
  description: string;
  exam: string;
  prereq: string;
  outcomes: string[];
};

const TIERS: Tier[] = [
  {
    level: "Level 1",
    badge: BadgeCheck,
    title: "Certified User",
    description:
      "Confirms day-one fluency with Bizak's modules, navigation and the workflows the average operator runs every week.",
    exam: "60-minute exam",
    prereq: "Bizak Foundations",
    outcomes: [
      "Run daily workflows independently",
      "Read standard reports and dashboards",
      "Operate Bizak on mobile and desktop",
    ],
  },
  {
    level: "Level 2",
    badge: Trophy,
    title: "Practitioner",
    description:
      "Role-based mastery in Finance, Operations, Sales or Manufacturing deep workflow competence in your domain.",
    exam: "90-minute scenario exam",
    prereq: "Certified User + a role track",
    outcomes: [
      "Lead a workstream in your function",
      "Configure module-level workflows",
      "Coach peers through complex tasks",
    ],
  },
  {
    level: "Level 3",
    badge: Award,
    title: "Solution Architect",
    description:
      "The expert credential confirms you can architect, harden and tune a multi-entity Bizak tenant end to end.",
    exam: "Two-part exam · 4 hours",
    prereq: "Practitioner in two tracks",
    outcomes: [
      "Design integrations and automations",
      "Manage tenant security and compliance",
      "Lead multi-entity rollouts independently",
    ],
  },
];

// ── Course catalogue ─────────────────────────────────────────────────────────

export const COURSES: Course[] = [
  {
    slug: "platform-tour",
    track: "foundations",
    format: "Self-paced",
    level: "Foundational",
    title: "The Bizak platform tour",
    description: "Your guided thirty-minute orientation modules, navigation, and the operator's mental model.",
    duration: "32 min",
    modules: 4,
    cert: "Counts toward Certified User",
    language: "Multi-lingual",
    popular: true,
  },
  {
    slug: "daily-workflows",
    track: "foundations",
    format: "Self-paced",
    level: "Foundational",
    title: "Daily workflows for new operators",
    description: "The five workflows every Bizak user touches in their first week invoices, orders, expenses, transfers, reports.",
    duration: "1 h 20 min",
    modules: 5,
    cert: "Counts toward Certified User",
    language: "Multi-lingual",
  },
  {
    slug: "mobile-essentials",
    track: "foundations",
    format: "Self-paced",
    level: "Foundational",
    title: "Bizak on mobile essentials",
    description: "Approve, scan and update on the go. Built for managers, sales reps and warehouse teams who don't sit at a desk.",
    duration: "45 min",
    modules: 3,
    cert: "Counts toward Certified User",
    language: "English",
  },
  {
    slug: "five-day-close",
    track: "finance",
    format: "Live cohort",
    level: "Intermediate",
    title: "Closing the books in five days",
    description: "The cadence, the controls and the Bizak features that compress month-end from weeks to days.",
    duration: "6 weeks · 2h / wk",
    modules: 6,
    cert: "Counts toward Finance Practitioner",
    language: "English",
    popular: true,
  },
  {
    slug: "ar-ap-mastery",
    track: "finance",
    format: "Self-paced",
    level: "Intermediate",
    title: "AR & AP mastery",
    description: "Invoice-to-cash and bill-to-pay end to end including discounts, credit notes and aging analysis.",
    duration: "3 h 40 min",
    modules: 8,
    cert: "Counts toward Finance Practitioner",
    language: "Multi-lingual",
  },
  {
    slug: "consolidation",
    track: "finance",
    format: "Workshop",
    level: "Advanced",
    title: "Multi-entity consolidation",
    description: "Hands-on workshop: intercompany rules, FX revaluation and a one-click consolidated P&L.",
    duration: "2-day workshop",
    modules: 10,
    cert: "Required for Solution Architect",
    language: "English",
  },
  {
    slug: "inventory-essentials",
    track: "operations",
    format: "Self-paced",
    level: "Foundational",
    title: "Inventory essentials",
    description: "Stock movements, locations and the daily transactions every inventory team performs in Bizak.",
    duration: "2 h 10 min",
    modules: 6,
    cert: "Counts toward Operations Specialist",
    language: "Multi-lingual",
  },
  {
    slug: "multi-warehouse",
    track: "operations",
    format: "Live cohort",
    level: "Intermediate",
    title: "Multi-warehouse operations",
    description: "Bins, transfers, 3PL handoffs and the cycle-count playbook that keeps stock accurate across sites.",
    duration: "4 weeks · 90 min / wk",
    modules: 8,
    cert: "Counts toward Operations Specialist",
    language: "English",
  },
  {
    slug: "production-planning",
    track: "manufacturing",
    format: "Self-paced",
    level: "Intermediate",
    title: "Production planning fundamentals",
    description: "Work orders, BOMs, routings and how Bizak schedules across a multi-line production environment.",
    duration: "3 h",
    modules: 7,
    cert: "Counts toward Manufacturing Practitioner",
    language: "English",
  },
  {
    slug: "real-time-oee",
    track: "manufacturing",
    format: "Workshop",
    level: "Advanced",
    title: "Standing up real-time OEE",
    description: "Wire shop-floor signals, define A × P × Q and publish your first live OEE dashboard.",
    duration: "1-day workshop",
    modules: 5,
    cert: "Required for Manufacturing Practitioner",
    language: "English",
    popular: true,
  },
  {
    slug: "roles-permissions",
    track: "admin",
    format: "Self-paced",
    level: "Intermediate",
    title: "Roles, permissions & approvals",
    description: "Build a role library, configure approval matrices and lock down sensitive workflows without slowing the team.",
    duration: "2 h 30 min",
    modules: 6,
    cert: "Counts toward Solution Architect",
    language: "Multi-lingual",
  },
  {
    slug: "workflow-automation",
    track: "admin",
    format: "Live cohort",
    level: "Advanced",
    title: "Workflow Automation deep dive",
    description: "Triggers, conditions and the automations that retire repetitive work across the Bizak suite.",
    duration: "5 weeks · 90 min / wk",
    modules: 10,
    cert: "Required for Solution Architect",
    language: "English",
  },
  {
    slug: "api-foundations",
    track: "developer",
    format: "Self-paced",
    level: "Intermediate",
    title: "Bizak API foundations",
    description: "Authentication, the resource model and the patterns behind every Bizak integration.",
    duration: "4 h",
    modules: 9,
    cert: "Counts toward Developer Specialist",
    language: "English",
  },
  {
    slug: "webhooks-events",
    track: "developer",
    format: "Self-paced",
    level: "Advanced",
    title: "Webhooks, events & SDKs",
    description: "Design event-driven integrations against Bizak using the SDKs Node, Python, Java.",
    duration: "3 h 15 min",
    modules: 7,
    cert: "Counts toward Developer Specialist",
    language: "English",
  },
];

// ── Live cohorts ─────────────────────────────────────────────────────────────

export const COHORTS: Cohort[] = [
  {
    slug: "cohort-five-day-close-may",
    date: "27 May",
    title: "Closing the books in five days",
    format: "Live cohort · 6 weeks",
    instructor: "Anjali Pradhan",
    seats: "12 of 30 seats left",
    startsAt: "27 May 2026 · 14:00 UTC",
    price: "$1,200 per learner",
  },
  {
    slug: "cohort-workflow-automation-jun",
    date: "10 Jun",
    title: "Workflow Automation deep dive",
    format: "Live cohort · 5 weeks",
    instructor: "Arjun Shrestha",
    seats: "21 of 30 seats left",
    startsAt: "10 Jun 2026 · 13:00 UTC",
    price: "$1,400 per learner",
  },
  {
    slug: "cohort-real-time-oee-jun",
    date: "18 Jun",
    title: "Standing up real-time OEE",
    format: "Workshop · 1 day",
    instructor: "Bishal Thapa",
    seats: "8 of 18 seats left",
    startsAt: "18 Jun 2026 · 09:00 UTC",
    price: "$650 per learner",
  },
  {
    slug: "cohort-multi-warehouse-jul",
    date: "02 Jul",
    title: "Multi-warehouse operations",
    format: "Live cohort · 4 weeks",
    instructor: "Nadia Karim",
    seats: "Just opened",
    startsAt: "02 Jul 2026 · 14:00 UTC",
    price: "$960 per learner",
  },
];

export function findCourseBySlug(slug: string | undefined): Course | undefined {
  if (!slug) return undefined;
  return COURSES.find((c) => c.slug === slug);
}

export function findCohortBySlug(slug: string | undefined): Cohort | undefined {
  if (!slug) return undefined;
  return COHORTS.find((c) => c.slug === slug);
}

// ── Why the Academy ──────────────────────────────────────────────────────────

const REASONS: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: BadgeCheck,
    title: "Recognised credentials",
    body: "Bizak certifications are accepted by partners across the region as proof of platform expertise.",
  },
  {
    icon: PlayCircle,
    title: "Hands-on, not slide-only",
    body: "Every course ends in a sandbox task. You demonstrate the skill in product, not on a slide.",
  },
  {
    icon: Languages,
    title: "Multilingual from day one",
    body: "Foundations and finance tracks read in your language the exam too, the badge in any.",
  },
  {
    icon: Users,
    title: "Built by the product team",
    body: "Authored by the Bizak engineers and consultants who ship and run the product every day.",
  },
];

// ── Testimonials ─────────────────────────────────────────────────────────────

const TESTIMONIALS: { quote: string; name: string; role: string; initials: string }[] = [
  {
    quote:
      "We rolled the Foundations track to our finance-and-ops staff in a few weeks. By the end, help-desk volume had dropped sharply.",
    name: "Priya Bansal",
    role: "CFO, Northwood Logistics",
    initials: "PB",
  },
  {
    quote:
      "The Solution Architect cohort changed how I run our tenant. Approvals, integrations and the close all tighter, all auditable.",
    name: "Marcus Tan",
    role: "Group Controller, Helmsmith",
    initials: "MT",
  },
];

// ── Team-progress mock rows (sample data inside a product mock) ──────────────

const TEAM_ROWS: { name: string; initials: string; pct: number }[] = [
  { name: "Sita Rai",       initials: "SR", pct: 100 },
  { name: "Dev Malhotra",   initials: "DM", pct: 78  },
  { name: "Aisha Rahman",   initials: "AR", pct: 54  },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatIcon(format: Format): LucideIcon {
  switch (format) {
    case "Self-paced":  return PlayCircle;
    case "Live cohort": return Calendar;
    case "Workshop":    return GraduationCap;
  }
}

// ════════════════════════════════════════════════════════════════════════════
// HERO copy + a single full-width credential artefact
// ════════════════════════════════════════════════════════════════════════════

function HeroSection() {
  return (
    <Section tone="b" pad="hero">
      <Container>
        <div className="flex flex-col items-center text-center">
          <BadgeGreen style={{ marginBottom: 28 }}>Bizak Academy 🎓</BadgeGreen>
          <Heading level={2} style={{ marginBottom: 36 }}>
            Get fluent in Bizak,{" "}
            <Heading.Muted>and earn the badge that proves it.</Heading.Muted>
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

        <div className="bz-hero-visual">
          <HeroCredential />
        </div>
      </Container>
    </Section>
  );
}

function HeroCredential() {
  return (
    <div className="overflow-hidden rounded-bz-2xl border border-bz-line-soft bg-bz-surface">
      {/* Olive credential header */}
      <div className="flex items-center justify-between gap-3 bg-bz-olive px-6 py-4 md:px-9">
        <span className="text-[15px] font-medium tracking-tight text-bz-text-on-dark">
          Bizak<sup className="ml-0.5 text-[8px] opacity-60">®</sup>{" "}
          <span className="text-white/55">Academy</span>
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-bz-sm bg-white/[0.08] px-2.5 py-1 text-[10.5px] font-medium uppercase tracking-[0.12em] text-bz-fire">
          <ShieldCheck size={12} strokeWidth={2} />
          Verifiable credential
        </span>
      </div>

      {/* Credential body */}
      <div className="grid grid-cols-1 gap-9 p-6 md:p-9 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
        {/* Identity */}
        <div className="flex flex-col">
          <span className="inline-flex size-14 items-center justify-center rounded-bz-lg bg-bz-fire">
            <Award size={28} strokeWidth={1.8} className="text-bz-olive" />
          </span>
          <p className="mt-6 text-[11px] font-medium uppercase tracking-[0.16em] text-bz-text-soft">
            Certificate of completion
          </p>
          <h3 className="mt-2 text-[clamp(22px,2.8vw,32px)] font-medium leading-[1.12] tracking-[-0.02em] text-bz-text">
            Certified Solution Architect
          </h3>
          <div className="mt-7 lg:mt-auto lg:pt-9">
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-bz-text-muted">
              Awarded to
            </p>
            <p className="mt-1 text-[19px] font-medium text-bz-text">Anjali Pradhan</p>
          </div>
        </div>

        {/* Verification facts */}
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-2.5">
            {CERT_FIELDS.map((f) => (
              <div
                key={f.label}
                className="rounded-bz-md border border-bz-line-soft bg-bz-paper-warm p-3.5"
              >
                <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-bz-text-soft">
                  {f.label}
                </p>
                <p className="mt-1.5 text-[13.5px] font-medium tabular-nums tracking-[0.01em] text-bz-text">
                  {f.value}
                </p>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-bz-md border border-bz-line-soft px-4 py-3.5">
            <span className="inline-flex items-center gap-2 text-[12px] text-bz-text-muted">
              <BadgeCheck size={14} strokeWidth={2} className="text-bz-leaf-deep" />
              Verified on the Bizak credential ledger
            </span>
            <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-bz-text">
              <Linkedin size={13} strokeWidth={2} />
              Add to profile
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// [01] LEARNING PATHS
// ════════════════════════════════════════════════════════════════════════════

function LearningPathsSection() {
  return (
    <Section tone="a">
      <Container>
        <SectionHead
          index="01"
          label="Learning paths"
          title={<>Four guided journeys, <Heading.Muted>from first login to certified.</Heading.Muted></>}
          description="Each path is a sequenced curriculum a predictable arc from day-one navigation to role-based mastery. Start where your team already is."
          titleMaxWidth={760}
        />

        <BentoGrid cols={2}>
          {PATHS.map((p) => {
            const Icon = p.icon;
            return (
              <Bento key={p.title} tone="paper" hover>
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex size-11 items-center justify-center rounded-bz-md bg-bz-paper-warm">
                    <Icon size={20} strokeWidth={1.6} className="text-bz-olive" />
                  </span>
                  {p.popular && <StatusChip variant="live">Most popular</StatusChip>}
                </div>

                <p className="mt-5 text-[11px] font-medium uppercase tracking-[0.14em] text-bz-text-soft">
                  {p.audience}
                </p>
                <h3 className="mt-1.5 bz-bento-title">{p.title}</h3>
                <Bento.Desc className="mt-2.5">{p.description}</Bento.Desc>

                <div className="mt-5 flex flex-wrap items-center gap-x-3.5 gap-y-1.5 text-[12px] text-bz-text-muted">
                  <span className="inline-flex items-center gap-1.5">
                    <Clock3 size={13} strokeWidth={1.8} />
                    {p.duration}
                  </span>
                  <Dot />
                  <span className="tabular-nums">{p.modules}</span>
                  <Dot />
                  <span>{p.level}</span>
                </div>

                <div className="mt-auto flex items-center gap-2 border-t border-bz-line-soft pt-5">
                  <Award size={14} strokeWidth={1.8} className="shrink-0 text-bz-leaf-deep" />
                  <span className="text-[12.5px] text-bz-text-muted">
                    Earns the{" "}
                    <span className="font-medium text-bz-text">{p.certName}</span> credential
                  </span>
                </div>
              </Bento>
            );
          })}
        </BentoGrid>
      </Container>
    </Section>
  );
}

function Dot() {
  return <span aria-hidden className="size-1 rounded-bz-pill bg-bz-text-soft/45" />;
}

// ════════════════════════════════════════════════════════════════════════════
// [02] CERTIFICATION LADDER dark showcase
// ════════════════════════════════════════════════════════════════════════════

function CertificationLadderSection() {
  return (
    <Section tone="dark">
      <DotGrid tone="dark" />
      <Container className="relative">
        <SectionHead
          index="02"
          label="Certification ladder"
          tone="dark"
          title={<>Three credentials that <Heading.Muted>stack as your team grows.</Heading.Muted></>}
          description="Every level is hands-on and scenario-based you prove the skill in the product, not on a slide. The badge is verifiable and travels with the learner."
          titleMaxWidth={780}
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {TIERS.map((t, i) => {
            const TierIcon = t.badge;
            const isTop = i === TIERS.length - 1;
            return (
              <div
                key={t.title}
                className="flex flex-col rounded-bz-2xl border border-white/[0.08] bg-white/[0.04] p-6 md:p-7"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-bz-sm bg-white/[0.06] px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-white/60">
                    {t.level}
                  </span>
                  <span
                    className={cn(
                      "inline-flex size-11 items-center justify-center rounded-bz-md",
                      isTop ? "bg-bz-fire" : "bg-white/[0.08]",
                    )}
                  >
                    <TierIcon
                      size={19}
                      strokeWidth={1.7}
                      className={isTop ? "text-bz-olive" : "text-bz-leaf"}
                    />
                  </span>
                </div>

                <h3 className="mt-6 text-[20px] font-medium tracking-[-0.01em] text-bz-text-on-dark">
                  {t.title}
                </h3>
                <p className="mt-2.5 text-[13.5px] leading-[1.65] text-white/[0.62]">
                  {t.description}
                </p>

                <div className="mt-5 grid grid-cols-2 gap-3 rounded-bz-lg border border-white/[0.07] bg-white/[0.03] p-3.5">
                  {[
                    { label: "Exam",   value: t.exam   },
                    { label: "Needs",  value: t.prereq },
                  ].map((m) => (
                    <div key={m.label}>
                      <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-white/40">
                        {m.label}
                      </p>
                      <p className="mt-1 text-[12.5px] font-medium text-bz-text-on-dark">
                        {m.value}
                      </p>
                    </div>
                  ))}
                </div>

                <ul className="m-0 mt-auto flex list-none flex-col gap-2.5 p-0 pt-5">
                  {t.outcomes.map((o) => (
                    <li
                      key={o}
                      className="flex items-start gap-2.5 text-[12.5px] leading-[1.5] text-white/[0.7]"
                    >
                      <Tick size="sm" className="mt-[1px]" />
                      <span>{o}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// [03] COURSE CATALOGUE interactive filter + search
// ════════════════════════════════════════════════════════════════════════════

function CourseCatalogueSection() {
  const [track, setTrack] = useState<TrackKey>("all");
  const [activeFormats, setActiveFormats] = useState<Set<Format>>(new Set());
  const [query, setQuery] = useState("");

  const counts = useMemo(() => {
    const map: Record<TrackKey, number> = {
      all: COURSES.length,
      foundations: 0,
      finance: 0,
      operations: 0,
      manufacturing: 0,
      admin: 0,
      developer: 0,
    };
    COURSES.forEach((c) => {
      map[c.track] += 1;
    });
    return map;
  }, []);

  const items = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    return COURSES.filter((c) => {
      if (track !== "all" && c.track !== track) return false;
      if (activeFormats.size > 0 && !activeFormats.has(c.format)) return false;
      if (trimmed.length > 0) {
        if (!`${c.title} ${c.description}`.toLowerCase().includes(trimmed)) return false;
      }
      return true;
    });
  }, [track, activeFormats, query]);

  const toggleFormat = (f: Format) => {
    setActiveFormats((prev) => {
      const next = new Set(prev);
      if (next.has(f)) next.delete(f);
      else next.add(f);
      return next;
    });
  };

  const dirty = activeFormats.size > 0 || track !== "all" || query.length > 0;

  return (
    <Section tone="a">
      <Container>
        {/* Header + search */}
        <div className="flex flex-col gap-7 md:flex-row md:items-end md:justify-between md:gap-12">
          <div className="max-w-[560px]">
            <Eyebrow index="03" className="mb-4 md:mb-5">Course catalogue</Eyebrow>
            <Heading level={2}>
              Every course, every track,{" "}
              <Heading.Muted>searchable in one place.</Heading.Muted>
            </Heading>
            <p className="mt-4 max-w-[480px] text-[15px] leading-[1.65] text-bz-text-muted">
              Filter by track or format, or search by topic. Self-paced courses
              start the moment you enrol; live cohorts open monthly.
            </p>
          </div>

          <div className="w-full md:max-w-[320px]">
            <div className="flex h-[46px] items-center gap-2 rounded-bz-md border border-bz-line bg-bz-surface px-3.5 focus-within:border-bz-text-soft">
              <Search size={16} strokeWidth={1.8} className="shrink-0 text-bz-text-soft" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search courses, topics…"
                aria-label="Search courses"
                className="min-w-0 flex-1 bg-transparent text-[14px] text-bz-text placeholder:text-bz-text-soft focus:outline-none"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="shrink-0 rounded-bz-sm px-1.5 py-0.5 text-[11.5px] font-medium text-bz-text-soft hover:text-bz-text"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Track filter */}
        <div className="-mx-4 mt-10 overflow-x-auto px-4 md:mx-0 md:overflow-visible md:px-0">
          <div className="flex min-w-max items-center gap-2 md:min-w-0 md:flex-wrap">
            {TRACKS.map((t) => {
              const TrackIcon = t.icon;
              const active = track === t.key;
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setTrack(t.key)}
                  aria-pressed={active}
                  className={cn(
                    "inline-flex shrink-0 items-center gap-2 rounded-bz-sm border px-3 py-2 text-[13px] font-medium transition-colors",
                    active
                      ? "border-bz-olive bg-bz-olive text-bz-paper"
                      : "border-bz-line bg-bz-surface text-bz-text-muted hover:border-bz-text-soft hover:text-bz-text",
                  )}
                >
                  <TrackIcon
                    size={14}
                    strokeWidth={1.8}
                    className={active ? "text-bz-fire" : "text-bz-text-soft"}
                  />
                  {t.label}
                  <span
                    className={cn(
                      "rounded-bz-sm px-1.5 text-[11px] font-medium tabular-nums",
                      active ? "bg-white/[0.14] text-white/75" : "bg-bz-paper-warm text-bz-text-soft",
                    )}
                  >
                    {counts[t.key]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Format filter */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.12em] text-bz-text-soft">
            <Filter size={12} strokeWidth={2} />
            Format
          </span>
          {FORMATS.map((f) => {
            const active = activeFormats.has(f);
            const FmtIcon = formatIcon(f);
            return (
              <button
                key={f}
                type="button"
                onClick={() => toggleFormat(f)}
                aria-pressed={active}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-bz-sm border px-2.5 py-1.5 text-[12px] font-medium transition-colors",
                  active
                    ? "border-bz-leaf-deep bg-bz-leaf text-bz-olive"
                    : "border-bz-line bg-bz-surface text-bz-text-muted hover:border-bz-text-soft hover:text-bz-text",
                )}
              >
                <FmtIcon size={12} strokeWidth={2} />
                {f}
              </button>
            );
          })}
          {dirty && (
            <button
              type="button"
              onClick={() => {
                setActiveFormats(new Set());
                setTrack("all");
                setQuery("");
              }}
              className="ml-1 rounded-bz-sm px-2 py-1 text-[11.5px] font-medium text-bz-text-soft underline-offset-2 hover:text-bz-text hover:underline"
            >
              Reset
            </button>
          )}
        </div>

        {/* Results */}
        {items.length === 0 ? (
          <div className="mt-10 rounded-bz-xl border border-dashed border-bz-line bg-bz-surface p-12 text-center">
            <h3 className="text-[17px] font-medium text-bz-text">
              No courses match those filters yet.
            </h3>
            <p className="mt-2 text-[14px] text-bz-text-muted">
              Reset the filters or tell us what's missing new courses ship every month.
            </p>
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((c) => (
              <CourseCard key={c.slug} course={c} />
            ))}
          </div>
        )}

        <p className="mt-7 text-[12.5px] text-bz-text-soft">
          Showing <span className="font-medium text-bz-text">{items.length}</span> of{" "}
          <span className="font-medium text-bz-text">{COURSES.length}</span> courses
        </p>
      </Container>
    </Section>
  );
}

function CourseCard({ course }: { course: Course }) {
  const FmtIcon = formatIcon(course.format);
  return (
    <a
      href={`/TrainingAndCertification/enrol/${course.slug}`}
      className="bz-hover-card group flex h-full flex-col rounded-bz-xl border border-bz-line-soft bg-bz-surface p-5 md:p-6"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-bz-sm bg-bz-paper-warm px-2 py-1 text-[11px] font-medium text-bz-text-muted">
          <FmtIcon size={11} strokeWidth={2} />
          {course.format}
        </span>
        <span className="inline-flex items-center gap-1 text-[11px] font-medium uppercase tracking-[0.08em] text-bz-text-soft">
          {course.popular && (
            <Star size={11} className="text-bz-leaf-deep" fill="currentColor" />
          )}
          {course.level}
        </span>
      </div>

      <h3 className="mt-4 text-[16.5px] font-medium leading-[1.3] text-bz-text">
        {course.title}
      </h3>
      <p className="mt-2 flex-1 text-[13px] leading-[1.6] text-bz-text-muted">
        {course.description}
      </p>

      <div className="mt-5 flex items-center justify-between gap-3 border-t border-bz-line-soft pt-4">
        <span className="flex items-center gap-2.5 text-[11.5px] text-bz-text-soft">
          <span className="inline-flex items-center gap-1">
            <Clock3 size={12} strokeWidth={1.8} />
            {course.duration}
          </span>
          <Dot />
          <span className="tabular-nums">{course.modules} modules</span>
        </span>
        <span className="inline-flex items-center gap-1 text-[12.5px] font-medium text-bz-text transition-transform group-hover:translate-x-0.5">
          Enrol
          <ArrowRight size={13} strokeWidth={2} />
        </span>
      </div>

      <p className="mt-3 inline-flex items-center gap-1.5 text-[11.5px] text-bz-text-muted">
        <BadgeCheck size={12} strokeWidth={2} className="text-bz-leaf-deep" />
        {course.cert}
      </p>
    </a>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// [04] LIVE COHORTS schedule
// ════════════════════════════════════════════════════════════════════════════

function LiveCohortsSection() {
  return (
    <Section tone="b">
      <Container>
        <SectionHead
          index="04"
          label="Live cohorts"
          title={<>Learn live with the people <Heading.Muted>who build and run Bizak.</Heading.Muted></>}
          description="Small instructor-led cohorts, led by Bizak engineers and consultants. Seats are limited reserve early."
          titleMaxWidth={720}
        />

        <div className="overflow-hidden rounded-bz-xl border border-bz-line-soft bg-bz-surface">
          {COHORTS.map((c, i) => {
            const [day, mon] = c.date.split(" ");
            return (
              <div
                key={c.slug}
                className={cn(
                  "grid grid-cols-1 gap-4 px-5 py-5 md:grid-cols-[76px_minmax(0,1fr)_auto] md:items-center md:gap-6 md:px-7",
                  i > 0 && "border-t border-bz-line-soft",
                )}
              >
                <div className="inline-flex w-fit flex-col items-center rounded-bz-md border border-bz-line-soft bg-bz-paper-warm px-3.5 py-2 text-center">
                  <span className="text-[16px] font-medium leading-none tabular-nums text-bz-text">
                    {day}
                  </span>
                  <span className="mt-1 text-[10px] font-medium uppercase tracking-[0.1em] text-bz-text-soft">
                    {mon}
                  </span>
                </div>

                <div className="min-w-0">
                  <h3 className="text-[15.5px] font-medium text-bz-text">{c.title}</h3>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-bz-text-muted">
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar size={12} strokeWidth={2} />
                      {c.format}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Users size={12} strokeWidth={2} />
                      {c.instructor}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span aria-hidden className="size-1.5 rounded-bz-pill bg-bz-leaf-deep" />
                      {c.seats}
                    </span>
                  </div>
                </div>

                <div className="md:justify-self-end">
                  <Pill
                    variant="dark"
                    size="sm"
                    withArrow
                    href={`/TrainingAndCertification/enrol/${c.slug}`}
                  >
                    Reserve seat
                  </Pill>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// [05] WHY THE ACADEMY reasons + testimonials
// ════════════════════════════════════════════════════════════════════════════

function WhyAcademySection() {
  return (
    <Section tone="a">
      <Container>
        <SectionHead
          index="05"
          label="Why Bizak Academy"
          title={<>Training built by the team <Heading.Muted>that builds the product.</Heading.Muted></>}
          description="The Academy is the same enablement Bizak runs on every paid implementation opened up so any operator can learn at their own pace."
          titleMaxWidth={720}
        />

        <BentoGrid cols={4}>
          {REASONS.map((r) => {
            const Icon = r.icon;
            return (
              <Bento key={r.title} tone="paper" hover minHeight={0}>
                <span className="inline-flex size-11 items-center justify-center rounded-bz-md bg-bz-paper-warm">
                  <Icon size={19} strokeWidth={1.6} className="text-bz-olive" />
                </span>
                <h3 className="mt-5 bz-bento-title">{r.title}</h3>
                <Bento.Desc className="mt-2">{r.body}</Bento.Desc>
              </Bento>
            );
          })}
        </BentoGrid>

        <div className="mt-[18px] rounded-bz-3xl bg-bz-paper p-7 md:p-10">
          <Carousel
            items={TESTIMONIALS}
            autoAdvance={7000}
            render={(t) => (
              <div className="flex min-h-[170px] flex-col justify-between">
                <blockquote
                  className="m-0 text-bz-text"
                  style={{
                    fontSize: "clamp(18px, 2vw, 24px)",
                    fontWeight: 500,
                    letterSpacing: "-0.015em",
                    lineHeight: 1.4,
                  }}
                >
                  "{t.quote}"
                </blockquote>
                <div className="mt-6 flex items-center gap-3">
                  <div className="bz-avatar-lg">{t.initials}</div>
                  <div>
                    <div className="text-[14px] font-medium text-bz-text">{t.name}</div>
                    <div className="text-[12.5px] text-bz-text-muted">{t.role}</div>
                  </div>
                </div>
              </div>
            )}
          />
        </div>
      </Container>
    </Section>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// [06] FOR TEAMS org-wide rollout
// ════════════════════════════════════════════════════════════════════════════

function ForTeamsSection() {
  return (
    <Section tone="b">
      <Container>
        <BigCard
          text={{
            title: "Roll the Academy out to your whole team",
            body: "Group enrolment, shared dashboards and an admin view that tracks every learner's progress and certification. Volume pricing and SSO included.",
            bullets: [
              "Group enrolment with SSO",
              "Real-time progress dashboards",
              "Private and on-site cohorts",
              "Multilingual from day one",
            ],
            cta: {
              variant: "accent",
              withArrow: true,
              href: "/contact",
              children: "Talk to Sales",
            },
          }}
          visual={<TeamProgressVisual />}
        />
      </Container>
    </Section>
  );
}

function TeamProgressVisual() {
  return (
    <div className="w-full max-w-[360px] rounded-bz-xl bg-bz-paper p-5 text-bz-text">
      <div className="mb-3.5 flex items-center justify-between">
        <span className="text-[11.5px] text-bz-text-muted">Team progress · Finance track</span>
        <GraduationCap size={16} strokeWidth={1.8} className="text-bz-olive" />
      </div>

      <div className="flex flex-col gap-3.5">
        {TEAM_ROWS.map((m) => (
          <div key={m.name}>
            <div className="mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="inline-flex size-6 items-center justify-center rounded-bz-pill bg-bz-paper-warm text-[9.5px] font-semibold text-bz-olive">
                  {m.initials}
                </span>
                <span className="text-[12px] font-medium text-bz-text">{m.name}</span>
              </span>
              <span className="text-[11px] tabular-nums text-bz-text-muted">{m.pct}%</span>
            </div>
            <StripeBar pct={m.pct} />
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-bz-line-soft pt-3">
        <span className="text-[11px] text-bz-text-muted">Certified this quarter</span>
        <span className="text-[14px] font-medium tabular-nums text-bz-text">7 of 12</span>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PAGE
// ════════════════════════════════════════════════════════════════════════════

export function TrainingAndCertificate() {
  return (
    <main>
      <HeroSection />
      <LearningPathsSection />
      <CertificationLadderSection />
      <CourseCatalogueSection />
      <LiveCohortsSection />
      <WhyAcademySection />
      <ForTeamsSection />
    </main>
  );
}
