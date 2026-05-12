import { ArrowUpRight, Instagram, Twitter, Facebook, Linkedin, Sparkles } from "lucide-react";
import bizakLogoFooter from "../../assets/bizaklogo-footer.png";
import footerBgImage from "../../assets/footerimg.png";

// ─── Footer CTA — dynamic per page ────────────────────────────────────────────
//
// Pages render <Footer cta={{...}} /> to override the closing CTA. Without a
// prop, Footer falls back to the homepage default.

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

const FOOTER_LINK_STYLE: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  color: "rgba(252,252,247,0.62)",
  textDecoration: "none",
  fontFamily: "Inter",
  fontSize: 14,
  fontWeight: 400,
  padding: "4px 0",
  transition: "color 0.18s ease",
};

export function Footer({ cta }: { cta?: FooterCta } = {}) {
  const c: FooterCta = { ...DEFAULT_CTA, ...(cta ?? {}) };
  return (
    <footer>
      {/* ─── Single wrapper: warehouse image + olive tint covers BOTH the CTA and the framed card ─── */}
      <div
        style={{
          position: "relative",
          backgroundImage: `url(${footerBgImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          padding: "0 16px 24px",
        }}
      >
        {/* Olive tint over the warehouse image — covers the entire footer area */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(26,45,32,0.55)",
            pointerEvents: "none",
          }}
        />

        <div style={{ position: "relative", maxWidth: 1320, margin: "0 auto" }}>
          {/* CTA block — sits on the tinted warehouse bg, light text */}
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
            <h2 className="bz-h2" style={{ maxWidth: 720, color: "#FCFCF7" }}>
              {c.title}
              {c.titleMuted && (
                <>
                  {" "}
                  <span style={{ color: "rgba(252,252,247,0.55)" }}>{c.titleMuted}</span>
                </>
              )}
            </h2>
            {c.description && (
              <p
                style={{
                  fontFamily: "var(--bz-body-font)",
                  fontSize: 15,
                  color: "rgba(252,252,247,0.62)",
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
              <a href={c.secondaryHref} className="bz-pill bz-pill-ghost-dark">
                <Sparkles size={13} />
                {c.secondaryLabel}
              </a>
            </div>
          </div>

          {/* Framed card — sits on top of the same tinted bg */}
          <div style={{ position: "relative" }}>
            <div style={{ position: "relative" }}>
          <div className="bz-footer-card">
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
                src={bizakLogoFooter}
                alt="Bizak ERP"
                style={{ height: 48, width: "auto", marginBottom: 24 }}
              />
              <p
                style={{
                  fontFamily: "Inter",
                  fontSize: 14,
                  fontWeight: 400,
                  color: "rgba(252,252,247,0.62)",
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
                  className="bz-pill bz-pill-ghost-dark"
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
                    color: "rgba(252,252,247,0.55)",
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
                        style={FOOTER_LINK_STYLE}
                        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#FCFCF7")}
                        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(252,252,247,0.62)")}
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
              background: "rgba(252,252,247,0.08)",
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
                color: "rgba(252,252,247,0.45)",
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
                    background: "rgba(252,252,247,0.06)",
                    border: "1px solid rgba(252,252,247,0.08)",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "rgba(252,252,247,0.62)",
                    transition: "background 0.18s ease, color 0.18s ease",
                    textDecoration: "none",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "rgba(252,252,247,0.12)";
                    (e.currentTarget as HTMLElement).style.color = "#FCFCF7";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "rgba(252,252,247,0.06)";
                    (e.currentTarget as HTMLElement).style.color = "rgba(252,252,247,0.62)";
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
