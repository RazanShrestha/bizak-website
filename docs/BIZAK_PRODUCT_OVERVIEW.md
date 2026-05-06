# Bizak — Product Overview

This document is the **content brief** for any redesign or new page on the
Bizak marketing site. Read it before writing copy, choosing data points,
laying out a section, or deciding what story a page should tell.

The design-system docs (`/CLAUDE.md`, `/docs/DESIGN_SYSTEM.md`) tell you
*how* a page should look. This file tells you *what it should say* — and
why a Bizak page feels like Bizak.

---

## 1. The one-liner

**Bizak ERP** is a unified cloud ERP positioned as **"The Operating System
for Modern Business."** It's the single platform a small-to-mid-market
company runs its finance, sales, inventory, manufacturing, projects and
operations on — replacing the spreadsheets + disconnected SaaS stack most
SMEs accumulate.

- Site: `bizakerp.com`
- Logged-in product: `system.bizakerp.com`
- Self-register: `system.bizakerp.com/account/self-register`

If a page is selling Bizak, it is selling **the operating system**, not a
point-tool. Even module pages (Finance, Inventory, etc.) are pieces of a
unified whole — never frame a module as if it lived alone.

---

## 2. Who buys Bizak

| Segment | What they look like | What they're escaping |
|---|---|---|
| **Startups & SMEs** (≤25 users) | Growing past QuickBooks + Google Sheets + 6 SaaS subs | "Excel hell," missed inventory, manual invoicing |
| **Mid-Market** (25–250 users) | Multi-branch / multi-warehouse, running NetSuite-lookalikes that cost too much | Slow customisation, $$$ implementation, IT bottleneck |
| **Enterprise** (250+) | Multi-entity, multi-currency, global subsidiaries | Disconnected legacy stacks, painful month-end close, audit risk |

Bizak's pitch lands hardest on companies that have **outgrown spreadsheets
but not yet committed to NetSuite/SAP** — the "we need a real system, but
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

Features that span all modules — not "owned" by any one module's page.

| Capability | Page route | What it covers |
|---|---|---|
| **Dashboards & Reporting** | `/DashboardAndReporting` | Cross-module dashboards, custom reports, scheduled exports. |
| **Workflow Automation** | `/workflow` | Approval chains, conditional routing, automated triggers. |
| **Integrations** | `/Integrations` | Banks, payment gateways, ecommerce, shipping, tax engines. |
| **Multi-company & Multi-branch** | `/MulticompanyAndBranches` | Inter-company elimination, consolidated books, branch-level P&L. |
| **Document Management** | `/DocumentManagement` | Attachment library, e-sign, document versioning, retention. |

### 3.3 By-Industry pages

The four industry pages are **not** modules — they're cross-functional
narratives showing how Bizak fits a vertical. Each composes the
`solutions/by-industry/` primitives. The canonical reference is
`ManufacturingPage.tsx`. See `/docs/DESIGN_SYSTEM.md` §3.5.

| Industry | Page route | Pain it speaks to |
|---|---|---|
| **Manufacturing** | `/manufacturing` (note: also the module page — duplicate route, see CLAUDE.md "Routing" notes) | Floor visibility, BOM/routing complexity, OEE, downtime |
| **Distribution & Logistics** | `/distribution` | Warehouse throughput, route planning, multi-channel fulfillment |
| **Professional Services** | `/ProfessionalService` | Project profitability, utilisation, time → invoice cycle |
| **Retail & E-Commerce** | `/Retail` | POS, omnichannel inventory, returns, customer history |

### 3.4 Other marketing pages

`/why-bizak`, `/product`, `/about`, `/contact`, `/careers`,
`/case-studies`, blog, partners. These are *brand* pages — the structure
is freer, but the design tokens and primitive rules still apply.

---

## 4. Product narratives — the themes that anchor every page

Every Bizak page should reinforce some subset of these six themes. They
are the **product story**. If a section's copy doesn't lean on at least
one of them, ask whether it earns its place.

### 4.1 Real-time, not month-end

Old ERPs reconcile, post and report on a monthly cadence. Bizak posts
**every transaction the moment it happens** — sales orders, shipments,
payroll runs, bank fees — so the books are always live.

> *Phrases that land:* "Live", "Streaming", "As of now", "No close-the-books marathon", "Month-end in hours, not weeks."

### 4.2 Single source of truth

One database, every module, no integration tax. The same customer record,
the same item master, the same chart of accounts — referenced by Sales,
Inventory, Finance and Manufacturing simultaneously.

> *Phrases that land:* "One ledger, every module", "Unified", "Connected by design", "No data sync, no API drift."

### 4.3 No manual coding / no manual data entry

Events in any module **auto-post** the right journal entries. A shipment
debits COGS and credits Inventory. An invoice debits AR and credits
Revenue + Tax. Finance teams stop coding transactions; the system does.

> *Phrases that land:* "Auto-posted", "Auto-coded", "0 manual journal entries", "No re-keying."

### 4.4 Full audit trail — every number drillable

Every figure in a report resolves to its source transaction. Click
Net Income → Operating Expenses → Marketing → the originating PO/invoice.
Every state change is logged with user + timestamp.

> *Phrases that land:* "Click any number to see its source", "Full audit trail", "Drill into accounts", "Compliance-ready."

### 4.5 Multi-entity & multi-currency native

Designed from day 1 to consolidate global subsidiaries. Multi-currency
translation, intercompany eliminations, branch-level P&L — without
requiring a separate consolidation tool.

> *Phrases that land:* "Multi-entity ready", "Auto-consolidated", "FX translation applied", "Branch / Entity / Department."

### 4.6 Replaces the spreadsheet stack

The honest comparison frame for an SME prospect isn't NetSuite vs Bizak —
it's **"Excel + QuickBooks + Trello + 4 SaaS subs"** vs Bizak. Lean into
this when copy needs a foil.

> *Phrases that land:* "Beyond Excel", "Replace 6 disconnected tools", "From spreadsheet hell to operating system."

---

## 5. Brand voice & copy patterns

### 5.1 Voice
- **Confident, terse, technical-but-accessible.** Short sentences. Specific numbers. No marketing hedge ("could", "may help to", "potentially").
- **Outcomes over features.** "60% faster month-end" beats "powerful close engine." Numbers are concrete: `87.4% OEE`, `$1.24M cash position`, `247 entries auto-posted today`.
- **No AI-magic clichés.** Bizak does have AI-driven reconciliation/anomaly detection — refer to it concretely (e.g., "AI-driven bank statement matching") — never as a vague "AI-powered platform" wash.
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
- Calling Bizak a "tool" or "app" — it's a *system / platform / operating system*.
- Numbers without context. `99%` of *what*? Always anchor.
- Copy that could equally describe Salesforce, NetSuite, Odoo and HubSpot — if the sentence works for a competitor, rewrite it.

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

Reinforces — not duplicates — `/docs/DESIGN_SYSTEM.md`. The visual cues
that make a page feel "Bizak":

1. **Sage primary + lime accent.** `#7A826D` sage carries the brand. `#C7FF35` lime is the *single* accent colour — used sparingly for "live" pills, the hero badge, key numbers on dark surfaces.
2. **Olive-tinted dark surface (`#1A1D19`).** Bizak's dark sections aren't pure black — they're a deep olive (`bg-bz-deep`). This is *the* brand dark and it's what makes the lime accent pop.
3. **Hero pattern.** Every hero wears `.biz-mesh` (the 3-stop radial mesh) + a `<HeroBadge>` pill (the only allowed gradient).
4. **Live data over static screenshots.** Hero visuals and section mocks show *flowing data* — pulsing dots, streaming journal rows, OEE gauges, "JUST POSTED" pills. This is the visual language of "real-time."
5. **Bento layouts with asymmetric col spans.** 6/6, 7/5, 5/7, 8/4 — never a uniform 4-col grid for the storytelling sections. The asymmetry tells the eye what's primary.
6. **Tabular numbers everywhere.** Money, percentages, counts → `tabular-nums` so the columns line up.
7. **Pills carry meaning.** `<PillBadge tone="accent" dot>LIVE</PillBadge>`, `<PillBadge tone="sage">NEW</PillBadge>`, `<PillBadge tone="neutral">FY2024</PillBadge>` — pills are functional labels, not decoration.

---

## 7. Section conventions for redesigns

Anchors that should be consistent across pages:

### 7.1 The closing CTA section (above the footer)

The bottom-of-page CTA — the "Take full control of your financial operations" /
"Run your factory floor with complete precision." moment — must use
**`<Section tone="dark">`** (the olive-tinted `bg-bz-deep` = `#1A1D19`),
**not** `tone="deeper"` (`bg-bz-deep-2` = `#121212` pure black).

This matches the by-industry pages' `IndustryCta` (`.biz-cta-section`,
which already uses `var(--bz-deep)`). The olive undertone is what lets
the lime accent CTA button "glow" against the surface.

```tsx
<Section tone="dark" pad="default">
  <Container width="narrow">
    <SectionHeading
      title={<>Take full control of<br />your financial operations</>}
      description="..."
      tone="light"
      align="center"
      maxWidth={640}
    />
    <div className="mt-8 flex flex-wrap justify-center gap-3">
      <Button variant="accent" size="lg" href="/contact" withArrow>Request Demo</Button>
      <Button variant="ghostDark" size="lg" href="/contact">Contact Sales</Button>
    </div>
  </Container>
</Section>
```

The CTA isn't always literally the last section — some pages may close
with a comparison table or FAQ — but **whenever a page has a closing
CTA, it lives on `tone="dark"`**, with `<Button variant="accent">` +
`<Button variant="ghostDark">` as the action pair.

### 7.2 Hero

Always `<Section pad="hero" className="biz-mesh">` + `<HeroBadge>` above
the `<h1>`. See `/docs/DESIGN_SYSTEM.md` §3.6.

### 7.3 Section rhythm

Most module pages alternate `tone="light"` (off-white `#F8F9F7`) and
`tone="white"` (`#FFFFFF`) for the body sections, with one or two
`tone="dark"` "showcase" sections for visual variety, then close on the
dark CTA.

A good rhythm for a module page (Financial Management, Sales/CRM, etc.):

1. Hero (`pad="hero"` + `biz-mesh`)
2. Feature grid (`tone="white"`)
3. Technical showcase (`tone="dark"`) — bento of 4 capability cards
4. Reporting / intelligence section (`tone="light"`)
5. Connectivity section (`tone="dark"`) — "this module connects to everything"
6. Impact metrics (`tone="white"`)
7. Closing CTA (`tone="dark"`) ← see §7.1

---

## 8. How to use this doc

When the user says "**redesign X**" or "**design a new page for Y**":

1. **Read this file first** — confirm what Bizak is, which segment of the audience the page targets, and which product narratives (§4) the page should lean on.
2. **Read `/CLAUDE.md`** for design-system rules.
3. **Read `/docs/DESIGN_SYSTEM.md`** for primitive APIs.
4. **Run the page-design checklist** in the redesign-page skill.
5. **For copy**: pull from the narratives in §4 and the voice in §5. Use the canonical stats in §5.4 unless the page genuinely needs a new one.
6. **For section structure**: follow the rhythm in §7.3 unless the user has called for something different.
7. **For the closing CTA**: always `tone="dark"` per §7.1.

When something material changes about the product (a new module ships, a
positioning pivot, new canonical stats), update this file. Treat it as
the single source of truth for *what Bizak is*, the same way `theme.css`
is the single source of truth for *what Bizak looks like*.
