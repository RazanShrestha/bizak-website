import { useState } from "react";
import {
  CalendarDays,
  MapPin,
  Video,
  Users,
  Sparkles,
  Clock,
  Globe,
  GraduationCap,
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
import { EVENTS, type EventType, type EventFormat } from "./eventsData";

const TYPES: ("All" | EventType)[] = ["All", "Summit", "Training", "Webinar", "Workshop"];
const FORMATS: ("All" | EventFormat)[] = ["All", "In-person", "Virtual", "Hybrid"];

const FORMAT_ICON: Record<EventFormat, typeof Globe> = {
  "In-person": MapPin,
  "Virtual":   Video,
  "Hybrid":    Globe,
};

function ctaForEvent(slug: string, type: EventType) {
  return type === "Training"
    ? { href: `/partners/events/enroll/${slug}`,   label: "Enroll" }
    : { href: `/partners/events/register/${slug}`, label: "Register" };
}

const TYPE_TONE: Record<EventType, "accent" | "sage" | "neutral" | "live"> = {
  Summit:   "accent",
  Training: "sage",
  Webinar:  "neutral",
  Workshop: "sage",
};

function FlagshipPanel() {
  const flagship = EVENTS.find((e) => e.flagship)!;
  const cta = ctaForEvent(flagship.slug, flagship.type);
  return (
    <Card
      tone="dark"
      pad="lg"
      className="relative overflow-hidden bg-bz-deep border-white/10 shadow-[0_24px_64px_rgba(0,0,0,0.18)]"
    >
      <div className="absolute -top-24 -right-24 size-72 rounded-full bg-bz-accent/[0.18] blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-20 size-64 rounded-full bg-bz-sage/20 blur-3xl pointer-events-none" />
      <div className="relative">
        <div className="flex items-center justify-between mb-6">
          <PillBadge tone="accent" dot>FLAGSHIP</PillBadge>
          <Sparkles className="size-5 text-bz-accent" />
        </div>

        <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/50 mb-3">
          Save the date · Sep 24–26
        </div>

        <div className="text-[clamp(28px,3vw,40px)] font-bold tracking-[-0.02em] leading-[1.1] mb-3">
          {flagship.title}
        </div>
        <p className="text-[14.5px] text-white/65 leading-[1.7] mb-7">{flagship.desc}</p>

        <div className="grid grid-cols-3 gap-3 mb-7">
          {[
            { Icon: CalendarDays, l: "3 days · Hybrid" },
            { Icon: MapPin,       l: "Singapore + Live" },
            { Icon: Users,        l: "1,200+ attendees" },
          ].map(({ Icon, l }) => (
            <div key={l} className="rounded-bz-md border border-white/10 bg-white/[0.03] p-3 flex items-center gap-2.5">
              <Icon className="size-3.5 text-bz-accent shrink-0" />
              <span className="text-[12px] text-white/70">{l}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          <Button variant="accent" size="md" href={cta.href} withArrow>
            Save your seat
          </Button>
          <Button variant="ghostDark" size="md" href="#calendar">
            View agenda
          </Button>
        </div>
      </div>
    </Card>
  );
}

function HeroSection() {
  return (
    <Section tone="light" pad="hero" className="biz-mesh">
      <Container width="narrow">
        <div className="grid grid-cols-1 lg:grid-cols-[6fr_5fr] gap-12 lg:gap-16 items-center">
          <div>
            <HeroBadge>Partner Events</HeroBadge>
            <h1 className="mt-5 font-bold tracking-[-0.02em] text-[clamp(36px,5.4vw,60px)] leading-[1.1]">
              Training, summits,<br />
              <span className="text-bz-sage">and field-days.</span>
            </h1>
            <p className="mt-7 text-[17px] leading-[1.7] text-bz-text-muted max-w-[560px]">
              The full calendar of in-person and virtual events certifications, regional architect days, customer-facing webinars you can co-host, and BizakConnect, our flagship summit.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Button variant="primary" size="lg" href="#calendar" withArrow>
                See the Calendar
              </Button>
              <Button variant="outline" size="lg" href="/partners/portal">
                Browse Replays
              </Button>
            </div>
            <div className="mt-12 pt-8 border-t border-bz-border flex flex-wrap gap-x-10 gap-y-5">
              {[
                { v: "40+", l: "Events / year" },
                { v: "12",  l: "Cities" },
                { v: "Free", l: "For partners" },
              ].map((s) => (
                <div key={s.l}>
                  <div className="text-[24px] font-bold leading-tight">{s.v}</div>
                  <div className="mt-1 text-[10.5px] font-bold uppercase tracking-[0.12em] text-bz-text-muted">
                    {s.l}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <FlagshipPanel />
        </div>
      </Container>
    </Section>
  );
}

function CalendarSection() {
  const [type, setType] = useState<"All" | EventType>("All");
  const [format, setFormat] = useState<"All" | EventFormat>("All");

  const filtered = EVENTS.filter((e) => {
    if (type !== "All" && e.type !== type) return false;
    if (format !== "All" && e.format !== format) return false;
    return true;
  });

  return (
    <Section id="calendar" tone="white">
      <Container width="narrow">
        <div className="flex flex-wrap items-end justify-between gap-6 mb-10">
          <SectionHeading
            eyebrow="Calendar"
            title="What's coming up."
            maxWidth={520}
          />
          <div className="text-[12.5px] text-bz-text-muted">
            <span className="font-bold text-bz-text tabular-nums">{filtered.length}</span> of {EVENTS.length} events
          </div>
        </div>

        <div className="rounded-bz-xl border border-bz-border bg-bz-surface p-5 mb-10">
          <div className="flex flex-col gap-3">
            <FilterRow label="Type">
              {TYPES.map((t) => (
                <Chip key={t} active={type === t} onClick={() => setType(t)}>{t}</Chip>
              ))}
            </FilterRow>
            <FilterRow label="Format">
              {FORMATS.map((f) => (
                <Chip key={f} active={format === f} onClick={() => setFormat(f)}>{f}</Chip>
              ))}
            </FilterRow>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {filtered.map((e) => {
            const FmtIcon = FORMAT_ICON[e.format];
            const cta = ctaForEvent(e.slug, e.type);
            return (
              <Card key={e.slug} tone="light" pad="md" hover="lift">
                <div className="grid grid-cols-1 lg:grid-cols-[160px_1fr_auto] gap-6 items-start">
                  <div className="flex lg:flex-col gap-2 items-start">
                    <PillBadge tone={TYPE_TONE[e.type]}>{e.type}</PillBadge>
                    <div className="hidden lg:flex items-center gap-1.5 text-[12px] text-bz-text-muted">
                      <FmtIcon className="size-3.5" /> {e.format}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <IconBadge tone="sage" size="sm">
                        <e.Icon className="size-4" />
                      </IconBadge>
                      <div className="text-[17px] font-bold tracking-[-0.015em]">{e.title}</div>
                    </div>
                    <p className="text-[13.5px] text-bz-text-muted leading-[1.6] mb-3">{e.desc}</p>

                    <div className="flex flex-wrap gap-x-5 gap-y-2 text-[12.5px] text-bz-text-muted">
                      <span className="flex items-center gap-1.5"><CalendarDays className="size-3.5" /> {e.date}</span>
                      <span className="flex items-center gap-1.5"><Clock className="size-3.5" /> {e.duration}</span>
                      <span className="flex items-center gap-1.5"><MapPin className="size-3.5" /> {e.location}</span>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {e.speakers.map((s) => (
                        <span
                          key={s}
                          className="px-2.5 py-1 rounded-bz-pill border border-bz-border bg-bz-bg text-[11px] text-bz-text-muted"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex lg:flex-col gap-2 lg:items-end">
                    <Button variant={e.flagship ? "accent" : "primary"} size="sm" href={cta.href} withArrow>
                      {cta.label}
                    </Button>
                    <Button variant="ghost" size="sm" href={cta.href}>Add to cal</Button>
                  </div>
                </div>
              </Card>
            );
          })}

          {filtered.length === 0 && (
            <div className="rounded-bz-xl border border-dashed border-bz-border p-10 text-center">
              <p className="text-[14px] text-bz-text-muted">
                No events match those filters yet try widening, or check the
                <a className="text-bz-sage font-bold underline ml-1" href="/partners/portal">replay archive</a>.
              </p>
            </div>
          )}
        </div>
      </Container>
    </Section>
  );
}

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-bz-text-muted w-16 shrink-0">
        {label}
      </span>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 h-8 px-3.5 rounded-bz-pill border text-[12.5px] font-semibold transition-colors duration-150 ${
        active
          ? "bg-bz-sage text-white border-bz-sage"
          : "bg-bz-surface text-bz-text-muted border-bz-border hover:border-bz-sage/40 hover:bg-bz-bg"
      }`}
    >
      {children}
    </button>
  );
}

function ReplaysSection() {
  return (
    <Section tone="light">
      <Container width="narrow">
        <div className="grid grid-cols-1 lg:grid-cols-[5fr_7fr] gap-12 lg:gap-16 items-center">
          <SectionHeading
            eyebrow="Missed it?"
            title={<>Every webinar and training is <span className="text-bz-sage">recorded.</span></>}
            description="The replay library is in the Partner Portal. Time-stamped chapters, downloadable decks, and links to the working artifacts every session walks through."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { Icon: Video,        v: "120+",  l: "Replays" },
              { Icon: GraduationCap, v: "9",     l: "Cert tracks" },
              { Icon: CalendarDays,  v: "Weekly", l: "New uploads" },
              { Icon: Users,         v: "640+",  l: "Active partners" },
            ].map(({ Icon, v, l }) => (
              <Card key={l} tone="soft" pad="md" hover="lift">
                <IconBadge tone="sage" size="md" className="mb-4">
                  <Icon className="size-5" />
                </IconBadge>
                <div className="text-[26px] font-bold tabular-nums">{v}</div>
                <div className="text-[12px] text-bz-text-muted mt-0.5 uppercase tracking-[0.06em]">
                  {l}
                </div>
              </Card>
            ))}
          </div>
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
          title={<>See you at BizakConnect.</>}
          description="Three days, one room, the whole network. Save the date registration opens in May."
          tone="light"
          align="center"
          maxWidth={620}
        />
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Button variant="accent" size="lg" href="#calendar" withArrow>
            Save your Seat
          </Button>
          <Button variant="ghostDark" size="lg" href="/partners">
            Become a Partner
          </Button>
        </div>
      </Container>
    </Section>
  );
}

export function PartnerEventsPage() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <Header />
      <main>
        <HeroSection />
        <CalendarSection />
        <ReplaysSection />
        <ClosingCta />
      </main>
      <Footer />
    </div>
  );
}
