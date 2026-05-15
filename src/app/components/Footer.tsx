import { Instagram, Twitter, Facebook, Linkedin } from "lucide-react";
import { Container, Heading, Pill, PillGroup } from "./bz";

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

// Link index presented as horizontal rows, not stacked columns.
const COLS: { heading: string; links: { label: string; href: string }[] }[] = [
  {
    heading: "Product",
    links: [
      { label: "Platform", href: "/product" },
      { label: "Financial Management", href: "/FinancialManagement" },
      { label: "Sales & CRM", href: "/SalesCrm" },
      { label: "Inventory", href: "/InventoryAndWarehouse" },
      { label: "Manufacturing", href: "/ManufacturingProduct" },
      { label: "Workflow Automation", href: "/workflow" },
    ],
  },
  {
    heading: "Solutions",
    links: [
      { label: "Manufacturing", href: "/manufacturing" },
      { label: "Distribution", href: "/distribution" },
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
      { label: "Become a Partner", href: "/partners" },
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
        wordmark: "text-bz-fire",
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
        wordmark: "text-bz-olive",
        social:
          "border-bz-line text-bz-text-muted hover:border-bz-text hover:text-bz-text",
        meta: "text-bz-text-soft",
        metaLink: "hover:text-bz-text",
      };
}

// The "bizak" lettering from the horizontal lockup, leaf symbol dropped.
// fill="currentColor" so the colour is theme-driven.
function BizakWordmark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="223.86 2.5 348.59 120.17"
      className={className}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M224.86,119.5V8.83h19.56v41.39h.81c4.9-9.87,12.81-14.81,23.72-14.81,4.83,0,9.31.94,13.45,2.81,4.14,1.87,7.76,4.58,10.86,8.11,3.1,3.53,5.53,8.02,7.29,13.48,1.76,5.46,2.65,11.56,2.65,18.29s-.86,12.77-2.59,18.21c-1.73,5.44-4.13,9.94-7.19,13.51-3.06,3.57-6.67,6.31-10.83,8.24-4.16,1.93-8.69,2.89-13.59,2.89-10.92,0-18.84-4.84-23.78-14.54h-1.13v13.08h-19.24ZM249.15,58.6c-3.4,4.76-5.11,11.22-5.11,19.4s1.71,14.71,5.13,19.59c3.42,4.88,8.21,7.32,14.37,7.32s11.12-2.48,14.56-7.43c3.44-4.95,5.16-11.45,5.16-19.48,0-5.22-.73-9.81-2.19-13.75-1.46-3.94-3.68-7.06-6.67-9.35-2.99-2.29-6.61-3.43-10.86-3.43-6.2,0-11,2.38-14.4,7.13Z" />
      <path d="M320.61,24.72c-3.13,0-5.81-1.03-8.02-3.11-2.22-2.07-3.32-4.57-3.32-7.48s1.11-5.47,3.32-7.54c2.21-2.07,4.89-3.11,8.02-3.11s5.75,1.04,7.97,3.11c2.22,2.07,3.32,4.58,3.32,7.54s-1.11,5.41-3.32,7.48-4.87,3.11-7.97,3.11ZM310.78,119.5V36.5h19.56v83h-19.56Z" />
      <path d="M340.23,119.5v-12.43l42.8-53.66v-.7h-41.39v-16.21h65.33v13.35l-40.74,52.74v.7h42.15v16.21h-68.14Z" />
      <path d="M441.55,121.17c-5.37,0-10.11-.93-14.24-2.78-4.13-1.85-7.41-4.69-9.86-8.51-2.45-3.82-3.67-8.38-3.67-13.67,0-3.6.59-6.81,1.78-9.62,1.19-2.81,2.73-5.1,4.62-6.86,1.89-1.77,4.26-3.27,7.11-4.51,2.85-1.24,5.67-2.16,8.48-2.76s5.98-1.09,9.51-1.49c8-.86,12.91-1.51,14.75-1.95,3.06-.72,4.9-1.93,5.51-3.62.18-.54.27-1.17.27-1.89v-.32c0-4.11-1.21-7.27-3.62-9.48-2.41-2.22-5.89-3.32-10.43-3.32s-8.21.99-11.1,2.97c-2.9,1.98-4.87,4.5-5.92,7.57l-18.26-2.59c2.13-7.42,6.3-13.09,12.51-17.02,6.21-3.93,13.77-5.89,22.67-5.89,3.35,0,6.56.28,9.62.84,3.06.56,6.09,1.53,9.08,2.92,2.99,1.39,5.57,3.13,7.75,5.24,2.18,2.11,3.93,4.84,5.27,8.19,1.33,3.35,2,7.13,2,11.35v55.55h-18.81v-11.4h-.65c-1.95,3.82-4.97,6.95-9.08,9.4-4.11,2.45-9.21,3.67-15.29,3.67ZM446.63,106.8c5.73,0,10.37-1.66,13.91-4.97,3.55-3.31,5.32-7.35,5.32-12.1v-9.78c-1.59,1.3-7.57,2.65-17.94,4.05-10.2,1.44-15.29,5.4-15.29,11.89,0,3.49,1.28,6.19,3.84,8.08,2.56,1.89,5.94,2.84,10.16,2.84Z" />
      <path d="M495.96,119.5V8.83h19.56v61.01h1.35l29.83-33.34h22.86l-32.15,35.83,34.04,47.17h-23.4l-25.4-35.5-7.13,7.62v27.88h-19.56Z" />
    </svg>
  );
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

        {/* Link index horizontal rows, label + flowing links */}
        <div className="pt-14">
          {COLS.map((col) => (
            <div
              key={col.heading}
              className={`grid grid-cols-1 gap-3 border-b py-6 sm:grid-cols-[150px_1fr] sm:gap-8 sm:py-7 ${t.hairline}`}
            >
              <span
                className={`text-[11px] font-medium uppercase tracking-[0.2em] ${t.label}`}
              >
                {col.heading}
              </span>
              <div className="flex flex-wrap gap-x-6 gap-y-2.5">
                {col.links.map((l) => (
                  <a
                    key={l.label}
                    href={l.href}
                    className={`text-[14px] no-underline transition-colors ${t.link}`}
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
            <BizakWordmark
              className={`h-[clamp(52px,8vw,88px)] w-auto ${t.wordmark}`}
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
