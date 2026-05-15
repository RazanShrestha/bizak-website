import { useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useParams } from "react-router";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  Globe,
  GraduationCap,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Users,
  ShieldCheck,
  BookOpen,
  Award,
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
} from "../marketing";
import { Header } from "../Header";
import { Footer } from "../Footer";
import {
  EVENTS,
  findEventBySlug,
  type PartnerEvent,
} from "./eventsData";

const ROLES_TRAINING = [
  "Solution Architect",
  "Implementation Lead",
  "Senior Consultant",
  "Junior Consultant",
  "Practice Manager",
  "Other",
];

const REGIONS = ["Asia Pacific", "EMEA", "North America", "Latin America"];

type Enrollee = { id: string; name: string; email: string; role: string };

type FormState = {
  firmName:    string;
  billingEmail: string;
  region:      string;
  enrollees:   Enrollee[];
  notes:       string;
  consent:     boolean;
};

const newEnrollee = (idx = 0): Enrollee => ({
  id: `seat-${Date.now()}-${idx}`,
  name: "",
  email: "",
  role: ROLES_TRAINING[0],
});

export function PartnerEventEnrollPage() {
  const { slug } = useParams<{ slug?: string }>();
  const event = findEventBySlug(slug);

  if (!event || event.type !== "Training" || !event.cohort) {
    return <NotFoundPage requested={slug} />;
  }

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <Header />
      <main>
        <HeroSection event={event} />
        <CurriculumSection event={event} />
        <EnrollmentSection event={event} />
        <ClosingCta />
      </main>
      <Footer />
    </div>
  );
}

function NotFoundPage({ requested }: { requested?: string }) {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <Header />
      <main>
        <Section pad="hero" tone="light" className="biz-mesh">
          <Container width="narrow">
            <div className="max-w-[640px]">
              <PillBadge tone="neutral">404 · Cohort not found</PillBadge>
              <h1 className="mt-5 font-bold tracking-[-0.02em] text-[clamp(34px,5vw,56px)] leading-[1.1]">
                That cohort isn't open right now.
              </h1>
              <p className="mt-6 text-[17px] leading-[1.7] text-bz-text-muted">
                {requested ? <>We couldn't find a training cohort for <code className="text-bz-sage">/{requested}</code>.</> : "Browse upcoming certifications and bootcamps below."}
              </p>
              <div className="mt-10 flex flex-wrap gap-3">
                <Button variant="primary" size="lg" href="/partners/events" withArrow>
                  See all events
                </Button>
                <Button variant="outline" size="lg" href="/partners/consultants">
                  Architect Academy
                </Button>
              </div>
            </div>
          </Container>
        </Section>
      </main>
      <Footer />
    </div>
  );
}

function HeroSection({ event }: { event: PartnerEvent }) {
  const cohort = event.cohort!;
  const seatsLeft = cohort.seats - cohort.seatsTaken;
  const seatPct = (cohort.seatsTaken / cohort.seats) * 100;
  const totalHrs = event.curriculum?.reduce((s, m) => s + m.hours, 0) ?? 0;

  return (
    <Section pad="hero" tone="light" className="biz-mesh">
      <Container width="narrow">
        <Breadcrumb title={event.title} />

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-12 lg:gap-16 items-start">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <HeroBadge>Architect Academy · Enrollment</HeroBadge>
              <PillBadge tone="sage" dot>
                {seatsLeft} seats remaining
              </PillBadge>
            </div>

            <h1 className="font-bold tracking-[-0.02em] text-[clamp(34px,5vw,56px)] leading-[1.1]">
              Enroll in <span className="text-bz-sage">{event.title}</span>.
            </h1>
            <p className="mt-6 text-[17px] leading-[1.7] text-bz-text-muted max-w-[620px]">
              {event.desc}
            </p>

            <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-[13px] text-bz-text-muted">
              <span className="flex items-center gap-1.5">
                <CalendarDays className="size-[14px] text-bz-sage" /> {event.date}
              </span>
              <span aria-hidden className="size-1 rounded-full bg-bz-border" />
              <span className="flex items-center gap-1.5">
                <Clock className="size-[14px] text-bz-sage" /> {event.duration}
              </span>
              <span aria-hidden className="size-1 rounded-full bg-bz-border" />
              <span className="flex items-center gap-1.5">
                <Globe className="size-[14px] text-bz-sage" /> {event.location}
              </span>
              <span aria-hidden className="size-1 rounded-full bg-bz-border" />
              <span className="flex items-center gap-1.5">
                <BookOpen className="size-[14px] text-bz-sage" /> {totalHrs} hrs total
              </span>
            </div>

            {/* {event.highlights && (
              <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {event.highlights.map((h) => (
                  <div key={h} className="flex items-start gap-2.5 rounded-bz-md border border-bz-border bg-bz-surface p-3.5">
                    <CheckCircle2 className="size-4 text-bz-sage shrink-0 mt-0.5" />
                    <span className="text-[13.5px] leading-[1.55] text-bz-text">{h}</span>
                  </div>
                ))}
              </div>
            )} */}
          </div>

          <CohortPanel event={event} seatsLeft={seatsLeft} seatPct={seatPct} />
        </div>
      </Container>
    </Section>
  );
}

function Breadcrumb({ title }: { title: string }) {
  return (
    <nav aria-label="Breadcrumb" className="text-[12.5px] text-bz-text-muted">
      <ol className="flex flex-wrap items-center gap-1.5">
        <li>
          <a href="/partners/events" className="inline-flex items-center gap-1.5 hover:text-bz-text">
            <ArrowLeft className="size-[12px]" /> Partner Events
          </a>
        </li>
        <li aria-hidden>
          <ChevronRight className="size-[12px] text-bz-text-muted/60" />
        </li>
        <li className="font-medium text-bz-text truncate max-w-[280px]">{title}</li>
      </ol>
    </nav>
  );
}

function CohortPanel({
  event,
  seatsLeft,
  seatPct,
}: {
  event: PartnerEvent;
  seatsLeft: number;
  seatPct: number;
}) {
  const cohort = event.cohort!;
  return (
    <Card tone="dark" pad="lg" className="relative overflow-hidden bg-bz-deep border-white/10 shadow-[0_24px_64px_rgba(0,0,0,0.18)]">
      <div className="absolute -top-24 -right-24 size-72 rounded-full bg-bz-accent/[0.12] blur-3xl pointer-events-none" />
      <div className="relative">
        <div className="flex items-center justify-between mb-6">
          <PillBadge tone="accent" dot>Cohort filling</PillBadge>
          <Sparkles className="size-4 text-bz-accent" />
        </div>

        <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-white/40 mb-2">
          Seats this cohort
        </div>
        <div className="flex items-baseline gap-2 mb-3">
          <div className="text-[36px] font-bold tabular-nums leading-none">{cohort.seatsTaken}</div>
          <div className="text-[14px] text-white/55 tabular-nums">/ {cohort.seats}</div>
        </div>
        <div className="h-1.5 bg-white/10 rounded-bz-pill overflow-hidden mb-2">
          <div className="h-full bg-bz-accent rounded-bz-pill" style={{ width: `${seatPct}%` }} />
        </div>
        <div className="text-[12px] text-white/55 mb-6">
          <span className="font-bold text-bz-accent tabular-nums">{seatsLeft}</span> seats remaining · enrollment closes 7 days before kickoff
        </div>

        <div className="grid grid-cols-1 gap-2.5 mb-6">
          {[
            { Icon: Award,        l: "Architect-tier badge on pass" },
            { Icon: Users,        l: "Two mentors per cohort" },
            { Icon: ShieldCheck,  l: "Sandbox tenants seeded with industry data" },
            { Icon: BookOpen,     l: "Working artifacts you keep" },
          ].map(({ Icon, l }) => (
            <div key={l} className="flex items-center gap-3 rounded-bz-md border border-white/10 bg-white/[0.03] px-3.5 py-2.5">
              <Icon className="size-4 text-bz-accent shrink-0" />
              <span className="text-[12.5px] text-white/75">{l}</span>
            </div>
          ))}
        </div>

        {/* <div className="border-t border-white/10 pt-5">
          <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-white/40 mb-2">
            Investment
          </div>
          <div className="text-[18px] font-bold mb-1">{cohort.priceLabel}</div>
          <div className="text-[12px] text-white/55 leading-[1.5]">{cohort.feePartner}</div>
          <div className="text-[12px] text-white/45 leading-[1.5] mt-1">{cohort.investmentNote}</div>
        </div> */}
      </div>
    </Card>
  );
}

function CurriculumSection({ event }: { event: PartnerEvent }) {
  const totalHrs = event.curriculum?.reduce((s, m) => s + m.hours, 0) ?? 0;
  return (
    <Section tone="white">
      <Container width="narrow">
        <div className="flex flex-wrap items-end justify-between gap-6 mb-12">
          <SectionHeading
            eyebrow="Curriculum"
            title="What you'll cover."
            description="Cohort-paced every week is graded. The capstone exam runs on the final day; an architect-tier badge is awarded on pass."
            maxWidth={580}
          />
          <PillBadge tone="sage">{totalHrs} hours · live + lab</PillBadge>
        </div>

        <div className="rounded-bz-xl border border-bz-border bg-bz-surface overflow-hidden">
          <div className="grid grid-cols-[140px_1fr_120px] gap-4 px-6 py-4 border-b border-bz-border text-[11px] uppercase tracking-[0.1em] font-bold text-bz-text-muted">
            <div>Module</div>
            <div>Topic</div>
            <div className="text-right">Hours</div>
          </div>
          {event.curriculum?.map((m, i) => (
            <div
              key={m.week + i}
              className="grid grid-cols-[140px_1fr_120px] gap-4 px-6 py-5 border-b border-bz-border last:border-b-0 items-center hover:bg-bz-bg/60 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-md bg-bz-sage/15 text-bz-sage flex items-center justify-center text-[12px] font-bold tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <span className="text-[13.5px] font-bold">{m.week}</span>
              </div>
              <div className="text-[14px] text-bz-text leading-[1.55]">{m.topic}</div>
              <div className="text-[14px] tabular-nums text-bz-text-muted text-right">{m.hours} hrs</div>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-bz-md border border-bz-sage/20 bg-bz-sage/[0.05] p-5 flex items-start gap-3">
          <Award className="size-5 text-bz-sage shrink-0 mt-0.5" />
          <div>
            <div className="text-[14px] font-bold mb-1">Capstone exam · final day</div>
            <p className="text-[13px] text-bz-text-muted leading-[1.6]">
              Two-hour proctored exam. Pass the bar and your architect badge appears in the Partner Portal automatically renewable for 12 months.
            </p>
          </div>
        </div>
      </Container>
    </Section>
  );
}

function EnrollmentSection({ event }: { event: PartnerEvent }) {
  const cohort = event.cohort!;
  const [form, setForm] = useState<FormState>({
    firmName: "",
    billingEmail: "",
    region: "Asia Pacific",
    enrollees: [newEnrollee(0)],
    notes: "",
    consent: false,
  });
  const [done, setDone] = useState(false);

  const totalSeats = form.enrollees.length;
  const billing = useMemo(() => {
    if (totalSeats <= 3) {
      return {
        label: cohort.priceLabel,
        sub: cohort.feePartner,
        amount: "$0",
      };
    }
    const overage = totalSeats - 3;
    const note = cohort.investmentNote;
    return {
      label: `${overage} seat${overage > 1 ? "s" : ""} above the free allocation`,
      sub: note,
      amount: "Invoice on confirmation",
    };
  }, [totalSeats, cohort]);

  const setField =
    <K extends Exclude<keyof FormState, "enrollees">>(k: K) =>
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((p) => ({
        ...p,
        [k]: e.target.type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : e.target.value,
      }));

  const updateEnrollee = (id: string, k: keyof Enrollee, v: string) =>
    setForm((p) => ({
      ...p,
      enrollees: p.enrollees.map((s) => (s.id === id ? { ...s, [k]: v } : s)),
    }));

  const addSeat = () =>
    setForm((p) =>
      p.enrollees.length >= cohort.seats - cohort.seatsTaken
        ? p
        : { ...p, enrollees: [...p.enrollees, newEnrollee(p.enrollees.length)] },
    );

  const removeSeat = (id: string) =>
    setForm((p) =>
      p.enrollees.length === 1
        ? p
        : { ...p, enrollees: p.enrollees.filter((s) => s.id !== id) },
    );

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setDone(true);
  };

  return (
    <Section tone="light">
      <Container width="narrow">
        <div className="grid grid-cols-1 lg:grid-cols-[5fr_7fr] gap-12 lg:gap-16 items-start">
          <div className="lg:sticky lg:top-28">
            <SectionHeading
              eyebrow="Enroll your team"
              title="Roster + billing context."
              description="Submit a roster of consultants. Your first three seats per cohort are free additional seats are invoiced after we confirm cohort capacity."
              maxWidth={460}
            />

            <Card tone="soft" pad="md" className="mt-8 border-bz-sage/20">
              <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-bz-text-muted mb-3">
                Order summary
              </div>
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-[13.5px] text-bz-text">{totalSeats} seat{totalSeats > 1 ? "s" : ""} · {event.title}</span>
                <span className="text-[14px] font-bold tabular-nums">{billing.amount}</span>
              </div>
              <div className="text-[12px] text-bz-text-muted leading-[1.5] mb-3">{billing.label}</div>
              <div className="border-t border-bz-border pt-3 text-[11.5px] text-bz-text-muted leading-[1.55]">
                {billing.sub}
              </div>
            </Card>

            <div className="mt-6 grid grid-cols-2 gap-3">
              {[
                { v: cohort.seats - cohort.seatsTaken, l: "Seats left" },
                { v: "100%",  l: "Free first 3" },
                { v: "12 mo", l: "Cert validity" },
                { v: "Live",  l: "+ replays" },
              ].map((s) => (
                <div key={s.l} className="rounded-bz-md border border-bz-border p-4">
                  <div className="text-[20px] font-bold tabular-nums">{s.v}</div>
                  <div className="text-[12px] text-bz-text-muted mt-0.5">{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          <Card pad="lg" tone="light" className="shadow-[0_24px_64px_rgba(0,0,0,0.06)]">
            <div className="flex items-center justify-between mb-7">
              <div className="text-[18px] font-bold">Enrollment form</div>
              <PillBadge tone="sage">
                <span className="inline-flex items-center gap-1.5">
                  <GraduationCap className="size-3" /> Cohort {event.title.split("Cohort").pop()?.trim() ?? "open"}
                </span>
              </PillBadge>
            </div>

            {done ? (
              <SuccessBlock total={totalSeats} event={event} />
            ) : (
              <form onSubmit={submit} className="flex flex-col gap-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Partner firm">
                    <Input
                      type="text"
                      value={form.firmName}
                      onChange={setField("firmName")}
                      placeholder="Legal entity name"
                      required
                    />
                  </Field>
                  <Field label="Billing email">
                    <Input
                      type="email"
                      value={form.billingEmail}
                      onChange={setField("billingEmail")}
                      placeholder="finance@firm.com"
                      required
                    />
                  </Field>
                </div>

                <Field label="Region">
                  <Select value={form.region} onChange={setField("region")}>
                    {REGIONS.map((r) => (
                      <option key={r}>{r}</option>
                    ))}
                  </Select>
                </Field>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[12px] font-bold uppercase tracking-[0.08em] text-bz-text-muted">
                      Roster {totalSeats} seat{totalSeats > 1 ? "s" : ""}
                    </span>
                    <button
                      type="button"
                      onClick={addSeat}
                      className="text-[12.5px] font-bold text-bz-sage hover:underline disabled:opacity-40"
                      disabled={totalSeats >= cohort.seats - cohort.seatsTaken}
                    >
                      + Add seat
                    </button>
                  </div>

                  <div className="flex flex-col gap-4">
                    {form.enrollees.map((s, i) => (
                      <div
                        key={s.id}
                        className="rounded-bz-md border border-bz-border bg-bz-bg p-4"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="text-[12px] font-bold uppercase tracking-[0.08em] text-bz-text-muted">
                            Seat {String(i + 1).padStart(2, "0")}
                          </div>
                          {form.enrollees.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeSeat(s.id)}
                              className="text-[12px] text-bz-text-muted hover:text-bz-text"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <Input
                            type="text"
                            value={s.name}
                            onChange={(e) => updateEnrollee(s.id, "name", e.target.value)}
                            placeholder="Full name"
                            required
                          />
                          <Input
                            type="email"
                            value={s.email}
                            onChange={(e) => updateEnrollee(s.id, "email", e.target.value)}
                            placeholder="name@firm.com"
                            required
                          />
                        </div>
                        <div className="mt-3">
                          <Select
                            value={s.role}
                            onChange={(e) => updateEnrollee(s.id, "role", e.target.value)}
                          >
                            {ROLES_TRAINING.map((r) => (
                              <option key={r}>{r}</option>
                            ))}
                          </Select>
                        </div>
                      </div>
                    ))}
                  </div>

                  {totalSeats >= cohort.seats - cohort.seatsTaken && (
                    <p className="mt-3 text-[12px] text-bz-text-muted">
                      You've reached the seats remaining in this cohort. Submit, and we'll confirm or roll over to the next cohort.
                    </p>
                  )}
                </div>

                <Field label="Anything we should know? (optional)">
                  <textarea
                    value={form.notes}
                    onChange={setField("notes")}
                    rows={3}
                    placeholder="Prior certifications, focus areas, accommodations…"
                    className="w-full px-4 py-3 rounded-bz-md border border-bz-border bg-bz-surface text-[14px] text-bz-text placeholder:text-bz-text-muted/60 focus:outline-none focus:border-bz-sage transition-colors resize-none"
                  />
                </Field>

                <label className="flex items-start gap-3 cursor-pointer text-[13px] text-bz-text">
                  <input
                    type="checkbox"
                    checked={form.consent}
                    onChange={setField("consent")}
                    className="mt-0.5 size-4 accent-bz-sage"
                    required
                  />
                  <span>
                    I confirm the listed enrollees are active employees of this partner firm and agree to the
                    <a className="text-bz-sage underline mx-1" href="#">cohort policy</a>
                    (attendance, exam, certification renewal).
                  </span>
                </label>

                <Button variant="primary" size="lg" withArrow>
                  Submit enrollment
                </Button>
                <p className="text-[12px] text-bz-text-muted leading-[1.6]">
                  Confirmation within 1 business day. If the cohort fills, we'll roll your seats forward and
                  email before invoicing anything beyond the free allocation.
                </p>
              </form>
            )}
          </Card>
        </div>
      </Container>
    </Section>
  );
}

function SuccessBlock({ total, event }: { total: number; event: PartnerEvent }) {
  return (
    <div>
      <div className="rounded-bz-md border border-bz-sage/30 bg-bz-sage/[0.06] p-6 mb-6">
        <div className="flex items-center gap-2 text-bz-sage font-bold mb-1.5">
          <CheckCircle2 className="size-5" /> Enrollment received
        </div>
        <p className="text-[14px] text-bz-text-muted leading-[1.65]">
          {total} seat{total > 1 ? "s" : ""} requested for <strong>{event.title}</strong>. Our partner ops team will confirm the roster within one business day, send sandbox credentials, and add each enrollee to the cohort Slack.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Button variant="outline" size="md" href="/partners/events">
          See more events
        </Button>
        <Button variant="primary" size="md" href="/partners/portal" withArrow>
          Open Partner Portal
        </Button>
      </div>
    </div>
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

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full h-11 px-4 rounded-bz-md border border-bz-border bg-bz-surface text-[14px] text-bz-text placeholder:text-bz-text-muted/60 focus:outline-none focus:border-bz-sage transition-colors"
    />
  );
}

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement> & { children: React.ReactNode }) {
  return (
    <select
      {...props}
      className="w-full h-11 px-4 rounded-bz-md border border-bz-border bg-bz-surface text-[14px] text-bz-text focus:outline-none focus:border-bz-sage transition-colors"
    />
  );
}

function ClosingCta() {
  const otherTrainings = EVENTS.filter((e) => e.type === "Training");
  return (
    <Section tone="dark" pad="default">
      <Container width="narrow">
        <SectionHeading
          eyebrow="Architect Academy"
          eyebrowTone="accent"
          title="Other open cohorts."
          tone="light"
          maxWidth={620}
          align="center"
          className="mx-auto mb-12"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          {otherTrainings.map((e) => (
            <Card key={e.slug} tone="dark" pad="md" hover="glow">
              <div className="flex items-center gap-3 mb-4">
                <IconBadge tone="accent" size="sm">
                  <e.Icon className="size-4" />
                </IconBadge>
                <PillBadge tone="sage">Training</PillBadge>
              </div>
              <div className="text-[16px] font-bold mb-2 leading-tight">{e.title}</div>
              <div className="text-[12px] text-white/45 mb-4">{e.date} · {e.duration}</div>
              <a
                href={`/partners/events/enroll/${e.slug}`}
                className="inline-flex items-center gap-1.5 text-[13px] font-bold text-bz-accent hover:underline"
              >
                View cohort <ChevronRight className="size-3.5" />
              </a>
            </Card>
          ))}
        </div>
        <div className="flex justify-center">
          <Button variant="ghostDark" size="lg" href="/partners/events">
            See full calendar
          </Button>
        </div>
      </Container>
    </Section>
  );
}
