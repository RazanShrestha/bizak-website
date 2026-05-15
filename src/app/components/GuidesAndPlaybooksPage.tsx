import "../../styles/style.css";
import {
  ArrowRight,
  Clock3,
  FileSpreadsheet,
  Flag,
  GraduationCap,
  Layers,
  ListChecks,
  PenLine,
  type LucideIcon,
} from "lucide-react";
import {
  BadgeGreen,
  Container,
  Heading,
  Pill,
  PillGroup,
  Section,
  SectionHead,
} from "./bz";
import {
  CATEGORY_META,
  RESOURCES,
  formatIcon,
  type CategoryKey,
  type Resource,
} from "./guides/resources";

// ════════════════════════════════════════════════════════════════════════════
// CONTENT DATA
//
// Reference data only. The library and topic counts read from the shared
// guides/resources.ts registry swap that file for the real CMS later and
// this page updates itself.
// ════════════════════════════════════════════════════════════════════════════

const FEATURED: Resource = RESOURCES.find((r) => r.featured) ?? RESOURCES[0];

// The six phases of the featured implementation playbook (hero mock).
const HERO_PHASES: { n: string; name: string; meta: string }[] = [
  { n: "01", name: "Discover", meta: "Week 1-2" },
  { n: "02", name: "Configure", meta: "Week 2-4" },
  { n: "03", name: "Migrate", meta: "Week 3-5" },
  { n: "04", name: "Train", meta: "Week 5-7" },
  { n: "05", name: "Go-live", meta: "Week 7-8" },
  { n: "06", name: "Optimise", meta: "Day 30+" },
];

// A curated slice of the library mixed formats, mixed teams.
const LIBRARY_SLUGS = [
  "sixty-day-implementation",
  "five-day-close",
  "multi-warehouse-setup",
  "bom-design",
  "data-migration-workbook",
  "guided-product-tour",
];
const LIBRARY: Resource[] = LIBRARY_SLUGS.map((slug) =>
  RESOURCES.find((r) => r.slug === slug),
).filter((r): r is Resource => Boolean(r));

// One card per module shelf, with a live count from the registry.
const TOPICS = (Object.keys(CATEGORY_META) as CategoryKey[]).map((key) => ({
  key,
  label: CATEGORY_META[key].label,
  icon: CATEGORY_META[key].icon,
  count: RESOURCES.filter((r) => r.category === key).length,
}));

// What every Bizak playbook is built from.
const FORMAT: { icon: LucideIcon; title: string; desc: string }[] = [
  {
    icon: ListChecks,
    title: "A step-by-step runbook",
    desc: "Every phase is broken into tasks, each with a named owner and a clear output.",
  },
  {
    icon: Flag,
    title: "Built-in decision gates",
    desc: "Know exactly what has to be true before the next phase is allowed to start.",
  },
  {
    icon: FileSpreadsheet,
    title: "Ready-to-use templates",
    desc: "The same workbooks and checklists our consultants use on every rollout.",
  },
  {
    icon: PenLine,
    title: "Written by the build team",
    desc: "Field-tested guidance from the people who ship the product, never theory.",
  },
];

// ════════════════════════════════════════════════════════════════════════════
// [HERO]
// ════════════════════════════════════════════════════════════════════════════

function HeroSection() {
  return (
    <Section tone="b" pad="hero">
      <Container>
        <div className="flex flex-col items-center text-center">
          <BadgeGreen style={{ marginBottom: 28 }}>
            Guides &amp; Playbooks
          </BadgeGreen>

          <Heading level={2} style={{ marginBottom: 36 }}>
            Playbooks and guides for{" "}
            <br />
            <Heading.Muted>running Bizak well.</Heading.Muted>
          </Heading>

          <PillGroup>
            <Pill
              variant="dark"
              withArrowUpRight
              href="https://system.bizakerp.com/account/self-register"
            >
              Get Started
            </Pill>
            <Pill variant="light" withArrow href="/contact">
              Request Demo
            </Pill>
          </PillGroup>
        </div>

        <div className="bz-hero-visual mx-auto w-full max-w-[1060px]">
          <HeroGuideMock />
        </div>
      </Container>
    </Section>
  );
}

// Page-specific mock a single featured-playbook "cover + contents" card.
function HeroGuideMock() {
  const META = [
    { icon: Clock3, label: `${FEATURED.readTime} read` },
    { icon: Layers, label: "6 phases" },
    { icon: GraduationCap, label: FEATURED.difficulty },
  ];
  return (
    <a
      href={`/GuidesAndPlaybooks/${FEATURED.slug}`}
      className="group block overflow-hidden rounded-bz-2xl border border-bz-line-soft bg-bz-paper transition-transform duration-300 hover:-translate-y-1"
    >
      {/* Cover olive zone */}
      <div className="bg-bz-olive p-7 sm:p-9 md:p-10">
        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.14em] text-bz-text-on-dark-muted">
            <span className="size-1.5 rounded-bz-pill bg-bz-fire" />
            Featured playbook
          </span>
          <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-bz-text-on-dark-soft">
            Implementation
          </span>
        </div>

        <p className="mt-6 max-w-[760px] text-[clamp(21px,2.9vw,30px)] font-medium leading-[1.22] tracking-[-0.01em] text-bz-text-on-dark">
          {FEATURED.title}
        </p>

        <div className="mt-7 flex flex-wrap gap-2">
          {META.map(({ icon: Icon, label }) => (
            <span
              key={label}
              className="inline-flex items-center gap-1.5 rounded-bz-pill bg-white/[0.07] px-3 py-1.5 text-[12px] font-medium text-bz-text-on-dark"
            >
              <Icon size={13} strokeWidth={1.8} className="text-bz-leaf" />
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* Contents paper zone */}
      <div className="p-7 sm:p-9">
        <p className="text-[11px] font-medium uppercase tracking-[0.13em] text-bz-text-soft">
          Phase by phase
        </p>

        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {HERO_PHASES.map((p) => (
            <div
              key={p.n}
              className="flex items-center gap-3 rounded-bz-md border border-bz-line-soft bg-bz-paper-warm px-3.5 py-3"
            >
              <span className="flex size-7 shrink-0 items-center justify-center rounded-bz-sm bg-bz-olive text-[11px] font-medium tabular-nums text-bz-text-on-dark">
                {p.n}
              </span>
              <span className="flex-1 text-[13px] font-medium text-bz-text">
                {p.name}
              </span>
              <span className="text-[11px] tabular-nums text-bz-text-muted">
                {p.meta}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-bz-line-soft pt-5">
          <span className="text-[12px] text-bz-text-muted">
            Updated {FEATURED.updated}
          </span>
          <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-bz-text">
            Read the playbook
            <ArrowRight
              size={14}
              strokeWidth={2}
              className="transition-transform duration-200 group-hover:translate-x-0.5"
            />
          </span>
        </div>
      </div>
    </a>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// [01] THE LIBRARY  editorial index of guides
// ════════════════════════════════════════════════════════════════════════════

function LibrarySection() {
  return (
    <Section tone="a">
      <Container>
        <SectionHead
          index="01"
          label="The library"
          title={
            <>
              Hands-on resources for{" "}
              <Heading.Muted>every team that runs Bizak.</Heading.Muted>
            </>
          }
          description="Implementation runbooks, configuration templates and operator videos, written by the people who build Bizak and refreshed as the product evolves."
          titleMaxWidth={720}
        />

        <div>
          {LIBRARY.map((resource) => (
            <LibraryRow key={resource.slug} resource={resource} />
          ))}
        </div>
      </Container>
    </Section>
  );
}

function LibraryRow({ resource }: { resource: Resource }) {
  const Icon = formatIcon(resource.format);
  return (
    <a
      href={`/GuidesAndPlaybooks/${resource.slug}`}
      className="group flex items-center gap-4 border-b border-bz-line-soft py-6 last:border-b-0 sm:gap-6 sm:py-7"
    >
      <span className="flex size-11 shrink-0 items-center justify-center rounded-bz-lg border border-bz-line-soft bg-bz-paper-warm text-bz-text sm:size-12">
        <Icon size={19} strokeWidth={1.6} />
      </span>

      <div className="min-w-0 flex-1">
        <div className="mb-1.5 flex items-center gap-2.5">
          <span className="rounded-bz-sm border border-bz-line bg-bz-surface px-1.5 py-[3px] text-[10px] font-semibold uppercase tracking-[0.07em] text-bz-text-muted">
            {resource.format}
          </span>
          <span className="text-[12px] text-bz-text-soft">
            {CATEGORY_META[resource.category].label}
          </span>
        </div>
        <h3 className="line-clamp-2 text-[15.5px] font-medium leading-snug text-bz-text sm:text-[17px]">
          {resource.title}
        </h3>
        <p className="mt-1 line-clamp-1 text-[13px] leading-[1.55] text-bz-text-muted">
          {resource.summary}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-4 sm:gap-7">
        <span className="hidden whitespace-nowrap text-[12.5px] tabular-nums text-bz-text-muted sm:block">
          {resource.readTime}
        </span>
        <ArrowRight
          size={18}
          strokeWidth={1.8}
          className="shrink-0 text-bz-text-soft transition-all duration-200 group-hover:translate-x-1 group-hover:text-bz-text"
        />
      </div>
    </a>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// [02] COVERAGE  one shelf per module
// ════════════════════════════════════════════════════════════════════════════

function CoverageSection() {
  return (
    <Section tone="dark">
      <Container>
        <SectionHead
          index="02"
          label="Coverage"
          tone="dark"
          title={
            <>
              A shelf for{" "}
              <Heading.Muted>every part of the business.</Heading.Muted>
            </>
          }
          description="Each module carries its own set of field-tested guides, so you can go straight to the part of the rollout you are working on."
          titleMaxWidth={720}
        />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {TOPICS.map(({ key, label, icon: Icon, count }) => (
            <div
              key={key}
              className="flex items-center gap-4 rounded-bz-xl border border-white/[0.08] bg-white/[0.04] p-5 sm:p-6"
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-bz-lg border border-white/[0.08] bg-white/[0.05]">
                <Icon size={19} strokeWidth={1.6} className="text-bz-leaf" />
              </span>
              <div className="min-w-0">
                <p className="text-[14.5px] font-medium text-bz-text-on-dark">
                  {label}
                </p>
                <p className="mt-0.5 text-[12px] tabular-nums text-bz-text-on-dark-soft">
                  {count} guides
                </p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// [03] THE FORMAT  what every playbook is built from
// ════════════════════════════════════════════════════════════════════════════

function FormatSection() {
  return (
    <Section tone="b">
      <Container>
        <SectionHead
          index="03"
          label="The format"
          title={
            <>
              Every playbook is built{" "}
              <Heading.Muted>the same trusted way.</Heading.Muted>
            </>
          }
          titleMaxWidth={720}
        />

        <div className="grid grid-cols-1 gap-x-8 gap-y-9 sm:grid-cols-2 lg:grid-cols-4">
          {FORMAT.map(({ icon: Icon, title, desc }, i) => (
            <div key={title} className="border-t border-bz-line pt-6">
              <div className="flex items-center justify-between">
                <span className="flex size-10 items-center justify-center rounded-bz-lg border border-bz-line-soft bg-bz-surface text-bz-text">
                  <Icon size={17} strokeWidth={1.6} />
                </span>
                <span className="text-[12px] font-medium tabular-nums text-bz-text-soft">
                  {`0${i + 1}`}
                </span>
              </div>
              <h3 className="mt-5 text-[15.5px] font-medium leading-snug text-bz-text">
                {title}
              </h3>
              <p className="mt-2 text-[13.5px] leading-[1.6] text-bz-text-muted">
                {desc}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PAGE
// ════════════════════════════════════════════════════════════════════════════

export function GuidesAndPlaybooksPage() {
  return (
    <main>
      <HeroSection />
      <LibrarySection />
      <CoverageSection />
      <FormatSection />
    </main>
  );
}
