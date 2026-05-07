import {
  Plug,
  Code2,
  Webhook,
  Database,
  ShieldCheck,
  Zap,
  Boxes,
  GitBranch,
  Sparkles,
  Terminal,
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

const API_SURFACES = [
  { Icon: Code2,    name: "REST API",        detail: "OpenAPI 3.1, idempotent writes, cursor pagination" },
  { Icon: Webhook,  name: "Webhooks",        detail: "At-least-once delivery, signed payloads, replay UI" },
  { Icon: Database, name: "Bulk import",     detail: "Chunked uploads, dry-run validation, partial rollback" },
  { Icon: GitBranch, name: "GraphQL",         detail: "Read-only schema for analytics & dashboard apps" },
  { Icon: ShieldCheck, name: "OAuth 2 + scopes", detail: "Granular scopes, refresh tokens, app installs" },
  { Icon: Terminal, name: "TypeScript SDK",  detail: "First-party SDK · auto-generated · semver-stable" },
];

const INTEGRATION_PATHS = [
  {
    tag: "Native app",
    title: "Build in our marketplace",
    body: "Ship as a native Bizak app — installed inside the customer's tenant, billed through Bizak, listed in the marketplace.",
    pillTone: "accent" as const,
  },
  {
    tag: "Embedded",
    title: "Embed Bizak inside your product",
    body: "White-labeled API access for vertical SaaS embedding ERP into their own product. Run finance, inventory, or projects under your brand.",
    pillTone: "sage" as const,
  },
  {
    tag: "Headless",
    title: "Headless commerce / ops backbone",
    body: "Power your storefront, mobile app, or workflow tool with Bizak as the system of record. Fast reads, eventual consistency where it counts.",
    pillTone: "neutral" as const,
  },
];

const ECOSYSTEM = [
  { name: "Stripe",       cat: "Payments" },
  { name: "Shopify",      cat: "Commerce" },
  { name: "HubSpot",      cat: "CRM" },
  { name: "Slack",        cat: "Comms" },
  { name: "Twilio",       cat: "Messaging" },
  { name: "AWS",          cat: "Infra" },
  { name: "Google Drive", cat: "Storage" },
  { name: "DocuSign",     cat: "eSign" },
];

function ApiPanel() {
  return (
    <div className="biz-mesh-card relative w-full rounded-bz-xl border border-bz-border bg-bz-surface p-6 shadow-[0_24px_64px_rgba(0,0,0,0.06)] overflow-hidden">
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-bz-text-muted">
            api.bizakerp.com
          </div>
          <div className="text-[18px] font-bold mt-0.5">Developer surface</div>
        </div>
        <PillBadge tone="live" dot>v2 Stable</PillBadge>
      </div>

      <div className="rounded-bz-md bg-bz-deep text-white p-4 font-medium text-[12.5px] leading-[1.7] mb-5">
        <div className="flex items-center gap-2 mb-3 text-white/40 text-[10.5px] uppercase tracking-[0.1em]">
          <span className="size-2 rounded-full bg-bz-accent" /> Live · 200 OK · 84ms
        </div>
        <div className="text-bz-accent">POST /v2/journals</div>
        <div className="text-white/50">{`{ "entity_id": "ent_904",`}</div>
        <div className="text-white/80 pl-4">{`"date": "2026-05-07",`}</div>
        <div className="text-white/80 pl-4">{`"lines": [...],`}</div>
        <div className="text-white/80 pl-4">{`"idempotency_key": "..." }`}</div>
        <div className="text-white/60 mt-2">{`→ "id": "je_2418", "status": "posted"`}</div>
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        {[
          { v: "84ms",  l: "P50 latency" },
          { v: "99.98%", l: "Uptime · 30d" },
          { v: "12k",   l: "RPS / tenant" },
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
      badge={<HeroBadge>For Technology Partners</HeroBadge>}
      title={
        <>
          Build on the<br />
          <span className="text-bz-sage">Bizak APIs.</span>
        </>
      }
      description="An open, REST-first ERP platform. Native marketplace apps, embedded integrations, headless data access — all on the same OAuth 2 surface, semver-stable SDKs, and audit-by-default writes."
      actions={
        <>
          <Button variant="primary" size="lg" href="/documentation" withArrow>
            Read the API Docs
          </Button>
          <Button variant="outline" size="lg" href="/partners#apply">
            Apply as ISV
          </Button>
        </>
      }
      stats={[
        { value: "v2",   label: "Stable API" },
        { value: "84ms", label: "P50 latency" },
        { value: "200+", label: "Marketplace apps" },
      ]}
      visual={<ApiPanel />}
      visualClassName=""
    />
  );
}

function ApiSurfaceSection() {
  return (
    <Section tone="white">
      <Container width="narrow">
        <SectionHeading
          eyebrow="Developer surface"
          title="Modern primitives, all the way down."
          description="Every page, button, and form in Bizak is built on the same API your integration calls. There is no 'partner edition' or rate-throttled sandbox — you're on the production surface from day one."
          maxWidth={680}
          className="mb-14"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {API_SURFACES.map(({ Icon, name, detail }) => (
            <Card key={name} tone="light" pad="md" hover="glow">
              <div className="flex items-center gap-3 mb-4">
                <IconBadge tone="sage" size="md">
                  <Icon className="size-5" />
                </IconBadge>
                <span className="text-[15.5px] font-bold">{name}</span>
              </div>
              <p className="text-[13px] text-bz-text-muted leading-[1.6]">{detail}</p>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}

function PathSection() {
  return (
    <Section tone="light">
      <Container width="narrow">
        <SectionHeading
          eyebrow="Three integration paths"
          title="Pick the model that fits your product."
          description="Same APIs, three commercial shapes. You can ship one, evolve into another, or run more than one at the same time."
          maxWidth={680}
          className="mb-14"
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {INTEGRATION_PATHS.map((p) => (
            <Card key={p.title} tone="light" pad="lg" hover="lift" className="relative">
              <PillBadge tone={p.pillTone} className="mb-6">{p.tag}</PillBadge>
              <div className="text-[20px] font-bold tracking-[-0.015em] mb-3">{p.title}</div>
              <p className="text-[14.5px] text-bz-text-muted leading-[1.7]">{p.body}</p>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}

function MarketplaceSection() {
  return (
    <Section tone="dark">
      <Container width="narrow">
        <div className="grid grid-cols-1 lg:grid-cols-[6fr_5fr] gap-12 lg:gap-16 items-center">
          <div>
            <SectionHeading
              eyebrow="Marketplace"
              eyebrowTone="accent"
              title="Distribution built into the platform."
              description="When you ship in our marketplace, every Bizak customer can install your app from inside their tenant. We handle billing, OAuth scopes, and lifecycle — you focus on the product."
              tone="light"
              maxWidth={500}
            />

            <div className="mt-10 grid grid-cols-3 gap-3">
              {[
                { v: "200+",  l: "Live apps" },
                { v: "50k+",  l: "Customer accounts" },
                { v: "0%",    l: "Listing fee Yr 1" },
              ].map((s) => (
                <div key={s.l} className="rounded-bz-md border border-white/10 bg-white/[0.04] p-4">
                  <div className="text-[22px] font-bold tabular-nums text-bz-accent">{s.v}</div>
                  <div className="text-[11.5px] text-white/55 mt-0.5">{s.l}</div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button variant="accent" size="md" href="/partners/marketplace" withArrow>
                Visit Marketplace
              </Button>
              <Button variant="ghostDark" size="md" href="/documentation">
                Listing Requirements
              </Button>
            </div>
          </div>

          <Card tone="dark" pad="md">
            <div className="flex items-center justify-between mb-5">
              <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-white/40">
                Integration ecosystem
              </div>
              <Sparkles className="size-4 text-bz-accent" />
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {ECOSYSTEM.map((e) => (
                <div
                  key={e.name}
                  className="flex items-center justify-between rounded-bz-md border border-white/10 bg-white/[0.03] px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="size-7 rounded-md bg-bz-accent/10 text-bz-accent flex items-center justify-center">
                      <Plug className="size-3.5" />
                    </div>
                    <span className="text-[13px] font-semibold">{e.name}</span>
                  </div>
                  <span className="text-[11px] text-white/40">{e.cat}</span>
                </div>
              ))}
            </div>
            <div className="mt-5 pt-5 border-t border-white/10 flex items-center gap-3 text-[12px] text-white/50">
              <Zap className="size-3.5 text-bz-accent" />
              200+ partners shipping production integrations on Bizak v2
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
        <SectionHeading
          title={<>Build it on Bizak.</>}
          description="Free developer tenants, full v2 docs, and a partner engineer to onboard your first integration."
          tone="light"
          align="center"
          maxWidth={620}
        />
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Button variant="accent" size="lg" href="/partners#apply" withArrow>
            Apply as ISV
          </Button>
          <Button variant="ghostDark" size="lg" href="/documentation">
            Read API Docs
          </Button>
        </div>
      </Container>
    </Section>
  );
}

export function TechnologyPartnersPage() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <Header />
      <main>
        <HeroSection />
        <ApiSurfaceSection />
        <PathSection />
        <MarketplaceSection />
        <ClosingCta />
      </main>
      <Footer />
    </div>
  );
}
