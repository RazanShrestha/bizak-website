import { ArrowUpRight, Instagram, Twitter, Facebook, Linkedin, Sparkles } from "lucide-react";
import bizakLogoVertical from "../../assets/logo/SVG/dark-mode-vertical-lockup.svg";
import footerBgImage from "../../assets/footerimg.png";

// ─── Footer CTA — dynamic per page ────────────────────────────────────────────
//
// Pages render <Footer cta={{...}} /> to override the closing CTA. Without a
// prop, Footer falls back to the homepage default.
//
// Pass `isLightMode` to render the footer on a paper surface (no warehouse
// background image, dark text, light card, dark logo).

export interface FooterCta {
  title: React.ReactNode;          // e.g. "Take full control of your operations."
  titleMuted?: React.ReactNode;    // e.g. "Start in minutes." — rendered as a faded inline span after title
  description?: React.ReactNode;   // sub-paragraph beneath the title
  primaryLabel?: string;           // primary button label, default "Get Started"
  primaryHref?: string;            // primary button href, default self-register
  secondaryLabel?: string;         // secondary button label, default "Book a demo"
  secondaryHref?: string;          // secondary button href, default "/contact"
}

const DEFAULT_CTA: FooterCta = {
  title: "Take full control of your operations.",
  titleMuted: "Start in minutes.",
  description: "No setup cost. No long contracts. Cancel anytime — keep your data.",
  primaryLabel: "Get Started",
  primaryHref: "https://system.bizakerp.com/account/self-register",
  secondaryLabel: "Book a demo",
  secondaryHref: "/contact",
};

const footerCols: { heading: string; links: { label: string; href: string }[] }[] = [
  {
    heading: "Product",
    links: [
      { label: "Bizak ERP Platform", href: "/product" },
      { label: "Financial Management", href: "/FinancialManagement" },
      { label: "Sales & CRM", href: "/SalesCrm" },
      { label: "Inventory & Warehouse", href: "/InventoryAndWarehouse" },
      { label: "Manufacturing", href: "/ManufacturingProduct" },
      { label: "Workflow Automation", href: "/workflow" },
      { label: "Integrations", href: "/Integrations" },
    ],
  },
  {
    heading: "Solutions",
    links: [
      { label: "Manufacturing", href: "/manufacturing" },
      { label: "Distribution", href: "/distribution" },
      { label: "Professional Services", href: "/ProfessionalService" },
      { label: "Retail & E-Commerce", href: "/Retail" },
      { label: "Startups & SMEs", href: "/StartupsAndSmes" },
      { label: "Mid-Market", href: "/MidMarket" },
      { label: "Enterprise", href: "/Enterprise" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { label: "Documentation", href: "/documentation" },
      { label: "Blog", href: "/blog" },
      { label: "Help Center", href: "/HelpCenter" },
      { label: "Case Studies", href: "/case-studies" },
      { label: "Guides & Playbooks", href: "/GuidesAndPlaybooks" },
      { label: "Webinars & Events", href: "/WebinarsAndEvents" },
      { label: "Training", href: "/TrainingAndCertification" },
    ],
  },
];

export function Footer({ cta, isLightMode = false }: { cta?: FooterCta; isLightMode?: boolean } = {}) {
  const c: FooterCta = { ...DEFAULT_CTA, ...(cta ?? {}) };

  const p = isLightMode
    ? {
        heading: "var(--bz-text)",
        headingMuted: "var(--bz-text-soft)",
        body: "var(--bz-text-muted)",
        link: "var(--bz-text-muted)",
        linkHover: "var(--bz-text)",
        colHeading: "var(--bz-text-soft)",
        meta: "var(--bz-text-muted)",
        divider: "var(--bz-line)",
        socialBg: "rgba(15,20,17,0.04)",
        socialBgHover: "rgba(15,20,17,0.08)",
        socialBorder: "var(--bz-line)",
        socialIcon: "var(--bz-text-muted)",
        socialIconHover: "var(--bz-text)",
      }
    : {
        heading: "#FCFCF7",
        headingMuted: "rgba(252,252,247,0.55)",
        body: "rgba(252,252,247,0.62)",
        link: "rgba(252,252,247,0.62)",
        linkHover: "#FCFCF7",
        colHeading: "rgba(252,252,247,0.55)",
        meta: "rgba(252,252,247,0.45)",
        divider: "rgba(252,252,247,0.08)",
        socialBg: "rgba(252,252,247,0.06)",
        socialBgHover: "rgba(252,252,247,0.12)",
        socialBorder: "rgba(252,252,247,0.08)",
        socialIcon: "rgba(252,252,247,0.62)",
        socialIconHover: "#FCFCF7",
      };

  const linkStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    color: p.link,
    textDecoration: "none",
    fontFamily: "Inter",
    fontSize: 14,
    fontWeight: 400,
    padding: "4px 0",
    transition: "color 0.18s ease",
  };

  const wrapperStyle: React.CSSProperties = isLightMode
    ? {
        position: "relative",
        background: "#ffffff",
        padding: "0 16px 24px",
      }
    : {
        position: "relative",
        backgroundImage: `url(${footerBgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        padding: "0 16px 24px",
      };

  return (
    <footer>
      <div style={wrapperStyle}>
        {!isLightMode && (
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(26,45,32,0.55)",
              pointerEvents: "none",
            }}
          />
        )}

        <div style={{ position: "relative", maxWidth: 1320, margin: "0 auto" }}>
          {/* CTA block */}
          <div
            style={{
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 22,
              padding: "96px 16px 72px",
            }}
          >
            <h2 className="bz-h2" style={{ maxWidth: 720, color: p.heading }}>
              {c.title}
              {c.titleMuted && (
                <>
                  {" "}
                  <span style={{ color: p.headingMuted }}>{c.titleMuted}</span>
                </>
              )}
            </h2>
            {c.description && (
              <p
                style={{
                  fontFamily: "var(--bz-body-font)",
                  fontSize: 15,
                  color: p.body,
                  margin: 0,
                  maxWidth: 520,
                  lineHeight: 1.55,
                }}
              >
                {c.description}
              </p>
            )}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
                gap: 10,
                marginTop: 4,
              }}
            >
              <a href={c.primaryHref} className="bz-pill bz-pill-accent">
                {c.primaryLabel}
                <ArrowUpRight size={14} />
              </a>
              <a
                href={c.secondaryHref}
                className={`bz-pill ${isLightMode ? "bz-pill-ghost" : "bz-pill-ghost-dark"}`}
              >
                <Sparkles size={13} />
                {c.secondaryLabel}
              </a>
            </div>
          </div>

          {/* Framed card */}
          <div style={{ position: "relative" }}>
            <div style={{ position: "relative" }}>
          <div className={`bz-footer-card${isLightMode ? " bz-footer-card--light" : ""}`}>
          {/* Top row: link columns */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.4fr 1fr 1fr 1fr",
              gap: 48,
              alignItems: "flex-start",
            }}
            className="bz-footer-top-grid"
          >
            {/* Brand col */}
            <div>
              <img
                src={bizakLogoVertical}
                alt="Bizak ERP"
                style={{ height: 48, width: "auto", marginBottom: 24 }}
              />
              <p
                style={{
                  fontFamily: "Inter",
                  fontSize: 14,
                  fontWeight: 400,
                  color: p.body,
                  lineHeight: 1.65,
                  maxWidth: 280,
                  margin: 0,
                }}
              >
                The operating system for modern business — finance, inventory, sales and operations in one unified workspace.
              </p>

              <div style={{ marginTop: 22, display: "flex", alignItems: "center", gap: 10 }}>
                <a
                  href="https://system.bizakerp.com"
                  target="_blank"
                  rel="noreferrer"
                  className="bz-pill bz-pill-leaf"
                  style={{ padding: "10px 16px", fontSize: 13 }}
                >
                  Get Started
                </a>
                <a
                  href="/contact"
                  className={`bz-pill ${isLightMode ? "bz-pill-ghost" : "bz-pill-ghost-dark"}`}
                  style={{ padding: "10px 16px", fontSize: 13 }}
                >
                  Talk to sales
                </a>
              </div>
            </div>

            {/* Link columns */}
            {footerCols.map((col) => (
              <div key={col.heading}>
                <h5
                  style={{
                    fontFamily: "Inter",
                    fontSize: 12,
                    fontWeight: 500,
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    color: p.colHeading,
                    margin: 0,
                    paddingBottom: 18,
                  }}
                >
                  {col.heading}
                </h5>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column" }}>
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        style={linkStyle}
                        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = p.linkHover)}
                        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = p.link)}
                      >
                        {link.label}
                        <ArrowUpRight size={13} style={{ opacity: 0.45 }} />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div
            style={{
              marginTop: 56,
              height: 1,
              background: p.divider,
            }}
          />

          {/* Bottom row */}
          <div
            style={{
              marginTop: 28,
              display: "flex",
              flexWrap: "wrap",
              gap: 18,
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                fontFamily: "Inter",
                fontSize: 12.5,
                fontWeight: 400,
                color: p.meta,
                lineHeight: 1.7,
              }}
            >
              © Copyright Bizak Systems Inc. 2018–2026 ·{" "}
              <a href="#" style={{ color: "inherit", textDecoration: "underline", textUnderlineOffset: 3 }}>
                Terms of Use
              </a>{" "}
              ·{" "}
              <a href="#" style={{ color: "inherit", textDecoration: "underline", textUnderlineOffset: 3 }}>
                Privacy Policy
              </a>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {[
                { Icon: Instagram, href: "#", label: "Instagram" },
                { Icon: Twitter, href: "#", label: "Twitter" },
                { Icon: Facebook, href: "#", label: "Facebook" },
                { Icon: Linkedin, href: "#", label: "LinkedIn" },
              ].map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 999,
                    background: p.socialBg,
                    border: `1px solid ${p.socialBorder}`,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: p.socialIcon,
                    transition: "background 0.18s ease, color 0.18s ease",
                    textDecoration: "none",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = p.socialBgHover;
                    (e.currentTarget as HTMLElement).style.color = p.socialIconHover;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = p.socialBg;
                    (e.currentTarget as HTMLElement).style.color = p.socialIcon;
                  }}
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
      </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .bz-footer-top-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 560px) {
          .bz-footer-top-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
        }
        @media (max-width: 720px) {
          .bz-footer-card { border-radius: 22px !important; }
        }
      `}</style>
    </footer>
  );
}
