import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { CalendarDays, Info } from "lucide-react";
import { BadgeGreen, Container, DotGrid, Eyebrow, Heading, Section } from "../bz";
import { cn } from "../ui/utils";

// ════════════════════════════════════════════════════════════════════════════
// Legal & Trust page kit
//
// Shared building blocks for the /privacy, /terms, /cookies and /security
// pages. Scoped to the legal pages (per CLAUDE.md §8) it composes the bz/
// primitives and is not promoted to bz/ until a second nav group needs it.
//
//   <LegalHero badge="…" title="…" summary="…" meta="…" />
//   <LegalDoc sections={SECTIONS} />            ← prose pages
//
// The Security page reuses <LegalHero> but composes its own card-based body
// from bz/ primitives instead of <LegalDoc>.
// ════════════════════════════════════════════════════════════════════════════

// ── Content model ────────────────────────────────────────────────────────────

export type LegalBlock =
  | { kind: "p"; text: ReactNode }
  | { kind: "h3"; text: string }
  | { kind: "ul"; items: ReactNode[] }
  | { kind: "fields"; items: { label: string; value: ReactNode }[] }
  | { kind: "note"; text: ReactNode };

export interface LegalSectionData {
  /** Anchor id, also used by the table of contents. */
  id: string;
  /** Section heading. */
  title: string;
  blocks: LegalBlock[];
}

// ── Inline link ──────────────────────────────────────────────────────────────
// Used inside prose for mailto: links and cross-page links.

export function LegalLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      className="font-medium text-bz-text underline decoration-bz-line underline-offset-[3px] transition-colors hover:decoration-bz-text"
    >
      {children}
    </a>
  );
}

// ── Hero ─────────────────────────────────────────────────────────────────────
// Dark olive canvas the dark Header flows straight into it (the dark header
// carries a transparent bottom border, so the two surfaces blend).

export interface LegalHeroProps {
  badge: string;
  title: ReactNode;
  summary: ReactNode;
  /** "Last updated …" line, shown as a chip below the summary (prose pages). */
  meta?: string;
  /** Trust chips, shown below the summary (Security page). */
  chips?: string[];
}

export function LegalHero({ badge, title, summary, meta, chips }: LegalHeroProps) {
  return (
    <Section tone="dark" pad="hero" className="overflow-hidden">
      <DotGrid tone="dark" />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 -top-40 size-[440px] rounded-bz-pill bg-bz-olive-soft/40"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-48 -left-36 size-[400px] rounded-bz-pill bg-bz-olive-soft/30"
      />

      <Container width="narrow" className="relative z-[1]">
        <div className="mx-auto flex max-w-[760px] flex-col items-center text-center">
          <BadgeGreen style={{ marginBottom: 24 }}>{badge}</BadgeGreen>

          <Heading level={2} tone="dark" style={{ marginBottom: 20 }}>
            {title}
          </Heading>

          <p className="m-0 max-w-[600px] text-[15px] leading-[1.7] text-white/[0.62]">
            {summary}
          </p>

          {meta && (
            <span className="mt-7 inline-flex items-center gap-2 rounded-bz-sm border border-white/[0.14] bg-white/[0.04] px-3.5 py-1.5 text-[12.5px] text-white/[0.7]">
              <CalendarDays size={13} className="text-bz-leaf" />
              {meta}
            </span>
          )}

          {chips && chips.length > 0 && (
            <div className="mt-7 flex flex-wrap justify-center gap-2">
              {chips.map((c) => (
                <span
                  key={c}
                  className="inline-flex items-center gap-1.5 rounded-bz-sm border border-white/[0.14] bg-white/[0.04] px-3 py-1.5 text-[12px] font-medium text-white/[0.72]"
                >
                  <span aria-hidden className="size-1.5 rounded-bz-pill bg-bz-fire" />
                  {c}
                </span>
              ))}
            </div>
          )}
        </div>
      </Container>
    </Section>
  );
}

// ── Table of contents (sticky, desktop only) ─────────────────────────────────

function useScrollSpy(ids: string[]) {
  const [active, setActive] = useState<string>(ids[0] ?? "");
  useEffect(() => {
    if (ids.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-96px 0px -68% 0px" },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids.join("|")]);
  return active;
}

function Toc({ sections }: { sections: LegalSectionData[] }) {
  const active = useScrollSpy(sections.map((s) => s.id));
  return (
    <nav aria-label="On this page" className="hidden lg:block">
      <div className="sticky top-10">
        <Eyebrow className="mb-4 block">On this page</Eyebrow>
        <ol className="m-0 flex list-none flex-col gap-0.5 p-0">
          {sections.map((s, i) => {
            const isActive = active === s.id;
            return (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className={cn(
                    "flex gap-2.5 rounded-bz-sm px-2.5 py-[7px] text-[12.5px] leading-[1.45] no-underline transition-colors",
                    isActive
                      ? "bg-bz-paper-warm font-medium text-bz-text"
                      : "text-bz-text-muted hover:text-bz-text",
                  )}
                >
                  <span
                    className={cn(
                      "tabular-nums",
                      isActive ? "text-bz-olive" : "text-bz-text-soft",
                    )}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>{s.title}</span>
                </a>
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}

// ── Block + section renderers ────────────────────────────────────────────────

function renderBlock(block: LegalBlock, key: number) {
  switch (block.kind) {
    case "p":
      return (
        <p
          key={key}
          className="m-0 max-w-[700px] text-[14.5px] leading-[1.72] text-bz-text-muted"
        >
          {block.text}
        </p>
      );
    case "h3":
      return (
        <h3
          key={key}
          className="m-0 mt-1.5 text-[14.5px] font-semibold tracking-tight text-bz-text"
        >
          {block.text}
        </h3>
      );
    case "ul":
      return (
        <ul key={key} className="m-0 flex max-w-[700px] list-none flex-col gap-2 p-0">
          {block.items.map((it, j) => (
            <li
              key={j}
              className="flex gap-3 text-[14.5px] leading-[1.65] text-bz-text-muted"
            >
              <span
                aria-hidden
                className="mt-[8px] size-1.5 shrink-0 rounded-bz-pill bg-bz-leaf-deep"
              />
              <span>{it}</span>
            </li>
          ))}
        </ul>
      );
    case "fields":
      return (
        <dl
          key={key}
          className="m-0 flex max-w-[700px] flex-col gap-3 rounded-bz-lg border border-bz-line-soft bg-bz-paper-warm p-4"
        >
          {block.items.map((f, j) => (
            <div key={j} className="flex flex-col gap-0.5 sm:flex-row sm:gap-4">
              <dt className="shrink-0 text-[11px] font-medium uppercase tracking-[0.12em] text-bz-text-soft sm:w-[150px] sm:pt-[2px]">
                {f.label}
              </dt>
              <dd className="m-0 text-[14px] text-bz-text">{f.value}</dd>
            </div>
          ))}
        </dl>
      );
    case "note":
      return (
        <div
          key={key}
          className="flex max-w-[700px] gap-3 rounded-bz-lg border border-bz-line-soft bg-bz-paper-warm p-4"
        >
          <Info
            size={16}
            strokeWidth={1.8}
            className="mt-[1px] shrink-0 text-bz-olive"
          />
          <p className="m-0 text-[13.5px] leading-[1.62] text-bz-text-muted">
            {block.text}
          </p>
        </div>
      );
  }
}

function LegalSectionView({
  index,
  data,
}: {
  index: number;
  data: LegalSectionData;
}) {
  return (
    <section id={data.id} className="scroll-mt-28">
      <div className="flex items-baseline gap-3">
        <span className="text-[12.5px] font-semibold tabular-nums text-bz-text-soft">
          {String(index).padStart(2, "0")}
        </span>
        <h2 className="m-0 text-[19px] font-medium leading-[1.3] tracking-tight text-bz-text md:text-[21px]">
          {data.title}
        </h2>
      </div>
      <div className="mt-4 flex flex-col gap-4">
        {data.blocks.map((b, i) => renderBlock(b, i))}
      </div>
    </section>
  );
}

// ── Document body (prose pages) ──────────────────────────────────────────────

export function LegalDoc({ sections }: { sections: LegalSectionData[] }) {
  return (
    <Section tone="a">
      <Container width="narrow">
        <div className="grid gap-x-[clamp(48px,6vw,84px)] gap-y-12 lg:grid-cols-[200px_minmax(0,1fr)]">
          <Toc sections={sections} />
          <div className="flex flex-col gap-12 md:gap-14">
            {sections.map((s, i) => (
              <LegalSectionView key={s.id} index={i + 1} data={s} />
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}
