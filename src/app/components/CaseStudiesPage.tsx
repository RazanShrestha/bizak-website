import { useState, type ReactNode } from "react";
import "../../styles/style.css";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Section, Container, SectionHead, Eyebrow, Heading, Pill } from "./bz";
import { CASE_STUDY_LIST, FEATURED_STUDIES } from "./caseStudyData";

// ════════════════════════════════════════════════════════════════════════════
// DATA  studies come from caseStudyData; only the filter taxonomy is local.
// ════════════════════════════════════════════════════════════════════════════
const FILTERS = ["All Industries", "Manufacturing", "Retail & Commerce", "Professional Services", "Logistics", "Technology"];

const FILTER_MAP: Record<string, string[]> = {
  "All Industries":        CASE_STUDY_LIST.map((s) => s.industry),
  "Manufacturing":         ["Manufacturing"],
  "Retail & Commerce":     ["Retail"],
  "Professional Services": ["Professional Services"],
  "Logistics":             ["Logistics"],
  "Technology":            ["Technology", "Fintech"],
};

const PAGE_SIZE = 3;

const cs = (slug: string) => `/case-studies/${slug}`;

// ════════════════════════════════════════════════════════════════════════════
// SHARED inline arrow link (used on dark surfaces)
// ════════════════════════════════════════════════════════════════════════════
function ArrowLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      className="group/al inline-flex items-center gap-2 text-[12px] font-medium uppercase tracking-[0.14em] text-bz-text-on-dark transition-colors hover:text-bz-fire"
    >
      {children}
      <ArrowRight size={15} className="transition-transform group-hover/al:translate-x-1" />
    </a>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// HERO featured story + side column
// ════════════════════════════════════════════════════════════════════════════
function HeroSection() {
  const { hero, fintech } = FEATURED_STUDIES;
  return (
    <Section tone="b" pad="hero">
      <Container>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
          {/* Main featured card */}
          <article className="group relative flex min-h-[440px] flex-col justify-end overflow-hidden rounded-bz-3xl bg-bz-olive lg:min-h-[620px]">
            <img
              src={hero.image}
              alt=""
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div aria-hidden className="absolute inset-0 bg-bz-olive/70" />
            <div className="relative z-10 p-6 sm:p-10 lg:p-14">
              <span className="mb-6 inline-block rounded-bz-pill bg-bz-fire px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-bz-olive">
                Enterprise Case Study
              </span>
              <Heading level={2} tone="dark" className="mb-5 max-w-[600px]">
                {hero.title}
              </Heading>
              <p className="mb-8 max-w-[480px] text-[15px] leading-[1.7] text-white/75">
                {hero.summary}
              </p>
              <Pill variant="light" withArrow href={cs(hero.slug)}>Read Full Story</Pill>
            </div>
          </article>

          {/* Side column */}
          <div className="flex flex-col gap-6">
            {/* Fintech card */}
            <article className="group relative flex min-h-[280px] flex-1 flex-col justify-end overflow-hidden rounded-bz-3xl bg-bz-olive p-8 text-bz-text-on-dark sm:p-10">
              <img
                src={fintech.image}
                alt=""
                className="absolute inset-0 h-full w-full object-cover opacity-40 grayscale transition-all duration-700 group-hover:opacity-60 group-hover:grayscale-0"
              />
              <div aria-hidden className="absolute inset-0 bg-bz-olive/70" />
              <div className="relative z-10">
                <Eyebrow tone="dark" className="mb-3">Fintech Leadership</Eyebrow>
                <h3 className="mb-5 max-w-[280px] text-[1.35rem] font-medium leading-[1.25] tracking-[-0.02em]">
                  {fintech.title}
                </h3>
                <ArrowLink href={cs(fintech.slug)}>View Case Study</ArrowLink>
              </div>
            </article>

            {/* Testimonial card */}
            <article className="flex min-h-[280px] flex-1 flex-col justify-between rounded-bz-3xl bg-bz-leaf p-8 sm:p-10">
              <div>
                <Eyebrow className="mb-5">Supply Chain Testimonial</Eyebrow>
                <p className="text-[1.15rem] font-medium italic leading-[1.4] tracking-[-0.01em] text-bz-text">
                  "Bizak gave us a 360-degree view of our supply chain we never
                  thought possible in this industry."
                </p>
              </div>
              <div className="mt-7 flex items-center gap-4">
                <div className="flex size-12 flex-shrink-0 items-center justify-center rounded-bz-pill bg-bz-olive text-[13px] font-semibold text-bz-leaf">
                  ER
                </div>
                <div>
                  <div className="text-[14px] font-medium text-bz-text">Elena Rodriguez</div>
                  <div className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-bz-text-muted">
                    Head of Logistics, Aerovant
                  </div>
                </div>
              </div>
            </article>
          </div>
        </div>
      </Container>
    </Section>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// FEATURED SPOTLIGHT
// ════════════════════════════════════════════════════════════════════════════
function FeaturedSpotlight() {
  const { spotlight } = FEATURED_STUDIES;
  return (
    <Section tone="a" pad="tight">
      <Container>
        <div className="mb-8 text-center">
          <Eyebrow>Featured Spotlight</Eyebrow>
        </div>

        <article className="grid grid-cols-1 overflow-hidden rounded-bz-3xl bg-bz-olive lg:grid-cols-2">
          {/* Content */}
          <div className="flex flex-col justify-between gap-12 p-8 sm:p-12 lg:p-16">
            <div>
              <Eyebrow tone="dark" className="mb-8">Customer Spotlight</Eyebrow>
              <Heading level={3} tone="dark" className="mb-10">
                {spotlight.title}
              </Heading>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8">
                {spotlight.stats.slice(0, 2).map((s) => (
                  <div key={s.label} className="min-w-0 border-l-2 border-bz-fire pl-5 sm:pl-6">
                    <div className="bz-stat-num bz-stat-num-light">{s.value}</div>
                    <div className="mt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/45">
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <ArrowLink href={cs(spotlight.slug)}>Read the full case study</ArrowLink>
          </div>

          {/* Image */}
          <div className="relative min-h-[300px] lg:min-h-full">
            <img src={spotlight.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div aria-hidden className="absolute inset-0 bg-bz-olive/20" />
          </div>
        </article>
      </Container>
    </Section>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ALL STORIES filterable grid
// ════════════════════════════════════════════════════════════════════════════
function AllStories() {
  const [activeFilter, setActiveFilter] = useState("All Industries");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const filtered = CASE_STUDY_LIST.filter((s) => FILTER_MAP[activeFilter]?.includes(s.industry));
  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  const selectFilter = (f: string) => {
    setActiveFilter(f);
    setVisibleCount(PAGE_SIZE);
  };

  return (
    <Section tone="b" pad="tight">
      <Container>
        <SectionHead
          title="All Stories"
          description="Browse success stories from businesses across South Asia using Bizak to run better."
        />

        {/* Filter chips rectangular, outlined when inactive, solid when active */}
        <div className="mb-10 flex gap-2.5 overflow-x-auto border-b border-bz-line-soft pb-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {FILTERS.map((f) => {
            const active = f === activeFilter;
            return (
              <button
                key={f}
                type="button"
                onClick={() => selectFilter(f)}
                className={`flex-shrink-0 whitespace-nowrap rounded-bz-sm border px-5 py-2.5 text-[11px] font-medium uppercase tracking-[0.12em] transition-colors ${
                  active
                    ? "border-bz-olive bg-bz-olive text-bz-text-on-dark"
                    : "border-bz-line bg-transparent text-bz-text-muted hover:border-bz-olive hover:text-bz-text"
                }`}
              >
                {f}
              </button>
            );
          })}
        </div>

        {/* Story grid */}
        {visible.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((story) => (
              <a
                key={story.slug}
                href={cs(story.slug)}
                className="group flex flex-col overflow-hidden rounded-bz-2xl border border-bz-line-soft bg-bz-surface no-underline transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_60px_-15px_rgba(15,20,17,0.18)]"
              >
                <div className="relative h-[240px] overflow-hidden">
                  <img
                    src={story.image}
                    alt=""
                    className="h-full w-full object-cover grayscale transition-all duration-700 group-hover:scale-105 group-hover:grayscale-0"
                  />
                </div>
                <div className="flex flex-1 flex-col p-6 md:p-7">
                  <div className="mb-5 flex items-center justify-between">
                    <Eyebrow>{story.industry}</Eyebrow>
                    <ArrowUpRight
                      size={18}
                      className="text-bz-text-soft transition-colors group-hover:text-bz-text"
                    />
                  </div>
                  <h3 className="mb-3 text-[1.15rem] font-medium leading-[1.3] tracking-[-0.01em] text-bz-text">
                    {story.title}
                  </h3>
                  <p className="line-clamp-2 text-[14px] leading-[1.65] text-bz-text-muted">
                    {story.excerpt}
                  </p>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center text-[15px] font-medium text-bz-text-muted">
            No stories found for this filter.
          </div>
        )}

        {/* Load more */}
        {hasMore && (
          <div className="mt-14 flex justify-center">
            <Pill
              variant="dark"
              withArrow
              type="button"
              onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
            >
              Load More Stories
            </Pill>
          </div>
        )}
      </Container>
    </Section>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PAGE the closing CTA is rendered by <Footer cta={…}> in routes.tsx
// ════════════════════════════════════════════════════════════════════════════
export function CaseStudiesPage() {
  return (
    <main>
      <HeroSection />
      <FeaturedSpotlight />
      <AllStories />
    </main>
  );
}
