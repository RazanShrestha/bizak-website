import { LegalDoc, LegalHero, LegalLink } from "./legal";
import type { LegalSectionData } from "./legal";

// ════════════════════════════════════════════════════════════════════════════
// /terms terms governing use of the Bizak ERP platform.
// Content adapted from the Bizak Privacy & Trust Implementation Guide §7.
// ════════════════════════════════════════════════════════════════════════════

const SECTIONS: LegalSectionData[] = [
  {
    id: "introduction",
    title: "Introduction",
    blocks: [
      {
        kind: "p",
        text: "These Terms of Service (“Terms”) govern access to and use of the Bizak ERP platform and related services provided by Bizak Technologies (“Bizak”). By using Bizak, the customer agrees to these Terms, unless the customer has entered into a separate written agreement with Bizak.",
      },
      {
        kind: "note",
        text: "Enterprise customers may sign a separate master agreement. Where a signed agreement exists, its terms take precedence over these Terms.",
      },
    ],
  },
  {
    id: "eligibility",
    title: "Eligibility and account registration",
    blocks: [
      {
        kind: "p",
        text: "To use Bizak, the customer must be a business or organization able to enter into a binding contract. The customer is responsible for providing accurate registration details and for keeping account information current.",
      },
    ],
  },
  {
    id: "tenant-access",
    title: "Tenant access and authorized users",
    blocks: [
      {
        kind: "p",
        text: "Customers access the Bizak ERP platform through tenant-specific domains such as your-company.bizakerp.com. Customers are responsible for managing their authorized users, assigning appropriate roles, and keeping user credentials secure.",
      },
    ],
  },
  {
    id: "responsibilities",
    title: "Customer responsibilities",
    blocks: [
      { kind: "p", text: "Customers are responsible for:" },
      {
        kind: "ul",
        items: [
          "The accuracy, quality, and legality of data entered into the platform.",
          "Obtaining any permissions or notices required for personal data they enter into Bizak.",
          "Managing internal user access and removing access when users no longer need it.",
          "Reviewing outputs, reports, accounting entries, and AI-assisted extraction results before relying on them for business, tax, financial, or legal purposes.",
        ],
      },
    ],
  },
  {
    id: "data-ownership",
    title: "Customer data ownership",
    blocks: [
      {
        kind: "p",
        text: "Customers retain all rights and ownership in their business data. Bizak receives only the limited rights necessary to host, process, transmit, back up, secure, support, and provide the Bizak ERP service.",
      },
    ],
  },
  {
    id: "ai-features",
    title: "AI-assisted features",
    blocks: [
      {
        kind: "p",
        text: "Bizak may provide AI-assisted extraction, classification, or processing features. AI-assisted outputs may contain errors and may require human review. Customers are responsible for reviewing and validating AI-assisted outputs before using them for accounting, financial reporting, compliance, or business decisions.",
      },
      {
        kind: "p",
        text: "Bizak does not use customer ERP data to train general-purpose AI models.",
      },
    ],
  },
  {
    id: "backup-export",
    title: "Backup and export",
    blocks: [
      {
        kind: "p",
        text: "Bizak provides backup and export capabilities to help customers retrieve their data. Customers are responsible for keeping their own copies of exported data where required by their internal policies, tax rules, audit requirements, or other regulatory obligations.",
      },
    ],
  },
  {
    id: "subscriptions",
    title: "Subscriptions, fees, and payment",
    blocks: [
      {
        kind: "p",
        text: "Access to Bizak is provided on a subscription basis. Applicable fees, billing frequency, and payment terms are set out in the customer’s order or subscription plan. Unless otherwise agreed, subscriptions continue until cancelled in line with the applicable plan.",
      },
    ],
  },
  {
    id: "acceptable-use",
    title: "Acceptable use",
    blocks: [
      {
        kind: "p",
        text: "Customers must not misuse the platform. This includes not attempting to gain unauthorized access to other tenants or to Bizak systems, not interfering with the operation or security of the service, and not using the platform for unlawful purposes.",
      },
    ],
  },
  {
    id: "availability",
    title: "Service availability and changes",
    blocks: [
      {
        kind: "p",
        text: "Bizak aims to provide a reliable ERP platform but does not guarantee uninterrupted or error-free service unless a separate written service-level agreement applies. Bizak may perform maintenance, updates, or emergency changes when reasonably necessary, and may improve or modify features over time.",
      },
    ],
  },
  {
    id: "confidentiality",
    title: "Confidentiality",
    blocks: [
      {
        kind: "p",
        text: "Each party may receive information from the other that is confidential. Each party agrees to protect the other’s confidential information and to use it only as needed to provide or use the service.",
      },
    ],
  },
  {
    id: "termination",
    title: "Termination and data return",
    blocks: [
      {
        kind: "p",
        text: "Either party may terminate the service in line with the applicable plan or agreement. On termination, the customer should export any required data before access ends.",
      },
      {
        kind: "p",
        text: "Bizak may retain customer data for a limited period after termination to support backup, legal, audit, or dispute requirements, after which it is deleted or de-identified.",
      },
    ],
  },
  {
    id: "disclaimers",
    title: "Disclaimers",
    blocks: [
      {
        kind: "p",
        text: "Except as expressly stated in these Terms or a separate written agreement, the Bizak platform is provided “as is”. Bizak does not provide accounting, tax, or legal advice; customers remain responsible for their own compliance and reporting obligations.",
      },
    ],
  },
  {
    id: "liability",
    title: "Limitation of liability",
    blocks: [
      {
        kind: "p",
        text: "To the maximum extent permitted by applicable law, Bizak will not be liable for indirect, incidental, special, consequential, exemplary, or punitive damages, including lost profits, lost revenue, lost data, business interruption, or financial loss arising from use of the service.",
      },
    ],
  },
  {
    id: "governing-law",
    title: "Governing law and disputes",
    blocks: [
      {
        kind: "p",
        text: "These Terms are governed by the laws applicable to the agreement between the customer and Bizak. Where a separate written agreement specifies a governing law or dispute-resolution process, that agreement applies.",
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
            Questions about these Terms? Reach us through our{" "}
            <LegalLink href="/contact">contact page</LegalLink>, or see our{" "}
            <LegalLink href="/privacy">Privacy Policy</LegalLink> for how we
            handle data.
          </>
        ),
      },
      {
        kind: "p",
        text: "Bizak may update these Terms from time to time. Material changes will be reflected here with a new “last updated” date.",
      },
    ],
  },
];

export function TermsPage() {
  return (
    <main>
      <LegalHero
        badge="Legal & Trust"
        title="Terms of Service"
        summary="The terms that govern access to and use of the Bizak ERP platform. They cover accounts, subscriptions, your ownership of your data, AI-assisted features, and the limits of our liability."
        meta="Last updated May 16, 2026"
      />
      <LegalDoc sections={SECTIONS} />
    </main>
  );
}
