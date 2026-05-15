import {
  Terminal,
  Webhook,
  Boxes,
  Plug,
  Database,
  Workflow,
  Code2,
  ShieldCheck,
  Send,
  TrendingUp,
} from "lucide-react";
import {
  Accordion,
  BadgeGreen,
  Bento,
  BentoGrid,
  Container,
  DotGrid,
  Heading,
  Pill,
  PillGroup,
  Section,
  SectionHead,
  StatusChip,
} from "../bz";

// ════════════════════════════════════════════════════════════════════════════
// CONTENT DATA
// ════════════════════════════════════════════════════════════════════════════

const METRICS = [
  { v: "84 ms",  l: "P50 latency" },
  { v: "99.98%", l: "Uptime · 30d" },
  { v: "200+",   l: "Live apps" },
];

const EVENTS = [
  { name: "journal.posted", ref: "je_2418" },
  { name: "invoice.paid",   ref: "INV-2046" },
  { name: "stock.adjusted", ref: "WH-02" },
  { name: "order.shipped",  ref: "SO-1184" },
];

const FIRMS = [
  {
    icon: Boxes,
    title: "Vertical SaaS",
    desc: "Industry software embedding Bizak finance and ops beneath their own product.",
  },
  {
    icon: Plug,
    title: "Integration builders",
    desc: "Connector and middleware teams wiring Bizak into the tools customers already run.",
  },
  {
    icon: Database,
    title: "Data & analytics tools",
    desc: "BI, warehouse and reporting products reading Bizak as a system of record.",
  },
  {
    icon: Workflow,
    title: "Automation & dev shops",
    desc: "No-code, workflow and agency teams shipping automations on the Bizak API.",
  },
];

const MODEL_POINTS = [
  "Every Bizak customer installs your app from inside their own tenant, in a click.",
  "Billing, OAuth scopes and lifecycle run through Bizak, so there is no per-customer plumbing.",
];

const CLAUSES = [
  {
    n: "01",
    icon: Code2,
    title: "Production API, v2 stable",
    body: "REST with OpenAPI 3.1, idempotent writes and cursor pagination. The same surface every Bizak screen calls, with no partner-edition throttle.",
  },
  {
    n: "02",
    icon: Webhook,
    title: "Webhooks and events",
    body: "At-least-once delivery, signed payloads and a replay UI. Your integration reacts to ledger, inventory and order events the moment they post.",
  },
  {
    n: "03",
    icon: ShieldCheck,
    title: "OAuth 2 and security review",
    body: "Granular scopes, refresh tokens and tenant-scoped installs. A guided security review clears your app before it lists.",
  },
  {
    n: "04",
    icon: Boxes,
    title: "Marketplace listing and billing",
    body: "A listing every Bizak customer can install in a click, with metering and billing handled by the platform, not your own invoicing stack.",
  },
];

const STEPS = [
  {
    n: "1",
    icon: Send,
    title: "Apply",
    body: "Submit your product profile and integration plan. A partner engineer replies within two business days.",
  },
  {
    n: "2",
    icon: Terminal,
    title: "Build",
    body: "A free developer tenant, full v2 docs and the TypeScript SDK. Build against the production surface from day one.",
  },
  {
    n: "3",
    icon: ShieldCheck,
    title: "Submit",
    body: "Run the guided security review, then publish your listing to the Bizak Marketplace. About two weeks.",
  },
  {
    n: "4",
    icon: TrendingUp,
    title: "Launch & scale",
    body: "Go live to the customer base. Your install count compounds as every new Bizak tenant becomes a prospect.",
  },
];

const FAQS = [
  {
    q: "Is there a separate partner API?",
    a: "No. You build on the same v2 API every Bizak screen calls. There is no rate-throttled partner sandbox, your developer tenant runs on the production surface from day one.",
  },
  {
    q: "What does the security review cover?",
    a: "A guided review of your OAuth scopes, data handling and tenant isolation before your app lists. Most partners clear it in under two weeks, with a partner engineer walking you through each step.",
  },
  {
    q: "How does billing work for my app?",
    a: "Customers install and pay for your app through Bizak. Metering, invoicing and renewals run on the platform, so you ship the product and skip the billing plumbing.",
  },
  {
    q: "Can I embed Bizak inside my own product?",
    a: "Yes. Alongside marketplace apps, the API supports embedded and headless use, so vertical SaaS can run finance, inventory or projects under their own brand.",
  },
];

// ════════════════════════════════════════════════════════════════════════════
// [HERO] developer surface live API console + event stream
// ════════════════════════════════════════════════════════════════════════════

function HeroSection() {
  return (
    <Section tone="b" pad="hero">
      <Container>
        <div className="flex flex-col items-center text-center">
          <BadgeGreen style={{ marginBottom: 28 }}>Bizak Technology Partners</BadgeGreen>

          <Heading level={2} className="max-w-[760px]" style={{ marginBottom: 36 }}>
            Build once on the Bizak API, reach every{" "}
            <Heading.Muted>
              customer in the marketplace.
            </Heading.Muted>
          </Heading>

          <PillGroup>
            <Pill variant="dark" withArrowUpRight href="#join">
              Become a Partner
            </Pill>
            <Pill variant="light" href="/contact">
              Talk to Sales
            </Pill>
          </PillGroup>
        </div>

        <div className="bz-hero-visual">
          <DeveloperSurface />
        </div>
      </Container>
    </Section>
  );
}

// Two-card composition: the live API console (the surface you build on)
// paired with the webhook event stream (what your integration reacts to).
function DeveloperSurface() {
  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
      {/* API console the request you write against the production surface */}
      <div className="overflow-hidden rounded-bz-2xl border border-bz-line bg-bz-surface lg:col-span-7">
        <div className="flex flex-col p-6 sm:p-8">
          <div className="flex items-center justify-between gap-3">
            <span className="flex size-12 items-center justify-center rounded-bz-pill bg-bz-olive">
              <Terminal size={22} strokeWidth={1.6} className="text-bz-fire" />
            </span>
            <StatusChip variant="posted">v2 · Stable</StatusChip>
          </div>

          <h3 className="mt-5 text-[19px] font-medium tracking-tight text-bz-text sm:text-[21px]">
            api.bizakerp.com
          </h3>
          <p className="mt-1.5 text-[13px] text-bz-text-muted">
            The production surface every Bizak screen is built on.
          </p>

          {/* A live request, posted against the v2 API. */}
          <div className="mt-6 rounded-bz-xl bg-bz-olive p-5">
            <div className="flex items-center gap-2 text-[10.5px] font-medium uppercase tracking-[0.12em] text-white/[0.5]">
              <span className="size-1.5 rounded-bz-pill bg-bz-fire" />
              200 OK · 84 ms
            </div>
            <div className="mt-3.5 text-[13px] leading-[1.8] tabular-nums text-white/[0.78]">
              <div className="text-bz-fire">POST /v2/journals</div>
              <div>{`{ "entity_id": "ent_904",`}</div>
              <div className="pl-3">{`"amount": "12,400.00" }`}</div>
              <div className="mt-1.5 text-white/[0.55]">{`→ "id": "je_2418" · posted`}</div>
            </div>
          </div>

          {/* Surface metrics, identical for every partner. */}
          <div className="mt-6 grid grid-cols-3 overflow-hidden rounded-bz-xl border border-bz-line-soft">
            {METRICS.map((m, i) => (
              <div
                key={m.l}
                className={`flex flex-col bg-bz-surface p-4 ${
                  i !== 0 ? "border-l border-bz-line-soft" : ""
                }`}
              >
                <span className="text-[16px] font-medium tabular-nums text-bz-text sm:text-[17px]">
                  {m.v}
                </span>
                <span className="mt-1 text-[10.5px] font-medium uppercase tracking-[0.1em] text-bz-text-soft">
                  {m.l}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Webhook event stream what your integration reacts to.
          Hidden on mobile the API console alone carries the hero there. */}
      <div className="hidden rounded-bz-2xl border border-bz-line bg-bz-surface p-6 sm:p-8 lg:col-span-5 lg:flex lg:flex-col">
        <div className="flex items-center justify-between gap-3">
          <span className="flex size-12 items-center justify-center rounded-bz-pill bg-bz-olive">
            <Webhook size={22} strokeWidth={1.6} className="text-bz-fire" />
          </span>
          <StatusChip variant="posted">Delivering</StatusChip>
        </div>

        <h3 className="mt-5 text-[19px] font-medium tracking-tight text-bz-text sm:text-[21px]">
          Event stream
        </h3>
        <p className="mt-2.5 text-[13.5px] leading-[1.65] text-bz-text-muted">
          Signed webhooks your integration reacts to the moment a record
          posts on Bizak.
        </p>

        <div className="mt-6 border-t border-bz-line-soft">
          {EVENTS.map((e) => (
            <div
              key={e.name}
              className="flex items-center justify-between gap-3 border-b border-bz-line-soft py-3.5 last:border-0"
            >
              <div className="flex items-center gap-3">
                <span className="size-2 shrink-0 rounded-bz-pill bg-bz-fire" />
                <span className="text-[13.5px] font-medium text-bz-text">
                  {e.name}
                </span>
              </div>
              <span className="shrink-0 text-[11.5px] tabular-nums text-bz-text-soft">
                {e.ref}
              </span>
            </div>
          ))}
        </div>

        <p className="mt-auto pt-7 text-[11.5px] text-bz-text-soft">
          At-least-once delivery, every payload signed.
        </p>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// [01] WHO BUILDS ON BIZAK
// ════════════════════════════════════════════════════════════════════════════

function WhoBuildsSection() {
  return (
    <Section tone="a">
      <Container>
        <SectionHead
          index="01"
          label="Who it's for"
          title={
            <>
              Built for teams that{" "}
              <Heading.Muted>build software.</Heading.Muted>
            </>
          }
          description="Already shipping a product your customers depend on? Bizak is the open platform you build into."
          titleMaxWidth={680}
        />

        <BentoGrid cols={4}>
          {FIRMS.map(({ icon: Icon, title, desc }) => (
            <Bento key={title} tone="paper" hover>
              <span className="mb-5 flex size-11 items-center justify-center rounded-bz-pill bg-bz-paper-warm text-bz-olive">
                <Icon size={19} strokeWidth={1.6} />
              </span>
              <h3 className="bz-bento-title">{title}</h3>
              <Bento.Desc>{desc}</Bento.Desc>
            </Bento>
          ))}
        </BentoGrid>
      </Container>
    </Section>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// [02] THE DISTRIBUTION MODEL build once, reach the whole base
// ════════════════════════════════════════════════════════════════════════════

function DistributionSection() {
  return (
    <Section tone="dark">
      <Container>
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <SectionHead
              index="02"
              label="The distribution model"
              tone="dark"
              title={
                <>
                  Ship your integration once,{" "}
                  <Heading.Muted>and reach every customer Bizak adds.</Heading.Muted>
                </>
              }
              // description="You don't rebuild the connection for each account. List once, and the marketplace puts your app inside every Bizak tenant."
              spacing="none"
            />
            <ul className="mt-8 flex flex-col gap-3.5">
              {MODEL_POINTS.map((p) => (
                <li
                  key={p}
                  className="flex items-start gap-3 text-[13.5px] leading-[1.6] text-white/[0.8]"
                >
                  <span className="mt-[7px] size-1.5 shrink-0 rounded-bz-pill bg-bz-fire" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>

          <InstallBase />
        </div>
      </Container>
    </Section>
  );
}

// Conceptual visual the installed base accumulates quarter over quarter.
// No hard figures: each band is one cohort of tenants, stacking up.
function InstallBase() {
  const columns = [1, 2, 3, 4];
  return (
    <div className="rounded-bz-2xl bg-bz-olive-soft p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-white/[0.5]">
          Your install base
        </span>
        <div className="flex items-center gap-4 text-[11px] text-white/[0.62]">
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-bz-pill bg-bz-fire" />
            New install
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-bz-pill bg-bz-leaf-deep" />
            Retained
          </span>
        </div>
      </div>

      <div className="mt-8 flex items-end gap-2.5 sm:gap-4">
        {columns.map((n, ci) => (
          <div key={ci} className="flex flex-1 flex-col gap-1.5">
            {Array.from({ length: n }).map((_, bi) => (
              <div
                key={bi}
                className={`h-6 rounded-[4px] sm:h-7 ${
                  bi === 0 ? "bg-bz-fire" : "bg-bz-leaf-deep"
                }`}
              />
            ))}
          </div>
        ))}
      </div>

      <div className="mt-3 h-px bg-white/[0.12]" />

      <p className="mt-4 text-[12.5px] leading-[1.6] text-white/[0.62]">
        Each bar is another quarter. Customers who install keep your app.
      </p>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// [03] THE PROGRAM what every technology partner gets
// ════════════════════════════════════════════════════════════════════════════

function ProgramSection() {
  return (
    <Section tone="b">
      <Container width="narrow">
        <SectionHead
          index="03"
          label="The program"
          title={
            <>
              A developer platform with the{" "}
              <Heading.Muted>surface already shipped.</Heading.Muted>
            </>
          }
          description="Not a sandbox key and a forum thread. It's the production API Bizak itself is built on."
          titleMaxWidth={680}
        />

        <div className="overflow-hidden rounded-bz-2xl border border-bz-line-soft bg-bz-paper">
          {CLAUSES.map(({ n, icon: Icon, title, body }, i) => (
            <div
              key={n}
              className={`grid grid-cols-[auto_1fr] items-start gap-x-4 p-6 sm:gap-x-5 sm:p-8 ${
                i !== 0 ? "border-t border-bz-line-soft" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-[12px] font-medium tabular-nums text-bz-text-soft">
                  {n}
                </span>
                <span className="flex size-10 items-center justify-center rounded-bz-pill bg-bz-paper-warm text-bz-olive">
                  <Icon size={18} strokeWidth={1.6} />
                </span>
              </div>
              <div>
                <h3 className="text-[16px] font-medium text-bz-text">{title}</h3>
                <p className="mt-2.5 max-w-[600px] text-[14px] leading-[1.65] text-bz-text-muted">
                  {body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// [04] GET STARTED the path to becoming a technology partner
// ════════════════════════════════════════════════════════════════════════════

function JoinSection() {
  return (
    <Section tone="a" id="join">
      <Container>
        <SectionHead
          index="04"
          label="Get started"
          title={
            <>
              From your first API call{" "}
              <Heading.Muted>to a live marketplace listing.</Heading.Muted>
            </>
          }
          description="Most partners go from a developer tenant to an installable app inside a single quarter."
          titleMaxWidth={680}
        />

        <div className="grid grid-cols-1 gap-8 md:grid-cols-4 md:gap-6">
          {STEPS.map(({ n, icon: Icon, title, body }, i) => (
            <div key={n} className="relative flex gap-4 md:block">
              {i < STEPS.length - 1 && (
                <span
                  aria-hidden
                  className="absolute left-12 -right-6 top-6 hidden h-px bg-bz-line md:block"
                />
              )}
              <span className="relative z-10 flex size-12 shrink-0 items-center justify-center rounded-bz-pill border border-bz-line bg-bz-section-a text-bz-olive md:mb-6">
                <Icon size={18} strokeWidth={1.6} />
              </span>
              <div>
                <div className="text-[11px] font-medium uppercase tracking-[0.1em] text-bz-text-soft">
                  Step {n}
                </div>
                <h3 className="mt-1.5 text-[15.5px] font-medium text-bz-text">
                  {title}
                </h3>
                <p className="mt-2 text-[13.5px] leading-[1.6] text-bz-text-muted">
                  {body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// [05] QUESTIONS
// ════════════════════════════════════════════════════════════════════════════

function FaqSection() {
  return (
    <Section tone="b">
      <Container>
        <div className="grid grid-cols-1 items-start gap-10 md:grid-cols-[1fr_1.3fr]">
          {/* Dark intro panel */}
          <div className="relative flex min-h-[320px] flex-col justify-between overflow-hidden rounded-bz-2xl bg-bz-olive p-8 text-bz-text-on-dark">
            <DotGrid tone="dark" />
            <div className="relative">
              <SectionHead
                index="05"
                label="FAQ"
                tone="dark"
                title={
                  <>
                    Partner questions,{" "}
                    <Heading.Muted>answered.</Heading.Muted>
                  </>
                }
                spacing="none"
              />
            </div>
            <PillGroup className="relative mt-8">
              <Pill variant="accent" href="#join" withArrowUpRight>
                Become a Partner
              </Pill>
              <Pill variant="ghostDark" href="/contact">
                Talk to Sales
              </Pill>
            </PillGroup>
          </div>

          {/* Accordion */}
          <Accordion defaultOpen={null}>
            {FAQS.map((f) => (
              <Accordion.Item key={f.q} question={f.q}>
                {f.a}
              </Accordion.Item>
            ))}
          </Accordion>
        </div>
      </Container>
    </Section>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PAGE
// ════════════════════════════════════════════════════════════════════════════

export function TechnologyPartnersPage() {
  return (
    <main>
      <HeroSection />
      <WhoBuildsSection />
      <DistributionSection />
      <ProgramSection />
      <JoinSection />
      <FaqSection />
    </main>
  );
}
