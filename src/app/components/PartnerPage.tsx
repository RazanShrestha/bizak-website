import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import {
  TrendingUp,
  Handshake,
  GraduationCap,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import {
  Container,
  Section,
  SectionHeading,
  Button,
  Card,
  IconBadge,
  PillBadge,
  HeroBadge,
  HeroPanel,
} from "./marketing";
import { Header } from "./Header";
import { Footer } from "./Footer";

const PROGRAM_KPIS = [
  { label: "Active partners",    val: "640+",  delta: "+22% YoY" },
  { label: "Countries covered",  val: "48",    delta: "+9 in 2025" },
  { label: "Avg. partner ARR",   val: "$2.4M", delta: "Year 2" },
  { label: "Renewal rate",       val: "94%",   delta: "3-yr cohort" },
];

const APPLICATION_PIPELINE = [
  { stage: "Submitted",    pct: 100, count: 412 },
  { stage: "In review",    pct: 64,  count: 264 },
  { stage: "Onboarding",   pct: 38,  count: 156 },
  { stage: "Certified",    pct: 22,  count: 91  },
];

const VALUE_PROPS = [
  {
    Icon: TrendingUp,
    title: "Recurring revenue, not one-off fees",
    body: "Earn margin on every renewal — not just the initial deal. Our commission stack is tiered to reward long-term customer health, not just signature.",
    tag: "Up to 35% margin",
  },
  {
    Icon: Handshake,
    title: "Co-sell with the Bizak team",
    body: "Get paired with a regional partner manager and direct access to our deal flow. Joint pursuits, shared MQLs, and named-account protection through deal registration.",
    tag: "Protected accounts",
  },
  {
    Icon: GraduationCap,
    title: "Enablement that actually lands",
    body: "Architect-tier certification, sandbox tenants, sales playbooks, and live office hours. Your first three implementations are paired with a Bizak Solution Architect.",
    tag: "Free certifications",
  },
  {
    Icon: ShieldCheck,
    title: "An ERP that's modern enough to recommend",
    body: "Open APIs, audit-by-default, multi-entity from day one. You're selling a platform that holds up technically — not legacy software wrapped in a new UI.",
    tag: "API-first",
  },
];

const JOURNEY = [
  {
    phase: "01",
    title: "Apply",
    detail: "10 min",
    desc: "Tell us about your firm, focus area, and target market. Submissions reviewed within 5 business days.",
  },
  {
    phase: "02",
    title: "Discovery call",
    detail: "30 min",
    desc: "A working session with our partnerships team — fit, territory, GTM motion, and target tier.",
  },
  {
    phase: "03",
    title: "Onboarding",
    detail: "2–3 weeks",
    desc: "Sandbox provisioning, certification kickoff, sales kit, and joint pipeline planning.",
  },
  {
    phase: "04",
    title: "Go live",
    detail: "Quarter 1",
    desc: "Lighthouse engagement with a Bizak Solution Architect. Joint launch announcement, first co-sell.",
  },
];

const FAQS = [
  {
    q: "Is there a fee to apply?",
    a: "No. The application is free, and so is certification for your first three architects. You only invest as you scale your practice.",
  },
  {
    q: "How long does review take?",
    a: "5 business days for a first response. The full onboarding window is 2–4 weeks depending on your team's availability.",
  },
  {
    q: "Do I have to be exclusive to Bizak?",
    a: "No. We expect serious partners to focus, but we don't require exclusivity. Many of our top firms also carry adjacent platforms.",
  },
  {
    q: "What does deal protection look like?",
    a: "Registered opportunities are protected for 90 days from date of registration. Our partner ops team mediates conflicts within one business day.",
  },
];

function ProgramPanel() {
  return (
    <Card tone="dark" pad="md">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-white/35">
            Program · Q2 snapshot
          </div>
          <div className="text-[18px] font-bold mt-0.5">Partner Network</div>
        </div>
        <PillBadge tone="live" dot>LIVE</PillBadge>
      </div>

      <div className="grid grid-cols-2 gap-2.5 mb-6">
        {PROGRAM_KPIS.map((k) => (
          <div
            key={k.label}
            className="bg-white/[0.04] border border-white/10 rounded-bz-md px-3.5 py-3"
          >
            <div className="text-[20px] font-bold tabular-nums">{k.val}</div>
            <div className="text-[11px] text-white/40 mt-0.5">{k.label}</div>
            <div className="text-[10px] text-bz-accent/80 mt-0.5">{k.delta}</div>
          </div>
        ))}
      </div>

      <div className="border-t border-white/10 pt-5">
        <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-white/30 mb-3.5">
          2025 Application pipeline
        </div>
        {APPLICATION_PIPELINE.map((s, i) => (
          <div key={s.stage} className={i < APPLICATION_PIPELINE.length - 1 ? "mb-3" : ""}>
            <div className="flex justify-between mb-1.5">
              <span className="text-[12.5px] font-medium text-white/70">{s.stage}</span>
              <span className="text-[12px] tabular-nums text-white/45">{s.count}</span>
            </div>
            <div className="h-1 bg-white/10 rounded-bz-pill overflow-hidden">
              <div
                className="h-full bg-bz-accent rounded-bz-pill"
                style={{ width: `${s.pct}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function HeroSection() {
  return (
    <HeroPanel
      badge={<HeroBadge tone="dark">Bizak Partner Network · Apply</HeroBadge>}
      title={
        <>
          Build a practice on the<br />
          <span className="text-bz-accent">operating system</span> of modern business.
        </>
      }
      description="Join the firms reselling, implementing, and extending Bizak ERP across 48 countries. We protect your deals, certify your team, and pay you on every renewal — not just the signature."
      actions={
        <>
          <Button variant="accent" size="lg" href="#apply" withArrow>
            Apply to the Network
          </Button>
          <Button variant="ghostDark" size="lg" href="/contact">
            Talk to Partnerships
          </Button>
        </>
      }
      stats={[
        { value: "640+",  label: "Active partners" },
        { value: "94%",   label: "3-yr renewal" },
        { value: "5 days", label: "Avg. review time" },
      ]}
      panel={<ProgramPanel />}
    />
  );
}

function ValueSection() {
  return (
    <Section tone="white">
      <Container width="narrow">
        <SectionHeading
          eyebrow="Why partner with Bizak"
          title="A program designed around practice economics."
          description="We built this for firms that take long-term ownership of their customers — not for resellers chasing one-off bookings. Everything in the program is shaped around year 2 and year 3."
          maxWidth={680}
          className="mb-14"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {VALUE_PROPS.map(({ Icon, title, body, tag }) => (
            <Card key={title} tone="soft" pad="lg" hover="lift">
              <div className="flex items-center justify-between mb-6">
                <IconBadge tone="sage" size="lg">
                  <Icon className="size-5" />
                </IconBadge>
                <PillBadge tone="sage">{tag}</PillBadge>
              </div>
              <div className="text-[20px] font-bold tracking-[-0.015em] mb-3">{title}</div>
              <p className="text-[15px] text-bz-text-muted leading-[1.7]">{body}</p>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}

function JourneySection() {
  return (
    <Section tone="dark">
      <Container width="narrow">
        <SectionHeading
          eyebrow="The path"
          eyebrowTone="accent"
          title="From application to your first co-sell, in one quarter."
          description="A predictable onboarding window, with named owners on every step. No 'partnership purgatory.'"
          tone="light"
          maxWidth={680}
          className="mb-16"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {JOURNEY.map((step, i) => (
            <Card key={step.phase} tone="dark" pad="md" hover="glow" className="relative">
              <span
                aria-hidden
                className="absolute -top-3 right-5 text-bz-accent/[0.12] font-black leading-none select-none pointer-events-none"
                style={{ fontSize: 88 }}
              >
                {step.phase}
              </span>

              <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-bz-accent">
                Phase {step.phase}
              </div>
              <div className="text-[20px] font-bold mt-1.5">{step.title}</div>
              <div className="text-[12px] text-white/40 mt-1">{step.detail}</div>

              <p className="mt-5 text-[14px] leading-[1.65] text-white/65">{step.desc}</p>

              {i < JOURNEY.length - 1 && (
                <ArrowRight
                  className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 size-4 text-white/20"
                  aria-hidden
                />
              )}
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}

function ApplicationSection() {
  const [form, setForm] = useState({
    name: "",
    org: "",
    email: "",
    region: "Asia Pacific",
    focus: "Implementation & Technical",
  });
  const [submitted, setSubmitted] = useState(false);

  const set =
    (k: string) =>
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <Section id="apply" tone="white">
      <Container width="narrow">
        <div className="grid grid-cols-1 lg:grid-cols-[5fr_7fr] gap-12 lg:gap-16 items-start">
          <div>
            <SectionHeading
              eyebrow="Apply"
              title="Tell us about your firm."
              description="Five business days to a first response. If we're a fit, you'll be talking to a regional partner manager by week two."
              maxWidth={460}
            />

            <div className="mt-10 flex flex-col gap-4">
              {[
                "Free to apply — no upfront fees",
                "First 3 certifications on us",
                "Named regional partner manager",
                "Deal protection from week 1",
              ].map((p) => (
                <div key={p} className="flex items-start gap-3">
                  <CheckCircle2 className="size-5 text-bz-sage shrink-0 mt-0.5" />
                  <span className="text-[14.5px] text-bz-text">{p}</span>
                </div>
              ))}
            </div>
          </div>

          <Card pad="lg" tone="light" className="shadow-[0_24px_64px_rgba(0,0,0,0.06)]">
            <div className="flex items-center justify-between mb-7">
              <div className="text-[18px] font-bold">Network application</div>
              <PillBadge tone="sage">2025 cohort</PillBadge>
            </div>

            {submitted ? (
              <div className="rounded-bz-md border border-bz-sage/30 bg-bz-sage/[0.06] p-6">
                <div className="flex items-center gap-2 text-bz-sage font-bold mb-1">
                  <CheckCircle2 className="size-5" /> Application received
                </div>
                <p className="text-[14px] text-bz-text-muted leading-[1.65]">
                  Our partnerships team will review and respond within 5 business
                  days. In the meantime, take a look at our <a className="text-bz-sage underline" href="/partners/portal">Partner Portal walkthrough</a>.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Principal contact">
                    <input
                      type="text"
                      placeholder="Full name"
                      value={form.name}
                      onChange={set("name")}
                      required
                      className="w-full h-11 px-4 rounded-bz-md border border-bz-border bg-bz-surface text-[14px] text-bz-text placeholder:text-bz-text-muted/60 focus:outline-none focus:border-bz-sage transition-colors"
                    />
                  </Field>
                  <Field label="Organization">
                    <input
                      type="text"
                      placeholder="Legal entity name"
                      value={form.org}
                      onChange={set("org")}
                      required
                      className="w-full h-11 px-4 rounded-bz-md border border-bz-border bg-bz-surface text-[14px] text-bz-text placeholder:text-bz-text-muted/60 focus:outline-none focus:border-bz-sage transition-colors"
                    />
                  </Field>
                </div>
                <Field label="Institutional email">
                  <input
                    type="email"
                    placeholder="name@firm.com"
                    value={form.email}
                    onChange={set("email")}
                    required
                    className="w-full h-11 px-4 rounded-bz-md border border-bz-border bg-bz-surface text-[14px] text-bz-text placeholder:text-bz-text-muted/60 focus:outline-none focus:border-bz-sage transition-colors"
                  />
                </Field>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Region">
                    <select
                      value={form.region}
                      onChange={set("region")}
                      className="w-full h-11 px-4 rounded-bz-md border border-bz-border bg-bz-surface text-[14px] text-bz-text focus:outline-none focus:border-bz-sage transition-colors"
                    >
                      <option>Asia Pacific</option>
                      <option>Europe, Middle East &amp; Africa</option>
                      <option>North America</option>
                      <option>Latin America</option>
                    </select>
                  </Field>
                  <Field label="Partnership focus">
                    <select
                      value={form.focus}
                      onChange={set("focus")}
                      className="w-full h-11 px-4 rounded-bz-md border border-bz-border bg-bz-surface text-[14px] text-bz-text focus:outline-none focus:border-bz-sage transition-colors"
                    >
                      <option>Implementation &amp; Technical</option>
                      <option>Reseller / Channel</option>
                      <option>ISV &amp; Integration</option>
                      <option>Strategic Consulting</option>
                    </select>
                  </Field>
                </div>

                <Button variant="primary" size="lg" withArrow>
                  Submit application
                </Button>
                <p className="text-[12px] text-bz-text-muted leading-[1.6]">
                  By submitting you agree to our partner program terms. We won't
                  contact you for marketing — only program-related responses.
                </p>
              </form>
            )}
          </Card>
        </div>
      </Container>
    </Section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[12px] font-bold uppercase tracking-[0.08em] text-bz-text-muted">
        {label}
      </span>
      {children}
    </label>
  );
}

function FaqSection() {
  return (
    <Section tone="light">
      <Container width="narrow">
        <SectionHeading
          eyebrow="FAQ"
          title="Common questions, answered."
          maxWidth={680}
          className="mb-12"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {FAQS.map((f) => (
            <Card key={f.q} tone="light" pad="md">
              <div className="flex items-start gap-3">
                <Sparkles className="size-4 text-bz-sage shrink-0 mt-1" />
                <div>
                  <div className="text-[16px] font-bold mb-2">{f.q}</div>
                  <p className="text-[14px] text-bz-text-muted leading-[1.7]">{f.a}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}

function ClosingCta() {
  return (
    <Section tone="dark" pad="default">
      <Container width="narrow">
        <SectionHeading
          title={<>Grow your practice<br />with Bizak.</>}
          description="The application is short and free. The conversation is the rest."
          tone="light"
          align="center"
          maxWidth={620}
        />
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Button variant="accent" size="lg" href="#apply" withArrow>
            Apply to the Network
          </Button>
          <Button variant="ghostDark" size="lg" href="/partners/portal">
            Explore the Portal
          </Button>
        </div>
      </Container>
    </Section>
  );
}

export function PartnerPage() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <Header />
      <main>
        <HeroSection />
        <ValueSection />
        <JourneySection />
        <ApplicationSection />
        <FaqSection />
        <ClosingCta />
      </main>
      <Footer />
    </div>
  );
}
