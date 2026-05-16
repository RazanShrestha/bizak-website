import {
  ShieldCheck,
  Lock,
  KeyRound,
  ScrollText,
  HardDriveDownload,
  Bot,
  Server,
  MailWarning,
  FileCheck2,
} from "lucide-react";
import {
  Bento,
  BentoGrid,
  Container,
  Heading,
  Pill,
  Section,
  SectionHead,
} from "./bz";
import { LegalHero, LegalLink } from "./legal";
import { cn } from "./ui/utils";

// ════════════════════════════════════════════════════════════════════════════
// /security trust posture for prospects, procurement, and technical
// evaluators. Conservative by design: no unverified certification claims.
// Content adapted from the Bizak Privacy & Trust Implementation Guide §9.
// ════════════════════════════════════════════════════════════════════════════

// Data-residency facts shown beside the infrastructure copy.
const RESIDENCY = [
  { label: "Cloud provider", value: "Amazon Web Services (AWS)" },
  { label: "Hosting region", value: "India" },
  { label: "Production data", value: "India-resident" },
  { label: "Core subprocessor", value: "AWS infrastructure" },
];

// The platform controls behind every record.
const CONTROLS = [
  {
    icon: ShieldCheck,
    title: "Tenant isolation",
    desc: "Every customer tenant is logically separated through tenant-aware authorization and application-level access controls designed to prevent cross-tenant access.",
  },
  {
    icon: Lock,
    title: "Encryption",
    desc: "Data is encrypted in transit using TLS, and at rest where supported by the underlying storage service.",
  },
  {
    icon: KeyRound,
    title: "Access control",
    desc: "Role-based access controls and restricted administrative access, granted only on a documented business-need basis.",
  },
  {
    icon: ScrollText,
    title: "Audit logging",
    desc: "Security and operational events are logged and monitored, so account and platform activity stays traceable.",
  },
  {
    icon: HardDriveDownload,
    title: "Backups & export",
    desc: "Backup and recovery procedures, plus export tools so customers can retrieve their data whenever they need it.",
  },
  {
    icon: Bot,
    title: "AI data protection",
    desc: "AI-assisted features use customer data only to deliver the requested service. Customer ERP data is never used to train general-purpose AI models.",
  },
];

// Honest status of our compliance program no unverified claims.
const COMPLIANCE: {
  label: string;
  status: string;
  tone: "in-place" | "roadmap" | "request";
}[] = [
  { label: "Internal security controls", status: "In place", tone: "in-place" },
  {
    label: "Encryption, RBAC and tenant isolation",
    status: "In place",
    tone: "in-place",
  },
  {
    label: "Third-party certification (such as SOC 2)",
    status: "On our roadmap",
    tone: "roadmap",
  },
  {
    label: "Data Processing Agreement (DPA)",
    status: "Available on request",
    tone: "request",
  },
];

const STATUS_CLASS: Record<(typeof COMPLIANCE)[number]["tone"], string> = {
  "in-place": "bg-bz-leaf text-bz-olive",
  roadmap: "border border-bz-line bg-bz-paper-warm text-bz-text-muted",
  request: "border border-bz-olive/20 bg-bz-olive/[0.06] text-bz-olive",
};

// ── [HERO] ───────────────────────────────────────────────────────────────────

// ── [01] Infrastructure and data residency ──────────────────────────────────

function InfrastructureSection() {
  return (
    <Section tone="a">
      <Container>
        <SectionHead
          index="01"
          label="Infrastructure"
          title={
            <>
              Hosted in India,{" "}
              <Heading.Muted>built to scale securely.</Heading.Muted>
            </>
          }
        />
        <div className="grid items-start gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div className="flex max-w-[560px] flex-col gap-4">
            <p className="m-0 text-[15px] leading-[1.7] text-bz-text-muted">
              Bizak hosts customer production data in Amazon Web Services (AWS)
              data centres located in India. This supports data-residency
              expectations for our Asia-focused customers, and lets Bizak scale
              securely as demand grows.
            </p>
            <p className="m-0 text-[15px] leading-[1.7] text-bz-text-muted">
              Authorized Bizak personnel may access customer data from other
              locations only when needed to provide support, security, or
              operational services, and only under access-control and
              confidentiality requirements.
            </p>
          </div>

          {/* Residency fact card */}
          <div className="rounded-bz-2xl border border-bz-line bg-bz-surface p-6 sm:p-7">
            <div className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-bz-md bg-bz-olive text-bz-leaf">
                <Server size={17} strokeWidth={1.8} />
              </span>
              <h3 className="m-0 text-[15px] font-semibold tracking-tight text-bz-text">
                Data residency
              </h3>
            </div>
            <dl className="m-0 mt-5 flex flex-col">
              {RESIDENCY.map((r) => (
                <div
                  key={r.label}
                  className="flex items-center justify-between gap-4 border-b border-bz-line-soft py-3 last:border-0"
                >
                  <dt className="text-[13px] text-bz-text-muted">{r.label}</dt>
                  <dd className="m-0 text-[13.5px] font-medium text-bz-text">
                    {r.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </Container>
    </Section>
  );
}

// ── [02] Platform controls ───────────────────────────────────────────────────

function ControlsSection() {
  return (
    <Section tone="b">
      <Container>
        <SectionHead
          index="02"
          label="Platform security"
          title={
            <>
              The controls behind{" "}
              <Heading.Muted>every record.</Heading.Muted>
            </>
          }
          description="Bizak protects financial and operational data with technical and organizational safeguards across the platform."
        />
        <BentoGrid cols={3}>
          {CONTROLS.map(({ icon: Icon, title, desc }) => (
            <Bento key={title} tone="paper" hover minHeight={208}>
              <Bento.Header
                title={title}
                icon={
                  <span className="flex size-9 items-center justify-center rounded-bz-md bg-bz-olive text-bz-leaf">
                    <Icon size={17} strokeWidth={1.8} />
                  </span>
                }
              />
              <Bento.Desc>{desc}</Bento.Desc>
            </Bento>
          ))}
        </BentoGrid>
      </Container>
    </Section>
  );
}

// ── [03] Compliance roadmap ──────────────────────────────────────────────────

function ComplianceSection() {
  return (
    <Section tone="a">
      <Container>
        <SectionHead
          index="03"
          label="Compliance"
          title={
            <>
              Honest about{" "}
              <Heading.Muted>where we are.</Heading.Muted>
            </>
          }
          description="We describe our security posture conservatively. We do not claim certifications we do not hold this is an accurate picture of our program today."
        />
        <div className="mx-auto max-w-[760px] rounded-bz-2xl border border-bz-line bg-bz-surface p-2 sm:p-3">
          {COMPLIANCE.map((c) => (
            <div
              key={c.label}
              className="flex items-center justify-between gap-4 border-b border-bz-line-soft px-4 py-4 last:border-0"
            >
              <span className="text-[14px] leading-[1.4] text-bz-text">
                {c.label}
              </span>
              <span
                className={cn(
                  "shrink-0 rounded-bz-sm px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.06em]",
                  STATUS_CLASS[c.tone],
                )}
              >
                {c.status}
              </span>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}

// ── [04] Incident reporting + security questions ─────────────────────────────

function ContactSection() {
  return (
    <Section tone="b">
      <Container>
        <SectionHead
          index="04"
          label="Get in touch"
          title={
            <>
              Talk to our team{" "}
              <Heading.Muted>about security.</Heading.Muted>
            </>
          }
        />
        <div className="grid gap-5 md:grid-cols-2">
          {/* Incident reporting */}
          <div className="flex flex-col rounded-bz-2xl border border-bz-line bg-bz-surface p-6 sm:p-7">
            <span className="flex size-10 items-center justify-center rounded-bz-md bg-bz-olive text-bz-leaf">
              <MailWarning size={18} strokeWidth={1.8} />
            </span>
            <h3 className="m-0 mt-4 text-[16px] font-semibold tracking-tight text-bz-text">
              Report a security concern
            </h3>
            <p className="m-0 mt-2 text-[14px] leading-[1.65] text-bz-text-muted">
              If you believe you have found a vulnerability or a security issue,
              email{" "}
              <LegalLink href="mailto:security@bizakerp.com">
                security@bizakerp.com
              </LegalLink>
              . We review every report and respond promptly.
            </p>
          </div>

          {/* Procurement / evaluation */}
          <div className="flex flex-col rounded-bz-2xl border border-bz-line bg-bz-surface p-6 sm:p-7">
            <span className="flex size-10 items-center justify-center rounded-bz-md bg-bz-olive text-bz-leaf">
              <FileCheck2 size={18} strokeWidth={1.8} />
            </span>
            <h3 className="m-0 mt-4 text-[16px] font-semibold tracking-tight text-bz-text">
              Security questions during evaluation?
            </h3>
            <p className="m-0 mt-2 text-[14px] leading-[1.65] text-bz-text-muted">
              Procurement and technical teams can request our Data Processing
              Agreement, subprocessor list, and a walkthrough of our security
              posture.
            </p>
            <div className="mt-5">
              <Pill variant="dark" href="/contact" withArrow>
                Talk to Sales
              </Pill>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export function SecurityPage() {
  return (
    <main>
      <LegalHero
        badge="Legal & Trust"
        title="Security & Trust"
        summary="Bizak is built to run critical finance and operations data with security and reliability in mind: India-hosted infrastructure, tenant-aware access controls, encryption, and operational safeguards for your business data."
        chips={[
          "India-hosted",
          "Tenant isolation",
          "TLS encryption",
          "No AI training",
        ]}
      />
      <InfrastructureSection />
      <ControlsSection />
      <ComplianceSection />
      <ContactSection />
    </main>
  );
}
