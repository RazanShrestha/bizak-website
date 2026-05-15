import { useEffect, useState, type ReactNode } from "react";
import { useParams } from "react-router";
import "../../styles/style.css";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Download,
  Flag,
} from "lucide-react";
import {
  Accordion,
  Container,
  Eyebrow,
  Heading,
  Pill,
  PillGroup,
  Section,
  SectionHead,
} from "./bz";
import {
  CATEGORY_META,
  findRelatedResources,
  findResourceBySlug,
  formatIcon,
  type Chapter,
  type Resource,
} from "./guides/resources";

// ════════════════════════════════════════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════════════════════════════════════════

// Chapter titles arrive as "Phase 1 · Discover (Week 1-2)" or plain text.
// Split the optional "Phase N ·" prefix and "(meta)" suffix off the name.
function parseChapter(title: string): { name: string; meta?: string } {
  const stripped = title.replace(/^Phase\s+\d+\s*·\s*/i, "").trim();
  const m = stripped.match(/^(.*?)\s*\(([^)]+)\)\s*$/);
  return m ? { name: m[1].trim(), meta: m[2].trim() } : { name: stripped };
}

// ════════════════════════════════════════════════════════════════════════════
// READING PROGRESS  thin lime bar pinned to the top of the viewport
// ════════════════════════════════════════════════════════════════════════════

function ReadingProgress() {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const max = el.scrollHeight - el.clientHeight;
      setPct(max > 0 ? (el.scrollTop / max) * 100 : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div aria-hidden className="fixed inset-x-0 top-0 z-50 h-[3px]">
      <div
        className="h-full bg-bz-fire transition-[width] duration-100 ease-out"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// TABLE OF CONTENTS  sticky scroll-spy rail (desktop only)
// ════════════════════════════════════════════════════════════════════════════

type TocItem = { id: string; label: string };

function Toc({ items }: { items: TocItem[] }) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? "");

  useEffect(() => {
    const onScroll = () => {
      let current = items[0]?.id ?? "";
      for (const item of items) {
        const el = document.getElementById(item.id);
        if (el && el.getBoundingClientRect().top - 140 <= 0) current = item.id;
      }
      setActiveId(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [items]);

  return (
    <nav aria-label="On this page" className="text-[13px]">
      <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-bz-text-soft">
        On this page
      </p>
      <ul className="flex flex-col">
        {items.map((item) => {
          const active = item.id === activeId;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className={[
                  "block border-l-2 py-2 pl-4 leading-snug transition-colors",
                  active
                    ? "border-bz-fire font-medium text-bz-text"
                    : "border-bz-line-soft text-bz-text-muted hover:border-bz-line hover:text-bz-text",
                ].join(" ")}
              >
                {item.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// [HERO]  the playbook "cover" on a dark olive canvas
// ════════════════════════════════════════════════════════════════════════════

function HeroSection({ resource }: { resource: Resource }) {
  const FormatIcon = formatIcon(resource.format);
  const cat = CATEGORY_META[resource.category];
  const CatIcon = cat.icon;

  const facts = [
    { label: "Read time", value: resource.readTime },
    { label: "Chapters", value: String(resource.chapters.length) },
    { label: "Level", value: resource.difficulty },
    { label: "Updated", value: resource.updated },
  ];

  const hasDownloads = Boolean(resource.downloads && resource.downloads.length);

  return (
    <Section tone="dark" pad="hero">
      <Container>
        <a
          href="/GuidesAndPlaybooks"
          className="inline-flex items-center gap-2 text-[13px] text-bz-text-on-dark-muted transition-colors hover:text-bz-text-on-dark"
        >
          <ArrowLeft size={14} strokeWidth={2} />
          All guides &amp; playbooks
        </a>

        <div className="mt-8 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-bz-sm border border-white/[0.14] bg-white/[0.06] px-2.5 py-1 text-[11px] font-medium text-bz-text-on-dark">
            <FormatIcon size={12} strokeWidth={2} />
            {resource.format}
          </span>
          <span className="rounded-bz-sm border border-white/[0.1] px-2.5 py-1 text-[11px] font-medium text-bz-text-on-dark-muted">
            {cat.label}
          </span>
          <span className="rounded-bz-sm border border-white/[0.1] px-2.5 py-1 text-[11px] font-medium text-bz-text-on-dark-muted">
            {resource.difficulty}
          </span>
        </div>

        <Heading level={1} tone="dark" className="mt-6 max-w-[860px]">
          {resource.title}
        </Heading>

        <p className="mt-5 max-w-[660px] text-[16px] leading-[1.7] text-bz-text-on-dark-muted">
          {resource.summary}
        </p>

        <div className="mt-6 flex items-center gap-2.5 text-[13px] text-bz-text-on-dark-muted">
          <span className="flex size-7 items-center justify-center rounded-bz-pill border border-white/[0.08] bg-white/[0.07]">
            <CatIcon size={13} strokeWidth={1.8} className="text-bz-leaf" />
          </span>
          By the Bizak {cat.label} team
        </div>

        {/* <div className="mt-8">
          <PillGroup>
            <Pill
              variant="accent"
              withArrow
              href={hasDownloads ? "#downloads" : "#overview"}
            >
              {hasDownloads ? "Get the templates" : "Start reading"}
            </Pill>
            <Pill variant="ghostDark" withArrow href="/contact">
              Talk to Sales
            </Pill>
          </PillGroup>
        </div> */}

        <div className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-bz-lg border border-white/[0.08] bg-white/[0.08] sm:grid-cols-4">
          {facts.map((f) => (
            <div key={f.label} className="bg-bz-olive p-4 sm:p-5">
              <p className="text-[10.5px] font-medium uppercase tracking-[0.1em] text-bz-text-on-dark-soft">
                {f.label}
              </p>
              <p className="mt-1.5 text-[15px] font-medium text-bz-text-on-dark sm:text-[17px]">
                {f.value}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ARTICLE  shared sub-heading + the body sections
// ════════════════════════════════════════════════════════════════════════════

function ArticleHead({
  kicker,
  title,
}: {
  kicker: string;
  title: ReactNode;
}) {
  return (
    <header className="mb-6">
      <Eyebrow>{kicker}</Eyebrow>
      <h2 className="mt-3 text-[clamp(22px,2.5vw,28px)] font-medium leading-[1.22] tracking-[-0.015em] text-bz-text">
        {title}
      </h2>
    </header>
  );
}

function OverviewBlock({ resource }: { resource: Resource }) {
  return (
    <section id="overview" className="scroll-mt-24">
      <ArticleHead
        kicker="Overview"
        title={`What this ${resource.format.toLowerCase()} covers`}
      />
      <p className="text-[15.5px] leading-[1.8] text-bz-text-muted">
        {resource.longSummary}
      </p>

      {resource.pullQuote && (
        <blockquote className="mt-9 border-l-2 border-bz-fire pl-6">
          <p className="text-[clamp(17px,2vw,21px)] font-medium leading-[1.5] text-bz-text">
            &ldquo;{resource.pullQuote.quote}&rdquo;
          </p>
          <footer className="mt-4 text-[13px] text-bz-text-soft">
            {resource.pullQuote.attribution}
          </footer>
        </blockquote>
      )}
    </section>
  );
}

function PrerequisitesBlock({ resource }: { resource: Resource }) {
  if (!resource.prerequisites || resource.prerequisites.length === 0) return null;
  return (
    <section id="before" className="scroll-mt-24">
      <ArticleHead kicker="Before you start" title="Have these in place first" />
      <ul className="flex flex-col gap-3">
        {resource.prerequisites.map((p) => (
          <li
            key={p.title}
            className="flex gap-3.5 rounded-bz-lg border border-bz-line-soft bg-bz-paper-warm p-5"
          >
            <CheckCircle2
              size={18}
              strokeWidth={2}
              className="mt-0.5 shrink-0 text-bz-olive"
            />
            <div>
              <h3 className="text-[14.5px] font-medium text-bz-text">
                {p.title}
              </h3>
              <p className="mt-1 text-[13.5px] leading-[1.65] text-bz-text-muted">
                {p.body}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function ChapterBlock({ chapter, index }: { chapter: Chapter; index: number }) {
  const { name, meta } = parseChapter(chapter.title);
  return (
    <section id={chapter.id} className="scroll-mt-24">
      <div className="flex items-center gap-4">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-bz-md bg-bz-olive text-[13px] font-medium tabular-nums text-bz-text-on-dark">
          {String(index + 1).padStart(2, "0")}
        </span>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <h2 className="text-[clamp(21px,2.5vw,28px)] font-medium leading-[1.2] tracking-[-0.015em] text-bz-text">
            {name}
          </h2>
          {meta && (
            <span className="rounded-bz-sm border border-bz-line-soft bg-bz-paper-warm px-2 py-1 text-[11.5px] font-medium text-bz-text-muted">
              {meta}
            </span>
          )}
        </div>
      </div>

      <p className="mt-5 text-[15px] leading-[1.75] text-bz-text-muted">
        {chapter.intro}
      </p>

      <ol className="mt-8">
        {chapter.tasks.map((task, i) => {
          const last = i === chapter.tasks.length - 1;
          return (
            <li key={task.title} className="relative flex gap-4 pb-7 last:pb-0 sm:gap-5">
              {!last && (
                <span
                  aria-hidden
                  className="absolute bottom-0 left-[14px] top-8 w-px bg-bz-line"
                />
              )}
              <span className="relative z-[1] flex size-7 shrink-0 items-center justify-center rounded-bz-pill border border-bz-line bg-bz-paper-warm text-[11.5px] font-medium tabular-nums text-bz-text">
                {i + 1}
              </span>
              <div className="pt-0.5">
                <h3 className="text-[15px] font-medium text-bz-text">
                  {task.title}
                </h3>
                <p className="mt-1.5 text-[14px] leading-[1.7] text-bz-text-muted">
                  {task.detail}
                </p>
              </div>
            </li>
          );
        })}
      </ol>

      {chapter.callout && (
        <div className="mt-8 rounded-bz-lg border border-bz-fire-mid bg-bz-fire-soft p-5">
          <div className="flex items-center gap-2">
            <Flag size={14} strokeWidth={2} className="text-bz-text" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-bz-text">
              {chapter.callout.title}
            </span>
          </div>
          <p className="mt-2.5 text-[14px] leading-[1.7] text-bz-text-muted">
            {chapter.callout.body}
          </p>
        </div>
      )}

      {chapter.outputs && chapter.outputs.length > 0 && (
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <span className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-bz-text-soft">
            Outputs
          </span>
          {chapter.outputs.map((o) => (
            <span
              key={o}
              className="rounded-bz-sm border border-bz-line-soft bg-bz-surface px-2 py-[3px] text-[11.5px] font-medium text-bz-text-muted"
            >
              {o}
            </span>
          ))}
        </div>
      )}
    </section>
  );
}

function DownloadsBlock({ resource }: { resource: Resource }) {
  if (!resource.downloads || resource.downloads.length === 0) return null;
  return (
    <section id="downloads" className="scroll-mt-24">
      <ArticleHead
        kicker="Templates"
        title="Lift the artefacts, skip the blank page"
      />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {resource.downloads.map((d) => {
          const DIcon = d.icon;
          return (
            <a
              key={d.title}
              href={d.href}
              className="group flex flex-col rounded-bz-lg border border-bz-line-soft bg-bz-paper-warm p-5 transition-colors hover:border-bz-line"
            >
              <div className="flex items-center justify-between">
                <span className="flex size-10 items-center justify-center rounded-bz-md border border-bz-line-soft bg-bz-surface text-bz-text">
                  <DIcon size={18} strokeWidth={1.6} />
                </span>
                <span className="text-[10.5px] font-medium uppercase tracking-[0.08em] text-bz-text-soft">
                  {d.format}
                </span>
              </div>
              <h3 className="mt-4 text-[14.5px] font-medium leading-snug text-bz-text">
                {d.title}
              </h3>
              <p className="mt-1.5 flex-1 text-[13px] leading-[1.6] text-bz-text-muted">
                {d.description}
              </p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-[12.5px] font-medium text-bz-text">
                <Download
                  size={13}
                  strokeWidth={2}
                  className="transition-transform duration-200 group-hover:translate-y-0.5"
                />
                Download
              </span>
            </a>
          );
        })}
      </div>
    </section>
  );
}

function FaqBlock({ resource }: { resource: Resource }) {
  if (!resource.faqs || resource.faqs.length === 0) return null;
  return (
    <section id="faqs" className="scroll-mt-24">
      <ArticleHead kicker="FAQ" title="Questions teams ask first" />
      <Accordion defaultOpen={null}>
        {resource.faqs.map((faq) => (
          <Accordion.Item key={faq.q} question={faq.q}>
            {faq.a}
          </Accordion.Item>
        ))}
      </Accordion>
    </section>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// BODY  table of contents + the article column
// ════════════════════════════════════════════════════════════════════════════

function BodySection({ resource }: { resource: Resource }) {
  const toc: TocItem[] = [
    { id: "overview", label: "Overview" },
    ...(resource.prerequisites && resource.prerequisites.length > 0
      ? [{ id: "before", label: "Before you start" }]
      : []),
    ...resource.chapters.map((c) => ({
      id: c.id,
      label: parseChapter(c.title).name,
    })),
    ...(resource.downloads && resource.downloads.length > 0
      ? [{ id: "downloads", label: "Templates" }]
      : []),
    ...(resource.faqs && resource.faqs.length > 0
      ? [{ id: "faqs", label: "FAQ" }]
      : []),
  ];

  return (
    <Section tone="a">
      <Container>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[236px_minmax(0,1fr)] lg:gap-16">
          <aside className="hidden lg:sticky lg:top-24 lg:block lg:self-start">
            <Toc items={toc} />
          </aside>

          <article className="mx-auto w-full max-w-[760px] space-y-16 lg:mx-0">
            <OverviewBlock resource={resource} />
            <PrerequisitesBlock resource={resource} />
            {resource.chapters.map((chapter, i) => (
              <ChapterBlock key={chapter.id} chapter={chapter} index={i} />
            ))}
            <DownloadsBlock resource={resource} />
            <FaqBlock resource={resource} />
          </article>
        </div>
      </Container>
    </Section>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// RELATED
// ════════════════════════════════════════════════════════════════════════════

function RelatedSection({ resource }: { resource: Resource }) {
  const related = findRelatedResources(resource, 3);
  if (related.length === 0) return null;

  return (
    <Section tone="b">
      <Container>
        <SectionHead
          label="Keep reading"
          title={
            <>
              Related guides{" "}
              <Heading.Muted>and playbooks.</Heading.Muted>
            </>
          }
        />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {related.map((r) => {
            const Icon = formatIcon(r.format);
            return (
              <a
                key={r.slug}
                href={`/GuidesAndPlaybooks/${r.slug}`}
                className="group flex flex-col rounded-bz-xl border border-bz-line-soft bg-bz-surface p-6 transition-transform duration-200 hover:-translate-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="flex size-11 items-center justify-center rounded-bz-lg border border-bz-line-soft bg-bz-paper-warm text-bz-text">
                    <Icon size={18} strokeWidth={1.6} />
                  </span>
                  <ArrowRight
                    size={17}
                    strokeWidth={1.8}
                    className="text-bz-text-soft transition-all duration-200 group-hover:translate-x-1 group-hover:text-bz-text"
                  />
                </div>
                <h3 className="mt-5 text-[15.5px] font-medium leading-snug text-bz-text">
                  {r.title}
                </h3>
                <p className="mt-2 line-clamp-2 flex-1 text-[13px] leading-[1.6] text-bz-text-muted">
                  {r.summary}
                </p>
                <div className="mt-5 flex items-center gap-2 text-[12px] text-bz-text-soft">
                  <span>{CATEGORY_META[r.category].label}</span>
                  <span aria-hidden className="size-1 rounded-bz-pill bg-bz-line" />
                  <span className="tabular-nums">{r.readTime}</span>
                </div>
              </a>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// NOT FOUND
// ════════════════════════════════════════════════════════════════════════════

function NotFoundState({ slug }: { slug?: string }) {
  return (
    <Section tone="b" pad="default">
      <Container width="narrow">
        <div className="mx-auto flex max-w-[560px] flex-col items-center text-center">
          <span className="rounded-bz-sm border border-bz-line bg-bz-surface px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-bz-text-muted">
            Resource not found
          </span>
          <Heading level={2} className="mt-6">
            We couldn&rsquo;t find{" "}
            <Heading.Muted>that playbook.</Heading.Muted>
          </Heading>
          <p className="mt-4 text-[15px] leading-[1.7] text-bz-text-muted">
            {slug
              ? `Nothing in the library matches "${slug}". It may have been renamed or retired.`
              : "No resource was specified in the URL."}
          </p>
          <div className="mt-8">
            <PillGroup>
              <Pill variant="dark" withArrow href="/GuidesAndPlaybooks">
                Browse the library
              </Pill>
              <Pill variant="light" withArrow href="/contact">
                Talk to Sales
              </Pill>
            </PillGroup>
          </div>
        </div>
      </Container>
    </Section>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PAGE
// ════════════════════════════════════════════════════════════════════════════

export function ResourceDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const resource = findResourceBySlug(slug);

  // Reset scroll on slug change so navigation between detail pages starts at top.
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "auto" });
    }
  }, [slug]);

  if (!resource) {
    return (
      <main>
        <NotFoundState slug={slug} />
      </main>
    );
  }

  return (
    <main>
      <ReadingProgress />
      <HeroSection resource={resource} />
      <BodySection resource={resource} />
      <RelatedSection resource={resource} />
    </main>
  );
}
