import { useEffect, useMemo, useRef, useState } from "react";
import "../../styles/style.css";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Compass,
  Factory,
  FileSpreadsheet,
  Filter,
  Globe2,
  GraduationCap,
  Headphones,
  Layers,
  Mail,
  MapPin,
  MessageSquare,
  Mic,
  PlayCircle,
  Radio,
  Search,
  Sparkles,
  Star,
  Users,
  Video,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import {
  Button,
  Card,
  Container,
  Eyebrow,
  HeroBadge,
  IconBadge,
  PillBadge,
  Section,
  SectionHeading,
} from "./marketing";

// ─── Types ───────────────────────────────────────────────────────────────────

export type FormatKey = "Webinar" | "Workshop" | "Roundtable" | "In-person";
export type TrackKey =
  | "all"
  | "finance"
  | "manufacturing"
  | "distribution"
  | "implementation"
  | "leadership";

export type Event = {
  id: string;
  format: FormatKey;
  track: Exclude<TrackKey, "all">;
  trackLabel: string;
  title: string;
  description: string;
  date: string;       // ISO yyyy-mm-dd
  dateLabel: string;  // pretty label
  timeLabel: string;
  duration: string;
  location: string;
  region: string;
  speakers: { name: string; role: string; initials: string }[];
  capacity?: string;
  popular?: boolean;
};

type Replay = {
  slug: string;
  track: Exclude<TrackKey, "all">;
  trackLabel: string;
  title: string;
  description: string;
  recorded: string;
  runtime: string;
  views: string;
  rating: string;
  speaker: string;
  highlights: string[];
};

// ─── Filter config ───────────────────────────────────────────────────────────

const TRACKS: { key: TrackKey; label: string; icon: LucideIcon }[] = [
  { key: "all",            label: "All sessions",     icon: Layers           },
  { key: "finance",        label: "Finance & close",  icon: FileSpreadsheet  },
  { key: "manufacturing",  label: "Manufacturing",    icon: Factory          },
  { key: "distribution",   label: "Distribution",     icon: Workflow         },
  { key: "implementation", label: "Implementation",   icon: Compass          },
  { key: "leadership",     label: "Leadership",       icon: BarChart3        },
];

const FORMATS: FormatKey[] = ["Webinar", "Workshop", "Roundtable", "In-person"];

export const FORMAT_ICON: Record<FormatKey, LucideIcon> = {
  Webinar: Video,
  Workshop: GraduationCap,
  Roundtable: MessageSquare,
  "In-person": MapPin,
};

// ─── Featured live session (top-of-hero card) ────────────────────────────────

const FEATURED = {
  status: "Live next Thursday",
  title: "Close the books in 48 hours: a live month-end run on Bizak",
  description:
    "Watch a finance team take an unreconciled mid-month state to a fully closed period auto-posted journals, live FX, drill-to-source in one live session.",
  dateLabel: "Thu, 14 May 2026",
  timeLabel: "11:00 SGT · 09:30 IST",
  duration: "60 min · live Q&A",
  speakers: [
    { name: "Renée Yamamoto",    role: "VP, Customer Engineering", initials: "RY" },
    { name: "Marcus Brand",      role: "Director, Finance Practice", initials: "MB" },
  ],
  highlights: [
    "247 journal entries auto-posted in a live demo period",
    "Drill from Net Income → originating PO in two clicks",
    "Q&A with two finance leads who closed in 48h on Bizak",
  ],
  href: "/WebinarsAndEvents/save-seat/live-month-end",
};

// ─── Hero stats ──────────────────────────────────────────────────────────────

const HERO_STATS: { value: string; label: string }[] = [
  { value: "12+",   label: "Sessions every month"     },
  { value: "4,200", label: "Operators last quarter"   },
  { value: "9",     label: "Languages, 18 time zones" },
  { value: "4.7★",  label: "Average attendee rating"  },
];

// ─── Upcoming events ─────────────────────────────────────────────────────────

export const EVENTS: Event[] = [
  {
    id: "live-month-end",
    format: "Webinar",
    track: "finance",
    trackLabel: "Finance & close",
    title: "Close the books in 48 hours: a live month-end run on Bizak",
    description:
      "Watch a finance team take an unreconciled period to a fully closed month auto-posted journals, live FX, drill-to-source in one session.",
    date: "2026-05-14",
    dateLabel: "Thu · 14 May 2026",
    timeLabel: "11:00 SGT · 09:30 IST",
    duration: "60 min",
    location: "Live webinar",
    region: "Global",
    speakers: [
      { name: "Renée Yamamoto", role: "VP, Customer Engineering", initials: "RY" },
      { name: "Marcus Brand",   role: "Director, Finance Practice", initials: "MB" },
    ],
    capacity: "Open · 1,200 registered",
    popular: true,
  },
  {
    id: "oee-shopfloor",
    format: "Webinar",
    track: "manufacturing",
    trackLabel: "Manufacturing",
    title: "From paper travelers to a live OEE dashboard in 14 days",
    description:
      "A walkthrough of wiring shop-floor signals into Bizak work orders, downtime codes, and the OEE board ops review every morning.",
    date: "2026-05-21",
    dateLabel: "Thu · 21 May 2026",
    timeLabel: "10:00 GMT · 15:30 IST",
    duration: "55 min",
    location: "Live webinar",
    region: "EMEA · APAC",
    speakers: [
      { name: "Devansh Gupta", role: "Solutions Lead, Manufacturing", initials: "DG" },
    ],
  },
  {
    id: "warehouse-throughput",
    format: "Workshop",
    track: "distribution",
    trackLabel: "Distribution",
    title: "Warehouse throughput workshop: pick paths, replenishment, returns",
    description:
      "A 90-minute hands-on workshop. Configure a multi-zone warehouse, simulate a peak day, and tune the replenishment rules in your sandbox.",
    date: "2026-05-28",
    dateLabel: "Thu · 28 May 2026",
    timeLabel: "13:00 EST · 10:00 PST",
    duration: "90 min",
    location: "Online · sandbox included",
    region: "Americas",
    speakers: [
      { name: "Lara Okwuosa", role: "Principal Consultant",    initials: "LO" },
      { name: "Iván Reyes",   role: "Senior Solutions Engineer", initials: "IR" },
    ],
    capacity: "75 seats",
  },
  {
    id: "implementation-roundtable",
    format: "Roundtable",
    track: "implementation",
    trackLabel: "Implementation",
    title: "60-day rollout roundtable: three live cutovers, one room",
    description:
      "Three project leads from recently-live Bizak rollouts compare cutover plans, war-room setups, and the calls they'd make differently.",
    date: "2026-06-04",
    dateLabel: "Thu · 04 Jun 2026",
    timeLabel: "16:00 CET · 19:30 IST",
    duration: "75 min",
    location: "Invite-only · ≤30 seats",
    region: "EMEA",
    speakers: [
      { name: "Anya Petrova", role: "Implementation Director", initials: "AP" },
    ],
    capacity: "Invite-only",
  },
  {
    id: "cfo-roundtable-london",
    format: "In-person",
    track: "leadership",
    trackLabel: "Leadership",
    title: "Bizak Forum London: the CFO's operating system",
    description:
      "An evening with mid-market CFOs on consolidation, the close cadence, and how a live ledger reshapes the finance function.",
    date: "2026-06-12",
    dateLabel: "Fri · 12 Jun 2026",
    timeLabel: "18:00 BST",
    duration: "Half-day · dinner",
    location: "The Ned · London",
    region: "EMEA",
    speakers: [
      { name: "Suraj Khanna",     role: "Chief Customer Officer",    initials: "SK" },
      { name: "Helen O'Connor",   role: "Partner, Field Finance",    initials: "HO" },
    ],
    capacity: "60 seats",
  },
  {
    id: "multi-entity-deep-dive",
    format: "Webinar",
    track: "finance",
    trackLabel: "Finance & close",
    title: "Multi-entity, multi-currency: a deep dive into auto-consolidation",
    description:
      "How Bizak rolls up branch-level P&Ls, runs intercompany eliminations, and translates FX without a separate consolidation tool.",
    date: "2026-06-18",
    dateLabel: "Thu · 18 Jun 2026",
    timeLabel: "09:00 SGT · 11:00 AEST",
    duration: "60 min",
    location: "Live webinar",
    region: "APAC",
    speakers: [
      { name: "Priya Anand",   role: "Senior Product Manager", initials: "PA" },
    ],
  },
];

// ─── On-demand library ──────────────────────────────────────────────────────

const REPLAYS: Replay[] = [
  {
    slug: "spreadsheet-to-bizak",
    track: "finance",
    trackLabel: "Finance & close",
    title: "Spreadsheet hell to operating system: a 90-day finance reset",
    description:
      "A finance lead walks through replacing six tools and a forest of Excel with one live ledger and what changed by week 12.",
    recorded: "April 2026",
    runtime: "52 min",
    views: "8.4K",
    rating: "4.8",
    speaker: "Marcus Brand",
    highlights: ["Old stack mapped", "Auto-posting in action", "Q&A: 22 minutes"],
  },
  {
    slug: "live-pnl-walkthrough",
    track: "finance",
    trackLabel: "Finance & close",
    title: "Click any number, see its source: a live P&L walkthrough",
    description:
      "Drill from consolidated Net Income down to the originating invoice line. Every figure resolves to its source and the audit trail follows.",
    recorded: "March 2026",
    runtime: "38 min",
    views: "12.1K",
    rating: "4.9",
    speaker: "Renée Yamamoto",
    highlights: ["Cross-entity drill", "Audit trail tour", "Ledger anatomy"],
  },
  {
    slug: "oee-87-percent",
    track: "manufacturing",
    trackLabel: "Manufacturing",
    title: "Inside an 87.4% OEE shop floor what the dashboard actually shows",
    description:
      "A live tour of the Bizak floor view: availability, performance, quality broken down by line, with downtime codes and root-cause flow.",
    recorded: "March 2026",
    runtime: "45 min",
    views: "6.7K",
    rating: "4.7",
    speaker: "Devansh Gupta",
    highlights: ["Live OEE board", "Downtime root cause", "Work order flow"],
  },
  {
    slug: "warehouse-throughput",
    track: "distribution",
    trackLabel: "Distribution",
    title: "Pick paths, replenishment, and a 96.2% on-time delivery rate",
    description:
      "How distribution teams use Bizak's wave planning and multi-channel inventory to keep on-time at 96%+ during seasonal peaks.",
    recorded: "February 2026",
    runtime: "41 min",
    views: "5.2K",
    rating: "4.6",
    speaker: "Lara Okwuosa",
    highlights: ["Wave planning", "Multi-channel inventory", "Peak-day tuning"],
  },
  {
    slug: "go-live-war-room",
    track: "implementation",
    trackLabel: "Implementation",
    title: "Inside a Bizak war room: the cutover weekend, hour-by-hour",
    description:
      "An implementation director walks through the runbook for a Friday-to-Monday cutover, including the rollback gates and the day-30 health report.",
    recorded: "February 2026",
    runtime: "58 min",
    views: "4.1K",
    rating: "4.8",
    speaker: "Anya Petrova",
    highlights: ["Hour-by-hour runbook", "Rollback gates", "Day-30 report"],
  },
  {
    slug: "cfo-fireside",
    track: "leadership",
    trackLabel: "Leadership",
    title: "Fireside: a CFO's case for replacing NetSuite with Bizak",
    description:
      "A 40-minute conversation with a mid-market CFO on the build-vs-buy call, the migration risk, and the close-cadence change.",
    recorded: "January 2026",
    runtime: "42 min",
    views: "9.8K",
    rating: "4.9",
    speaker: "Helen O'Connor",
    highlights: ["Build-vs-buy frame", "Migration risk", "Close cadence"],
  },




  
];

// ─── Series strip ────────────────────────────────────────────────────────────

type Series = {
  icon: LucideIcon;
  cadence: string;
  title: string;
  description: string;
  next: string;
  highlight?: boolean;
};

const SERIES: Series[] = [
  {
    icon: Radio,
    cadence: "Weekly · Thursdays",
    title: "Mid-Market Mondays",
    description:
      "A 60-minute live demo every week. One module, one operator, one outcome no slideware.",
    next: "Next: live month-end · 14 May",
    highlight: true,
  },
  {
    icon: Headphones,
    cadence: "Twice a month",
    title: "ERP Office Hours",
    description:
      "Open Q&A with a Bizak engineer. Bring a real config question; leave with a recorded answer.",
    next: "Next session: 22 May · 14:00 GMT",
  },
  {
    icon: Sparkles,
    cadence: "Monthly",
    title: "Industry Deep-Dives",
    description:
      "A 90-minute walk-through for one vertical manufacturing, distribution, services, retail.",
    next: "Next: warehouse throughput · 28 May",
  },
];

// ─── Hosts ───────────────────────────────────────────────────────────────────

const HOSTS = [
  { initials: "RY", name: "Renée Yamamoto", role: "VP, Customer Engineering" },
  { initials: "MB", name: "Marcus Brand",   role: "Director, Finance Practice" },
  { initials: "DG", name: "Devansh Gupta",  role: "Solutions Lead, Manufacturing" },
  { initials: "LO", name: "Lara Okwuosa",   role: "Principal Consultant" },
  { initials: "AP", name: "Anya Petrova",   role: "Implementation Director" },
  { initials: "HO", name: "Helen O'Connor", role: "Partner, Field Finance" },
];

// ─── Hero ────────────────────────────────────────────────────────────────────

function HeroSection() {
  return (
    <Section pad="hero" tone="light" className="biz-mesh overflow-hidden">
      <Container className="relative">
        <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-[1.05fr_1fr] lg:gap-20">
          {/* Left text */}
          <div className="max-w-[640px]">
            <HeroBadge>Webinars &amp; Events</HeroBadge>
            <h1 className="mt-4 text-[clamp(40px,5.2vw,60px)] font-bold leading-[1.05] tracking-[-0.03em] text-bz-text">
              Live demos.{" "}
              <span className="relative inline-block">
                Real numbers.
                <span className="absolute inset-x-0 bottom-1 -z-0 h-[10px] rounded-full bg-bz-accent/55" />
              </span>{" "}
              Recorded forever.
            </h1>
            <p className="mt-5 max-w-[560px] text-[17px] leading-[1.7] text-bz-text-muted">
              Watch the Bizak team and our customers run real periods, real
              floors and real cutovers live, on the record, with the data on
              screen. Then replay any session in the on-demand library.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button variant="primary" size="md" href="#upcoming" withArrow>
                Browse upcoming
              </Button>
              <Button variant="ghost" size="md" href="#on-demand">
                Watch on-demand
              </Button>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-bz-text-soft">
              <span className="inline-flex items-center gap-1.5">
                <Radio className="size-[14px] text-bz-sage" strokeWidth={1.8} />
                12+ live sessions a month
              </span>
              <span aria-hidden className="size-1 rounded-full bg-bz-text-soft/40" />
              <span>Always free · always recorded</span>
              <span aria-hidden className="size-1 rounded-full bg-bz-text-soft/40" />
              <span>Q&amp;A in every session</span>
            </div>
          </div>

          {/* Right featured live card */}
          <a
            href={FEATURED.href}
            className="group relative mx-auto block w-full max-w-[460px] overflow-hidden rounded-bz-2xl border border-bz-border bg-bz-deep shadow-[0_24px_64px_rgba(15,17,14,0.18)] transition-transform duration-300 hover:-translate-y-1 lg:mx-0"
          >
            <div className="relative p-8 md:p-9">
              <div className="flex items-center justify-between gap-3">
                <PillBadge tone="live" dot>
                  {FEATURED.status}
                </PillBadge>
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/55">
                  Webinar · 60 min
                </span>
              </div>

              <h2 className="mt-7 text-[clamp(22px,2.6vw,30px)] font-bold leading-[1.2] tracking-[-0.01em] text-white">
                {FEATURED.title}
              </h2>
              <p className="mt-4 text-[14.5px] leading-[1.65] text-white/65">
                {FEATURED.description}
              </p>

              {/* Highlights */}
              <ul className="mt-7 space-y-3">
                {FEATURED.highlights.map((h) => (
                  <li
                    key={h}
                    className="flex items-start gap-3 text-[13.5px] leading-[1.55] text-white/75"
                  >
                    <CheckCircle2
                      className="mt-0.5 size-[15px] shrink-0 text-bz-accent"
                      strokeWidth={2}
                    />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>

              {/* Speakers */}
              <div className="mt-8 flex items-center gap-3 border-t border-white/10 pt-5">
                <div className="flex -space-x-2">
                  {FEATURED.speakers.map((s) => (
                    <span
                      key={s.initials}
                      className="inline-flex size-9 items-center justify-center rounded-full border border-white/15 bg-white/[0.08] text-[12px] font-bold text-white"
                    >
                      {s.initials}
                    </span>
                  ))}
                </div>
                <div className="leading-tight">
                  <div className="text-[12.5px] font-semibold text-white">
                    {FEATURED.speakers.map((s) => s.name).join(" + ")}
                  </div>
                  <div className="text-[11.5px] text-white/55">
                    {FEATURED.dateLabel} · {FEATURED.timeLabel}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/50">
                  {FEATURED.duration}
                </span>
                <span className="inline-flex items-center gap-1.5 text-[13px] font-bold text-bz-accent transition-transform duration-200 group-hover:translate-x-0.5">
                  Save my seat
                  <ArrowUpRight className="size-[14px]" strokeWidth={2.2} />
                </span>
              </div>
            </div>
          </a>
        </div>

        {/* Stats strip */}
        <div className="mt-16 grid grid-cols-2 gap-x-6 gap-y-8 border-t border-bz-border pt-10 md:grid-cols-4">
          {HERO_STATS.map((s) => (
            <div key={s.label} className="flex flex-col">
              <span className="text-[28px] font-bold tabular-nums tracking-[-0.02em] text-bz-text md:text-[32px]">
                {s.value}
              </span>
              <span className="mt-1 text-[12px] uppercase tracking-[0.1em] text-bz-text-soft">
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}

// ─── Series strip ────────────────────────────────────────────────────────────

function SeriesSection() {
  return (
    <Section tone="white" pad="default">
      <Container>
        <SectionHeading
          eyebrow="Three series, one calendar"
          title={
            <>
              The shows we run on the Bizak{" "}
              <span className="text-bz-sage">live channel.</span>
            </>
          }
          description="Pick a series and bookmark it. We run the same three formats on a steady cadence so finance and ops teams know exactly when to tune in."
          maxWidth={760}
          className="mb-12"
        />

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {SERIES.map(({ icon: SeriesIcon, ...s }) => (
            <Card
              key={s.title}
              tone="light"
              pad="lg"
              hover="lift"
              className={s.highlight ? "border-bz-sage-mid" : ""}
            >
              <div className="flex items-center justify-between">
                <IconBadge size="lg" tone={s.highlight ? "accent" : "sage"}>
                  <SeriesIcon className="size-5" strokeWidth={1.8} />
                </IconBadge>
                <PillBadge tone={s.highlight ? "accent" : "neutral"} dot={s.highlight}>
                  {s.cadence}
                </PillBadge>
              </div>

              <h3 className="mt-7 text-[22px] font-bold tracking-[-0.01em] text-bz-text">
                {s.title}
              </h3>
              <p className="mt-3 text-[14.5px] leading-[1.7] text-bz-text-muted">
                {s.description}
              </p>

              <div className="mt-6 inline-flex items-center gap-2 rounded-bz-pill bg-bz-bg px-3 py-1.5 text-[12px] font-semibold text-bz-text-muted">
                <CalendarDays className="size-[13px] text-bz-sage" strokeWidth={2} />
                {s.next}
              </div>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}

// ─── Upcoming events ─────────────────────────────────────────────────────────

function UpcomingSection() {
  const [track, setTrack] = useState<TrackKey>("all");
  const [activeFormats, setActiveFormats] = useState<Set<FormatKey>>(new Set());
  const [query, setQuery] = useState("");

  const counts = useMemo(() => {
    const map: Record<TrackKey, number> = {
      all: EVENTS.length,
      finance: 0,
      manufacturing: 0,
      distribution: 0,
      implementation: 0,
      leadership: 0,
    };
    EVENTS.forEach((e) => {
      map[e.track] += 1;
    });
    return map;
  }, []);

  const items = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    return EVENTS.filter((e) => {
      if (track !== "all" && e.track !== track) return false;
      if (activeFormats.size > 0 && !activeFormats.has(e.format)) return false;
      if (trimmed.length > 0) {
        const haystack = `${e.title} ${e.description} ${e.location}`.toLowerCase();
        if (!haystack.includes(trimmed)) return false;
      }
      return true;
    });
  }, [track, activeFormats, query]);

  const toggleFormat = (f: FormatKey) => {
    setActiveFormats((prev) => {
      const next = new Set(prev);
      if (next.has(f)) next.delete(f);
      else next.add(f);
      return next;
    });
  };

  return (
    <Section tone="light" pad="default" id="upcoming">
      <Container>
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between md:gap-10">
          <div className="max-w-[620px]">
            <Eyebrow>Upcoming sessions</Eyebrow>
            <h2 className="mt-3 text-[clamp(28px,3.4vw,40px)] font-bold leading-[1.1] tracking-[-0.02em] text-bz-text">
              Pick a session. Save your seat.
            </h2>
            <p className="mt-3 text-[15px] leading-[1.7] text-bz-text-muted">
              Filter by team, format, or what you're shipping this quarter. New
              live sessions are scheduled every week every one is recorded
              and added to the on-demand library the next morning.
            </p>
          </div>

          {/* Search */}
          <div className="w-full max-w-[360px]">
            <div className="flex h-[46px] items-center gap-2 rounded-bz-pill border border-bz-border bg-bz-surface pl-4 pr-2 shadow-[0_2px_10px_rgba(15,17,14,0.04)] focus-within:border-bz-sage-mid focus-within:shadow-[0_8px_24px_rgba(15,17,14,0.06)]">
              <Search className="size-4 shrink-0 text-bz-text-soft" strokeWidth={1.8} />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search sessions…"
                aria-label="Search webinars and events"
                className="flex-1 bg-transparent text-[14px] text-bz-text placeholder:text-bz-text-soft focus:outline-none"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="rounded-bz-pill px-2 py-1 text-[11px] font-semibold text-bz-text-soft hover:text-bz-text"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Track pills */}
        <div className="-mx-6 mt-10 overflow-x-auto px-6 md:mx-0 md:overflow-visible md:px-0">
          <div className="flex min-w-max flex-nowrap items-center gap-2 md:min-w-0 md:flex-wrap">
            {TRACKS.map((c) => {
              const TrackIcon = c.icon;
              const isActive = track === c.key;
              return (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => setTrack(c.key)}
                  aria-pressed={isActive}
                  className={[
                    "inline-flex shrink-0 items-center gap-2 rounded-bz-pill border px-3.5 py-2 text-[13px] font-semibold transition-colors",
                    isActive
                      ? "border-bz-deep bg-bz-deep text-white"
                      : "border-bz-border bg-bz-surface text-bz-text-muted hover:border-bz-sage-mid hover:bg-bz-sage-soft hover:text-bz-text",
                  ].join(" ")}
                >
                  <TrackIcon
                    className={[
                      "size-[14px]",
                      isActive ? "text-bz-accent" : "text-bz-text-soft",
                    ].join(" ")}
                    strokeWidth={1.8}
                  />
                  <span>{c.label}</span>
                  <span
                    className={[
                      "rounded-bz-pill px-1.5 text-[11px] font-bold tabular-nums",
                      isActive
                        ? "bg-white/15 text-white/75"
                        : "bg-bz-bg text-bz-text-soft",
                    ].join(" ")}
                  >
                    {counts[c.key]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Format chips */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-bz-text-soft">
            <Filter className="size-[12px]" strokeWidth={2} />
            Format
          </span>
          {FORMATS.map((f) => {
            const isActive = activeFormats.has(f);
            const FmtIcon = FORMAT_ICON[f];
            return (
              <button
                key={f}
                type="button"
                onClick={() => toggleFormat(f)}
                aria-pressed={isActive}
                className={[
                  "inline-flex items-center gap-1.5 rounded-bz-pill border px-3 py-1.5 text-[12px] font-semibold transition-colors",
                  isActive
                    ? "border-bz-sage bg-bz-sage-soft text-bz-sage"
                    : "border-bz-border bg-bz-surface text-bz-text-muted hover:border-bz-sage-mid hover:text-bz-text",
                ].join(" ")}
              >
                <FmtIcon className="size-[12px]" strokeWidth={2} />
                {f}
              </button>
            );
          })}
          {(activeFormats.size > 0 || track !== "all" || query) && (
            <button
              type="button"
              onClick={() => {
                setActiveFormats(new Set());
                setTrack("all");
                setQuery("");
              }}
              className="ml-1 rounded-bz-pill px-2 py-1 text-[11.5px] font-semibold text-bz-text-soft underline-offset-2 hover:text-bz-text hover:underline"
            >
              Reset
            </button>
          )}
        </div>

        {/* Results */}
        {items.length === 0 ? (
          <div className="mt-12 rounded-bz-xl border border-dashed border-bz-border bg-bz-surface p-12 text-center">
            <h3 className="text-[18px] font-bold text-bz-text">
              Nothing on the calendar matches those filters.
            </h3>
            <p className="mt-2 text-[14px] text-bz-text-muted">
              Reset the filters or sign up below we add new sessions every
              week and email subscribers first.
            </p>
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2">
            {items.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}

        <div className="mt-8 text-[12.5px] text-bz-text-soft">
          Showing <span className="font-bold text-bz-text">{items.length}</span> of{" "}
          <span className="font-bold text-bz-text">{EVENTS.length}</span> upcoming sessions
        </div>
      </Container>
    </Section>
  );
}

function EventCard({ event }: { event: Event }) {
  const FormatIcon = FORMAT_ICON[event.format];
  const isInPerson = event.format === "In-person";
  return (
    <Card
      tone="light"
      pad="md"
      hover="lift"
      className="group flex h-full flex-col overflow-hidden p-0"
    >
      {/* Date band */}
      <div className="flex items-stretch gap-0">
        <div className="flex w-[112px] shrink-0 flex-col items-center justify-center border-r border-bz-border-soft bg-bz-bg py-5">
          <span className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-bz-text-soft">
            {event.dateLabel.split(" · ")[0]}
          </span>
          <span className="mt-1 text-[28px] font-bold tabular-nums leading-none tracking-[-0.02em] text-bz-text">
            {new Date(event.date).getDate()}
          </span>
          <span className="mt-1 text-[11.5px] font-semibold uppercase tracking-[0.1em] text-bz-text-muted">
            {new Date(event.date).toLocaleString("en", { month: "short" })}{" "}
            {new Date(event.date).getFullYear()}
          </span>
        </div>

        <div className="flex flex-1 flex-col p-6">
          <div className="flex items-center justify-between gap-3">
            <PillBadge tone={isInPerson ? "accent" : "sage"} dot={event.popular}>
              <span className="inline-flex items-center gap-1.5">
                <FormatIcon className="size-[11px]" strokeWidth={2.2} />
                {event.format}
              </span>
            </PillBadge>
            <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-bz-text-soft">
              {event.trackLabel}
            </span>
          </div>

          <h3 className="mt-4 text-[17.5px] font-bold leading-[1.3] tracking-[-0.005em] text-bz-text transition-colors group-hover:text-bz-sage">
            {event.title}
          </h3>
          <p className="mt-2 flex-1 text-[13.5px] leading-[1.65] text-bz-text-muted">
            {event.description}
          </p>

          {/* Meta */}
          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-[12px] text-bz-text-soft">
            <span className="inline-flex items-center gap-1.5">
              <Clock3 className="size-[12px]" strokeWidth={2} />
              {event.timeLabel} · {event.duration}
            </span>
            <span aria-hidden className="size-1 rounded-full bg-bz-text-soft/40" />
            <span className="inline-flex items-center gap-1.5">
              {isInPerson ? (
                <MapPin className="size-[12px]" strokeWidth={2} />
              ) : (
                <Globe2 className="size-[12px]" strokeWidth={2} />
              )}
              {event.location}
            </span>
          </div>

          {/* Speakers + CTA */}
          <div className="mt-5 flex items-center justify-between gap-3 border-t border-bz-border-soft pt-4">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {event.speakers.map((s) => (
                  <span
                    key={s.initials}
                    className="inline-flex size-8 items-center justify-center rounded-full border border-bz-border bg-bz-sage-soft text-[11px] font-bold text-bz-sage"
                  >
                    {s.initials}
                  </span>
                ))}
              </div>
              <div className="hidden text-[11.5px] leading-tight text-bz-text-muted sm:block">
                <div className="font-semibold text-bz-text">
                  {event.speakers[0].name}
                </div>
                {event.speakers.length > 1 ? (
                  <div className="text-bz-text-soft">
                    + {event.speakers.length - 1} more
                  </div>
                ) : (
                  <div className="text-bz-text-soft">{event.speakers[0].role}</div>
                )}
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              href={`/WebinarsAndEvents/save-seat/${event.id}`}
              withArrow
            >
              {isInPerson ? "Request invite" : "Save seat"}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

// ─── On-demand library ──────────────────────────────────────────────────────

const REPLAYS_PREVIEW_COUNT = 3;

function OnDemandSection() {
  const [track, setTrack] = useState<TrackKey>("all");
  const [expanded, setExpanded] = useState(false);
  const filtersRef = useRef<HTMLDivElement | null>(null);

  const counts = useMemo(() => {
    const map: Record<TrackKey, number> = {
      all: REPLAYS.length,
      finance: 0,
      manufacturing: 0,
      distribution: 0,
      implementation: 0,
      leadership: 0,
    };
    REPLAYS.forEach((r) => {
      map[r.track] += 1;
    });
    return map;
  }, []);

  const filtered = useMemo(
    () => (track === "all" ? REPLAYS : REPLAYS.filter((r) => r.track === track)),
    [track],
  );

  const canToggle = filtered.length > REPLAYS_PREVIEW_COUNT;
  const items = expanded && canToggle
    ? filtered
    : filtered.slice(0, REPLAYS_PREVIEW_COUNT);

  // Switching tracks resets the "expanded" view so each filter starts collapsed.
  useEffect(() => {
    setExpanded(false);
  }, [track]);

  return (
    <Section tone="white" pad="default" id="on-demand">
      <Container>
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between md:gap-10">
          <SectionHeading
            eyebrow="On-demand library"
            title={
              <>
                Every session, replayable{" "}
                <span className="text-bz-sage">indexed by chapter.</span>
              </>
            }
            description="Past webinars, workshops and roundtables. Each replay is captioned, chapter-marked, and available the morning after the live session."
            maxWidth={680}
          />
          <PillBadge tone="neutral">
            <span className="inline-flex items-center gap-1.5">
              <PlayCircle className="size-[12px]" strokeWidth={2} />
              {REPLAYS.length} replays · captions in 9 languages
            </span>
          </PillBadge>
        </div>

        {/* Track filter */}
        <div
          ref={filtersRef}
          className="-mx-6 mt-10 overflow-x-auto px-6 scroll-mt-28 md:mx-0 md:overflow-visible md:px-0"
        >
          <div className="flex min-w-max flex-nowrap items-center gap-2 md:min-w-0 md:flex-wrap">
            {TRACKS.map((c) => {
              const TrackIcon = c.icon;
              const isActive = track === c.key;
              return (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => setTrack(c.key)}
                  aria-pressed={isActive}
                  className={[
                    "inline-flex shrink-0 items-center gap-2 rounded-bz-pill border px-3.5 py-2 text-[13px] font-semibold transition-colors",
                    isActive
                      ? "border-bz-deep bg-bz-deep text-white"
                      : "border-bz-border bg-bz-surface text-bz-text-muted hover:border-bz-sage-mid hover:bg-bz-sage-soft hover:text-bz-text",
                  ].join(" ")}
                >
                  <TrackIcon
                    className={[
                      "size-[14px]",
                      isActive ? "text-bz-accent" : "text-bz-text-soft",
                    ].join(" ")}
                    strokeWidth={1.8}
                  />
                  <span>{c.label}</span>
                  <span
                    className={[
                      "rounded-bz-pill px-1.5 text-[11px] font-bold tabular-nums",
                      isActive
                        ? "bg-white/15 text-white/75"
                        : "bg-bz-bg text-bz-text-soft",
                    ].join(" ")}
                  >
                    {counts[c.key]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Replay grid fade-in/slide-up per card, with a stagger on the
            cards beyond the preview window so newly-revealed replays feel
            like they're loading in. */}
        <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {items.map((replay, index) => {
            const isRevealed = index >= REPLAYS_PREVIEW_COUNT;
            return (
              <div
                key={replay.slug}
                className={
                  isRevealed
                    ? "animate-in fade-in slide-in-from-bottom-3 duration-500 ease-out"
                    : ""
                }
                style={
                  isRevealed
                    ? { animationDelay: `${(index - REPLAYS_PREVIEW_COUNT) * 80}ms` }
                    : undefined
                }
              >
                <ReplayCard replay={replay} />
              </div>
            );
          })}
        </div>

        {canToggle && (
          <div className="mt-10 flex flex-col items-center gap-2 text-center">
            <Button
              variant="outline"
              size="md"
              onClick={() => {
                const willCollapse = expanded;
                setExpanded((prev) => !prev);
                if (willCollapse) {
                  // Scroll the user back up to the track filter so the
                  // collapsed view starts where they entered it.
                  requestAnimationFrame(() => {
                    filtersRef.current?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                  });
                }
              }}
              withArrow={!expanded}
            >
              {expanded
                ? "Show fewer replays"
                : `Browse the full library · ${filtered.length} replays`}
            </Button>
            {!expanded && (
              <span className="text-[12px] text-bz-text-soft">
                Showing {items.length} of {filtered.length} replays
              </span>
            )}
          </div>
        )}
      </Container>
    </Section>
  );
}

function ReplayCard({ replay }: { replay: Replay }) {
  return (
    <a
      href={`#${replay.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-bz-xl border border-bz-border bg-bz-surface transition-all duration-200 hover:-translate-y-[2px] hover:border-bz-sage-mid hover:shadow-[0_16px_40px_rgba(15,17,14,0.06)]"
    >
      {/* Thumbnail-style header */}
      <div className="relative flex h-[160px] items-center justify-center overflow-hidden border-b border-bz-border-soft bg-bz-deep">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-50"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 30%, rgba(199,255,53,0.18), transparent 55%), radial-gradient(circle at 80% 70%, rgba(122,130,109,0.35), transparent 60%)",
          }}
        />
        <div className="relative inline-flex size-14 items-center justify-center rounded-full bg-bz-accent text-bz-deep shadow-[0_12px_30px_rgba(199,255,53,0.35)] transition-transform duration-200 group-hover:scale-105">
          <PlayCircle className="size-7" strokeWidth={2} />
        </div>

        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between border-t border-white/10 bg-black/30 px-4 py-2 text-[11px] font-semibold text-white/85">
          <span className="inline-flex items-center gap-1.5">
            <Clock3 className="size-[12px] text-bz-accent" strokeWidth={2} />
            {replay.runtime}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Star className="size-[12px] text-bz-accent" strokeWidth={2} />
            {replay.rating} · {replay.views} views
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center justify-between gap-3">
          <PillBadge tone="sage">{replay.trackLabel}</PillBadge>
          <span className="text-[11px] uppercase tracking-[0.08em] text-bz-text-soft">
            {replay.recorded}
          </span>
        </div>

        <h3 className="mt-4 text-[17px] font-bold leading-[1.3] tracking-[-0.005em] text-bz-text transition-colors group-hover:text-bz-sage">
          {replay.title}
        </h3>
        <p className="mt-2 flex-1 text-[13.5px] leading-[1.65] text-bz-text-muted">
          {replay.description}
        </p>

        <div className="mt-5 flex flex-wrap gap-1.5">
          {replay.highlights.map((h) => (
            <span
              key={h}
              className="rounded-bz-pill bg-bz-bg px-2.5 py-1 text-[11px] font-semibold text-bz-text-muted"
            >
              {h}
            </span>
          ))}
        </div>

        <div className="mt-5 flex items-center justify-between gap-3 border-t border-bz-border-soft pt-4">
          <div className="inline-flex items-center gap-2 text-[12px] font-semibold text-bz-text-muted">
            <Mic className="size-[12px] text-bz-sage" strokeWidth={2} />
            {replay.speaker}
          </div>
          <span className="inline-flex items-center gap-1 text-[12.5px] font-bold text-bz-sage transition-transform duration-200 group-hover:translate-x-0.5">
            Watch replay
            <ArrowUpRight className="size-[13px]" strokeWidth={2.2} />
          </span>
        </div>
      </div>
    </a>
  );
}

// ─── Hosts strip ─────────────────────────────────────────────────────────────

function HostsSection() {
  return (
    <Section tone="light" pad="compact">
      <Container>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[360px_1fr] lg:items-center lg:gap-16">
          <div>
            <Eyebrow>Hosted by the build team</Eyebrow>
            <h2 className="mt-3 text-[32px] font-bold leading-[1.1] tracking-[-0.02em] text-bz-text md:text-[36px]">
              Engineers, consultants and operators not marketers.
            </h2>
            <p className="mt-4 text-[15.5px] leading-[1.7] text-bz-text-muted">
              Every session is hosted by a Bizak engineer, a senior consultant,
              or a customer who actually runs the workflow. No slideware decks,
              no speaker fees just the people who built and operate the
              product.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {HOSTS.map((h) => (
              <div
                key={h.initials}
                className="flex items-center gap-3 rounded-bz-lg border border-bz-border bg-bz-surface p-4"
              >
                <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-bz-sage-soft text-[12px] font-bold text-bz-sage">
                  {h.initials}
                </span>
                <div className="min-w-0 leading-tight">
                  <div className="truncate text-[13px] font-semibold text-bz-text">
                    {h.name}
                  </div>
                  <div className="truncate text-[11.5px] text-bz-text-soft">
                    {h.role}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}

// ─── Notify-me ───────────────────────────────────────────────────────────────

function NotifySection() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Reset the success pill 6s after submitting so the form is reusable.
  useEffect(() => {
    if (!submitted) return;
    const t = window.setTimeout(() => setSubmitted(false), 6000);
    return () => window.clearTimeout(t);
  }, [submitted]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email.trim()) {
      inputRef.current?.focus();
      return;
    }
    setSubmitted(true);
    setEmail("");
  };

  return (
    <Section tone="white" pad="compact">
      <Container width="narrow">
        <Card tone="soft" pad="lg" className="overflow-hidden">
          <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-[1fr_auto] md:gap-12">
            <div className="max-w-[520px]">
              <div className="inline-flex items-center gap-2 rounded-bz-pill bg-bz-sage-soft px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-bz-sage">
                <Bell className="size-[12px]" strokeWidth={2.2} />
                Live alerts
              </div>
              <h2 className="mt-4 text-[26px] font-bold leading-[1.15] tracking-[-0.015em] text-bz-text md:text-[30px]">
                Be the first to know when a session goes live.
              </h2>
              <p className="mt-3 text-[14.5px] leading-[1.7] text-bz-text-muted">
                One email a week, Friday morning. The full schedule, the new
                replays, and a one-line note on what we're shipping next.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="w-full md:w-[420px]"
              aria-label="Subscribe to webinar alerts"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <label className="flex h-[48px] flex-1 items-center gap-2 rounded-bz-md border border-bz-border bg-bz-surface px-4 focus-within:border-bz-sage-mid focus-within:shadow-[0_8px_24px_rgba(15,17,14,0.06)]">
                  <Mail className="size-4 shrink-0 text-bz-text-soft" strokeWidth={1.8} />
                  <input
                    ref={inputRef}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@company.com"
                    className="flex-1 bg-transparent text-[14px] text-bz-text placeholder:text-bz-text-soft focus:outline-none"
                  />
                </label>
                <Button variant="primary" size="md" withArrow>
                  Notify me
                </Button>
              </div>
              <p className="mt-3 text-[12px] text-bz-text-soft">
                {submitted ? (
                  <span className="inline-flex items-center gap-1.5 text-bz-sage">
                    <CheckCircle2 className="size-[13px]" strokeWidth={2} />
                    You're on the list first email lands this Friday.
                  </span>
                ) : (
                  <>No spam. Unsubscribe in one click.</>
                )}
              </p>
            </form>
          </div>
        </Card>
      </Container>
    </Section>
  );
}

// ─── Closing CTA ─────────────────────────────────────────────────────────────

function ClosingCta() {
  return (
    <Section tone="dark" pad="default">
      <Container width="narrow">
        <SectionHeading
          eyebrow="Want a session of your own?"
          eyebrowTone="accent"
          title={
            <>
              Or skip the calendar book a{" "}
              <span className="text-bz-accent">private walk-through.</span>
            </>
          }
          description="Bring your numbers, your team, and the modules you're evaluating. We'll run a live demo against your real data same format as the public webinars, just with your name on the agenda."
          tone="light"
          align="center"
          maxWidth={680}
        />
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Button variant="accent" size="lg" href="/contact" withArrow>
            Book a private demo
          </Button>
          <Button variant="ghostDark" size="lg" href="#upcoming">
            See public sessions
          </Button>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 border-t border-white/10 pt-8 text-[13px] text-white/55">
          {[
            { icon: Users,    label: "50,000+ businesses powered by Bizak" },
            { icon: Radio,    label: "12+ live sessions every month" },
            { icon: Sparkles, label: "Always free · always recorded" },
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

// ─── Lookups ─────────────────────────────────────────────────────────────────

export function findEventById(id: string | undefined): Event | undefined {
  if (!id) return undefined;
  return EVENTS.find((e) => e.id === id);
}

// ─── Page ────────────────────────────────────────────────────────────────────

export function WebinarsAndEvents() {
  return (
    <div>
      <Header />
      <main style={{ paddingTop: 76 }}>
        <HeroSection />
        <SeriesSection />
        <UpcomingSection />
        <OnDemandSection />
        <HostsSection />
        <NotifySection />
        <ClosingCta />
      </main>
      <Footer />
    </div>
  );
}
