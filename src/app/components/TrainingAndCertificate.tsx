import { useMemo, useState } from "react";
import "../../styles/style.css";
import {
  Award,
  BadgeCheck,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock3,
  Compass,
  Factory,
  FileSpreadsheet,
  Filter,
  GraduationCap,
  Languages,
  Linkedin,
  PlayCircle,
  Rocket,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Star,
  Trophy,
  Users,
  Video,
  Workflow,
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
} from "./marketing";

// ─── Types & data ────────────────────────────────────────────────────────────

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

const TRACKS: { key: TrackKey; label: string; icon: LucideIcon }[] = [
  { key: "all",           label: "All courses",        icon: BookOpen      },
  { key: "foundations",   label: "Foundations",        icon: Compass       },
  { key: "finance",       label: "Finance",            icon: FileSpreadsheet },
  { key: "operations",    label: "Operations",         icon: Workflow      },
  { key: "manufacturing", label: "Manufacturing",      icon: Factory       },
  { key: "admin",         label: "Administration",     icon: Settings2     },
  { key: "developer",     label: "Developer",          icon: Sparkles      },
];

const FORMATS: Format[] = ["Self-paced", "Live cohort", "Workshop"];

// ─── Hero stats ──────────────────────────────────────────────────────────────

const HERO_STATS: { value: string; label: string }[] = [
  { value: "120+",   label: "Courses & modules"        },
  { value: "26K",    label: "Operators trained"        },
  { value: "92%",    label: "Certification pass rate"  },
  { value: "9",      label: "Available languages"      },
];

// ─── Learning paths (the four canonical journeys) ───────────────────────────

type Path = {
  badge: string;
  audience: string;
  title: string;
  description: string;
  duration: string;
  modules: string;
  outcome: string;
  level: Level;
  certName: string;
  icon: LucideIcon;
  highlight?: boolean;
  topics: string[];
};

const PATHS: Path[] = [
  {
    badge: "Most popular",
    audience: "For new Bizak operators",
    title: "Bizak Foundations",
    description:
      "The shared mental model every Bizak user needs modules, navigation, and the daily workflows behind a clean operating week.",
    duration: "5 hours",
    modules: "8 modules",
    outcome: "Confident day-one users across finance, sales, and ops.",
    level: "Foundational",
    certName: "Bizak Certified User",
    icon: Compass,
    highlight: true,
    topics: ["Platform tour", "Daily workflows", "Reports & dashboards", "Mobile basics"],
  },
  {
    audience: "For finance teams",
    title: "Finance Practitioner",
    badge: "Role-based",
    description:
      "Master the close, reconciliations, and consolidated reporting in Bizak the daily, monthly, and quarterly cadence of a modern finance team.",
    duration: "12 hours",
    modules: "14 modules",
    outcome: "Run a five-day close on Bizak with full audit trail.",
    level: "Intermediate",
    certName: "Bizak Finance Practitioner",
    icon: FileSpreadsheet,
    topics: ["AR / AP / GL", "Bank reconciliation", "Multi-entity close", "Compliance reporting"],
  },
  {
    audience: "For ops & supply chain",
    title: "Operations Specialist",
    badge: "Role-based",
    description:
      "Inventory accuracy, multi-warehouse, purchasing, and the workflows that keep stock and orders honest day-to-day.",
    duration: "10 hours",
    modules: "11 modules",
    outcome: "Manage multi-warehouse operations with live stock visibility.",
    level: "Intermediate",
    certName: "Bizak Operations Specialist",
    icon: Workflow,
    topics: ["Inventory & WMS", "Procurement", "Cycle counting", "Returns & RMAs"],
  },
  {
    audience: "For platform admins",
    title: "Solution Architect",
    badge: "Advanced",
    description:
      "Configure roles, approvals, automations, and integrations. The full administration toolkit for the people who own the Bizak tenant.",
    duration: "18 hours",
    modules: "16 modules",
    outcome: "Architect, harden, and tune a multi-entity Bizak tenant.",
    level: "Advanced",
    certName: "Bizak Certified Solution Architect",
    icon: Settings2,
    topics: ["Roles & permissions", "Workflow Automation", "Integrations & APIs", "Security & compliance"],
  },
];

// ─── Certification ladder ────────────────────────────────────────────────────

type Tier = {
  level: string;
  badge: LucideIcon;
  title: string;
  description: string;
  duration: string;
  prereq: string;
  outcomes: string[];
  tone: "sage" | "accent" | "darkSurface";
};

const TIERS: Tier[] = [
  {
    level: "Level 1",
    badge: BadgeCheck,
    title: "Certified User",
    description:
      "Confirms day-one fluency with Bizak's modules, navigation, and the workflows the average operator runs every week.",
    duration: "60-min exam",
    prereq: "Bizak Foundations",
    outcomes: [
      "Run daily workflows independently",
      "Read standard reports and dashboards",
      "Operate Bizak on mobile and desktop",
    ],
    tone: "sage",
  },
  {
    level: "Level 2",
    badge: Trophy,
    title: "Practitioner",
    description:
      "Role-based mastery Finance, Operations, Sales, or Manufacturing. Demonstrates deep workflow competence in your domain.",
    duration: "90-min exam · scenario-based",
    prereq: "Certified User + role track",
    outcomes: [
      "Lead a workstream in your function",
      "Configure module-level workflows",
      "Coach peers through complex tasks",
    ],
    tone: "accent",
  },
  {
    level: "Level 3",
    badge: Award,
    title: "Solution Architect",
    description:
      "The expert credential confirms you can architect, harden, and tune a multi-entity Bizak tenant end-to-end.",
    duration: "Two-part exam · 4 hours",
    prereq: "Practitioner in two tracks",
    outcomes: [
      "Design integrations and automations",
      "Manage tenant security and compliance",
      "Lead enterprise rollouts independently",
    ],
    tone: "darkSurface",
  },
];

// ─── Course catalogue ────────────────────────────────────────────────────────

export const COURSES: Course[] = [
  // Foundations
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
    description: "Approve, scan, and update on the go. Built for managers, sales reps, and warehouse teams who don't sit at a desk.",
    duration: "45 min",
    modules: 3,
    cert: "Counts toward Certified User",
    language: "English",
  },

  // Finance
  {
    slug: "five-day-close",
    track: "finance",
    format: "Live cohort",
    level: "Intermediate",
    title: "Closing the books in five days",
    description: "The cadence, the controls, and the Bizak features that compress month-end from weeks to days.",
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
    description: "Invoice-to-cash and bill-to-pay end-to-end including discounts, credit notes, and aging analysis.",
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
    description: "Hands-on workshop: intercompany rules, FX revaluation, and a one-click consolidated P&L.",
    duration: "2-day workshop",
    modules: 10,
    cert: "Required for Solution Architect",
    language: "English",
  },

  // Operations
  {
    slug: "inventory-essentials",
    track: "operations",
    format: "Self-paced",
    level: "Foundational",
    title: "Inventory essentials",
    description: "Stock movements, locations, and the daily transactions every inventory team performs in Bizak.",
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
    description: "Bins, transfers, 3PL handoffs, and the cycle-count playbook that keeps stock accurate across sites.",
    duration: "4 weeks · 90 min / wk",
    modules: 8,
    cert: "Counts toward Operations Specialist",
    language: "English",
  },

  // Manufacturing
  {
    slug: "production-planning",
    track: "manufacturing",
    format: "Self-paced",
    level: "Intermediate",
    title: "Production planning fundamentals",
    description: "Work orders, BOMs, routings, and how Bizak schedules across a multi-line production environment.",
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
    description: "Wire shop-floor signals, define A × P × Q, and publish your first live OEE dashboard.",
    duration: "1-day workshop",
    modules: 5,
    cert: "Required for Manufacturing Practitioner",
    language: "English",
    popular: true,
  },

  // Admin
  {
    slug: "roles-permissions",
    track: "admin",
    format: "Self-paced",
    level: "Intermediate",
    title: "Roles, permissions & approvals",
    description: "Build a role library, configure approval matrices, and lock down sensitive workflows without slowing the team.",
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
    description: "Triggers, conditions, and the automations that retire repetitive work across the Bizak suite.",
    duration: "5 weeks · 90 min / wk",
    modules: 10,
    cert: "Required for Solution Architect",
    language: "English",
  },

  // Developer
  {
    slug: "api-foundations",
    track: "developer",
    format: "Self-paced",
    level: "Intermediate",
    title: "Bizak API foundations",
    description: "Authentication, the resource model, and the patterns behind every Bizak integration.",
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

// ─── Live cohorts ────────────────────────────────────────────────────────────

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

export const COHORTS: Cohort[] = [
  {
    slug: "cohort-five-day-close-may",
    date: "27 May",
    title: "Closing the books in five days",
    format: "Live cohort · 6 weeks",
    instructor: "Renée Yamamoto",
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
    instructor: "Hiroshi Watanabe",
    seats: "8 of 18 seats left",
    startsAt: "18 Jun 2026 · 09:00 UTC",
    price: "$650 per learner",
  },
  {
    slug: "cohort-multi-warehouse-jul",
    date: "02 Jul",
    title: "Multi-warehouse operations",
    format: "Live cohort · 4 weeks",
    instructor: "Marcia Khan",
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

// ─── Why Bizak Academy ──────────────────────────────────────────────────────

const REASONS: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: BadgeCheck,
    title: "Industry-recognised credentials",
    body: "Bizak certifications are referenced on 12,000+ LinkedIn profiles and accepted by partners as proof of platform expertise.",
  },
  {
    icon: PlayCircle,
    title: "Hands-on, not slide-only",
    body: "Every course ends in a sandbox task. You demonstrate the skill in product no PowerPoint exam stands between you and your badge.",
  },
  {
    icon: Languages,
    title: "Multilingual from day one",
    body: "Foundations and finance tracks are available in nine languages. The exam reads in your language, the badge ships in any.",
  },
  {
    icon: Users,
    title: "Built by the product team",
    body: "Every course is authored by the Bizak engineers, consultants, and customer-success leads who ship and run the product daily.",
  },
];

// ─── Testimonials ───────────────────────────────────────────────────────────

const TESTIMONIALS: { quote: string; name: string; role: string; tone: "sage" | "accent"; initials: string }[] = [
  {
    quote:
      "We rolled the Foundations track to 110 finance-and-ops staff in three weeks. By the end, the help-desk volume dropped 60%.",
    name: "Priya Bansal",
    role: "CFO, Northwood Logistics",
    tone: "sage",
    initials: "PB",
  },
  {
    quote:
      "The Solution Architect cohort changed how I run our tenant. Approvals, integrations, and the close all tighter, all auditable.",
    name: "Marcus Tan",
    role: "Group Controller, Helmsmith",
    tone: "accent",
    initials: "MT",
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatIcon(format: Format): LucideIcon {
  switch (format) {
    case "Self-paced":   return PlayCircle;
    case "Live cohort":  return Calendar;
    case "Workshop":     return GraduationCap;
  }
}

function formatTone(format: Format): "accent" | "sage" | "neutral" {
  switch (format) {
    case "Self-paced":   return "sage";
    case "Live cohort":  return "accent";
    case "Workshop":     return "neutral";
  }
}

// ─── Hero ────────────────────────────────────────────────────────────────────

function HeroSection() {
  return (
    <Section pad="hero" tone="light" className="biz-mesh overflow-hidden">
      <Container>
        <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
          {/* Left text */}
          <div className="max-w-[640px]">
            <HeroBadge>Training &amp; Certification</HeroBadge>
            <h1 className="mt-4 text-[clamp(40px,5.2vw,60px)] font-bold leading-[1.05] tracking-[-0.03em] text-bz-text">
              Get fluent in Bizak.{" "}
              <span className="relative inline-block">
                Earn the badge
                <span className="absolute inset-x-0 bottom-1 -z-0 h-[10px] rounded-full bg-bz-accent/55" />
              </span>
              .
            </h1>
            <p className="mt-5 max-w-[560px] text-[17px] leading-[1.7] text-bz-text-muted">
              Hands-on courses, live cohorts, and three certification levels
              authored by the team that builds Bizak. From a thirty-minute
              platform tour to the Solution Architect ladder, the Academy meets
              your team where they are.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button variant="primary" size="md" href="#paths" withArrow>
                Pick a learning path
              </Button>
              <Button variant="ghost" size="md" href="#cohorts">
                Browse upcoming cohorts
              </Button>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-bz-text-soft">
              <span className="inline-flex items-center gap-1.5">
                <BadgeCheck className="size-[14px] text-bz-sage" strokeWidth={1.8} />
                3 certification levels
              </span>
              <span aria-hidden className="size-1 rounded-full bg-bz-text-soft/40" />
              <span>Self-paced &amp; live</span>
              <span aria-hidden className="size-1 rounded-full bg-bz-text-soft/40" />
              <span>Available in 9 languages</span>
            </div>
          </div>

          {/* Right certification card mock */}
          <div className="relative mx-auto w-full max-w-[440px] lg:mx-0">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-10 -top-10 size-[260px] rounded-full bg-bz-accent/15 blur-3xl"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-12 -left-10 size-[220px] rounded-full bg-bz-sage/15 blur-3xl"
            />

            <div className="relative overflow-hidden rounded-bz-2xl border border-bz-border bg-bz-deep p-7 shadow-[0_24px_64px_rgba(15,17,14,0.18)] md:p-8">
              <div className="flex items-center justify-between">
                <PillBadge tone="accent" dot>
                  Live credential
                </PillBadge>
                <span className="font-mono text-[10.5px] font-bold uppercase tracking-[0.18em] text-white/55">
                  ID · BZK-2026-04812
                </span>
              </div>

              <div className="mt-7 flex items-center gap-4">
                <span className="inline-flex size-14 items-center justify-center rounded-bz-lg bg-bz-accent text-bz-deep shadow-[0_12px_30px_rgba(199,255,53,0.35)]">
                  <Award className="size-7" strokeWidth={2} />
                </span>
                <div className="leading-tight">
                  <div className="text-[10.5px] font-bold uppercase tracking-[0.18em] text-white/55">
                    Bizak Academy
                  </div>
                  <div className="mt-1 text-[20px] font-bold text-white">
                    Certified Solution Architect
                  </div>
                </div>
              </div>

              <div className="mt-7 grid grid-cols-2 gap-4">
                {[
                  { label: "Awarded to",  value: "Renée Yamamoto" },
                  { label: "Issued",      value: "04 May 2026"     },
                  { label: "Valid until", value: "04 May 2028"     },
                  { label: "Score",       value: "94 / 100"        },
                ].map(({ label, value }) => (
                  <div key={label} className="rounded-bz-md border border-white/10 bg-white/[0.04] p-3">
                    <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/55">
                      {label}
                    </div>
                    <div className="mt-1 text-[13.5px] font-semibold tabular-nums text-white">
                      {value}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-7 flex items-center justify-between border-t border-white/10 pt-5">
                <span className="inline-flex items-center gap-2 text-[12px] text-white/55">
                  <ShieldCheck className="size-[14px] text-bz-accent" strokeWidth={2} />
                  Tamper-proof, blockchain-anchored
                </span>
                <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-bz-accent">
                  <Linkedin className="size-[12px]" strokeWidth={2} fill="currentColor" />
                  Add to LinkedIn
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Hero stats strip */}
        <div className="mt-16 grid grid-cols-2 gap-x-6 gap-y-8 border-t border-bz-border pt-10 md:grid-cols-4">
          {HERO_STATS.map((s) => (
            <div key={s.label} className="flex flex-col">
              <span className="text-[28px] font-bold tabular-nums tracking-[-0.02em] text-bz-text md:text-[32px]">
                {s.value}
              </span>
              <span className="mt-1 text-[12px] uppercase tracking-[0.1em] text-bz-text-soft">
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}

// ─── Learning paths ─────────────────────────────────────────────────────────

function PathsSection() {
  return (
    <Section tone="white" pad="default" id="paths">
      <Container>
        <SectionHeading
          eyebrow="Learning paths"
          title="Four journeys, one curriculum."
          description="Each path is a sequenced curriculum a predictable arc from first login to certified competence. Start where your team is."
          maxWidth={760}
          className="mb-12"
        />

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {PATHS.map(({ icon: PathIcon, ...path }) => (
            <Card
              key={path.title}
              tone="light"
              pad="lg"
              hover="lift"
              className={path.highlight ? "border-bz-sage-mid" : ""}
            >
              <div className="flex items-start justify-between">
                <IconBadge size="lg" tone={path.highlight ? "accent" : "sage"}>
                  <PathIcon className="size-5" strokeWidth={1.8} />
                </IconBadge>
                <PillBadge tone={path.highlight ? "accent" : "neutral"} dot={path.highlight}>
                  {path.badge}
                </PillBadge>
              </div>

              <div className="mt-7 text-[11px] font-bold uppercase tracking-[0.14em] text-bz-text-soft">
                {path.audience}
              </div>
              <h3 className="mt-1.5 text-[22px] font-bold tracking-[-0.01em] text-bz-text">
                {path.title}
              </h3>
              <p className="mt-3 text-[14.5px] leading-[1.7] text-bz-text-muted">
                {path.description}
              </p>

              {/* Topic chips */}
              <div className="mt-5 flex flex-wrap gap-1.5">
                {path.topics.map((t) => (
                  <span
                    key={t}
                    className="rounded-bz-pill bg-bz-bg px-2.5 py-1 text-[11.5px] font-semibold text-bz-text-muted"
                  >
                    {t}
                  </span>
                ))}
              </div>

              {/* Meta */}
              <div className="mt-6 grid grid-cols-3 gap-3 rounded-bz-lg bg-bz-bg p-4">
                {[
                  { label: "Duration",  value: path.duration },
                  { label: "Modules",   value: path.modules  },
                  { label: "Level",     value: path.level    },
                ].map((m) => (
                  <div key={m.label}>
                    <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-bz-text-soft">
                      {m.label}
                    </div>
                    <div className="mt-1 text-[13px] font-semibold text-bz-text">
                      {m.value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Outcome row */}
              <div className="mt-5 flex items-start gap-3 rounded-bz-lg border border-bz-sage-mid/40 bg-bz-sage-soft p-4">
                <CheckCircle2 className="mt-0.5 size-[15px] shrink-0 text-bz-sage" strokeWidth={2} />
                <div className="text-[13.5px] leading-[1.6] text-bz-text">
                  <span className="font-bold">Outcome </span>
                  {path.outcome}
                </div>
              </div>

              {/* Cert footer */}
              <div className="mt-6 flex items-center justify-between gap-3 border-t border-bz-border-soft pt-5">
                <div className="inline-flex items-center gap-2 text-[12.5px] text-bz-text-muted">
                  <Award className="size-[14px] text-bz-sage" strokeWidth={1.8} />
                  Earns <span className="font-semibold text-bz-text">{path.certName}</span>
                </div>
                <Button variant="ghost" size="sm" href="#catalogue" withArrow>
                  Explore
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}

// ─── Certification ladder ───────────────────────────────────────────────────

function CertificationSection() {
  return (
    <Section tone="dark" pad="default">
      <Container>
        <SectionHeading
          eyebrow="The certification ladder"
          eyebrowTone="accent"
          title={
            <>
              Three levels.{" "}
              <span className="text-bz-accent">One badge that travels.</span>
            </>
          }
          description="Bizak certifications stack from day-one fluency to enterprise architect. Each tier is hands-on, scenario-based, and tamper-proof."
          tone="light"
          maxWidth={780}
          className="mb-14"
        />

        <div className="relative grid grid-cols-1 gap-5 md:grid-cols-3">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-[44px] hidden h-px bg-gradient-to-r from-transparent via-white/10 to-transparent md:block"
          />

          {TIERS.map((t) => {
            const TierIcon = t.badge;
            return (
              <Card
                key={t.title}
                tone="dark"
                pad="lg"
                className="relative flex flex-col"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-white/55">
                    {t.level}
                  </span>
                  <IconBadge size="md" tone={t.tone}>
                    <TierIcon className="size-[18px]" strokeWidth={1.8} />
                  </IconBadge>
                </div>

                <h3 className="mt-7 text-[22px] font-bold tracking-[-0.01em] text-white">
                  {t.title}
                </h3>
                <p className="mt-3 flex-1 text-[14px] leading-[1.7] text-white/65">
                  {t.description}
                </p>

                <div className="mt-6 grid grid-cols-2 gap-3 rounded-bz-lg border border-white/10 bg-white/[0.04] p-4">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/45">
                      Exam
                    </div>
                    <div className="mt-1 text-[12.5px] font-semibold text-white">
                      {t.duration}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/45">
                      Prereq
                    </div>
                    <div className="mt-1 text-[12.5px] font-semibold text-white">
                      {t.prereq}
                    </div>
                  </div>
                </div>

                <ul className="mt-6 space-y-2">
                  {t.outcomes.map((o) => (
                    <li
                      key={o}
                      className="flex items-start gap-2.5 text-[13px] leading-[1.55] text-white/70"
                    >
                      <CheckCircle2
                        className="mt-0.5 size-[13px] shrink-0 text-bz-accent"
                        strokeWidth={2}
                      />
                      <span>{o}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}

// ─── Course catalogue ───────────────────────────────────────────────────────

function CatalogueSection() {
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
        const haystack = `${c.title} ${c.description}`.toLowerCase();
        if (!haystack.includes(trimmed)) return false;
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

  return (
    <Section tone="light" pad="default" id="catalogue">
      <Container>
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between md:gap-10">
          <div className="max-w-[620px]">
            <Eyebrow>Course catalogue</Eyebrow>
            <h2 className="mt-3 text-[clamp(28px,3.4vw,40px)] font-bold leading-[1.1] tracking-[-0.02em] text-bz-text">
              Every course, every track searchable.
            </h2>
            <p className="mt-3 text-[15px] leading-[1.7] text-bz-text-muted">
              Filter by track or format, or search by topic. Self-paced courses
              start the moment you enrol; live cohorts open monthly.
            </p>
          </div>

          {/* Search */}
          <div className="w-full max-w-[360px]">
            <div className="flex h-[46px] items-center gap-2 rounded-bz-pill border border-bz-border bg-bz-surface pl-4 pr-2 shadow-[0_2px_10px_rgba(15,17,14,0.04)] focus-within:border-bz-sage-mid focus-within:shadow-[0_8px_24px_rgba(15,17,14,0.06)]">
              <Search className="size-4 shrink-0 text-bz-text-soft" strokeWidth={1.8} />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search courses, topics…"
                aria-label="Search courses"
                className="flex-1 bg-transparent text-[14px] text-bz-text placeholder:text-bz-text-soft focus:outline-none"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="rounded-bz-pill px-2 py-1 text-[11px] font-semibold text-bz-text-soft hover:text-bz-text"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Track pills */}
        <div className="-mx-6 mt-10 overflow-x-auto px-6 md:mx-0 md:overflow-visible md:px-0">
          <div className="flex min-w-max flex-nowrap items-center gap-2 md:min-w-0 md:flex-wrap">
            {TRACKS.map((t) => {
              const TrackIcon = t.icon;
              const isActive = track === t.key;
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setTrack(t.key)}
                  aria-pressed={isActive}
                  className={[
                    "inline-flex shrink-0 items-center gap-2 rounded-bz-pill border px-3.5 py-2 text-[13px] font-semibold transition-colors",
                    isActive
                      ? "border-bz-deep bg-bz-deep text-white"
                      : "border-bz-border bg-bz-surface text-bz-text-muted hover:border-bz-sage-mid hover:bg-bz-sage-soft hover:text-bz-text",
                  ].join(" ")}
                >
                  <TrackIcon
                    className={[
                      "size-[14px]",
                      isActive ? "text-bz-accent" : "text-bz-text-soft",
                    ].join(" ")}
                    strokeWidth={1.8}
                  />
                  <span>{t.label}</span>
                  <span
                    className={[
                      "rounded-bz-pill px-1.5 text-[11px] font-bold tabular-nums",
                      isActive
                        ? "bg-white/15 text-white/75"
                        : "bg-bz-bg text-bz-text-soft",
                    ].join(" ")}
                  >
                    {counts[t.key]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Format chips */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-bz-text-soft">
            <Filter className="size-[12px]" strokeWidth={2} />
            Format
          </span>
          {FORMATS.map((f) => {
            const isActive = activeFormats.has(f);
            const FmtIcon = formatIcon(f);
            return (
              <button
                key={f}
                type="button"
                onClick={() => toggleFormat(f)}
                aria-pressed={isActive}
                className={[
                  "inline-flex items-center gap-1.5 rounded-bz-pill border px-3 py-1.5 text-[12px] font-semibold transition-colors",
                  isActive
                    ? "border-bz-sage bg-bz-sage-soft text-bz-sage"
                    : "border-bz-border bg-bz-surface text-bz-text-muted hover:border-bz-sage-mid hover:text-bz-text",
                ].join(" ")}
              >
                <FmtIcon className="size-[12px]" strokeWidth={2} />
                {f}
              </button>
            );
          })}
          {(activeFormats.size > 0 || track !== "all" || query) && (
            <button
              type="button"
              onClick={() => {
                setActiveFormats(new Set());
                setTrack("all");
                setQuery("");
              }}
              className="ml-1 rounded-bz-pill px-2 py-1 text-[11.5px] font-semibold text-bz-text-soft underline-offset-2 hover:text-bz-text hover:underline"
            >
              Reset
            </button>
          )}
        </div>

        {/* Results */}
        {items.length === 0 ? (
          <div className="mt-12 rounded-bz-xl border border-dashed border-bz-border bg-bz-surface p-12 text-center">
            <h3 className="text-[18px] font-bold text-bz-text">
              No courses match those filters yet.
            </h3>
            <p className="mt-2 text-[14px] text-bz-text-muted">
              Reset the filters or tell us what's missing we publish new
              courses every month.
            </p>
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {items.map((c) => (
              <CourseCard key={c.slug} course={c} />
            ))}
          </div>
        )}

        <div className="mt-8 text-[12.5px] text-bz-text-soft">
          Showing <span className="font-bold text-bz-text">{items.length}</span> of{" "}
          <span className="font-bold text-bz-text">{COURSES.length}</span> courses
        </div>
      </Container>
    </Section>
  );
}

function CourseCard({ course }: { course: Course }) {
  const FmtIcon = formatIcon(course.format);
  return (
    <a
      href={`/TrainingAndCertification/enrol/${course.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-bz-xl border border-bz-border bg-bz-surface transition-all duration-200 hover:-translate-y-[2px] hover:border-bz-sage-mid hover:shadow-[0_16px_40px_rgba(15,17,14,0.06)]"
    >
      <div className="flex items-center justify-between gap-3 border-b border-bz-border-soft px-6 pt-6 pb-5">
        <PillBadge tone={formatTone(course.format)} dot={course.format === "Live cohort"}>
          <span className="inline-flex items-center gap-1.5">
            <FmtIcon className="size-[11px]" strokeWidth={2.2} />
            {course.format}
          </span>
        </PillBadge>
        <span className="inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.08em] text-bz-text-soft">
          {course.popular && (
            <Star className="size-[11px] text-bz-accent" strokeWidth={2.2} fill="currentColor" />
          )}
          {course.level}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="text-[17.5px] font-bold leading-[1.3] tracking-[-0.005em] text-bz-text transition-colors group-hover:text-bz-sage">
          {course.title}
        </h3>
        <p className="mt-2 flex-1 text-[13.5px] leading-[1.65] text-bz-text-muted">
          {course.description}
        </p>

        <div className="mt-6 flex items-center justify-between gap-3 border-t border-bz-border-soft pt-4">
          <div className="flex items-center gap-3 text-[11.5px] font-semibold text-bz-text-soft">
            <span className="inline-flex items-center gap-1">
              <Clock3 className="size-[12px]" strokeWidth={2} />
              {course.duration}
            </span>
            <span aria-hidden className="size-1 rounded-full bg-bz-text-soft/40" />
            <span className="tabular-nums">{course.modules} modules</span>
          </div>
          <span className="inline-flex items-center gap-1 text-[12.5px] font-bold text-bz-sage transition-transform duration-200 group-hover:translate-x-0.5">
            Enrol
            <Rocket className="size-[13px]" strokeWidth={2} />
          </span>
        </div>

        <div className="mt-3 inline-flex items-center gap-1.5 text-[11.5px] text-bz-text-muted">
          <BadgeCheck className="size-[12px] text-bz-sage" strokeWidth={2} />
          {course.cert}
        </div>
      </div>
    </a>
  );
}

// ─── Live cohorts ───────────────────────────────────────────────────────────

function CohortsSection() {
  return (
    <Section tone="white" pad="default" id="cohorts">
      <Container>
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between md:gap-10">
          <SectionHeading
            eyebrow="Upcoming cohorts"
            title="Learn live with the team that ships Bizak."
            description="Eight-to-twelve learner cohorts, run by Bizak engineers and consultants. Cohorts fill quickly secure your seat early."
            maxWidth={680}
          />
          <div className="flex shrink-0 flex-wrap items-center gap-3 md:justify-end">
            <PillBadge tone="accent" dot>Q2 2026 schedule</PillBadge>
            <PillBadge tone="neutral">All times in UTC</PillBadge>
          </div>
        </div>

        <div className="mt-12 overflow-hidden rounded-bz-xl border border-bz-border">
          <ul className="divide-y divide-bz-border">
            {COHORTS.map((c) => (
              <li
                key={c.slug}
                className="grid grid-cols-1 gap-4 bg-bz-surface px-5 py-5 transition-colors hover:bg-bz-bg md:grid-cols-[120px_minmax(0,1fr)_auto] md:items-center md:gap-6 md:px-7"
              >
                {/* Date stamp */}
                <div className="flex items-center gap-3 md:flex-col md:items-start md:gap-0">
                  <div className="rounded-bz-md border border-bz-border bg-bz-bg px-3 py-2 text-center font-mono text-[13px] font-bold tabular-nums text-bz-text">
                    {c.date}
                  </div>
                </div>

                {/* Title block */}
                <div className="min-w-0">
                  <h3 className="text-[16px] font-bold text-bz-text">{c.title}</h3>
                  <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12.5px] text-bz-text-muted">
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="size-[12px]" strokeWidth={2} />
                      {c.format}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Users className="size-[12px]" strokeWidth={2} />
                      {c.instructor}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span aria-hidden className="size-1.5 rounded-full bg-bz-accent" />
                      {c.seats}
                    </span>
                  </div>
                </div>

                {/* CTA */}
                <div className="md:text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    href={`/TrainingAndCertification/enrol/${c.slug}`}
                    withArrow
                  >
                    Reserve seat
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </Section>
  );
}

// ─── Why Bizak Academy ──────────────────────────────────────────────────────

function ReasonsSection() {
  return (
    <Section tone="light" pad="default">
      <Container>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[360px_1fr] lg:gap-16">
          <div className="lg:sticky lg:top-[100px] lg:self-start">
            <Eyebrow>Why Bizak Academy</Eyebrow>
            <h2 className="mt-3 text-[clamp(28px,3.4vw,40px)] font-bold leading-[1.1] tracking-[-0.02em] text-bz-text">
              Built by the team that builds the product.
            </h2>
            <p className="mt-4 text-[15.5px] leading-[1.7] text-bz-text-muted">
              The Academy is the same training Bizak's customer-success team
              runs on every paid implementation opened up so any operator
              can learn at their own pace.
            </p>
            <div className="mt-7">
              <Button variant="outline" size="md" href="/contact" withArrow>
                Talk to the Academy team
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {REASONS.map(({ icon: ReasonIcon, ...r }) => (
              <Card key={r.title} tone="light" pad="lg" hover="lift">
                <IconBadge size="md" tone="sage">
                  <ReasonIcon className="size-[18px]" strokeWidth={1.8} />
                </IconBadge>
                <h3 className="mt-6 text-[16.5px] font-bold tracking-[-0.005em] text-bz-text">
                  {r.title}
                </h3>
                <p className="mt-2 text-[13.5px] leading-[1.7] text-bz-text-muted">
                  {r.body}
                </p>
              </Card>
            ))}
          </div>
        </div>

        {/* Testimonials strip */}
        <div className="mt-16 grid grid-cols-1 gap-5 md:grid-cols-2">
          {TESTIMONIALS.map((t) => (
            <Card key={t.name} tone="soft" pad="lg" className="flex flex-col">
              <div className="flex items-center gap-3">
                <span
                  className={[
                    "inline-flex size-11 items-center justify-center rounded-full text-[12px] font-bold tracking-[0.04em]",
                    t.tone === "accent"
                      ? "bg-bz-accent text-bz-deep"
                      : "bg-bz-sage text-white",
                  ].join(" ")}
                  aria-hidden
                >
                  {t.initials}
                </span>
                <div className="leading-tight">
                  <div className="text-[14px] font-bold text-bz-text">{t.name}</div>
                  <div className="text-[12.5px] text-bz-text-soft">{t.role}</div>
                </div>
              </div>
              <p className="mt-5 flex-1 text-[15px] leading-[1.7] text-bz-text">
                &ldquo;{t.quote}&rdquo;
              </p>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}

// ─── For teams banner ───────────────────────────────────────────────────────

function ForTeamsSection() {
  return (
    <Section tone="white" pad="compact">
      <Container>
        <div className="relative overflow-hidden rounded-bz-2xl border border-bz-border bg-bz-bg p-9 md:p-12">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 -top-24 h-[280px] w-[280px] rounded-full bg-bz-accent/15 blur-3xl"
          />
          <div className="relative grid grid-cols-1 items-center gap-10 md:grid-cols-[1.1fr_1fr]">
            <div>
              <PillBadge tone="sage" dot>For teams</PillBadge>
              <h2 className="mt-4 text-[clamp(24px,3vw,34px)] font-bold leading-[1.15] tracking-[-0.02em] text-bz-text">
                Roll the Academy out to your whole team.
              </h2>
              <p className="mt-3 max-w-[560px] text-[15px] leading-[1.7] text-bz-text-muted">
                Group enrolment, shared dashboards, and an admin view that
                tracks every learner's progress and certifications. Volume
                pricing from 25 seats and SSO included.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Button variant="primary" size="md" href="/contact" withArrow>
                  Talk to enterprise
                </Button>
                <Button variant="ghost" size="md" href="#">
                  Download the team brief
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Users,        label: "Group enrolment & SSO"        },
                { icon: BadgeCheck,   label: "Real-time progress dashboards" },
                { icon: Video,        label: "Custom on-site sessions"      },
                { icon: Languages,    label: "9 languages out of the box"   },
              ].map(({ icon: TeamIcon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-3 rounded-bz-lg border border-bz-border bg-bz-surface p-4"
                >
                  <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-bz-md bg-bz-sage-soft text-bz-sage">
                    <TeamIcon className="size-[16px]" strokeWidth={1.8} />
                  </span>
                  <div className="text-[13.5px] font-semibold text-bz-text">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}

// ─── Closing CTA ────────────────────────────────────────────────────────────

function ClosingCta() {
  return (
    <Section tone="dark" pad="default">
      <Container width="narrow">
        <SectionHeading
          eyebrow="Ready to get certified?"
          eyebrowTone="accent"
          title={
            <>
              Start the path that{" "}
              <span className="text-bz-accent">earns the badge.</span>
            </>
          }
          description="Pick a learning path, enrol in a cohort, or talk to the Academy team about a tailored rollout for your business."
          tone="light"
          align="center"
          maxWidth={680}
        />
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Button variant="accent" size="lg" href="#paths" withArrow>
            Pick a learning path
          </Button>
          <Button variant="ghostDark" size="lg" href="/contact">
            Talk to the Academy team
          </Button>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 border-t border-white/10 pt-8 text-[13px] text-white/55">
          {[
            { icon: BadgeCheck, label: "3 certification levels"        },
            { icon: Users,      label: "26,000+ operators trained"     },
            { icon: ShieldCheck, label: "Industry-recognised credentials" },
          ].map(({ icon: Tick, label }) => (
            <span key={label} className="inline-flex items-center gap-2">
              <Tick className="size-4 text-bz-accent" strokeWidth={1.8} />
              {label}
            </span>
          ))}
        </div>
      </Container>
    </Section>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export function TrainingAndCertificate() {
  return (
    <div>
      <Header />
      <main style={{ paddingTop: 76 }}>
        <HeroSection />
        <PathsSection />
        <CertificationSection />
        <CatalogueSection />
        <CohortsSection />
        <ReasonsSection />
        <ForTeamsSection />
        <ClosingCta />
      </main>
      <Footer />
    </div>
  );
}
