import { useState } from "react";
import {
  Search,
  Sparkles,
  Plug,
  ShoppingBag,
  CreditCard,
  Mail,
  Truck,
  BarChart3,
  ShieldCheck,
  FileText,
  Boxes,
  Layers,
  Star,
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

type App = {
  name: string;
  by: string;
  cat: string;
  desc: string;
  installs: string;
  rating: number;
  Icon: typeof Plug;
  featured?: boolean;
  free?: boolean;
};

const CATEGORIES = [
  { Icon: CreditCard,  name: "Payments & Banking",   count: 24 },
  { Icon: ShoppingBag, name: "Commerce",              count: 31 },
  { Icon: Mail,        name: "CRM & Marketing",       count: 18 },
  { Icon: Truck,       name: "Logistics & Shipping",  count: 22 },
  { Icon: BarChart3,   name: "Analytics & BI",        count: 16 },
  { Icon: ShieldCheck, name: "Compliance & Tax",      count: 14 },
  { Icon: FileText,    name: "Documents",             count: 11 },
  { Icon: Boxes,       name: "Inventory Add-ons",     count: 19 },
];

const FEATURED_APPS: App[] = [
  {
    name: "Stripe Sync",
    by: "Bizak",
    cat: "Payments",
    desc: "Two-way sync of invoices, payments, refunds, and disputes between Stripe and Bizak Finance.",
    installs: "4.2k",
    rating: 4.9,
    Icon: CreditCard,
    featured: true,
  },
  {
    name: "Shopify Connector",
    by: "ShopBridge Co.",
    cat: "Commerce",
    desc: "Real-time order, inventory, and customer sync for Shopify Plus stores. Multi-store, multi-currency.",
    installs: "3.8k",
    rating: 4.8,
    Icon: ShoppingBag,
    featured: true,
  },
  {
    name: "Avalara TaxLink",
    by: "Avalara",
    cat: "Compliance",
    desc: "Automated tax determination across 60+ jurisdictions. Real-time at point of sale.",
    installs: "2.1k",
    rating: 4.7,
    Icon: ShieldCheck,
    featured: true,
  },
];

const APPS: App[] = [
  { name: "HubSpot CRM Sync",    by: "Bizak Labs",        cat: "CRM",        desc: "Bi-directional contacts, deals, and revenue.",       installs: "1.9k", rating: 4.6, Icon: Mail,         free: true },
  { name: "EasyShip Pro",        by: "EasyShip",          cat: "Logistics",  desc: "Live rates, label printing, returns automation.",     installs: "1.4k", rating: 4.5, Icon: Truck                },
  { name: "Power BI Bridge",     by: "Astra Analytics",   cat: "Analytics",  desc: "Streaming Bizak data into Power BI semantic models.", installs: "980",  rating: 4.7, Icon: BarChart3            },
  { name: "DocuSign Workflows",  by: "Bizak Labs",        cat: "Documents",  desc: "Trigger DocuSign envelopes from sales orders & POs.", installs: "1.6k", rating: 4.8, Icon: FileText, free: true },
  { name: "QuickBooks Migrate",  by: "Bizak",             cat: "Migration",  desc: "Self-serve QuickBooks → Bizak migration toolkit.",    installs: "3.1k", rating: 4.9, Icon: Layers,   free: true },
  { name: "Multi-warehouse Plus", by: "WareWorks",        cat: "Inventory",  desc: "Bin-level tracking, kit BOM, multi-zone picks.",      installs: "1.1k", rating: 4.6, Icon: Boxes                },
];

function HeroSection() {
  return (
    <Section tone="light" pad="hero" className="biz-mesh">
      <Container width="narrow">
        <div className="text-center max-w-[760px] mx-auto">
          <HeroBadge>Bizak Marketplace</HeroBadge>
          <h1 className="mt-5 font-bold tracking-[-0.02em] text-[clamp(36px,5vw,60px)] leading-[1.1]">
            Extend Bizak with apps<br />
            <span className="text-bz-sage">built by partners.</span>
          </h1>
          <p className="mt-6 text-[17px] leading-[1.7] text-bz-text-muted">
            Two hundred-plus native apps, integrations, and add-ons installed inside your Bizak tenant in two clicks. Built and maintained by certified technology partners.
          </p>

          <div className="mt-10 max-w-[640px] mx-auto">
            <div className="flex items-center gap-3 rounded-bz-pill border border-bz-border bg-bz-surface px-5 py-3 shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
              <Search className="size-5 text-bz-text-muted shrink-0" />
              <input
                type="text"
                placeholder="Search apps, categories, partners…"
                className="flex-1 bg-transparent text-[15px] text-bz-text placeholder:text-bz-text-muted/70 focus:outline-none"
              />
              <Button variant="primary" size="sm">Search</Button>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 justify-center text-[12px]">
              <span className="text-bz-text-muted">Popular:</span>
              {["Stripe", "Shopify", "Power BI", "DocuSign", "Tally"].map((t) => (
                <a
                  key={t}
                  href="#"
                  className="text-bz-sage hover:underline font-semibold"
                >
                  {t}
                </a>
              ))}
            </div>
          </div>

          <div className="mt-10 flex flex-wrap justify-center gap-x-10 gap-y-3 text-[13px] text-bz-text-muted">
            <div className="flex items-center gap-2"><Sparkles className="size-4 text-bz-sage" /> 200+ live apps</div>
            <div className="flex items-center gap-2"><Plug className="size-4 text-bz-sage" /> 8 categories</div>
            <div className="flex items-center gap-2"><ShieldCheck className="size-4 text-bz-sage" /> Reviewed by Bizak</div>
          </div>
        </div>
      </Container>
    </Section>
  );
}

function FeaturedSection() {
  return (
    <Section tone="white">
      <Container width="narrow">
        <div className="flex flex-wrap items-end justify-between gap-6 mb-10">
          <SectionHeading
            eyebrow="Featured this month"
            title="Apps the team is highlighting."
            maxWidth={520}
          />
          <a href="#all" className="text-[14px] font-bold text-bz-sage hover:underline">
            See all featured →
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {FEATURED_APPS.map((app) => (
            <Card key={app.name} tone="light" pad="lg" hover="lift" className="relative">
              <div className="flex items-center justify-between mb-6">
                <IconBadge tone="sage" size="lg">
                  <app.Icon className="size-5" />
                </IconBadge>
                <PillBadge tone="accent">Featured</PillBadge>
              </div>
              <div className="text-[19px] font-bold tracking-[-0.015em] mb-1">{app.name}</div>
              <div className="text-[12px] text-bz-text-muted mb-4">by {app.by} · {app.cat}</div>
              <p className="text-[14px] text-bz-text-muted leading-[1.65] mb-5">{app.desc}</p>
              <div className="flex items-center justify-between pt-4 border-t border-bz-border">
                <div className="flex items-center gap-1.5 text-[12.5px]">
                  <Star className="size-3.5 text-bz-accent fill-bz-accent" />
                  <span className="font-bold tabular-nums">{app.rating}</span>
                  <span className="text-bz-text-muted">· {app.installs} installs</span>
                </div>
                <a href="#" className="text-[13px] font-bold text-bz-sage hover:underline">Install →</a>
              </div>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}

function CategorySection() {
  const [active, setActive] = useState<string | null>(null);
  return (
    <Section id="all" tone="light">
      <Container width="narrow">
        <SectionHeading
          eyebrow="Browse by category"
          title="Find what fits your stack."
          description="Each category is curated by the Bizak partner ops team. Apps are reviewed for security, performance, and lifecycle support before listing."
          maxWidth={680}
          className="mb-12"
        />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-14">
          {CATEGORIES.map(({ Icon, name, count }) => (
            <button
              key={name}
              type="button"
              onClick={() => setActive((p) => (p === name ? null : name))}
              className={`text-left rounded-bz-xl border p-5 transition-all duration-150 ${
                active === name
                  ? "border-bz-sage bg-bz-sage/[0.06]"
                  : "border-bz-border bg-bz-surface hover:border-bz-sage/40"
              }`}
            >
              <IconBadge tone="sage" size="md" className="mb-4">
                <Icon className="size-5" />
              </IconBadge>
              <div className="text-[14.5px] font-bold leading-tight">{name}</div>
              <div className="text-[12px] text-bz-text-muted mt-1">{count} apps</div>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {APPS.map((app) => (
            <Card key={app.name} tone="light" pad="md" hover="lift">
              <div className="flex items-center gap-3 mb-4">
                <IconBadge tone="sage" size="md">
                  <app.Icon className="size-5" />
                </IconBadge>
                <div className="flex-1 min-w-0">
                  <div className="text-[14.5px] font-bold truncate">{app.name}</div>
                  <div className="text-[11.5px] text-bz-text-muted truncate">by {app.by}</div>
                </div>
                {app.free && <PillBadge tone="sage">Free</PillBadge>}
              </div>
              <p className="text-[13px] text-bz-text-muted leading-[1.6] mb-4">{app.desc}</p>
              <div className="flex items-center justify-between pt-3 border-t border-bz-border text-[12px]">
                <div className="flex items-center gap-1.5">
                  <Star className="size-3 text-bz-accent fill-bz-accent" />
                  <span className="font-bold tabular-nums">{app.rating}</span>
                  <span className="text-bz-text-muted">· {app.installs}</span>
                </div>
                <a href="#" className="font-bold text-bz-sage hover:underline">View</a>
              </div>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}

function ListYoursSection() {
  return (
    <Section tone="dark">
      <Container width="narrow">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <SectionHeading
              eyebrow="Built something? List it."
              eyebrowTone="accent"
              title={<>Reach 50,000+ Bizak customers from the install screen.</>}
              description="Our marketplace is open to certified technology partners. Submit your listing through the Partner Portal Bizak handles distribution, billing, OAuth scopes, and review."
              tone="light"
              maxWidth={520}
            />
            <div className="mt-10 flex flex-wrap gap-3">
              <Button variant="accent" size="lg" href="/partners/technology" withArrow>
                Become an ISV
              </Button>
              <Button variant="ghostDark" size="lg" href="/documentation">
                Listing Requirements
              </Button>
            </div>
          </div>

          <Card tone="dark" pad="lg">
            <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-white/40 mb-5">
              Why list on Bizak
            </div>
            <div className="flex flex-col gap-4">
              {[
                { v: "0%",    l: "Listing fee for the first year" },
                { v: "85/15", l: "Revenue share after Yr 1 partner-favorable" },
                { v: "50k+",  l: "Bizak tenants reachable from install" },
                { v: "5 days", l: "Avg. review turnaround" },
              ].map((s) => (
                <div key={s.l} className="flex items-baseline gap-4">
                  <div className="text-[24px] font-bold tabular-nums text-bz-accent w-24 shrink-0">
                    {s.v}
                  </div>
                  <div className="text-[14px] text-white/70 leading-[1.55]">{s.l}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </Container>
    </Section>
  );
}

export function MarketplacePage() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <Header />
      <main>
        <HeroSection />
        <FeaturedSection />
        <CategorySection />
        <ListYoursSection />
      </main>
      <Footer />
    </div>
  );
}
