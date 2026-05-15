import { useState } from "react";
import {
  Search,
  MapPin,
  Award,
  Globe,
  Factory,
  Building2,
  Truck,
  Store,
  Briefcase,
  Sparkles,
  CheckCircle2,
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

type Tier = "Authorized" | "Silver" | "Gold" | "Platinum";

type Partner = {
  name: string;
  region: string;
  city: string;
  tier: Tier;
  industries: string[];
  bio: string;
  founded: number;
  consultants: number;
};

const REGIONS = ["All", "Nepal", "India", "Bangladesh", "Sri Lanka", "Pakistan"];
const INDUSTRIES = [
  { Icon: Factory,   name: "Manufacturing" },
  { Icon: Truck,     name: "Distribution" },
  { Icon: Store,     name: "Retail" },
  { Icon: Briefcase, name: "Services" },
  { Icon: Building2, name: "Multi-entity" },
];
const TIERS: Tier[] = ["Authorized", "Silver", "Gold", "Platinum"];

const PARTNERS: Partner[] = [
  {
    name: "Lattice Solutions",  region: "India", city: "Bengaluru",
    tier: "Platinum", industries: ["Manufacturing", "Distribution"],
    bio: "Mid-market manufacturing implementations with end-to-end shop-floor integration. 14 industries covered.",
    founded: 2011, consultants: 38,
  },
  {
    name: "Northbeam Consulting", region: "Nepal", city: "Kathmandu",
    tier: "Gold", industries: ["Services", "Multi-entity"],
    bio: "Professional services and multi-entity finance specialists. Heavy on FP&A and consolidations.",
    founded: 2014, consultants: 22,
  },
  {
    name: "Verdant Ops", region: "Sri Lanka", city: "Colombo",
    tier: "Gold", industries: ["Distribution", "Retail"],
    bio: "Omnichannel retail and distribution practice. Shopify, POS, and 3PL integrations.",
    founded: 2013, consultants: 18,
  },
  {
    name: "Atlas SI", region: "India", city: "Mumbai",
    tier: "Platinum", industries: ["Manufacturing", "Multi-entity"],
    bio: "Large-scale manufacturing rollouts across the region. Specialists in process and discrete manufacturing.",
    founded: 2008, consultants: 64,
  },
  {
    name: "Meridian Advisory", region: "Bangladesh", city: "Dhaka",
    tier: "Silver", industries: ["Services", "Multi-entity"],
    bio: "Boutique advisory firm focused on group reporting and audit-ready close cycles.",
    founded: 2017, consultants: 12,
  },
  {
    name: "Polaris Bridge", region: "Pakistan", city: "Karachi",
    tier: "Silver", industries: ["Distribution", "Manufacturing"],
    bio: "Bilingual implementation team covering Pakistan and the wider region. Tax and customs specialists.",
    founded: 2018, consultants: 9,
  },
  {
    name: "Riverstone Partners", region: "Nepal", city: "Pokhara",
    tier: "Authorized", industries: ["Retail", "Services"],
    bio: "DTC and small-to-mid retailers. Quick-win deployments with prebuilt configuration kits.",
    founded: 2021, consultants: 6,
  },
  {
    name: "Aurora Cloud Group", region: "India", city: "Hyderabad",
    tier: "Gold", industries: ["Multi-entity", "Services"],
    bio: "Group consolidations across the region. Strong with private-equity portfolio companies.",
    founded: 2015, consultants: 24,
  },
];

const TIER_PILL: Record<Tier, "accent" | "sage" | "neutral"> = {
  Platinum: "accent",
  Gold:     "accent",
  Silver:   "sage",
  Authorized: "neutral",
};

function HeroSection() {
  return (
    <Section tone="light" pad="hero" className="biz-mesh">
      <Container width="narrow">
        <div className="text-center max-w-[760px] mx-auto">
          <HeroBadge>Find a Partner</HeroBadge>
          <h1 className="mt-5 font-bold tracking-[-0.02em] text-[clamp(36px,5vw,60px)] leading-[1.1]">
            Locate a certified Bizak<br />
            <span className="text-bz-sage">partner near you.</span>
          </h1>
          <p className="mt-6 text-[17px] leading-[1.7] text-bz-text-muted">
            Vetted partner firms across South Asia. Filter by region, industry, and tier every partner listed is exam-certified and renewed annually.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-x-10 gap-y-3 text-[13px] text-bz-text-muted">
            <div className="flex items-center gap-2"><Globe className="size-4 text-bz-sage" /> Across South Asia</div>
            <div className="flex items-center gap-2"><Sparkles className="size-4 text-bz-sage" /> Vetted &amp; renewed annually</div>
            <div className="flex items-center gap-2"><Award className="size-4 text-bz-sage" /> 4-tier program</div>
          </div>
        </div>
      </Container>
    </Section>
  );
}

function DirectorySection() {
  const [region, setRegion] = useState("All");
  const [industry, setIndustry] = useState<string | null>(null);
  const [tier, setTier] = useState<Tier | null>(null);
  const [query, setQuery] = useState("");

  const filtered = PARTNERS.filter((p) => {
    if (region !== "All" && p.region !== region) return false;
    if (industry && !p.industries.includes(industry)) return false;
    if (tier && p.tier !== tier) return false;
    if (query && !`${p.name} ${p.city} ${p.bio}`.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  return (
    <Section tone="white">
      <Container width="narrow">
        <div className="rounded-bz-xl border border-bz-border bg-bz-surface p-5 md:p-6 mb-10 shadow-[0_4px_16px_rgba(0,0,0,0.03)]">
          <div className="flex items-center gap-3 mb-5">
            <Search className="size-5 text-bz-text-muted shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by firm name, city, or specialty…"
              className="flex-1 bg-transparent text-[15px] text-bz-text placeholder:text-bz-text-muted/70 focus:outline-none"
            />
          </div>

          <div className="border-t border-bz-border pt-5 flex flex-col gap-4">
            <FilterRow label="Region">
              {REGIONS.map((r) => (
                <Chip key={r} active={region === r} onClick={() => setRegion(r)}>{r}</Chip>
              ))}
            </FilterRow>

            <FilterRow label="Industry">
              <Chip active={industry === null} onClick={() => setIndustry(null)}>All</Chip>
              {INDUSTRIES.map(({ Icon, name }) => (
                <Chip
                  key={name}
                  active={industry === name}
                  onClick={() => setIndustry((p) => (p === name ? null : name))}
                >
                  <Icon className="size-3.5" /> {name}
                </Chip>
              ))}
            </FilterRow>

            <FilterRow label="Tier">
              <Chip active={tier === null} onClick={() => setTier(null)}>All</Chip>
              {TIERS.map((t) => (
                <Chip
                  key={t}
                  active={tier === t}
                  onClick={() => setTier((p) => (p === t ? null : t))}
                >
                  {t}
                </Chip>
              ))}
            </FilterRow>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div className="text-[13px] text-bz-text-muted">
            <span className="font-bold text-bz-text tabular-nums">{filtered.length}</span> partners match
          </div>
          <a href="/partners" className="text-[13px] font-bold text-bz-sage hover:underline">
            Become a partner →
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((p) => (
            <Card key={p.name} tone="light" pad="md" hover="lift">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="size-11 rounded-md bg-bz-sage/15 text-bz-sage font-bold text-[16px] flex items-center justify-center">
                    {p.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                  </div>
                  <div>
                    <div className="text-[16px] font-bold leading-tight">{p.name}</div>
                    <div className="text-[12px] text-bz-text-muted flex items-center gap-1.5 mt-0.5">
                      <MapPin className="size-3" /> {p.city} · {p.region}
                    </div>
                  </div>
                </div>
                <PillBadge tone={TIER_PILL[p.tier]}>{p.tier}</PillBadge>
              </div>

              <p className="text-[13.5px] text-bz-text-muted leading-[1.6] mb-4">{p.bio}</p>

              <div className="flex flex-wrap gap-1.5 mb-4">
                {p.industries.map((i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-bz-pill border border-bz-border bg-bz-bg text-[11px] font-semibold text-bz-text-muted"
                  >
                    {i}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-bz-border text-[12px] text-bz-text-muted">
                <div className="flex gap-4">
                  <span><span className="font-bold tabular-nums text-bz-text">{p.consultants}</span> consultants</span>
                  <span>Est. {p.founded}</span>
                </div>
                <a href="#" className="font-bold text-bz-sage hover:underline">Contact →</a>
              </div>
            </Card>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="rounded-bz-xl border border-dashed border-bz-border p-10 text-center">
            <p className="text-[14px] text-bz-text-muted">
              No partners match these filters yet. Try widening the search, or
              <a className="text-bz-sage font-bold underline ml-1" href="/contact">talk to our partner team</a>.
            </p>
          </div>
        )}
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

function TierExplainerSection() {
  return (
    <Section tone="light">
      <Container width="narrow">
        <SectionHeading
          eyebrow="Understanding the tiers"
          title="What the badge means."
          description="Tiers reflect both certification depth and delivered customer health not just sales volume. The bar to renew is the same as the bar to qualify."
          maxWidth={680}
          className="mb-12"
        />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { tier: "Authorized", desc: "Foundational certification. Smaller engagements, prebuilt configuration kits." },
            { tier: "Silver",     desc: "Multiple certified consultants, demonstrated CSAT, regional coverage." },
            { tier: "Gold",       desc: "Architect-tier team, multi-entity capability, audited delivery health." },
            { tier: "Platinum",   desc: "Top-of-program. Strategic accounts, complex rollouts, co-product roadmap input." },
          ].map((t, i) => (
            <Card key={t.tier} tone={i >= 2 ? "soft" : "light"} pad="md" hover="lift">
              <PillBadge tone={i >= 2 ? "accent" : i === 1 ? "sage" : "neutral"} className="mb-4">
                {t.tier}
              </PillBadge>
              <p className="text-[13.5px] text-bz-text-muted leading-[1.65]">{t.desc}</p>
            </Card>
          ))}
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
          title={<>Don't see the right fit?</>}
          description="Our partner team can match you with a firm based on your industry, geography, and timeline usually within 24 hours."
          tone="light"
          align="center"
          maxWidth={620}
        />
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Button variant="accent" size="lg" href="/contact" withArrow>
            Get a Match
          </Button>
          <Button variant="ghostDark" size="lg" href="/partners">
            Become a Partner
          </Button>
        </div>
      </Container>
    </Section>
  );
}

export function FindAPartnerPage() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <Header />
      <main>
        <HeroSection />
        <DirectorySection />
        <TierExplainerSection />
        <ClosingCta />
      </main>
      <Footer />
    </div>
  );
}
