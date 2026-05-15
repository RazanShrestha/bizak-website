import type { ReactNode } from "react";
import "../../styles/style.css";
import { ArrowLeft, Quote } from "lucide-react";
import { Section, Container, Eyebrow, Heading, Pill, Tick } from "./bz";
import type { CaseStudy } from "./caseStudyData";

// ════════════════════════════════════════════════════════════════════════════
// CASE STUDY DETAIL PAGE
//
// A single template rendered at /case-studies/:slug for every case study.
// The matching study is resolved from caseStudyData and passed in by the
// CaseStudyPageLayout in routes.tsx. Every "Read Full Story" / "View Case
// Study" / story-card link on CaseStudiesPage points here.
// ════════════════════════════════════════════════════════════════════════════

// ─── Back link shared on light surfaces ───────────────────────────────────────
function BackLink() {
  return (
    <a
      href="/case-studies"
      className="inline-flex items-center gap-2 text-[12px] font-medium uppercase tracking-[0.14em] text-bz-text-muted transition-colors hover:text-bz-text"
    >
      <ArrowLeft size={15} />
      All Case Studies
    </a>
  );
}

// ─── Ticked bullet list ───────────────────────────────────────────────────────
function PointList({ points }: { points: string[] }) {
  return (
    <ul className="m-0 mt-6 flex list-none flex-col gap-3 p-0">
      {points.map((p) => (
        <li key={p} className="flex items-start gap-3">
          <Tick size="sm" className="mt-px" />
          <span className="text-[15px] leading-[1.6] text-bz-text">{p}</span>
        </li>
      ))}
    </ul>
  );
}

// ─── A numbered narrative block (Challenge / Solution / Results) ───────────────
function NarrativeBlock({
  index,
  label,
  children,
}: {
  index: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <div>
      <Eyebrow index={index} className="mb-4 block">{label}</Eyebrow>
      {children}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// HERO industry · title · summary · banner image
// ════════════════════════════════════════════════════════════════════════════
function CaseStudyHero({ study }: { study: CaseStudy }) {
  return (
    <Section tone="b" pad="hero">
      <Container>
        <div className="mb-10">
          <BackLink />
        </div>

        <div className="mx-auto max-w-[800px] text-center">
          <Eyebrow className="mb-5">{study.industry}</Eyebrow>
          <Heading level={1} className="mb-6">{study.title}</Heading>
          <p className="mx-auto max-w-[620px] text-[16px] leading-[1.7] text-bz-text-muted">
            {study.summary}
          </p>
        </div>

        <div className="bz-hero-visual">
          <div className="overflow-hidden rounded-bz-3xl bg-bz-olive">
            <img
              src={study.image}
              alt=""
              className="h-[300px] w-full object-cover md:h-[460px]"
            />
          </div>
        </div>
      </Container>
    </Section>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// BODY  "at a glance" sidebar + results stats + the narrative
// ════════════════════════════════════════════════════════════════════════════
function CaseStudyBody({ study }: { study: CaseStudy }) {
  return (
    <Section tone="a">
      <Container>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[320px_1fr] lg:gap-16">
          {/* At a glance */}
          <aside className="h-fit rounded-bz-2xl border border-bz-line-soft bg-bz-surface p-7 lg:sticky lg:top-8">
            <Eyebrow className="mb-5">At a glance</Eyebrow>
            <dl className="m-0">
              {study.facts.map((f, i) => (
                <div
                  key={f.label}
                  className={`flex items-baseline justify-between gap-4 py-3 ${
                    i > 0 ? "border-t border-bz-line-soft" : ""
                  }`}
                >
                  <dt className="text-[11px] font-medium uppercase tracking-[0.12em] text-bz-text-muted">
                    {f.label}
                  </dt>
                  <dd className="m-0 text-right text-[13px] font-medium text-bz-text">
                    {f.value}
                  </dd>
                </div>
              ))}
            </dl>
            <div className="mt-6 border-t border-bz-line-soft pt-6">
              <Eyebrow className="mb-3">Bizak modules</Eyebrow>
              <div className="flex flex-wrap gap-2">
                {study.modules.map((m) => (
                  <span
                    key={m}
                    className="rounded-bz-sm border border-bz-line bg-bz-paper-warm px-2.5 py-1.5 text-[11px] font-medium text-bz-text"
                  >
                    {m}
                  </span>
                ))}
              </div>
            </div>
          </aside>

          {/* Narrative */}
          <div className="flex flex-col gap-14">
            {/* Results stats */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {study.stats.map((s) => (
                <div key={s.label} className="min-w-0 rounded-bz-sm border border-bz-line p-5">
                  <div className="bz-stat-num" style={{ fontSize: 34 }}>{s.value}</div>
                  <div className="mt-2 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-bz-text-muted">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>

            <NarrativeBlock index="01" label="The Challenge">
              <p className="m-0 max-w-[640px] text-[16px] leading-[1.75] text-bz-text">
                {study.challenge}
              </p>
            </NarrativeBlock>

            <NarrativeBlock index="02" label="The Solution">
              <p className="m-0 max-w-[640px] text-[16px] leading-[1.75] text-bz-text">
                {study.solution.body}
              </p>
              <PointList points={study.solution.points} />
            </NarrativeBlock>

            <NarrativeBlock index="03" label="The Results">
              <p className="m-0 max-w-[640px] text-[16px] leading-[1.75] text-bz-text">
                {study.results.body}
              </p>
              <PointList points={study.results.points} />
            </NarrativeBlock>
          </div>
        </div>
      </Container>
    </Section>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// QUOTE  closing pull-quote on a dark surface
// ════════════════════════════════════════════════════════════════════════════
function CaseStudyQuote({ study }: { study: CaseStudy }) {
  const { text, name, role } = study.quote;
  const initials = name.split(" ").map((w) => w[0]).slice(0, 2).join("");
  return (
    <Section tone="dark" pad="tight">
      <Container width="narrow">
        <div className="flex flex-col items-center text-center">
          <Quote size={32} className="text-bz-fire" />
          <blockquote className="m-0 mt-7 max-w-[760px] text-[clamp(20px,2.4vw,30px)] font-medium leading-[1.4] tracking-[-0.018em] text-bz-text-on-dark">
            "{text}"
          </blockquote>
          <div className="mt-9 flex items-center gap-3.5">
            <div className="flex size-12 items-center justify-center rounded-bz-pill bg-bz-fire text-[14px] font-semibold text-bz-olive">
              {initials}
            </div>
            <div className="text-left">
              <div className="text-[14px] font-medium text-bz-text-on-dark">{name}</div>
              <div className="mt-0.5 text-[12px] text-bz-text-on-dark-muted">{role}</div>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}

// ─── Unknown-slug fallback ─────────────────────────────────────────────────────
function CaseStudyNotFound() {
  return (
    <Section tone="b" pad="hero">
      <Container>
        <div className="flex flex-col items-center gap-6 py-16 text-center">
          <Eyebrow>Case Study</Eyebrow>
          <Heading level={2}>We couldn't find that case study.</Heading>
          <p className="max-w-[440px] text-[15px] leading-[1.7] text-bz-text-muted">
            The story you're looking for may have moved. Browse the full library instead.
          </p>
          <Pill variant="dark" withArrow href="/case-studies">All Case Studies</Pill>
        </div>
      </Container>
    </Section>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PAGE  the closing CTA is rendered by <Footer cta={…}> in routes.tsx
// ════════════════════════════════════════════════════════════════════════════
export function CaseStudyPage({ study }: { study?: CaseStudy }) {
  if (!study) {
    return (
      <main>
        <CaseStudyNotFound />
      </main>
    );
  }
  return (
    <main>
      <CaseStudyHero study={study} />
      <CaseStudyBody study={study} />
      <CaseStudyQuote study={study} />
    </main>
  );
}
