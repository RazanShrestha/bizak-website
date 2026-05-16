import { LegalDoc, LegalHero, LegalLink } from "./legal";
import type { LegalSectionData } from "./legal";

// ════════════════════════════════════════════════════════════════════════════
// /privacy how Bizak handles website and ERP customer data.
// Content adapted from the Bizak Privacy & Trust Implementation Guide §6.
// ════════════════════════════════════════════════════════════════════════════

const SECTIONS: LegalSectionData[] = [
  {
    id: "who-we-are",
    title: "Who we are",
    blocks: [
      {
        kind: "p",
        text: (
          <>
            Bizak Technologies (“Bizak”, “we”, “our”, or “us”) provides
            enterprise resource planning (ERP) software for finance, accounting,
            inventory, purchasing, sales, and business operations. This Privacy
            Policy explains how we handle information when visitors use
            www.bizakerp.com and when customers use the Bizak ERP platform,
            including tenant-specific domains such as
            your-company.bizakerp.com.
          </>
        ),
      },
      {
        kind: "fields",
        items: [
          { label: "Legal entity", value: "Bizak Technologies" },
          {
            label: "Privacy contact",
            value: (
              <LegalLink href="mailto:system@bizakerp.com">
                system@bizakerp.com
              </LegalLink>
            ),
          },
        ],
      },
    ],
  },
  {
    id: "information-we-collect",
    title: "Information we collect",
    blocks: [
      {
        kind: "p",
        text: "We collect a limited set of information, grouped into three categories:",
      },
      { kind: "h3", text: "Website and contact information" },
      {
        kind: "p",
        text: "Name, business email, phone number, company name, and the content of messages you submit through our contact, demo, or support forms. We also record basic technical logs such as IP address, browser and device type, timestamps, and the pages requested.",
      },
      { kind: "h3", text: "Customer ERP data" },
      {
        kind: "p",
        text: "When customers use the Bizak ERP platform, they upload or create business data such as accounting records, financial ledgers, bills, invoices, purchase records, inventory records, customer and vendor information, and other operational data.",
      },
      { kind: "h3", text: "Account and usage information" },
      {
        kind: "p",
        text: "Account details needed to operate and secure the platform: user name, business email, role, tenant, and authentication and activity logs.",
      },
    ],
  },
  {
    id: "how-we-use",
    title: "How we use information",
    blocks: [
      { kind: "p", text: "We use information only for the following purposes:" },
      {
        kind: "ul",
        items: [
          "Responding to contact, demo, and sales requests.",
          "Providing, operating, securing, and improving the Bizak ERP platform.",
          "Authenticating users and managing tenant-specific access.",
          "Maintaining audit logs, troubleshooting issues, and protecting the platform from misuse.",
          "Providing backup, export, support, and customer service functions.",
          "Meeting applicable legal, contractual, and security obligations.",
        ],
      },
      {
        kind: "p",
        text: "We do not sell your information, and we do not use it for advertising or behavioural tracking.",
      },
    ],
  },
  {
    id: "customer-data",
    title: "Customer data ownership and roles",
    blocks: [
      {
        kind: "p",
        text: "Customers retain ownership of all business data submitted to or stored in the Bizak ERP platform. The customer decides what data is entered into the platform and how it is used for their business operations.",
      },
      {
        kind: "p",
        text: "Bizak processes customer data only to provide the ERP service, support the customer, maintain security, and meet contractual obligations. Where applicable, the customer acts as the data controller (or data fiduciary) for its business data, and Bizak acts as the service provider or data processor.",
      },
    ],
  },
  {
    id: "tenant-access",
    title: "Multi-tenant platform and tenant isolation",
    blocks: [
      {
        kind: "p",
        text: "Bizak provides tenant-specific access through subdomains such as your-company.bizakerp.com. Each customer tenant is logically separated from every other tenant through application-level access controls, tenant-aware authorization, and operational safeguards designed to prevent unauthorized cross-tenant access.",
      },
    ],
  },
  {
    id: "ai-features",
    title: "AI-powered features",
    blocks: [
      {
        kind: "p",
        text: "Bizak may use AI-powered features to help extract, classify, or process information from bills, financial ledgers, invoices, and related business records.",
      },
      {
        kind: "p",
        text: "Customer data is used for these features only to provide the requested service to that customer. Bizak does not sell customer data, and Bizak does not use customer ERP data to train general-purpose AI models. If we introduce third-party AI providers in the future, we will update this Privacy Policy and the related customer agreements before doing so.",
      },
    ],
  },
  {
    id: "hosting",
    title: "Data hosting and location",
    blocks: [
      {
        kind: "p",
        text: "Bizak hosts customer production data in Amazon Web Services (AWS) data centres located in India. This supports data-residency expectations for our Asia-focused customers.",
      },
      {
        kind: "p",
        text: "Authorized Bizak personnel may access customer data from other locations only when needed to provide support, security, or operational services, and only under access-control and confidentiality requirements.",
      },
    ],
  },
  {
    id: "subprocessors",
    title: "Subprocessors and service providers",
    blocks: [
      {
        kind: "p",
        text: "Bizak uses a small number of trusted service providers to operate the platform. Our current core subprocessor is:",
      },
      {
        kind: "ul",
        items: [
          "Amazon Web Services (AWS): cloud infrastructure, hosting, storage, networking, and logging.",
        ],
      },
      {
        kind: "p",
        text: "We maintain reasonable controls over our subprocessors and will notify customers if we add a material subprocessor that processes production customer data.",
      },
    ],
  },
  {
    id: "security",
    title: "Security safeguards",
    blocks: [
      {
        kind: "p",
        text: "Bizak uses technical and organizational safeguards designed to protect customer data, including:",
      },
      {
        kind: "ul",
        items: [
          "Encryption in transit using TLS.",
          "Encryption at rest where supported by the underlying storage service.",
          "Role-based access controls and tenant-aware authorization.",
          "Logging and monitoring of security and operational events.",
          "Backup and recovery procedures.",
          "Restricted administrative access, granted only on a business-need basis.",
        ],
      },
      {
        kind: "p",
        text: (
          <>
            For more detail on our security posture, see our{" "}
            <LegalLink href="/security">Security page</LegalLink>.
          </>
        ),
      },
    ],
  },
  {
    id: "retention",
    title: "Retention, backup, and export",
    blocks: [
      {
        kind: "p",
        text: "Customer data is retained for the duration of the customer relationship unless otherwise agreed. Bizak supports data backup and export so customers can retrieve their data.",
      },
      {
        kind: "p",
        text: "After a customer relationship ends, data may be retained for a limited period (generally no more than 90 days) for backup, legal, audit, or dispute purposes, and is then deleted or de-identified in line with our retention procedures.",
      },
    ],
  },
  {
    id: "rights",
    title: "Your rights and requests",
    blocks: [
      {
        kind: "p",
        text: "Depending on applicable law, individuals may request access to, correction of, or deletion of their personal data, or other related actions.",
      },
      {
        kind: "p",
        text: (
          <>
            Customers should submit requests relating to their own internal
            users or business records through their tenant administrator where
            possible. Other privacy requests can be sent to{" "}
            <LegalLink href="mailto:system@bizakerp.com">
              system@bizakerp.com
            </LegalLink>
            .
          </>
        ),
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
            Questions about this Privacy Policy or how we handle data? Email{" "}
            <LegalLink href="mailto:system@bizakerp.com">
              system@bizakerp.com
            </LegalLink>
            , or reach us through our{" "}
            <LegalLink href="/contact">contact page</LegalLink>.
          </>
        ),
      },
      {
        kind: "p",
        text: "We may update this Privacy Policy from time to time. Material changes will be reflected here with a new “last updated” date.",
      },
    ],
  },
];

export function PrivacyPolicyPage() {
  return (
    <main>
      <LegalHero
        badge="Legal & Trust"
        title="Privacy Policy"
        summary="How Bizak collects, uses, stores, and protects information across our website and the Bizak ERP platform. The short version: your business data belongs to you, it is hosted in AWS, and it is never used to train AI models."
        meta="Last updated May 16, 2026"
      />
      <LegalDoc sections={SECTIONS} />
    </main>
  );
}
