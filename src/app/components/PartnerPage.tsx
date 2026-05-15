import { useState } from "react";
import type { ChangeEvent, FormEvent, ReactNode } from "react";
import { CheckCircle2, Handshake, Plug, UserCheck } from "lucide-react";
import {
  Accordion,
  BadgeGreen,
  Container,
  DotGrid,
  Eyebrow,
  Heading,
  Pill,
  PillGroup,
  Section,
  SectionHead,
  StatusChip,
  StripeBar,
  Tick,
} from "./bz";

// ════════════════════════════════════════════════════════════════════════════
// CONTENT DATA
// ════════════════════════════════════════════════════════════════════════════

// Initials shown in the hero's overlapping-avatar social-proof cluster.
const AVATARS = ["AS", "NB", "VO", "PB"] as const;

// Headline metrics on the hero's partner-portal preview panel.
const PORTAL_METRICS = [
  { label: "Commission YTD",   value: "$284,600", trend: "+18% QoQ" },
  { label: "Deals registered", value: "24",       trend: null },
] as const;

// Deal-pipeline rows on the partner-portal preview panel. Only "Closing"
// gets the bright pistachio chip; the rest stay neutral so one item leads.
const DEALS = [
  { initials: "AF", client: "Atlas Foods Group", stage: "Closing",     variant: "live"    as const, value: "$42,000" },
  { initials: "VR", client: "Vela Retail Co.",   stage: "Negotiation", variant: "neutral" as const, value: "$28,500" },
  { initials: "OL", client: "Orbit Labs",        stage: "Demo",        variant: "neutral" as const, value: "$16,200" },
] as const;

const STEPS = [
  { n: "1", title: "Review",         desc: "We read every application within five business days." },
  { n: "2", title: "Discovery call", desc: "A 30-minute working session on fit, territory and focus." },
  { n: "3", title: "Onboarding",     desc: "Sandbox access, certification, and your co-branded sales kit." },
] as const;

const REASSURANCE = [
  "Free to apply, and free to certify your first architects.",
  "No exclusivity required. Many partners carry adjacent platforms too.",
  "A named regional partner manager from week one.",
] as const;

const FOCUS = [
  { value: "Reseller",   icon: Handshake },
  { value: "Consultant", icon: UserCheck },
  { value: "Technology", icon: Plug },
] as const;

const REGIONS = [
  "Nepal",
  "India",
  "Bangladesh",
  "Sri Lanka",
  "Pakistan",
] as const;

const FAQS = [
  { q: "What does it cost to become a partner?",   a: "Nothing. Applying is free, and certifying your first architects is free. There are no joining fees, no annual minimums, and no purchase commitments." },
  { q: "Do I have to sell Bizak exclusively?",     a: "No. We never require exclusivity. Many partners carry adjacent platforms alongside Bizak, and we only ask that your team certifies before going to market." },
  { q: "How are partner commissions structured?",  a: "Partners earn recurring commission on every deal they register and close. Rates rise with your tier, from Certified to Premier, and payouts clear quarterly through the partner portal." },
  { q: "What support do partners get?",            a: "A named regional partner manager from week one, sandbox access for hands-on practice, certification training, and a co-branded sales kit. Premier-tier partners also get priority technical support and early roadmap access." },
] as const;

// Shared field paint warm input wells that sit on the white form card.
const inputClass =
  "h-11 w-full rounded-bz-md border border-bz-line-soft bg-bz-paper-warm px-3.5 text-[14px] " +
  "text-bz-text transition-colors placeholder:text-bz-text-soft focus:border-bz-olive " +
  "focus:bg-bz-surface focus:outline-none";

// ════════════════════════════════════════════════════════════════════════════
// [HERO] dark canvas copy + the partner-portal preview panel
// ════════════════════════════════════════════════════════════════════════════

function HeroSection() {
  return (
    <Section tone="dark" pad="hero" className="overflow-hidden">
      {/* <DotGrid tone="dark" /> */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-28 -top-32 size-[440px] rounded-bz-pill bg-bz-olive-soft/40"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-44 -left-32 size-[400px] rounded-bz-pill bg-bz-olive-soft/30"
      />

      <Container width="narrow" className="relative z-[1]">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <HeroCopy />
          {/* <PartnerPortal /> */}
        </div>
      </Container>
    </Section>
  );
}

function HeroCopy() {
  return (
    <div>
      <BadgeGreen style={{ marginBottom: 28 }}>Bizak Partner Network</BadgeGreen>

      <Heading level={2} tone="dark" style={{ marginBottom: 34 }}>
        Become a Bizak partner.{" "}
        <Heading.Muted>
          Apply in five minutes, hear back within five business days.
        </Heading.Muted>
      </Heading>

      {/* Social-proof graphic overlapping firm initials + an open slot */}
      <div className="flex items-center gap-3.5">
        <div className="flex -space-x-2.5">
          {AVATARS.map((a) => (
            <span
              key={a}
              className="flex size-9 items-center justify-center rounded-bz-pill border-2 border-bz-olive bg-bz-olive-soft text-[11px] font-semibold text-bz-text-on-dark"
            >
              {a}
            </span>
          ))}
          <span className="flex size-9 items-center justify-center rounded-bz-pill border-2 border-bz-olive bg-bz-fire text-[15px] font-medium text-bz-olive">
            +
          </span>
        </div>
        <p className="text-[13px] leading-[1.5] text-white/[0.6]">
          Join the{" "}
          <span className="font-medium text-bz-text-on-dark">firms</span>{" "}
          partnering with Bizak across South Asia.
        </p>
      </div>
    </div>
  );
}

// The hero's right-hand visual a preview of the partner portal each
// accepted firm runs on: live commission, registered deals, tier progress.
// Reads as the real Bizak product, not abstract geometry.
function PartnerPortal() {
  return (
    <div className="relative mx-auto w-full max-w-[440px] lg:max-w-none">
      {/* Floating payout accent desktop only, where the 2-col layout has room */}
      <div className="absolute -right-4 -top-4 z-[2] hidden items-center gap-2 rounded-bz-md border border-white/10 bg-bz-olive px-3 py-2 shadow-[0_18px_38px_-22px_rgba(0,0,0,0.85)] lg:flex">
        <span className="size-1.5 rounded-bz-pill bg-bz-fire" />
        <span className="text-[11px] text-white/65">Q2 payout cleared</span>
        <span className="text-[11px] font-medium tabular-nums text-bz-leaf">
          $61,200
        </span>
      </div>

      <div className="overflow-hidden rounded-bz-2xl border border-white/[0.12] bg-bz-olive-soft shadow-[0_34px_72px_-44px_rgba(0,0,0,0.85)]">
        {/* Header partner identity + current tier */}
        <div className="flex items-center gap-3.5 px-5 py-5 sm:px-6">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-bz-pill bg-bz-fire text-[13px] font-semibold text-bz-olive">
            NA
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[14.5px] font-medium text-bz-text-on-dark">
              Northwind Advisory
            </p>
            <p className="mt-0.5 text-[12px] text-white/55">
              Bizak partner · South Asia
            </p>
          </div>
          <span className="shrink-0 rounded-bz-sm border border-bz-fire/30 bg-bz-fire/10 px-2 py-1 text-[9.5px] font-semibold uppercase tracking-[0.07em] text-bz-fire">
            Certified
          </span>
        </div>

        {/* Metric strip two headline numbers */}
        <div className="grid grid-cols-2 border-y border-white/[0.08]">
          {PORTAL_METRICS.map((m, i) => (
            <div
              key={m.label}
              className={
                "px-5 py-4 sm:px-6" +
                (i === 1 ? " border-l border-white/[0.08]" : "")
              }
            >
              <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-white/45">
                {m.label}
              </p>
              <div className="mt-1.5 flex items-baseline gap-2">
                <span className="text-[21px] font-medium tabular-nums text-bz-text-on-dark">
                  {m.value}
                </span>
                {m.trend && (
                  <span className="text-[10.5px] font-medium text-bz-fire">
                    {m.trend}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Deal pipeline registered deals carried through the portal */}
        <div className="px-5 py-5 sm:px-6">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[12.5px] font-medium text-bz-text-on-dark">
              Deal pipeline
            </p>
            <span className="text-[11px] text-white/50">3 open</span>
          </div>
          <div className="flex flex-col gap-2">
            {DEALS.map((d) => (
              <div
                key={d.client}
                className="flex items-center gap-2.5 rounded-bz-md border border-white/[0.06] bg-white/[0.03] px-3 py-2.5"
              >
                <span className="flex size-7 shrink-0 items-center justify-center rounded-bz-sm bg-white/[0.07] text-[10px] font-semibold text-bz-leaf">
                  {d.initials}
                </span>
                <span className="min-w-0 flex-1 truncate text-[12.5px] text-bz-text-on-dark">
                  {d.client}
                </span>
                <StatusChip variant={d.variant}>{d.stage}</StatusChip>
                <span className="w-[58px] shrink-0 text-right text-[12px] font-medium tabular-nums text-bz-leaf">
                  {d.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Tier progress the partner's path to the next tier */}
        <div className="border-t border-white/[0.08] px-5 py-4 sm:px-6">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[12px] text-white/65">Path to Premier tier</p>
            <span className="text-[12px] font-medium tabular-nums text-bz-fire">
              68%
            </span>
          </div>
          <StripeBar pct={68} tone="dark" />
          <div className="mt-2 flex items-center justify-between text-[10px] uppercase tracking-[0.06em] text-white/40">
            <span>Certified</span>
            <span>Premier</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// [APPLICATION] the form, with an onboarding rail beside it
// ════════════════════════════════════════════════════════════════════════════

function ApplicationSection() {
  return (
    <Section tone="a" id="apply" pad="tight">
      <Container width="narrow">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[5fr_7fr] lg:items-start lg:gap-14">
          {/* Onboarding rail desktop-left, drops below the form on mobile */}
          <div className="order-2 lg:order-1">
            <Eyebrow>After you apply</Eyebrow>
            <h2 className="mt-4 text-[21px] font-medium leading-[1.3] tracking-tight text-bz-text">
              A clear path to becoming a partner.
            </h2>

            <ol className="mt-8 flex flex-col gap-6">
              {STEPS.map((s) => (
                <li key={s.n} className="flex gap-3.5">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-bz-pill bg-bz-paper-warm text-[11.5px] font-semibold tabular-nums text-bz-olive">
                    {s.n}
                  </span>
                  <div>
                    <p className="text-[14px] font-medium text-bz-text">{s.title}</p>
                    <p className="mt-1 text-[13px] leading-[1.6] text-bz-text-muted">
                      {s.desc}
                    </p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="mt-8 h-px bg-bz-line-soft" />

            <ul className="mt-8 flex flex-col gap-3">
              {REASSURANCE.map((r) => (
                <li key={r} className="flex items-start gap-2.5">
                  <Tick size="sm" className="mt-[3px]" />
                  <span className="text-[13.5px] leading-[1.55] text-bz-text">{r}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Form card */}
          <ApplicationForm />
        </div>
      </Container>
    </Section>
  );
}

function ApplicationForm() {
  const [form, setForm] = useState({
    name: "",
    org: "",
    email: "",
    region: REGIONS[0] as string,
    focus: "Reseller",
  });
  const [submitted, setSubmitted] = useState(false);

  const set =
    (k: keyof typeof form) =>
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="order-1 overflow-hidden rounded-bz-2xl border border-bz-line bg-bz-surface shadow-[0_28px_60px_-38px_rgba(20,30,20,0.30)] lg:order-2"
    >
      <div className="flex items-center justify-between gap-3 border-b border-bz-line-soft px-6 py-5 sm:px-7">
        <div>
          <h3 className="text-[17px] font-medium tracking-tight text-bz-text">
            Partner application
          </h3>
          <p className="mt-0.5 text-[12.5px] text-bz-text-muted">
            Five short fields, about five minutes.
          </p>
        </div>
        <StatusChip variant="posted">2026 cohort</StatusChip>
      </div>

      {submitted ? (
        <SuccessPanel />
      ) : (
        <div className="flex flex-col gap-5 px-6 py-7 sm:px-7">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="Full name">
              <input
                type="text"
                required
                value={form.name}
                onChange={set("name")}
                placeholder="Your full name"
                className={inputClass}
              />
            </Field>
            <Field label="Organization">
              <input
                type="text"
                required
                value={form.org}
                onChange={set("org")}
                placeholder="Firm's legal name"
                className={inputClass}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="Work email">
              <input
                type="email"
                required
                value={form.email}
                onChange={set("email")}
                placeholder="you@firm.com"
                className={inputClass}
              />
            </Field>
            <Field label="Region">
              <select
                value={form.region}
                onChange={set("region")}
                className={inputClass}
              >
                {REGIONS.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </Field>
          </div>

          {/* Partnership focus segmented icon selector */}
          <div className="flex flex-col gap-2">
            <span className="text-[12.5px] font-medium text-bz-text">
              Partnership focus
            </span>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
              {FOCUS.map(({ value, icon: Icon }) => {
                const active = form.focus === value;
                return (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setForm((p) => ({ ...p, focus: value }))}
                    className={[
                      "flex items-center gap-2.5 rounded-bz-md border px-3 py-3 text-left transition-colors",
                      active
                        ? "border-bz-olive bg-bz-olive text-bz-text-on-dark"
                        : "border-bz-line-soft bg-bz-paper-warm text-bz-text hover:border-bz-line",
                    ].join(" ")}
                  >
                    <Icon
                      size={16}
                      strokeWidth={1.7}
                      className={active ? "text-bz-fire" : "text-bz-olive"}
                    />
                    <span className="text-[12.5px] font-medium">{value}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <Pill
            variant="dark"
            withArrow
            type="submit"
            className="mt-1 w-full justify-center"
          >
            Submit application
          </Pill>

          <p className="text-[12px] leading-[1.6] text-bz-text-muted">
            Free to apply, no exclusivity required. We respond within five business
            days.
          </p>
        </div>
      )}
    </form>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[12.5px] font-medium text-bz-text">{label}</span>
      {children}
    </label>
  );
}

function SuccessPanel() {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center sm:px-7">
      <span className="flex size-14 items-center justify-center rounded-bz-pill bg-bz-olive text-bz-fire">
        <CheckCircle2 size={26} strokeWidth={1.8} />
      </span>
      <h3 className="mt-6 text-[19px] font-medium tracking-tight text-bz-text">
        Application received
      </h3>
      <p className="mt-2.5 max-w-[380px] text-[14px] leading-[1.65] text-bz-text-muted">
        Thanks for applying. Our partnerships team will review your firm and respond
        within five business days.
      </p>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// [FAQ] dark intro panel + accordion
// ════════════════════════════════════════════════════════════════════════════

function FAQSection() {
  return (
    <Section tone="b">
      <Container>
        <div className="grid grid-cols-1 items-start gap-10 md:grid-cols-[1fr_1.3fr]">
          {/* Dark intro panel */}
          <div className="relative flex min-h-[320px] flex-col justify-between overflow-hidden rounded-bz-2xl bg-bz-olive p-8 text-bz-text-on-dark">
            <DotGrid tone="dark" />
            <div className="relative">
              <SectionHead
                label="FAQ"
                tone="dark"
                title={<>Partner program <Heading.Muted>questions.</Heading.Muted></>}
                spacing="none"
              />
            </div>
            <PillGroup className="relative mt-8">
              <Pill variant="accent" href="#apply" withArrow>
                Apply now
              </Pill>
              <Pill variant="ghostDark" href="/contact" withArrow>
                Talk to Sales
              </Pill>
            </PillGroup>
          </div>

          {/* Accordion */}
          <Accordion defaultOpen={null}>
            {FAQS.map((item, i) => (
              <Accordion.Item key={i} question={item.q}>
                {item.a}
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

export function PartnerPage() {
  return (
    <main>
      <HeroSection />
      <ApplicationSection />
      <FAQSection />
    </main>
  );
}
