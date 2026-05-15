import { useState } from "react";
import "../../styles/style.css";
import {
  ArrowUpRight,
  BookOpen,
  Download,
  FileText,
  Heart,
  Linkedin,
  Mail,
  Palette,
  Play,
  Repeat2,
  Users,
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
  Marquee,
} from "./bz";
import { cn } from "./ui/utils";

// ════════════════════════════════════════════════════════════════════════════
// CONTENT DATA the newsroom is composition + data, same as HomePage.
// ════════════════════════════════════════════════════════════════════════════

// ── Hero front-page mock ─────────────────────────────────────────────────────

const COVER = {
  outlet: "Forbes",
  tag: "Cover Story",
  date: "April 18, 2026",
  title:
    "Bizak is rewriting the playbook for mid-market ERP, and operators are noticing.",
  href: "#",
};

const COVER_RAIL = [
  { outlet: "TechCrunch",              date: "Apr 02", title: "Bizak picks up momentum with operators." },
  { outlet: "The Wall Street Journal", date: "Mar 24", title: "The quiet ERP winning the back-office war." },
  { outlet: "Bloomberg",               date: "Mar 11", title: "Ex-Stripe Atlas CPO joins the Bizak board." },
];

const OUTLETS = [
  "Forbes", "TechCrunch", "The Wall Street Journal", "Bloomberg",
  "Financial Times", "Bloomberg TV", "The a16z Podcast",
];

// ── Newsroom feed ────────────────────────────────────────────────────────────

type FeedKind = "press" | "release" | "video";
type FilterKey = "all" | FeedKind;

interface FeedItem {
  kind: FeedKind;
  source: string;
  date: string;
  title: string;
  excerpt: string;
  duration?: string;
  href: string;
}

const FEED: FeedItem[] = [
  {
    kind: "press",
    source: "TechCrunch",
    date: "Apr 02",
    title: "Bizak picks up momentum with operators, signals next push into manufacturing AI.",
    excerpt:
      "The Kathmandu-headquartered ERP platform is doubling down on what it calls operator intelligence, and early customers say it's working.",
    href: "#",
  },
  {
    kind: "press",
    source: "The Wall Street Journal",
    date: "Mar 24",
    title: "How a quiet ERP challenger is winning the back-office war, one factory at a time.",
    excerpt:
      "An on-the-ground look at three mid-market manufacturers who replaced legacy ERPs in under 90 days.",
    href: "#",
  },
  {
    kind: "press",
    source: "Bloomberg",
    date: "Mar 11",
    title: "Bizak names former Stripe Atlas CPO Renée Yamamoto to its board.",
    excerpt:
      "The appointment signals a strategic push across South Asia and a continued investment in product-led growth.",
    href: "#",
  },
  {
    kind: "press",
    source: "Financial Times",
    date: "Feb 28",
    title: "Mid-market manufacturers are quietly migrating off legacy ERPs.",
    excerpt:
      "Where they're going and why the transition is happening faster than most analysts predicted.",
    href: "#",
  },
  {
    kind: "release",
    source: "Bizak Newsroom",
    date: "Apr 22",
    title: "Bizak introduces unified Production Intelligence across the manufacturing suite.",
    excerpt:
      "Real-time OEE, downtime root-cause and yield forecasts now ship as a default capability at no additional cost.",
    href: "#",
  },
  {
    kind: "release",
    source: "Bizak Newsroom",
    date: "Apr 09",
    title: "Bizak raises a seed round led by Northrock Capital to fund regional growth.",
    excerpt:
      "The round accelerates hiring across our South Asia hubs and brings deep-industry capability to new markets.",
    href: "#",
  },
  {
    kind: "release",
    source: "Bizak Newsroom",
    date: "Mar 26",
    title: "Bizak partners with a leading logistics provider to digitise mid-market trade workflows.",
    excerpt:
      "A co-built integration brings real-time freight visibility, landed-cost accuracy and customs automation.",
    href: "#",
  },
  {
    kind: "video",
    source: "Bloomberg TV",
    date: "Apr 16",
    title: "How Bizak is rewiring the back office for the AI era.",
    excerpt:
      "A conversation with the founders on operator intelligence and the future of the back office.",
    duration: "24:18",
    href: "#",
  },
  {
    kind: "video",
    source: "The a16z Podcast",
    date: "Mar 30",
    title: "The unsexy software powering modern manufacturers.",
    excerpt:
      "David Richardson on why the back office, not the storefront, is where the next decade of software gets built.",
    duration: "48:04",
    href: "#",
  },
];

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all",     label: "Everything"     },
  { key: "press",   label: "In the press"   },
  { key: "release", label: "Press releases" },
  { key: "video",   label: "Watch & listen" },
];

const FEED_COUNTS: Record<FilterKey, number> = {
  all:     FEED.length,
  press:   FEED.filter((f) => f.kind === "press").length,
  release: FEED.filter((f) => f.kind === "release").length,
  video:   FEED.filter((f) => f.kind === "video").length,
};

const TAG_LABEL: Record<FeedKind, string> = {
  press: "Press", release: "Release", video: "Video",
};
const ACTION_LABEL: Record<FeedKind, string> = {
  press: "Read article", release: "Read release", video: "Watch",
};

// ── The conversation (social) ────────────────────────────────────────────────

interface SocialItem {
  platform: "x" | "linkedin";
  author: string;
  handle: string;
  quote: string;
  hearts: string;
  reposts: string;
}

const SOCIAL: SocialItem[] = [
  {
    platform: "x",
    author: "Maya Hernandez",
    handle: "@mayaresearch",
    quote:
      "Bizak is the rare ERP that mid-market operators describe with the language usually reserved for consumer software: clear, fast, almost suspiciously easy to learn.",
    hearts: "12.4K",
    reposts: "3.1K",
  },
  {
    platform: "linkedin",
    author: "David Richardson",
    handle: "Founder & CEO at Bizak",
    quote:
      "We started Bizak because the back office deserved better than spreadsheets stitched to legacy ERPs, and we're just getting started. Thank you to every operator who took a chance on us.",
    hearts: "28.6K",
    reposts: "1.9K",
  },
  {
    platform: "x",
    author: "Riverside Foods",
    handle: "@riversidefoods",
    quote:
      "We just closed our books in 36 hours. For context: this used to take 11 days. Whatever @bizakerp is doing, keep doing it.",
    hearts: "8.2K",
    reposts: "1.7K",
  },
];

// ── Press kit ────────────────────────────────────────────────────────────────

interface PressKitItem {
  icon: LucideIcon;
  title: string;
  desc: string;
  meta: string;
}

const PRESS_KIT: PressKitItem[] = [
  { icon: Palette,  title: "Brand & logo pack",  desc: "Primary logo, wordmark and app icon in SVG and PNG.", meta: "ZIP · 4.2 MB"  },
  { icon: BookOpen, title: "Brand guidelines",   desc: "Colour, typography, spacing and logo usage rules.",   meta: "PDF · 18 pages" },
  { icon: FileText, title: "Company fact sheet", desc: "Founding story, funding and key milestones.",         meta: "PDF · 2 pages"  },
  { icon: Users,    title: "Leadership bios",    desc: "Executive biographies and print-ready headshots.",    meta: "ZIP · 11 MB"   },
];

// ── Press contact ────────────────────────────────────────────────────────────

const PRESS_STATS = [
  { value: "Growing",  desc: "Press coverage, building month over month." },
  { value: "Weekly",   desc: "Fresh newsroom updates, every week." },
  { value: "< 24 hr",  desc: "Median response time to press inquiries." },
];

// ── X (Twitter) brand glyph lucide ships no brand mark for it ───────────────

function XGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// HERO badge · heading · nav pills · newspaper front-page mock · outlet marquee
// ════════════════════════════════════════════════════════════════════════════

function HeroSection() {
  return (
    <Section tone="b" pad="hero">
      <Container>
        <div className="flex flex-col items-center text-center">
          <BadgeGreen style={{ marginBottom: 28 }}>Press &amp; Media 📰</BadgeGreen>
          <Heading level={2} style={{ marginBottom: 36 }}>
            The Bizak newsroom.{" "}
            <Heading.Muted>
              Press coverage, official announcements, and the milestones worth sharing.
            </Heading.Muted>
          </Heading>
          <PillGroup>
            <Pill variant="dark" withArrow href="#newsroom">View Coverage</Pill>
            <Pill variant="light" withArrow href="#press-contact">Press Contact</Pill>
          </PillGroup>
        </div>

        <div className="bz-hero-visual mx-auto w-full max-w-[1140px]">
          <FrontPageMock />
        </div>

        <FeaturedInStrip />
      </Container>
    </Section>
  );
}

function FrontPageMock() {
  return (
    <div className="overflow-hidden rounded-bz-2xl border border-bz-line bg-bz-surface p-6 shadow-[0_24px_60px_-32px_rgba(15,20,17,0.32)] md:p-9">
      {/* Nameplate */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <span className="size-2 animate-pulse rounded-bz-pill bg-bz-fire" />
          <span className="text-[12px] font-semibold uppercase tracking-[0.2em] text-bz-text">
            The Bizak Newsroom
          </span>
        </div>
        <span className="hidden text-[11.5px] uppercase tracking-[0.14em] text-bz-text-soft sm:block">
          Vol. 5 · Updated weekly
        </span>
      </div>
      <div className="mt-3.5 border-t-2 border-bz-text" />
      <div className="mt-[3px] border-t border-bz-text" />

      {/* Body lead story + headline rail */}
      <div className="grid grid-cols-1 gap-7 pt-7 lg:grid-cols-[1.55fr_1fr] lg:gap-9">
        <a href={COVER.href} className="group block">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-[12px] font-semibold uppercase tracking-[0.16em] text-bz-text">
              {COVER.outlet}
            </span>
            <span className="rounded-bz-sm bg-bz-fire px-2 py-[3px] text-[10px] font-bold uppercase tracking-[0.12em] text-bz-text">
              {COVER.tag}
            </span>
          </div>
          <h3 className="mt-4 text-[clamp(20px,2.5vw,30px)] font-medium leading-[1.17] tracking-[-0.018em] text-bz-text">
            {COVER.title}
          </h3>
          <div className="mt-5 flex items-center gap-4 border-t border-bz-line-soft pt-4">
            <span className="text-[12px] uppercase tracking-[0.1em] text-bz-text-soft">
              {COVER.date}
            </span>
            <span className="ml-auto inline-flex items-center gap-1.5 text-[13px] font-semibold text-bz-text">
              Read the cover story
              <ArrowUpRight
                size={15}
                className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </span>
          </div>
        </a>

        <div className="lg:border-l lg:border-bz-line-soft lg:pl-9">
          <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-bz-text-soft">
            More headlines
          </div>
          <div>
            {COVER_RAIL.map((r) => (
              <div
                key={r.title}
                className="flex flex-col gap-1.5 border-b border-bz-line-soft py-[15px] last:border-b-0 last:pb-0"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[10.5px] font-semibold uppercase tracking-[0.13em] text-bz-text-muted">
                    {r.outlet}
                  </span>
                  <span className="shrink-0 text-[10.5px] uppercase tracking-[0.08em] text-bz-text-soft">
                    {r.date}
                  </span>
                </div>
                <span className="text-[13.5px] font-medium leading-[1.4] text-bz-text">
                  {r.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function FeaturedInStrip() {
  return (
    <div className="mt-14">
      <p className="mb-[22px] text-center text-[12.5px] uppercase tracking-[0.14em] text-bz-text-muted">
        As featured in
      </p>
      <Marquee speed="50s">
        {OUTLETS.map((name) => (
          <span
            key={name}
            className="whitespace-nowrap px-8 text-[16px] font-medium tracking-[0.01em] text-bz-text-soft"
          >
            {name}
          </span>
        ))}
      </Marquee>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// [01] NEWSROOM filterable coverage feed
// ════════════════════════════════════════════════════════════════════════════

function NewsroomSection() {
  const [filter, setFilter] = useState<FilterKey>("all");
  const items = filter === "all" ? FEED : FEED.filter((f) => f.kind === filter);

  return (
    <Section tone="a" id="newsroom">
      <Container>
        <SectionHead
          index="01"
          label="The newsroom"
          title={
            <>
              In the press, on the record,{" "}
              <Heading.Muted>and on the air.</Heading.Muted>
            </>
          }
          titleMaxWidth={820}
        />

        {/* Filter chips */}
        <div className="mb-9 flex flex-wrap gap-2 md:mb-10">
          {FILTERS.map((f) => {
            const active = filter === f.key;
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                aria-pressed={active}
                className={cn(
                  "inline-flex items-center gap-2 rounded-bz-sm border px-3.5 py-2 text-[12.5px] font-semibold transition-colors",
                  active
                    ? "border-bz-text bg-bz-text text-bz-paper"
                    : "border-bz-line bg-bz-surface text-bz-text-muted hover:border-bz-text/40 hover:text-bz-text",
                )}
              >
                {f.label}
                <span
                  className={cn(
                    "rounded-bz-sm px-1.5 py-px text-[10.5px] font-bold tabular-nums",
                    active ? "bg-white/15 text-bz-paper/70" : "bg-bz-paper-warm text-bz-text-soft",
                  )}
                >
                  {FEED_COUNTS[f.key]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Coverage grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <FeedCard key={item.title} item={item} />
          ))}
        </div>
      </Container>
    </Section>
  );
}

function FeedCard({ item }: { item: FeedItem }) {
  const isRelease = item.kind === "release";
  return (
    <a
      href={item.href}
      className="group flex h-full flex-col rounded-bz-xl border border-bz-line-soft bg-bz-surface p-5 transition-all duration-200 hover:-translate-y-[3px] hover:border-bz-line hover:shadow-[0_18px_40px_-20px_rgba(15,20,17,0.25)] md:p-6"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold uppercase tracking-[0.12em] text-bz-text">
          {isRelease && <span className="size-1.5 shrink-0 rounded-bz-pill bg-bz-fire" />}
          {item.source}
        </span>
        <span className="shrink-0 text-[11px] uppercase tracking-[0.07em] text-bz-text-soft">
          {item.date}
        </span>
      </div>

      <h3 className="mt-3.5 line-clamp-3 text-[16.5px] font-medium leading-[1.36] tracking-[-0.008em] text-bz-text">
        {item.title}
      </h3>
      <p className="mt-2 mb-5 line-clamp-2 text-[13px] leading-[1.62] text-bz-text-muted">
        {item.excerpt}
      </p>

      <div className="mt-auto flex items-center justify-between gap-3 border-t border-bz-line-soft pt-4">
        <span className="inline-flex items-center gap-2">
          <span className="rounded-bz-sm bg-bz-paper-warm px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-bz-text-muted">
            {TAG_LABEL[item.kind]}
          </span>
          {item.duration && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium tabular-nums text-bz-text-soft">
              <Play size={9} fill="currentColor" />
              {item.duration}
            </span>
          )}
        </span>
        <span className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-bz-text">
          {ACTION_LABEL[item.kind]}
          <ArrowUpRight
            size={14}
            className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </span>
      </div>
    </a>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// [02] THE CONVERSATION earned social moments
// ════════════════════════════════════════════════════════════════════════════

function ConversationSection() {
  return (
    <Section tone="b">
      <Container>
        <SectionHead
          index="02"
          label="The conversation"
          title={
            <>
              The moments people{" "}
              <Heading.Muted>chose to share.</Heading.Muted>
            </>
          }
          description="Unprompted posts from operators, analysts and customers. The kind of coverage you cannot buy."
          titleMaxWidth={680}
        />

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {SOCIAL.map((s) => (
            <SocialCard key={s.handle} item={s} />
          ))}
        </div>
      </Container>
    </Section>
  );
}

function SocialCard({ item }: { item: SocialItem }) {
  const isLinkedIn = item.platform === "linkedin";
  return (
    <a
      href="#"
      className="group flex h-full flex-col rounded-bz-xl border border-bz-line-soft bg-bz-surface p-6 transition-all duration-200 hover:-translate-y-[3px] hover:border-bz-line hover:shadow-[0_18px_40px_-20px_rgba(15,20,17,0.25)]"
    >
      <div className="flex items-center gap-3">
        <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-bz-md bg-bz-paper-warm">
          {isLinkedIn ? (
            <Linkedin size={15} className="text-bz-text" />
          ) : (
            <XGlyph className="size-[13px] text-bz-text" />
          )}
        </span>
        <div className="min-w-0">
          <div className="truncate text-[13.5px] font-semibold text-bz-text">
            {item.author}
          </div>
          <div className="truncate text-[11.5px] text-bz-text-soft">{item.handle}</div>
        </div>
      </div>

      <p className="mt-5 mb-6 text-[14.5px] leading-[1.6] text-bz-text">
        &ldquo;{item.quote}&rdquo;
      </p>

      <div className="mt-auto flex items-center gap-4 border-t border-bz-line-soft pt-4">
        <span className="inline-flex items-center gap-1.5 text-[12px] text-bz-text-muted">
          <Heart size={12} className="text-bz-text-soft" />
          <span className="font-semibold tabular-nums text-bz-text">{item.hearts}</span>
        </span>
        <span className="inline-flex items-center gap-1.5 text-[12px] text-bz-text-muted">
          <Repeat2 size={13} className="text-bz-text-soft" />
          <span className="font-semibold tabular-nums text-bz-text">{item.reposts}</span>
        </span>
        <span className="ml-auto inline-flex items-center gap-1 text-[12px] font-semibold text-bz-text">
          View post
          <ArrowUpRight
            size={13}
            className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </span>
      </div>
    </a>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// [03] PRESS KIT downloadable brand assets
// ════════════════════════════════════════════════════════════════════════════

function PressKitSection() {
  return (
    <Section tone="a">
      <Container>
        <SectionHead
          index="03"
          label="Press kit"
          title={
            <>
              Brand assets, ready{" "}
              <Heading.Muted>for your story.</Heading.Muted>
            </>
          }
          description="Logos, brand guidelines, the company fact sheet and leadership headshots. Everything approved for editorial use."
          titleMaxWidth={680}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PRESS_KIT.map((k) => (
            <PressKitCard key={k.title} item={k} />
          ))}
        </div>
      </Container>
    </Section>
  );
}

function PressKitCard({ item }: { item: PressKitItem }) {
  const Icon = item.icon;
  return (
    <a
      href="#"
      className="group flex h-full flex-col rounded-bz-xl border border-bz-line-soft bg-bz-surface p-6 transition-all duration-200 hover:-translate-y-[3px] hover:border-bz-line hover:shadow-[0_18px_40px_-20px_rgba(15,20,17,0.25)]"
    >
      <span className="inline-flex size-11 items-center justify-center rounded-bz-md bg-bz-paper-warm">
        <Icon size={19} strokeWidth={1.6} className="text-bz-text" />
      </span>
      <h3 className="mt-5 text-[16px] font-medium tracking-[-0.01em] text-bz-text">
        {item.title}
      </h3>
      <p className="mt-1.5 mb-5 text-[13px] leading-[1.6] text-bz-text-muted">
        {item.desc}
      </p>
      <div className="mt-auto flex items-center justify-between gap-3 border-t border-bz-line-soft pt-4">
        <span className="text-[11px] font-medium uppercase tracking-[0.07em] text-bz-text-soft">
          {item.meta}
        </span>
        <span className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-bz-text">
          Download
          <Download
            size={13}
            className="transition-transform group-hover:translate-y-0.5"
          />
        </span>
      </div>
    </a>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// [04] PRESS CONTACT media inquiries + response promise
// ════════════════════════════════════════════════════════════════════════════

function PressContactSection() {
  return (
    <Section tone="b" id="press-contact">
      <Container>
        <SectionHead
          index="04"
          label="Press contact"
          title={
            <>
              Working on a story?{" "}
              <Heading.Muted>We move at deadline speed.</Heading.Muted>
            </>
          }
          description="Editorial inquiries, fact-checks and analyst briefings, answered within one business day. Flag an urgent deadline and we will move with it."
          titleMaxWidth={700}
        />

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {/* Reach the team */}
          <div className="flex flex-col rounded-bz-2xl border border-bz-line bg-bz-surface p-6 md:p-8">
            <h3 className="text-[18px] font-medium tracking-[-0.01em] text-bz-text">
              Reach the press team
            </h3>
            <p className="mt-2 mb-6 text-[13.5px] leading-[1.6] text-bz-text-muted">
              Email is the fastest route. For interviews, briefings or
              fact-checks, we read and route every message the same day.
            </p>
            <div className="flex flex-col gap-3">
              <ContactRow
                icon={Mail}
                href="mailto:press@bizakerp.com"
                label="Editorial & analyst inquiries"
                value="press@bizakerp.com"
              />
              <ContactRow
                icon={Linkedin}
                href="#"
                label="Follow the newsroom"
                value="@bizakerp on LinkedIn"
              />
            </div>
          </div>

          {/* What to expect */}
          <div className="flex flex-col rounded-bz-2xl border border-bz-line bg-bz-surface p-6 md:p-8">
            <h3 className="text-[18px] font-medium tracking-[-0.01em] text-bz-text">
              What to expect
            </h3>
            <p className="mt-2 mb-2 text-[13.5px] leading-[1.6] text-bz-text-muted">
              A newsroom that runs on a deadline cadence, not a quarterly one.
            </p>
            <div className="mt-auto flex flex-col">
              {PRESS_STATS.map((s, i) => (
                <div
                  key={s.value}
                  className={cn(
                    "flex items-baseline gap-4 py-[18px]",
                    i > 0 && "border-t border-bz-line-soft",
                  )}
                >
                  <span className="min-w-[104px] shrink-0 text-[27px] font-medium leading-none tracking-[-0.02em] text-bz-text">
                    {s.value}
                  </span>
                  <span className="text-[13px] leading-[1.5] text-bz-text-muted">
                    {s.desc}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}

function ContactRow({
  icon: Icon,
  href,
  label,
  value,
}: {
  icon: LucideIcon;
  href: string;
  label: string;
  value: string;
}) {
  return (
    <a
      href={href}
      className="group flex items-center gap-4 rounded-bz-xl border border-bz-line-soft bg-bz-paper px-4 py-3.5 transition-colors hover:border-bz-line hover:bg-bz-paper-warm"
    >
      <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-bz-md bg-bz-olive text-bz-paper">
        <Icon size={16} strokeWidth={1.8} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-[11px] font-semibold uppercase tracking-[0.09em] text-bz-text-soft">
          {label}
        </div>
        <div className="mt-0.5 truncate text-[14px] font-medium text-bz-text">
          {value}
        </div>
      </div>
      <ArrowUpRight
        size={16}
        className="shrink-0 text-bz-text-soft transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-bz-text"
      />
    </a>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PAGE
// ════════════════════════════════════════════════════════════════════════════

export function PressAndMediaPage() {
  return (
    <main>
      <HeroSection />
      <NewsroomSection />
      <ConversationSection />
      <PressKitSection />
      <PressContactSection />
    </main>
  );
}
