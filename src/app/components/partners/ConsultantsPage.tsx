import {
  Route,
  Check,
  GraduationCap,
  Briefcase,
  Building2,
  Landmark,
  Factory,
  Wrench,
  Workflow,
  ShieldCheck,
  Send,
  TrendingUp,
} from "lucide-react";
import {
  Accordion,
  BadgeGreen,
  Bento,
  BentoGrid,
  Container,
  DotGrid,
  Heading,
  Pill,
  PillGroup,
  Section,
  SectionHead,
  StatusChip,
} from "../bz";

// ════════════════════════════════════════════════════════════════════════════
// CONTENT DATA
// ════════════════════════════════════════════════════════════════════════════

const PHASES = [
  {
    name: "Discovery & scoping",
    detail: "Requirements, data audit, statement of work.",
    status: "done",
  },
  {
    name: "Data migration",
    detail: "Legacy records mapped, validated, dry-run.",
    status: "done",
  },
  {
    name: "Configuration",
    detail: "Chart of accounts, workflows, approval matrices.",
    status: "active",
  },
  {
    name: "Go-live",
    detail: "Cutover, training, first live transactions.",
    status: "queued",
  },
  {
    name: "Hypercare",
    detail: "Two weeks of escalation cover with Bizak.",
    status: "queued",
  },
];

const CERT_FIELDS = [
  { label: "Required track", value: "Consultant Foundations" },
  { label: "Renewal",        value: "Annual, exam-graded" },
];

const FIRMS = [
  {
    icon: Briefcase,
    title: "Boutique implementation firms",
    desc: "Five to fifty consultants delivering hands-on ERP projects.",
  },
  {
    icon: Building2,
    title: "Regional SI practices",
    desc: "Systems integrators widening their cloud ERP coverage.",
  },
  {
    icon: Landmark,
    title: "Advisory & alliance teams",
    desc: "Advisory practices adding a modern mid-market platform.",
  },
  {
    icon: Factory,
    title: "Industry consultancies",
    desc: "Specialists in manufacturing, distribution, retail or services.",
  },
];

const MODEL_POINTS = [
  "Bizak generates inbound demand and routes qualified leads to certified partners.",
  "Every routed lead arrives scoped, sized and tagged by industry, so you can plan capacity.",
  "Implementation and services revenue stays yours, on the first project and every expansion.",
];

const CLAUSES = [
  {
    n: "01",
    icon: GraduationCap,
    title: "Architect Academy",
    body: "Exam-graded certification tracks for consultants, solution architects and implementation leads. Role-relevant, renewed annually, with the first seats free.",
  },
  {
    n: "02",
    icon: Wrench,
    title: "Migration tooling",
    body: "Bizak Migrate ingests QuickBooks, Tally, NetSuite, SAP B1 and Excel sources. Pre-built field mappings and dry-run validators ship in the box.",
  },
  {
    n: "03",
    icon: Workflow,
    title: "Configuration kits",
    body: "Industry templates for chart of accounts, document workflows and approval matrices. Configure a rollout in days, not weeks.",
  },
  {
    n: "04",
    icon: ShieldCheck,
    title: "Hypercare & escalation",
    body: "A direct line into Bizak engineering for go-live week. Severity-one response under one hour, around the clock.",
  },
];

const STEPS = [
  {
    n: "1",
    icon: Send,
    title: "Apply",
    body: "Submit your firm profile and delivery focus. A regional partner manager replies within two business days.",
  },
  {
    n: "2",
    icon: GraduationCap,
    title: "Certify",
    body: "Your consultants run the Architect Academy tracks, demo environments, and their first configuration kits. About two weeks.",
  },
  {
    n: "3",
    icon: Workflow,
    title: "Implement",
    body: "Take a routed lead through discovery, migration and go-live, with a Bizak architect on call.",
  },
  {
    n: "4",
    icon: TrendingUp,
    title: "Scale",
    body: "Add consultants, certifications and industries. Your services book grows with every rollout you ship.",
  },
];

const FAQS = [
  {
    q: "Does the certification cost anything?",
    a: "Your first seats on the Architect Academy tracks are free. Consultant Foundations is required for every consultant; Solution Architect and Implementation Lead are role-based. Every track is exam-graded and renewed annually.",
  },
  {
    q: "How are leads routed to my practice?",
    a: "Bizak qualifies inbound demand and routes it to certified partners by region, industry and capacity. Every routed lead arrives with scope and timeline, so you can plan delivery before you accept it.",
  },
  {
    q: "Do I keep the services revenue?",
    a: "Yes. Implementation, migration and configuration revenue is entirely yours, on the first project and on every expansion the customer runs on Bizak afterwards.",
  },
  {
    q: "What support do I get at go-live?",
    a: "Hypercare gives you a direct line into Bizak engineering for go-live week, with severity-one response under one hour, around the clock. Conflicts and escalations are mediated by partner ops within one business day.",
  },
];

// ════════════════════════════════════════════════════════════════════════════
// [HERO] implementation track + certification credential
// ════════════════════════════════════════════════════════════════════════════

function HeroSection() {
  return (
    <Section tone="b" pad="hero">
      <Container>
        <div className="flex flex-col items-center text-center">
          <BadgeGreen style={{ marginBottom: 28 }}>Bizak Consultant Program</BadgeGreen>

          <Heading level={2} className="max-w-[820px]" style={{ marginBottom: 36 }}>
            Deliver Bizak to your clients,{" "}
            <Heading.Muted>
              and build a certified implementation practice around it.
            </Heading.Muted>
          </Heading>

          <PillGroup>
            <Pill variant="dark" withArrowUpRight href="#join">
              Become a Partner
            </Pill>
            <Pill variant="light" href="/contact">
              Talk to Sales
            </Pill>
          </PillGroup>
        </div>

        <div className="bz-hero-visual">
          <ImplementationHero />
        </div>
      </Container>
    </Section>
  );
}

// Two-card composition: a live implementation track (the work you deliver)
// paired with the certification credential (how your consultants qualify).
function ImplementationHero() {
  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
      {/* Implementation track the rollout your practice runs */}
      <div className="overflow-hidden rounded-bz-2xl border border-bz-line bg-bz-surface lg:col-span-7">
        <div className="flex flex-col p-6 sm:p-8">
          <div className="flex items-center justify-between gap-3">
            <span className="flex size-12 items-center justify-center rounded-bz-pill bg-bz-olive">
              <Route size={22} strokeWidth={1.6} className="text-bz-fire" />
            </span>
            <StatusChip variant="posted">On track</StatusChip>
          </div>

          <h3 className="mt-5 text-[19px] font-medium tracking-tight text-bz-text sm:text-[21px]">
            Northwind Mfg rollout
          </h3>
          <p className="mt-1.5 text-[13px] text-bz-text-muted">
            A five-phase implementation, delivered by your practice.
          </p>

          <div className="mt-7 border-t border-bz-line-soft pt-7">
            {PHASES.map((p, i) => (
              <PhaseRow key={p.name} phase={p} last={i === PHASES.length - 1} />
            ))}
          </div>
        </div>
      </div>

      {/* Certification credential identical for every certified consultant.
          Hidden on mobile the implementation track alone carries the hero there. */}
      <div className="hidden rounded-bz-2xl border border-bz-line bg-bz-surface p-6 sm:p-8 lg:col-span-5 lg:flex lg:flex-col">
        <div className="flex items-center justify-between gap-3">
          <span className="flex size-12 items-center justify-center rounded-bz-pill bg-bz-olive">
            <GraduationCap size={22} strokeWidth={1.6} className="text-bz-fire" />
          </span>
          <StatusChip variant="posted">Certified</StatusChip>
        </div>

        <h3 className="mt-5 text-[19px] font-medium tracking-tight text-bz-text sm:text-[21px]">
          Bizak Solution Architect
        </h3>
        <p className="mt-2.5 text-[13.5px] leading-[1.65] text-bz-text-muted">
          Exam-graded certification from the Bizak Architect Academy. Renewed
          every year, with the first seats free for your consultants.
        </p>

        <div className="mt-auto pt-7">
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-bz-xl border border-bz-line-soft bg-bz-line-soft">
            {CERT_FIELDS.map((f) => (
              <div key={f.label} className="flex flex-col bg-bz-surface p-4">
                <span className="text-[10.5px] font-medium uppercase tracking-[0.12em] text-bz-text-soft">
                  {f.label}
                </span>
                <span className="mt-2 text-[13.5px] font-medium leading-snug text-bz-text">
                  {f.value}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-5 text-[11.5px] text-bz-text-soft">
            Issued by the Bizak Architect Academy.
          </p>
        </div>
      </div>
    </div>
  );
}

// One row of the implementation track: status node + connector + copy.
function PhaseRow({
  phase,
  last,
}: {
  phase: (typeof PHASES)[number];
  last: boolean;
}) {
  const { name, detail, status } = phase;
  const label =
    status === "done" ? "Complete" : status === "active" ? "In progress" : "Queued";

  return (
    <div className={`relative flex gap-4 ${last ? "" : "pb-6"}`}>
      {!last && (
        <span
          aria-hidden
          className="absolute bottom-0 left-[14px] top-[30px] w-px bg-bz-line"
        />
      )}

      <span
        className={`relative z-10 flex size-[30px] shrink-0 items-center justify-center rounded-bz-pill ${
          status === "done"
            ? "bg-bz-olive"
            : status === "active"
              ? "bg-bz-fire"
              : "border border-bz-line bg-bz-surface"
        }`}
      >
        {status === "done" && (
          <Check size={15} strokeWidth={2.4} className="text-bz-fire" />
        )}
        {status === "active" && (
          <span className="size-2.5 rounded-bz-pill bg-bz-olive" />
        )}
        {status === "queued" && (
          <span className="size-1.5 rounded-bz-pill bg-bz-line" />
        )}
      </span>

      <div className="flex flex-1 flex-col">
        <div className="flex items-baseline justify-between gap-3">
          <h4 className="text-[14.5px] font-medium text-bz-text">{name}</h4>
          <span
            className={`shrink-0 text-[11px] font-medium uppercase tracking-[0.08em] ${
              status === "active" ? "text-bz-olive" : "text-bz-text-soft"
            }`}
          >
            {label}
          </span>
        </div>
        <p className="mt-1 text-[13px] leading-[1.6] text-bz-text-muted">
          {detail}
        </p>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// [01] WHO BUILDS ON BIZAK
// ════════════════════════════════════════════════════════════════════════════

function WhoBuildsSection() {
  return (
    <Section tone="a">
      <Container>
        <SectionHead
          index="01"
          label="Who it's for"
          title={
            <>
              Built for practices that{" "}
              <Heading.Muted>own delivery.</Heading.Muted>
            </>
          }
          description="Running project-based delivery with named consultants? Bizak is the modern cloud platform your team implements, plus the pipeline and tooling to grow the practice around it."
          titleMaxWidth={680}
        />

        <BentoGrid cols={4}>
          {FIRMS.map(({ icon: Icon, title, desc }) => (
            <Bento key={title} tone="paper" hover>
              <span className="mb-5 flex size-11 items-center justify-center rounded-bz-pill bg-bz-paper-warm text-bz-olive">
                <Icon size={19} strokeWidth={1.6} />
              </span>
              <h3 className="bz-bento-title">{title}</h3>
              <Bento.Desc>{desc}</Bento.Desc>
            </Bento>
          ))}
        </BentoGrid>
      </Container>
    </Section>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// [02] THE SOURCING MODEL Bizak fills the funnel, you deliver
// ════════════════════════════════════════════════════════════════════════════

function SourcingSection() {
  return (
    <Section tone="dark">
      <Container>
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <SectionHead
              index="02"
              label="The sourcing model"
              tone="dark"
              title={
                <>
                  Spend your time delivering,{" "}
                  <Heading.Muted>not chasing the next project.</Heading.Muted>
                </>
              }
              description="You don't cold-prospect for work. Bizak qualifies the demand and routes it, so your practice spends its hours on the rollout."
              spacing="none"
            />
            <ul className="mt-8 flex flex-col gap-3.5">
              {MODEL_POINTS.map((p) => (
                <li
                  key={p}
                  className="flex items-start gap-3 text-[13.5px] leading-[1.6] text-white/[0.8]"
                >
                  <span className="mt-[7px] size-1.5 shrink-0 rounded-bz-pill bg-bz-fire" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>

          <DemandFunnel />
        </div>
      </Container>
    </Section>
  );
}

// Conceptual visual demand narrows as Bizak qualifies and routes it.
// No hard figures: each bar is one stage of the funnel reaching your practice.
function DemandFunnel() {
  const stages = [
    { label: "Bizak-sourced demand",     width: "100%", sourced: true  },
    { label: "Matched to your practice", width: "82%",  sourced: false },
    { label: "Accepted by your team",    width: "60%",  sourced: false },
    { label: "In delivery",              width: "38%",  sourced: false },
  ];
  return (
    <div className="rounded-bz-2xl bg-bz-olive-soft p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-white/[0.5]">
          Where your projects come from
        </span>
        <div className="flex items-center gap-4 text-[11px] text-white/[0.62]">
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-bz-pill bg-bz-fire" />
            Bizak-sourced
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-bz-pill bg-bz-leaf-deep" />
            Your delivery
          </span>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3">
        {stages.map((s) => (
          <div key={s.label} className="flex flex-col gap-1.5">
            <span className="text-[12px] text-white/[0.7]">{s.label}</span>
            <div
              className={`h-7 rounded-[4px] ${
                s.sourced ? "bg-bz-fire" : "bg-bz-leaf-deep"
              }`}
              style={{ width: s.width }}
            />
          </div>
        ))}
      </div>

      <div className="mt-7 h-px bg-white/[0.12]" />

      <p className="mt-4 text-[12.5px] leading-[1.6] text-white/[0.62]">
        Each stage narrows as Bizak qualifies and routes. What reaches your
        practice is scoped, sized and ready to deliver.
      </p>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// [03] THE PROGRAM what every certified partner gets
// ════════════════════════════════════════════════════════════════════════════

function ProgramSection() {
  return (
    <Section tone="b">
      <Container width="narrow">
        <SectionHead
          index="03"
          label="The program"
          title={
            <>
              A delivery practice with the{" "}
              <Heading.Muted>tooling already built.</Heading.Muted>
            </>
          }
          description="Not a certificate and a partner badge. It's the operating system for running a real implementation practice."
          titleMaxWidth={680}
        />

        <div className="overflow-hidden rounded-bz-2xl border border-bz-line-soft bg-bz-paper">
          {CLAUSES.map(({ n, icon: Icon, title, body }, i) => (
            <div
              key={n}
              className={`grid grid-cols-[auto_1fr] items-start gap-x-4 p-6 sm:gap-x-5 sm:p-8 ${
                i !== 0 ? "border-t border-bz-line-soft" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-[12px] font-medium tabular-nums text-bz-text-soft">
                  {n}
                </span>
                <span className="flex size-10 items-center justify-center rounded-bz-pill bg-bz-paper-warm text-bz-olive">
                  <Icon size={18} strokeWidth={1.6} />
                </span>
              </div>
              <div>
                <h3 className="text-[16px] font-medium text-bz-text">{title}</h3>
                <p className="mt-2.5 max-w-[600px] text-[14px] leading-[1.65] text-bz-text-muted">
                  {body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// [04] GET STARTED the path to becoming a partner
// ════════════════════════════════════════════════════════════════════════════

function JoinSection() {
  return (
    <Section tone="a" id="join">
      <Container>
        <SectionHead
          index="04"
          label="Get started"
          title={
            <>
              From application{" "}
              <Heading.Muted>to your first go-live.</Heading.Muted>
            </>
          }
          description="Most partners are certified, tooled and delivering their first Bizak rollout inside a single quarter."
          titleMaxWidth={680}
        />

        <div className="grid grid-cols-1 gap-8 md:grid-cols-4 md:gap-6">
          {STEPS.map(({ n, icon: Icon, title, body }, i) => (
            <div key={n} className="relative flex gap-4 md:block">
              {i < STEPS.length - 1 && (
                <span
                  aria-hidden
                  className="absolute left-12 -right-6 top-6 hidden h-px bg-bz-line md:block"
                />
              )}
              <span className="relative z-10 flex size-12 shrink-0 items-center justify-center rounded-bz-pill border border-bz-line bg-bz-section-a text-bz-olive md:mb-6">
                <Icon size={18} strokeWidth={1.6} />
              </span>
              <div>
                <div className="text-[11px] font-medium uppercase tracking-[0.1em] text-bz-text-soft">
                  Step {n}
                </div>
                <h3 className="mt-1.5 text-[15.5px] font-medium text-bz-text">
                  {title}
                </h3>
                <p className="mt-2 text-[13.5px] leading-[1.6] text-bz-text-muted">
                  {body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// [05] QUESTIONS
// ════════════════════════════════════════════════════════════════════════════

function FaqSection() {
  return (
    <Section tone="b">
      <Container>
        <div className="grid grid-cols-1 items-start gap-10 md:grid-cols-[1fr_1.3fr]">
          {/* Dark intro panel */}
          <div className="relative flex min-h-[320px] flex-col justify-between overflow-hidden rounded-bz-2xl bg-bz-olive p-8 text-bz-text-on-dark">
            <DotGrid tone="dark" />
            <div className="relative">
              <SectionHead
                index="05"
                label="FAQ"
                tone="dark"
                title={
                  <>
                    Partner questions,{" "}
                    <Heading.Muted>answered.</Heading.Muted>
                  </>
                }
                spacing="none"
              />
            </div>
            <PillGroup className="relative mt-8">
              <Pill variant="accent" href="#join" withArrowUpRight>
                Become a Partner
              </Pill>
              <Pill variant="ghostDark" href="/contact">
                Talk to Sales
              </Pill>
            </PillGroup>
          </div>

          {/* Accordion */}
          <Accordion defaultOpen={null}>
            {FAQS.map((f) => (
              <Accordion.Item key={f.q} question={f.q}>
                {f.a}
              </Accordion.Item>
            ))}
          </Accordion>
        </div>
      </Container>
    </Section>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PAGE
// ════════════════════════════════════════════════════════════════════════════

export function ConsultantsPage() {
  return (
    <main>
      <HeroSection />
      <WhoBuildsSection />
      <SourcingSection />
      <ProgramSection />
      <JoinSection />
      <FaqSection />
    </main>
  );
}
