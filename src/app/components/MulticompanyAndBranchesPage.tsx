import {
  Building2, Coins, Boxes, FileSpreadsheet,
  Handshake, Receipt, Lock, Layers, ShieldCheck,
} from "lucide-react";
import {
  Section, Container, SectionHead, BentoGrid, Bento, Pill, Heading,
  BadgeGreen, StepCard, BigCard, EntityRow, StatusChip, Tick,
} from "./bz";

// ── Data ──────────────────────────────────────────────────────────────────────

const PAINS = [
  {
    Icon: Boxes,
    title: "Siloed Instances",
    desc: "Every entity runs its own ERP, its own login, its own master data. Customers, items, and vendors get duplicated across the group with no shared truth.",
  },
  {
    Icon: FileSpreadsheet,
    title: "Excel-Bound Consolidation",
    desc: "The group controller pulls trial balances from each subsidiary, hand-translates FX, and stitches them in a workbook nobody else can safely edit.",
  },
  {
    Icon: Handshake,
    title: "Manual Intercompany",
    desc: "Sister entities transact constantly — yet every IC invoice is keyed twice, reconciled by hand, and almost always out of balance at period end.",
  },
  {
    Icon: Receipt,
    title: "Local-Tax Patchwork",
    desc: "UK VAT, EU OSS, GCC VAT, US sales tax — each entity needs its own rules, but a single-CoA ERP forces compromises that fail the auditor.",
  },
  {
    Icon: Coins,
    title: "FX Drift & Translation Loss",
    desc: "Exchange rates set in spreadsheets at month-end produce margins that don't reconcile. Every revision sends a ripple through the group pack.",
  },
  {
    Icon: Lock,
    title: "Permission Sprawl",
    desc: "Branch managers need their own P&L — not the group's. A one-tenant ERP forces blunt access rules that leak data or block real work.",
  },
];

const TREE_NODES = [
  { label: "Bizak Holdings",    scope: "Group",     indent: 0 },
  { label: "Americas",          scope: "Region",    indent: 1 },
  { label: "Bizak US Inc.",     scope: "Entity",    indent: 2 },
  { label: "↳ Boston Branch",   scope: "Branch",    indent: 3 },
  { label: "EMEA",              scope: "Region",    indent: 1 },
  { label: "Bizak GmbH",        scope: "Entity",    indent: 2 },
  { label: "↳ Berlin WH",       scope: "Warehouse", indent: 3 },
];

// ── Hero mock ─────────────────────────────────────────────────────────────────

const HERO_ENTITIES = [
  { flag: "🇺🇸", code: "US", curr: "USD", rev: "$18.4M"   },
  { flag: "🇬🇧", code: "UK", curr: "GBP", rev: "£9.6M"    },
  { flag: "🇩🇪", code: "DE", curr: "EUR", rev: "€7.8M"    },
  { flag: "🇦🇪", code: "AE", curr: "AED", rev: "AED 6.8M" },
  { flag: "🇸🇬", code: "SG", curr: "SGD", rev: "S$11.2M"  },
  { flag: "🇦🇺", code: "AU", curr: "AUD", rev: "A$2.8M"   },
];


function GroupConsoleMock() {
  return (
    <div className="w-full rounded-bz-xl border border-bz-line bg-bz-surface overflow-hidden">
      <div className="flex items-end justify-between px-5 py-4 bg-bz-paper-warm border-b border-bz-line">
        <div>
          <div className="text-[10px] font-bold text-bz-text-muted uppercase tracking-[0.1em] mb-1.5">
            Group Revenue · QTD
          </div>
          <div className="text-[26px] font-extrabold text-bz-text leading-none">
            $48.2M{" "}
            <span className="text-[13px] font-bold text-[#16a34a]">+12.4%</span>
          </div>
        </div>
        <StatusChip variant="live">Live</StatusChip>
      </div>

      <div className="divide-y divide-bz-line-soft">
        {HERO_ENTITIES.slice(0, 4).map((e) => (
          <div key={e.code} className="flex items-center gap-3.5 px-5 py-3.5">
            <span className="text-[18px] leading-none">{e.flag}</span>
            <span className="flex-1 text-[13px] font-medium text-bz-text">Bizak {e.code}</span>
            <span className="text-[11px] text-bz-text-muted mr-3">{e.curr}</span>
            <span className="text-[13px] font-bold text-bz-text">{e.rev}</span>
          </div>
        ))}
      </div>

      <div className="px-5 py-3 bg-bz-paper-warm border-t border-bz-line flex justify-between items-center">
        <span className="text-[11px] font-bold text-bz-text">IC Eliminations · $4.1M</span>
        <span className="text-[10px] font-bold text-[#16a34a]">● auto-matched</span>
      </div>
    </div>
  );
}

// ── Step-card visuals ─────────────────────────────────────────────────────────

function EntityTreeVisual() {
  return (
    <div className="rounded-bz-lg border border-bz-line bg-bz-surface overflow-hidden text-[12px]">
      <div className="flex justify-between px-3 py-2 bg-bz-paper-warm border-b border-bz-line">
        <span className="text-[9px] font-bold tracking-[0.12em] uppercase text-bz-text-muted">Node</span>
        <span className="text-[9px] font-bold tracking-[0.12em] uppercase text-bz-text-muted">Scope</span>
      </div>
      {TREE_NODES.map((n) => (
        <div
          key={n.label}
          className="flex justify-between items-center py-2 pr-3 border-t border-bz-line-soft"
          style={{ paddingLeft: `${12 + n.indent * 10}px` }}
        >
          <span className="text-bz-text">{n.label}</span>
          <span className="text-bz-fire font-semibold text-[11px]">{n.scope}</span>
        </div>
      ))}
    </div>
  );
}

function EntityConfigVisual() {
  const rows = [
    { lbl: "Currency",        val: "EUR — Euro"        },
    { lbl: "Tax Engine",      val: "EU VAT · OSS/IOSS" },
    { lbl: "Chart of Accts",  val: "EMEA Standard CoA" },
    { lbl: "Fiscal Year",     val: "Jan – Dec"          },
    { lbl: "Reporting Curr",  val: "USD (Group)"        },
    { lbl: "FX Rate",         val: "ECB Daily Rate"     },
  ];
  return (
    <div className="rounded-bz-lg border border-bz-line bg-bz-surface overflow-hidden">
      <div className="px-4 py-3 bg-bz-paper-warm border-b border-bz-line">
        <div className="text-[11px] font-bold text-bz-text">Bizak GmbH — Entity Setup</div>
        <div className="text-[10px] text-bz-text-muted mt-0.5">Functional currency: EUR</div>
      </div>
      {rows.map(({ lbl, val }) => (
        <div key={lbl} className="flex justify-between px-4 py-2.5 text-[12px] border-t border-bz-line-soft">
          <span className="text-bz-text-muted">{lbl}</span>
          <span className="font-medium text-bz-text">{val}</span>
        </div>
      ))}
    </div>
  );
}

function ConsolidationVisual() {
  const steps = [
    { step: "FX Translation",    note: "5 currencies → USD" },
    { step: "IC Eliminations",   note: "$4.1M eliminated"   },
    { step: "Minority Interest", note: "12.5% DE, 20% SG"   },
    { step: "Group P&L",         note: "$48.2M QTD Revenue"  },
  ];
  return (
    <div className="rounded-bz-lg border border-bz-line bg-bz-surface overflow-hidden">
      <div className="px-4 py-3 bg-bz-paper-warm border-b border-bz-line flex justify-between items-center">
        <div className="text-[11px] font-bold text-bz-text">Group Consolidation</div>
        <span className="text-[9px] font-bold text-[#16a34a] uppercase tracking-[0.1em]">Done in 87s</span>
      </div>
      <div className="p-4 flex flex-col gap-3">
        {steps.map(({ step, note }) => (
          <div key={step} className="flex items-center justify-between text-[12px]">
            <div className="flex items-center gap-2">
              <Tick size="sm" />
              <span className="text-bz-text">{step}</span>
            </div>
            <span className="text-bz-text-muted text-[11px]">{note}</span>
          </div>
        ))}
      </div>
      <div className="px-4 py-3 border-t border-bz-line bg-bz-paper">
        <div className="text-[10px] text-bz-text-muted">Last group close</div>
        <div className="text-[14px] font-bold text-bz-text mt-0.5">Today, 08:41 AM</div>
      </div>
    </div>
  );
}

// ── Auto-IC BigCard visual ────────────────────────────────────────────────────

function AutoICVisual() {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="rounded-bz-md bg-white/[0.08] border border-white/[0.12] p-3">
        <div className="text-[9px] font-bold tracking-[0.1em] uppercase text-white/50 mb-2">
          Seller · Bizak US Inc.
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-[11.5px]">
            <span className="text-white/55">AR — Intercompany</span>
            <span className="font-bold text-bz-fire">DR $24,800</span>
          </div>
          <div className="flex justify-between text-[11.5px]">
            <span className="text-white/55">Revenue — IC Sales</span>
            <span className="text-white/75">CR $24,800</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 py-0.5">
        <div className="h-px flex-1 bg-bz-fire/25" />
        <span className="text-[9px] font-bold text-bz-fire/60 uppercase tracking-[0.1em]">
          IC Ref: IC-2412 · FX 0.921
        </span>
        <div className="h-px flex-1 bg-bz-fire/25" />
      </div>

      <div className="rounded-bz-md bg-white/[0.08] border border-white/[0.12] p-3">
        <div className="text-[9px] font-bold tracking-[0.1em] uppercase text-white/50 mb-2">
          Buyer · Bizak GmbH (DE)
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-[11.5px]">
            <span className="text-white/55">Expense — IC Purchases</span>
            <span className="text-white/75">DR €22,840</span>
          </div>
          <div className="flex justify-between text-[11.5px]">
            <span className="text-white/55">AP — Intercompany</span>
            <span className="font-bold text-bz-fire">CR €22,840</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 pt-1">
        {["Auto-posted", "FX at 0.921", "Elimination tagged", "Zero manual entry"].map((t) => (
          <span
            key={t}
            className="text-[9px] font-bold px-2 py-1 rounded-bz-pill bg-bz-fire/[0.15] text-bz-fire tracking-[0.04em]"
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Group revenue card ────────────────────────────────────────────────────────

function GroupRevenueCard() {
  const rows = [
    { flag: "🇺🇸", name: "Bizak US Inc.",     amount: "$18.4M"   },
    { flag: "🇬🇧", name: "Bizak Europe Ltd.", amount: "£9.6M"    },
    { flag: "🇩🇪", name: "Bizak GmbH",        amount: "€7.8M"    },
    { flag: "🇸🇬", name: "Bizak APAC Pte.",   amount: "S$11.2M"  },
    { flag: "🇦🇪", name: "Bizak MEA FZ-LLC",  amount: "AED 6.8M" },
  ];
  return (
    <div className="rounded-bz-xl border border-bz-line bg-bz-surface overflow-hidden">
      <div className="px-5 py-4 border-b border-bz-line flex justify-between items-start">
        <div>
          <div className="text-[10px] font-bold tracking-[0.12em] uppercase text-bz-text-muted mb-1">
            Revenue · Group QTD
          </div>
          <div className="text-[22px] font-extrabold text-bz-text leading-none">
            $48.2M{" "}
            <span className="text-[12px] font-bold text-[#16a34a]">+12.4%</span>
          </div>
        </div>
        <StatusChip variant="live">Live</StatusChip>
      </div>
      <div className="p-4 flex flex-col gap-2">
        {rows.map((e) => (
          <EntityRow key={e.name} flag={e.flag} name={e.name} amount={e.amount} />
        ))}
      </div>
      <div className="px-5 py-3 border-t border-bz-line flex justify-between items-center">
        <span className="text-[11px] font-bold text-bz-text">IC Eliminations · $4.1M</span>
        <span className="text-[10px] font-bold text-[#16a34a]">● auto-matched</span>
      </div>
    </div>
  );
}

// ── Sections ──────────────────────────────────────────────────────────────────

function HeroSection() {
  return (
    <Section tone="b" pad="hero">
      <Container>
        <div className="flex flex-col items-center text-center">
          <BadgeGreen style={{ marginBottom: 28 }}>Platform Capability</BadgeGreen>
          <Heading level={2} style={{ marginBottom: 36 }}>
            One ERP. Many entities.{" "}{<br/>}
            Zero spreadsheet rollups.
          </Heading>
          <div className="flex flex-wrap justify-center gap-[10px]">
            <Pill variant="dark" withArrowUpRight href="/contact">Book a Demo</Pill>
            <Pill variant="light" href="https://system.bizakerp.com/account/self-register">
              Start Free Trial
            </Pill>
          </div>
        </div>
        <div className="mt-14">
          <GroupConsoleMock />
        </div>
      </Container>
    </Section>
  );
}

function GroupPainSection() {
  return (
    <Section tone="a">
      <Container>
        <SectionHead
          index="01"
          label="The Group Tax"
          title={
            <>
              Six entities, six general ledgers —{" "}
              <Heading.Muted>and one CFO running the rollup in Excel.</Heading.Muted>
            </>
          }
          description="Most ERPs were built for a single legal entity. Add a branch, an acquisition, or a foreign subsidiary, and the architecture starts to leak — through CSV exports, manual elimination journals, and a month-end that always arrives a week late."
          titleMaxWidth={700}
        />
        <BentoGrid cols={3}>
          {PAINS.map(({ Icon, title, desc }) => (
            <Bento key={title} tone="paper" hover>
              <Bento.Header title={title} icon={<Icon className="size-5" />} />
              <Bento.Desc>{desc}</Bento.Desc>
            </Bento>
          ))}
        </BentoGrid>
      </Container>
    </Section>
  );
}

function EntitySetupSection() {
  return (
    <Section tone="b">
      <Container>
        <SectionHead
          index="02"
          label="From new entity to group close"
          title={
            <>
              Stand up a subsidiary.{" "}
              <Heading.Muted>Roll up the group. In one afternoon.</Heading.Muted>
            </>
          }
          titleMaxWidth={620}
        />
        <div className="flex flex-col gap-5">
          <StepCard
            number="01"
            tag="Model"
            title="Define your group hierarchy"
            bullets={[
              "Holding companies, subsidiaries, branches, and cost centres — all in one tree.",
              "Roll up P&L at any level: group, region, country, or business unit.",
              "No limit on entities or nesting depth.",
            ]}
            visual={<EntityTreeVisual />}
          />
          <StepCard
            number="02"
            tag="Configure"
            title="Each entity gets its own books"
            bullets={[
              "Own chart of accounts, closing calendar, and fiscal schedule.",
              "38 pre-wired tax engines — VAT, GST, withholding, e-invoicing.",
              "Functional and reporting currency with daily or period FX rates.",
            ]}
            visual={<EntityConfigVisual />}
          />
          <StepCard
            number="03"
            tag="Close"
            title="Roll up the group in 90 seconds"
            bullets={[
              "Automatic FX translation from functional to group currency.",
              "IC invoices, loans, and transfers eliminate on demand.",
              "Group P&L and balance sheet refresh live — not at month-end.",
            ]}
            cta={{ variant: "dark", withTick: true, href: "/contact", children: "Book a Demo" }}
            visual={<ConsolidationVisual />}
          />
        </div>
      </Container>
    </Section>
  );
}

function AutoICSection() {
  return (
    <Section tone="a">
      <Container>
        <BigCard
          text={{
            title: "One IC invoice. Both sides auto-posted.",
            body: "When Bizak US sells to Bizak GmbH, a single transaction creates the AR in the seller and the AP in the buyer — in both currencies, with a matched IC reference and elimination tags pre-applied for close.",
            bullets: [
              "Mirror posting in both entities, instantly.",
              "FX conversion at the transaction-date rate.",
              "Elimination tags ready for group close.",
              "Zero manual journal entries, zero reconciliation backlog.",
            ],
            cta: { variant: "accent", withArrow: true, href: "/contact", children: "See it live" },
          }}
          visual={<AutoICVisual />}
        />
      </Container>
    </Section>
  );
}

function CapabilitiesSection() {
  return (
    <Section tone="dark">
      <Container>
        <SectionHead
          index="03"
          label="Capabilities"
          title={
            <>
              Multi-entity architecture,{" "}
              <Heading.Muted>baked into the core.</Heading.Muted>
            </>
          }
          tone="dark"
          titleMaxWidth={580}
        />
        <BentoGrid cols={12}>
          <Bento tone="dark" dotGrid span={7}>
            <Bento.Header
              title="Entity Tree & Org Map"
              icon={<Building2 className="size-5 text-bz-fire" />}
            />
            <Bento.Desc>
              Model holding companies, subsidiaries, branches, and cost centres as a real hierarchy.
              Roll up at any level — group, region, country, or business unit.
            </Bento.Desc>
            <Bento.Footer tone="dark">
              {TREE_NODES.slice(0, 5).map((n) => (
                <div
                  key={n.label}
                  className="flex justify-between text-[11px] py-1.5 border-t border-white/[0.06] first:border-0"
                  style={{ paddingLeft: `${8 + n.indent * 8}px` }}
                >
                  <span className="text-white/60">{n.label}</span>
                  <span className="text-bz-fire text-[10px] font-semibold">{n.scope}</span>
                </div>
              ))}
            </Bento.Footer>
          </Bento>

          <Bento tone="dark" span={5}>
            <Bento.Header
              title="Auto Intercompany"
              icon={<Handshake className="size-5 text-bz-fire" />}
            />
            <Bento.Desc>
              Entity A invoices entity B — Bizak posts both sides in both currencies with matched IC
              references and elimination tags pre-applied for close.
            </Bento.Desc>
            <Bento.Footer tone="dark">
              <div className="grid grid-cols-3 gap-3">
                {[["Auto", "Mirror Post"], ["Live", "FX Reval"], ["1-click", "IC Match"]].map(
                  ([val, sub]) => (
                    <div key={sub} className="text-center">
                      <div className="text-[16px] font-bold text-bz-fire">{val}</div>
                      <div className="text-[9px] font-semibold tracking-[0.06em] uppercase text-white/45 mt-0.5">
                        {sub}
                      </div>
                    </div>
                  )
                )}
              </div>
            </Bento.Footer>
          </Bento>

          <Bento tone="dark" span={4}>
            <Bento.Header
              title="Local Tax Engines"
              icon={<Receipt className="size-5 text-bz-fire" />}
            />
            <Bento.Desc>
              38 pre-configured rules — VAT, GST, sales tax, withholding. E-invoicing, OSS/IOSS, and
              reverse-charge logic built in per entity.
            </Bento.Desc>
            <Bento.Footer tone="dark">
              <div className="text-[30px] font-bold text-bz-fire leading-none">38</div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.06em] text-white/45 mt-1">
                Tax Engines
              </div>
            </Bento.Footer>
          </Bento>

          <Bento tone="dark" span={4}>
            <Bento.Header
              title="Live Consolidation"
              icon={<Layers className="size-5 text-bz-fire" />}
            />
            <Bento.Desc>
              Group P&L and balance sheet refresh on demand. FX translation, IC eliminations, and
              minority interest — all in under 90 seconds.
            </Bento.Desc>
            <Bento.Footer tone="dark">
              <div className="text-[30px] font-bold text-bz-fire leading-none">&lt;90s</div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.06em] text-white/45 mt-1">
                Group Close
              </div>
            </Bento.Footer>
          </Bento>

          <Bento tone="dark" span={4}>
            <Bento.Header
              title="Entity-Aware Roles"
              icon={<ShieldCheck className="size-5 text-bz-fire" />}
            />
            <Bento.Desc>
              Permissions scope to any node of the entity tree. Branch managers see their branch;
              the group CFO sees everything.
            </Bento.Desc>
            <Bento.Footer tone="dark">
              <div className="flex flex-wrap gap-1.5">
                {["Group", "Region", "Entity", "Branch"].map((b) => (
                  <span
                    key={b}
                    className="text-[9px] font-bold px-2 py-1 rounded-bz-pill bg-bz-fire/[0.12] text-bz-fire tracking-[0.06em] uppercase"
                  >
                    {b}
                  </span>
                ))}
              </div>
            </Bento.Footer>
          </Bento>
        </BentoGrid>
      </Container>
    </Section>
  );
}

function GroupVisibilitySection() {
  return (
    <Section tone="b">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          <div>
            <SectionHead
              index="04"
              label="Group Visibility"
              title={
                <>
                  The whole group, on one screen —{" "}
                  <Heading.Muted>without leaving the ledger.</Heading.Muted>
                </>
              }
              description="No exports. No nightly batches. Bizak holds every entity in one tenant, so group reporting is just another scope on the same data your subsidiaries are posting into right now."
              titleMaxWidth={460}
              spacing="tight"
            />
            <ul className="flex flex-col gap-3 mt-6">
              {[
                {
                  bold: "Functional + Reporting Currency",
                  rest: " — Each entity transacts in its functional currency; the group sees translated values live, with daily, monthly, or custom FX rate sets.",
                },
                {
                  bold: "Eliminations on the Fly",
                  rest: " — IC invoices, loans, and inventory transfers eliminate automatically when you switch to the group view.",
                },
                {
                  bold: "Drill from Group to Voucher",
                  rest: " — Click a group P&L line, drop into the entity, the journal, then the source document — without a different tool.",
                },
              ].map(({ bold, rest }) => (
                <li key={bold} className="flex gap-3">
                  <Tick size="sm" className="mt-0.5 flex-shrink-0" />
                  <span className="text-[14px] text-bz-text-muted leading-[1.7]">
                    <strong className="text-bz-text">{bold}</strong>
                    {rest}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <GroupRevenueCard />
        </div>
      </Container>
    </Section>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function MulticompanyAndBranchesPage() {
  return (
    <>
      <HeroSection />
      <GroupPainSection />
      <EntitySetupSection />
      <AutoICSection />
      <CapabilitiesSection />
      <GroupVisibilitySection />
    </>
  );
}
