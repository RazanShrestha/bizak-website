import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useParams } from "react-router";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  MapPin,
  Globe,
  Users,
  CheckCircle2,
  Sparkles,
  Video,
  ChevronRight,
  ShieldCheck,
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
  type EventFormat,
  type PartnerEvent,
} from "./eventsData";

const FORMAT_ICON: Record<EventFormat, typeof Globe> = {
  "In-person": MapPin,
  "Virtual":   Video,
  "Hybrid":    Globe,
};

const ROLES = [
  "Partner Sales / Channel",
  "Partner Solution Architect",
  "Partner Implementation Lead",
  "Partner Marketing",
  "Customer Finance / Ops",
  "Customer IT",
  "Bizak team",
  "Other",
];

const REGIONS = ["Asia Pacific", "EMEA", "North America", "Latin America"];

type FormState = {
  fullName: string;
  email:    string;
  org:      string;
  role:     string;
  region:   string;
  guests:   string;
  question: string;
  reminders: boolean;
  consent:  boolean;
};

const INITIAL: FormState = {
  fullName: "",
  email:    "",
  org:      "",
  role:     "Partner Sales / Channel",
  region:   "Asia Pacific",
  guests:   "Just me",
  question: "",
  reminders: true,
  consent:  false,
};

export function PartnerEventRegisterPage() {
  const { slug } = useParams<{ slug?: string }>();
  const event = findEventBySlug(slug);

  if (!event) return <NotFoundPage requested={slug} />;

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <Header />
      <main>
        <HeroSection event={event} />
        <RegistrationSection event={event} />
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
              <PillBadge tone="neutral">404 · Event not found</PillBadge>
              <h1 className="mt-5 font-bold tracking-[-0.02em] text-[clamp(34px,5vw,56px)] leading-[1.1]">
                We couldn't find that event.
              </h1>
              <p className="mt-6 text-[17px] leading-[1.7] text-bz-text-muted">
                {requested ? <>The event <code className="text-bz-sage">/{requested}</code> isn't on the calendar.</> : "Check the link or browse all upcoming sessions."}
              </p>
              <div className="mt-10 flex flex-wrap gap-3">
                <Button variant="primary" size="lg" href="/partners/events" withArrow>
                  See all events
                </Button>
                <Button variant="outline" size="lg" href="/partners/portal">
                  Browse Replays
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
  const FmtIcon = FORMAT_ICON[event.format];
  const isInPerson = event.format === "In-person";
  return (
    <Section pad="hero" tone="light" className="biz-mesh">
      <Container width="narrow">
        <Breadcrumb title={event.title} />

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-12 lg:gap-16 items-start">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <HeroBadge>{event.flagship ? "Flagship · BizakConnect" : event.type}</HeroBadge>
              <PillBadge tone={isInPerson ? "accent" : "live"} dot>
                <span className="inline-flex items-center gap-1.5">
                  <FmtIcon className="size-[11px]" />
                  {event.format}
                </span>
              </PillBadge>
            </div>

            <h1 className="font-bold tracking-[-0.02em] text-[clamp(34px,5vw,56px)] leading-[1.1]">
              {isInPerson ? "Request your invite " : "Save your seat "}
              <span className="text-bz-sage">{event.title}</span>.
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
                <MapPin className="size-[14px] text-bz-sage" /> {event.location}
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

          <SidebarPanel event={event} />
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

function SidebarPanel({ event }: { event: PartnerEvent }) {
  return (
    <Card
      tone="dark"
      pad="lg"
      className="relative overflow-hidden bg-bz-deep border-white/10 shadow-[0_24px_64px_rgba(0,0,0,0.18)]"
    >
      <div className="absolute -top-24 -right-24 size-72 rounded-full bg-bz-accent/[0.18] blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-20 size-64 rounded-full bg-bz-sage/20 blur-3xl pointer-events-none" />
      <div className="relative">
        <div className="flex items-center justify-between mb-5">
          <PillBadge tone="accent" dot>Live registration</PillBadge>
          <Sparkles className="size-4 text-bz-accent" />
        </div>

        <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-white/40 mb-2">
          Hosted by
        </div>
        <div className="flex flex-wrap gap-1.5 mb-6">
          {event.speakers.map((s) => (
            <span key={s} className="px-2.5 py-1 rounded-bz-pill border border-white/15 bg-white/[0.04] text-[11.5px] text-white/75">
              {s}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2.5 mb-5">
          {[
            { Icon: Users,        l: "Open to partners + customers" },
            { Icon: ShieldCheck,  l: "No marketing follow-up" },
            { Icon: Video,        l: "Replay sent next morning" },
            { Icon: Globe,        l: "Time zone local invites" },
          ].map(({ Icon, l }) => (
            <div key={l} className="rounded-bz-md border border-white/10 bg-white/[0.03] p-3 flex items-start gap-2.5">
              <Icon className="size-3.5 text-bz-accent shrink-0 mt-0.5" />
              <span className="text-[11.5px] text-white/70 leading-[1.4]">{l}</span>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 pt-5">
          <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-white/40 mb-2">
            Other ways to attend
          </div>
          <ul className="flex flex-col gap-2">
            <li>
              <a href="/partners/portal" className="text-[13px] text-white/70 hover:text-bz-accent inline-flex items-center gap-1.5">
                Watch on the Partner Portal <ChevronRight className="size-3" />
              </a>
            </li>
            <li>
              <a href="/partners/events" className="text-[13px] text-white/70 hover:text-bz-accent inline-flex items-center gap-1.5">
                See full event calendar <ChevronRight className="size-3" />
              </a>
            </li>
          </ul>
        </div>
      </div>
    </Card>
  );
}

function RegistrationSection({ event }: { event: PartnerEvent }) {
  const isInPerson = event.format === "In-person";
  const [form, setForm] = useState<FormState>(INITIAL);
  const [done, setDone] = useState(false);

  const set =
    <K extends keyof FormState>(k: K) =>
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((p) => ({
        ...p,
        [k]: e.target.type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : e.target.value,
      }));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setDone(true);
  };

  return (
    <Section tone="white">
      <Container width="narrow">
        <div className="grid grid-cols-1 lg:grid-cols-[5fr_7fr] gap-12 lg:gap-16 items-start">
          <div>
            <SectionHeading
              eyebrow={isInPerson ? "Request your invite" : "Save your seat"}
              title="Three minutes. Calendar invite within the hour."
              description="We need a few details to send the dial-in (or in-person logistics), tailor any pre-reads, and route you the right time-zone confirmation."
              maxWidth={460}
            />

            <div className="mt-10 grid grid-cols-2 gap-3">
              {[
                { v: "<60 min", l: "To confirmation" },
                { v: "100%",    l: "Free for partners" },
                { v: "Replay",  l: "Always sent" },
                { v: "0 spam",  l: "We promise" },
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
              <div className="text-[18px] font-bold">
                {isInPerson ? "Invite request" : "Registration"}
              </div>
              <PillBadge tone="sage">{event.type}</PillBadge>
            </div>

            {done ? (
              <SuccessBlock event={event} />
            ) : (
              <form onSubmit={submit} className="flex flex-col gap-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Full name">
                    <Input
                      type="text"
                      value={form.fullName}
                      onChange={set("fullName")}
                      placeholder="First and last"
                      required
                    />
                  </Field>
                  <Field label="Work email">
                    <Input
                      type="email"
                      value={form.email}
                      onChange={set("email")}
                      placeholder="name@firm.com"
                      required
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Organization">
                    <Input
                      type="text"
                      value={form.org}
                      onChange={set("org")}
                      placeholder="Legal entity name"
                      required
                    />
                  </Field>
                  <Field label="Role">
                    <Select value={form.role} onChange={set("role")}>
                      {ROLES.map((r) => (
                        <option key={r}>{r}</option>
                      ))}
                    </Select>
                  </Field>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Region">
                    <Select value={form.region} onChange={set("region")}>
                      {REGIONS.map((r) => (
                        <option key={r}>{r}</option>
                      ))}
                    </Select>
                  </Field>
                  <Field label={isInPerson ? "Bringing teammates?" : "Watching with"}>
                    <Select value={form.guests} onChange={set("guests")}>
                      <option>Just me</option>
                      <option>+1 teammate</option>
                      <option>2–4 teammates</option>
                      <option>5+ teammates</option>
                    </Select>
                  </Field>
                </div>

                <Field label="Anything you'd like the hosts to cover? (optional)">
                  <textarea
                    value={form.question}
                    onChange={set("question")}
                    rows={3}
                    placeholder="A specific module, a use case, an objection you're stuck on…"
                    className="w-full px-4 py-3 rounded-bz-md border border-bz-border bg-bz-surface text-[14px] text-bz-text placeholder:text-bz-text-muted/60 focus:outline-none focus:border-bz-sage transition-colors resize-none"
                  />
                </Field>

                <label className="flex items-start gap-3 cursor-pointer text-[13px] text-bz-text">
                  <input
                    type="checkbox"
                    checked={form.reminders}
                    onChange={set("reminders")}
                    className="mt-0.5 size-4 accent-bz-sage"
                  />
                  <span>Send me reminders 24h and 1h before the session.</span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer text-[13px] text-bz-text">
                  <input
                    type="checkbox"
                    checked={form.consent}
                    onChange={set("consent")}
                    className="mt-0.5 size-4 accent-bz-sage"
                    required
                  />
                  <span>
                    I agree to the <a className="text-bz-sage underline" href="#">event policy</a>. Bizak only emails about this session unless I opt in.
                  </span>
                </label>

                <Button variant="primary" size="lg" withArrow>
                  {isInPerson ? "Request invite" : "Save my seat"}
                </Button>
              </form>
            )}
          </Card>
        </div>
      </Container>
    </Section>
  );
}

function SuccessBlock({ event }: { event: PartnerEvent }) {
  const isInPerson = event.format === "In-person";
  return (
    <div>
      <div className="rounded-bz-md border border-bz-sage/30 bg-bz-sage/[0.06] p-6 mb-6">
        <div className="flex items-center gap-2 text-bz-sage font-bold mb-1.5">
          <CheckCircle2 className="size-5" />
          {isInPerson ? "Invite request received" : "You're on the list"}
        </div>
        <p className="text-[14px] text-bz-text-muted leading-[1.65]">
          {isInPerson
            ? "Our partner ops team will confirm your invite and send venue details within the hour."
            : "A calendar invite is on its way. You'll get reminders 24h and 1h before the session, plus the replay the next morning."}
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
  const upcoming = EVENTS.filter((e) => !e.flagship).slice(0, 3);
  return (
    <Section tone="dark" pad="default">
      <Container width="narrow">
        <SectionHeading
          eyebrow="Also on the calendar"
          eyebrowTone="accent"
          title="Other sessions you might want."
          tone="light"
          maxWidth={620}
          align="center"
          className="mx-auto mb-12"
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          {upcoming.map((e) => (
            <Card key={e.slug} tone="dark" pad="md" hover="glow">
              <div className="flex items-center gap-3 mb-4">
                <IconBadge tone="accent" size="sm">
                  <e.Icon className="size-4" />
                </IconBadge>
                <PillBadge tone="neutral">{e.type}</PillBadge>
              </div>
              <div className="text-[15.5px] font-bold mb-2 leading-tight">{e.title}</div>
              <div className="text-[12px] text-white/45 mb-4">{e.date} · {e.duration}</div>
              <a
                href={
                  e.type === "Training"
                    ? `/partners/events/enroll/${e.slug}`
                    : `/partners/events/register/${e.slug}`
                }
                className="inline-flex items-center gap-1.5 text-[13px] font-bold text-bz-accent hover:underline"
              >
                {e.type === "Training" ? "Enroll" : "Register"} <ChevronRight className="size-3.5" />
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
