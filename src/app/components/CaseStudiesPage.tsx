import { useState } from "react";
import "../../styles/style.css";
import { Header } from "./Header";
import { Footer } from "./Footer";

// ─── IMAGES ───────────────────────────────────────────────────────────────────
const IMG_HERO_MAIN    = "https://images.unsplash.com/photo-1759092912815-cb0ee4a8a365?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbnRlcnByaXNlJTIwYnVzaW5lc3MlMjBvcGVyYXRpb25zJTIwZ2xvYmFsJTIwaGVhZHF1YXJ0ZXJzfGVufDF8fHx8MTc3MjEwOTAyNnww&ixlib=rb-4.1.0&q=80&w=1080";
const IMG_FINTECH      = "https://images.unsplash.com/photo-1733826544831-ad71d05c8423?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaW50ZWNoJTIwc3RhcnR1cCUyMHRlYW0lMjBvZmZpY2UlMjB0ZWNobm9sb2d5fGVufDF8fHx8MTc3MjEwOTAyNnww&ixlib=rb-4.1.0&q=80&w=1080";
const IMG_LOGISTICS    = "https://images.unsplash.com/photo-1769752803940-0acb89683123?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnbG9iYWwlMjBzdXBwbHklMjBjaGFpbiUyMGxvZ2lzdGljcyUyMHdhcmVob3VzZXxlbnwxfHx8fDE3NzIxMDkwMjZ8MA&ixlib=rb-4.1.0&q=80&w=1080";
const IMG_RETAIL       = "https://images.unsplash.com/photo-1629828367134-690cd8bde95c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXRhaWwlMjBjb21tZXJjZSUyMHNob3BwaW5nJTIwZWNvbW1lcmNlJTIwZmFzaGlvbnxlbnwxfHx8fDE3NzIxMDkwMjl8MA&ixlib=rb-4.1.0&q=80&w=1080";
const IMG_MANUFACTURING = "https://images.unsplash.com/photo-1768796370672-3931e5d1ded7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYW51ZmFjdHVyaW5nJTIwcHJlY2lzaW9uJTIwZW5naW5lZXJpbmclMjBmYWN0b3J5fGVufDF8fHx8MTc3MjEwOTAyOXww&ixlib=rb-4.1.0&q=80&w=1080";
const IMG_ANALYTICS    = "https://images.unsplash.com/photo-1551288049-bebda4e38f71?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3Jwb3JhdGUlMjBmaW5hbmNlJTIwdGVhbSUyMGRhdGElMjBhbmFseXRpY3MlMjBkYXNoYm9hcmR8ZW58MXx8fHwxNzcyMTA5MDMwfDA&ixlib=rb-4.1.0&q=80&w=1080";

// ─── DATA ─────────────────────────────────────────────────────────────────────
const FILTERS = ["All Industries", "Manufacturing", "Retail & Commerce", "Professional Services", "Logistics", "Technology"];

const ALL_STORIES = [
  {
    industry: "Fintech",
    title: "How global procurement assets are managed for $500M+ portfolios.",
    excerpt: "Automating the entire approval chain with custom-tailored ERP workflows built for the modern era.",
    img: IMG_ANALYTICS,
  },
  {
    industry: "Retail",
    title: "Traceability and transparency across a complex retail supply chain.",
    excerpt: "Providing granular visibility needed for ethical manufacturing and real-time inventory tracking.",
    img: IMG_RETAIL,
  },
  {
    industry: "Manufacturing",
    title: "Precision inventory management for mission-critical engineering.",
    excerpt: "Delivering real-time edge sync across distributed facilities with zero-latency processing.",
    img: IMG_MANUFACTURING,
  },
  {
    industry: "Logistics",
    title: "Zero-downtime migration for a 3PL serving 18 global distribution centers.",
    excerpt: "Full ERP cutover across multiple continents executed during off-peak windows with no service disruption.",
    img: IMG_LOGISTICS,
  },
  {
    industry: "Technology",
    title: "How a SaaS scale-up unified finance, HR, and ops on a single platform.",
    excerpt: "Eliminating 14 point solutions in favor of one ERP backbone that grew with their headcount.",
    img: IMG_FINTECH,
  },
  {
    industry: "Professional Services",
    title: "Real-time project profitability tracking across 200+ concurrent engagements.",
    excerpt: "Partners now close every month armed with live margin data instead of lagging reports.",
    img: IMG_HERO_MAIN,
  },
];

const FILTER_MAP: Record<string, string[]> = {
  "All Industries":       ALL_STORIES.map((s) => s.industry),
  "Manufacturing":        ["Manufacturing"],
  "Retail & Commerce":    ["Retail"],
  "Professional Services":["Professional Services"],
  "Logistics":            ["Logistics"],
  "Technology":           ["Technology", "Fintech"],
};

const PAGE_SIZE = 3;

// ─── HERO ─────────────────────────────────────────────────────────────────────
function HeroSection() {
  return (
    <section className="cst-hero">
      <div className="cst-inner">
        <div className="cst-hero-grid">
          {/* Main card */}
          <div className="cst-hero-main">
            <img src={IMG_HERO_MAIN} alt="Enterprise success" />
            <div className="cst-hero-main-overlay" />
            <div className="cst-hero-main-content">
              <span className="cst-hero-tag">Enterprise Case Study</span>
              <h2 className="cst-hero-main-title">
                How Fortune 500 leaders use Bizak for hyper-scale agility.
              </h2>
              <p className="cst-hero-main-sub">
                Complete digital transformation across 40 global entities in record time,
                setting new benchmarks for operational velocity.
              </p>
              <button className="cst-btn-white">Read Full Story</button>
            </div>
          </div>

          {/* Side column */}
          <div className="cst-hero-side">
            {/* Fintech card */}
            <div className="cst-hero-card-dark">
              <img src={IMG_FINTECH} alt="Financial tech" />
              <div className="cst-hero-card-dark-overlay" />
              <div className="cst-hero-card-dark-content">
                <span className="cst-hero-card-dark-label">Fintech Leadership</span>
                <h3 className="cst-hero-card-dark-title">
                  Accelerating seed-to-IPO financial reporting.
                </h3>
                <a href="#" className="cst-hero-card-link">
                  View Case Study
                  <span className="material-symbols-outlined arrow">arrow_forward</span>
                </a>
              </div>
            </div>

            {/* Testimonial card */}
            <div className="cst-hero-card-testimonial">
              <div>
                <div className="cst-testimonial-label">Supply Chain Testimonial</div>
                <p className="cst-testimonial-quote">
                  "Bizak gave us a 360-degree view of our global supply chain we never
                  thought possible in this industry."
                </p>
              </div>
              <div className="cst-testimonial-author">
                <div className="cst-testimonial-avatar">
                  <span className="material-symbols-outlined" style={{ color: "#fff" }}>person</span>
                </div>
                <div>
                  <div className="cst-testimonial-name">Elena Rodriguez</div>
                  <div className="cst-testimonial-role">Head of Logistics, Aerovant</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── FEATURED SPOTLIGHT ───────────────────────────────────────────────────────
function FeaturedSpotlight() {
  return (
    <section className="cst-spotlight">
      <div className="cst-inner">
        <div className="cst-spotlight-label">Featured Spotlight</div>
        <div className="cst-spotlight-card">
          {/* Left content */}
          <div className="cst-spotlight-content">
            <div>
              <img
                src={IMG_ANALYTICS}
                alt="Client logo"
                className="cst-spotlight-logo"
              />
              <h3 className="cst-spotlight-title">
                Reducing monthly closing time by 14 days for a global workforce.
              </h3>
              <div className="cst-spotlight-stats">
                <div className="cst-stat">
                  <div className="cst-stat-number">82%</div>
                  <div className="cst-stat-label">Efficiency Gain</div>
                </div>
                <div className="cst-stat">
                  <div className="cst-stat-number">-$4.2M</div>
                  <div className="cst-stat-label">Annual Savings</div>
                </div>
              </div>
            </div>
            <a href="#" className="cst-spotlight-link">
              Read the full case study
              <span className="material-symbols-outlined arrow">arrow_forward</span>
            </a>
          </div>

          {/* Right image */}
          <div className="cst-spotlight-image">
            <img src={IMG_LOGISTICS} alt="Operational excellence" />
            <div className="cst-spotlight-image-overlay" />
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── ALL STORIES ──────────────────────────────────────────────────────────────
function AllStories() {
  const [activeFilter, setActiveFilter] = useState("All Industries");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const filteredStories = ALL_STORIES.filter((s) =>
    FILTER_MAP[activeFilter]?.includes(s.industry)
  );

  const handleFilter = (f: string) => {
    setActiveFilter(f);
    setVisibleCount(PAGE_SIZE);
  };

  const visible = filteredStories.slice(0, visibleCount);
  const hasMore = visibleCount < filteredStories.length;

  return (
    <section className="cst-stories">
      <div className="cst-inner">
        {/* Header */}
        <div className="cst-stories-header">
          <div>
            <h2 className="cst-stories-title">All Stories</h2>
            <p className="cst-stories-sub">
              Browse 250+ success stories from industry leaders leveraging Bizak to redefine excellence.
            </p>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="cst-filters">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => handleFilter(f)}
              className={`cst-filter-btn ${f === activeFilter ? "active" : "inactive"}`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="cst-grid">
          {visible.map((story, i) => (
            <a href="#" className="cst-story-card" key={`${story.industry}-${i}`}>
              <div className="cst-story-img-wrap">
                <img src={story.img} alt={story.title} />
                <div className="cst-story-img-overlay" />
              </div>
              <div className="cst-story-body">
                <div className="cst-story-meta">
                  <span className="cst-label">{story.industry}</span>
                  <span className="material-symbols-outlined cst-story-arrow">arrow_outward</span>
                </div>
                <h3 className="cst-story-title">{story.title}</h3>
                <p className="cst-story-excerpt">{story.excerpt}</p>
              </div>
            </a>
          ))}
        </div>

        {/* Load more */}
        {hasMore && (
          <div className="cst-load-more-wrap">
            <button
              className="cst-btn-black"
              onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
            >
              Load More Stories
            </button>
          </div>
        )}
        {!hasMore && filteredStories.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 0", color: "rgba(0,0,0,0.4)", fontSize: 15, fontWeight: 600 }}>
            No stories found for this filter.
          </div>
        )}
      </div>
    </section>
  );
}

// ─── BOTTOM CTA ───────────────────────────────────────────────────────────────
function BottomCTA() {
  return (
    // <section className="cst-cta-section">
    //   <div className="cst-inner">
    //     <div className="cst-cta-card">
    //       <div className="cst-cta-glow-br" />
    //       <div className="cst-cta-glow-tl" />
    //       <div className="cst-cta-inner">
    //         <p className="cst-cta-label">Start Your Journey</p>
    //         <h2 className="cst-cta-title">Ready to transform your operations?</h2>
    //         <p className="cst-cta-sub">
    //           Begin your case-study backed journey with Bizak today. Join the world's most
    //           efficient enterprises and scale with confidence.
    //         </p>
    //         <div className="cst-cta-btns">
    //           <button className="cst-btn-cta-accent">Request Custom Demo</button>
    //           <button className="cst-btn-cta-outline">Explore Technical Docs</button>
    //         </div>
    //       </div>
    //     </div>
    //   </div>
    // </section>







   <section className="blog-newsletter">
      <div className="blog-newsletter-grid-bg" />
      <div className="blog-newsletter-glow" />
      <div style={{ position: "relative", zIndex: 10 }}>
        <h2 className="blog-newsletter-title">Ready to transform your operations?</h2>
        <p className="blog-newsletter-sub">
           Begin your case-study backed journey with Bizak today. Join the world's most
               efficient enterprises and scale with confidence.
        </p>
      
{/*         
            <button type="submit" className="blog-newsletter-btn">Subscribe</button> */}
         <button className="cst-btn-cta-accent1 blog-newsletter-btn">Request Custom Demo</button>
             {/* <button className="cst-btn-cta-outline">Explore Technical Docs</button> */}
        
        <p className="blog-newsletter-fine">Zero spam. Pure intelligence. Unsubscribe anytime.</p>
      </div>
    </section>










  );
}




// ─── NEWSLETTER ───────────────────────────────────────────────────────────────
// function NewsletterSection() {
//   const [email, setEmail] = useState("");
//   const [submitted, setSubmitted] = useState(false);

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (email) setSubmitted(true);
//   };

//   return (
//     <section className="blog-newsletter">
//       <div className="blog-newsletter-grid-bg" />
//       <div className="blog-newsletter-glow" />
//       <div style={{ position: "relative", zIndex: 10 }}>
//         <h2 className="blog-newsletter-title">Get ERP insights delivered to your inbox</h2>
//         <p className="blog-newsletter-sub">
//           Join 5,000+ operations leaders receiving our bi-weekly breakdown of scaling
//           strategies and technical innovations.
//         </p>
//         {submitted ? (
//           <div style={{ color: "#C7FF35", fontWeight: 700, fontSize: 16, letterSpacing: "0.02em" }}>
//             ✓ You're subscribed thanks for joining!
//           </div>
//         ) : (
//           <form className="blog-newsletter-form" onSubmit={handleSubmit}>
//             <input
//               className="blog-newsletter-input"
//               type="email"
//               placeholder="Enter your work email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               required
//             />
//             <button type="submit" className="blog-newsletter-btn">Subscribe</button>
//           </form>
//         )}
//         <p className="blog-newsletter-fine">Zero spam. Pure intelligence. Unsubscribe anytime.</p>
//       </div>
//     </section>
//   );
// }



















// ─── PAGE ─────────────────────────────────────────────────────────────────────
export function CaseStudiesPage() {
  return (
    <div className="cst-page">
      <Header />
      <main style={{ paddingTop: 76 }}>
        <HeroSection />
        <FeaturedSpotlight />
        <AllStories />
        <BottomCTA />
      </main>
      <Footer />
    </div>
  );
}
