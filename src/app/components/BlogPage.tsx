import { useState, useEffect, useCallback } from "react";
// import "./blog-page.css";
import "../../styles/style.css"
import { Header } from "./Header";
import { Footer } from "./Footer";
import { ImageWithFallback } from "./figma/ImageWithFallback";

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

// ─── Carousel slides data ─────────────────────────────────────────────────────
const HERO_SLIDES = [
  {
    bgImg: IMG.featuredBg,
    bgTint: "#E6E8EA",
    stats: [
      { num: "200k", label: "Transactions Reviewed" },
      { num: "5x",   label: "Faster Close"          },
      { num: "40+",  label: "Hrs Saved / Week"      },
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
    bgTint: "#1e2620",
    stats: [
      { num: "98%",  label: "On-time Delivery"    },
      { num: "3x",   label: "Inventory Turnover"  },
      { num: "60+",  label: "Carrier Integrations"},
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
    bgTint: "#1c1e2a",
    stats: [
      { num: "$32B", label: "Transactions Processed" },
      { num: "12%",  label: "Cost Reduction"         },
      { num: "150+", label: "Finance Teams"           },
    ],
    tag: "Financial Management",
    readTime: "6 min read",
    title: "From Reactive to Predictive: The Future of Enterprise Finance",
    authorName: "Priya Sharma",
    authorRole: "VP of Finance Technology",
    authorImg: IMG.thumb2,
  },
];

// ─── Arrow icon ───────────────────────────────────────────────────────────────
function ArrowRight({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

// ─── HERO SECTION (Carousel) ──────────────────────────────────────────────────
function HeroSection() {
  const [current, setCurrent] = useState(0);
  const total = HERO_SLIDES.length;

  const goTo = useCallback((idx: number) => {
    setCurrent((idx + total) % total);
  }, [total]);

  // Auto-advance every 5 s, pause on hover
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => goTo(current + 1), 5000);
    return () => clearInterval(id);
  }, [current, paused, goTo]);

  return (
    <section className="blog-hero">
      <div className="blog-container">
        {/* Title + search */}
        <div className="blog-hero-top">
          <h1 className="blog-hero-title">The Bizak Blog</h1>
          <div className="blog-search-wrap">
            <span className="blog-search-icon"><SearchIcon /></span>
            <input className="blog-search-input" type="text" placeholder="Search articles…" />
          </div>
        </div>

        {/* Carousel */}
        <div
          className="blog-carousel-wrap"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {/* Track */}
          <div
            className="blog-carousel-track"
            style={{ transform: `translateX(-${current * 100}%)` }}
          >
            {HERO_SLIDES.map((slide, i) => (
              <div className="blog-carousel-slide" key={i}>
                {/* Left: stats panel */}
                <div className="blog-featured-left" style={{ background: slide.bgTint }}>
                  <ImageWithFallback
                    src={slide.bgImg}
                    alt="Slide background"
                    style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.12 }}
                  />
                  <div className="blog-featured-stats">
                    <div>
                      <div className="blog-stat-num" style={{ color: slide.bgTint === "#E6E8EA" ? "#1A1D19" : "#fff" }}>
                        {slide.stats[0].num}
                      </div>
                      <div className="blog-stat-label" style={{ color: slide.bgTint === "#E6E8EA" ? "#666" : "rgba(255,255,255,0.55)" }}>
                        {slide.stats[0].label}
                      </div>
                    </div>
                    <div
                      className="blog-stat-divider"
                      style={{ borderColor: slide.bgTint === "#E6E8EA" ? "rgba(26,29,25,0.12)" : "rgba(255,255,255,0.12)" }}
                    >
                      <div className="blog-stat-num" style={{ color: slide.bgTint === "#E6E8EA" ? "#1A1D19" : "#fff" }}>
                        {slide.stats[1].num}
                      </div>
                      <div className="blog-stat-label" style={{ color: slide.bgTint === "#E6E8EA" ? "#666" : "rgba(255,255,255,0.55)" }}>
                        {slide.stats[1].label}
                      </div>
                    </div>
                    <div>
                      <div className="blog-stat-num" style={{ color: slide.bgTint === "#E6E8EA" ? "#1A1D19" : "#fff" }}>
                        {slide.stats[2].num}
                      </div>
                      <div className="blog-stat-label" style={{ color: slide.bgTint === "#E6E8EA" ? "#666" : "rgba(255,255,255,0.55)" }}>
                        {slide.stats[2].label}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: article info */}
                <div className="blog-featured-right">
                  <div className="blog-featured-meta">
                    <span>{slide.tag}</span>
                    <span style={{ width: 4, height: 4, borderRadius: "50%", background: "rgba(255,255,255,0.28)", display: "inline-block" }} />
                    <span>{slide.readTime}</span>
                  </div>
                  <h2 className="blog-featured-title">{slide.title}</h2>
                  <div className="blog-featured-footer">
                    <div className="blog-author-row">
                      <div className="blog-author-avatar">
                        <ImageWithFallback src={slide.authorImg} alt={slide.authorName} />
                      </div>
                      <div>
                        <div className="blog-author-name">{slide.authorName}</div>
                        <div className="blog-author-role">{slide.authorRole}</div>
                      </div>
                    </div>
                    <a href="#" className="blog-read-link">
                      Read Article <span className="blog-arrow"><ArrowRight size={14} /></span>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Prev / Next arrows */}
          <button
            className="blog-carousel-arrow prev"
            onClick={() => goTo(current - 1)}
            aria-label="Previous slide"
          >
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            className="blog-carousel-arrow next"
            onClick={() => goTo(current + 1)}
            aria-label="Next slide"
          >
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        {/* Dot indicators */}
        <div className="blog-carousel-dots">
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              className={`blog-carousel-dot${i === current ? " active" : ""}`}
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
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
    title: "Bizak at $32 billion: Money talks. Now it thinks.",
    desc: "Our CEO on the Age of \"Thinking Money\" and why getting big no longer means getting slow.",
  },
  {
    img: IMG.thumb3,
    cat: "Customer Story",
    title: "How Poshmark exceeded their free cash flow goals",
    desc: "Learn how Poshmark achieved its free cash flow goals in seven months instead of 12.",
  },
];

function EditorPicksSection() {
  return (
    <section className="blog-picks-section">
      <div className="blog-container">
        <h2 className="blog-section-title">Editor's Picks</h2>
        <div className="blog-picks-grid">
          {/* Main large article */}
          <div className="blog-picks-main" style={{ cursor: "pointer" }}>
            <div className="blog-picks-main-img">
              <ImageWithFallback src={IMG.editorMain} alt="The end of manual accounting" />
            </div>
            <div className="blog-picks-cat">Article</div>
            <h3 className="blog-picks-main-title">The end of manual accounting</h3>
            <p className="blog-picks-main-desc">
              Starting today, the race to close is no longer a chase. Meet Bizak's Accounting
              Agent built to code and review every dollar of spend.
            </p>
          </div>

          {/* Side list */}
          <div className="blog-picks-side">
            {SIDE_PICKS.map((p) => (
              <a href="#" key={p.title} className="blog-side-item">
                <div className="blog-side-thumb">
                  <ImageWithFallback src={p.img} alt={p.title} />
                </div>
                <div>
                  <div className="blog-side-cat">{p.cat}</div>
                  <div className="blog-side-title">{p.title}</div>
                  <div className="blog-side-desc">{p.desc}</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── FILTER TABS ──────────────────────────────────────────────────────────────
const TABS = [
  "All Insights",
  "ERP Fundamentals",
  "Financial Management",
  "Automation & AI",
  "Supply Chain",
  "Compliance",
];

function FilterTabs({ active, onSelect }: { active: string; onSelect: (t: string) => void }) {
  return (
    <div className="blog-tabs-section">
      <div className="blog-tabs">
        {TABS.map((t) => (
          <button
            key={t}
            className={`blog-tab${active === t ? " active" : ""}`}
            onClick={() => onSelect(t)}
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── ARTICLE GRID ─────────────────────────────────────────────────────────────
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
    title: "Streamlining Global E-Billing Compliance",
    desc: "Navigating the complexities of international tax laws with automated localized invoicing systems.",
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
    desc: "Moving away from siloed departments toward a single source of truth for global operations.",
    tab: "ERP Fundamentals",
  },
];

function ArticleGrid({ activeTab }: { activeTab: string }) {
  const filtered = activeTab === "All Insights"
    ? ARTICLES
    : ARTICLES.filter((a) => a.tab === activeTab);

  return (
    <div className="blog-grid-section">
      <div className="blog-grid">
        {filtered.map((article) => (
          <div className="blog-card" key={article.title}>
            <div className="blog-card-img">
              <ImageWithFallback src={article.img} alt={article.title} />
              <div className="blog-card-img-overlay" />
              <div className="blog-card-img-label">
                <span className="blog-card-cat-badge">{article.cat}</span>
                <span style={{ color: "rgba(255,255,255,0.55)", fontSize: 9 }}>•</span>
                <span className="blog-card-read-time">{article.readTime}</span>
              </div>
            </div>
            <div className="blog-card-body">
              <h3 className="blog-card-title">{article.title}</h3>
              <p className="blog-card-desc">{article.desc}</p>
              <a href="#" className="blog-card-link">
                Read Story <ArrowRight size={14} />
              </a>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "60px 0", color: "#666", fontSize: 15 }}>
            No articles in this category yet. Check back soon.
          </div>
        )}
      </div>
    </div>
  );
}

// ─── PHILOSOPHY ───────────────────────────────────────────────────────────────
function PhilosophySection() {
  return (
    <section className="blog-philosophy">
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <span className="blog-philosophy-label">Our Philosophy</span>
        <h2 className="blog-philosophy-title">Stronger Operational Foundations</h2>
        <p className="blog-philosophy-quote">
          "We believe that information is only as valuable as the action it enables. Our
          insights are designed to bridge the gap between abstract strategy and concrete
          execution, providing leaders with the technical clarity required to build
          resilient, high-growth organizations."
        </p>
        <div className="blog-philosophy-divider" />
      </div>
    </section>
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
    <section className="blog-newsletter">
      <div className="blog-newsletter-grid-bg" />
      <div className="blog-newsletter-glow" />
      <div style={{ position: "relative", zIndex: 10 }}>
        <h2 className="blog-newsletter-title">Get ERP insights delivered to your inbox</h2>
        <p className="blog-newsletter-sub">
          Join 5,000+ operations leaders receiving our bi-weekly breakdown of scaling
          strategies and technical innovations.
        </p>
        {submitted ? (
          <div style={{ color: "#C7FF35", fontWeight: 700, fontSize: 16, letterSpacing: "0.02em" }}>
            ✓ You're subscribed thanks for joining!
          </div>
        ) : (
          <form className="blog-newsletter-form" onSubmit={handleSubmit}>
            <input
              className="blog-newsletter-input"
              type="email"
              placeholder="Enter your work email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" className="blog-newsletter-btn">Subscribe</button>
          </form>
        )}
        <p className="blog-newsletter-fine">Zero spam. Pure intelligence. Unsubscribe anytime.</p>
      </div>
    </section>
  );
}

// ─── BOTTOM CTA ───────────────────────────────────────────────────────────────

function BottomCTASection() {
  return (
    <section className="blog-bottom-cta">
      <div className="blog-bottom-cta-inner">
        <h2 className="blog-bottom-cta-title">
          Build your business on a stronger operational system.
        </h2>
        <div className="blog-cta-btns">
          <button className="blog-cta-btn-primary">Start Free Trial</button>
          <button className="blog-cta-btn-ghost">Book a Demo</button>
        </div>
      </div>
    </section>
  );
}



// ─── PAGE ───────────────────────────���─────────────────────────────────────────
export function BlogPage() {
  const [activeTab, setActiveTab] = useState("All Insights");

  return (
    <div className="blog-page">
      <Header />
      <main style={{ paddingTop: 76 }}>
        <HeroSection />
        <EditorPicksSection />
        <FilterTabs active={activeTab} onSelect={setActiveTab} />
        <ArticleGrid activeTab={activeTab} />
        <PhilosophySection />
        <NewsletterSection />
    
      </main>
      <Footer />
    </div>
  );
}