import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router";
import "../../styles/style.css";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BadgeCheck,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock3,
  GraduationCap,
  Headphones,
  Languages,
  Mail,
  PlayCircle,
  Receipt,
  ShieldCheck,
  Sparkles,
  Users,
  Video,
  type LucideIcon,
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
  COHORTS,
  COURSES,
  findCohortBySlug,
  findCourseBySlug,
  type Cohort,
  type Course,
} from "./TrainingAndCertificate";

// ─── Resolved offering shape (course or cohort, normalised) ─────────────────

type Offering = {
  kind: "course" | "cohort";
  slug: string;
  title: string;
  description: string;
  format: string;
  duration: string;
  level: string;
  cert: string;
  startsAt: string;
  language: string;
  instructor?: string;
  seats?: string;
  price: string;
};

function resolveOffering(slug: string | undefined): Offering | undefined {
  const cohort = findCohortBySlug(slug);
  if (cohort) {
    return {
      kind: "cohort",
      slug: cohort.slug,
      title: cohort.title,
      description:
        "A live cohort session led by a Bizak engineer or consultant. Reserve your seat — cohorts cap at 30 learners and fill quickly.",
      format: cohort.format,
      duration: cohort.format,
      level: "Mixed",
      cert: "Counts toward Bizak certification",
      startsAt: cohort.startsAt,
      language: "English",
      instructor: cohort.instructor,
      seats: cohort.seats,
      price: cohort.price,
    };
  }
  const course = findCourseBySlug(slug);
  if (course) {
    const startsAt =
      course.format === "Self-paced"
        ? "Starts the moment you enrol"
        : "Next session opens monthly";
    return {
      kind: "course",
      slug: course.slug,
      title: course.title,
      description: course.description,
      format: course.format,
      duration: course.duration,
      level: course.level,
      cert: course.cert,
      startsAt,
      language: course.language,
      price:
        course.price ??
        (course.format === "Self-paced"
          ? "$240 per learner"
          : course.format === "Workshop"
          ? "$650 per learner"
          : "$1,200 per learner"),
    };
  }
  return undefined;
}

// ─── Form state ──────────────────────────────────────────────────────────────

type Step = 0 | 1 | 2;

type FormState = {
  fullName: string;
  email: string;
  company: string;
  role: string;
  teamSize: string;
  experience: string;
  preferredLanguage: string;
  startPreference: string;
  notes: string;
  consent: boolean;
};

const INITIAL_FORM: FormState = {
  fullName: "",
  email: "",
  company: "",
  role: "",
  teamSize: "1–10",
  experience: "New to Bizak",
  preferredLanguage: "English",
  startPreference: "As soon as possible",
  notes: "",
  consent: false,
};

const STEPS: { label: string; helper: string }[] = [
  { label: "Your details",     helper: "Who's enrolling"        },
  { label: "Preferences",      helper: "Schedule & language"    },
  { label: "Review & confirm", helper: "Lock in the seat"       },
];

// ─── Static content ─────────────────────────────────────────────────────────

const INCLUDED: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: PlayCircle,
    title: "On-demand video lessons",
    body: "Every module ships with HD video and downloadable transcripts.",
  },
  {
    icon: Sparkles,
    title: "Live sandbox environment",
    body: "A dedicated Bizak tenant pre-loaded with realistic data — yours for 90 days.",
  },
  {
    icon: BadgeCheck,
    title: "Certification exam voucher",
    body: "One attempt at the qualifying exam, with a re-sit voucher if needed.",
  },
  {
    icon: Headphones,
    title: "Instructor support",
    body: "Office hours weekly + 24-hour async response in the cohort channel.",
  },
];

const FAQS: { q: string; a: string }[] = [
  {
    q: "When does the course start?",
    a: "Self-paced courses unlock the moment your enrolment is confirmed. Live cohorts and workshops start on the date listed in the order summary — you'll get a calendar invite within an hour of confirmation.",
  },
  {
    q: "What's the refund policy?",
    a: "Full refund within 14 days, no questions asked. After that, we'll credit your account against another course of equal value. Workshops booked within seven days of the start date are non-refundable.",
  },
  {
    q: "Do I need a Bizak licence to enrol?",
    a: "No. Every learner gets a dedicated sandbox tenant for the duration of the course — no production licence required. If your company already runs Bizak, we can mirror your real configuration on request.",
  },
  {
    q: "Can my team enrol together?",
    a: "Yes. Use the team-size field on the form to indicate the group, and our enrolment team will follow up within one business day with volume pricing and a single invoice.",
  },
];

// ─── Hero ────────────────────────────────────────────────────────────────────

function HeroSection({ offering }: { offering: Offering }) {
  return (
    <Section pad="hero" tone="light" className="biz-mesh overflow-hidden">
      <Container>
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="text-[12.5px] text-bz-text-soft">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <a
                href="/TrainingAndCertification"
                className="inline-flex items-center gap-1.5 hover:text-bz-text"
              >
                <ArrowLeft className="size-[12px]" strokeWidth={2} />
                Training &amp; Certification
              </a>
            </li>
            <li aria-hidden>
              <ChevronRight className="size-[12px] text-bz-text-soft/60" strokeWidth={2} />
            </li>
            <li className="font-medium text-bz-text">
              {offering.kind === "cohort" ? "Reserve your seat" : "Enrol in this course"}
            </li>
          </ol>
        </nav>

        <div className="mt-8 max-w-[760px]">
          <div className="flex flex-wrap items-center gap-2">
            <PillBadge tone="accent" dot>
              {offering.kind === "cohort" ? "Live cohort" : "Enrol"}
            </PillBadge>
            <PillBadge tone="sage">{offering.format}</PillBadge>
            <PillBadge tone="neutral">{offering.level}</PillBadge>
          </div>
          <h1 className="mt-6 text-[clamp(34px,4.6vw,52px)] font-bold leading-[1.05] tracking-[-0.03em] text-bz-text">
            {offering.kind === "cohort" ? (
              <>Reserve your seat — <span className="text-bz-sage">{offering.title}</span>.</>
            ) : (
              <>Enrol in <span className="text-bz-sage">{offering.title}</span>.</>
            )}
          </h1>
          <p className="mt-5 max-w-[640px] text-[16.5px] leading-[1.7] text-bz-text-muted">
            {offering.description}
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-bz-text-soft">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="size-[14px] text-bz-sage" strokeWidth={1.8} />
              {offering.startsAt}
            </span>
            <span aria-hidden className="size-1 rounded-full bg-bz-text-soft/40" />
            <span className="inline-flex items-center gap-1.5">
              <Clock3 className="size-[14px] text-bz-sage" strokeWidth={1.8} />
              {offering.duration}
            </span>
            <span aria-hidden className="size-1 rounded-full bg-bz-text-soft/40" />
            <span className="inline-flex items-center gap-1.5">
              <Languages className="size-[14px] text-bz-sage" strokeWidth={1.8} />
              {offering.language}
            </span>
          </div>
        </div>
      </Container>
    </Section>
  );
}

// ─── Stepper ────────────────────────────────────────────────────────────────

function Stepper({ current }: { current: Step }) {
  return (
    <ol className="grid grid-cols-3 gap-3">
      {STEPS.map((s, i) => {
        const isActive = i === current;
        const isDone = i < current;
        return (
          <li key={s.label} className="relative">
            <div
              className={[
                "flex items-center gap-3 rounded-bz-lg border px-4 py-3 transition-colors",
                isActive
                  ? "border-bz-sage bg-bz-sage-soft"
                  : isDone
                  ? "border-bz-border-soft bg-bz-surface"
                  : "border-bz-border bg-bz-surface",
              ].join(" ")}
            >
              <span
                className={[
                  "inline-flex size-8 shrink-0 items-center justify-center rounded-full text-[12px] font-bold tabular-nums",
                  isActive
                    ? "bg-bz-sage text-white"
                    : isDone
                    ? "bg-bz-accent text-bz-deep"
                    : "bg-bz-bg text-bz-text-soft",
                ].join(" ")}
              >
                {isDone ? <CheckCircle2 className="size-4" strokeWidth={2.5} /> : i + 1}
              </span>
              <div className="min-w-0 leading-tight">
                <div
                  className={[
                    "truncate text-[12.5px] font-bold",
                    isActive ? "text-bz-text" : "text-bz-text-muted",
                  ].join(" ")}
                >
                  {s.label}
                </div>
                <div className="truncate text-[11px] text-bz-text-soft">{s.helper}</div>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

// ─── Form fields (uncontrolled-friendly building blocks) ────────────────────

type TextFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
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
}: TextFieldProps) {
  return (
    <label htmlFor={id} className="flex flex-col gap-2">
      <span className="text-[12.5px] font-bold text-bz-text">
        {label}
        {required && <span className="ml-1 text-bz-sage">*</span>}
      </span>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        className="h-11 rounded-bz-md border border-bz-border bg-bz-surface px-3.5 text-[14px] text-bz-text placeholder:text-bz-text-soft focus:border-bz-sage-mid focus:outline-none focus:ring-2 focus:ring-bz-sage/20"
      />
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

function SelectField({ id, label, value, onChange, options, required }: SelectFieldProps) {
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

// ─── Order summary (sticky aside) ───────────────────────────────────────────

function OrderSummary({ offering }: { offering: Offering }) {
  return (
    <aside className="lg:sticky lg:top-[100px]">
      <Card tone="light" pad="lg" className="border-bz-border">
        <div className="flex items-center justify-between">
          <div className="text-[10.5px] font-bold uppercase tracking-[0.16em] text-bz-text-soft">
            Order summary
          </div>
          <PillBadge tone="sage">
            {offering.kind === "cohort" ? "Live seat" : "Enrolment"}
          </PillBadge>
        </div>

        <h3 className="mt-5 text-[18px] font-bold leading-[1.25] tracking-[-0.005em] text-bz-text">
          {offering.title}
        </h3>

        <ul className="mt-5 divide-y divide-bz-border-soft">
          {[
            { icon: Calendar,    label: "Starts",      value: offering.startsAt   },
            { icon: Clock3,      label: "Duration",    value: offering.duration   },
            { icon: GraduationCap, label: "Format",    value: offering.format     },
            { icon: Languages,   label: "Language",    value: offering.language   },
            ...(offering.instructor
              ? [{ icon: Users, label: "Instructor", value: offering.instructor }]
              : []),
            ...(offering.seats
              ? [{ icon: Sparkles, label: "Seats", value: offering.seats }]
              : []),
            { icon: Award,       label: "Credit",      value: offering.cert       },
          ].map(({ icon: ItemIcon, label, value }) => (
            <li
              key={label}
              className="flex items-center justify-between gap-3 py-3 text-[13.5px]"
            >
              <span className="inline-flex items-center gap-2.5 text-bz-text-muted">
                <ItemIcon className="size-[14px] text-bz-sage" strokeWidth={1.8} />
                {label}
              </span>
              <span className="text-right font-semibold text-bz-text">{value}</span>
            </li>
          ))}
        </ul>

        <div className="mt-6 flex items-center justify-between rounded-bz-lg bg-bz-bg p-4">
          <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-bz-text-soft">
            Total
          </div>
          <div className="text-[18px] font-bold tabular-nums text-bz-text">{offering.price}</div>
        </div>

        <p className="mt-4 inline-flex items-start gap-2 text-[12px] leading-[1.6] text-bz-text-muted">
          <ShieldCheck className="mt-0.5 size-[13px] shrink-0 text-bz-sage" strokeWidth={2} />
          Invoice or card. Tax added at confirmation. Full refund within 14 days.
        </p>
      </Card>
    </aside>
  );
}

// ─── Form section ───────────────────────────────────────────────────────────

function FormSection({ offering }: { offering: Offering }) {
  const [step, setStep] = useState<Step>(0);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [submitted, setSubmitted] = useState(false);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const isStep0Valid =
    form.fullName.trim().length > 1 &&
    /.+@.+\..+/.test(form.email) &&
    form.company.trim().length > 0;

  const canSubmit = isStep0Valid && form.consent;

  const goNext = () => setStep((s) => (s < 2 ? ((s + 1) as Step) : s));
  const goBack = () => setStep((s) => (s > 0 ? ((s - 1) as Step) : s));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitted(true);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (submitted) {
    return <ConfirmationPanel offering={offering} form={form} />;
  }

  return (
    <Section tone="white" pad="default">
      <Container>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-16">
          {/* Form column */}
          <form onSubmit={handleSubmit} className="max-w-[760px]" noValidate>
            <Stepper current={step} />

            {/* Step 0 — Your details */}
            {step === 0 && (
              <div className="mt-10">
                <Eyebrow>Step 1</Eyebrow>
                <h2 className="mt-2 text-[clamp(22px,2.4vw,28px)] font-bold leading-[1.15] tracking-[-0.02em] text-bz-text">
                  Tell us who's enrolling.
                </h2>
                <p className="mt-2 text-[14.5px] leading-[1.7] text-bz-text-muted">
                  We'll use these details on the confirmation, the invoice, and
                  the certificate. Use your work email — it's how we send
                  calendar invites and access credentials.
                </p>

                <div className="mt-7 grid grid-cols-1 gap-5 md:grid-cols-2">
                  <TextField
                    id="fullName"
                    label="Full name"
                    value={form.fullName}
                    onChange={(v) => update("fullName", v)}
                    placeholder="Renée Yamamoto"
                    autoComplete="name"
                    required
                  />
                  <TextField
                    id="email"
                    label="Work email"
                    type="email"
                    value={form.email}
                    onChange={(v) => update("email", v)}
                    placeholder="renee@northwood.com"
                    autoComplete="email"
                    required
                  />
                  <TextField
                    id="company"
                    label="Company"
                    value={form.company}
                    onChange={(v) => update("company", v)}
                    placeholder="Northwood Logistics"
                    autoComplete="organization"
                    required
                  />
                  <TextField
                    id="role"
                    label="Role"
                    value={form.role}
                    onChange={(v) => update("role", v)}
                    placeholder="Director of Finance"
                  />
                  <SelectField
                    id="teamSize"
                    label="Team size"
                    value={form.teamSize}
                    onChange={(v) => update("teamSize", v)}
                    options={["1–10", "11–25", "26–50", "51–100", "100+"]}
                  />
                  <SelectField
                    id="experience"
                    label="Experience with Bizak"
                    value={form.experience}
                    onChange={(v) => update("experience", v)}
                    options={[
                      "New to Bizak",
                      "Used Bizak briefly",
                      "Active Bizak user",
                      "Bizak admin / power user",
                    ]}
                  />
                </div>

                <div className="mt-9 flex items-center justify-between">
                  <a
                    href="/TrainingAndCertification"
                    className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-bz-text-soft hover:text-bz-text"
                  >
                    <ArrowLeft className="size-[12px]" strokeWidth={2} />
                    Back to catalogue
                  </a>
                  <Button
                    variant="primary"
                    size="md"
                    onClick={goNext}
                    type="button"
                    withArrow
                    disabled={!isStep0Valid}
                  >
                    Continue
                  </Button>
                </div>
              </div>
            )}

            {/* Step 1 — Preferences */}
            {step === 1 && (
              <div className="mt-10">
                <Eyebrow>Step 2</Eyebrow>
                <h2 className="mt-2 text-[clamp(22px,2.4vw,28px)] font-bold leading-[1.15] tracking-[-0.02em] text-bz-text">
                  Schedule &amp; language.
                </h2>
                <p className="mt-2 text-[14.5px] leading-[1.7] text-bz-text-muted">
                  Pick the cohort or starting window that fits your calendar
                  and the language you'd like the materials in.
                </p>

                <div className="mt-7 grid grid-cols-1 gap-5 md:grid-cols-2">
                  <SelectField
                    id="startPreference"
                    label="When would you like to start?"
                    value={form.startPreference}
                    onChange={(v) => update("startPreference", v)}
                    options={[
                      "As soon as possible",
                      "Within 2 weeks",
                      "Within a month",
                      "Next quarter",
                    ]}
                  />
                  <SelectField
                    id="preferredLanguage"
                    label="Preferred language"
                    value={form.preferredLanguage}
                    onChange={(v) => update("preferredLanguage", v)}
                    options={[
                      "English",
                      "Nepali",
                      "Hindi",
                      "Spanish",
                      "Portuguese",
                      "French",
                      "German",
                      "Arabic",
                      "Mandarin",
                    ]}
                  />
                </div>

                <label htmlFor="notes" className="mt-6 flex flex-col gap-2">
                  <span className="text-[12.5px] font-bold text-bz-text">
                    Anything we should know?{" "}
                    <span className="ml-1 font-medium text-bz-text-soft">(optional)</span>
                  </span>
                  <textarea
                    id="notes"
                    value={form.notes}
                    onChange={(e) => update("notes", e.target.value)}
                    rows={4}
                    placeholder="Accessibility needs, group enrolment details, billing notes…"
                    className="rounded-bz-md border border-bz-border bg-bz-surface px-3.5 py-3 text-[14px] leading-[1.6] text-bz-text placeholder:text-bz-text-soft focus:border-bz-sage-mid focus:outline-none focus:ring-2 focus:ring-bz-sage/20"
                  />
                </label>

                <div className="mt-9 flex items-center justify-between">
                  <Button variant="ghost" size="md" onClick={goBack} type="button">
                    Back
                  </Button>
                  <Button variant="primary" size="md" onClick={goNext} type="button" withArrow>
                    Continue to review
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2 — Review & confirm */}
            {step === 2 && (
              <div className="mt-10">
                <Eyebrow>Step 3</Eyebrow>
                <h2 className="mt-2 text-[clamp(22px,2.4vw,28px)] font-bold leading-[1.15] tracking-[-0.02em] text-bz-text">
                  Review &amp; confirm.
                </h2>
                <p className="mt-2 text-[14.5px] leading-[1.7] text-bz-text-muted">
                  A quick check before we lock in the seat. Edit any section if
                  something needs adjusting.
                </p>

                <div className="mt-7 overflow-hidden rounded-bz-xl border border-bz-border">
                  <ReviewBlock
                    label="Your details"
                    onEdit={() => setStep(0)}
                    rows={[
                      ["Name",    form.fullName || "—"],
                      ["Email",   form.email || "—"],
                      ["Company", form.company || "—"],
                      ["Role",    form.role || "—"],
                    ]}
                  />
                  <ReviewBlock
                    label="Preferences"
                    onEdit={() => setStep(1)}
                    rows={[
                      ["Team size",   form.teamSize],
                      ["Experience",  form.experience],
                      ["Start",       form.startPreference],
                      ["Language",    form.preferredLanguage],
                      ["Notes",       form.notes || "—"],
                    ]}
                  />
                </div>

                {/* Consent */}
                <label
                  htmlFor="consent"
                  className="mt-7 flex cursor-pointer items-start gap-3 rounded-bz-lg border border-bz-border bg-bz-bg p-4 text-[13.5px] leading-[1.6] text-bz-text-muted"
                >
                  <input
                    id="consent"
                    type="checkbox"
                    checked={form.consent}
                    onChange={(e) => update("consent", e.target.checked)}
                    className="mt-0.5 size-[16px] shrink-0 accent-bz-sage"
                  />
                  <span>
                    I agree to the{" "}
                    <a href="#" className="font-semibold text-bz-text underline-offset-2 hover:underline">
                      Academy terms
                    </a>{" "}
                    and to receive enrolment and certification communications
                    from Bizak. Refunds available within 14 days, no questions
                    asked.
                  </span>
                </label>

                <div className="mt-9 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <Button variant="ghost" size="md" onClick={goBack} type="button">
                    Back
                  </Button>
                  <Button
                    variant="primary"
                    size="md"
                    type="submit"
                    withArrow
                    disabled={!canSubmit}
                  >
                    {offering.kind === "cohort" ? "Reserve seat" : "Confirm enrolment"}
                  </Button>
                </div>
              </div>
            )}
          </form>

          {/* Sticky summary */}
          <OrderSummary offering={offering} />
        </div>
      </Container>
    </Section>
  );
}

function ReviewBlock({
  label,
  rows,
  onEdit,
}: {
  label: string;
  rows: [string, string][];
  onEdit: () => void;
}) {
  return (
    <div className="border-b border-bz-border bg-bz-surface px-6 py-5 last:border-b-0">
      <div className="flex items-center justify-between gap-3">
        <div className="text-[10.5px] font-bold uppercase tracking-[0.16em] text-bz-text-soft">
          {label}
        </div>
        <button
          type="button"
          onClick={onEdit}
          className="text-[12px] font-bold text-bz-sage underline-offset-2 hover:underline"
        >
          Edit
        </button>
      </div>
      <dl className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {rows.map(([k, v]) => (
          <div key={k} className="flex items-center justify-between gap-3 text-[13.5px]">
            <dt className="text-bz-text-muted">{k}</dt>
            <dd className="truncate font-semibold text-bz-text">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

// ─── Confirmation panel (post-submit) ───────────────────────────────────────

function ConfirmationPanel({
  offering,
  form,
}: {
  offering: Offering;
  form: FormState;
}) {
  return (
    <Section tone="white" pad="default">
      <Container width="narrow">
        <div className="rounded-bz-2xl border border-bz-sage-mid/40 bg-bz-sage-soft p-9 md:p-12">
          <div className="flex items-center gap-3">
            <span className="inline-flex size-12 items-center justify-center rounded-full bg-bz-sage text-white">
              <CheckCircle2 className="size-6" strokeWidth={2.2} />
            </span>
            <div>
              <div className="text-[10.5px] font-bold uppercase tracking-[0.16em] text-bz-sage">
                {offering.kind === "cohort" ? "Seat reserved" : "Enrolment confirmed"}
              </div>
              <h2 className="text-[clamp(22px,2.4vw,30px)] font-bold leading-[1.15] tracking-[-0.02em] text-bz-text">
                You're in, {form.fullName.split(" ")[0] || "operator"}.
              </h2>
            </div>
          </div>

          <p className="mt-5 max-w-[640px] text-[15px] leading-[1.75] text-bz-text-muted">
            We've emailed a confirmation to{" "}
            <span className="font-semibold text-bz-text">
              {form.email || "your inbox"}
            </span>{" "}
            with calendar invites, sandbox access, and the welcome pack.{" "}
            {offering.kind === "cohort"
              ? "Your cohort kicks off on the date in the order summary."
              : "Self-paced lessons unlock immediately — log in any time."}
          </p>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              { icon: Mail,    label: "Confirmation",  value: "Sent · ~1 min"   },
              { icon: Calendar, label: "Calendar",     value: "Invite enclosed" },
              { icon: Receipt, label: "Receipt",      value: "On its way"      },
            ].map(({ icon: SmIcon, label, value }) => (
              <div
                key={label}
                className="flex items-center gap-3 rounded-bz-lg border border-bz-border bg-bz-surface p-4"
              >
                <span className="inline-flex size-9 items-center justify-center rounded-bz-md bg-bz-sage-soft text-bz-sage">
                  <SmIcon className="size-[16px]" strokeWidth={1.8} />
                </span>
                <div className="leading-tight">
                  <div className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-bz-text-soft">
                    {label}
                  </div>
                  <div className="mt-1 text-[13px] font-semibold text-bz-text">{value}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Button variant="primary" size="md" href="/TrainingAndCertification" withArrow>
              Browse more courses
            </Button>
            <Button variant="ghost" size="md" href="/HelpCenter">
              Visit the Help Center
            </Button>
          </div>
        </div>
      </Container>
    </Section>
  );
}

// ─── What's included ────────────────────────────────────────────────────────

function IncludedSection() {
  return (
    <Section tone="light" pad="default">
      <Container>
        <SectionHeading
          eyebrow="What's included"
          title="Everything you need to finish — and certify."
          description="Every Academy enrolment ships with the same base kit — videos, sandbox, exam voucher, and instructor support."
          maxWidth={720}
          className="mb-12"
        />
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
          {INCLUDED.map(({ icon: InclIcon, ...item }) => (
            <Card key={item.title} tone="light" pad="lg" hover="lift">
              <IconBadge size="md" tone="sage">
                <InclIcon className="size-[18px]" strokeWidth={1.8} />
              </IconBadge>
              <h3 className="mt-6 text-[16.5px] font-bold tracking-[-0.005em] text-bz-text">
                {item.title}
              </h3>
              <p className="mt-2 text-[13.5px] leading-[1.7] text-bz-text-muted">{item.body}</p>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}

// ─── FAQs + need help banner ───────────────────────────────────────────────

function HelpSection() {
  return (
    <Section tone="white" pad="default">
      <Container>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[360px_1fr] lg:gap-16">
          <div className="lg:sticky lg:top-[100px] lg:self-start">
            <Eyebrow>Common questions</Eyebrow>
            <h2 className="mt-3 text-[clamp(28px,3.4vw,40px)] font-bold leading-[1.1] tracking-[-0.02em] text-bz-text">
              Before you submit.
            </h2>
            <p className="mt-4 text-[15.5px] leading-[1.7] text-bz-text-muted">
              The questions our enrolment team answers most often. If you'd
              rather talk it through, we'll match you with an Academy advisor.
            </p>
            <div className="mt-7">
              <Button variant="outline" size="md" href="/contact" withArrow>
                Talk to an advisor
              </Button>
            </div>
          </div>

          <div className="divide-y divide-bz-border border-y border-bz-border">
            {FAQS.map((faq) => (
              <details key={faq.q} className="group py-5">
                <summary className="flex cursor-pointer items-start justify-between gap-6 text-[15.5px] font-semibold text-bz-text marker:hidden hover:text-bz-sage [&::-webkit-details-marker]:hidden">
                  <span>{faq.q}</span>
                  <ChevronRight
                    className="mt-0.5 size-4 shrink-0 text-bz-text-soft transition-transform duration-200 group-open:rotate-90 group-open:text-bz-sage"
                    strokeWidth={2}
                  />
                </summary>
                <p className="mt-3 max-w-[640px] text-[14.5px] leading-[1.75] text-bz-text-muted">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}

// ─── Closing CTA ────────────────────────────────────────────────────────────

function ClosingCta() {
  return (
    <Section tone="dark" pad="default">
      <Container width="narrow">
        <SectionHeading
          eyebrow="Need a different fit?"
          eyebrowTone="accent"
          title={
            <>
              Looking for a{" "}
              <span className="text-bz-accent">team enrolment</span> instead?
            </>
          }
          description="If you're enrolling more than five learners or want a custom on-site session, our enterprise team will tailor the rollout to your business."
          tone="light"
          align="center"
          maxWidth={680}
        />
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Button variant="accent" size="lg" href="/contact" withArrow>
            Talk to enterprise
          </Button>
          <Button variant="ghostDark" size="lg" href="/TrainingAndCertification">
            Back to the Academy
          </Button>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 border-t border-white/10 pt-8 text-[13px] text-white/55">
          {[
            { icon: Building2,   label: "Volume pricing from 25 seats"     },
            { icon: Video,       label: "Custom on-site sessions"          },
            { icon: ShieldCheck, label: "SSO, invoicing, and SCIM included" },
          ].map(({ icon: Tick, label }) => (
            <span key={label} className="inline-flex items-center gap-2">
              <Tick className="size-4 text-bz-accent" strokeWidth={1.8} />
              {label}
            </span>
          ))}
        </div>
      </Container>
    </Section>
  );
}

// ─── Not-found ──────────────────────────────────────────────────────────────

function NotFound({ slug }: { slug: string | undefined }) {
  return (
    <Section pad="hero" tone="light" className="biz-mesh overflow-hidden">
      <Container width="narrow">
        <div className="flex flex-col items-center text-center">
          <PillBadge tone="neutral">Course not found</PillBadge>
          <h1 className="mt-6 text-[clamp(28px,3.6vw,40px)] font-bold leading-[1.15] tracking-[-0.02em] text-bz-text">
            We couldn't find the course you're trying to enrol in.
          </h1>
          <p className="mt-4 max-w-[560px] text-[15px] leading-[1.7] text-bz-text-muted">
            {slug ? (
              <>
                The slug <span className="font-mono text-bz-text">{slug}</span>{" "}
                doesn't match any course or cohort in the catalogue.
              </>
            ) : (
              <>No course was selected. Pick one from the catalogue to enrol.</>
            )}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button variant="primary" size="md" href="/TrainingAndCertification" withArrow>
              Browse the catalogue
            </Button>
            <Button variant="ghost" size="md" href="/contact">
              Talk to enrolment
            </Button>
          </div>

          <div className="mt-12 w-full max-w-[640px] rounded-bz-xl border border-bz-border bg-bz-surface p-5 text-left">
            <div className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-bz-text-soft">
              Popular right now
            </div>
            <ul className="mt-3 divide-y divide-bz-border-soft">
              {[...COURSES.slice(0, 2), ...COHORTS.slice(0, 1)].map((item) => {
                const isCourse = "track" in item;
                const slug = item.slug;
                const title = item.title;
                return (
                  <li key={slug} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <div className="truncate text-[14px] font-semibold text-bz-text">
                        {title}
                      </div>
                      <div className="truncate text-[12px] text-bz-text-soft">
                        {isCourse ? (item as Course).format : (item as Cohort).format}
                      </div>
                    </div>
                    <a
                      href={`/TrainingAndCertification/enrol/${slug}`}
                      className="inline-flex items-center gap-1 text-[12.5px] font-bold text-bz-sage hover:translate-x-0.5"
                    >
                      Open
                      <ArrowRight className="size-[12px]" />
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </Container>
    </Section>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────

export function EnrollmentPage() {
  const { slug } = useParams<{ slug: string }>();
  const offering = useMemo(() => resolveOffering(slug), [slug]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "auto" });
    }
  }, [slug]);

  if (!offering) {
    return (
      <div>
        <Header />
        <main style={{ paddingTop: 76 }}>
          <NotFound slug={slug} />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Header />
      <main style={{ paddingTop: 76 }}>
        <HeroSection offering={offering} />
        <FormSection offering={offering} />
        <IncludedSection />
        <HelpSection />
        <ClosingCta />
      </main>
      <Footer />
    </div>
  );
}
