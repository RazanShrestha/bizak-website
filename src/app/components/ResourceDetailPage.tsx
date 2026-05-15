import { useEffect, useState } from "react";
import { useParams } from "react-router";
import "../../styles/style.css";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Bookmark,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Copy,
  Download,
  Layers,
  Linkedin,
  Quote,
  Share2,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import {
  Button,
  Card,
  Container,
  Eyebrow,
  IconBadge,
  PillBadge,
  Section,
  SectionHeading,
} from "./marketing";
import {
  CATEGORY_META,
  findRelatedResources,
  findResourceBySlug,
  formatIcon,
  formatTone,
  type Resource,
} from "./guides/resources";

// ─── Reading-progress bar ────────────────────────────────────────────────────

function ProgressBar() {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const max = el.scrollHeight - el.clientHeight;
      const v = max > 0 ? (el.scrollTop / max) * 100 : 0;
      setPct(v);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      aria-hidden
      className="fixed inset-x-0 top-[76px] z-30 h-[2px] bg-bz-border/60"
    >
      <div
        className="h-full bg-bz-accent transition-[width] duration-150"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

// ─── Sticky table of contents ────────────────────────────────────────────────

type TocItem = { id: string; label: string };

function TableOfContents({ items }: { items: TocItem[] }) {
  const [activeId, setActiveId] = useState<string>(items[0]?.id ?? "");

  useEffect(() => {
    const onScroll = () => {
      const offset = 160;
      let current = items[0]?.id ?? "";
      for (const item of items) {
        const el = document.getElementById(item.id);
        if (!el) continue;
        const top = el.getBoundingClientRect().top;
        if (top - offset <= 0) current = item.id;
      }
      setActiveId(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [items]);

  return (
    <nav aria-label="Table of contents" className="text-[13px]">
      <div className="flex items-center gap-2 text-[10.5px] font-bold uppercase tracking-[0.16em] text-bz-text-soft">
        <Layers className="size-[12px]" strokeWidth={2} />
        On this page
      </div>
      <ol className="mt-5 flex flex-col gap-0.5">
        {items.map((item) => {
          const isActive = item.id === activeId;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className={[
                  "flex items-center gap-2 rounded-bz-md border-l-2 px-3 py-2 leading-snug transition-colors",
                  isActive
                    ? "border-bz-sage bg-bz-sage-soft font-semibold text-bz-text"
                    : "border-transparent text-bz-text-muted hover:border-bz-sage-mid hover:bg-bz-bg hover:text-bz-text",
                ].join(" ")}
              >
                <span>{item.label}</span>
              </a>
            </li>
          );
        })}
      </ol>

      <div className="mt-8 border-t border-bz-border-soft pt-6">
        <div className="text-[10.5px] font-bold uppercase tracking-[0.16em] text-bz-text-soft">
          Share
        </div>
        <div className="mt-3 flex items-center gap-2">
          {[
            { icon: Linkedin, label: "Share on LinkedIn", href: "#"  },
            { icon: Share2,   label: "Share link",        href: "#"  },
            { icon: Copy,     label: "Copy URL",          href: "#"  },
            { icon: Bookmark, label: "Bookmark",          href: "#"  },
          ].map(({ icon: ShareIcon, label, href }) => (
            <a
              key={label}
              href={href}
              aria-label={label}
              className="inline-flex size-9 items-center justify-center rounded-bz-md border border-bz-border bg-bz-surface text-bz-text-muted transition-colors hover:border-bz-sage-mid hover:bg-bz-sage-soft hover:text-bz-text"
            >
              <ShareIcon className="size-[14px]" strokeWidth={1.8} />
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}

// ─── Hero ────────────────────────────────────────────────────────────────────

function HeroSection({ resource }: { resource: Resource }) {
  const FormatIcon = formatIcon(resource.format);
  const cat = CATEGORY_META[resource.category];

  const factRows =
    resource.factRows ??
    [
      { label: "Read time",   value: resource.readTime },
      ...(resource.steps ? [{ label: "Steps", value: `${resource.steps} chapters` }] : []),
      { label: "Difficulty",  value: resource.difficulty },
      { label: "Format",      value: resource.format },
      ...(resource.version ? [{ label: "Version", value: resource.version }] : []),
    ];

  return (
    <Section pad="hero" tone="light" className="biz-mesh overflow-hidden">
      <Container>
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="text-[12.5px] text-bz-text-soft">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <a
                href="/GuidesAndPlaybooks"
                className="inline-flex items-center gap-1.5 hover:text-bz-text"
              >
                <ArrowLeft className="size-[12px]" strokeWidth={2} />
                Guides &amp; Playbooks
              </a>
            </li>
            <li aria-hidden>
              <ChevronRight className="size-[12px] text-bz-text-soft/60" strokeWidth={2} />
            </li>
            <li>
              <a href="/GuidesAndPlaybooks" className="hover:text-bz-text">
                {cat.label}
              </a>
            </li>
            <li aria-hidden>
              <ChevronRight className="size-[12px] text-bz-text-soft/60" strokeWidth={2} />
            </li>
            <li className="line-clamp-1 font-medium text-bz-text">{resource.title}</li>
          </ol>
        </nav>

        <div className="mt-10 grid grid-cols-1 items-start gap-12 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-16">
          {/* Left title block */}
          <div className="max-w-[760px]">
            <div className="flex flex-wrap items-center gap-2">
              <PillBadge tone={formatTone(resource.format)} dot={resource.format === "Playbook"}>
                <span className="inline-flex items-center gap-1.5">
                  <FormatIcon className="size-[11px]" strokeWidth={2.2} />
                  {resource.format}
                </span>
              </PillBadge>
              <PillBadge tone="sage">{cat.label}</PillBadge>
              <PillBadge tone="neutral">{resource.difficulty}</PillBadge>
            </div>

            <h1 className="mt-6 text-[clamp(34px,4.6vw,54px)] font-bold leading-[1.05] tracking-[-0.03em] text-bz-text">
              {resource.title}
            </h1>
            <p className="mt-5 max-w-[640px] text-[17px] leading-[1.7] text-bz-text-muted">
              {resource.summary}
            </p>

            {/* Author row */}
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {[
                    { initials: "RY", tone: "sage" as const   },
                    { initials: "AS", tone: "accent" as const },
                    { initials: "MK", tone: "sage" as const   },
                  ].map((a) => (
                    <span
                      key={a.initials}
                      className={[
                        "inline-flex size-9 items-center justify-center rounded-full border-2 border-bz-bg text-[11px] font-bold tracking-[0.04em]",
                        a.tone === "accent"
                          ? "bg-bz-accent text-bz-deep"
                          : "bg-bz-sage text-white",
                      ].join(" ")}
                      aria-hidden
                    >
                      {a.initials}
                    </span>
                  ))}
                </div>
                <div className="leading-tight">
                  <div className="text-[13.5px] font-semibold text-bz-text">
                    By the Bizak {cat.label} team
                  </div>
                  <div className="text-[12px] text-bz-text-soft">
                    Updated {resource.updated}
                    {resource.version ? ` · ${resource.version}` : ""}
                  </div>
                </div>
              </div>
            </div>

            {/* Action row */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              {resource.downloads && resource.downloads.length > 0 ? (
                <Button variant="primary" size="md" href="#downloads" withArrow>
                  Get the templates
                </Button>
              ) : (
                <Button variant="primary" size="md" href="#overview" withArrow>
                  Start reading
                </Button>
              )}
              <Button variant="ghost" size="md" href="/contact">
                Talk to a specialist
              </Button>
            </div>
          </div>

          {/* Right fact card */}
          <aside className="lg:sticky lg:top-[100px]">
            <Card tone="light" pad="lg" className="border-bz-border">
              <div className="flex items-center justify-between">
                <div className="text-[10.5px] font-bold uppercase tracking-[0.16em] text-bz-text-soft">
                  At a glance
                </div>
                {resource.version && (
                  <span className="font-mono text-[11px] font-bold tabular-nums text-bz-text-soft">
                    {resource.version}
                  </span>
                )}
              </div>
              <ul className="mt-5 divide-y divide-bz-border-soft">
                {factRows.map((row) => (
                  <li
                    key={row.label}
                    className="flex items-center justify-between gap-3 py-3 text-[13.5px]"
                  >
                    <span className="text-bz-text-muted">{row.label}</span>
                    <span className="font-semibold text-bz-text">{row.value}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </aside>
        </div>
      </Container>
    </Section>
  );
}

// ─── Body ────────────────────────────────────────────────────────────────────

function BodySection({ resource }: { resource: Resource }) {
  const toc: TocItem[] = [
    { id: "overview", label: "Overview" },
    ...(resource.prerequisites ? [{ id: "before", label: "Before you start" }] : []),
    ...resource.chapters.map((c) => ({ id: c.id, label: c.title.split("·")[0].trim() })),
    ...(resource.downloads && resource.downloads.length > 0
      ? [{ id: "downloads", label: "Templates & downloads" }]
      : []),
    ...(resource.faqs && resource.faqs.length > 0
      ? [{ id: "faqs", label: "Common questions" }]
      : []),
  ];

  return (
    <Section tone="white" pad="default">
      <Container>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-16">
          {/* Sidebar */}
          <aside className="lg:sticky lg:top-[100px] lg:self-start">
            <TableOfContents items={toc} />
          </aside>

          {/* Article */}
          <article className="max-w-[760px]">
            {/* Overview */}
            <section id="overview" className="scroll-mt-[100px]">
              <Eyebrow>Overview</Eyebrow>
              <h2 className="mt-3 text-[clamp(26px,3vw,34px)] font-bold leading-[1.15] tracking-[-0.02em] text-bz-text">
                What this {resource.format.toLowerCase()} covers.
              </h2>
              <p className="mt-5 text-[16px] leading-[1.75] text-bz-text-muted">
                {resource.longSummary}
              </p>

              {resource.pullQuote && (
                <div className="mt-8 rounded-bz-xl border border-bz-border bg-bz-bg p-6">
                  <div className="flex items-start gap-4">
                    <span className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-bz-md bg-bz-accent text-bz-deep">
                      <Quote className="size-4" strokeWidth={2} />
                    </span>
                    <div>
                      <p className="text-[15.5px] leading-[1.7] text-bz-text">
                        &ldquo;{resource.pullQuote.quote}&rdquo;
                      </p>
                      <div className="mt-4 text-[12.5px] font-semibold text-bz-text-soft">
                        {resource.pullQuote.attribution}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* Prerequisites */}
            {resource.prerequisites && resource.prerequisites.length > 0 && (
              <section id="before" className="mt-16 scroll-mt-[100px]">
                <Eyebrow>Before you start</Eyebrow>
                <h2 className="mt-3 text-[clamp(24px,2.6vw,30px)] font-bold leading-[1.15] tracking-[-0.02em] text-bz-text">
                  Lock these in first.
                </h2>
                <ul className="mt-6 space-y-4">
                  {resource.prerequisites.map((p) => (
                    <li
                      key={p.title}
                      className="flex gap-4 rounded-bz-lg border border-bz-border bg-bz-surface p-5"
                    >
                      <CheckCircle2
                        className="mt-0.5 size-[18px] shrink-0 text-bz-sage"
                        strokeWidth={2}
                      />
                      <div>
                        <div className="text-[15px] font-bold text-bz-text">{p.title}</div>
                        <p className="mt-1 text-[14px] leading-[1.65] text-bz-text-muted">
                          {p.body}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Chapters */}
            {resource.chapters.map((chapter, idx) => (
              <section
                key={chapter.id}
                id={chapter.id}
                className="mt-20 scroll-mt-[100px]"
              >
                <div className="flex items-center gap-4">
                  <span className="inline-flex size-10 items-center justify-center rounded-bz-pill bg-bz-deep font-mono text-[12px] font-bold tabular-nums text-bz-accent">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <h2 className="text-[clamp(24px,2.8vw,32px)] font-bold leading-[1.15] tracking-[-0.02em] text-bz-text">
                    {chapter.title}
                  </h2>
                </div>

                <p className="mt-6 text-[16px] leading-[1.75] text-bz-text-muted">
                  {chapter.intro}
                </p>

                <ol className="mt-8 space-y-5">
                  {chapter.tasks.map((task, i) => (
                    <li
                      key={task.title}
                      className="relative flex gap-5 rounded-bz-xl border border-bz-border bg-bz-surface p-6"
                    >
                      <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-bz-pill bg-bz-sage-soft font-mono text-[12px] font-bold tabular-nums text-bz-sage">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div>
                        <div className="text-[15.5px] font-bold text-bz-text">{task.title}</div>
                        <p className="mt-2 text-[14.5px] leading-[1.7] text-bz-text-muted">
                          {task.detail}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>

                {chapter.callout && (
                  <div className="mt-8 overflow-hidden rounded-bz-xl border border-bz-sage-mid/40 bg-bz-sage-soft p-6">
                    <div className="flex items-center gap-2 text-[10.5px] font-bold uppercase tracking-[0.16em] text-bz-sage">
                      <ShieldCheck className="size-[13px]" strokeWidth={2} />
                      {chapter.callout.title}
                    </div>
                    <p className="mt-3 text-[14.5px] leading-[1.7] text-bz-text">
                      {chapter.callout.body}
                    </p>
                  </div>
                )}

                {chapter.outputs && chapter.outputs.length > 0 && (
                  <div className="mt-6 flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-bz-text-soft">
                      Outputs
                    </span>
                    {chapter.outputs.map((o) => (
                      <span
                        key={o}
                        className="rounded-bz-pill bg-bz-bg px-2.5 py-1 text-[11.5px] font-semibold text-bz-text-muted"
                      >
                        {o}
                      </span>
                    ))}
                  </div>
                )}
              </section>
            ))}

            {/* Downloads */}
            {resource.downloads && resource.downloads.length > 0 && (
              <section id="downloads" className="mt-20 scroll-mt-[100px]">
                <Eyebrow>Templates &amp; downloads</Eyebrow>
                <h2 className="mt-3 text-[clamp(24px,2.6vw,30px)] font-bold leading-[1.15] tracking-[-0.02em] text-bz-text">
                  Lift the artefacts. Skip the blank page.
                </h2>
                <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {resource.downloads.map((d) => {
                    const DIcon = d.icon;
                    return (
                      <a
                        key={d.title}
                        href={d.href}
                        className="group flex h-full flex-col rounded-bz-xl border border-bz-border bg-bz-surface p-5 transition-all duration-200 hover:-translate-y-[2px] hover:border-bz-sage-mid hover:shadow-[0_16px_40px_rgba(15,17,14,0.06)]"
                      >
                        <div className="flex items-center justify-between">
                          <IconBadge size="md" tone="sage">
                            <DIcon className="size-[18px]" strokeWidth={1.8} />
                          </IconBadge>
                          <span className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-bz-text-soft">
                            {d.format}
                          </span>
                        </div>
                        <h3 className="mt-5 text-[15.5px] font-bold tracking-[-0.005em] text-bz-text">
                          {d.title}
                        </h3>
                        <p className="mt-2 flex-1 text-[13px] leading-[1.65] text-bz-text-muted">
                          {d.description}
                        </p>
                        <span className="mt-5 inline-flex items-center gap-1.5 text-[12.5px] font-bold text-bz-sage transition-transform duration-200 group-hover:translate-x-0.5">
                          <Download className="size-[13px]" strokeWidth={2} />
                          Download
                        </span>
                      </a>
                    );
                  })}
                </div>
              </section>
            )}

            {/* FAQs */}
            {resource.faqs && resource.faqs.length > 0 && (
              <section id="faqs" className="mt-20 scroll-mt-[100px]">
                <Eyebrow>Common questions</Eyebrow>
                <h2 className="mt-3 text-[clamp(24px,2.6vw,30px)] font-bold leading-[1.15] tracking-[-0.02em] text-bz-text">
                  What teams ask before they start.
                </h2>
                <div className="mt-8 divide-y divide-bz-border border-y border-bz-border">
                  {resource.faqs.map((faq) => (
                    <details key={faq.q} className="group py-5">
                      <summary className="flex cursor-pointer items-start justify-between gap-6 text-[15.5px] font-semibold text-bz-text marker:hidden hover:text-bz-sage [&::-webkit-details-marker]:hidden">
                        <span>{faq.q}</span>
                        <ChevronRight
                          className="mt-0.5 size-4 shrink-0 text-bz-text-soft transition-transform duration-200 group-open:rotate-90 group-open:text-bz-sage"
                          strokeWidth={2}
                        />
                      </summary>
                      <p className="mt-3 max-w-[680px] text-[14.5px] leading-[1.75] text-bz-text-muted">
                        {faq.a}
                      </p>
                    </details>
                  ))}
                </div>
              </section>
            )}
          </article>
        </div>
      </Container>
    </Section>
  );
}

// ─── Related ─────────────────────────────────────────────────────────────────

function RelatedSection({ resource }: { resource: Resource }) {
  const related = findRelatedResources(resource, 3);
  if (related.length === 0) return null;

  return (
    <Section tone="light" pad="default">
      <Container>
        <SectionHeading
          eyebrow="Keep reading"
          title="Related playbooks"
          description="More resources in the same area pulled live from the library."
          maxWidth={680}
          className="mb-12"
        />
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {related.map((r) => {
            const cat = CATEGORY_META[r.category];
            return (
              <a
                key={r.slug}
                href={`/GuidesAndPlaybooks/${r.slug}`}
                className="group flex h-full flex-col rounded-bz-xl border border-bz-border bg-bz-surface p-7 transition-all duration-200 hover:-translate-y-[2px] hover:border-bz-sage-mid hover:shadow-[0_16px_40px_rgba(15,17,14,0.06)]"
              >
                <div className="flex items-center justify-between">
                  <PillBadge tone="sage">{cat.label}</PillBadge>
                  <span className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-bz-text-soft">
                    <Clock3 className="size-[12px]" strokeWidth={2} />
                    {r.readTime}
                  </span>
                </div>
                <h3 className="mt-6 text-[18px] font-bold leading-[1.3] tracking-[-0.005em] text-bz-text transition-colors group-hover:text-bz-sage">
                  {r.title}
                </h3>
                <p className="mt-2 flex-1 text-[14px] leading-[1.65] text-bz-text-muted">
                  {r.summary}
                </p>
                <span className="mt-6 inline-flex items-center gap-1 text-[12.5px] font-bold text-bz-sage transition-transform duration-200 group-hover:translate-x-0.5">
                  Read more
                  <ArrowUpRight className="size-[13px]" strokeWidth={2.2} />
                </span>
              </a>
            );
          })}
        </div>

        <div className="mt-10 flex justify-center">
          <Button variant="outline" size="md" href="/GuidesAndPlaybooks" withArrow>
            Back to all playbooks
          </Button>
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

        <div className="mt-10 flex justify-center">
          <a
            href="/GuidesAndPlaybooks"
            className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold uppercase tracking-[0.12em] text-white/55 hover:text-white"
          >
            <ArrowLeft className="size-[12px]" strokeWidth={2} />
            Back to Guides &amp; Playbooks
          </a>
        </div>
      </Container>
    </Section>
  );
}

// ─── Not-found state ────────────────────────────────────────────────────────

function NotFoundState({ slug }: { slug: string | undefined }) {
  return (
    <Section pad="hero" tone="light" className="biz-mesh overflow-hidden">
      <Container width="narrow">
        <div className="flex flex-col items-center text-center">
          <PillBadge tone="neutral">Resource not found</PillBadge>
          <h1 className="mt-6 text-[clamp(28px,3.6vw,40px)] font-bold leading-[1.15] tracking-[-0.02em] text-bz-text">
            We couldn't find the playbook you're looking for.
          </h1>
          <p className="mt-4 max-w-[560px] text-[15px] leading-[1.7] text-bz-text-muted">
            {slug ? (
              <>
                The slug <span className="font-mono text-bz-text">{slug}</span>{" "}
                doesn't match any resource in the library. It may have been
                renamed or retired.
              </>
            ) : (
              <>No slug was provided in the URL.</>
            )}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button variant="primary" size="md" href="/GuidesAndPlaybooks" withArrow>
              Browse the library
            </Button>
            <Button variant="ghost" size="md" href="/HelpCenter">
              Visit the Help Center
            </Button>
          </div>
        </div>
      </Container>
    </Section>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

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
      <div>
        <Header />
        <main style={{ paddingTop: 76 }}>
          <NotFoundState slug={slug} />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Header />
      <ProgressBar />
      <main style={{ paddingTop: 76 }}>
        <HeroSection resource={resource} />
        <BodySection resource={resource} />
        <RelatedSection resource={resource} />
        <ClosingCta />

        {/* Floating "next" chip on larger screens links to downloads if present */}
        {resource.downloads && resource.downloads.length > 0 && (
          <div className="pointer-events-none fixed inset-x-0 bottom-6 z-30 hidden justify-center md:flex">
            <a
              href="#downloads"
              className="pointer-events-auto inline-flex items-center gap-2 rounded-bz-pill bg-bz-deep px-4 py-2.5 text-[12.5px] font-semibold text-white shadow-[0_12px_36px_rgba(15,17,14,0.25)] transition-colors hover:bg-black"
            >
              Jump to templates
              <ArrowRight className="size-[13px]" />
            </a>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

