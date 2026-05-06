import { useMemo, useState } from "react";
import "../../styles/style.css";
import {
  ArrowRight,
  ArrowUpRight,
  Heart,
  Linkedin,
  Mail,
  Megaphone,
  MessageSquare,
  Newspaper,
  Repeat2,
  Rss,
  Video,
  type LucideIcon,
} from "lucide-react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import {
  Button,
  Container,
  HeroBadge,
  PillBadge,
  Section,
} from "./marketing";

// ─── Types ────────────────────────────────────────────────────────────────────

type FilterKey = "all" | "press" | "release" | "social" | "video";

type MediaItem =
  | {
      kind: "press";
      date: string;
      href: string;
      outlet: string;
      title: string;
      excerpt: string;
      tag: string;
      image?: string;
    }
  | {
      kind: "release";
      date: string;
      href: string;
      title: string;
      excerpt: string;
      tag: string;
    }
  | {
      kind: "social";
      date: string;
      href: string;
      platform: "twitter" | "linkedin";
      author: string;
      handle: string;
      quote: string;
      hearts: string;
      reposts: string;
      verified?: boolean;
    }
  | {
      kind: "video";
      date: string;
      href: string;
      outlet: string;
      title: string;
      duration: string;
      thumbnail: string;
    };

// ─── Featured (hero cover) ────────────────────────────────────────────────────

const FEATURED = {
  outlet: "Forbes",
  date: "Apr 18, 2026",
  tag: "Cover Story",
  title:
    "Bizak is rewriting the playbook for mid-market ERP — and operators are noticing.",
  href: "#",
  image:
    "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80",
};

// ─── Feed data ────────────────────────────────────────────────────────────────

const MEDIA: MediaItem[] = [
  // Press
  {
    kind: "press",
    date: "Apr 02, 2026",
    href: "#",
    outlet: "TechCrunch",
    title:
      "Bizak crosses 50,000 customers, signals next push into manufacturing AI.",
    excerpt:
      "The Singapore-headquartered ERP platform is doubling down on what it calls 'operator intelligence' — and the numbers say it's working.",
    tag: "Product",
    image:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80",
  },
  {
    kind: "press",
    date: "Mar 24, 2026",
    href: "#",
    outlet: "The Wall Street Journal",
    title:
      "How a quiet ERP challenger is winning the back-office war one factory at a time.",
    excerpt:
      "An on-the-ground look at three mid-market manufacturers who replaced legacy ERPs in under 90 days — and what changed for their operators.",
    tag: "Business",
  },
  {
    kind: "press",
    date: "Mar 11, 2026",
    href: "#",
    outlet: "Bloomberg",
    title:
      "Bizak names former Stripe Atlas CPO Renée Yamamoto to its board.",
    excerpt:
      "The appointment signals a strategic push into international markets and a continued investment in product-led growth.",
    tag: "Leadership",
  },
  {
    kind: "press",
    date: "Feb 28, 2026",
    href: "#",
    outlet: "Financial Times",
    title:
      "Mid-market manufacturers are quietly migrating off legacy ERPs.",
    excerpt:
      "Where they're going — and why the transition is happening faster than most analysts predicted.",
    tag: "Industry",
  },

  // Press releases (Bizak's own)
  {
    kind: "release",
    date: "Apr 22, 2026",
    href: "#",
    title:
      "Bizak introduces unified Production Intelligence across the manufacturing suite",
    excerpt:
      "Real-time OEE, downtime root-cause, and yield forecasts now ship as a default capability for every manufacturing customer — at no additional cost.",
    tag: "Product",
  },
  {
    kind: "release",
    date: "Apr 09, 2026",
    href: "#",
    title:
      "Bizak closes $180M Series D led by Northrock Capital to fund global expansion",
    excerpt:
      "The round will accelerate hiring across our four global hubs and bring deep-industry capability to three new geographies in 2026.",
    tag: "Funding",
  },
  {
    kind: "release",
    date: "Mar 26, 2026",
    href: "#",
    title:
      "Bizak partners with Maersk to digitise mid-market global trade workflows",
    excerpt:
      "A new co-built integration brings real-time freight visibility, landed-cost accuracy, and customs automation to every Bizak distribution customer.",
    tag: "Partnership",
  },

  // Social / viral moments
  {
    kind: "social",
    date: "Apr 20, 2026",
    href: "#",
    platform: "twitter",
    author: "Maya Hernandez",
    handle: "@mayaresearch",
    quote:
      "Bizak is the rare ERP that mid-market operators describe with the language usually reserved for consumer software — clear, fast, almost suspiciously easy to learn.",
    hearts: "12.4K",
    reposts: "3.1K",
    verified: true,
  },
  {
    kind: "social",
    date: "Apr 14, 2026",
    href: "#",
    platform: "linkedin",
    author: "David Richardson",
    handle: "Founder & CEO at Bizak",
    quote:
      "Five years ago we said the back office deserved better than spreadsheets stitched to legacy ERPs. 50,000 customers later, we're just getting started — thank you to every operator who took a chance on us.",
    hearts: "28.6K",
    reposts: "1.9K",
    verified: true,
  },
  {
    kind: "social",
    date: "Apr 03, 2026",
    href: "#",
    platform: "twitter",
    author: "Riverside Foods",
    handle: "@riversidefoods",
    quote:
      "We just closed our books in 36 hours. For context: this used to take 11 days. Whatever @bizakerp is doing — keep doing it.",
    hearts: "8.2K",
    reposts: "1.7K",
  },

  // Video / podcast
  {
    kind: "video",
    date: "Apr 16, 2026",
    href: "#",
    outlet: "Bloomberg TV",
    title:
      "How Bizak is rewiring the back office for the AI era — a conversation with the founders.",
    duration: "24:18",
    thumbnail:
      "https://images.unsplash.com/photo-1573164574572-cb89e39749b4?auto=format&fit=crop&w=900&q=80",
  },
  {
    kind: "video",
    date: "Mar 30, 2026",
    href: "#",
    outlet: "The a16z Podcast",
    title:
      "The unsexy software powering modern manufacturers — with David Richardson.",
    duration: "48:04",
    thumbnail:
      "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?auto=format&fit=crop&w=900&q=80",
  },
];

// ─── Filter pills ─────────────────────────────────────────────────────────────

const FILTERS: { key: FilterKey; label: string; icon: LucideIcon }[] = [
  { key: "all",     label: "Everything",      icon: Rss            },
  { key: "press",   label: "In the press",    icon: Newspaper      },
  { key: "release", label: "Press releases",  icon: Megaphone      },
  { key: "social",  label: "Viral moments",   icon: MessageSquare  },
  { key: "video",   label: "Video & podcast", icon: Video          },
];

// ─── Inline SVGs (X / play triangle / verified) ───────────────────────────────

function XGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function PlayGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <polygon points="6,3.5 21,12 6,20.5" />
    </svg>
  );
}

function VerifiedBadge({ tone = "sage" }: { tone?: "sage" | "sky" }) {
  return (
    <span
      aria-hidden
      className={[
        "inline-flex size-[14px] items-center justify-center rounded-full text-[9px] font-bold text-white",
        tone === "sky" ? "bg-sky-500" : "bg-bz-sage",
      ].join(" ")}
    >
      ✓
    </span>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function HeroSection() {
  return (
    <Section pad="hero" tone="light" className="biz-mesh overflow-hidden">
      <Container className="relative">
        <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
          {/* Left — text */}
          <div className="max-w-[640px]">
            <HeroBadge>Press &amp; Media</HeroBadge>
            <h1 className="mt-4 text-[clamp(40px,5.2vw,60px)] font-bold leading-[1.05] tracking-[-0.03em] text-bz-text">
              The{" "}
              <span className="relative inline-block">
                Bizak newsroom
                <span className="absolute inset-x-0 bottom-1 -z-0 h-[10px] rounded-full bg-bz-accent/55" />
              </span>
              .
            </h1>
            <p className="mt-5 max-w-[560px] text-[17px] leading-[1.7] text-bz-text-muted">
              Press coverage, official announcements, and the moments people
              are sharing about Bizak — curated in one feed for journalists,
              analysts, and partners.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button variant="primary" size="md" href="#feed" withArrow>
                Browse the feed
              </Button>
              <Button variant="ghost" size="md" href="#press-contact">
                Press contact
              </Button>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-bz-text-soft">
              <span className="inline-flex items-center gap-1.5">
                <Newspaper className="size-[14px] text-bz-sage" strokeWidth={1.8} />
                240+ features in 2025
              </span>
              <span aria-hidden className="size-1 rounded-full bg-bz-text-soft/40" />
              <span>Updated weekly</span>
              <span aria-hidden className="size-1 rounded-full bg-bz-text-soft/40" />
              <span>24-hour press response</span>
            </div>
          </div>

          {/* Right — magazine cover */}
          <a
            href={FEATURED.href}
            className="group relative mx-auto block w-full max-w-[440px] overflow-hidden rounded-bz-2xl border border-bz-border bg-bz-deep shadow-[0_24px_64px_rgba(15,17,14,0.18)] transition-transform duration-300 hover:-translate-y-1 lg:mx-0"
          >
            <div className="relative aspect-[4/5] w-full overflow-hidden">
              <ImageWithFallback
                src={FEATURED.image}
                alt={FEATURED.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              />

              {/* Top overlay — outlet + tag */}
              <div className="absolute inset-x-0 top-0 flex items-center justify-between p-5">
                <span className="rounded-bz-pill bg-white/95 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-bz-text">
                  {FEATURED.outlet}
                </span>
                <PillBadge tone="accent" dot>
                  {FEATURED.tag}
                </PillBadge>
              </div>

              {/* Bottom gradient + headline */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-black/85 via-black/40 to-transparent"
              />
              <div className="absolute inset-x-0 bottom-0 p-6 md:p-7">
                <h2 className="text-[clamp(20px,2.4vw,26px)] font-bold leading-[1.2] tracking-[-0.01em] text-white">
                  {FEATURED.title}
                </h2>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-white/70">
                    {FEATURED.date}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-[13px] font-bold text-bz-accent transition-transform duration-200 group-hover:translate-x-0.5">
                    Read the cover story
                    <ArrowUpRight className="size-[14px]" strokeWidth={2.2} />
                  </span>
                </div>
              </div>
            </div>
          </a>
        </div>
      </Container>
    </Section>
  );
}

// ─── Feed cards ───────────────────────────────────────────────────────────────

function PressCard({ item }: { item: Extract<MediaItem, { kind: "press" }> }) {
  return (
    <a
      href={item.href}
      className="group mb-5 block break-inside-avoid overflow-hidden rounded-bz-xl border border-bz-border bg-bz-surface transition-all duration-200 hover:-translate-y-[2px] hover:border-bz-sage-mid hover:shadow-[0_16px_40px_rgba(15,17,14,0.06)]"
    >
      {item.image && (
        <div className="relative aspect-[16/10] overflow-hidden bg-bz-bg">
          <ImageWithFallback
            src={item.image}
            alt={item.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        </div>
      )}
      <div className="p-6">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[12px] font-bold uppercase tracking-[0.1em] text-bz-sage">
            {item.outlet}
          </span>
          <span className="text-[11px] uppercase tracking-[0.08em] text-bz-text-soft">
            {item.date}
          </span>
        </div>
        <h3 className="mt-3 text-[18px] font-bold leading-[1.3] tracking-[-0.005em] text-bz-text transition-colors group-hover:text-bz-sage">
          {item.title}
        </h3>
        <p className="mt-2 text-[13.5px] leading-[1.65] text-bz-text-muted">
          {item.excerpt}
        </p>
        <div className="mt-5 flex items-center justify-between gap-3 border-t border-bz-border-soft pt-4">
          <PillBadge tone="neutral">{item.tag}</PillBadge>
          <span className="inline-flex items-center gap-1 text-[12.5px] font-bold text-bz-sage transition-transform duration-200 group-hover:translate-x-0.5">
            Read article
            <ArrowUpRight className="size-[13px]" strokeWidth={2.2} />
          </span>
        </div>
      </div>
    </a>
  );
}

function ReleaseCard({ item }: { item: Extract<MediaItem, { kind: "release" }> }) {
  return (
    <a
      href={item.href}
      className="group relative mb-5 block break-inside-avoid overflow-hidden rounded-bz-xl border border-bz-border bg-bz-surface p-6 transition-all duration-200 hover:-translate-y-[2px] hover:border-bz-sage-mid hover:shadow-[0_16px_40px_rgba(15,17,14,0.06)]"
    >
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 w-1 bg-bz-accent/70"
      />
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-bz-pill bg-bz-accent/15 px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-[0.14em] text-bz-deep">
          <Megaphone className="size-[11px]" strokeWidth={2} />
          Press release
        </span>
        <span className="text-[11px] uppercase tracking-[0.08em] text-bz-text-soft">
          {item.date}
        </span>
      </div>
      <h3 className="mt-4 text-[18px] font-bold leading-[1.3] tracking-[-0.005em] text-bz-text transition-colors group-hover:text-bz-sage">
        {item.title}
      </h3>
      <p className="mt-2 text-[13.5px] leading-[1.65] text-bz-text-muted">
        {item.excerpt}
      </p>
      <div className="mt-5 flex items-center justify-between gap-3 border-t border-bz-border-soft pt-4">
        <PillBadge tone="sage">{item.tag}</PillBadge>
        <span className="inline-flex items-center gap-1 text-[12.5px] font-bold text-bz-sage transition-transform duration-200 group-hover:translate-x-0.5">
          Read full release
          <ArrowRight className="size-[13px]" strokeWidth={2.2} />
        </span>
      </div>
    </a>
  );
}

function SocialCard({ item }: { item: Extract<MediaItem, { kind: "social" }> }) {
  const isLinkedIn = item.platform === "linkedin";

  return (
    <a
      href={item.href}
      className="group mb-5 block break-inside-avoid rounded-bz-xl border border-bz-border bg-bz-surface p-6 transition-all duration-200 hover:-translate-y-[2px] hover:border-bz-sage-mid hover:shadow-[0_16px_40px_rgba(15,17,14,0.06)]"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className={[
              "inline-flex size-10 shrink-0 items-center justify-center rounded-bz-pill",
              isLinkedIn ? "bg-sky-50" : "bg-bz-bg",
            ].join(" ")}
            aria-hidden
          >
            {isLinkedIn ? (
              <Linkedin
                className="size-[16px] text-sky-600"
                strokeWidth={2}
                fill="currentColor"
              />
            ) : (
              <XGlyph className="size-[14px] text-bz-text" />
            )}
          </span>
          <div className="min-w-0 leading-tight">
            <div className="flex items-center gap-1.5 truncate">
              <span className="truncate text-[14px] font-bold text-bz-text">
                {item.author}
              </span>
              {item.verified && (
                <VerifiedBadge tone={isLinkedIn ? "sky" : "sage"} />
              )}
            </div>
            <div className="truncate text-[12px] text-bz-text-soft">
              {item.handle}
            </div>
          </div>
        </div>
        <span className="shrink-0 text-[11px] uppercase tracking-[0.08em] text-bz-text-soft">
          {item.date}
        </span>
      </div>

      <p className="mt-5 text-[16px] leading-[1.55] tracking-[-0.005em] text-bz-text">
        &ldquo;{item.quote}&rdquo;
      </p>

      <div className="mt-6 flex items-center gap-5 border-t border-bz-border-soft pt-4 text-[12px] text-bz-text-muted">
        <span className="inline-flex items-center gap-1.5">
          <Heart className="size-[12px] text-rose-500" strokeWidth={2} fill="currentColor" />
          <span className="font-semibold text-bz-text">{item.hearts}</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Repeat2 className="size-[13px] text-bz-sage" strokeWidth={2} />
          <span className="font-semibold text-bz-text">{item.reposts}</span>
        </span>
        <span className="ml-auto inline-flex items-center gap-1 text-[12px] font-bold text-bz-sage transition-transform duration-200 group-hover:translate-x-0.5">
          View post
          <ArrowUpRight className="size-[12px]" strokeWidth={2.2} />
        </span>
      </div>
    </a>
  );
}

function VideoCard({ item }: { item: Extract<MediaItem, { kind: "video" }> }) {
  return (
    <a
      href={item.href}
      className="group mb-5 block break-inside-avoid overflow-hidden rounded-bz-xl border border-bz-border bg-bz-surface transition-all duration-200 hover:-translate-y-[2px] hover:border-bz-sage-mid hover:shadow-[0_16px_40px_rgba(15,17,14,0.06)]"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-bz-deep">
        <ImageWithFallback
          src={item.thumbnail}
          alt={item.title}
          className="h-full w-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-[1.04]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/65 via-black/0 to-black/0"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="inline-flex size-14 items-center justify-center rounded-full bg-white/95 shadow-[0_12px_32px_rgba(0,0,0,0.25)] transition-transform duration-200 group-hover:scale-110">
            <PlayGlyph className="ml-0.5 size-5 text-bz-deep" />
          </span>
        </div>
        <span className="absolute bottom-3 right-3 rounded-bz-md bg-black/70 px-2 py-1 text-[11px] font-bold tabular-nums text-white">
          {item.duration}
        </span>
      </div>
      <div className="p-6">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[12px] font-bold uppercase tracking-[0.1em] text-bz-sage">
            {item.outlet}
          </span>
          <span className="text-[11px] uppercase tracking-[0.08em] text-bz-text-soft">
            {item.date}
          </span>
        </div>
        <h3 className="mt-3 text-[17px] font-bold leading-[1.35] tracking-[-0.005em] text-bz-text transition-colors group-hover:text-bz-sage">
          {item.title}
        </h3>
        <span className="mt-4 inline-flex items-center gap-1 text-[12.5px] font-bold text-bz-sage transition-transform duration-200 group-hover:translate-x-0.5">
          Watch the conversation
          <ArrowUpRight className="size-[13px]" strokeWidth={2.2} />
        </span>
      </div>
    </a>
  );
}

function FeedCard({ item }: { item: MediaItem }) {
  switch (item.kind) {
    case "press":   return <PressCard item={item} />;
    case "release": return <ReleaseCard item={item} />;
    case "social":  return <SocialCard item={item} />;
    case "video":   return <VideoCard item={item} />;
  }
}

// ─── Feed section ─────────────────────────────────────────────────────────────

function FeedSection() {
  const [filter, setFilter] = useState<FilterKey>("all");

  const counts = useMemo(() => {
    const map: Record<FilterKey, number> = {
      all: MEDIA.length,
      press: 0,
      release: 0,
      social: 0,
      video: 0,
    };
    MEDIA.forEach((m) => {
      map[m.kind] += 1;
    });
    return map;
  }, []);

  const items = useMemo(
    () => (filter === "all" ? MEDIA : MEDIA.filter((m) => m.kind === filter)),
    [filter],
  );

  return (
    <Section tone="white" pad="default" id="feed">
      <Container>
        {/* Section header */}
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between md:gap-10">
          <div className="max-w-[560px]">
            <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-bz-sage">
              The newsroom
            </span>
            <h2 className="mt-3 text-[clamp(28px,3.4vw,40px)] font-bold leading-[1.1] tracking-[-0.02em] text-bz-text">
              What people are saying about Bizak.
            </h2>
            <p className="mt-3 text-[15px] leading-[1.7] text-bz-text-muted">
              Press coverage, official releases, viral moments, and on-camera
              conversations — all in one chronological wall.
            </p>
          </div>

          {/* Filter pills */}
          <div className="-mx-6 overflow-x-auto px-6 md:mx-0 md:overflow-visible md:px-0">
            <div className="flex min-w-max flex-nowrap items-center gap-2 md:min-w-0 md:flex-wrap md:justify-end">
              {FILTERS.map((f) => {
                const Icon = f.icon;
                const isActive = filter === f.key;
                return (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => setFilter(f.key)}
                    aria-pressed={isActive}
                    className={[
                      "inline-flex shrink-0 items-center gap-2 rounded-bz-pill border px-3.5 py-2 text-[13px] font-semibold transition-colors",
                      isActive
                        ? "border-bz-deep bg-bz-deep text-white"
                        : "border-bz-border bg-bz-surface text-bz-text-muted hover:border-bz-sage-mid hover:bg-bz-sage-soft hover:text-bz-text",
                    ].join(" ")}
                  >
                    <Icon
                      className={[
                        "size-[14px]",
                        isActive ? "text-bz-accent" : "text-bz-text-soft",
                      ].join(" ")}
                      strokeWidth={1.8}
                    />
                    <span>{f.label}</span>
                    <span
                      className={[
                        "rounded-bz-pill px-1.5 text-[11px] font-bold tabular-nums",
                        isActive
                          ? "bg-white/15 text-white/75"
                          : "bg-bz-bg text-bz-text-soft",
                      ].join(" ")}
                    >
                      {counts[f.key]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Masonry feed */}
        <div className="mt-12 columns-1 gap-5 md:columns-2 lg:columns-3">
          {items.map((item, i) => (
            <FeedCard key={`${item.kind}-${i}`} item={item} />
          ))}
        </div>
      </Container>
    </Section>
  );
}

// ─── Press contact strip ─────────────────────────────────────────────────────

function PressContactSection() {
  return (
    <Section tone="light" pad="compact" id="press-contact">
      <Container width="narrow">
        <div className="relative overflow-hidden rounded-bz-2xl bg-bz-deep p-9 md:p-12">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 -top-24 h-[280px] w-[280px] rounded-full bg-bz-accent/10 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-20 -left-20 h-[220px] w-[220px] rounded-full bg-bz-sage/15 blur-3xl"
          />

          <div className="relative grid grid-cols-1 items-end gap-10 md:grid-cols-[1.1fr_1fr]">
            <div>
              <PillBadge tone="accent" dot>
                Press contact
              </PillBadge>
              <h2 className="mt-4 text-[clamp(24px,3vw,34px)] font-bold leading-[1.15] tracking-[-0.02em] text-white">
                Working on a story? We'll help.
              </h2>
              <p className="mt-3 max-w-[480px] text-[14.5px] leading-[1.7] text-white/65">
                Editorial inquiries, fact-checks, and analyst briefings —
                answered within one business day. Mark deadlines urgent and
                we'll move accordingly.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <a
                href="mailto:press@bizakerp.com"
                className="group flex items-center justify-between gap-4 rounded-bz-xl border border-white/10 bg-white/[0.04] px-5 py-4 transition-colors hover:border-bz-accent/40 hover:bg-white/[0.07]"
              >
                <div className="flex items-center gap-4">
                  <span className="inline-flex size-10 items-center justify-center rounded-bz-md bg-bz-accent/15 text-bz-accent">
                    <Mail className="size-[16px]" strokeWidth={1.8} />
                  </span>
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/55">
                      Editorial &amp; analyst
                    </div>
                    <div className="mt-0.5 text-[14px] font-semibold text-white">
                      press@bizakerp.com
                    </div>
                  </div>
                </div>
                <ArrowUpRight
                  className="size-[16px] text-white/55 transition-colors group-hover:text-bz-accent"
                  strokeWidth={2}
                />
              </a>

              <a
                href="#"
                className="group flex items-center justify-between gap-4 rounded-bz-xl border border-white/10 bg-white/[0.04] px-5 py-4 transition-colors hover:border-bz-accent/40 hover:bg-white/[0.07]"
              >
                <div className="flex items-center gap-4">
                  <span className="inline-flex size-10 items-center justify-center rounded-bz-md bg-white/10 text-white">
                    <Linkedin className="size-[16px]" strokeWidth={2} fill="currentColor" />
                  </span>
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/55">
                      Follow the newsroom
                    </div>
                    <div className="mt-0.5 text-[14px] font-semibold text-white">
                      @bizakerp on LinkedIn
                    </div>
                  </div>
                </div>
                <ArrowUpRight
                  className="size-[16px] text-white/55 transition-colors group-hover:text-bz-accent"
                  strokeWidth={2}
                />
              </a>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function PressAndMediaPage() {
  return (
    <div>
      <Header />
      <main style={{ paddingTop: 76 }}>
        <HeroSection />
        <FeedSection />
        <PressContactSection />
      </main>
      <Footer />
    </div>
  );
}
