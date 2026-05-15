# Bizak Product Overview

This document is the **content brief** for any redesign or new page on the
Bizak marketing site. Read it before writing copy, choosing data points,
laying out a section, or deciding what story a page should tell.

The design-system docs (`/CLAUDE.md`, `/docs/DESIGN_SYSTEM.md`) tell you
*how* a page should look. This file tells you *what it should say* and
why a Bizak page feels like Bizak.

---

## 1. The one-liner

**Bizak ERP** is a unified cloud ERP positioned as **"The Operating System
for Modern Business."** It's the single platform a small-to-mid-market
company runs its finance, sales, inventory, manufacturing, projects and
operations on replacing the spreadsheets + disconnected SaaS stack most
SMEs accumulate.

- Site: `bizakerp.com`
- Logged-in product: `system.bizakerp.com`
- Self-register: `system.bizakerp.com/account/self-register`

If a page is selling Bizak, it is selling **the operating system**, not a
point-tool. Even module pages (Finance, Inventory, etc.) are pieces of a
unified whole never frame a module as if it lived alone.

---

## 2. Who buys Bizak

| Segment | What they look like | What they're escaping |
|---|---|---|
| **Startups & SMEs** (≤25 users) | Growing past QuickBooks + Google Sheets + 6 SaaS subs | "Excel hell," missed inventory, manual invoicing |
| **Mid-Market** (25–250 users) | Multi-branch / multi-warehouse, running NetSuite-lookalikes that cost too much | Slow customisation, $$$ implementation, IT bottleneck |
| **Enterprise** (250+) | Multi-entity, multi-currency, global subsidiaries | Disconnected legacy stacks, painful month-end close, audit risk |

Bizak's pitch lands hardest on companies that have **outgrown spreadsheets
but not yet committed to NetSuite/SAP** the "we need a real system, but
not *that* much system" sweet spot.

When you write copy, picture a finance director, ops lead, or COO at a
~50-person manufacturing/distribution/services company. They want
real-time visibility, not feature lists.

---

## 3. The product structure

Bizak's site organises the product two ways:

### 3.1 Core Modules ("the platform")

The functional modules. Each gets its own marketing page under
`/<ModuleName>` and lives in the **Product → Core Modules** mega-menu.

| Module | Page route | What it covers |
|---|---|---|
| **Financial Management** | `/FinancialManagement` | General ledger, AR, AP, bank reconciliation, multi-entity consolidation, fixed assets, real-time financial statements (P&L / Balance Sheet / Cash Flow), audit trail, multi-currency. |
| **Sales & CRM** | `/SalesCrm` | Quotes, sales orders, invoicing, customer master, pipeline tracking. |
| **Purchasing** | `/purchasing` | Vendor management, POs, 3-way matching, procurement workflows, vendor portal. |
| **Inventory & Warehouse** | `/InventoryAndWarehouse` | Real-time stock, multi-location warehouse, barcoding, lot/serial tracking, cycle count, transfers. |
| **Manufacturing** | `/manufacturing` (also a By-Industry page; see §3.3) | Production planning, BOM, routing, work orders, MRP, OEE, costing. |
| **Projects & Job Costing** | `/ProjectAndCosting` | Project P&L, time tracking, resource planning, milestones, billing rates. |
| **Sales Force Management** | `/SalesForceManagement` | Field sales productivity, beat/route plans, target tracking. |

### 3.2 Platform Capabilities (cross-cutting)

Features that span all modules not "owned" by any one module's page.

| Capability | Page route | What it covers |
|---|---|---|
| **Dashboards & Reporting** | `/DashboardAndReporting` | Cross-module dashboards, custom reports, scheduled exports. |
| **Workflow Automation** | `/workflow` | Approval chains, conditional routing, automated triggers. |
| **Integrations** | `/Integrations` | Banks, payment gateways, ecommerce, shipping, tax engines. |
| **Multi-company & Multi-branch** | `/MulticompanyAndBranches` | Inter-company elimination, consolidated books, branch-level P&L. |
| **Document Management** | `/DocumentManagement` | Attachment library, e-sign, document versioning, retention. |

### 3.3 By-Industry pages

The four industry pages are **not** modules they're cross-functional
narratives showing how Bizak fits a vertical. Each composes the
`solutions/by-industry/` primitives. The canonical reference is
`ManufacturingPage.tsx`. See `/docs/DESIGN_SYSTEM.md` §3.5.

| Industry | Page route | Pain it speaks to |
|---|---|---|
| **Manufacturing** | `/manufacturing` (note: also the module page duplicate route, see CLAUDE.md "Routing" notes) | Floor visibility, BOM/routing complexity, OEE, downtime |
| **Distribution & Logistics** | `/distribution` | Warehouse throughput, route planning, multi-channel fulfillment |
| **Professional Services** | `/ProfessionalService` | Project profitability, utilisation, time → invoice cycle |
| **Retail & E-Commerce** | `/Retail` | POS, omnichannel inventory, returns, customer history |

### 3.4 Other marketing pages

`/why-bizak`, `/product`, `/about`, `/contact`, `/careers`,
`/case-studies`, blog, partners. These are *brand* pages the structure
is freer, but the design tokens and primitive rules still apply.

---

## 4. Product narratives the themes that anchor every page

Every Bizak page should reinforce some subset of these six themes. They
are the **product story**. If a section's copy doesn't lean on at least
one of them, ask whether it earns its place.

### 4.1 Real-time, not month-end

Old ERPs reconcile, post and report on a monthly cadence. Bizak posts
**every transaction the moment it happens** sales orders, shipments,
payroll runs, bank fees so the books are always live.

> *Phrases that land:* "Live", "Streaming", "As of now", "No close-the-books marathon", "Month-end in hours, not weeks."

### 4.2 Single source of truth

One database, every module, no integration tax. The same customer record,
the same item master, the same chart of accounts referenced by Sales,
Inventory, Finance and Manufacturing simultaneously.

> *Phrases that land:* "One ledger, every module", "Unified", "Connected by design", "No data sync, no API drift."

### 4.3 No manual coding / no manual data entry

Events in any module **auto-post** the right journal entries. A shipment
debits COGS and credits Inventory. An invoice debits AR and credits
Revenue + Tax. Finance teams stop coding transactions; the system does.

> *Phrases that land:* "Auto-posted", "Auto-coded", "0 manual journal entries", "No re-keying."

### 4.4 Full audit trail every number drillable

Every figure in a report resolves to its source transaction. Click
Net Income → Operating Expenses → Marketing → the originating PO/invoice.
Every state change is logged with user + timestamp.

> *Phrases that land:* "Click any number to see its source", "Full audit trail", "Drill into accounts", "Compliance-ready."

### 4.5 Multi-entity & multi-currency native

Designed from day 1 to consolidate global subsidiaries. Multi-currency
translation, intercompany eliminations, branch-level P&L without
requiring a separate consolidation tool.

> *Phrases that land:* "Multi-entity ready", "Auto-consolidated", "FX translation applied", "Branch / Entity / Department."

### 4.6 Replaces the spreadsheet stack

The honest comparison frame for an SME prospect isn't NetSuite vs Bizak
it's **"Excel + QuickBooks + Trello + 4 SaaS subs"** vs Bizak. Lean into
this when copy needs a foil.

> *Phrases that land:* "Beyond Excel", "Replace 6 disconnected tools", "From spreadsheet hell to operating system."

---

## 5. Brand voice & copy patterns

### 5.1 Voice
- **Confident, terse, technical-but-accessible.** Short sentences. Specific numbers. No marketing hedge ("could", "may help to", "potentially").
- **Outcomes over features.** "60% faster month-end" beats "powerful close engine." Numbers are concrete: `87.4% OEE`, `$1.24M cash position`, `247 entries auto-posted today`.
- **No AI-magic clichés.** Bizak does have AI-driven reconciliation/anomaly detection refer to it concretely (e.g., "AI-driven bank statement matching") never as a vague "AI-powered platform" wash.
- **Show, don't tell.** A live-streaming journal panel says "real-time" louder than the word "real-time" does. Prefer mockups + data over adjectives.

### 5.2 Headline patterns that work
- **Imperative + outcome:** "Command the floor. Master the output."
- **Click-action framing:** "Click any number, see its source."
- **One verb, two nouns:** "One ledger. Every module."
- **Old-vs-new contrast:** "Still running your business on Excel?"
- **Lead with the finance-team payoff:** "Take full control of your financial operations."

### 5.3 What to avoid
- Generic SaaS adjective stacks ("powerful, intuitive, modern, scalable…").
- Hedge words ("solutions", "leverage", "synergize", "best-in-class").
- Calling Bizak a "tool" or "app" it's a *system / platform / operating system*.
- Numbers without context. `99%` of *what*? Always anchor.
- Copy that could equally describe Salesforce, NetSuite, Odoo and HubSpot if the sentence works for a competitor, rewrite it.

### 5.4 The canonical statistics

These numbers recur across the site. When you need a stat, prefer one of
these (or a near-cousin) over inventing new ones:

| Number | What it claims |
|---|---|
| **50,000+** | Companies powered by Bizak |
| **60%** | Faster month-end close |
| **40%** | Reduction in manual data-entry errors |
| **100%** | Audit compliance (every txn has a digital trail) |
| **87.4%** | Average OEE on the manufacturing page |
| **96.2%** | On-time delivery |
| **99.8%** | Consolidation accuracy |
| **247** | Journal entries auto-posted in a day (live demo) |

---

## 6. Visual signature

Reinforces not duplicates `/docs/DESIGN_SYSTEM.md`. The visual cues
that make a page feel "Bizak":

1. **Paper-cream base + olive dark + lime accent + pistachio secondary.** The new palette: `#FCFCF7` paper as the primary page surface, `#1A2D20` olive for dark sections / hero canvas / dark bento cards, `#d3f969` lime (`--bz-fire`) as the *single* canonical pop colour, `#DBE9B8` pistachio (`--bz-leaf`) as the softer secondary accent. No sage. No gradients.
2. **Alternating section backgrounds.** Consecutive content sections alternate between `--bz-section-a` (`#FCFCF7`) and `--bz-section-b` (`#efefe9`). This rhythm is what unifies the page a single uniform background reads flat; alternating tones give the eye chapter breaks. Dark sections (`bg-bz-olive`) are used sparingly for showcase blocks.
3. **Hero pattern.** Centered copy on a paper surface (`--bz-section-b` for a touch of warmth). `<BadgeGreen>` confetti pill above the `<h1>`. Two `<Pill>` CTAs (`variant="dark" withTick` + `variant="light"`). Optional `<HeroCanvas>` below a dark olive panel with a 1px grid overlay holding 1–3 floating `<HeroCard>`s. No more `.biz-mesh` radial-gradient hero that pattern is retired.
4. **Live data over static screenshots.** Hero visuals and section mocks show *flowing data* pulsing dots, streaming journal rows, OEE gauges, "Live" / "Posted" pills, auto-posting feeds. This is the visual language of "real-time" (narrative §4.1).
5. **Bento layouts.** Asymmetric column spans, never a uniform N-column grid for storytelling sections. The `<BentoGrid cols={N}>` primitive ships responsive defaults; reach for asymmetric spans (`<BigCard>`, mixed tones) for the page's marquee section.
6. **DotGrid for depth on dark.** Dark surfaces (hero canvas, dark bento, FAQ intro panel) get a `<DotGrid>` overlay a 1px subtle grid in `rgba(252,252,247,0.05)`. This is what gives them texture without resorting to gradients or imagery.
7. **Single font, single accent.** Inter for everything (body, headings, IDs, SKUs, code-like identifiers differentiate with letter-spacing or weight, never a font swap). Lime `#d3f969` for the pop colour; pistachio `#DBE9B8` for the soft secondary; everything else is paper / olive / text-muted.
8. **Pills carry meaning.** `<Pill variant="accent">`, `<Pill variant="leaf">`, `<StatusChip variant="live">` pills are functional labels with semantic variants, not decoration.

---

## 7. Section conventions for redesigns

Anchors that should be consistent across pages:

### 7.1 The closing CTA owned by `<Footer cta={…}>`

The bottom-of-page CTA the "Take full control of your financial operations" /
"Run your factory floor with complete precision." moment is **owned by
the Footer**, not by the page. The Footer's top section is a centered
closing-CTA card on a warehouse-photo background tinted with olive. Pages
override its copy via a `cta` prop passed in the route layout.

```tsx
// In src/app/routes.tsx *PageLayout wrapper for each page
<Footer
  cta={{
    title: "Take full control of your financial operations.",
    titleMuted: "Close month-end in hours, not weeks.",
    description: "One ledger, auto-posted journals, real-time P&L and a full audit trail behind every figure.",
    primaryLabel: "Get Started",
    primaryHref: "https://system.bizakerp.com/account/self-register",
    secondaryLabel: "Request Demo",
    secondaryHref: "/contact",
  }}
/>
```

If no `cta` prop is passed, the Footer uses the generic default copy
("Take full control of your operations.…"). Override per-page when the
page sells a specific module the override copy should reinforce the
page's narrative (see §4).

**Use the 4 canonical CTA labels everywhere including the Footer.**
`primaryLabel` + `secondaryLabel` must each be one of: **Get Started**,
**Free Trial** (both → self-register), **Request Demo**, **Talk to Sales**
(both → `/contact`). The standard closing pair is `Get Started` +
`Request Demo`; use `Free Trial` instead of `Get Started` only when the
page leads explicitly with the trial story. Do not invent labels like
"Start free trial", "Talk to finance team", "Talk to practice team",
"Book a demo" see §7.4 for the full label canon and the substitution
table.

**Do not** render a separate dark CTA `<Section>` above the Footer.
That's the legacy pattern (the previous `<Section tone="dark">` closing
CTA). The new convention is one CTA per page, owned by the Footer.

The `FooterCta` interface is exported from `src/app/components/Footer.tsx`.
Reference: `FinancialManagementPageLayout` in `routes.tsx`.

### 7.2 Hero

The hero has a **fixed shell** and a **per-page-invented mock**.

**Fixed shell** (same on every page):
- Centered on `bg-bz-section-b` (paper-cream surface, `<Section tone="b" pad="hero">`).
- `<BadgeGreen>` above `<Heading>`, two `<Pill>` CTAs wrapped in `<PillGroup>`. The canonical CTA pair is **Get Started** (dark, ↗, self-register) + **Request Demo** (light, →, `/contact`) see §7.4 for the full label canon.
- No `.biz-mesh` radial-gradient backdrop (retired).

**Per-page-invented mock** (the visual below the CTAs):
The mock is **never** copied from another page. `<HeroCanvas>` + two
`<HeroCard>`s is *one* possible composition not the canonical one.
Pages should pick a hero mock shape that *visualises that page's
specific narrative*: a Manufacturing hero should make floor-ops feel
tactile; a Distribution hero should make routing feel kinetic; a
Projects hero should make project-P&L feel legible; a Why-Bizak hero
might use no mock at all (just badge + heading + pills).

**Mocks already taken do not re-use:**
- `HomePage.tsx` `<HeroCanvas>` with a 12-col split: live journal stream + cash position + dual-stats panel.
- `FinancialManagement.tsx` two-card editorial split on paper: dark olive panel with reconciliation chip + "Close the period" CTA, paired with a Bizak income-statement card.
- `SalesCrm.tsx` (current will be reinvented on its next redesign) `<HeroCanvas>` + two `<HeroCard>`s in the original HomePage shape. This is the canonical *bad* example of hero-mock cloning.

**Valid alternative shapes** include: a single full-width feature panel
(BoM, stock map, OEE gauge cluster), a 3-card row with distinct shapes,
a vertical streaming feed, a before/after split, a dashboard with
sidebar, a horizontal KPI marquee, a single headline statistic with
live row, a process-flow diagram, a map, a document mock, or no mock
at all. The list is illustrative; invent new shapes when the page's
story calls for them.

See `.claude/skills/redesign-page/SKILL.md` "Hero mock" section for the
full alternatives list and the 4-line design brief the LLM must write
before building a hero mock.

### 7.3 Section rhythm

Body sections alternate between `--bz-section-a` (paper `#FCFCF7`) and
`--bz-section-b` (warm `#efefe9`) this alternation is the new visual
rhythm. Dark sections (`bg-bz-olive`) appear sparingly for showcase
blocks. The closing CTA is in the Footer, not in the page.

#### What's fixed vs what's free

**Fixed across every page (the *design language*):**
- The palette, tokens and Inter type scale from `theme.css`.
- The `bz/` primitive vocabulary `<Section>`, `<Container>`, `<SectionHead>`, `<Pill>`, `<Heading>`, `<Bento>`, etc.
- Alternating `tone="a"` / `tone="b"` between consecutive content sections; dark sections sparing.
- Hero shell: `<Section tone="b" pad="hero">` + centered `<BadgeGreen>` + `<Heading>` + two `<Pill>` CTAs. The hero *visual below the copy* is page-specific and should be reinvented per page (see §7.2).
- The closing CTA is owned by `<Footer cta={…}>` never a `<Section tone="dark">` in the page.
- Clean, minimalistic, no gradients, single accent (`--bz-fire`) per surface.

**Free per page (the *design choices*):**
- Which sections the page has, in what order, with what content.
- Whether a section is a `<BentoGrid>`, a `<BigCard>`, a `<StepCard>` row, a custom dashboard mock, a streaming-data panel, or something invented for that page's story.
- Which canonical narratives (§4) and stats (§5.4) the page leans on.
- The page-specific mock inside `<HeroCanvas>` and inside marquee/showcase sections these should feel *invented for this page*, not copied from another.

#### A known-good template (not a requirement)

The rhythm below is what HomePage uses. It is **one valid composition**,
not a spec. Reach for it when nothing about the page suggests a better
structure; depart from it the moment the page's story would be told
better another way.

1. Hero (`tone="b"`) paper-warm bg, page-specific mock below copy.
2. How-it-works (`tone="a"`) 3 `<StepCard>`s.
3. Platform / showcase (`tone="b"`) a marquee mock + summary bentos.
4. Exclusive / capabilities (`tone="a"`) `<BentoGrid>` + a `<BigCard>` marquee feature.
5. Testimonials (`tone="b"`) `<Carousel>` + stat tiles.
6. FAQ (`tone="a"`) `<Accordion>`.
7. (Footer renders the closing CTA via its `cta` prop no page-level CTA section.)

A page may use 4 sections instead of 6, or 8 instead of 6, or invent a
section type that doesn't exist on HomePage as long as the design
language above stays constant and the result is clean, minimal, and
unmistakably Bizak. **If two redesigned pages feel like the same page
with different copy, the structure is too rigid vary it.**

#### Concrete anti-pattern (the failure to avoid)

`/FinancialManagement` and `/SalesCrm` were both migrated to the new
design language. They ended up with **the same six section function
names in the same order** `HeroSection`, `FoundationsSection`,
`TechnicalShowcaseSection`, `ReportingSection`, `ConnectivitySection`,
`MetricsSection` with content swapped (multi-entity →
pipeline-intelligence, financial-control → smart-followups,
audit-integration → customer-insights, etc.). Two different products,
one identical page shape. **This is the canonical failure mode** the
LLM looked at the most-recent migration and cloned its structure
instead of designing for the new page's story.

To avoid it:

- **Each section is designed individually for THIS page.** "Sales & CRM
  needs a pipeline visualisation" is a section. "Sales & CRM needs the
  same section that Financial Management has at position 2" is not.
- **Do not look at the most-recent migration as a structural reference.**
  Look at it only to understand how primitives compose at the JSX level.
- **Section function names should describe THIS page's content**, not
  generic positions. `PipelineOverviewSection` ✓ ·
  `FoundationsSection` ✗ (the second name is so generic it could apply
  to any page which is why it gets cloned across pages).
- **If you find yourself writing the same hero mock, the same dense
  4-bento "TechnicalShowcase", the same dense "Reporting" tabular
  panel, the same hub-and-spoke "Connectivity" diagram, the same
  3-metric closing summary that another page already has** the page
  hasn't earned its sections. Stop and ask: what does THIS page need
  to show that no other Bizak page needs to show? Build that instead.

### 7.4 CTA copy the 4 canonical labels

Every conversion CTA on every page uses one of exactly **four labels**.
This is brand voice, not just engineering convention: the site funnels
every visitor through the same four doors, so the labels are part of how
Bizak sounds.

| Label | Destination | When to use |
|---|---|---|
| **Get Started** | `system.bizakerp.com/account/self-register` | Default primary CTA on every page. Implies "click → make an account → use the product." |
| **Free Trial** | same self-register URL | Use instead of *Get Started* only when the page leads explicitly with the trial-first story (e.g. Distribution's per-SKU margin page). Same destination, different framing. |
| **Request Demo** | `/contact` | Default secondary CTA on every page. Implies "click → talk to a human → see the product live." |
| **Talk to Sales** | `/contact` | Lower-funnel direct contact used when the section is about complex multi-entity / multi-warehouse / multi-line problems where "demo" understates what the prospect needs (e.g. on dark closing-CTA cards, or on enterprise-flavoured BigCard CTAs). |

**Standard hero pair**: *Get Started* + *Request Demo*.
**Standard closing pair (in `<Footer cta={…}>`)**: *Get Started* + *Request Demo* (or *Free Trial* + *Request Demo*).
**Standard dark-surface pair**: same labels, different variant primary lime `accent`, secondary outlined `ghostDark`.

**Navigational pills are NOT conversion CTAs** and may keep descriptive labels e.g. `<Pill href="#open-roles" withArrow>View Open Roles</Pill>` on the Careers hero scrolls within the page, doesn't try to convert. The 4-label rule applies only to pills whose href is `system.bizakerp.com/*` or `/contact`.

**Label substitution table** (apply on sight whenever you migrate a page):

| Old label | New label |
|---|---|
| "Book a Demo" / "Book a demo" / "Request a Demo" / "Request demo" | "Request Demo" |
| "Start free trial" / "Start Free Trial" | "Free Trial" |
| "See it live" | "Get Started" (if href = self-register) / "Request Demo" (if href = `/contact`) |
| "See it in action" | "Request Demo" (force href to `/contact`) |
| "Talk to practice team" / "Talk to support" / "Talk to operations" / "Talk to ops" / "Talk to an integration engineer" / "Talk to sales team" / "Talk to finance team" | "Talk to Sales" |
| "Browse connectors" / "Visit help center" / "View features" / "Explore purchasing" | "Request Demo" (force `/contact`) or "Get Started" if the page is clearly self-serve |

Engineering rules for the `<Pill>` / `<PillGroup>` primitives that paint
these labels live in `/CLAUDE.md` §"CTA conventions" and
`/docs/DESIGN_SYSTEM.md` §3.1.1.

---

## 8. How to use this doc

When the user says "**redesign X**" or "**design a new page for Y**":

1. **Read this file first** confirm what Bizak is, which segment of the audience the page targets, and which product narratives (§4) the page should lean on.
2. **Read `/CLAUDE.md`** for design-system rules.
3. **Read `/docs/DESIGN_SYSTEM.md`** for primitive APIs.
4. **Run the page-design checklist** in the redesign-page skill.
5. **For copy**: pull from the narratives in §4 and the voice in §5. Use the canonical stats in §5.4 unless the page genuinely needs a new one.
6. **For section structure**: lock the design language from §7.3 ("what's fixed") palette, tokens, primitives, alternating `tone="a"`/`tone="b"`, hero shell, closing-CTA-via-Footer. **Then invent the actual sections** for this page's story don't copy HomePage's section list section-by-section. The §7.3 template is a fallback when nothing else is called for.
7. **For the closing CTA**: pass it via `<Footer cta={…}>` in the route layout never as a `<Section tone="dark">` block in the page. See §7.1.
8. **Confirm the page composes primitives**, not bespoke inline JSX. If a primitive is missing, build it first (see DESIGN_SYSTEM §6).

When something material changes about the product (a new module ships, a
positioning pivot, new canonical stats), update this file. Treat it as
the single source of truth for *what Bizak is*, the same way `theme.css`
is the single source of truth for *what Bizak looks like*.
