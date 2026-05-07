import { useMemo, useState } from "react";
import "../../styles/style.css";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  BookMarked,
  BookOpen,
  CheckCircle2,
  Clock3,
  Compass,
  Database,
  Factory,
  FileSpreadsheet,
  FileText,
  Filter,
  Layers,
  LineChart,
  PlayCircle,
  Receipt,
  Rocket,
  Search,
  ShieldCheck,
  Truck,
  Users,
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

// ─── Types ────────────────────────────────────────────────────────────────────

type CategoryKey =
  | "all"
  | "implementation"
  | "finance"
  | "inventory"
  | "manufacturing"
  | "sales"
  | "people";

type Format = "Playbook" | "Guide" | "Template" | "Video";

type Difficulty = "Foundational" | "Intermediate" | "Advanced";

type Resource = {
  id: string;
  category: Exclude<CategoryKey, "all">;
  format: Format;
  title: string;
  description: string;
  readTime: string;
  steps?: number;
  difficulty: Difficulty;
  updated: string;
  href: string;
};

// ─── Featured ────────────────────────────────────────────────────────────────

const FEATURED = {
  format: "Playbook" as Format,
  category: "implementation" as Exclude<CategoryKey, "all">,
  title: "From kickoff to go-live: the 60-day Bizak implementation playbook",
  description:
    "A week-by-week field guide for the operations lead running a Bizak rollout — every milestone, owner and decision gate, drawn from 50,000+ live deployments.",
  meta: [
    { icon: Clock3, label: "60-minute read" },
    { icon: Layers, label: "12 chapters" },
    { icon: Users, label: "Roles: Ops, Finance, IT" },
  ],
  highlights: [
    "Phase-by-phase RACI for every workstream",
    "The 14 master-data files you must clean before cutover",
    "Parallel-run scorecard and the go-no-go checklist",
  ],
  href: "#",
};

// ─── Library ─────────────────────────────────────────────────────────────────

const RESOURCES: Resource[] = [
  // Implementation
  {
    id: "imp-discovery",
    category: "implementation",
    format: "Playbook",
    title: "Running a clean Bizak discovery workshop",
    description:
      "The two-day structured discovery our consultants run with new customers — agenda, worksheets, and the outputs your build team needs.",
    readTime: "22 min",
    steps: 9,
    difficulty: "Foundational",
    updated: "Apr 2026",
    href: "#",
  },
  {
    id: "imp-cutover",
    category: "implementation",
    format: "Guide",
    title: "Cutover weekend: the hour-by-hour runbook",
    description:
      "Sequence opening balances, freeze legacy data, verify reconciliations, and switch users — without a single missed transaction.",
    readTime: "18 min",
    steps: 14,
    difficulty: "Advanced",
    updated: "May 2026",
    href: "#",
  },
  {
    id: "imp-data",
    category: "implementation",
    format: "Template",
    title: "Master-data migration workbook",
    description:
      "Pre-formatted XLSX templates for customers, items, vendors, COA, and opening balances — with validation rules baked in.",
    readTime: "Download",
    difficulty: "Foundational",
    updated: "Apr 2026",
    href: "#",
  },

  // Finance
  {
    id: "fin-close",
    category: "finance",
    format: "Playbook",
    title: "Close the books in 5 days, not 5 weeks",
    description:
      "How modern finance teams shorten month-end with auto-posted journals, scheduled reconciliations, and a tight checklist.",
    readTime: "26 min",
    steps: 11,
    difficulty: "Intermediate",
    updated: "Apr 2026",
    href: "#",
  },
  {
    id: "fin-multi",
    category: "finance",
    format: "Guide",
    title: "Multi-entity consolidation, step by step",
    description:
      "Configure intercompany accounts, FX revaluation, and elimination rules — then produce a consolidated P&L in one click.",
    readTime: "20 min",
    steps: 8,
    difficulty: "Advanced",
    updated: "Mar 2026",
    href: "#",
  },
  {
    id: "fin-vat",
    category: "finance",
    format: "Template",
    title: "VAT & TDS reporting templates",
    description:
      "Filing-ready tax templates aligned to IRD formats, with formulas wired to Bizak's standard ledger exports.",
    readTime: "Download",
    difficulty: "Foundational",
    updated: "May 2026",
    href: "#",
  },

  // Inventory
  {
    id: "inv-cycle",
    category: "inventory",
    format: "Playbook",
    title: "Cycle counting that actually keeps stock accurate",
    description:
      "Pick the right ABC strategy, schedule counts, reconcile variances, and graduate from yearly audits to continuous accuracy.",
    readTime: "16 min",
    steps: 7,
    difficulty: "Intermediate",
    updated: "Apr 2026",
    href: "#",
  },
  {
    id: "inv-multi",
    category: "inventory",
    format: "Guide",
    title: "Multi-warehouse setup for distribution teams",
    description:
      "Model bins, transfer routes, reorder rules, and 3PL handoffs in Bizak — without losing the single-source-of-truth.",
    readTime: "19 min",
    steps: 10,
    difficulty: "Intermediate",
    updated: "Mar 2026",
    href: "#",
  },

  // Manufacturing
  {
    id: "mfg-bom",
    category: "manufacturing",
    format: "Guide",
    title: "Building a BOM your floor will actually follow",
    description:
      "Routings, scrap factors, alternate components, and revisions — modelled so production reflects what really happens at the line.",
    readTime: "24 min",
    steps: 9,
    difficulty: "Advanced",
    updated: "Apr 2026",
    href: "#",
  },
  {
    id: "mfg-oee",
    category: "manufacturing",
    format: "Playbook",
    title: "Standing up real-time OEE in 14 days",
    description:
      "Wire shop-floor signals into Bizak, define availability/performance/quality, and publish your first live OEE dashboard.",
    readTime: "21 min",
    steps: 8,
    difficulty: "Advanced",
    updated: "Apr 2026",
    href: "#",
  },

  // Sales
  {
    id: "sales-pipeline",
    category: "sales",
    format: "Playbook",
    title: "Designing a pipeline that finance trusts",
    description:
      "Align stages, weight forecasts, and tie quotes-to-cash so finance and sales share one number — every Monday.",
    readTime: "17 min",
    steps: 6,
    difficulty: "Intermediate",
    updated: "Mar 2026",
    href: "#",
  },
  {
    id: "sales-quotes",
    category: "sales",
    format: "Template",
    title: "Quote-to-invoice workflow templates",
    description:
      "Pre-built approval flows for discounts, margins, and credit limits — drop into Bizak Workflow Automation.",
    readTime: "Download",
    difficulty: "Foundational",
    updated: "May 2026",
    href: "#",
  },

  // People & enablement
  {
    id: "ppl-train",
    category: "people",
    format: "Playbook",
    title: "Train 100 users in two weeks",
    description:
      "Role-based curricula, certification path, and the 'shadow & switch' rollout that gets adoption above 90%.",
    readTime: "15 min",
    steps: 7,
    difficulty: "Foundational",
    updated: "Apr 2026",
    href: "#",
  },
  {
    id: "ppl-video",
    category: "people",
    format: "Video",
    title: "Bizak in 30 minutes — guided product tour",
    description:
      "A narrated walkthrough of the modules that matter on day one. Share it with new joiners before their first login.",
    readTime: "32 min watch",
    difficulty: "Foundational",
    updated: "May 2026",
    href: "#",
  },
];

const CATEGORIES: { key: CategoryKey; label: string; icon: LucideIcon }[] = [
  { key: "all",            label: "All resources",   icon: Layers       },
  { key: "implementation", label: "Implementation",  icon: Compass      },
  { key: "finance",        label: "Finance",         icon: Receipt      },
  { key: "inventory",      label: "Inventory",       icon: Truck        },
  { key: "manufacturing",  label: "Manufacturing",   icon: Factory      },
  { key: "sales",          label: "Sales & CRM",     icon: BarChart3    },
  { key: "people",         label: "People & training", icon: Users      },
];

const FORMATS: Format[] = ["Playbook", "Guide", "Template", "Video"];

// ─── Implementation phases (the step-by-step centerpiece) ────────────────────

type Phase = {
  number: string;
  title: string;
  duration: string;
  icon: LucideIcon;
  summary: string;
  tasks: string[];
  outputs: string[];
};

const PHASES: Phase[] = [
  {
    number: "01",
    title: "Discover",
    duration: "Week 1 – 2",
    icon: Compass,
    summary:
      "Map the operating model, agree on the modules in scope, and name owners for every workstream before a single record moves.",
    tasks: [
      "Two-day discovery workshop with finance, ops, and IT",
      "Process map of every transaction, every system",
      "Module scope, integration list, and data sources",
    ],
    outputs: ["Solution-design doc", "Workstream RACI", "Phased timeline"],
  },
  {
    number: "02",
    title: "Configure",
    duration: "Week 2 – 4",
    icon: Workflow,
    summary:
      "Stand up Bizak to mirror how your business actually runs — chart of accounts, item master, approval flows, branding.",
    tasks: [
      "Multi-entity, multi-branch, and multi-currency setup",
      "Approval matrices, document templates, role permissions",
      "Sandbox environment ready for the build team",
    ],
    outputs: ["Configured tenant", "Role library", "Doc templates"],
  },
  {
    number: "03",
    title: "Migrate",
    duration: "Week 3 – 5",
    icon: Database,
    summary:
      "Move master data and opening balances using validated templates — every record reconciled against your source system.",
    tasks: [
      "Cleanse master data with our pre-built validation rules",
      "Map and load customers, items, vendors, COA, balances",
      "Run a full mock cutover and reconcile to the cent",
    ],
    outputs: ["Reconciled balances", "Migration audit log", "Mock-cut sign-off"],
  },
  {
    number: "04",
    title: "Train",
    duration: "Week 5 – 7",
    icon: Users,
    summary:
      "Role-based enablement so each team learns the workflows they'll actually run — measured by certification, not by attendance.",
    tasks: [
      "Curricula tailored to finance, ops, sales, and managers",
      "In-product tasks that double as certification checks",
      "Champions network for in-house support after go-live",
    ],
    outputs: ["Certified users", "Quick-reference cards", "Champion roster"],
  },
  {
    number: "05",
    title: "Go-live",
    duration: "Week 7 – 8",
    icon: Rocket,
    summary:
      "Cut over on a controlled weekend, switch users on Monday, and run a hyper-care war-room for the first two weeks.",
    tasks: [
      "Hour-by-hour cutover runbook with rollback gates",
      "Live monitoring of every workflow on day one",
      "Daily standups with a Bizak engineer on call",
    ],
    outputs: ["Live system", "Hyper-care log", "Day-30 health report"],
  },
  {
    number: "06",
    title: "Optimise",
    duration: "Day 30 – 90+",
    icon: LineChart,
    summary:
      "Tune dashboards, automate the workflows you deferred, and graduate to advanced modules once the foundation is stable.",
    tasks: [
      "Dashboard review and KPI calibration",
      "Automation backlog cleared in two-week sprints",
      "Quarterly health checks with your success manager",
    ],
    outputs: ["KPI dashboards", "Automation library", "Roadmap plan"],
  },
];

// ─── Role-based starting points ──────────────────────────────────────────────

type Role = {
  icon: LucideIcon;
  audience: string;
  title: string;
  description: string;
  bullets: string[];
  cta: string;
  href: string;
  highlight?: boolean;
};

const ROLES: Role[] = [
  {
    icon: FileSpreadsheet,
    audience: "For finance leads",
    title: "The five-day month-end blueprint",
    description:
      "Re-engineer your close around auto-posted journals, scheduled reconciliations, and a tight task list everyone can see.",
    bullets: [
      "Auto-post recipes for AR, AP, payroll and FX",
      "Recon dashboards owners refresh in real time",
      "Audit-ready trail behind every figure",
    ],
    cta: "Open the close playbook",
    href: "#",
    highlight: true,
  },
  {
    icon: Factory,
    audience: "For ops & plant managers",
    title: "Floor visibility in fourteen days",
    description:
      "Stand up real-time OEE, work-order tracking, and downtime root-cause without ripping out a single existing system.",
    bullets: [
      "Wire shop-floor signals into Bizak",
      "Define availability, performance, quality",
      "Publish a live floor dashboard for ops review",
    ],
    cta: "Open the floor playbook",
    href: "#",
  },
  {
    icon: BarChart3,
    audience: "For sales & RevOps",
    title: "A pipeline finance can sign off on",
    description:
      "Stage-gate the funnel, weight forecasts, and tie quotes-to-cash so sales and finance debate strategy, not numbers.",
    bullets: [
      "Stage definitions, exit criteria, and SLAs",
      "Approval flows for discounts and credit",
      "Quote-to-cash automation patterns",
    ],
    cta: "Open the RevOps playbook",
    href: "#",
  },
];

// ─── Quick-start templates ────────────────────────────────────────────────────

type Template = {
  icon: LucideIcon;
  format: string;
  title: string;
  description: string;
  href: string;
};

const TEMPLATES: Template[] = [
  {
    icon: FileSpreadsheet,
    format: "XLSX · 184 KB",
    title: "Master-data migration workbook",
    description:
      "Pre-formatted sheets for customers, items, vendors, COA, and opening balances — with validation built in.",
    href: "#",
  },
  {
    icon: Workflow,
    format: "JSON · 12 KB",
    title: "Approval workflow library",
    description:
      "Drop-in approval chains for discounts, POs, expenses, and credit limits across Bizak Workflow Automation.",
    href: "#",
  },
  {
    icon: ShieldCheck,
    format: "PDF · 1.2 MB",
    title: "Go-live readiness checklist",
    description:
      "The 48-item gate review your project lead runs the week before cutover. Sign-off lines for every owner.",
    href: "#",
  },
  {
    icon: BookOpen,
    format: "PDF · 2.4 MB",
    title: "Operator field guide",
    description:
      "Role-based quick-reference cards for finance, sales, ops, and inventory — print, fold, and hand to new joiners.",
    href: "#",
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatIcon(format: Format): LucideIcon {
  switch (format) {
    case "Playbook": return BookMarked;
    case "Guide":    return BookOpen;
    case "Template": return FileText;
    case "Video":    return PlayCircle;
  }
}

function formatTone(format: Format): "sage" | "accent" | "neutral" {
  switch (format) {
    case "Playbook": return "accent";
    case "Guide":    return "sage";
    case "Template": return "neutral";
    case "Video":    return "neutral";
  }
}

// ─── Hero ────────────────────────────────────────────────────────────────────

function HeroSection() {
  return (
    <Section pad="hero" tone="light" className="biz-mesh overflow-hidden">
      <Container className="relative">
        <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-[1.05fr_1fr] lg:gap-20">
          {/* Left — text */}
          <div className="max-w-[640px]">
            <HeroBadge>Guides &amp; Playbooks</HeroBadge>
            <h1 className="mt-4 text-[clamp(40px,5.2vw,60px)] font-bold leading-[1.05] tracking-[-0.03em] text-bz-text">
              Step-by-step{" "}
              <span className="relative inline-block">
                playbooks
                <span className="absolute inset-x-0 bottom-1 -z-0 h-[10px] rounded-full bg-bz-accent/55" />
              </span>{" "}
              for running Bizak well.
            </h1>
            <p className="mt-5 max-w-[560px] text-[17px] leading-[1.7] text-bz-text-muted">
              Implementation runbooks, role-based playbooks, configuration
              templates, and the operator videos our customers use to roll Bizak
              out — written by the team that ships the product.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button variant="primary" size="md" href="#library" withArrow>
                Browse the library
              </Button>
              <Button variant="ghost" size="md" href="#implementation">
                See the 60-day timeline
              </Button>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-bz-text-soft">
              <span className="inline-flex items-center gap-1.5">
                <BookMarked className="size-[14px] text-bz-sage" strokeWidth={1.8} />
                90+ playbooks &amp; guides
              </span>
              <span aria-hidden className="size-1 rounded-full bg-bz-text-soft/40" />
              <span>Updated monthly</span>
              <span aria-hidden className="size-1 rounded-full bg-bz-text-soft/40" />
              <span>Curated by the build team</span>
            </div>
          </div>

          {/* Right — featured cover */}
          <a
            href={FEATURED.href}
            className="group relative mx-auto block w-full max-w-[460px] overflow-hidden rounded-bz-2xl border border-bz-border bg-bz-deep shadow-[0_24px_64px_rgba(15,17,14,0.18)] transition-transform duration-300 hover:-translate-y-1 lg:mx-0"
          >
            <div className="relative p-8 md:p-9">
              <div className="flex items-center justify-between gap-3">
                <PillBadge tone="accent" dot>
                  Featured playbook
                </PillBadge>
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/55">
                  60-day rollout
                </span>
              </div>

              <h2 className="mt-7 text-[clamp(22px,2.6vw,30px)] font-bold leading-[1.2] tracking-[-0.01em] text-white">
                {FEATURED.title}
              </h2>
              <p className="mt-4 text-[14.5px] leading-[1.65] text-white/65">
                {FEATURED.description}
              </p>

              {/* Highlight checklist */}
              <ul className="mt-7 space-y-3">
                {FEATURED.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-3 text-[13.5px] leading-[1.55] text-white/75">
                    <CheckCircle2 className="mt-0.5 size-[15px] shrink-0 text-bz-accent" strokeWidth={2} />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>

              {/* Meta strip */}
              <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/10 pt-5 text-[12px] text-white/55">
                {FEATURED.meta.map(({ icon: MetaIcon, label }) => (
                  <span key={label} className="inline-flex items-center gap-1.5">
                    <MetaIcon className="size-[13px] text-bz-accent" strokeWidth={1.8} />
                    {label}
                  </span>
                ))}
              </div>

              <div className="mt-7 flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/50">
                  Implementation
                </span>
                <span className="inline-flex items-center gap-1.5 text-[13px] font-bold text-bz-accent transition-transform duration-200 group-hover:translate-x-0.5">
                  Read the playbook
                  <ArrowUpRight className="size-[14px]" strokeWidth={2.2} />
                </span>
              </div>
            </div>
          </a>
        </div>
      </Container>
    </Section>
  );
}

// ─── Implementation timeline (the step-by-step centerpiece) ──────────────────

function ImplementationSection() {
  return (
    <Section tone="white" pad="default" id="implementation">
      <Container>
        <div className="grid grid-cols-1 gap-10 md:grid-cols-[minmax(0,1fr)_auto] md:items-end md:gap-14">
          <SectionHeading
            eyebrow="The 60-day implementation"
            title={
              <>
                From kickoff to go-live —{" "}
                <span className="text-bz-sage">six phases, one timeline.</span>
              </>
            }
            description="Every Bizak rollout follows the same six-phase arc. Use it as a reference timeline, lift the artefacts you need, and tailor the rhythm to your team."
            maxWidth={680}
          />
          <div className="flex shrink-0 flex-wrap items-center gap-3 md:justify-end">
            <PillBadge tone="sage">Avg. 8 weeks to live</PillBadge>
            <PillBadge tone="neutral">Mid-market</PillBadge>
          </div>
        </div>

        {/* Timeline grid */}
        <div className="relative mt-14 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {/* Decorative connector — only on md+ */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-[44px] hidden h-px bg-gradient-to-r from-transparent via-bz-border to-transparent lg:block"
          />

          {PHASES.map((phase) => {
            const PhaseIcon = phase.icon;
            return (
              <Card
                key={phase.number}
                tone="light"
                pad="lg"
                hover="lift"
                className="relative flex flex-col"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[12px] font-bold uppercase tracking-[0.18em] text-bz-text-soft">
                    Phase {phase.number}
                  </span>
                  <IconBadge size="md" tone="sage">
                    <PhaseIcon className="size-[18px]" strokeWidth={1.8} />
                  </IconBadge>
                </div>

                <h3 className="mt-6 text-[22px] font-bold tracking-[-0.01em] text-bz-text">
                  {phase.title}
                </h3>
                <div className="mt-1 inline-flex items-center gap-2 text-[12.5px] font-semibold text-bz-sage">
                  <Clock3 className="size-[13px]" strokeWidth={2} />
                  {phase.duration}
                </div>

                <p className="mt-4 text-[14px] leading-[1.65] text-bz-text-muted">
                  {phase.summary}
                </p>

                <div className="mt-6 rounded-bz-lg bg-bz-bg p-4">
                  <div className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-bz-text-soft">
                    Key tasks
                  </div>
                  <ul className="mt-3 space-y-2">
                    {phase.tasks.map((task) => (
                      <li
                        key={task}
                        className="flex items-start gap-2.5 text-[13px] leading-[1.55] text-bz-text-muted"
                      >
                        <CheckCircle2 className="mt-0.5 size-[13px] shrink-0 text-bz-sage" strokeWidth={2} />
                        <span>{task}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-5 flex flex-wrap gap-1.5 border-t border-bz-border-soft pt-5">
                  {phase.outputs.map((output) => (
                    <span
                      key={output}
                      className="rounded-bz-pill bg-bz-sage-soft px-2.5 py-1 text-[11px] font-semibold text-bz-sage"
                    >
                      {output}
                    </span>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}

// ─── Library (filterable feed) ───────────────────────────────────────────────

function LibrarySection() {
  const [category, setCategory] = useState<CategoryKey>("all");
  const [activeFormats, setActiveFormats] = useState<Set<Format>>(new Set());
  const [query, setQuery] = useState("");

  const counts = useMemo(() => {
    const map: Record<CategoryKey, number> = {
      all: RESOURCES.length,
      implementation: 0,
      finance: 0,
      inventory: 0,
      manufacturing: 0,
      sales: 0,
      people: 0,
    };
    RESOURCES.forEach((r) => {
      map[r.category] += 1;
    });
    return map;
  }, []);

  const items = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    return RESOURCES.filter((r) => {
      if (category !== "all" && r.category !== category) return false;
      if (activeFormats.size > 0 && !activeFormats.has(r.format)) return false;
      if (trimmed.length > 0) {
        const haystack = `${r.title} ${r.description}`.toLowerCase();
        if (!haystack.includes(trimmed)) return false;
      }
      return true;
    });
  }, [category, activeFormats, query]);

  const toggleFormat = (f: Format) => {
    setActiveFormats((prev) => {
      const next = new Set(prev);
      if (next.has(f)) next.delete(f);
      else next.add(f);
      return next;
    });
  };

  return (
    <Section tone="light" pad="default" id="library">
      <Container>
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between md:gap-10">
          <div className="max-w-[620px]">
            <Eyebrow>The library</Eyebrow>
            <h2 className="mt-3 text-[clamp(28px,3.4vw,40px)] font-bold leading-[1.1] tracking-[-0.02em] text-bz-text">
              Every playbook, guide and template — in one place.
            </h2>
            <p className="mt-3 text-[15px] leading-[1.7] text-bz-text-muted">
              Filter by team, format, or what you're trying to ship this
              quarter. New resources are added every month as the product evolves.
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
                placeholder="Search the library…"
                aria-label="Search guides and playbooks"
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

        {/* Category pills */}
        <div className="-mx-6 mt-10 overflow-x-auto px-6 md:mx-0 md:overflow-visible md:px-0">
          <div className="flex min-w-max flex-nowrap items-center gap-2 md:min-w-0 md:flex-wrap">
            {CATEGORIES.map((c) => {
              const CatIcon = c.icon;
              const isActive = category === c.key;
              return (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => setCategory(c.key)}
                  aria-pressed={isActive}
                  className={[
                    "inline-flex shrink-0 items-center gap-2 rounded-bz-pill border px-3.5 py-2 text-[13px] font-semibold transition-colors",
                    isActive
                      ? "border-bz-deep bg-bz-deep text-white"
                      : "border-bz-border bg-bz-surface text-bz-text-muted hover:border-bz-sage-mid hover:bg-bz-sage-soft hover:text-bz-text",
                  ].join(" ")}
                >
                  <CatIcon
                    className={[
                      "size-[14px]",
                      isActive ? "text-bz-accent" : "text-bz-text-soft",
                    ].join(" ")}
                    strokeWidth={1.8}
                  />
                  <span>{c.label}</span>
                  <span
                    className={[
                      "rounded-bz-pill px-1.5 text-[11px] font-bold tabular-nums",
                      isActive
                        ? "bg-white/15 text-white/75"
                        : "bg-bz-bg text-bz-text-soft",
                    ].join(" ")}
                  >
                    {counts[c.key]}
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
          {(activeFormats.size > 0 || category !== "all" || query) && (
            <button
              type="button"
              onClick={() => {
                setActiveFormats(new Set());
                setCategory("all");
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
              No resources match those filters yet.
            </h3>
            <p className="mt-2 text-[14px] text-bz-text-muted">
              Reset the filters or tell us what's missing — we publish new
              playbooks every month.
            </p>
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <ResourceCard key={item.id} item={item} />
            ))}
          </div>
        )}

        <div className="mt-8 text-[12.5px] text-bz-text-soft">
          Showing <span className="font-bold text-bz-text">{items.length}</span> of{" "}
          <span className="font-bold text-bz-text">{RESOURCES.length}</span> resources
        </div>
      </Container>
    </Section>
  );
}

function ResourceCard({ item }: { item: Resource }) {
  const FormatIcon = formatIcon(item.format);
  return (
    <a
      href={item.href}
      className="group flex h-full flex-col overflow-hidden rounded-bz-xl border border-bz-border bg-bz-surface transition-all duration-200 hover:-translate-y-[2px] hover:border-bz-sage-mid hover:shadow-[0_16px_40px_rgba(15,17,14,0.06)]"
    >
      <div className="flex items-center justify-between gap-3 border-b border-bz-border-soft px-6 pt-6 pb-5">
        <PillBadge tone={formatTone(item.format)} dot={item.format === "Playbook"}>
          <span className="inline-flex items-center gap-1.5">
            <FormatIcon className="size-[11px]" strokeWidth={2.2} />
            {item.format}
          </span>
        </PillBadge>
        <span className="text-[11px] uppercase tracking-[0.08em] text-bz-text-soft">
          {item.updated}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="text-[17.5px] font-bold leading-[1.3] tracking-[-0.005em] text-bz-text transition-colors group-hover:text-bz-sage">
          {item.title}
        </h3>
        <p className="mt-2 flex-1 text-[13.5px] leading-[1.65] text-bz-text-muted">
          {item.description}
        </p>

        <div className="mt-6 flex items-center justify-between gap-3 border-t border-bz-border-soft pt-4">
          <div className="flex items-center gap-3 text-[11.5px] font-semibold text-bz-text-soft">
            <span className="inline-flex items-center gap-1">
              <Clock3 className="size-[12px]" strokeWidth={2} />
              {item.readTime}
            </span>
            {typeof item.steps === "number" && (
              <>
                <span aria-hidden className="size-1 rounded-full bg-bz-text-soft/40" />
                <span className="tabular-nums">{item.steps} steps</span>
              </>
            )}
            <span aria-hidden className="size-1 rounded-full bg-bz-text-soft/40" />
            <span>{item.difficulty}</span>
          </div>
          <span className="inline-flex items-center gap-1 text-[12.5px] font-bold text-bz-sage transition-transform duration-200 group-hover:translate-x-0.5">
            Read
            <ArrowUpRight className="size-[13px]" strokeWidth={2.2} />
          </span>
        </div>
      </div>
    </a>
  );
}

// ─── Role-based playbooks ────────────────────────────────────────────────────

function RolePlaybooksSection() {
  return (
    <Section tone="white" pad="default">
      <Container>
        <SectionHeading
          eyebrow="Pick your starting point"
          title="Role-based playbooks for the people running Bizak"
          description="Three deep-dives, each written for a specific operator. Lift the templates, follow the runbook, and ship the outcome in weeks — not quarters."
          maxWidth={760}
          className="mb-12"
        />

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {ROLES.map(({ icon: RoleIcon, ...role }) => (
            <Card
              key={role.title}
              tone="light"
              pad="lg"
              hover="lift"
              className={role.highlight ? "border-bz-sage-mid" : ""}
            >
              <div className="flex items-center justify-between">
                <IconBadge size="lg" tone={role.highlight ? "accent" : "sage"}>
                  <RoleIcon className="size-5" strokeWidth={1.8} />
                </IconBadge>
                <PillBadge tone={role.highlight ? "accent" : "neutral"} dot={role.highlight}>
                  {role.audience}
                </PillBadge>
              </div>

              <h3 className="mt-7 text-[22px] font-bold tracking-[-0.01em] text-bz-text">
                {role.title}
              </h3>
              <p className="mt-3 text-[14.5px] leading-[1.7] text-bz-text-muted">
                {role.description}
              </p>

              <ul className="mt-6 space-y-3 border-t border-bz-border-soft pt-6">
                {role.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-3 text-[13.5px] leading-[1.55] text-bz-text-muted">
                    <CheckCircle2 className="mt-0.5 size-[14px] shrink-0 text-bz-sage" strokeWidth={2} />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>

              <a
                href={role.href}
                className="mt-7 inline-flex items-center gap-1.5 text-[13.5px] font-bold text-bz-sage transition-colors hover:text-bz-sage-hover"
              >
                {role.cta}
                <ArrowRight className="size-[14px]" />
              </a>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}

// ─── Templates & quick-starts ────────────────────────────────────────────────

function TemplatesSection() {
  return (
    <Section tone="light" pad="default">
      <Container>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[360px_1fr] lg:gap-16">
          <div className="lg:sticky lg:top-[100px] lg:self-start">
            <Eyebrow>Quick-start kit</Eyebrow>
            <h2 className="mt-3 text-[34px] font-bold leading-[1.1] tracking-[-0.02em] text-bz-text md:text-[40px]">
              Skip the blank page.
            </h2>
            <p className="mt-4 text-[15.5px] leading-[1.7] text-bz-text-muted">
              Start from the same templates and checklists our consultants use
              on every rollout. Download, customise, and drop straight into your
              project plan.
            </p>
            <div className="mt-7">
              <Button variant="outline" size="md" href="/documentation">
                See the full document library
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {TEMPLATES.map((t) => {
              const TIcon = t.icon;
              return (
                <a
                  key={t.title}
                  href={t.href}
                  className="group flex h-full flex-col rounded-bz-xl border border-bz-border bg-bz-surface p-6 transition-all duration-200 hover:-translate-y-[2px] hover:border-bz-sage-mid hover:shadow-[0_16px_40px_rgba(15,17,14,0.06)]"
                >
                  <div className="flex items-center justify-between">
                    <IconBadge size="md" tone="sage">
                      <TIcon className="size-[18px]" strokeWidth={1.8} />
                    </IconBadge>
                    <span className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-bz-text-soft">
                      {t.format}
                    </span>
                  </div>
                  <h3 className="mt-5 text-[16.5px] font-bold tracking-[-0.01em] text-bz-text">
                    {t.title}
                  </h3>
                  <p className="mt-2 flex-1 text-[13.5px] leading-[1.65] text-bz-text-muted">
                    {t.description}
                  </p>
                  <span className="mt-5 inline-flex items-center gap-1 text-[12.5px] font-bold text-bz-sage transition-transform duration-200 group-hover:translate-x-0.5">
                    Download
                    <ArrowUpRight className="size-[13px]" strokeWidth={2.2} />
                  </span>
                </a>
              );
            })}
          </div>
        </div>
      </Container>
    </Section>
  );
}

// ─── Closing CTA ─────────────────────────────────────────────────────────────

function ClosingCta() {
  return (
    <Section tone="dark" pad="default">
      <Container width="narrow">
        <SectionHeading
          eyebrow="Need a hand?"
          eyebrowTone="accent"
          title={
            <>
              Plan your rollout with{" "}
              <span className="text-bz-accent">a Bizak specialist.</span>
            </>
          }
          description="Bring your timeline, your team, and the modules in scope. We'll match the right playbook, walk through the gates, and stay on call until you're live."
          tone="light"
          align="center"
          maxWidth={680}
        />
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Button variant="accent" size="lg" href="/contact" withArrow>
            Talk to an implementation lead
          </Button>
          <Button variant="ghostDark" size="lg" href="/HelpCenter">
            Visit the Help Center
          </Button>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 border-t border-white/10 pt-8 text-[13px] text-white/55">
          {[
            { icon: ShieldCheck, label: "Implementation guidance included" },
            { icon: Clock3,      label: "Most rollouts go live in 8 weeks" },
            { icon: Users,       label: "50,000+ businesses powered by Bizak" },
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

export function GuidesAndPlaybooksPage() {
  return (
    <div>
      <Header />
      <main style={{ paddingTop: 76 }}>
        <HeroSection />
        <ImplementationSection />
        <LibrarySection />
        <RolePlaybooksSection />
        <TemplatesSection />
        <ClosingCta />
      </main>
      <Footer />
    </div>
  );
}
