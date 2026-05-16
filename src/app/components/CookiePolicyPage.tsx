import { LegalDoc, LegalHero, LegalLink } from "./legal";
import type { LegalSectionData } from "./legal";

// ════════════════════════════════════════════════════════════════════════════
// /cookies Bizak uses only essential cookies, so no consent banner.
// Content adapted from the Bizak Privacy & Trust Implementation Guide §8.
// ════════════════════════════════════════════════════════════════════════════

const SECTIONS: LegalSectionData[] = [
  {
    id: "what-cookies",
    title: "What cookies are",
    blocks: [
      {
        kind: "p",
        text: "Cookies are small text files placed on your device when you visit a website or use a web application. They are widely used to make sites work, to keep users signed in, and to remember preferences. Similar technologies, such as local storage, work in comparable ways.",
      },
    ],
  },
  {
    id: "cookies-we-use",
    title: "Cookies Bizak uses",
    blocks: [
      {
        kind: "p",
        text: "Bizak uses only essential cookies and similar technologies. These are required for the website and the ERP platform to function and cannot be switched off without breaking core functionality. They support:",
      },
      {
        kind: "ul",
        items: [
          "Authentication, keeping you signed in to your tenant.",
          "Security, helping protect against unauthorized access.",
          "Session management and core platform functionality.",
        ],
      },
      {
        kind: "note",
        text: "Because Bizak uses only essential cookies, no cookie consent banner is required. If that ever changes, this policy will be updated first.",
      },
    ],
  },
  {
    id: "cookies-we-dont",
    title: "Cookies Bizak does not use",
    blocks: [
      {
        kind: "p",
        text: "Bizak does not use cookies or similar technologies for:",
      },
      {
        kind: "ul",
        items: [
          "Advertising or remarketing.",
          "Behavioural tracking or profiling.",
          "Third-party analytics, heatmaps, or session recording.",
        ],
      },
      {
        kind: "p",
        text: "If Bizak introduces analytics, marketing, or other non-essential cookies in the future, we will update this Cookie Policy and put consent controls in place where required before those cookies are used.",
      },
    ],
  },
  {
    id: "control",
    title: "How you can control cookies",
    blocks: [
      {
        kind: "p",
        text: "Most browsers let you view, manage, and delete cookies through their settings. Because Bizak relies only on essential cookies, blocking them may prevent you from signing in or using parts of the platform.",
      },
    ],
  },
  {
    id: "changes",
    title: "Changes to this policy",
    blocks: [
      {
        kind: "p",
        text: "We may update this Cookie Policy to reflect changes in technology or in how the platform works. Material changes will be shown here with a new “last updated” date.",
      },
    ],
  },
  {
    id: "contact",
    title: "Contact",
    blocks: [
      {
        kind: "p",
        text: (
          <>
            Questions about cookies or this policy? Email{" "}
            <LegalLink href="mailto:system@bizakerp.com">
              system@bizakerp.com
            </LegalLink>
            , or see our{" "}
            <LegalLink href="/privacy">Privacy Policy</LegalLink>.
          </>
        ),
      },
    ],
  },
];

export function CookiePolicyPage() {
  return (
    <main>
      <LegalHero
        badge="Legal & Trust"
        title="Cookie Policy"
        summary="Bizak uses only essential cookies, the ones needed to sign you in and keep the platform secure. No analytics, no advertising, no behavioural tracking, which is why you will not see a cookie banner."
        meta="Last updated May 16, 2026"
      />
      <LegalDoc sections={SECTIONS} />
    </main>
  );
}
