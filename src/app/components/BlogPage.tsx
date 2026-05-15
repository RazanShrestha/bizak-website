import { useState } from "react";
import "../../styles/style.css";
import { ArrowRight, Search } from "lucide-react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { cn } from "./ui/utils";
import {
  Section,
  Container,
  Heading,
  Eyebrow,
  BentoGrid,
  Carousel,
  StatusChip,
  DotGrid,
} from "./bz";

// ─── Images ───────────────────────────────────────────────────────────────────
const IMG = {
  featuredBg:   "https://images.unsplash.com/photo-1758876202919-4d2fbedcf23d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBvZmZpY2UlMjBwcm9kdWN0aXZpdHklMjBhbmFseXRpY3N8ZW58MXx8fHwxNzcyMDg4NTU1fDA&ixlib=rb-4.1.0&q=80&w=1080",
  supplyBg:     "https://images.unsplash.com/photo-1768796372478-f3c46af523a9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdXBwbHklMjBjaGFpbiUyMGxvZ2lzdGljcyUyMG5ldHdvcmslMjBvcGVyYXRpb25zfGVufDF8fHx8MTc3MjA4OTA2N3ww&ixlib=rb-4.1.0&q=80&w=1080",
  financeBg:    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaW5hbmNpYWwlMjBkYXRhJTIwZGFzaGJvYXJkJTIwY2hhcnRzJTIwYW5hbHl0aWNzfGVufDF8fHx8MTc3MjA4OTA2OHww&ixlib=rb-4.1.0&q=80&w=1080",
  editorMain:   "https://images.unsplash.com/photo-1652422485224-102f6784c149?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhY2NvdW50aW5nJTIwc3ByZWFkc2hlZXQlMjBsYXB0b3AlMjBmaW5hbmNlJTIwZGVza3xlbnwxfHx8fDE3NzIwODg1NTd8MA&ixlib=rb-4.1.0&q=80&w=1080",
  thumb1:       "https://images.unsplash.com/photo-1758543102397-e14b5dfdd8bd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3YXJlaG91c2UlMjBpbnZlbnRvcnklMjBtYW5hZ2VtZW50JTIwdGVjaG5vbG9neXxlbnwxfHx8fDE3NzIwMzk5MDh8MA&ixlib=rb-4.1.0&q=80&w=400",
  thumb2:       "https://images.unsplash.com/photo-1659353221237-6a1cfb73fd90?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxDRU8lMjBidXNpbmVzcyUyMGxlYWRlciUyMHBvcnRyYWl0JTIwcHJvZmVzc2lvbmFsfGVufDF8fHx8MTc3MjA4ODU1OHww&ixlib=rb-4.1.0&q=80&w=400",
  thumb3:       "https://images.unsplash.com/photo-1764690690771-b4522d66b433?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbnRlcnByaXNlJTIwYnVzaW5lc3MlMjBvcGVyYXRpb25zJTIwdGVhbSUyMG1lZXRpbmd8ZW58MXx8fHwxNzcyMDg4NTU3fDA&ixlib=rb-4.1.0&q=80&w=400",
  authorAvatar: "https://images.unsplash.com/photo-1659353221237-6a1cfb73fd90?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxDRU8lMjBidXNpbmVzcyUyMGxlYWRlciUyMHBvcnRyYWl0JTIwcHJvZmVzc2lvbmFsfGVufDF8fHx8MTc3MjA4ODU1OHww&ixlib=rb-4.1.0&q=80&w=200",
  card1:        "https://images.unsplash.com/photo-1758876202919-4d2fbedcf23d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBvZmZpY2UlMjBwcm9kdWN0aXZpdHklMjBhbmFseXRpY3N8ZW58MXx8fHwxNzcyMDg4NTU1fDA&ixlib=rb-4.1.0&q=80&w=800",
  card2:        "https://images.unsplash.com/photo-1758543102397-e14b5dfdd8bd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3YXJlaG91c2UlMjBpbnZlbnRvcnklMjBtYW5hZ2VtZW50JTIwdGVjaG5vbG9neXxlbnwxfHx8fDE3NzIwMzk5MDh8MA&ixlib=rb-4.1.0&q=80&w=800",
  card3:        "https://images.unsplash.com/photo-1700394474173-6428c2ea061c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnbG9iYWwlMjBmaW5hbmNlJTIwYmlsbGluZyUyMGRpZ2l0YWwlMjBjdXJyZW5jeXxlbnwxfHx8fDE3NzIwODg1NTZ8MA&ixlib=rb-4.1.0&q=80&w=800",
  card4:        "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjeWJlcnNlY3VyaXR5JTIwZGF0YSUyMHByb3RlY3Rpb24lMjBzaGllbGR8ZW58MXx8fHwxNzcyMDgxOTU2fDA&ixlib=rb-4.1.0&q=80&w=800",
  card5:        "https://images.unsplash.com/photo-1737505599159-5ffc1dcbc08f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnRpZmljaWFsJTIwaW50ZWxsaWdlbmNlJTIwbmV1cmFsJTIwbmV0d29yayUyMGFic3RyYWN0fGVufDF8fHx8MTc3MjA2MDg4OXww&ixlib=rb-4.1.0&q=80&w=800",
  card6:        "https://images.unsplash.com/photo-1764690690771-b4522d66b433?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbnRlcnByaXNlJTIwYnVzaW5lc3MlMjBvcGVyYXRpb25zJTIwdGVhbSUyMG1lZXRpbmd8ZW58MXx8fHwxNzcyMDg4NTU3fDA&ixlib=rb-4.1.0&q=80&w=800",
};

// ─── HERO carousel slides ─────────────────────────────────────────────────────
const HERO_SLIDES = [
  {
    bgImg: IMG.featuredBg,
    stats: [
      { num: "One",      label: "Source of Truth"  },
      { num: "Faster",   label: "Monthly Close"    },
      { num: "Less",     label: "Manual Entry"     },
    ],
    tag: "Article",
    readTime: "5 min read",
    title: "Why Growing Companies Must Replace Spreadsheets with ERP",
    authorName: "Lucia Kim",
    authorRole: "Senior Product Marketing Manager",
    authorImg: IMG.authorAvatar,
  },
  {
    bgImg: IMG.supplyBg,
    stats: [
      { num: "On-time",   label: "Delivery Tracking" },
      { num: "Live",      label: "Stock Visibility"  },
      { num: "Connected", label: "Carrier Workflow"  },
    ],
    tag: "Supply Chain",
    readTime: "7 min read",
    title: "Building a Resilient Supply Chain with Real-Time ERP Visibility",
    authorName: "Marcus Webb",
    authorRole: "Head of Logistics Solutions",
    authorImg: IMG.thumb1,
  },
  {
    bgImg: IMG.financeBg,
    stats: [
      { num: "Real-time", label: "Cash Visibility"    },
      { num: "Lower",     label: "Cost to Close"      },
      { num: "Unified",   label: "Finance Workspace"  },
    ],
    tag: "Financial Management",
    readTime: "6 min read",
    title: "From Reactive to Predictive: The Future of Enterprise Finance",
    authorName: "Priya Sharma",
    authorRole: "VP of Finance Technology",
    authorImg: IMG.thumb2,
  },
];

type HeroSlide = (typeof HERO_SLIDES)[number];

// ─── Featured slide the carousel's per-item visual ──────────────────────────
function FeaturedSlide({ slide }: { slide: HeroSlide }) {
  return (
    <div className="flex flex-col overflow-hidden rounded-bz-2xl border border-white/[0.08] bg-bz-olive-soft lg:flex-row">
      {/* Stats panel */}
      <div className="relative flex min-h-[220px] flex-1 items-center justify-center overflow-hidden bg-bz-olive-dark p-10 md:p-12">
        <ImageWithFallback
          src={slide.bgImg}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-[0.14]"
        />
        <div className="relative grid w-full grid-cols-3 text-center">
          {slide.stats.map((stat, idx) => (
            <div
              key={stat.label}
              className={idx === 1 ? "border-x border-white/[0.1] px-3" : "px-2"}
            >
              <div className="text-[clamp(2rem,5vw,3.25rem)] font-semibold leading-none tracking-[-0.04em] text-bz-text-on-dark">
                {stat.num}
              </div>
              <div className="mt-2 text-[9px] font-semibold uppercase tracking-[0.12em] text-white/55">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Article info */}
      <div className="flex flex-1 flex-col justify-center gap-5 p-8 md:p-12">
        <div className="flex items-center gap-3">
          <StatusChip variant="neutral">{slide.tag}</StatusChip>
          <span className="text-[11px] font-medium uppercase tracking-[0.1em] text-white/45">
            {slide.readTime}
          </span>
        </div>
        <Heading level={3} tone="dark">
          {slide.title}
        </Heading>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="size-11 shrink-0 overflow-hidden rounded-bz-pill bg-white/10">
              <ImageWithFallback
                src={slide.authorImg}
                alt={slide.authorName}
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <div className="text-[13px] font-semibold text-bz-text-on-dark">
                {slide.authorName}
              </div>
              <div className="mt-0.5 text-[11px] text-white/45">{slide.authorRole}</div>
            </div>
          </div>
          <a
            href="#"
            className="group inline-flex items-center gap-1.5 text-[13px] font-semibold text-bz-fire"
          >
            Read Article
            <ArrowRight
              size={14}
              strokeWidth={2.5}
              className="transition-transform group-hover:translate-x-1"
            />
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── HERO ─────────────────────────────────────────────────────────────────────
function HeroSection() {
  return (
    <Section tone="dark" pad="hero">
      <Container>
        <div className="flex flex-col gap-7 sm:flex-row sm:items-end sm:justify-between">
          <Heading level={1} tone="dark">
            The Bizak Blog
          </Heading>
          <div className="relative w-full shrink-0 sm:w-[320px]">
            <Search
              size={18}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/35"
            />
            <input
              type="text"
              placeholder="Search articles…"
              className="w-full rounded-bz-md border border-white/10 bg-white/[0.06] py-3 pl-11 pr-4 text-[14px] text-bz-text-on-dark outline-none transition-colors placeholder:text-white/30 focus:border-bz-fire"
            />
          </div>
        </div>

        <div className="mt-12 md:mt-14">
          <Carousel
            tone="dark"
            items={HERO_SLIDES}
            autoAdvance={5000}
            render={(slide) => <FeaturedSlide slide={slide} />}
          />
        </div>
      </Container>
    </Section>
  );
}

// ─── EDITOR'S PICKS ───────────────────────────────────────────────────────────
const SIDE_PICKS = [
  {
    img: IMG.thumb1,
    cat: "Article",
    title: "Ditch the spreadsheet. Track your budgets in Bizak.",
    desc: "Meet Bizak Budgets, a real-time budget tracking solution that monitors all your spend.",
  },
  {
    img: IMG.thumb2,
    cat: "Article",
    title: "Money talks. Now it thinks.",
    desc: "Our CEO on the Age of \"Thinking Money\" and why getting bigger no longer means getting slower.",
  },
  {
    img: IMG.thumb3,
    cat: "Customer Story",
    title: "How a growing distributor hit its free cash flow goals",
    desc: "Learn how one Bizak customer reached its free cash flow goals in seven months instead of 12.",
  },
];

function EditorPicksSection() {
  return (
    <Section tone="a">
      <Container>
        <Heading level={2}>Editor's Picks</Heading>

        <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[2fr_1fr] lg:gap-12">
          {/* Main large article */}
          <a href="#" className="group block">
            <div className="mb-6 aspect-[21/9] overflow-hidden rounded-bz-lg bg-bz-section-b">
              <ImageWithFallback
                src={IMG.editorMain}
                alt="The end of manual accounting"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
            <Eyebrow>Article</Eyebrow>
            <h3 className="mt-3 text-[clamp(1.4rem,2.4vw,1.8rem)] font-semibold leading-[1.2] tracking-[-0.02em] text-bz-text">
              The end of manual accounting
            </h3>
            <p className="mt-3 max-w-[560px] text-[16px] leading-[1.7] text-bz-text-muted">
              Starting today, the race to close is no longer a chase. Meet Bizak's Accounting
              Agent built to code and review every dollar of spend.
            </p>
          </a>

          {/* Side list */}
          <div className="flex flex-col gap-8">
            {SIDE_PICKS.map((p) => (
              <a href="#" key={p.title} className="group flex gap-4">
                <div className="size-[120px] shrink-0 overflow-hidden rounded-bz-md bg-bz-section-b">
                  <ImageWithFallback
                    src={p.img}
                    alt={p.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <div>
                  <Eyebrow>{p.cat}</Eyebrow>
                  <div className="mt-1.5 text-[14px] font-semibold leading-[1.4] text-bz-text transition-colors group-hover:text-bz-text-muted">
                    {p.title}
                  </div>
                  <p className="mt-1 line-clamp-2 text-[12px] leading-[1.5] text-bz-text-muted">
                    {p.desc}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}

// ─── INSIGHTS filter tabs + article grid ────────────────────────────────────
const TABS = [
  "All Insights",
  "ERP Fundamentals",
  "Financial Management",
  "Automation & AI",
  "Supply Chain",
  "Compliance",
];

const ARTICLES = [
  {
    img: IMG.card1,
    cat: "Implementation",
    readTime: "6 min read",
    title: "When Is the Right Time to Implement ERP?",
    desc: "Identifying the critical signals that indicate your manual processes are starting to throttle your growth potential.",
    tab: "ERP Fundamentals",
  },
  {
    img: IMG.card2,
    cat: "Operations",
    readTime: "8 min read",
    title: "Inventory Management Best Practices",
    desc: "How multi-warehouse tracking and automated restocking cycles can optimize your capital allocation.",
    tab: "Supply Chain",
  },
  {
    img: IMG.card3,
    cat: "Finance",
    readTime: "4 min read",
    title: "Streamlining E-Billing Compliance",
    desc: "Navigating the complexities of regional tax laws with automated localized invoicing systems.",
    tab: "Financial Management",
  },
  {
    img: IMG.card4,
    cat: "Security",
    readTime: "7 min read",
    title: "SOC-2 Compliance for the Modern ERP",
    desc: "Understanding the data privacy standards that protect your enterprise assets in a cloud-first world.",
    tab: "Compliance",
  },
  {
    img: IMG.card5,
    cat: "AI & Logic",
    readTime: "10 min read",
    title: "Leveraging AI for Predictive Procurement",
    desc: "How machine learning models anticipate demand spikes and automate vendor RFQ generation.",
    tab: "Automation & AI",
  },
  {
    img: IMG.card6,
    cat: "Scaling",
    readTime: "5 min read",
    title: "The Future of Unified Business Units",
    desc: "Moving away from siloed departments toward a single source of truth for multi-branch operations.",
    tab: "ERP Fundamentals",
  },
];

type Article = (typeof ARTICLES)[number];

function ArticleCard({ article }: { article: Article }) {
  return (
    <article className="bz-hover-card group flex flex-col overflow-hidden rounded-bz-xl border border-bz-line-soft bg-bz-surface">
      <div className="h-[200px] overflow-hidden bg-bz-section-b">
        <ImageWithFallback
          src={article.img}
          alt={article.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col p-6 md:p-7">
        <div className="mb-3 flex items-center gap-2.5">
          <StatusChip variant="posted">{article.cat}</StatusChip>
          <span className="text-[12px] text-bz-text-muted">{article.readTime}</span>
        </div>
        <h3 className="text-[17px] font-semibold leading-[1.35] tracking-[-0.02em] text-bz-text">
          {article.title}
        </h3>
        <p className="mb-6 mt-3 flex-1 text-[13.5px] leading-[1.65] text-bz-text-muted">
          {article.desc}
        </p>
        <a
          href="#"
          className="group/link inline-flex items-center gap-1.5 text-[13px] font-semibold text-bz-text"
        >
          Read Story
          <ArrowRight
            size={14}
            strokeWidth={2.5}
            className="transition-transform group-hover/link:translate-x-1"
          />
        </a>
      </div>
    </article>
  );
}

function InsightsSection() {
  const [activeTab, setActiveTab] = useState("All Insights");
  const filtered =
    activeTab === "All Insights"
      ? ARTICLES
      : ARTICLES.filter((a) => a.tab === activeTab);

  return (
    <Section tone="b">
      <Container>
        {/* Filter tabs */}
        <div className="flex flex-wrap items-center justify-center border-b border-bz-line-soft">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={cn(
                "-mb-px whitespace-nowrap border-b-2 px-6 py-4 text-[13px] transition-colors",
                activeTab === t
                  ? "border-bz-fire font-semibold text-bz-text"
                  : "border-transparent font-medium text-bz-text-muted hover:text-bz-text",
              )}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Article grid */}
        {filtered.length > 0 ? (
          <BentoGrid cols={3} gap={28} className="mt-12">
            {filtered.map((article) => (
              <ArticleCard key={article.title} article={article} />
            ))}
          </BentoGrid>
        ) : (
          <p className="py-16 text-center text-[15px] text-bz-text-muted">
            No articles in this category yet. Check back soon.
          </p>
        )}
      </Container>
    </Section>
  );
}

// ─── PHILOSOPHY ───────────────────────────────────────────────────────────────
function PhilosophySection() {
  return (
    <Section tone="a">
      <Container width="narrow">
        <div className="mx-auto max-w-[800px] text-center">
          <Eyebrow>Our Philosophy</Eyebrow>
          <Heading level={2} className="mt-4">
            Stronger Operational Foundations
          </Heading>
          <p className="mx-auto mt-7 max-w-[760px] text-[clamp(1rem,1.5vw,1.2rem)] italic leading-[1.8] text-bz-text-muted">
            "We believe that information is only as valuable as the action it enables. Our
            insights are designed to bridge the gap between abstract strategy and concrete
            execution, providing leaders with the technical clarity required to build
            resilient, high-growth organizations."
          </p>
          <div className="mx-auto mt-10 h-1 w-14 rounded-bz-pill bg-bz-fire" />
        </div>
      </Container>
    </Section>
  );
}

// ─── NEWSLETTER ───────────────────────────────────────────────────────────────
function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setSubmitted(true);
  };

  return (
    <Section tone="dark" pad="tight">
      <DotGrid tone="dark" />
      <Container className="relative text-center">
        <Heading
          level={2}
          tone="dark"
          className="max-w-[640px]"
          style={{ marginInline: "auto" }}
        >
          Get ERP insights{" "}
          <Heading.Muted>
            delivered to your inbox
          </Heading.Muted>
        </Heading>
        <p className="mx-auto mt-4 max-w-[480px] text-[15px] leading-[1.7] text-white/55">
          Join operations leaders receiving our bi-weekly breakdown of scaling
          strategies and technical innovations.
        </p>

        {submitted ? (
          <p className="mt-9 text-[16px] font-semibold tracking-[0.02em] text-bz-fire">
            ✓ You're subscribed thanks for joining!
          </p>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mx-auto mt-9 flex max-w-[480px] flex-col gap-3 sm:flex-row"
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your work email"
              className="w-full flex-1 rounded-bz-md border border-white/10 bg-white/[0.06] px-5 py-3.5 text-[14px] text-bz-text-on-dark outline-none transition-colors placeholder:text-white/30 focus:border-bz-fire"
            />
            <button
              type="submit"
              className="shrink-0 rounded-bz-md bg-bz-fire px-7 py-3.5 text-[14px] font-semibold text-bz-deep transition-opacity hover:opacity-90"
            >
              Subscribe
            </button>
          </form>
        )}

        <p className="mt-5 text-[9px] font-semibold uppercase tracking-[0.1em] text-white/20">
          Zero spam. Pure intelligence. Unsubscribe anytime.
        </p>
      </Container>
    </Section>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export function BlogPage() {
  return (
    <div className="bz-page">
      <Header />
      <main>
        <HeroSection />
        <EditorPicksSection />
        <InsightsSection />
        <NewsletterSection />
      </main>
      <Footer hideCta />
    </div>
  );
}
