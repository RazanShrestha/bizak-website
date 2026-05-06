import { useState } from "react";
import type { ChangeEvent } from "react";
import "../../styles/style.css";
import { Header } from "./Header";
import { Footer } from "./Footer";

// ─── FAQ Data ─────────────────────────────────────────────────────────────────
const FAQS = [
  {
    q: "How long does an enterprise implementation take?",
    a: "Typical implementations range from 4 to 12 weeks depending on the complexity of your data and the number of modules being deployed.",
  },
  {
    q: "Can we migrate data from our current legacy ERP?",
    a: "Yes, our data migration engine supports almost all legacy formats and databases, including automated mapping tools.",
  },
  {
    q: "Is there a limit to the number of users?",
    a: "Our enterprise plans feature unlimited user scaling with granular role-based access controls to maintain security.",
  },
  {
    q: "What kind of support is included?",
    a: "All enterprise plans include 24/7 technical support and a dedicated account manager for ongoing strategic guidance.",
  },
];

// ─── Reason cards ─────────────────────────────────────────────────────────────
const REASONS = [
  {
    icon: "grid_off",
    title: "Replace Spreadsheets",
    desc: "Unified data architecture to eliminate silos and manual errors.",
  },
  {
    icon: "settings_suggest",
    title: "Seamless Implementation",
    desc: "White-glove data migration from legacy systems with zero downtime.",
  },
  {
    icon: "payments",
    title: "Custom Pricing",
    desc: "Enterprise plans tailored to your specific module requirements.",
  },
];

// ─── Channel cards ────────────────────────────────────────────────────────────
const CHANNELS = [
  {
    icon: "chat_bubble",
    title: "Sales Inquiries",
    desc: "Discuss specific features, volume discounts, and custom platform integrations.",
    link: "Email Sales",
  },
  {
    icon: "support_agent",
    title: "Product & Support",
    desc: "Already a customer? Reach our technical support team for help with your instance.",
    link: "Contact Support",
  },
  {
    icon: "handshake",
    title: "Partnerships",
    desc: "Explore collaboration opportunities for agencies, consultants, and resellers.",
    link: "Become a Partner",
  },
];

// ─── Arrow SVG ────────────────────────────────────────────────────────────────
function ArrowRight() {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function HeroSection() {
  return (
    <section className="cp-hero">
      <span className="cp-hero-label">Get in Touch</span>
      <h1 className="cp-hero-title">Talk to the Bizak Team</h1>
      <p className="cp-hero-sub">
        Ready to move beyond spreadsheets? Explore how our enterprise ERP platform can
        help you automate workflows and scale operations with total visibility.
      </p>
      <div className="cp-hero-btns">
        <button className="cp-btn-primary">Request a Demo</button>
        <button className="cp-btn-ghost">Contact Sales</button>
      </div>
    </section>
  );
}

// ─── Contact Form ─────────────────────────────────────────────────────────────
function ContactForm() {
  const [form, setForm] = useState({
    name: "", email: "", company: "", phone: "", size: "", message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const set = (k: string) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="cp-form-card">
      <h3 className="cp-form-title">Tell us about your business</h3>
      {submitted ? (
        <div className="cp-submit-success">
          ✓ Message sent! A member of our team will be in touch within one business day.
        </div>
      ) : (
        <form className="cp-form" onSubmit={handleSubmit}>
          <div className="cp-form-row">
            <div className="cp-field">
              <label className="cp-label">Full Name</label>
              <input className="cp-input" type="text" placeholder="John Doe" value={form.name} onChange={set("name")} required />
            </div>
            <div className="cp-field">
              <label className="cp-label">Work Email</label>
              <input className="cp-input" type="email" placeholder="john@company.com" value={form.email} onChange={set("email")} required />
            </div>
          </div>
          <div className="cp-form-row">
            <div className="cp-field">
              <label className="cp-label">Company Name</label>
              <input className="cp-input" type="text" placeholder="Acme Inc." value={form.company} onChange={set("company")} />
            </div>
            <div className="cp-field">
              <label className="cp-label">Phone Number</label>
              <input className="cp-input" type="tel" placeholder="+1 (555) 000-0000" value={form.phone} onChange={set("phone")} />
            </div>
          </div>
          <div className="cp-field">
            <label className="cp-label">Company Size</label>
            <select className="cp-select" value={form.size} onChange={set("size")}>
              <option value="">Select company size…</option>
              <option>10–50 employees</option>
              <option>51–200 employees</option>
              <option>201–500 employees</option>
              <option>500+ employees</option>
            </select>
          </div>
          <div className="cp-field">
            <label className="cp-label">Message</label>
            <textarea className="cp-textarea" placeholder="Tell us about your operational challenges…" rows={5} value={form.message} onChange={set("message")} />
          </div>
          <button type="submit" className="cp-submit-btn">Send Message</button>
        </form>
      )}
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function Sidebar() {
  return (
    <div className="cp-sidebar">
      <div className="cp-sidebar-label">Why companies reach out</div>
      {REASONS.map((r) => (
        <div className="cp-reason-card" key={r.title}>
          <div className="cp-reason-icon">
            <span className="material-symbols-outlined">{r.icon}</span>
          </div>
          <div>
            <div className="cp-reason-title">{r.title}</div>
            <div className="cp-reason-desc">{r.desc}</div>
          </div>
        </div>
      ))}
      <div className="cp-sla-card">
        <div className="cp-sla-neon">Enterprise Ready</div>
        <div className="cp-sla-title">99.9% Uptime SLA for critical operations.</div>
        <a href="#" className="cp-sla-link">
          View Security Docs
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </a>
        <div className="cp-sla-icon-bg material-symbols-outlined">shield</div>
      </div>
    </div>
  );
}

// ─── Channels ─────────────────────────────────────────────────────────────────
function ChannelsSection() {
  return (
    <section className="cp-channels-section">
      <div className="cp-channels-grid">
        {CHANNELS.map((c) => (
          <div className="cp-channel-card" key={c.title}>
            <span className="material-symbols-outlined cp-channel-icon">{c.icon}</span>
            <div className="cp-channel-title">{c.title}</div>
            <div className="cp-channel-desc">{c.desc}</div>
            <a href="#" className="cp-channel-link">
              {c.link} <ArrowRight />
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Quote ────────────────────────────────────────────────────────────────────
function QuoteSection() {
  return (
    <section className="cp-quote-section">
      <div className="cp-quote-inner">
        <blockquote className="cp-quote-text">
          "We understand the operational challenges of growth."
        </blockquote>
        <p className="cp-quote-body">
          Scaling a business shouldn't mean managing a mountain of spreadsheets. Our team is
          dedicated to helping you build a single source of truth, so you can focus on strategic
          decisions rather than data reconciliation. Every Bizak implementation comes with expert
          guidance from professionals who have walked your path.
        </p>
      </div>
    </section>
  );
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────
function FAQSection() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="cp-faq-section">
      <div className="cp-faq-inner">
        <h2 className="cp-faq-title">Frequently Asked Questions</h2>
        <div className="cp-faq-list">
          {FAQS.map((faq, i) => (
            <div
              key={i}
              className={`cp-faq-item${open === i ? " open" : ""}`}
            >
              <button
                className="cp-faq-trigger"
                onClick={() => setOpen(open === i ? null : i)}
                aria-expanded={open === i}
              >
                <span className="cp-faq-q">{faq.q}</span>
                <span className="material-symbols-outlined cp-faq-icon">expand_more</span>
              </button>
              <div className="cp-faq-answer">
                <p>{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Bottom CTA ───────────────────────────────────────────────────────────────
function BottomCTA() {
  return (
    <section className="cp-bottom-cta">
      <div className="cp-bottom-cta-glow" />
      <h2 className="cp-bottom-cta-title">Ready to unify your business operations?</h2>
      <p className="cp-bottom-cta-sub">Join the leading enterprises scaling with Bizak ERP.</p>
      <button className="cp-bottom-cta-btn">Request a Custom Quote</button>
    </section>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export function ContactPage() {
  return (
    <div className="cp-page">
      <Header />
      <main style={{ paddingTop: 76 }}>
        <HeroSection />

        {/* Form + Sidebar */}
        <section className="cp-form-section">
          <ContactForm />
          <Sidebar />
        </section>

        <ChannelsSection />
        <QuoteSection />
        <FAQSection />
        <BottomCTA />
      </main>
      <Footer />
    </div>
  );
}