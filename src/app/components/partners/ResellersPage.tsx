import {
  Globe,
  TrendingUp,
  Map as MapIcon,
  Megaphone,
  Wallet,
  ShieldCheck,
  Layers,
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
  HeroSplit,
} from "../marketing";
import { Header } from "../Header";
import { Footer } from "../Footer";

const COMMISSION_TIERS = [
  { tier: "Authorized",  margin: 18, deals: "1–4 / yr",   color: "var(--bz-sage)" },
  { tier: "Silver",      margin: 24, deals: "5–11 / yr",  color: "var(--bz-sage)" },
  { tier: "Gold",        margin: 30, deals: "12–24 / yr", color: "var(--bz-accent)" },
  { tier: "Platinum",    margin: 35, deals: "25+ / yr",   color: "var(--bz-accent)" },
];

const SUPPORT_PILLARS = [
  {
    Icon: MapIcon,
    title: "Protected territories",
    body: "Defined geographic and segment scope. Lead routing favors the local reseller co-sell on the rest.",
  },
  {
    Icon: Megaphone,
    title: "Co-branded marketing",
    body: "Localized landing pages, ad budget through the MDF program, and event support for regional summits.",
  },
  {
    Icon: Wallet,
    title: "Recurring commissions",
    body: "Earn on the initial booking and every renewal. Margin compounds your year-3 book is materially larger than year 1.",
  },
  {
    Icon: ShieldCheck,
    title: "Deal registration",
    body: "Register opportunities to lock pricing and protection for 90 days. Conflicts mediated by partner ops within one business day.",
  },
];

const FIT = [
  "VAR / value-added resellers with an existing SMB or mid-market book",
  "Regional ERP firms looking to add a modern cloud platform alongside legacy stacks",
  "Industry-specialized boutiques (manufacturing, distribution, retail, services)",
  "Channel teams expanding into a new vertical or geography",
];

function TerritoryPanel() {
  return (
    <div className="biz-mesh-card relative w-full rounded-bz-xl border border-bz-border bg-bz-surface p-6 shadow-[0_24px_64px_rgba(0,0,0,0.06)]">
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-bz-text-muted">
            Reseller economics
          </div>
          <div className="text-[18px] font-bold mt-0.5">Margin tiers</div>
        </div>
        <PillBadge tone="sage">2025</PillBadge>
      </div>

      <div className="flex flex-col gap-3 mb-6">
        {COMMISSION_TIERS.map((t) => (
          <div key={t.tier}>
            <div className="flex justify-between items-baseline mb-1.5">
              <span className="text-[13px] font-semibold text-bz-text">{t.tier}</span>
              <div className="flex items-baseline gap-3">
                <span className="text-[11px] text-bz-text-muted">{t.deals}</span>
                <span className="text-[18px] font-bold tabular-nums text-bz-text">
                  {t.margin}%
                </span>
              </div>
            </div>
            <div className="h-1.5 bg-bz-bg rounded-bz-pill overflow-hidden border border-bz-border/60">
              <div
                className="h-full rounded-bz-pill"
                style={{ width: `${(t.margin / 35) * 100}%`, background: t.color }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2.5 pt-5 border-t border-bz-border">
        {[
          { v: "48",  l: "Countries" },
          { v: "$2.4M", l: "Avg ARR / Yr 2" },
          { v: "94%", l: "Renewal" },
        ].map((s) => (
          <div key={s.l} className="text-center">
            <div className="text-[18px] font-bold tabular-nums">{s.v}</div>
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
      badge={<HeroBadge>For Resellers</HeroBadge>}
      title={
        <>
          Sell Bizak in your<br />
          <span className="text-bz-sage">local market.</span>
        </>
      }
      description="A protected territory model with up to 35% margin, co-branded marketing dollars, and renewal commissions for the life of the customer. Built for VARs and regional ERP firms ready to add a modern cloud platform to their book."
      actions={
        <>
          <Button variant="primary" size="lg" href="/partners#apply" withArrow>
            Apply as Reseller
          </Button>
          <Button variant="outline" size="lg" href="/contact">
            Talk to Channel
          </Button>
        </>
      }
      stats={[
        { value: "35%", label: "Top margin" },
        { value: "90 days", label: "Deal protection" },
        { value: "48", label: "Live territories" },
      ]}
      visual={<TerritoryPanel />}
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
            title={<>The reseller program is built for firms that already <span className="text-bz-sage">own a market.</span></>}
            description="If you're carrying a portfolio today, we slot in alongside it Bizak is the modern platform you offer customers who've outgrown spreadsheets or are shopping for an upgrade."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {FIT.map((f, i) => (
              <Card key={f} tone={i % 2 === 0 ? "soft" : "light"} pad="md" hover="lift">
                <div className="flex items-start gap-3">
                  <div className="size-7 rounded-full bg-bz-sage/15 text-bz-sage flex items-center justify-center text-[12px] font-bold shrink-0 tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </div>
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

function SupportSection() {
  return (
    <Section tone="light">
      <Container width="narrow">
        <SectionHeading
          eyebrow="What you get"
          title="A channel program with the engine running."
          description="Not a slide deck and a discount code the operating system for running a real channel practice."
          maxWidth={680}
          className="mb-14"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {SUPPORT_PILLARS.map(({ Icon, title, body }) => (
            <Card key={title} tone="light" pad="md" hover="lift">
              <IconBadge tone="sage" size="md" className="mb-5">
                <Icon className="size-5" />
              </IconBadge>
              <div className="text-[16px] font-bold mb-2">{title}</div>
              <p className="text-[13.5px] text-bz-text-muted leading-[1.65]">{body}</p>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}

function EconomicsSection() {
  return (
    <Section tone="dark">
      <Container width="narrow">
        <SectionHeading
          eyebrow="The math"
          eyebrowTone="accent"
          title="Year 1 isn't the story. Year 3 is."
          description="The reseller P&L compounds because every renewal carries margin. A book of 30 active customers generates more revenue in year 3 than a fresh year 1 book of 60."
          tone="light"
          maxWidth={680}
          className="mb-12"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              year: "Year 1",
              arr: "$420K",
              detail: "20 net-new closes · authorized tier · ramp pricing",
              Icon: Layers,
            },
            {
              year: "Year 2",
              arr: "$1.6M",
              detail: "30 net-new + 18 renewals · silver tier · co-marketing live",
              Icon: TrendingUp,
            },
            {
              year: "Year 3",
              arr: "$2.4M",
              detail: "35 net-new + 44 renewals · gold tier · territory locked",
              Icon: Sparkles,
            },
          ].map(({ year, arr, detail, Icon }, i) => (
            <Card key={year} tone="dark" pad="lg" hover="glow">
              <div className="flex items-center justify-between mb-6">
                <IconBadge tone="accent" size="md">
                  <Icon className="size-5" />
                </IconBadge>
                <PillBadge tone="accent">{year}</PillBadge>
              </div>
              <div className="text-[36px] font-bold tabular-nums leading-none">{arr}</div>
              <div className="text-[12px] uppercase tracking-[0.08em] text-bz-accent mt-1">
                Avg. partner ARR
              </div>
              <p className="mt-5 text-[13.5px] text-white/55 leading-[1.65]">{detail}</p>
              {i < 2 && (
                <div className="mt-6 h-1 bg-white/5 rounded-bz-pill overflow-hidden">
                  <div
                    className="h-full bg-bz-accent rounded-bz-pill"
                    style={{ width: i === 0 ? "18%" : "67%" }}
                  />
                </div>
              )}
            </Card>
          ))}
        </div>

        <p className="mt-8 text-[12px] text-white/40 text-center">
          * Aggregate program data, FY2024. Individual results vary by territory and motion.
        </p>
      </Container>
    </Section>
  );
}

function ClosingCta() {
  return (
    <Section tone="dark" pad="default">
      <Container width="narrow">
        <div className="rounded-bz-xl bg-white/[0.03] border border-white/10 p-12 md:p-14 text-center">
          <div className="inline-flex items-center gap-2 mb-5">
            <Globe className="size-4 text-bz-accent" />
            <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-bz-accent">
              Reseller program
            </span>
          </div>
          <SectionHeading
            title={<>Own your territory.<br />Compound your book.</>}
            tone="light"
            align="center"
            maxWidth={620}
            className="mx-auto"
          />
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Button variant="accent" size="lg" href="/partners#apply" withArrow>
              Apply as Reseller
            </Button>
            <Button variant="ghostDark" size="lg" href="/partners/portal">
              See Reseller Portal
            </Button>
          </div>
        </div>
      </Container>
    </Section>
  );
}

export function ResellersPage() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <Header />
      <main>
        <HeroSection />
        <FitSection />
        <SupportSection />
        <EconomicsSection />
        <ClosingCta />
      </main>
      <Footer />
    </div>
  );
}
