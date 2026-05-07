import "../../styles/style.css";
import { Header } from "./Header";
import { Footer } from "./Footer";
import {
  Building2, Globe, Coins, Users, ShieldCheck, Layers, CheckCircle, Boxes,
  FileSpreadsheet, Handshake, Receipt, Lock, LayoutDashboard,
} from "lucide-react";
import {
  Section, Container, SectionHeading, Button, Card, IconBadge, HeroBadge, HeroCentered, PillBadge, Stat,
} from "./marketing";

// ─── HERO VISUAL ─────────────────────────────────────────────────────────────
const ENTITIES = [
  { code: "US", x: 22,  y: 24,  curr: "USD", live: true  },
  { code: "UK", x: 132, y: 14,  curr: "GBP", live: true  },
  { code: "DE", x: 240, y: 22,  curr: "EUR", live: true  },
  { code: "AE", x: 22,  y: 124, curr: "AED", live: true  },
  { code: "SG", x: 132, y: 138, curr: "SGD", live: true  },
  { code: "AU", x: 240, y: 124, curr: "AUD", live: false },
];

function GroupConsoleVisual() {
  return (
    <div className="w-full max-w-[900px] mx-auto">
      <div className="rounded-bz-lg border border-white/20 bg-white/[0.06] p-1.5 shadow-[0_0_60px_rgba(199,255,53,0.12)]">
        <div className="rounded-bz-md bg-white/[0.04] px-4 py-5 sm:px-6 flex flex-col gap-4">

          {/* Window chrome */}
          <div className="flex items-center justify-between">
            <div className="flex gap-1.5">
              {(["#ff5f57", "#ffbd2e", "#28c840"] as const).map((bg) => (
                <div key={bg} style={{ background: bg }} className="w-2.5 h-2.5 rounded-full" />
              ))}
            </div>
            <span className="text-[11px] font-bold text-white uppercase tracking-[0.12em]">
              Bizak · Group Console
            </span>
            <div className="flex items-center gap-1.5">
              <div
                className="biz-pulse-glow w-1.5 h-1.5 rounded-full bg-bz-accent shrink-0"
                style={{ boxShadow: "0 0 8px #C7FF35" }}
              />
              <span className="text-[9px] font-bold text-bz-accent uppercase tracking-[0.14em]">Live</span>
            </div>
          </div>

          {/* Hub SVG — entity labels white for visibility on dark bg */}
          <div className="relative flex items-center justify-center">
            <svg viewBox="0 0 290 160" className="w-full max-w-[420px] h-auto" fill="none">
              <defs>
                <radialGradient id="groupGlow" cx="0.5" cy="0.5" r="0.5">
                  <stop offset="0%" stopColor="var(--bz-accent)" stopOpacity="0.32" />
                  <stop offset="100%" stopColor="var(--bz-accent)" stopOpacity="0" />
                </radialGradient>
              </defs>
              <circle cx="145" cy="80" r="50" fill="url(#groupGlow)" />
              {ENTITIES.map((e) => {
                const cx1 = e.x + 24;
                const cy1 = e.y + 12;
                return (
                  <g key={e.code}>
                    <line x1="145" y1="80" x2={cx1} y2={cy1} stroke="rgba(122,130,109,0.16)" strokeWidth="1" />
                    <line
                      x1={cx1} y1={cy1} x2="145" y2="80"
                      className="biz-flow" stroke="var(--bz-accent)" strokeWidth="1.4"
                      strokeDasharray="3 7" strokeLinecap="round" opacity={e.live ? 0.9 : 0.35}
                    />
                  </g>
                );
              })}
              <rect x="118" y="62" width="54" height="36" rx="6" fill="rgba(199,255,53,0.18)" stroke="var(--bz-accent)" strokeWidth="1.4" />
              <text x="145" y="78" textAnchor="middle" fontSize="8" fontWeight="700" fill="var(--bz-sage)" letterSpacing="0.4">GROUP</text>
              <text x="145" y="92" textAnchor="middle" fontSize="10" fontWeight="800" fill="white">$48.2M</text>
              {ENTITIES.map((e) => (
                <g key={e.code}>
                  <rect x={e.x} y={e.y} width="48" height="24" rx="5" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                  <text x={e.x + 11} y={e.y + 16} textAnchor="middle" fontSize="9" fontWeight="800" fill="white" letterSpacing="0.5">{e.code}</text>
                  <line x1={e.x + 22} y1={e.y + 5} x2={e.x + 22} y2={e.y + 19} stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" />
                  <text x={e.x + 36} y={e.y + 16} textAnchor="middle" fontSize="7" fontWeight="700" fill="var(--bz-sage)">{e.curr}</text>
                  <circle cx={e.x + 43} cy={e.y + 5} r="2.2" fill={e.live ? "#16a34a" : "rgba(122,130,109,0.4)"} />
                </g>
              ))}
            </svg>
          </div>

          {/* Intercompany postings stream */}
          <div className="border-t border-white/[0.07] pt-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[9px] font-bold text-bz-sage uppercase tracking-[0.1em]">Intercompany Postings</span>
              <span className="text-[9px] font-bold text-[#16a34a]">14 today · auto</span>
            </div>
            {[
              { code: "IC-2412", from: "US", to: "DE", amt: "$ 24,800",  ago: "1m"  },
              { code: "IC-2411", from: "UK", to: "AE", amt: "£ 12,400",  ago: "6m"  },
              { code: "IC-2410", from: "SG", to: "AU", amt: "S$ 18,900", ago: "14m" },
            ].map((e) => (
              <div key={e.code} className="grid grid-cols-4 gap-2 text-[10px] py-1 border-t border-white/[0.04]">
                <span className="text-white font-bold tracking-[0.04em]">{e.code}</span>
                <span className="text-bz-sage">{e.from} → {e.to}</span>
                <span className="text-white font-bold text-right">{e.amt}</span>
                <span className="text-[#16a34a] font-bold text-right">{e.ago}</span>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}

// ─── CHALLENGES ──────────────────────────────────────────────────────────────
const CHALLENGES = [
  { Icon: Boxes,            title: "Siloed Instances",         desc: "Every entity runs its own ERP, its own login, its own master data. Customers, items, and vendors get duplicated across the group with no shared truth." },
  { Icon: FileSpreadsheet,  title: "Excel-Bound Consolidation", desc: "Every quarter, the group controller pulls trial balances from each subsidiary, hand-translates the FX, and stitches them in a workbook nobody else can edit safely." },
  { Icon: Handshake,        title: "Manual Intercompany",       desc: "Sister entities transact with each other constantly — yet every IC invoice is keyed twice, reconciled by hand, and almost always out of balance at period end." },
  { Icon: Receipt,          title: "Local-Tax Patchwork",       desc: "UK VAT, EU OSS, GCC VAT, US sales tax — each entity needs the local rules, but a single-CoA system forces compromises that fail the auditor." },
  { Icon: Coins,            title: "FX Drift & Translation Loss", desc: "Exchange rates set in spreadsheets at month-end produce reported margins that don't reconcile. Every revision sends a ripple through the group pack." },
  { Icon: Lock,             title: "Permission Sprawl",         desc: "Branch managers need to see their own P&L — not the group's. A one-tenant ERP forces blunt access rules that leak data or block real work." },
];

function ChallengesSection() {
  return (
    <Section tone="light">
      <Container>
        <SectionHeading
          eyebrow="The Group Tax"
          title="Six entities, six general ledgers — and one CFO running the rollup in Excel."
          description="Most ERPs were built for a single legal entity. Add a branch, an acquisition, or a foreign subsidiary, and the architecture starts to leak — through CSV exports, manual elimination journals, and a month-end that always arrives a week late."
          maxWidth={760}
          className="mb-14"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {CHALLENGES.map(({ Icon: CIcon, title, desc }) => (
            <Card key={title} pad="lg" hover="lift">
              <IconBadge tone="sage" size="md" className="mb-5"><CIcon className="size-5" /></IconBadge>
              <h3 className="text-[16px] font-bold text-bz-text mb-2">{title}</h3>
              <p className="text-[13px] text-bz-text-muted leading-[1.7]">{desc}</p>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}

// ─── SOLUTIONS ───────────────────────────────────────────────────────────────
const SOLUTIONS = [
  { Icon: Building2,       title: "Unlimited Legal Entities",   desc: "Spin up a new company, branch, or warehouse in minutes. Each gets its own currency, calendar, and chart of accounts — but shares masters and policies with the group." },
  { Icon: Layers,          title: "One-Click Consolidation",    desc: "Roll up trial balances across every entity with automatic FX translation, IC eliminations, and minority-interest splits. Refresh the group pack on demand." },
  { Icon: Handshake,       title: "Auto Intercompany",          desc: "When entity A invoices entity B, the matching AR/AP entries post in both ledgers, in both currencies, with a shared IC reference — and reconcile themselves." },
  { Icon: Receipt,         title: "Local-Tax Engine per Entity",desc: "VAT, GST, sales tax, withholding — every entity follows its country's rules out of the box. Filings, e-invoicing, and reverse charges are pre-wired." },
  { Icon: Users,           title: "Entity-Scoped Permissions",  desc: "Roles and data scopes are aware of the entity tree. A branch manager sees only their branch; a CFO sees the group — without copying data anywhere." },
  { Icon: LayoutDashboard, title: "Group + Entity Dashboards",  desc: "Switch between the group lens and any single entity in one click. Same data, same KPIs — different scopes, all in real time." },
];

function SolutionSection() {
  return (
    <Section tone="white">
      <Container>
        <SectionHeading
          eyebrow="The Solution"
          title="Run every entity as itself — manage them as one group"
          align="center"
          className="mb-16"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-12">
          {SOLUTIONS.map(({ Icon: SIcon, title, desc }) => (
            <div key={title}>
              <IconBadge tone="sage" size="md" className="mb-4"><SIcon className="size-5" /></IconBadge>
              <h4 className="text-[16px] font-bold text-bz-text mb-2">{title}</h4>
              <p className="text-[13px] text-bz-text-muted leading-[1.7]">{desc}</p>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}

// ─── CAPABILITIES ────────────────────────────────────────────────────────────
function CapabilitiesSection() {
  return (
    <Section tone="dark">
      <Container>
        <SectionHeading
          eyebrow="Capabilities"
          title="Multi-entity architecture, baked into the core not bolted on top."
          tone="light"
          align="center"
          maxWidth={680}
          className="mb-16"
        />
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-5">
          {/* Entity tree — span 3 */}
          <Card tone="dark" pad="lg" className="lg:col-span-3">
            <h3 className="text-[18px] font-bold text-white mb-2">Entity Tree & Org Map</h3>
            <p className="text-[13px] text-white/50 leading-[1.6] mb-5">
              Model holding companies, subsidiaries, branches, and cost centres as a real tree. Roll up at any level — group, region, country, or business unit.
            </p>
            <div className="border border-white/10 rounded-bz-md overflow-hidden">
              <div className="grid grid-cols-[1fr_auto_1fr] gap-2 px-3 py-2 bg-white/[0.04] text-[9px] font-bold tracking-[0.12em] uppercase text-white/45">
                <span>Node</span><span>·</span><span>Scope</span>
              </div>
              {[
                { src: "Bizak Holdings",     tgt: "Group",     ind: 0 },
                { src: "Americas",           tgt: "Region",    ind: 1 },
                { src: "Bizak US Inc.",      tgt: "Entity",    ind: 2 },
                { src: "↳ Boston Branch",    tgt: "Branch",    ind: 3 },
                { src: "↳ Austin WH",        tgt: "Warehouse", ind: 3 },
                { src: "EMEA",               tgt: "Region",    ind: 1 },
                { src: "Bizak GmbH",         tgt: "Entity",    ind: 2 },
              ].map((r, i) => (
                <div key={i} className="grid grid-cols-[1fr_auto_1fr] gap-2 px-3 py-2 text-[11px] border-t border-white/5">
                  <span className="text-white/55" style={{ paddingLeft: r.ind * 8 }}>{r.src}</span>
                  <span className="text-bz-accent">·</span>
                  <span className="text-[#4ade80]">{r.tgt}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Auto IC — span 3 */}
          <Card tone="dark" pad="lg" className="lg:col-span-3">
            <div className="flex justify-between items-start gap-4 mb-5">
              <div>
                <h3 className="text-[18px] font-bold text-white mb-2">Auto Intercompany</h3>
                <p className="text-[13px] text-white/50 leading-[1.6]">
                  Sell from one entity to another and Bizak posts both sides — AR in the seller, AP in the buyer — with matched references, FX, and elimination tags ready for close.
                </p>
              </div>
              <IconBadge tone="accent" size="lg" className="flex-shrink-0"><Handshake className="size-5" /></IconBadge>
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              {[["Auto", "Mirror Posting"], ["Live", "FX Reval"], ["1-click", "IC Match"]].map(([val, sub]) => (
                <div key={sub} className="bg-white/[0.04] border border-white/10 rounded-bz-md py-3 text-center">
                  <div className="text-[15px] font-bold text-bz-accent">{val}</div>
                  <div className="text-[9px] font-bold tracking-[0.08em] uppercase text-white/40 mt-1">{sub}</div>
                </div>
              ))}
            </div>
          </Card>

          {/* Group console — span 6 */}
          <Card tone="dark" pad="lg" className="lg:col-span-6">
            <div className="grid md:grid-cols-[auto_1fr] gap-8 md:gap-12 items-start">
              <div>
                <div className="text-[44px] font-bold text-bz-accent leading-none">120+</div>
                <p className="text-[10px] font-bold tracking-[0.1em] uppercase text-white/45 mt-2">Entities · Single Tenant</p>
                <div className="flex gap-7 mt-5">
                  {[{ val: "38", lbl: "Tax Engines" }, { val: "< 90s", lbl: "Group Close" }].map((s) => (
                    <div key={s.lbl}>
                      <div className="text-[22px] font-bold text-bz-accent">{s.val}</div>
                      <div className="text-[9px] font-bold tracking-[0.1em] uppercase text-white/35 mt-1">{s.lbl}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="min-w-0">
                <h4 className="text-[18px] font-bold text-white mb-2">The Group Console</h4>
                <p className="text-[13px] text-white/45 leading-[1.6] mb-5">
                  Switch from group view to any subsidiary in one click. Every entity carries its own books — and rolls up live to the parent without an export.
                </p>
                <div className="grid grid-cols-4 gap-2.5">
                  {[
                    { abbr: "US", cat: "USD" }, { abbr: "UK", cat: "GBP" }, { abbr: "DE", cat: "EUR" }, { abbr: "FR", cat: "EUR" },
                    { abbr: "AE", cat: "AED" }, { abbr: "SG", cat: "SGD" }, { abbr: "AU", cat: "AUD" }, { abbr: "CA", cat: "CAD" },
                  ].map((c) => (
                    <div key={c.abbr} className="bg-white/[0.04] border border-white/10 rounded-bz-md py-2.5 px-2 text-center">
                      <div className="text-[13px] font-extrabold text-bz-accent tracking-[0.04em]">{c.abbr}</div>
                      <div className="text-[8px] font-semibold tracking-[0.1em] uppercase text-white/35 mt-0.5">{c.cat}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <Card tone="dark" pad="lg" className="lg:col-span-2">
            <IconBadge tone="accent" size="lg" className="mb-5"><Receipt className="size-5" /></IconBadge>
            <h4 className="text-[16px] font-bold text-white mb-2">Local Tax Engines</h4>
            <p className="text-[13px] text-white/50 leading-[1.6]">
              Pre-configured rules for VAT, GST, sales tax, and withholding across 38 countries. E-invoicing, OSS/IOSS, and reverse-charge logic built in.
            </p>
          </Card>

          <Card tone="dark" pad="lg" className="lg:col-span-2 relative border-bz-accent/40">
            <span className="absolute top-4 right-5 text-[9px] font-bold text-bz-accent uppercase tracking-[0.2em] opacity-85">Closing</span>
            <IconBadge tone="accent" size="lg" className="mb-5"><Layers className="size-5" /></IconBadge>
            <h4 className="text-[16px] font-bold text-white mb-2">Live Consolidation</h4>
            <p className="text-[13px] text-white/50 leading-[1.6]">
              Group P&L and balance sheet refresh on demand. FX translation, eliminations, and minority interest run in under 90 seconds.
            </p>
          </Card>

          <Card tone="dark" pad="lg" className="lg:col-span-2 flex flex-col">
            <IconBadge tone="accent" size="lg" className="mb-5"><ShieldCheck className="size-5" /></IconBadge>
            <h4 className="text-[16px] font-bold text-white mb-2">Entity-Aware Roles</h4>
            <p className="text-[13px] text-white/50 leading-[1.6]">
              Permissions scope to any node of the entity tree. Branch managers see their branch, regional VPs see the region, the group CFO sees everything.
            </p>
            <div className="mt-auto pt-4 flex gap-1.5 flex-wrap">
              {["Group", "Region", "Entity", "Branch"].map((b) => (
                <span key={b} className="text-[9px] font-bold px-2 py-1 rounded bg-bz-accent/10 text-bz-accent tracking-[0.06em] uppercase">{b}</span>
              ))}
            </div>
          </Card>
        </div>
      </Container>
    </Section>
  );
}

// ─── INSIGHTS ────────────────────────────────────────────────────────────────
function InsightsSection() {
  const entities = [
    { lbl: "Bizak US Inc.",     v: 88, color: "var(--bz-accent)",                  rev: "$ 18.4M"  },
    { lbl: "Bizak Europe Ltd.", v: 64, color: "rgba(199,255,53,0.65)",             rev: "£ 9.6M"   },
    { lbl: "Bizak GmbH",        v: 52, color: "rgba(199,255,53,0.45)",             rev: "€ 7.8M"   },
    { lbl: "Bizak APAC Pte.",   v: 46, color: "rgba(122,130,109,0.55)",            rev: "S$ 11.2M" },
    { lbl: "Bizak MEA FZ-LLC",  v: 30, color: "rgba(122,130,109,0.4)",             rev: "AED 6.8M" },
  ];
  return (
    <Section tone="white">
      <Container>
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <SectionHeading
              eyebrow="Group Visibility"
              title="The whole group, on one screen — without leaving the ledger."
              description="No exports. No nightly batches. Bizak holds every entity in one tenant, so a group-level dashboard is just another scope on the same data your subsidiaries are posting into right now."
              maxWidth={500}
              className="mb-6"
            />
            <ul className="flex flex-col gap-3">
              {[
                { bold: "Functional + Reporting Currency", rest: " — Each entity transacts in its functional currency; the group sees translated values live, with daily, monthly, or custom rate sets." },
                { bold: "Eliminations on the Fly",         rest: " — Intercompany invoices, loans, and inventory transfers eliminate automatically when you switch to group view." },
                { bold: "Drill from Group to Voucher",     rest: " — Click a group P&L line, drop into the entity, the journal, then the source document — without a different tool." },
              ].map((item) => (
                <li key={item.bold} className="flex gap-3">
                  <CheckCircle className="size-5 text-bz-sage flex-shrink-0 mt-0.5" />
                  <span className="text-[14px] text-bz-text-muted leading-[1.7]">
                    <strong className="text-bz-text">{item.bold}</strong>{item.rest}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <Card pad="lg">
            <div className="flex justify-between items-start mb-5">
              <div>
                <div className="text-[10px] font-bold tracking-[0.12em] uppercase text-bz-sage">Revenue · Group QTD</div>
                <div className="text-[24px] font-extrabold text-bz-text mt-1">$48.2M <span className="text-[12px] text-[#16a34a] font-bold">+12.4%</span></div>
              </div>
              <PillBadge tone="accent" dot>Live</PillBadge>
            </div>
            <div className="flex flex-col gap-3.5 py-5">
              {entities.map((l) => (
                <div key={l.lbl} className="flex items-center gap-2.5">
                  <span className="text-[10px] text-bz-text-muted font-semibold min-w-[100px] sm:min-w-[120px]">{l.lbl}</span>
                  <div className="flex-1 h-4 bg-bz-sage/[0.06] rounded overflow-hidden">
                    <div className="h-full rounded" style={{ width: `${l.v}%`, background: l.color }} />
                  </div>
                  <span className="text-[10px] text-bz-sage font-bold min-w-[56px] text-right tracking-[0.04em]">{l.rev}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-4 border-t border-bz-border flex items-center justify-between">
              <span className="text-[11px] font-bold text-bz-text">IC eliminations · $4.1M</span>
              <span className="text-[10px] text-[#16a34a] font-bold">● auto-matched</span>
            </div>
          </Card>
        </div>
      </Container>
    </Section>
  );
}

// ─── WORKFLOW STRIP ──────────────────────────────────────────────────────────
const STEPS = [
  { Icon: Building2, label: "Define Entity" },
  { Icon: Globe,     label: "Set Currency"  },
  { Icon: Receipt,   label: "Wire Tax"      },
  { Icon: Layers,    label: "Map Books"     },
  { Icon: ShieldCheck, label: "Scope Access" },
  { Icon: LayoutDashboard, label: "Roll Up" },
];

function WorkflowSection() {
  return (
    <Section tone="light">
      <Container>
        <SectionHeading
          eyebrow="From New Entity to Group Close"
          title="Stand up a subsidiary in an afternoon"
          align="center"
          className="mb-14"
        />
        <div className="relative">
          <div className="hidden md:block absolute top-7 left-[8%] right-[8%] h-px bg-bz-border" />
          <div className="hidden md:block absolute top-7 left-[8%] right-[8%] h-px bg-bz-accent/60" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6 relative">
            {STEPS.map(({ Icon: SIcon, label }) => (
              <div key={label} className="flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-full bg-white border border-bz-border flex items-center justify-center mb-3 relative z-10">
                  <SIcon className="size-6 text-bz-sage" />
                </div>
                <span className="text-[13px] font-bold text-bz-text">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}

// ─── CTA ─────────────────────────────────────────────────────────────────────
function CTASection() {
  return (
    <Section tone="dark">
      <Container width="narrow">
        <SectionHeading
          title={<>Run the whole group<br />on one ERP.</>}
          description="Stop stitching subsidiaries together in spreadsheets. Bizak gives every entity its own books — and your group a real-time consolidation, every day of the month."
          tone="light"
          align="center"
          maxWidth={620}
          className="mb-10"
        />
        <div className="flex flex-wrap justify-center gap-3">
          <Button variant="accent" size="lg" href="https://system.bizakerp.com/account/self-register" withArrow>Start Free Trial</Button>
          <Button variant="ghostDark" size="lg" href="/contact">Book a Demo</Button>
        </div>
      </Container>
    </Section>
  );
}

// ─── PAGE ────────────────────────────────────────────────────────────────────
export function MulticompanyAndBranchesPage() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <Header />
      <main>
        <HeroCentered
          tone="dark"
          mesh={false}
          badge={<HeroBadge tone="dark">Multi-company &amp; Branches</HeroBadge>}
          title={<>One ERP. Many entities.<br /><span className="text-bz-sage">Zero spreadsheet rollups.</span></>}
          description="Bizak runs every legal entity, branch, and warehouse on a single instance — with their own currency, chart of accounts, and tax rules — then consolidates the whole group on demand. No exports. No month-end fire drills."
          actions={
            <>
              <Button variant="accent" size="lg" href="/contact" withArrow>Request Demo</Button>
              <Button variant="ghostDark" size="lg" href="#capabilities">See Group Console</Button>
            </>
          }
          visual={
            <>
              <div className="flex flex-wrap justify-center gap-8 md:gap-14 py-6 mb-8 border-y border-white/10">
                {[
                  { value: "120+",  label: "Entities Supported" },
                  { value: "38",    label: "Local Tax Engines"  },
                  { value: "< 90s", label: "Group Close"        },
                ].map((s) => (
                  <Stat key={s.label} value={s.value} label={s.label} tone="light" size="md" align="center" />
                ))}
              </div>
              <GroupConsoleVisual />
            </>
          }
        />
        <ChallengesSection />
        <SolutionSection />
        <CapabilitiesSection />
        <InsightsSection />
        <WorkflowSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
