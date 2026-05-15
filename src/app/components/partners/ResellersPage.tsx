import {
  BadgeCheck,
  Briefcase,
  Building2,
  Factory,
  Compass,
  Map,
  Megaphone,
  ShieldCheck,
  Repeat,
  Send,
  GraduationCap,
  Handshake,
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

const CREDENTIAL = [
  { label: "Program",    value: "One, for every partner" },
  { label: "Territory",  value: "Protected, and yours" },
  { label: "Commission", value: "Recurring, always" },
  { label: "Support",    value: "Co-sell + partner manager" },
];

const FIRMS = [
  {
    icon: Briefcase,
    title: "Value-added resellers",
    desc: "VARs with an existing SMB or mid-market book, ready for a modern ERP.",
  },
  {
    icon: Building2,
    title: "Regional ERP firms",
    desc: "Add a cloud platform alongside the legacy on-prem stacks you sell today.",
  },
  {
    icon: Factory,
    title: "Industry boutiques",
    desc: "Specialists in manufacturing, distribution, retail or professional services.",
  },
  {
    icon: Compass,
    title: "Channel & expansion teams",
    desc: "Channel teams moving into a new vertical or a new geography.",
  },
];

const MODEL_POINTS = [
  "One program and one commission rate, the same for every reseller.",
  "Margin lands on the first invoice, and on every renewal after it.",
  "Last year's customers carry forward, so your book never restarts at zero.",
];

const CLAUSES = [
  {
    n: "01",
    icon: Map,
    title: "Protected territory",
    body: "A defined geographic and segment scope. Inbound leads route to the local reseller first, and everything outside it is open to co-sell.",
  },
  {
    n: "02",
    icon: Megaphone,
    title: "Co-branded marketing",
    body: "Localised landing pages, campaign budget through the Market Development Fund, and event support for regional summits.",
  },
  {
    n: "03",
    icon: ShieldCheck,
    title: "Deal registration",
    body: "Register an opportunity to lock pricing and ninety days of protection. Conflicts are mediated by partner ops within one business day.",
  },
  {
    n: "04",
    icon: Repeat,
    title: "Recurring commissions",
    body: "Earn on the first booking and every renewal after it. Margin compounds, so your year-three book is materially larger than year one.",
  },
];

const STEPS = [
  {
    n: "1",
    icon: Send,
    title: "Apply",
    body: "Submit your firm profile and target market. A regional partner manager replies within two business days.",
  },
  {
    n: "2",
    icon: GraduationCap,
    title: "Onboard",
    body: "Sales and product enablement, demo environments, and your first co-branded assets. About two weeks.",
  },
  {
    n: "3",
    icon: Handshake,
    title: "Register & co-sell",
    body: "Lock your territory, register opportunities, and close your first deals with a Bizak rep on the line.",
  },
  {
    n: "4",
    icon: TrendingUp,
    title: "Scale",
    body: "Recurring commission compounds as your book renews, year after year. Every reseller earns on the same terms.",
  },
];

const FAQS = [
  {
    q: "Do larger resellers get better terms?",
    a: "No. Every Bizak reseller works from the same agreement and earns on the same terms, whether you are a solo VAR or a regional firm. There are no tiers to climb and no volume gates. The full commercial schedule is set out in your partner agreement.",
  },
  {
    q: "What does deal registration protect?",
    a: "A registered opportunity locks your pricing and gives you ninety days of exclusivity on the account. If two partners register the same customer, partner ops mediates within one business day.",
  },
  {
    q: "Do I keep earning after the first sale?",
    a: "Yes. Reseller commission is recurring. You earn margin on every renewal for as long as the customer stays on Bizak, not only on the initial booking.",
  },
  {
    q: "Can I sell outside my territory?",
    a: "Your territory gets first routing on every inbound lead. Outside it, deals stay open. You can co-sell them, with a Bizak rep helping you close.",
  },
];

// ════════════════════════════════════════════════════════════════════════════
// [HERO] reseller credential card
// ════════════════════════════════════════════════════════════════════════════

function HeroSection() {
  return (
    <Section tone="b" pad="hero">
      <Container>
        <div className="flex flex-col items-center text-center">
          <BadgeGreen style={{ marginBottom: 28 }}>Bizak Reseller Program</BadgeGreen>

          <Heading level={2} className="max-w-[820px]" style={{ marginBottom: 36 }}>
            Sell Bizak in your market,{" "}
            <Heading.Muted>
              and earn recurring margin for the life of every customer.
            </Heading.Muted>
          </Heading>

          <PillGroup>
            <Pill variant="dark" withArrowUpRight href="#join">
              Become a Reseller
            </Pill>
            <Pill variant="light" href="/contact">
              Talk to Sales
            </Pill>
          </PillGroup>
        </div>

        <div className="bz-hero-visual">
          <ResellerCredential />
        </div>
      </Container>
    </Section>
  );
}

function ResellerCredential() {
  return (
    <div className="overflow-hidden rounded-bz-2xl border border-bz-line bg-bz-surface">
      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* Identity face the credential itself */}
        <div className="flex flex-col p-6 sm:p-8">
          <div className="flex items-center justify-between gap-3">
            <span className="flex size-14 items-center justify-center rounded-bz-pill bg-bz-olive sm:size-16">
              <BadgeCheck size={28} strokeWidth={1.6} className="text-bz-fire" />
            </span>
            <StatusChip variant="posted">Applications open</StatusChip>
          </div>

          <h3 className="mt-6 text-[21px] font-medium tracking-tight text-bz-text sm:text-[23px]">
            Bizak Authorized Reseller
          </h3>
          <p className="mt-2.5 text-[14px] leading-[1.65] text-bz-text-muted">
            One program, equal terms for every partner. The full commercial schedule
            lives in your partner agreement.
          </p>

          <p className="mt-auto pt-7 text-[11.5px] text-bz-text-soft">
            Issued by the Bizak Reseller Network.
          </p>
        </div>

        {/* Standard terms credential fields, identical for all.
            Hidden on mobile the identity face alone carries the hero there. */}
        <div className="hidden gap-px bg-bz-line-soft lg:grid lg:grid-cols-2 lg:border-l lg:border-bz-line-soft">
          {CREDENTIAL.map((f) => (
            <div key={f.label} className="flex flex-col bg-bz-surface p-6 sm:p-7">
              <span className="text-[10.5px] font-medium uppercase tracking-[0.12em] text-bz-text-soft">
                {f.label}
              </span>
              <span className="mt-2 text-[14.5px] font-medium leading-snug text-bz-text">
                {f.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// [01] WHO RESELLS BIZAK
// ════════════════════════════════════════════════════════════════════════════

function WhoResellsSection() {
  return (
    <Section tone="a">
      <Container>
        <SectionHead
          index="01"
          label="Who it's for"
          title={
            <>
              Built for firms that already{" "}
              <Heading.Muted>own a market.</Heading.Muted>
            </>
          }
          description="Carrying a software portfolio today? Bizak is the modern cloud platform you hand customers who have outgrown spreadsheets, or who want off a legacy ERP."
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
// [02] THE RESELLER MODEL recurring margin compounds
// ════════════════════════════════════════════════════════════════════════════

function EconomicsSection() {
  return (
    <Section tone="dark">
      <Container>
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <SectionHead
              index="02"
              label="The reseller model"
              tone="dark"
              title={
                <>
                  Close a customer once,{" "}
                  <Heading.Muted>and earn from them for years.</Heading.Muted>
                </>
              }
              description="Reseller commission recurs. The book you build doesn't reset each year, it compounds."
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

          <CompoundingBook />
        </div>
      </Container>
    </Section>
  );
}

// Conceptual visual the renewing base accumulates year over year.
// No hard figures: each band is one cohort of customers, stacking up.
function CompoundingBook() {
  const columns = [1, 2, 3, 4];
  return (
    <div className="rounded-bz-2xl bg-bz-olive-soft p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-white/[0.5]">
          Your book of business
        </span>
        <div className="flex items-center gap-4 text-[11px] text-white/[0.62]">
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-bz-pill bg-bz-fire" />
            New
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-bz-pill bg-bz-leaf-deep" />
            Renewing
          </span>
        </div>
      </div>

      <div className="mt-8 flex items-end gap-2.5 sm:gap-4">
        {columns.map((n, ci) => (
          <div key={ci} className="flex flex-1 flex-col gap-1.5">
            {Array.from({ length: n }).map((_, bi) => (
              <div
                key={bi}
                className={`h-6 rounded-[4px] sm:h-7 ${
                  bi === 0 ? "bg-bz-fire" : "bg-bz-leaf-deep"
                }`}
              />
            ))}
          </div>
        ))}
      </div>

      <div className="mt-3 h-px bg-white/[0.12]" />

      <p className="mt-4 text-[12.5px] leading-[1.6] text-white/[0.62]">
        Each bar is another year. Earlier customers keep renewing while new ones
        stack on top, so the book only grows.
      </p>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// [03] THE PROGRAM what every reseller gets
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
              A channel program with the{" "}
              <Heading.Muted>engine already running.</Heading.Muted>
            </>
          }
          description="Not a slide deck and a discount code. It's the operating system for running a real reseller practice."
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
// [04] GET STARTED the path to becoming a reseller
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
              <Heading.Muted>to your first co-sell.</Heading.Muted>
            </>
          }
          description="Most resellers are trained, territoried and registering deals inside a single quarter."
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
                    Reseller questions,{" "}
                    <Heading.Muted>answered.</Heading.Muted>
                  </>
                }
                spacing="none"
              />
            </div>
            <PillGroup className="relative mt-8">
              <Pill variant="accent" href="#join" withArrowUpRight>
                Become a Reseller
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

export function ResellersPage() {
  return (
    <main>
      <HeroSection />
      <WhoResellsSection />
      <EconomicsSection />
      <ProgramSection />
      <JoinSection />
      <FaqSection />
    </main>
  );
}
