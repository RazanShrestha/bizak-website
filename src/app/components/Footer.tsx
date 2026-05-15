import { Instagram, Twitter, Facebook, Linkedin } from "lucide-react";
import { Container, Heading, Pill, PillGroup } from "./bz";
import logoDark from "../../assets/logo/SVG/dark-mode-vertical-lockup.svg";
import logoLight from "../../assets/logo/SVG/all-black-vertical-lockup.svg";

// ─── Footer CTA dynamic per page ────────────────────────────────────────────
//
// Pages render <Footer cta={{...}} /> to override the closing CTA. Without a
// prop, Footer falls back to the generic default. Pass `hideCta` to drop the
// CTA zone entirely. The footer renders on a dark olive surface by default;
// pass `isLightMode` to render the light (paper) variant instead.

export interface FooterCta {
  title: React.ReactNode;
  titleMuted?: React.ReactNode;
  description?: React.ReactNode;
  primaryLabel?: string;
  primaryHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
}

const DEFAULT_CTA: FooterCta = {
  title: "Take full control of your operations.",
  titleMuted: "Start in minutes.",
  description: "No setup cost. No long contracts. Cancel anytime, keep your data.",
  primaryLabel: "Get Started",
  primaryHref: "https://system.bizakerp.com/account/self-register",
  secondaryLabel: "Request Demo",
  secondaryHref: "/contact",
};

// Link index one row per top-level nav group, mirroring the Header mega
// menu. Each group's links flatten its mega-menu sub-columns into a single
// list. The renderer lays them out as a fixed-column grid, so adding more
// modules grows a group by neat aligned rows rather than a ragged wrap
// keep this list in sync with `megaMenus` in Header.tsx.
const COLS: { heading: string; links: { label: string; href: string }[] }[] = [
  {
    heading: "Product",
    links: [
      { label: "Financial Management", href: "/FinancialManagement" },
      { label: "Sales & CRM", href: "/SalesCrm" },
      { label: "Purchasing", href: "/purchasing" },
      { label: "Inventory", href: "/InventoryAndWarehouse" },
      { label: "Manufacturing", href: "/ManufacturingProduct" },
      { label: "Projects & Job Costing", href: "/ProjectAndCosting" },
      { label: "Dashboards & Reporting", href: "/DashboardAndReporting" },
      { label: "Workflow Automation", href: "/workflow" },
      { label: "Integrations", href: "/Integrations" },
      { label: "Multi-company", href: "/MulticompanyAndBranches" },
      { label: "Document Management", href: "/DocumentManagement" },
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
    heading: "Customers",
    links: [{ label: "Case Studies", href: "/case-studies" }],
  },
  {
    heading: "Partners",
    links: [
      { label: "Resellers", href: "/partners/resellers" },
      { label: "Consultants & SIs", href: "/partners/consultants" },
      { label: "Technology Partners", href: "/partners/technology" },
      { label: "Partner Portal", href: "/partners/portal" },
      { label: "Become a Partner", href: "/partners" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { label: "Blog", href: "/blog" },
      { label: "Guides & Playbooks", href: "/GuidesAndPlaybooks" },
      { label: "Help Center", href: "/HelpCenter" },
      { label: "Training & Certification", href: "/TrainingAndCertification" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About Bizak", href: "/about" },
      { label: "Our Mission", href: "/OurMission" },
      { label: "Careers", href: "/careers" },
      { label: "Press & Media", href: "/PressAndMedia" },
      { label: "Contact Us", href: "/contact" },
    ],
  },
];

const SOCIAL = [
  { Icon: Instagram, label: "Instagram" },
  { Icon: Twitter, label: "Twitter" },
  { Icon: Facebook, label: "Facebook" },
  { Icon: Linkedin, label: "LinkedIn" },
];

// Theme tokens light footer vs dark olive footer.
function footerTheme(dark: boolean) {
  return dark
    ? {
        shell: "border-white/[0.08] bg-bz-olive",
        hairline: "border-white/[0.08]",
        desc: "text-white/[0.6]",
        label: "text-white/[0.42]",
        link: "text-white/[0.62] hover:text-white",
        social:
          "border-white/[0.16] text-white/[0.6] hover:border-white/[0.4] hover:text-white",
        meta: "text-white/[0.42]",
        metaLink: "hover:text-white",
      }
    : {
        shell: "border-bz-line bg-bz-paper",
        hairline: "border-bz-line-soft",
        desc: "text-bz-text-muted",
        label: "text-bz-text-soft",
        link: "text-bz-text-muted hover:text-bz-text",
        social:
          "border-bz-line text-bz-text-muted hover:border-bz-text hover:text-bz-text",
        meta: "text-bz-text-soft",
        metaLink: "hover:text-bz-text",
      };
}

export function Footer({
  cta,
  hideCta = false,
  isLightMode = false,
}: { cta?: FooterCta; hideCta?: boolean; isLightMode?: boolean } = {}) {
  const c: FooterCta = { ...DEFAULT_CTA, ...(cta ?? {}) };
  const dark = !isLightMode;
  const t = footerTheme(dark);

  return (
    <footer className={`relative border-t ${t.shell}`}>
      <Container>
        {/* CTA zone */}
        {!hideCta && (
          <div
            className={`flex flex-col items-center gap-5 border-b pt-20 pb-16 text-center ${t.hairline}`}
          >
            <Heading level={2} tone={dark ? "dark" : "light"} className="max-w-[680px]">
              {c.title}
              {c.titleMuted && <Heading.Muted> {c.titleMuted}</Heading.Muted>}
            </Heading>
            {c.description && (
              <p className={`m-0 max-w-[480px] text-[15px] leading-[1.6] ${t.desc}`}>
                {c.description}
              </p>
            )}
            <PillGroup className="mt-1">
              <Pill
                variant={dark ? "accent" : "dark"}
                href={c.primaryHref}
                withArrowUpRight
              >
                {c.primaryLabel}
              </Pill>
              <Pill
                variant={dark ? "ghostDark" : "light"}
                href={c.secondaryHref}
                withArrow
              >
                {c.secondaryLabel}
              </Pill>
            </PillGroup>
          </div>
        )}

        {/* Link index multi-column, one column per nav group. Columns
            keep the footer compact the tallest group sets the height
            and each group grows downward as modules are added. On mobile
            the index is a CSS masonry (`columns-2`) so short groups don't
            leave a row-alignment gap each group flows tight under the
            previous one in its column. From `sm:` up it's a real grid. */}
        <div
          className={`columns-2 gap-x-8 border-b pt-14 pb-12 sm:grid sm:grid-cols-3 sm:gap-x-8 sm:gap-y-10 lg:grid-cols-6 lg:gap-x-6 ${t.hairline}`}
        >
          {COLS.map((col) => (
            <div key={col.heading} className="mb-10 break-inside-avoid sm:mb-0">
              <span
                className={`block text-[11px] font-medium uppercase tracking-[0.2em] ${t.label}`}
              >
                {col.heading}
              </span>
              <div className="mt-4 flex flex-col items-start gap-2.5">
                {col.links.map((l) => (
                  <a
                    key={l.label}
                    href={l.href}
                    className={`text-[13.5px] leading-[1.4] no-underline transition-colors ${t.link}`}
                  >
                    {l.label}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Sign-off wordmark anchors the page, meta sits opposite */}
        <div className="flex flex-col gap-9 pt-12 pb-14 md:flex-row md:items-end md:justify-between">
          <a href="/" aria-label="Bizak home" className="inline-flex">
            <img
              src={dark ? logoDark : logoLight}
              alt="Bizak"
              className="h-[clamp(84px,10vw,120px)] w-auto"
            />
          </a>

          <div className="flex flex-col gap-5 md:items-end">
            <div className="flex gap-2.5">
              {SOCIAL.map(({ Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className={`flex size-9 items-center justify-center rounded-bz-pill border transition-colors ${t.social}`}
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
            <p className={`m-0 text-[12.5px] ${t.meta}`}>
              © 2026 Bizak Systems Inc. ·{" "}
              <a
                href="#"
                className={`text-inherit underline underline-offset-[3px] transition-colors ${t.metaLink}`}
              >
                Terms
              </a>{" "}
              ·{" "}
              <a
                href="#"
                className={`text-inherit underline underline-offset-[3px] transition-colors ${t.metaLink}`}
              >
                Privacy
              </a>
            </p>
          </div>
        </div>
      </Container>
    </footer>
  );
}
