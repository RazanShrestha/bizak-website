import { Instagram, Twitter, Facebook, Linkedin, Sparkles } from "lucide-react";
import bizakLogoVertical from "../../assets/logo/SVG/dark-mode-vertical-lockup.svg";
import bizakLogoVerticalDark from "../../assets/logo/SVG/all-black-vertical-lockup.svg";
import footerBgImage from "../../assets/footerimg.png";
import { Heading, Pill } from "./bz";

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

const SOCIAL = [
  { Icon: Instagram, href: "#", label: "Instagram" },
  { Icon: Twitter, href: "#", label: "Twitter" },
  { Icon: Facebook, href: "#", label: "Facebook" },
  { Icon: Linkedin, href: "#", label: "LinkedIn" },
];

export function Footer({ cta, isLightMode = false }: { cta?: FooterCta; isLightMode?: boolean } = {}) {
  const c: FooterCta = { ...DEFAULT_CTA, ...(cta ?? {}) };

  return (
    <footer
      className={`relative px-4 pb-6 bg-cover bg-center bg-no-repeat ${isLightMode ? "bg-white" : "bg-bz-olive-dark"}`}
      style={!isLightMode ? { backgroundImage: `url(${footerBgImage})` } : undefined}
    >
      {!isLightMode && (
        <div aria-hidden className="absolute inset-0 bg-bz-olive/55 pointer-events-none" />
      )}

      <div className="relative max-w-[1320px] mx-auto">
        {/* CTA block */}
        <div className="flex flex-col items-center text-center gap-[22px] px-4 pt-24 pb-[72px]">
          <Heading level={2} tone={isLightMode ? "light" : "dark"} className="max-w-[720px]">
            {c.title}
            {c.titleMuted && <Heading.Muted> {c.titleMuted}</Heading.Muted>}
          </Heading>
          {c.description && (
            <p className={`m-0 max-w-[520px] text-[15px] leading-[1.55] ${isLightMode ? "text-bz-text-muted" : "text-bz-text-on-dark-muted"}`}>
              {c.description}
            </p>
          )}
          <div className="flex flex-wrap justify-center gap-[10px] mt-1">
            <Pill variant="accent" href={c.primaryHref} withArrowUpRight>
              {c.primaryLabel}
            </Pill>
            <Pill
              variant={isLightMode ? "ghost" : "ghostDark"}
              iconLeft={<Sparkles size={13} />}
              href={c.secondaryHref}
            >
              {c.secondaryLabel}
            </Pill>
          </div>
        </div>

        {/* Framed card */}
        <div className={`bz-footer-card${isLightMode ? " bz-footer-card--light" : ""}`}>
          {/* Top row: brand col + link columns */}
          <div className="bz-footer-top-grid">
            {/* Brand column */}
            <div>
              <img
                src={isLightMode ? bizakLogoVerticalDark : bizakLogoVertical}
                alt="Bizak ERP"
                className="h-12 w-auto mb-6"
              />
              <p className={`m-0 max-w-[280px] text-[14px] font-normal leading-[1.65] ${isLightMode ? "text-bz-text-muted" : "text-bz-text-on-dark-muted"}`}>
                The operating system for modern business — finance, inventory, sales and operations in one unified workspace.
              </p>
              <div className="mt-[22px] flex flex-col gap-[10px]">
                <Pill
                  variant="accent"
                  href="https://system.bizakerp.com"
                  target="_blank"
                  rel="noreferrer"
                  className="justify-center !py-[10px] !px-4"
                >
                  Get Started
                </Pill>
                <Pill
                  variant={isLightMode ? "ghost" : "ghostDark"}
                  href="/contact"
                  className="justify-center !py-[10px] !px-4"
                >
                  Talk to sales
                </Pill>
              </div>
            </div>

            {/* Link columns */}
            {footerCols.map((col) => (
              <div key={col.heading}>
                <h5 className="bz-footer-col-heading">{col.heading}</h5>
                <ul className="m-0 list-none p-0 flex flex-col">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <a href={link.href} className="bz-footer-link">
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div className={`mt-14 h-px ${isLightMode ? "bg-bz-line" : "bg-white/[0.08]"}`} />

          {/* Bottom row */}
          <div className="mt-7 flex flex-wrap items-center justify-between gap-[18px]">
            <div className="bz-footer-meta">
              © Copyright Bizak Systems Inc. 2018–2026 ·{" "}
              <a href="#" className="underline underline-offset-[3px] text-inherit">
                Terms of Use
              </a>{" "}
              ·{" "}
              <a href="#" className="underline underline-offset-[3px] text-inherit">
                Privacy Policy
              </a>
            </div>
            <div className="flex items-center gap-2">
              {SOCIAL.map(({ Icon, href, label }) => (
                <a key={label} href={href} aria-label={label} className="bz-footer-social">
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
