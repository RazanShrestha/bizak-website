import { useRef, useState } from "react";
import { useParams } from "react-router";
import "../../styles/style.css";
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  Building2,
  Calendar,
  CalendarPlus,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Globe2,
  Mail,
  MapPin,
  Mic,
  PlayCircle,
  Radio,
  ShieldCheck,
  Sparkles,
  User,
  Users,
} from "lucide-react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import {
  Button,
  Card,
  Container,
  Eyebrow,
  IconBadge,
  PillBadge,
  Section,
  SectionHeading,
} from "./marketing";
import {
  EVENTS,
  FORMAT_ICON,
  findEventById,
  type Event,
} from "./WebinarsAndEvents";

// ─── Form state ──────────────────────────────────────────────────────────────

type FormState = {
  fullName: string;
  email: string;
  company: string;
  role: string;
  teamSize: string;
  region: string;
  question: string;
  reminders: boolean;
  consent: boolean;
};

const INITIAL_FORM: FormState = {
  fullName: "",
  email: "",
  company: "",
  role: "Finance lead",
  teamSize: "25 – 100",
  region: "Asia Pacific",
  question: "",
  reminders: true,
  consent: false,
};

const ROLES = [
  "Finance lead",
  "Operations lead",
  "Plant / production manager",
  "Sales / RevOps",
  "IT / Technology",
  "Founder / CEO",
  "Consultant / Partner",
  "Other",
];

const TEAM_SIZES = [
  "1 – 25",
  "25 – 100",
  "100 – 250",
  "250 – 1,000",
  "1,000+",
];

const REGIONS = [
  "Asia Pacific",
  "EMEA",
  "Americas",
  "Middle East & Africa",
];

// ─── What you'll get strip ──────────────────────────────────────────────────

const VALUE_PROPS: { icon: typeof Radio; title: string; body: string }[] = [
  {
    icon: Radio,
    title: "A live walk-through",
    body:
      "Real product, real numbers — we run the workflow on screen, not slideware.",
  },
  {
    icon: Mic,
    title: "Live Q&A",
    body:
      "Bring a real config question. The hosts answer on air; you keep the recording.",
  },
  {
    icon: PlayCircle,
    title: "Replay the next morning",
    body:
      "Captioned, chapter-marked, sent to your inbox — even if you can't make it live.",
  },
];

// ─── Page ────────────────────────────────────────────────────────────────────

export function SaveSeatPage() {
  const { eventId } = useParams<{ eventId?: string }>();
  const event = findEventById(eventId);

  if (!event) {
    return (
      <div>
        <Header />
        <main style={{ paddingTop: 76 }}>
          <NotFoundSection requestedSlug={eventId} />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Header />
      <main style={{ paddingTop: 76 }}>
        <HeroSection event={event} />
        <RegistrationSection event={event} />
      </main>
      <Footer />
    </div>
  );
}

// ─── Hero ────────────────────────────────────────────────────────────────────

function HeroSection({ event }: { event: Event }) {
  const FormatIcon = FORMAT_ICON[event.format];
  const isInPerson = event.format === "In-person";
  const day = new Date(event.date).getDate();
  const month = new Date(event.date).toLocaleString("en", { month: "short" });
  const year = new Date(event.date).getFullYear();
  const weekday = event.dateLabel.split(" · ")[0];

  return (
    <Section pad="hero" tone="light" className="biz-mesh overflow-hidden">
      <Container className="relative">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="text-[12.5px] text-bz-text-soft">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <a
                href="/WebinarsAndEvents"
                className="inline-flex items-center gap-1.5 hover:text-bz-text"
              >
                <ArrowLeft className="size-[12px]" strokeWidth={2} />
                Webinars &amp; Events
              </a>
            </li>
            <li aria-hidden>
              <ChevronRight className="size-[12px] text-bz-text-soft/60" strokeWidth={2} />
            </li>
            <li className="font-medium text-bz-text">
              {isInPerson ? "Request invite" : "Save your seat"}
            </li>
          </ol>
        </nav>

        <div className="mt-8 grid grid-cols-1 items-start gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
          {/* Left — title block */}
          <div className="max-w-[680px]">
            <div className="flex flex-wrap items-center gap-2">
              <PillBadge tone={isInPerson ? "accent" : "live"} dot>
                <span className="inline-flex items-center gap-1.5">
                  <FormatIcon className="size-[11px]" strokeWidth={2.2} />
                  {event.format}
                </span>
              </PillBadge>
              <PillBadge tone="sage">{event.trackLabel}</PillBadge>
              <PillBadge tone="neutral">{event.region}</PillBadge>
            </div>

            <h1 className="mt-6 text-[clamp(34px,4.6vw,52px)] font-bold leading-[1.05] tracking-[-0.03em] text-bz-text">
              {isInPerson ? (
                <>
                  Request your invite —{" "}
                  <span className="text-bz-sage">{event.title}</span>.
                </>
              ) : (
                <>
                  Save your seat —{" "}
                  <span className="text-bz-sage">{event.title}</span>.
                </>
              )}
            </h1>
            <p className="mt-5 max-w-[620px] text-[16.5px] leading-[1.7] text-bz-text-muted">
              {event.description}
            </p>

            {/* Meta strip */}
            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-bz-text-soft">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="size-[14px] text-bz-sage" strokeWidth={1.8} />
                {event.dateLabel}
              </span>
              <span aria-hidden className="size-1 rounded-full bg-bz-text-soft/40" />
              <span className="inline-flex items-center gap-1.5">
                <Clock3 className="size-[14px] text-bz-sage" strokeWidth={1.8} />
                {event.timeLabel} · {event.duration}
              </span>
              <span aria-hidden className="size-1 rounded-full bg-bz-text-soft/40" />
              <span className="inline-flex items-center gap-1.5">
                {isInPerson ? (
                  <MapPin className="size-[14px] text-bz-sage" strokeWidth={1.8} />
                ) : (
                  <Globe2 className="size-[14px] text-bz-sage" strokeWidth={1.8} />
                )}
                {event.location}
              </span>
            </div>

            {/* Value strip */}
            <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {VALUE_PROPS.map(({ icon: ValueIcon, title, body }) => (
                <div
                  key={title}
                  className="rounded-bz-lg border border-bz-border bg-bz-surface p-4"
                >
                  <IconBadge size="sm" tone="sage">
                    <ValueIcon className="size-4" strokeWidth={1.8} />
                  </IconBadge>
                  <div className="mt-3 text-[13.5px] font-bold text-bz-text">
                    {title}
                  </div>
                  <p className="mt-1 text-[12.5px] leading-[1.55] text-bz-text-muted">
                    {body}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — date / speakers card */}
          <aside className="relative mx-auto w-full max-w-[460px] overflow-hidden rounded-bz-2xl border border-bz-border bg-bz-deep shadow-[0_24px_64px_rgba(15,17,14,0.18)] lg:mx-0">
            <div className="relative p-7 md:p-8">
              <div className="flex items-center justify-between gap-3">
                <PillBadge tone={isInPerson ? "accent" : "live"} dot>
                  {isInPerson ? "Invite-only" : "Live session"}
                </PillBadge>
                <span className="font-mono text-[10.5px] font-bold uppercase tracking-[0.18em] text-white/55">
                  ID · {event.id.toUpperCase()}
                </span>
              </div>

              {/* Date block */}
              <div className="mt-7 flex items-stretch gap-5">
                <div className="flex w-[96px] shrink-0 flex-col items-center justify-center rounded-bz-lg border border-white/10 bg-white/[0.04] py-4">
                  <span className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-white/55">
                    {weekday}
                  </span>
                  <span className="mt-1 text-[34px] font-bold tabular-nums leading-none tracking-[-0.02em] text-white">
                    {day}
                  </span>
                  <span className="mt-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-white/65">
                    {month} {year}
                  </span>
                </div>
                <div className="flex flex-1 flex-col justify-center leading-tight">
                  <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/55">
                    Starts
                  </div>
                  <div className="mt-1 text-[16px] font-bold text-white">
                    {event.timeLabel}
                  </div>
                  <div className="mt-2 inline-flex items-center gap-1.5 text-[12px] text-white/65">
                    <Clock3 className="size-[12px] text-bz-accent" strokeWidth={2} />
                    {event.duration}
                  </div>
                </div>
              </div>

              {/* Speakers */}
              <div className="mt-7">
                <div className="text-[10.5px] font-bold uppercase tracking-[0.16em] text-white/55">
                  {event.speakers.length > 1 ? "Hosted by" : "Hosted by"}
                </div>
                <ul className="mt-3 space-y-3">
                  {event.speakers.map((s) => (
                    <li
                      key={s.initials}
                      className="flex items-center gap-3 rounded-bz-md border border-white/10 bg-white/[0.04] p-3"
                    >
                      <span className="inline-flex size-10 items-center justify-center rounded-full bg-bz-accent text-[12px] font-bold text-bz-deep">
                        {s.initials}
                      </span>
                      <div className="min-w-0 leading-tight">
                        <div className="truncate text-[13.5px] font-semibold text-white">
                          {s.name}
                        </div>
                        <div className="truncate text-[11.5px] text-white/55">
                          {s.role}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Capacity / footer */}
              <div className="mt-7 flex items-center justify-between border-t border-white/10 pt-5 text-[12px] text-white/55">
                <span className="inline-flex items-center gap-1.5">
                  <Users className="size-[13px] text-bz-accent" strokeWidth={2} />
                  {event.capacity ?? "Open registration"}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="size-[13px] text-bz-accent" strokeWidth={2} />
                  Free · always recorded
                </span>
              </div>
            </div>
          </aside>
        </div>
      </Container>
    </Section>
  );
}

// ─── Registration form + summary aside ──────────────────────────────────────

function RegistrationSection({ event }: { event: Event }) {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [submitted, setSubmitted] = useState(false);
  const formRef = useRef<HTMLFormElement | null>(null);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const isValid =
    form.fullName.trim().length > 1 &&
    /.+@.+\..+/.test(form.email) &&
    form.company.trim().length > 0 &&
    form.consent;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isValid) return;
    setSubmitted(true);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (submitted) {
    return <ConfirmationSection event={event} form={form} />;
  }

  return (
    <Section tone="white" pad="default">
      <Container>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-16">
          {/* Form column */}
          <form
            ref={formRef}
            onSubmit={handleSubmit}
            className="max-w-[760px]"
            noValidate
          >
            <Eyebrow>Registration</Eyebrow>
            <h2 className="mt-2 text-[clamp(24px,2.6vw,32px)] font-bold leading-[1.15] tracking-[-0.02em] text-bz-text">
              Tell us who's joining.
            </h2>
            <p className="mt-2 text-[14.5px] leading-[1.7] text-bz-text-muted">
              We'll email the calendar invite, the join link, and the replay
              the next morning. We never share registrant lists.
            </p>

            {/* Identity */}
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextField
                id="fullName"
                label="Full name"
                value={form.fullName}
                onChange={(v) => update("fullName", v)}
                placeholder="Jane Cooper"
                autoComplete="name"
                required
                icon={User}
              />
              <TextField
                id="email"
                label="Work email"
                type="email"
                value={form.email}
                onChange={(v) => update("email", v)}
                placeholder="jane@company.com"
                autoComplete="email"
                required
                icon={Mail}
              />
              <TextField
                id="company"
                label="Company"
                value={form.company}
                onChange={(v) => update("company", v)}
                placeholder="Acme Industries"
                autoComplete="organization"
                required
                icon={Building2}
              />
              <SelectField
                id="role"
                label="Your role"
                value={form.role}
                onChange={(v) => update("role", v)}
                options={ROLES}
              />
              <SelectField
                id="teamSize"
                label="Team size"
                value={form.teamSize}
                onChange={(v) => update("teamSize", v)}
                options={TEAM_SIZES}
              />
              <SelectField
                id="region"
                label="Region"
                value={form.region}
                onChange={(v) => update("region", v)}
                options={REGIONS}
              />
            </div>

            {/* Question */}
            <div className="mt-6">
              <label htmlFor="question" className="flex flex-col gap-2">
                <span className="text-[12.5px] font-bold text-bz-text">
                  What would you like the hosts to cover?
                  <span className="ml-2 font-normal text-bz-text-soft">
                    Optional
                  </span>
                </span>
                <textarea
                  id="question"
                  value={form.question}
                  onChange={(e) => update("question", e.target.value)}
                  placeholder="e.g. We close in 9 days — what would your team do first?"
                  rows={4}
                  className="rounded-bz-md border border-bz-border bg-bz-surface px-3.5 py-3 text-[14px] text-bz-text placeholder:text-bz-text-soft focus:border-bz-sage-mid focus:outline-none focus:ring-2 focus:ring-bz-sage/20"
                />
              </label>
              <p className="mt-2 text-[11.5px] text-bz-text-soft">
                We answer as many as we can on air. Bring real config questions,
                not curiosities.
              </p>
            </div>

            {/* Toggles */}
            <div className="mt-8 space-y-3">
              <CheckboxRow
                id="reminders"
                checked={form.reminders}
                onChange={(v) => update("reminders", v)}
              >
                <span className="font-semibold text-bz-text">
                  Send me a reminder
                </span>{" "}
                <span className="text-bz-text-muted">
                  — one nudge 24 hours before, one 15 minutes before.
                </span>
              </CheckboxRow>
              <CheckboxRow
                id="consent"
                checked={form.consent}
                onChange={(v) => update("consent", v)}
                required
              >
                <span className="font-semibold text-bz-text">
                  I agree to receive event communications
                </span>{" "}
                <span className="text-bz-text-muted">
                  — calendar invite, join link, and the replay. Unsubscribe in one click.
                </span>
              </CheckboxRow>
            </div>

            {/* Submit row */}
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Button
                variant="primary"
                size="lg"
                withArrow
                disabled={!isValid}
              >
                {event.format === "In-person" ? "Request invite" : "Confirm my seat"}
              </Button>
              <Button variant="ghost" size="lg" href="/WebinarsAndEvents">
                Back to all sessions
              </Button>
            </div>

            <p className="mt-5 inline-flex items-start gap-2 text-[12px] leading-[1.6] text-bz-text-muted">
              <ShieldCheck className="mt-0.5 size-[13px] shrink-0 text-bz-sage" strokeWidth={2} />
              By registering you agree to Bizak's privacy policy. We never sell
              attendee data; the registrant list is visible only to the hosting
              team.
            </p>
          </form>

          {/* Summary aside */}
          <SessionSummary event={event} />
        </div>
      </Container>
    </Section>
  );
}

// ─── Confirmation ───────────────────────────────────────────────────────────

function ConfirmationSection({
  event,
  form,
}: {
  event: Event;
  form: FormState;
}) {
  const isInPerson = event.format === "In-person";
  return (
    <Section tone="white" pad="default">
      <Container>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-16">
          <div className="max-w-[760px]">
            <div className="inline-flex items-center gap-2 rounded-bz-pill border border-bz-accent-mid bg-bz-accent-soft px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-bz-sage">
              <CheckCircle2 className="size-[12px]" strokeWidth={2.2} />
              {isInPerson ? "Request received" : "Seat confirmed"}
            </div>
            <h2 className="mt-4 text-[clamp(28px,3.4vw,40px)] font-bold leading-[1.1] tracking-[-0.02em] text-bz-text">
              {isInPerson ? (
                <>You're on the list, {form.fullName.split(" ")[0] || "friend"}.</>
              ) : (
                <>You're in, {form.fullName.split(" ")[0] || "friend"}.</>
              )}
            </h2>
            <p className="mt-3 text-[15.5px] leading-[1.7] text-bz-text-muted">
              We've sent a confirmation to{" "}
              <span className="font-semibold text-bz-text">{form.email}</span>{" "}
              with the calendar invite and the join link. {isInPerson
                ? "The events team will follow up to confirm your invite within 1 business day."
                : "If you can't make it live, the replay lands in your inbox the next morning."}
            </p>

            {/* Next steps */}
            <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <NextStepCard
                icon={CalendarPlus}
                title="Add to your calendar"
                body="Download an .ics or save to Google / Outlook so the join link sits on the meeting."
                cta="Download .ics"
              />
              <NextStepCard
                icon={Bell}
                title={form.reminders ? "Reminders are on" : "Turn on reminders"}
                body={
                  form.reminders
                    ? "We'll nudge you 24 hours before and 15 minutes before the session goes live."
                    : "We won't email reminders unless you opt in. You can change this anytime."
                }
                cta={form.reminders ? "Manage cadence" : "Enable reminders"}
              />
              <NextStepCard
                icon={Sparkles}
                title="Bring a real question"
                body="The hosts answer as many as they can on air. Drop yours in advance and we'll prioritise it."
                cta="Submit a question"
              />
              <NextStepCard
                icon={PlayCircle}
                title="While you wait — replays"
                body="Browse the on-demand library for related sessions on the same track."
                cta="Browse on-demand"
                href="/WebinarsAndEvents#on-demand"
              />
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Button variant="primary" size="md" href="/WebinarsAndEvents" withArrow>
                Back to all sessions
              </Button>
              <Button variant="outline" size="md" href="/contact">
                Talk to a specialist
              </Button>
            </div>
          </div>

          <SessionSummary event={event} compact />
        </div>
      </Container>
    </Section>
  );
}

function NextStepCard({
  icon: NextIcon,
  title,
  body,
  cta,
  href,
}: {
  icon: typeof Bell;
  title: string;
  body: string;
  cta: string;
  href?: string;
}) {
  return (
    <Card tone="light" pad="md" hover="lift" className="flex flex-col">
      <IconBadge size="md" tone="sage">
        <NextIcon className="size-[18px]" strokeWidth={1.8} />
      </IconBadge>
      <h3 className="mt-5 text-[16px] font-bold tracking-[-0.005em] text-bz-text">
        {title}
      </h3>
      <p className="mt-2 flex-1 text-[13.5px] leading-[1.6] text-bz-text-muted">
        {body}
      </p>
      <a
        href={href ?? "#"}
        className="mt-5 inline-flex items-center gap-1.5 text-[12.5px] font-bold text-bz-sage transition-colors hover:text-bz-sage-hover"
      >
        {cta}
        <ArrowRight className="size-[13px]" strokeWidth={2.2} />
      </a>
    </Card>
  );
}

// ─── Sticky session summary ─────────────────────────────────────────────────

function SessionSummary({
  event,
  compact = false,
}: {
  event: Event;
  compact?: boolean;
}) {
  const FormatIcon = FORMAT_ICON[event.format];
  return (
    <aside className="lg:sticky lg:top-[100px]">
      <Card tone="light" pad="lg" className="border-bz-border">
        <div className="flex items-center justify-between">
          <div className="text-[10.5px] font-bold uppercase tracking-[0.16em] text-bz-text-soft">
            Session summary
          </div>
          <PillBadge tone="sage">
            <span className="inline-flex items-center gap-1.5">
              <FormatIcon className="size-[11px]" strokeWidth={2.2} />
              {event.format}
            </span>
          </PillBadge>
        </div>

        <h3 className="mt-5 text-[17.5px] font-bold leading-[1.25] tracking-[-0.005em] text-bz-text">
          {event.title}
        </h3>

        {!compact && (
          <p className="mt-3 text-[13.5px] leading-[1.65] text-bz-text-muted">
            {event.description}
          </p>
        )}

        <ul className="mt-5 divide-y divide-bz-border-soft">
          {[
            { icon: Calendar, label: "Date",     value: event.dateLabel  },
            { icon: Clock3,   label: "Starts",   value: event.timeLabel  },
            { icon: Sparkles, label: "Duration", value: event.duration   },
            { icon: Globe2,   label: "Where",    value: event.location   },
            { icon: Users,    label: "Capacity", value: event.capacity ?? "Open registration" },
          ].map(({ icon: SummaryIcon, label, value }) => (
            <li
              key={label}
              className="flex items-start justify-between gap-3 py-3 text-[13.5px]"
            >
              <span className="inline-flex items-center gap-2.5 text-bz-text-muted">
                <SummaryIcon className="size-[14px] text-bz-sage" strokeWidth={1.8} />
                {label}
              </span>
              <span className="text-right font-semibold text-bz-text">{value}</span>
            </li>
          ))}
        </ul>

        {/* Speakers */}
        <div className="mt-5 border-t border-bz-border-soft pt-5">
          <div className="text-[10.5px] font-bold uppercase tracking-[0.16em] text-bz-text-soft">
            {event.speakers.length > 1 ? "Hosts" : "Host"}
          </div>
          <ul className="mt-3 space-y-2">
            {event.speakers.map((s) => (
              <li key={s.initials} className="flex items-center gap-3">
                <span className="inline-flex size-9 items-center justify-center rounded-full bg-bz-sage-soft text-[11.5px] font-bold text-bz-sage">
                  {s.initials}
                </span>
                <div className="min-w-0 leading-tight">
                  <div className="truncate text-[13px] font-semibold text-bz-text">
                    {s.name}
                  </div>
                  <div className="truncate text-[11.5px] text-bz-text-soft">
                    {s.role}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-6 inline-flex items-start gap-2 text-[12px] leading-[1.6] text-bz-text-muted">
          <ShieldCheck className="mt-0.5 size-[13px] shrink-0 text-bz-sage" strokeWidth={2} />
          Free to attend. Always recorded. We email the replay even if you
          can't make it live.
        </p>
      </Card>
    </aside>
  );
}

// ─── Form fields ────────────────────────────────────────────────────────────

type TextFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
  icon?: typeof User;
};

function TextField({
  id,
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required,
  autoComplete,
  icon: FieldIcon,
}: TextFieldProps) {
  return (
    <label htmlFor={id} className="flex flex-col gap-2">
      <span className="text-[12.5px] font-bold text-bz-text">
        {label}
        {required && <span className="ml-1 text-bz-sage">*</span>}
      </span>
      <span className="flex h-11 items-center gap-2 rounded-bz-md border border-bz-border bg-bz-surface px-3.5 focus-within:border-bz-sage-mid focus-within:ring-2 focus-within:ring-bz-sage/20">
        {FieldIcon && (
          <FieldIcon className="size-4 shrink-0 text-bz-text-soft" strokeWidth={1.8} />
        )}
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          className="flex-1 bg-transparent text-[14px] text-bz-text placeholder:text-bz-text-soft focus:outline-none"
        />
      </span>
    </label>
  );
}

type SelectFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  required?: boolean;
};

function SelectField({
  id,
  label,
  value,
  onChange,
  options,
  required,
}: SelectFieldProps) {
  return (
    <label htmlFor={id} className="flex flex-col gap-2">
      <span className="text-[12.5px] font-bold text-bz-text">
        {label}
        {required && <span className="ml-1 text-bz-sage">*</span>}
      </span>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="h-11 rounded-bz-md border border-bz-border bg-bz-surface px-3 text-[14px] text-bz-text focus:border-bz-sage-mid focus:outline-none focus:ring-2 focus:ring-bz-sage/20"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

function CheckboxRow({
  id,
  checked,
  onChange,
  required,
  children,
}: {
  id: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-start gap-3 rounded-bz-md border border-bz-border bg-bz-surface p-4 hover:border-bz-sage-mid"
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        required={required}
        className="mt-0.5 size-4 shrink-0 accent-bz-sage"
      />
      <span className="text-[13px] leading-[1.6]">{children}</span>
    </label>
  );
}

// ─── Not-found fallback ─────────────────────────────────────────────────────

function NotFoundSection({ requestedSlug }: { requestedSlug?: string }) {
  return (
    <Section pad="hero" tone="light" className="biz-mesh">
      <Container width="narrow">
        <SectionHeading
          eyebrow="Session not found"
          title={
            <>
              We couldn't find a session with that{" "}
              <span className="text-bz-sage">link.</span>
            </>
          }
          description={
            requestedSlug
              ? `The session "${requestedSlug}" may have ended, been renamed, or moved into the on-demand library.`
              : "The session may have ended, been renamed, or moved into the on-demand library."
          }
          maxWidth={680}
        />
        <div className="mt-8 flex flex-wrap gap-3">
          <Button variant="primary" size="md" href="/WebinarsAndEvents" withArrow>
            See upcoming sessions
          </Button>
          <Button variant="outline" size="md" href="/WebinarsAndEvents#on-demand">
            Browse on-demand
          </Button>
        </div>

        {/* A few suggestions */}
        <div className="mt-12">
          <div className="text-[10.5px] font-bold uppercase tracking-[0.16em] text-bz-text-soft">
            Try one of these instead
          </div>
          <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {EVENTS.slice(0, 4).map((e) => (
              <li key={e.id}>
                <a
                  href={`/WebinarsAndEvents/save-seat/${e.id}`}
                  className="group flex items-center justify-between gap-3 rounded-bz-lg border border-bz-border bg-bz-surface p-4 transition-colors hover:border-bz-sage-mid hover:bg-bz-sage-soft"
                >
                  <div className="min-w-0">
                    <div className="truncate text-[13.5px] font-bold text-bz-text">
                      {e.title}
                    </div>
                    <div className="truncate text-[12px] text-bz-text-soft">
                      {e.dateLabel} · {e.format}
                    </div>
                  </div>
                  <ArrowRight
                    className="size-[14px] text-bz-sage transition-transform group-hover:translate-x-0.5"
                    strokeWidth={2.2}
                  />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </Section>
  );
}
