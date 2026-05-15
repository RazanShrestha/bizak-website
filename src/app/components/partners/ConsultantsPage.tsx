import {
  GraduationCap,
  Wrench,
  ClipboardCheck,
  Users,
  ShieldCheck,
  Workflow,
  CheckCircle2,
  BookOpen,
  Boxes,
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
  HeroSplit,
} from "../marketing";
import { Header } from "../Header";
import { Footer } from "../Footer";

const TRACKS = [
  { name: "Consultant Foundations",   hrs: 16, level: "Required",   focus: "Bizak data model, modules, deployment archetypes" },
  { name: "Solution Architect",       hrs: 32, level: "Pro",        focus: "Multi-entity, integrations, migration playbooks" },
  { name: "Implementation Lead",      hrs: 24, level: "Pro",        focus: "Cutover, change management, hypercare" },
  { name: "Industry Specialist",      hrs: 20, level: "Elective",   focus: "Manufacturing · Distribution · Retail · Services" },
];

const PRACTICE_AREAS = [
  {
    Icon: ClipboardCheck,
    title: "Discovery & scoping",
    body: "Joint discovery decks, scoping calculators, and reference SOWs. Stop reinventing scoping artifacts on every deal.",
  },
  {
    Icon: Wrench,
    title: "Migration tooling",
    body: "Bizak Migrate handles QuickBooks, Tally, NetSuite, SAP B1, and Excel sources. Pre-built field mappings, dry-run validators.",
  },
  {
    Icon: Workflow,
    title: "Configuration kits",
    body: "Industry templates for chart of accounts, document workflows, and approval matrices. Configure in days, not weeks.",
  },
  {
    Icon: ShieldCheck,
    title: "Hypercare & escalation",
    body: "Direct line into Bizak engineering for go-live week. Severity-1 response under one hour, 24/7.",
  },
];

const FIT = [
  "Boutique implementation firms (5–50 consultants)",
  "Regional SI practices expanding their cloud ERP coverage",
  "Big-4 alliance teams looking for a modern mid-market platform",
  "Industry consultancies (manufacturing, services, distribution)",
];

const LEAD_FUNNEL = [
  { stage: "Bizak-sourced MQLs",  pct: 100, count: 1240 },
  { stage: "Routed to partners",  pct: 78,  count: 967 },
  { stage: "Accepted by partner", pct: 56,  count: 695 },
  { stage: "Converted to deals",  pct: 22,  count: 273 },
];

function PracticePanel() {
  return (
    <div className="biz-mesh-card relative w-full rounded-bz-xl border border-bz-border bg-bz-surface p-6 shadow-[0_24px_64px_rgba(0,0,0,0.06)]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-bz-text-muted">
            SI practice · 12-mo
          </div>
          <div className="text-[18px] font-bold mt-0.5">Lead pipeline</div>
        </div>
        <PillBadge tone="live" dot>LIVE</PillBadge>
      </div>

      <div className="flex flex-col gap-3 mb-6">
        {LEAD_FUNNEL.map((s) => (
          <div key={s.stage}>
            <div className="flex justify-between mb-1.5">
              <span className="text-[12.5px] font-medium text-bz-text">{s.stage}</span>
              <span className="text-[12px] tabular-nums text-bz-text-muted">{s.count}</span>
            </div>
            <div className="h-1.5 bg-bz-bg rounded-bz-pill overflow-hidden border border-bz-border/60">
              <div className="h-full bg-bz-sage rounded-bz-pill" style={{ width: `${s.pct}%` }} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2.5 pt-5 border-t border-bz-border">
        {[
          { v: "9.2 wk", l: "Avg time-to-go-live" },
          { v: "$84K",   l: "Avg services / deal" },
          { v: "4.8/5",  l: "Customer CSAT" },
        ].map((s) => (
          <div key={s.l} className="text-center">
            <div className="text-[16px] font-bold tabular-nums">{s.v}</div>
            <div className="text-[10.5px] text-bz-text-muted mt-0.5 uppercase tracking-[0.06em]">
              {s.l}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function HeroSection() {
  return (
    <HeroSplit
      badge={<HeroBadge>For Consultants &amp; SIs</HeroBadge>}
      title={
        <>
          Deliver Bizak.<br />
          <span className="text-bz-sage">Build a practice</span> around it.
        </>
      }
      description="A certification program that actually trains your team, sourcing pipeline you can plan around, and tooling that compresses the implementation timeline. The platform we wish we'd had when we ran our own SI practice."
      actions={
        <>
          <Button variant="primary" size="lg" href="/partners#apply" withArrow>
            Apply as Consultant
          </Button>
          <Button variant="outline" size="lg" href="#tracks">
            Explore Certifications
          </Button>
        </>
      }
      stats={[
        { value: "1,240+", label: "MQLs / yr routed" },
        { value: "9.2 wk",  label: "Avg time-to-live" },
        { value: "Free",    label: "First 3 certs" },
      ]}
      visual={<PracticePanel />}
      visualClassName=""
    />
  );
}

function FitSection() {
  return (
    <Section tone="white">
      <Container width="narrow">
        <div className="grid grid-cols-1 lg:grid-cols-[5fr_7fr] gap-12 lg:gap-16 items-start">
          <SectionHeading
            eyebrow="Who this is for"
            title={<>Designed for firms that take <span className="text-bz-sage">ownership</span> of outcomes.</>}
            description="If your model is project-based revenue with named consultants, we built this around how your practice already works not around a software vendor's quota."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {FIT.map((f, i) => (
              <Card key={f} tone={i % 2 === 0 ? "soft" : "light"} pad="md" hover="lift">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="size-5 text-bz-sage shrink-0 mt-0.5" />
                  <p className="text-[14.5px] leading-[1.65] text-bz-text">{f}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}

function PracticeSection() {
  return (
    <Section tone="light">
      <Container width="narrow">
        <SectionHeading
          eyebrow="Practice operations"
          title="The toolkit for shipping faster implementations."
          description="Every part of the implementation lifecycle has dedicated tooling. We don't ship binders we ship working artifacts your consultants pick up and use."
          maxWidth={680}
          className="mb-14"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {PRACTICE_AREAS.map(({ Icon, title, body }) => (
            <Card key={title} tone="light" pad="lg" hover="lift">
              <IconBadge tone="sage" size="lg" className="mb-5">
                <Icon className="size-5" />
              </IconBadge>
              <div className="text-[20px] font-bold tracking-[-0.015em] mb-3">{title}</div>
              <p className="text-[15px] text-bz-text-muted leading-[1.7]">{body}</p>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}

function CertificationsSection() {
  return (
    <Section id="tracks" tone="dark">
      <Container width="narrow">
        <div className="flex flex-wrap items-end justify-between gap-8 mb-14">
          <SectionHeading
            eyebrow="Bizak Architect Academy"
            eyebrowTone="accent"
            title="Certification tracks"
            description="A learning path that respects your consultants' time. Every track is exam-graded, role-relevant, and renewed annually."
            tone="light"
            maxWidth={500}
          />
          <PillBadge tone="accent" dot>First 3 seats free</PillBadge>
        </div>

        <div className="rounded-bz-xl border border-white/10 bg-white/[0.03] overflow-hidden">
          <div className="grid grid-cols-[2fr_1fr_1fr_3fr] gap-4 px-6 py-4 border-b border-white/10 text-[11px] uppercase tracking-[0.1em] font-bold text-white/40">
            <div>Track</div>
            <div>Hours</div>
            <div>Level</div>
            <div>Focus</div>
          </div>
          {TRACKS.map((t) => (
            <div
              key={t.name}
              className="grid grid-cols-[2fr_1fr_1fr_3fr] gap-4 px-6 py-5 border-b border-white/5 last:border-b-0 items-center hover:bg-white/[0.02] transition-colors"
            >
              <div className="flex items-center gap-3">
                <IconBadge tone="darkSurface" size="sm">
                  <BookOpen className="size-4" />
                </IconBadge>
                <span className="text-[14.5px] font-semibold">{t.name}</span>
              </div>
              <div className="text-[14px] tabular-nums text-white/70">{t.hrs} hrs</div>
              <div>
                <PillBadge tone={t.level === "Required" ? "accent" : t.level === "Pro" ? "sage" : "neutral"}>
                  {t.level}
                </PillBadge>
              </div>
              <div className="text-[13px] text-white/55 leading-[1.55]">{t.focus}</div>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}

function CommunitySection() {
  return (
    <Section tone="white">
      <Container width="narrow">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          <Card tone="soft" pad="lg" className="border-bz-sage/20">
            <div className="flex items-center gap-3 mb-5">
              <IconBadge tone="sage" size="lg">
                <Users className="size-5" />
              </IconBadge>
              <PillBadge tone="sage">Community</PillBadge>
            </div>
            <div className="text-[24px] font-bold tracking-[-0.015em] mb-3">
              Architect Office Hours
            </div>
            <p className="text-[15px] text-bz-text-muted leading-[1.7] mb-6">
              Live weekly sessions with Bizak Solution Architects. Bring real implementation challenges get answers, working code, and peer review from senior consultants across the network.
            </p>
            <div className="flex flex-wrap gap-2">
              {["Slack workspace", "Quarterly summit", "Internal forum", "Beta access"].map((b) => (
                <PillBadge key={b} tone="neutral">{b}</PillBadge>
              ))}
            </div>
          </Card>

          <div>
            <SectionHeading
              eyebrow="Beyond training"
              title="A community that lifts the whole practice."
              description="Certification gets you started. The community is where your senior consultants stay sharp sharing migration patterns, integration hacks, industry templates, and reference architectures."
              maxWidth={500}
            />

            <div className="mt-8 grid grid-cols-2 gap-3">
              {[
                { v: "640+", l: "Certified architects" },
                { v: "48",   l: "Countries" },
                { v: "12",   l: "Industry chapters" },
                { v: "4 / mo", l: "Live sessions" },
              ].map((s) => (
                <div key={s.l} className="rounded-bz-md border border-bz-border p-4">
                  <div className="text-[22px] font-bold tabular-nums">{s.v}</div>
                  <div className="text-[12px] text-bz-text-muted mt-0.5">{s.l}</div>
                </div>
              ))}
            </div>
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
          title={<>Ready to build your<br />Bizak practice?</>}
          description="Apply to the network. We'll match you with a regional partner manager and walk through training, sourcing, and launch in your first call."
          tone="light"
          align="center"
          maxWidth={620}
        />
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Button variant="accent" size="lg" href="/partners#apply" withArrow>
            Apply as Consultant
          </Button>
          <Button variant="ghostDark" size="lg" href="/partners/portal">
            Tour the Portal
          </Button>
        </div>
      </Container>
    </Section>
  );
}

export function ConsultantsPage() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <Header />
      <main>
        <HeroSection />
        <FitSection />
        <PracticeSection />
        <CertificationsSection />
        <CommunitySection />
        <ClosingCta />
      </main>
      <Footer />
    </div>
  );
}
