import { useState } from "react";
import type { ChangeEvent, FormEvent, ReactNode } from "react";
import { CheckCircle2, Handshake, LifeBuoy, MessagesSquare } from "lucide-react";
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
  Tick,
} from "./bz";

// ════════════════════════════════════════════════════════════════════════════
// CONTENT DATA
// ════════════════════════════════════════════════════════════════════════════

// Trust stats shown beneath the hero copy.
const HERO_STATS = [
  { value: "1 day", label: "Reply window" },
  { value: "24/7",  label: "Enterprise support" },
  { value: "South Asia", label: "Where we serve" },
] as const;

// Channels on the hero's contact-desk card each row routes to a different team.
const CHANNELS = [
  { icon: MessagesSquare, label: "Sales & demos",   desc: "Pricing, plans and live demos.",   response: "~2 hr" },
  { icon: LifeBuoy,       label: "Product support", desc: "Help with your workspace.",         response: "24/7"  },
  { icon: Handshake,      label: "Partnerships",    desc: "Resellers and tech partners.",      response: "5-day" },
] as const;

// Specialist initials shown in the contact-desk card's presence strip.
const TEAM = ["RK", "AL", "MO", "JS"] as const;

// "What happens next" steps in the form rail.
const STEPS = [
  { n: "1", title: "Routed in minutes",   desc: "Your message reaches the right specialist in sales, support or partnerships." },
  { n: "2", title: "A real reply",        desc: "A product specialist responds within one business day, usually much sooner." },
  { n: "3", title: "Tailored walkthrough", desc: "If it helps, we map a live walkthrough to how your team actually operates." },
] as const;

const REASSURANCE = [
  "You talk to product specialists, not a call centre or a chatbot.",
  "We never resell your details or drop you into a drip campaign.",
  "Already a customer? Support requests jump straight to your account team.",
] as const;

// Inquiry topic the segmented selector on the form.
const TOPICS = [
  { value: "Sales",       icon: MessagesSquare },
  { value: "Support",     icon: LifeBuoy },
  { value: "Partnership", icon: Handshake },
] as const;

const SIZES = [
  "1-25 employees",
  "26-100 employees",
  "101-500 employees",
  "500+ employees",
] as const;

const FAQS = [
  { q: "How long does an enterprise implementation take?", a: "Most implementations run 4 to 12 weeks, depending on the complexity of your data and how many modules go live at once." },
  { q: "Can we migrate data from our current legacy ERP?",  a: "Yes. Our migration engine supports almost every legacy format and database, with automated mapping tools to speed the move." },
  { q: "Is there a limit to the number of users?",          a: "No. Enterprise plans scale to unlimited users, with granular role-based access controls to keep every record secure." },
  { q: "What kind of support is included?",                 a: "Every enterprise plan includes 24/7 technical support and a dedicated account manager for ongoing strategic guidance." },
] as const;

// Shared field paint warm input wells that sit on the white form card.
const fieldClass =
  "w-full rounded-bz-md border border-bz-line-soft bg-bz-paper-warm px-3.5 text-[14px] " +
  "text-bz-text transition-colors placeholder:text-bz-text-soft focus:border-bz-olive " +
  "focus:bg-bz-surface focus:outline-none";
const inputClass = "h-11 " + fieldClass;
const textareaClass = "min-h-[128px] resize-y py-2.5 " + fieldClass;

// ════════════════════════════════════════════════════════════════════════════
// [HERO] dark canvas copy + the contact-desk card
// ════════════════════════════════════════════════════════════════════════════

function ContactHero() {
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
          <HeroIntro />
          {/* <ContactDesk /> */}
        </div>
      </Container>
    </Section>
  );
}

function HeroIntro() {
  return (
    <div>
      <BadgeGreen style={{ marginBottom: 28 }}>Get in touch</BadgeGreen>

      <Heading level={2} tone="dark" style={{ marginBottom: 18 }}>
        Talk to the Bizak team.{" "}
        <Heading.Muted>
          A specialist replies within one business day.
        </Heading.Muted>
      </Heading>

      <p className="max-w-[460px] text-[14.5px] leading-[1.65] text-white/[0.6]">
        Whether you're comparing platforms, scoping a migration, or already live on
        Bizak, there's a specialist for every question and every message gets a
        real reply.
      </p>

      {/* Trust stats */}
      <div className="mt-9 flex flex-wrap gap-x-8 gap-y-4">
        {HERO_STATS.map((s) => (
          <div key={s.label}>
            <p className="text-[21px] font-medium tabular-nums text-bz-text-on-dark">
              {s.value}
            </p>
            <p className="mt-0.5 text-[12px] text-white/50">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// The hero's right-hand visual a contact directory rendered as a Bizak-flavoured
// panel: who you can reach, how each channel routes, how fast it replies, and the
// specialists on the other end. The contact-page analogue of a product mock.
function ContactDesk() {
  return (
    <div className="relative mx-auto w-full max-w-[440px] lg:max-w-none">
      {/* Floating response-time chip desktop only, where the 2-col layout has room */}
      <div className="absolute -right-4 -top-4 z-[2] hidden items-center gap-2 rounded-bz-md border border-white/10 bg-bz-olive px-3 py-2 shadow-[0_18px_38px_-22px_rgba(0,0,0,0.85)] lg:flex">
        <span className="size-1.5 rounded-bz-pill bg-bz-fire" />
        <span className="text-[11px] text-white/65">Avg. first reply</span>
        <span className="text-[11px] font-medium tabular-nums text-bz-leaf">
          1h 52m
        </span>
      </div>

      <div className="overflow-hidden rounded-bz-2xl border border-white/[0.12] bg-bz-olive-soft shadow-[0_34px_72px_-44px_rgba(0,0,0,0.85)]">
        {/* Header Bizak team identity + live status */}
        <div className="flex items-center gap-3.5 px-5 py-5 sm:px-6">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-bz-md bg-bz-fire text-[15px] font-semibold text-bz-olive">
            B
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[14.5px] font-medium text-bz-text-on-dark">
              Bizak customer team
            </p>
            <p className="mt-0.5 text-[12px] text-white/55">
              Typically replies within 1 business day
            </p>
          </div>
          <StatusChip variant="live">Online</StatusChip>
        </div>

        {/* Channels reach the right team directly */}
        <div className="border-t border-white/[0.08] px-5 py-5 sm:px-6">
          <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.08em] text-white/45">
            Reach the right team
          </p>
          <div className="flex flex-col gap-2">
            {CHANNELS.map(({ icon: Icon, label, desc, response }) => (
              <div
                key={label}
                className="flex items-center gap-3 rounded-bz-md border border-white/[0.06] bg-white/[0.03] px-3 py-3"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-bz-sm bg-white/[0.07]">
                  <Icon size={16} strokeWidth={1.7} className="text-bz-leaf" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-medium text-bz-text-on-dark">
                    {label}
                  </p>
                  <p className="mt-0.5 text-[11.5px] text-white/50">{desc}</p>
                </div>
                <span className="shrink-0 rounded-bz-sm border border-bz-fire/25 bg-bz-fire/10 px-2 py-1 text-[9.5px] font-semibold uppercase tracking-[0.06em] text-bz-fire">
                  {response}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer the specialists on the other end */}
        <div className="flex items-center gap-3 border-t border-white/[0.08] px-5 py-4 sm:px-6">
          <div className="flex -space-x-2">
            {TEAM.map((t) => (
              <span
                key={t}
                className="flex size-7 items-center justify-center rounded-bz-pill border-2 border-bz-olive-soft bg-bz-olive text-[9.5px] font-semibold text-bz-text-on-dark"
              >
                {t}
              </span>
            ))}
          </div>
          <p className="text-[11.5px] leading-[1.5] text-white/55">
            Specialists online now across South Asia.
          </p>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// [MESSAGE] the contact form, with a what-happens-next rail beside it
// ════════════════════════════════════════════════════════════════════════════

function ContactFormSection() {
  return (
    <Section tone="a" id="contact-form" pad="tight">
      <Container width="narrow">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[5fr_7fr] lg:items-start lg:gap-14">
          {/* What-happens-next rail desktop-left, drops below the form on mobile */}
          <div className="order-2 lg:order-1">
            <Eyebrow>What happens next</Eyebrow>
            <h2 className="mt-4 text-[21px] font-medium leading-[1.3] tracking-tight text-bz-text">
              From message to answer, fast.
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
          <MessageForm />
        </div>
      </Container>
    </Section>
  );
}

function MessageForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    size: SIZES[0] as string,
    topic: "Sales",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const set =
    (k: keyof typeof form) =>
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
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
            Send us a message
          </h3>
          <p className="mt-0.5 text-[12.5px] text-bz-text-muted">
            We'll route it to the right team and reply within a day.
          </p>
        </div>
        <StatusChip variant="live">Online</StatusChip>
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
            <Field label="Work email">
              <input
                type="email"
                required
                value={form.email}
                onChange={set("email")}
                placeholder="you@company.com"
                className={inputClass}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="Company">
              <input
                type="text"
                value={form.company}
                onChange={set("company")}
                placeholder="Company name"
                className={inputClass}
              />
            </Field>
            <Field label="Company size">
              <select
                value={form.size}
                onChange={set("size")}
                className={inputClass}
              >
                {SIZES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </Field>
          </div>

          {/* Inquiry topic segmented icon selector */}
          <div className="flex flex-col gap-2">
            <span className="text-[12.5px] font-medium text-bz-text">
              How can we help?
            </span>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
              {TOPICS.map(({ value, icon: Icon }) => {
                const active = form.topic === value;
                return (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setForm((p) => ({ ...p, topic: value }))}
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

          <Field label="Message">
            <textarea
              required
              value={form.message}
              onChange={set("message")}
              placeholder="Tell us about your operations and what you're looking to solve."
              className={textareaClass}
            />
          </Field>

          <Pill
            variant="dark"
            withArrow
            type="submit"
            className="mt-1 w-full justify-center"
          >
            Send message
          </Pill>

          <p className="text-[12px] leading-[1.6] text-bz-text-muted">
            We reply within one business day. Your details stay private, never
            resold, never spammed.
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
        Message sent
      </h3>
      <p className="mt-2.5 max-w-[380px] text-[14px] leading-[1.65] text-bz-text-muted">
        Thanks for reaching out. A Bizak specialist will reply to your message within
        one business day, usually much sooner.
      </p>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// [FAQ] dark intro panel + accordion
// ════════════════════════════════════════════════════════════════════════════

function ContactFaqSection() {
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
                title={<>Questions before <Heading.Muted>you reach out.</Heading.Muted></>}
                spacing="none"
              />
            </div>
            <PillGroup className="relative mt-8">
              <Pill
                variant="accent"
                href="https://system.bizakerp.com/account/self-register"
                withArrowUpRight
              >
                Get Started
              </Pill>
              <Pill variant="ghostDark" href="#contact-form" withArrow>
                Send a message
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

export function ContactPage() {
  return (
    <main>
      <ContactHero />
      <ContactFormSection />
      <ContactFaqSection />
    </main>
  );
}
