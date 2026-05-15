import {
  Trophy,
  Award,
  Star,
  TrendingUp,
  Globe,
  Crown,
  Heart,
  Rocket,
  CalendarClock,
  Sparkles,
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

const CATEGORIES = [
  { Icon: Crown,       title: "Partner of the Year",          desc: "Highest combined score across delivery health, growth, and CSAT." },
  { Icon: Rocket,      title: "Rising Star",                  desc: "Best performance for a partner under two years in the network." },
  { Icon: Globe,       title: "Regional Excellence",          desc: "Top partner in each of APAC, EMEA, North America, and LATAM." },
  { Icon: TrendingUp,  title: "Growth Award",                 desc: "Largest YoY ARR growth for partners scaling their book." },
  { Icon: Star,        title: "Customer Champion",            desc: "Highest customer NPS across delivered implementations." },
  { Icon: Heart,       title: "Industry Specialist",          desc: "Manufacturing, Distribution, Retail, and Services category leaders." },
];

const WINNERS_2024 = [
  { award: "Partner of the Year",    name: "Atlas SI",            region: "APAC",   tier: "Platinum" as const },
  { award: "Rising Star",            name: "Polaris Bridge",      region: "LATAM",  tier: "Silver" as const   },
  { award: "Growth Award",           name: "Northbeam Consulting", region: "NA",     tier: "Gold" as const     },
  { award: "Customer Champion",      name: "Verdant Ops",         region: "EMEA",   tier: "Gold" as const     },
  { award: "Manufacturing Specialist", name: "Lattice Solutions", region: "APAC",   tier: "Platinum" as const },
  { award: "Services Specialist",    name: "Aurora Cloud Group",  region: "APAC",   tier: "Gold" as const     },
];

const TIMELINE = [
  { phase: "Nominations open",   date: "May 5, 2026",  detail: "Self-nominate or be nominated by a customer or Bizak rep." },
  { phase: "Submissions close",  date: "Jun 30, 2026", detail: "All evidence case studies, CSAT data, growth metrics due." },
  { phase: "Jury review",        date: "Jul, 2026",    detail: "Cross-regional jury of Bizak leadership and external partners." },
  { phase: "Finalists announced", date: "Aug 12, 2026", detail: "Top 3 per category published in the Partner Portal." },
  { phase: "Awards ceremony",    date: "Sep 24, 2026", detail: "Live at BizakConnect winners announced on the main stage." },
];

function HeroSection() {
  return (
    <Section tone="dark" pad="hero">
      <Container width="narrow">
        <div className="grid grid-cols-1 lg:grid-cols-[6fr_5fr] gap-12 lg:gap-16 items-center">
          <div>
            <HeroBadge tone="dark">Bizak Partner Awards · 2026</HeroBadge>
            <h1 className="mt-7 font-bold tracking-[-0.02em] text-[clamp(36px,5.4vw,64px)] leading-[1.1] text-white">
              Recognizing the firms<br />
              that <span className="text-bz-accent">build with us.</span>
            </h1>
            <p className="mt-7 text-[17px] leading-[1.7] text-white/65 max-w-[560px]">
              The Partner Awards celebrate firms whose work raises the bar for the whole network. Six categories, jury-reviewed, announced live at BizakConnect.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Button variant="accent" size="lg" href="#nominate" withArrow>
                Submit a Nomination
              </Button>
              <Button variant="ghostDark" size="lg" href="#winners">
                See 2024 Winners
              </Button>
            </div>
            <div className="mt-12 pt-10 border-t border-white/10 flex flex-wrap gap-x-10 gap-y-5">
              <Stat value="6" label="Categories" />
              <Stat value="48" label="Countries eligible" />
              <Stat value="Sep 24" label="Awards night" />
            </div>
          </div>

          <Card tone="dark" pad="lg" className="relative overflow-hidden">
            <div className="absolute -top-20 -right-20 size-64 rounded-full bg-bz-accent/[0.08] blur-3xl pointer-events-none" />
            <div className="relative">
              <div className="flex items-center justify-between mb-6">
                <PillBadge tone="accent">2024 Recap</PillBadge>
                <Trophy className="size-5 text-bz-accent" />
              </div>
              <div className="text-[14px] font-bold text-white/40 uppercase tracking-[0.1em] mb-3">
                Partner of the Year 2024
              </div>
              <div className="text-[28px] font-bold tracking-[-0.015em] mb-2">Atlas SI</div>
              <div className="text-[13px] text-white/50 mb-6">Bengaluru · APAC · Platinum</div>

              <p className="text-[14px] text-white/65 leading-[1.7] mb-7">
                "Atlas raised the bar on what enterprise manufacturing implementations can look like 23 go-lives across APAC, an average customer NPS of 78, and a peer-led architect community now spanning four countries."
              </p>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { v: "23",   l: "Go-lives" },
                  { v: "NPS 78", l: "Avg CSAT" },
                  { v: "+74%", l: "ARR growth" },
                ].map((s) => (
                  <div key={s.l} className="rounded-bz-md border border-white/10 bg-white/[0.03] p-3 text-center">
                    <div className="text-[18px] font-bold tabular-nums text-bz-accent">{s.v}</div>
                    <div className="text-[10.5px] text-white/50 mt-0.5 uppercase tracking-[0.06em]">
                      {s.l}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </Container>
    </Section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-[24px] font-bold leading-tight text-white">{value}</div>
      <div className="mt-1 text-[10.5px] font-bold uppercase tracking-[0.12em] text-white/50">
        {label}
      </div>
    </div>
  );
}

function CategoriesSection() {
  return (
    <Section tone="white">
      <Container width="narrow">
        <SectionHeading
          eyebrow="Categories"
          title="Six awards. One ecosystem."
          description="Every category looks at delivered outcomes customer health, growth, and contribution to the broader partner community. Scoring is published and reviewed annually."
          maxWidth={680}
          className="mb-14"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {CATEGORIES.map(({ Icon, title, desc }) => (
            <Card key={title} tone="light" pad="lg" hover="lift" className="relative">
              <IconBadge tone="sage" size="lg" className="mb-6">
                <Icon className="size-5" />
              </IconBadge>
              <div className="text-[19px] font-bold tracking-[-0.015em] mb-3">{title}</div>
              <p className="text-[14px] text-bz-text-muted leading-[1.65]">{desc}</p>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}

function WinnersSection() {
  return (
    <Section id="winners" tone="light">
      <Container width="narrow">
        <div className="flex flex-wrap items-end justify-between gap-6 mb-12">
          <SectionHeading
            eyebrow="2024 Winners"
            title="The bar set last year."
            maxWidth={520}
          />
          <PillBadge tone="neutral">Announced at BizakConnect 2024</PillBadge>
        </div>

        <div className="rounded-bz-xl border border-bz-border bg-bz-surface overflow-hidden">
          <div className="grid grid-cols-[2fr_2fr_1fr_1fr] gap-4 px-6 py-4 border-b border-bz-border text-[11px] uppercase tracking-[0.1em] font-bold text-bz-text-muted">
            <div>Award</div>
            <div>Partner</div>
            <div>Region</div>
            <div>Tier</div>
          </div>
          {WINNERS_2024.map((w, i) => (
            <div
              key={w.award + i}
              className="grid grid-cols-[2fr_2fr_1fr_1fr] gap-4 px-6 py-5 border-b border-bz-border last:border-b-0 items-center hover:bg-bz-bg/60 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Award className="size-4 text-bz-accent" />
                <span className="text-[14px] font-semibold">{w.award}</span>
              </div>
              <div className="text-[14px] font-bold">{w.name}</div>
              <div className="text-[13px] text-bz-text-muted">{w.region}</div>
              <div>
                <PillBadge tone={w.tier === "Platinum" || w.tier === "Gold" ? "accent" : "sage"}>
                  {w.tier}
                </PillBadge>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}

function TimelineSection() {
  return (
    <Section tone="dark">
      <Container width="narrow">
        <SectionHeading
          eyebrow="2026 Timeline"
          eyebrowTone="accent"
          title="Mark the dates."
          description="The full nomination-to-stage cycle. Every step is owned by a named partner ops contact no black box."
          tone="light"
          maxWidth={680}
          className="mb-14"
        />

        <div className="relative">
          <div
            className="absolute left-4 top-2 bottom-2 w-px bg-white/10 hidden md:block"
            aria-hidden
          />
          <div className="flex flex-col gap-5">
            {TIMELINE.map((t, i) => (
              <div key={t.phase} className="grid grid-cols-1 md:grid-cols-[40px_1fr_1.5fr] gap-5 items-start">
                <div className="hidden md:flex size-9 rounded-full border border-white/15 bg-bz-deep items-center justify-center relative z-[1]">
                  <CalendarClock className="size-4 text-bz-accent" />
                </div>
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-bz-accent">
                    Step {String(i + 1).padStart(2, "0")}
                  </div>
                  <div className="text-[18px] font-bold mt-1">{t.phase}</div>
                  <div className="text-[13px] text-white/50 mt-0.5">{t.date}</div>
                </div>
                <p className="text-[14px] text-white/65 leading-[1.7]">{t.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}

function NominateSection() {
  return (
    <Section id="nominate" tone="white">
      <Container width="narrow">
        <div className="grid grid-cols-1 lg:grid-cols-[5fr_7fr] gap-12 lg:gap-16 items-start">
          <SectionHeading
            eyebrow="Submit a nomination"
            title={<>Anyone can nominate. <span className="text-bz-sage">Self-nominations welcome.</span></>}
            description="If you're a customer, a Bizak rep, or a partner peer you can put a firm forward. Three minutes to submit, evidence due by the cycle deadline."
          />

          <Card tone="soft" pad="lg" className="border-bz-sage/20">
            <div className="flex items-center justify-between mb-6">
              <div className="text-[18px] font-bold">Nomination form</div>
              <PillBadge tone="sage">2026</PillBadge>
            </div>
            <ol className="flex flex-col gap-4 mb-8">
              {[
                "Pick the partner and the category",
                "Tell us why outcomes, delivery, customer impact",
                "Attach optional evidence (case study, CSAT score, etc.)",
                "Submit. Bizak partner ops takes it from there.",
              ].map((s, i) => (
                <li key={s} className="flex items-start gap-3">
                  <div className="size-7 rounded-full bg-bz-sage text-white text-[12px] font-bold flex items-center justify-center shrink-0 tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <p className="text-[14.5px] text-bz-text leading-[1.6] mt-1">{s}</p>
                </li>
              ))}
            </ol>
            <div className="flex flex-wrap gap-3">
              <Button variant="primary" size="lg" href="https://portal.bizakerp.com/awards" withArrow>
                Open Nomination Form
              </Button>
              <Button variant="outline" size="lg" href="/contact">
                Ask a Question
              </Button>
            </div>
          </Card>
        </div>
      </Container>
    </Section>
  );
}

function ClosingCta() {
  return (
    <Section tone="dark" pad="default">
      <Container width="narrow">
        <div className="text-center">
          <Sparkles className="size-6 text-bz-accent mx-auto mb-5" />
          <SectionHeading
            title={<>The work deserves to be seen.</>}
            description="Awards open globally. If you've delivered something exceptional this year, we want it on the BizakConnect stage."
            tone="light"
            align="center"
            maxWidth={620}
            className="mx-auto"
          />
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Button variant="accent" size="lg" href="#nominate" withArrow>
              Submit a Nomination
            </Button>
            <Button variant="ghostDark" size="lg" href="/partners/events">
              BizakConnect Schedule
            </Button>
          </div>
        </div>
      </Container>
    </Section>
  );
}

export function PartnerAwardsPage() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <Header />
      <main>
        <HeroSection />
        <CategoriesSection />
        <WinnersSection />
        <TimelineSection />
        <NominateSection />
        <ClosingCta />
      </main>
      <Footer />
    </div>
  );
}
