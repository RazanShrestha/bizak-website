---
name: redesign-page
description: Migrate a legacy Bizak marketing page to the new design system (paper/olive/lime/pistachio palette + Phase 1 primitives). Use when the user says "redesign <PageName>", "migrate <PageName>", "update <PageName> to the new pattern", or after touching any page that still uses inline styles, per-file `const C = {...}` colour objects, or the legacy `marketing/` `HeroCentered`/`HeroSplit`/`HeroPanel` heroes.
---

# Skill: redesign-page

This skill is the canonical workflow for converting a marketing page to
the project's current design system. Three reference docs anchor the
work — load them before you start (or recall them if already loaded this
session):

| Doc | Why you need it |
|---|---|
| **`docs/BIZAK_PRODUCT_OVERVIEW.md`** | **What Bizak is** — modules, audience, product narratives, brand voice, canonical statistics, section conventions. Read first so copy + structure reinforce the rest of the site. |
| **`/CLAUDE.md`** | Hard rules + page-design checklist + the migration plan (always loaded). |
| **`/docs/DESIGN_SYSTEM.md`** | Long-form design reference — tokens, primitive APIs, hero pattern, closing-CTA-via-Footer convention. |

## Status — Phase 3 is active

Phase 0 (foundation), Phase 1 (28 primitives), and Phase 2 (HomePage
refactor onto primitives) are **done**. **Phase 3 is the per-page
migration loop** — one PR per page, applying the same *design language*
as `HomePage.tsx` while inventing each page's *section structure* fresh.

- **Reference page (one valid composition, not a template)**: `src/app/components/HomePage.tsx`. Read it to see how primitives fit together — then design *this* page's sections for *this* page's story. Don't replicate HomePage's section list section-by-section.
- **Primitive library**: 28 primitives in `src/app/components/bz/`. Barrel: `bz/index.ts`. Catalogue: `bz/README.md`.
- **Never import from `marketing/` in new code** — that folder is legacy and slated for deletion in Phase 4.

If you're asked to redesign a page, you can proceed — every primitive
you'll need already exists. If you encounter a shape that ISN'T covered
by an existing primitive, **add it to `bz/` first** (with paint in
`style.css`, React wrapper in `bz/`, export in `bz/index.ts`), then use
it on the page.

### What's fixed vs what's free

**Fixed across every page** (the design language — non-negotiable):
- Palette, tokens, Inter type scale from `theme.css`.
- `bz/` primitive vocabulary; composition over forks.
- Alternating `tone="a"`/`tone="b"`; dark sections sparing.
- Hero shell — `<Section tone="b" pad="hero">` + centered `<BadgeGreen>` + `<Heading>` + two `<Pill>` CTAs + **`<HeroCanvas>` below (required)**. `<HeroCanvas>` is a dark olive surface — content inside it must be light-toned (see "Hero mock" section below).
- Closing CTA via `<Footer cta={…}>` — never a page-level dark section.
- Clean, minimalistic, no gradients, single lime accent per surface.

**Free per page** (the design choices — invent these):
- Which sections, in what order, with what content.
- What each section *is* (bento grid, step row, custom dashboard, streaming-data panel, something invented for this page).
- The page-specific mock inside `<HeroCanvas>` and inside marquee/showcase blocks — should feel invented for this page, not copied from HomePage.
- Which canonical narratives (`docs/BIZAK_PRODUCT_OVERVIEW.md` §4) and stats (§5.4) the page leans on.

If two redesigned pages feel like the same page with different copy,
the structure was too rigid. **Clean and minimalistic comes first;
creative reinvention within the locked design language comes second;
copying HomePage's exact section list is never required.**

## Conventions learned from the HomePage refactor (read before editing)

These rules came out of Phase 2 and are now load-bearing across every page:

1. **`tone` means SURFACE, not text colour.** `tone="dark"` = "I sit on a dark surface" → renders paper text. `tone="light"` (default) = "I sit on a light surface" → renders dark text. Applies to `Section`, `Heading`, `Eyebrow`, `SectionHead`, `DataRow`, `EntityRow`, `JournalRow`, `MiniBars`, `ModuleListItem`, `StatTile`, `StripeBar`, `Marquee`. The legacy `marketing/` convention was the opposite — ignore that.

2. **Hero spacing uses inline `style`, not Tailwind margin utilities.** This is the *only* place inline `style` for static spacing is sanctioned. The canonical hero rhythm:

   ```tsx
   <BadgeGreen style={{ marginBottom: 28 }}>...</BadgeGreen>
   <Heading level={2} style={{ marginBottom: 36 }}>...</Heading>
   <div className="flex flex-wrap justify-center gap-[10px]">{pills}</div>
   ```

   Why: `.bz-h1`/`.bz-h2` paint classes set `margin: 0` and their cascade priority can defeat Tailwind `mb-*` utilities in subtle ways (twMerge, layer ordering). Inline `style` always wins. Don't try to "fix" this back to Tailwind utilities — it has been tried and the rhythm broke.

3. **`Section pad="hero"`** = flat `pt-[56px] pb-[96px]` on all viewport sizes. This matches the staged spec exactly. Don't add responsive variation.

4. **Page-specific domain visuals (dashboards, mock invoices, multi-entity panels) stay as in-page sub-components**, but compose `bz/` micro-viz primitives (`DataRow`, `EntityRow`, `JournalRow`, `MiniBars`, `ModuleListItem`, `StatTile`) instead of duplicating JSX. See `HomePage.tsx`'s `PlatformDashboard`, `StepVisualConnect`, `StepVisualScale`, `MultiEntityVisual` for the pattern.

5. **Page-internal styles never use `<style>{@media ...}</style>` blocks.** If a section needs responsive logic, the primitive that owns the layout owns the breakpoint. If you reach for a `<style>` block in a page, the primitive is missing a breakpoint — extend it.

6. **`<HeroCanvas>` gap pattern — consistent on all four sides.** The default `.bz-hero-canvas` CSS has `padding: 56px 24px 0` (no bottom). Do NOT patch this with `!pb-[56px]` on the canvas alone — the canvas has `min-height: 460px`, so when the component is shorter than that the bottom gap grows unpredictably (component floats at top, min-height pushes the canvas down).

   **The correct pattern** (used by `ManufacturingPage.tsx` and `InventoryAndWarehouse.tsx`):

   ```tsx
   <HeroCanvas className="flex flex-col !p-0 [&>.bz-hero-cards]:flex-1 [&>.bz-hero-cards]:flex [&>.bz-hero-cards]:flex-col [&>.bz-hero-cards]:items-stretch">
     <div className="flex flex-1 flex-col p-[56px] max-[720px]:p-9 max-[480px]:p-4">
       <YourPanel />  {/* must be `flex flex-1 flex-col` so it fills the wrapper */}
     </div>
   </HeroCanvas>
   ```

   - `!p-0` removes the default canvas padding (`!important` to beat the unlayered CSS rule).
   - `flex flex-col [&>.bz-hero-cards]:flex-1 flex flex-col items-stretch` makes the inner `bz-hero-cards` slot fill the canvas and stretch its child.
   - The inner wrapper provides equal, responsive padding on all four sides — `56px` desktop / `36px` (`p-9`) tablet / `16px` (`p-4`) mobile.
   - The component must carry `flex flex-1 flex-col` (not just `flex flex-col`) so it stretches to fill the wrapper. That's what makes the **bottom** gap match the top.

   Do not add `mx-auto mb-6 lg:max-w-[Npx]` to the inner component to compensate for the bottom gap — the gap belongs to the wrapper, not the component.

## Product brief first

The very first step of any redesign is **"what is this page selling, and to whom?"** — answered from `BIZAK_PRODUCT_OVERVIEW.md`:

1. Which module / industry / capability does this page cover? (See §3.)
2. Which 2–3 product narratives (§4) should the page lean on?
3. Which canonical statistics (§5.4) should it reuse?
4. What's the section rhythm appropriate for this kind of page (§7.3)?
5. What closing-CTA copy goes into `<Footer cta={…}>` for this page (§7.1)?

If you're about to write copy that could equally describe Salesforce,
NetSuite or HubSpot, you skipped this step.

## Page-design checklist (run BEFORE editing anything)

Walk through every item; whatever is "no" becomes part of this redesign.

1. **Scope.** Open `src/app/components/Header.tsx` and find this page inside the `megaMenus` object. Which top-level group + sub-heading?
2. **Primitives available?** The new primitive library lives in **`src/app/components/bz/`**. Confirm `<Pill>` / `<Bento>` / `<SectionHead>` / `<Section>` / `<Container>` / `<Heading>` etc. exist there. If any are missing, Phase 1 isn't complete — flag and stop (build the primitive in `bz/` FIRST). **Never import primitives from `marketing/` in new code** — that folder is legacy and slated for deletion in Phase 4.
3. **Primitive composition.** Is the page composing the new primitives, or duplicating their JSX inline? Inline duplication = migration work.
4. **Tokens.** No per-file `const C = {...}`. No hex literals (except dynamic style props). All colours via `var(--bz-fire)` / `var(--bz-paper)` / etc. or Tailwind utilities (`text-bz-fire`, `bg-bz-paper`).
5. **Icons.** No per-file SVG dictionary. Use `lucide-react` directly for new code.
6. **Fonts.** Inter only — end-to-end. References to `'Hedvig …'`, `'Manrope'`, `'Poppins'`, `font-mono`, `font-family: monospace` are bugs. Strip in the same change.
7. **No `<style>{`@media …`}</style>` blocks inside pages.** Responsive logic lives in the primitive. If you find one, the primitive's API is missing a breakpoint — extract it.
8. **className over inline `style`.** Static values in className. Inline `style` only for truly dynamic values. No `onMouseEnter`/`onMouseLeave` style mutations — use `hover:` utilities or `:hover` on the primitive's CSS class.
9. **Closing-CTA pattern.** Page does NOT render its own closing CTA section. CTA goes in `<Footer cta={…}>` in `routes.tsx`. See `FinancialManagementPageLayout` for the reference.
10. **Header offset shim.** Grep `paddingTop: 76|pt-\[76|mt-\[76` inside the page file AND its `*PageLayout` in `routes.tsx`. Both must be zero. The header is no longer fixed.
11. **`bz-page` wrapper.** The page's `*PageLayout` outer `<div>` MUST have `className="bz-page"` (matches `HomeLayout`). That class carries `overflow-x: clip` + `text-wrap: balance` — the project's canonical mobile-overflow guard. Missing it produces a few-px horizontal scroll on 375px viewports even when every section looks correct in isolation. Grep `routes.tsx` for the `*PageLayout`: if the outer `<div>` lacks `bz-page`, add it.
12. **Section alternation.** Consecutive content sections alternate `tone="a"` / `tone="b"`. Dark sections sparing and intentional.
13. **Mobile responsiveness.** Every grid, flex row, fixed width, hero visual works at 375px without horizontal scroll. See the mobile cheatsheet below.

If any item fails, the redesign is the work to bring it into compliance.

## When to invoke

- User explicitly asks: "redesign the X page", "migrate X to the new pattern".
- You are about to edit a page file that still has any of these signals:
  - `const C = { ... }` colour object at the top
  - inline `style={{ ... }}` for static values (colours, padding, fonts, grids)
  - `onMouseEnter` / `onMouseLeave` mutating `e.currentTarget.style`
  - `'Manrope'` / `'Poppins'` / `'Hedvig …'` / any non-Inter font
  - `font-mono` / `font-family: monospace`
  - `linear-gradient(...)` / `radial-gradient(...)` — no exceptions, the `.biz-mesh` carve-out has been retired
  - a per-file `function Icon({ name }) { … }` SVG dictionary
  - `<span className="material-symbols-outlined">`
  - a local `function FooButton(...)` / `function FooCard(...)` / `function FooBadge(...)` mirroring a primitive's shape
  - `paddingTop: 76` / `pt-[76px]` / `mt-[76px]` anywhere — the header is no longer fixed
  - a `<Section tone="dark">` block above `<Footer>` posing as a closing CTA — moved into Footer
  - `<HeroCentered>`, `<HeroSplit>`, or `<HeroPanel>` imported from `../marketing` — those are pre-rebrand legacy primitives; new pages use `<Section tone="b">` + `<BadgeGreen>` + `<HeroCanvas>` from `../bz` instead
  - any other import from `../marketing/*` or `../marketing` in a page file — new pages must import from `../bz`
  - `.biz-mesh` or `<HeroBadge>` (legacy) — replaced by `<BadgeGreen>` on a flat surface
  - any reference to `--bz-sage*` tokens (deprecated) — use `--bz-fire` / `--bz-paper` / etc.

## The migration

### ⛔ The cloning trap — read this before anything else

The single most common failure mode of this skill is **copying the
section structure of the most-recently-redesigned page into the new
page**. Concrete example from this codebase:

> `src/app/components/FinancialManagement.tsx` and
> `src/app/components/SalesCrm.tsx` ended up with **the same six
> section function names in the same order** — `HeroSection`,
> `FoundationsSection`, `TechnicalShowcaseSection`, `ReportingSection`,
> `ConnectivitySection`, `MetricsSection` — with content swapped
> (multi-entity → pipeline-intelligence, financial-control →
> smart-followups, etc.). Two different products, one identical page.
> **This is the failure we are fixing.**

Hard rules to avoid this:

1. **Do not read another page file (`HomePage.tsx`, `FinancialManagement.tsx`, `SalesCrm.tsx`, etc.) as a *structural* reference.** Read them only to see *how primitives compose at the JSX level* — never to decide what sections this page should have. The moment you find yourself thinking "I'll do a `FoundationsSection` like FM has", stop.
2. **Forbidden: identical section function names across pages.** If you're about to write `function FoundationsSection()` because FM has one, rename it to something that describes *this page's* job (e.g. `PipelineOverviewSection`, `QuotingFlowSection`) AND redesign what's inside. Same name + different content = still a clone.
3. **Forbidden: identical hero mocks across pages — see the dedicated "Hero mock" section below.** This is the second-most-common failure (after the section-list clone) and gets its own callout because the `<HeroCard>` primitive's prop shape is a magnet for label-swap cloning.
4. **Forbidden: cloning the dense 4-bento "TechnicalShowcase" + dense "Reporting" + "Connectivity hub" + "Metrics" arc.** That's FM's arc. If it shows up in another page, the redesign hasn't earned its sections.
5. **Read the existing page first** (Step 1). The legacy content tells you what this page is actually selling. The redesign's section list should be driven by *that*, not by what FM happens to do.

### ⛔ Hero mock — the most-copied component on the site

The hero *shell* (`<Section tone="b" pad="hero">` + centered
`<BadgeGreen>` + `<Heading>` + two `<Pill>` CTAs) is **fixed**.

The hero *mock* — the visual below the CTAs, **always inside
`<HeroCanvas>`** — is **per-page-invented**. The LLM keeps cloning it.
Concrete evidence:

> `src/app/components/SalesCrm.tsx`'s hero is a literal label-swap of
> the *original* HomePage hero: `<HeroCanvas>` wrapping **two
> `<HeroCard>`s** sharing identical prop shapes (`icon` + `title` +
> `badge` + `badgeVariant` + `eyebrow` + `value` + a `<DataRow>` +
> `<MiniBars>` footer). The only differences are the strings —
> "Live ledger" → "Live pipeline", "Invoice INV-2046" → "Sales Order
> SO-1041". Two different products, one identical hero card pair.
> This is the *next* clone failure to fix.

**`<HeroCanvas>` is required on every page.** It is a dark olive surface
(`bg-bz-olive` + `<DotGrid>` overlay). The contract for anything placed
inside it:

- **Backgrounds must be light.** Use `bg-bz-paper`, `bg-bz-paper-warm`,
  `bg-bz-surface`, or `bg-white/[alpha]`. Never dark fills
  (`bg-bz-olive*`, `bg-bz-deep`) inside the canvas — the canvas is
  already dark.
- **Text must be dark.** Use `text-bz-text`, `text-bz-text-muted`,
  `text-bz-text-soft`. Do not flip to `text-bz-text-on-dark` inside a
  light card sitting on the dark canvas.
- **Design it from scratch for this page.** Do not copy the shape from
  another page and swap the strings. `src/app/components/FinancialManagement.tsx`
  and `src/app/components/SalesCrm.tsx` are reference points for the
  *level of page-specific invention* required — look at what story their
  mock tells and how it is unique to that module, then apply that same
  discipline to the page you are designing.
- **Mobile: prefer reflowing grids over horizontal scroll.** Use
  `grid-cols-1 sm:grid-cols-2` (or `sm:grid-cols-3`) so panels stack
  vertically on mobile. Reserve `overflow-x-auto` + `min-w-[Npx]` only
  for artefacts where column identity is essential and cannot be preserved
  by stacking — e.g. a kanban board, a Gantt chart, a wide ledger table.
  Most hero mocks (two-panel cards, flow grids, stat rows) should reflow
  naturally without any horizontal scroll.

**Mocks already in use — taken, do not re-use:**

| Page | Hero mock |
|---|---|
| `HomePage.tsx` | `<HeroCanvas>`: 12-col split — live auto-posting journal stream (col-7) + stacked cash-position + dual-stats panel (col-5). Light paper cards on dark canvas. |
| `FinancialManagement.tsx` | `<HeroCanvas>`: two-card editorial split — dark olive rounded panel (reconciliation chip + CTA) beside a light income-statement card. |
| `SalesCrm.tsx` | `<HeroCanvas>` + two `<HeroCard>`s (label-swapped HomePage pattern — **must be replaced** on next touch). |
| `PurchasingPage.tsx` | `<HeroCanvas>`: single 660px light-paper pipeline board — 4-column kanban (RFQ → PO Issued → In Transit → 3-Way Match), minimal `bg-bz-paper-warm` item cards (ref + amount only), footer totals row. Scrolls horizontally on mobile. |
| `InventoryAndWarehouse.tsx` | `<HeroCanvas>`: single full-width light card — KPI header bar (on-hand units, sites, SKUs moving) + 2-panel body (`grid-cols-1 sm:grid-cols-2`, divided by `divide-bz-line-soft`): zone utilisation with `<StripeBar>` rows (left) + live movement feed with txn/journal rows (right). Stacks on mobile — no horizontal scroll. |

If you would write a hero mock that fits one of those rows above,
**stop**. Pick a different composition.

**Valid hero mock shapes** (pick one, or invent your own — the list is
illustrative, not exhaustive). All are placed inside `<HeroCanvas>`
with light backgrounds:

- A **single full-width feature panel** — one wide light-paper mock that owns the canvas, e.g. a Gantt chart, a multi-warehouse stock map, a manufacturing OEE gauge cluster.
- A **2–3 card horizontal row** with distinct shapes (not uniform `<HeroCard>`s) — e.g. a wide table card + a small stat tile, or a document card + a status feed.
- A **vertical timeline / streaming feed** — e.g. a "today's activity" timeline for an ops page.
- A **before/after split** — left half shows pain (spreadsheet chaos), right half shows Bizak's unified view. Strong for §4.6 narrative.
- A **dashboard sidebar + main panel** mock — shows product breadth.
- A **horizontal marquee of KPI tiles** flowing across the canvas — when the page sells "many things in one place."
- A **headline statistic** — one large number with a live-data row beneath it (good for pages with one canonical stat like 87.4% OEE).
- A **process-flow diagram** — light boxes + connectors for the page's workflow (`/Integrations`, `/MulticompanyAndBranches`).
- A **document mock** — a styled invoice, BoM, quote, work-order, lease — when the page sells a specific artefact.

**Rules for picking:**

1. **The mock must visualise THIS page's core narrative.** A Manufacturing page's hero should make floor-ops feel tactile. A Distribution page's hero should make routing/throughput feel kinetic. A Projects page's hero should make project-P&L feel legible. If the mock could equally appear on any other module page, it's wrong.
2. **The `<HeroCard>` primitive is one option, not the default.** Reach for it only when its specific shape (small floating card with icon-title-badge-eyebrow-value-footer) is the BEST fit for this page's story. If you're using it because HomePage used it, that's the trap — use a different shape.
3. **`<HeroCanvas>` is required.** Every page uses it. The dark canvas is the constant; the light mock inside is the variable.
4. **Card count is not magical.** 2 cards is not the canon. The mock might be 1 panel, or 3, or 5, or a single composite. Let the story decide.
5. **The hero mock must fill the full `<Container>` width.** Do NOT put `max-w-xl`, `max-w-2xl`, `max-w-3xl`, or any `mx-auto max-w-*` on the mock's outer wrapper `<div>`. The mock takes the default block width of its container. Constraining it makes the hero feel cramped and wastes the canvas. Only internal sub-elements (e.g. individual columns) may have explicit widths.

### ⛔ Hero mock data density — the crowded trap

A well-structured mock (single card, KPI header + 2-panel body) can still
feel bulky if each panel has too many items or each item has too many
elements.

**Density rules — enforce these before writing a single row:**

1. **3 rows max per panel.** More than 3 rows in a feed or list reads as a
   data dump, not a live mock.
2. **Each row: 2–3 elements only.** e.g. `ref · description · time`.
   A sub-line under every row (a journal entry, a utilisation label, a
   units count) doubles the visual weight. Drop sub-lines from the hero
   if that detail already lives in a section below (FlowSection,
   OneLedger, etc.).
3. **Header: 1 stat, not 3.** `StatusChip` + one key number is a clear
   takeaway. Three numbers in the header row is a dashboard, not a hero.
4. **No label under every bar.** A `<StripeBar>` is already the visual —
   a `% utilised` text label below each bar doubles the row height for no
   gain.
5. **More padding over more items.** `p-6` / `gap-4` / `mb-5` — breathing
   room is not wasted space. A mock that looks sparse in isolation reads
   right in context; a mock that looks crowded always looks crowded.

**The calibration test:** if removing one element per row (or one row per
panel) makes the mock feel *cleaner without losing meaning*, remove it.

Hero mocks belong in the Step 2 design brief (next) — write the mock's
shape and *why it serves this page specifically* before opening any
primitive file.

### Step 1 — Read the page AND understand what it sells

Read the entire legacy file end-to-end. Note sections, content data,
icons, bespoke visuals.

Then, before touching primitives, answer (out loud, in your reply):

- **What is this page selling, in one sentence?** (Pull from `docs/BIZAK_PRODUCT_OVERVIEW.md` §3 — module / capability / industry.)
- **Which 2–3 narratives from §4 does it lean hardest on?** (e.g. `/SalesCrm` leans on §4.2 single-source-of-truth and §4.6 spreadsheet-replacement; `/InventoryAndWarehouse` leans on §4.1 real-time; `/manufacturing` leans on operational-control / OEE.)
- **What's the user emotional payoff?** (For FM it's "close in hours, not weeks." For SalesCrm it would be "every deal in one place, every follow-up automatic." For Manufacturing it's "command the floor.")
- **What does THIS page need to show that no other Bizak page needs to show?** This is the section that should make the page feel unmistakably *this* page.

### Step 2 — Section design brief (write this BEFORE picking primitives)

For *each* section you plan to include, fill in this three-line brief
out loud in your reply:

- **Section purpose** — one sentence: what story does it tell on *this* page?
- **Why this design** — one sentence: what visual / layout / data-mock makes that story land? (Bento grid? A custom dashboard mock? A live streaming feed? A side-by-side compare? A timeline?)
- **Why this is NOT a copy of another page's section** — one sentence: how does this section differ from the same-position section on HomePage, FinancialManagement, SalesCrm, etc.?

If the third line is hard to write, you're cloning. Stop and invent
something else.

#### The hero section gets an extra line

Because the hero mock is the most-cloned component on the site, the
hero's brief is **four** lines, not three:

- **Section purpose** — what does the hero need to communicate in 3 seconds?
- **Hero mock shape** — describe the visual composition you're planning *before* picking primitives. Example shapes: "a single 600px-wide BoM document mock", "a 3-stop horizontal timeline", "a Gantt chart filling the canvas", "a before/after split (spreadsheet vs. Bizak view)", "a multi-warehouse stock map." Reach for one of the alternatives listed in the "Hero mock" section above, OR invent a new shape that fits this page's story.
- **Why this serves THIS page** — one sentence: what about this page's narrative makes this mock the right choice (and not, say, a `<HeroCanvas>` with two `<HeroCard>`s)?
- **Why this is NOT a copy** — one sentence: how does it differ from HomePage's live ledger stream + cash position, FinancialManagement's olive panel + invoice card, SalesCrm's two-`<HeroCard>` pair, and any other page's hero mock?

If you cannot write the 4th line without it being "different labels on
the same shape," the mock is still a clone. Pick another shape.

Only after the brief is written, reach for the primitive toolkit below.

### Step 3 — Compose the sections using the primitive toolkit

The primitives are the design language's *vocabulary* — the section
brief above is the *sentence*. Pick from this toolkit; do not let the
toolkit decide which sections you have:

- **Wrapper** — `<Section tone="a|b|dark">`.
- **Width** — `<Container width="default|narrow">`.
- **Heading block** — `<SectionHead index? label title titleMuted? actions?>`.
- **CTAs** — `<Pill variant="..." withTick? withArrow? href>`.
- **Cards / grids** — `<BentoGrid cols={N}>` + `<Bento tone=... hover>` (compound: `<Bento.Header>`, `<Bento.Desc>`, `<Bento.Cta>`, `<Bento.Footer>`).
- **Marquee feature** — `<BigCard>` for a 2-col text+visual marquee block.
- **Stepped narrative** — `<StepCard>` rows for "how it works" stories.
- **Stats** — `<DataRow>` / `<EntityRow>` / `<JournalRow>` / `<MiniBars>` / `<StatTile>` inside footers or as standalone tiles.
- **Eyebrow / pills** — `<Eyebrow index="..." label="...">`.
- **Hero shell** (always this shape) — `<Section tone="b" pad="hero"><Container><BadgeGreen>…</BadgeGreen><Heading level={1}>…</Heading><div>{pills}</div><HeroCanvas>{page-specific light mock}</HeroCanvas></Container></Section>`. `<HeroCanvas>` is **required** (dark olive bg). The mock inside must use light backgrounds (`bg-bz-paper`, `bg-bz-paper-warm`) and must be **invented fresh for this page** — not copied from another page's hero. Multi-panel mocks use `grid-cols-1 sm:grid-cols-2` to reflow on mobile; `overflow-x-auto` + `min-w-[N]` only for kanban/Gantt/wide-table artefacts.
- **Closing CTA** — passed via `<Footer cta={…}>` in `routes.tsx`; never as a page-level section.

A section that doesn't fit any of these patterns is fine if it composes
the same primitives, palette and tokens and reads clean and minimal.
The toolkit is the *vocabulary*; the section is the *sentence* — write
it for this page, don't paste it from another.

### Step 4 — Replace, don't rewrite from scratch

- Lift inline content into `const ARRAY = [...]` data structures.
- Convert each inline `style={...}` into a token reference or className.
- Token map:
  - `'#FCFCF7'` → `bg-bz-paper` / `var(--bz-paper)`
  - `'#efefe9'` → `bg-bz-section-b` / `var(--bz-section-b)`
  - `'#FFFFFF'` → `bg-bz-surface`
  - `'#1A2D20'` → `bg-bz-olive`
  - `'#0F1411'` → `bg-bz-deep` / `var(--bz-deep)` (pill-dark)
  - `'#0A100D'` → `bg-bz-olive-dark` (footer chrome)
  - `'#d3f969'` → `bg-bz-fire` / `text-bz-fire` (**dark surfaces only** — on `bg-bz-paper`/light cards use `text-bz-leaf-deep` for positive indicators instead)
  - `'#DBE9B8'` → `bg-bz-leaf`
  - `'#A8C76C'` → `text-bz-leaf-deep` (positive/upward delta text on light surfaces, e.g. `↑ +3.1%`)
  - `'#1A1D19'` → `text-bz-text`
  - `'#6E7466'` → `text-bz-text-muted`
  - `'#A2A296'` → `text-bz-text-soft`
  - `'#D8D9D3'` → `border-bz-line`
  - `'#E5E5E0'` → `border-bz-line-soft`
  - `rgba(252,252,247,0.62)` → `text-white/[0.62]` or `var(--bz-text-on-dark-muted)`
  - `rgba(252,252,247,0.08)` → `border-white/[0.08]`

- Replace `onMouseEnter`/`onMouseLeave` style mutations with `:hover` rules on the primitive's CSS class or Tailwind `hover:` utilities.
- Replace gradients with flat colours, shadows, or `<DotGrid>` overlays. No exceptions.
- Replace `<svg>` icons with lucide equivalents (or `<Icon name>` for data-driven arrays).

### Step 5 — Remove dead code

- Delete `const C = { ... }` objects.
- Delete unused imports.
- Delete `onMouseEnter`/`onMouseLeave` handlers that only mutated style.
- Delete `<style>{@media …}</style>` blocks once the primitive owns the breakpoint.
- Delete `paddingTop: 76` shims in the page AND in `routes.tsx`'s `*PageLayout`.
- Delete `<Section tone="dark">` closing CTAs — move copy into `<Footer cta={…}>`.
- Do **not** leave `// removed` comments.

### Step 6 — Verify

1. Read the migrated file end-to-end. Sanity-check that no `'#hex'` literals remain (except dynamic).
2. Grep for forbidden patterns:
   ```
   Hedvig|Manrope|Poppins|font-mono|monospace|linear-gradient|radial-gradient|material-symbols-outlined|onMouseEnter|paddingTop: 76|biz-mesh|HeroBadge
   ```
   Inside the migrated file, all results should be 0.
3. Grep also for legacy palette references inside the migrated file:
   ```
   --bz-sage|bg-bz-sage|text-bz-sage|--bz-deep-2|bg-bz-deep-2|#7A826D|#C7FF35|#1A1D19|#121212
   ```
   Should be 0 (the legacy aliases still resolve, but new code should use the descriptive tokens).
4. If non-trivial, run `npm run build` + `npm run dev`.

### Step 7 — Update the route layout

Open `src/app/routes.tsx`. Find the page's `*PageLayout`. Confirm:
- The outermost wrapper `<div>` has **`className="bz-page"`** (matches `HomeLayout`). **This is not optional** — `.bz-page` in `style.css` carries `overflow-x: clip` + `text-wrap: balance`, the project's canonical mobile-overflow guard. Without it, long `.bz-h1` / `.bz-h2` titles and any wide nested viz will trigger horizontal scroll at 375px. Symptom: page scrolls sideways a few px on mobile even though every individual section looks fine. Fix: add `className="bz-page"` to the layout's outer `<div>`. (The legacy inline `style={{fontFamily: "'Inter', sans-serif"}}` can stay or be removed — `.bz-page` already sets the body font.)
- It renders `<Header />`, the page, `<Footer cta={…}>` — in that order.
- It does NOT have a `<div style={{paddingTop: 76}}>` wrapper.
- The `cta` prop on `<Footer>` reflects this page's specific closing copy (or is omitted to use the generic default).

### Step 8 — Report

End with a short summary: what sections were migrated, what bespoke
pieces remained (if any), what primitives were added/extended as a side
effect (if any).

## Out of scope

- Don't rewrite content copy unless the user asked. The goal is *design* migration.
- Don't change routes, props, or exported component names — pages are imported by `routes.tsx`.
- Don't touch `src/styles/style.css`'s `.bz-*` CSS classes unless adding paint for a new primitive variant.
- Don't migrate >1 page per session unless explicitly asked.

## Mobile responsiveness (mandatory)

Every section must look correct from 375px through desktop without horizontal scroll. Patterns:

```tsx
// Bento grid — `BentoGrid cols={N}` owns its breakpoints; don't re-encode
<BentoGrid cols={3} />          // collapses to 1-col on mobile, 2-col on tablet automatically

// If you write a raw grid for one-off layouts
<div className="grid grid-cols-1 md:grid-cols-3 gap-5">

// Fixed-ratio grids
<div className="grid grid-cols-1 lg:grid-cols-[3fr_1fr] gap-5">

// 12-col bentos
<div className="grid grid-cols-1 md:grid-cols-12 gap-5">
  <div className="col-span-full md:col-span-7 ...">
  <div className="col-span-full md:col-span-5 ...">

// Hero dashboard decorative sidebars — desktop only
<div className="hidden md:flex w-[200px] shrink-0 ...">

// Hero panel grids — always prefer stacking over scrolling
// Use overflow-x-auto ONLY for kanban / Gantt / wide ledger tables
<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">  // two-panel body, stacks on mobile
<div className="grid grid-cols-1 gap-3 sm:grid-cols-3">  // three-card flow, stacks on mobile

// Fixed-height hero panels — never
<div className="... h-auto">                          // not h-[480px]

// Connectivity / hub rows
<div className="flex flex-col items-center gap-6 md:flex-row md:gap-0 md:justify-center">
<div className="hidden md:block w-16 h-px bg-bz-line ..."/>   // connector lines hide on mobile

// Fixed-width sidepanels
<div className="w-full lg:w-[360px] lg:flex-shrink-0">

// Dense tables — wrap and set min-w on inner rows
<div className="rounded-bz-lg border border-bz-line-soft overflow-hidden overflow-x-auto">
  <div className="hidden md:grid grid-cols-[68px_92px_1fr_120px_72px] ... min-w-[560px]">

// Padding
<div className="px-4 md:px-8 py-5 md:py-7">
```

### Mobile checklist (run before Step 6 — Verify)

- [ ] **The `*PageLayout` wrapper in `routes.tsx` has `className="bz-page"`.** This is the #1 cause of "small horizontal scroll on mobile" complaints — `.bz-page` carries `overflow-x: clip` + `text-wrap: balance` and is mandatory. Without it, even a perfectly responsive page scrolls sideways a few px on 375px viewports because long headings or nested viz nudge past the viewport.
- [ ] **HeroCanvas inner mock is mobile-responsive.** Multi-panel mocks use `grid-cols-1 sm:grid-cols-2` (or `sm:grid-cols-3`) so panels stack on mobile. `overflow-x-auto` + `min-w-[Npx]` is reserved only for artefacts that cannot be stacked (kanban boards, Gantt charts, wide ledger tables). All backgrounds inside the canvas are light (`bg-bz-paper`, `bg-bz-paper-warm`).
- [ ] All `grid-cols-N` (N ≥ 2) have a `grid-cols-1` mobile prefix.
- [ ] No inline `display: grid` / `display: flex` layout styles.
- [ ] No fixed `h-[Npx]` on hero panels — use `h-auto`.
- [ ] Decorative sidebars `hidden md:flex`.
- [ ] Connectivity sections stack on mobile; connectors `hidden md:block`.
- [ ] Dense tables wrapped in `overflow-x-auto` + `min-w-[…]` on rows.
- [ ] Fixed-width sidepanels become `w-full` on mobile.
- [ ] Padding reduced on mobile where appropriate.

## Common mistakes to avoid

- **Patching `<HeroCanvas>` bottom padding with `!pb-[Npx]` on the canvas alone.** The canvas has `min-height: 460px`. If the component is shorter than that, the component floats at the top and the canvas grows taller, producing an inconsistent bottom gap. The correct fix is to move ALL padding into an inner wrapper and make the component fill the wrapper height — see "Conventions learned from the HomePage refactor" §6.
- **Using `text-bz-fire` on a light background.** Lime (`#d3f969`) is near-invisible on paper/cream — it is a **dark-surface-only** accent. On light cards, hero mocks inside `<HeroCanvas>`, and any `bg-bz-paper` surface, use `text-bz-leaf-deep` (`#A8C76C`) for positive/upward delta indicators (e.g. `↑ +3.1%`). `text-bz-fire` is correct on dark surfaces (`bg-bz-olive`, `bg-bz-deep`, dark bentos). See `docs/DESIGN_SYSTEM.md` §Accents.
- **Constraining the hero mock width.** The mock's outer wrapper must take the full `<Container>` width — never put `max-w-xl`, `max-w-2xl`, `max-w-3xl`, or `mx-auto max-w-*` on it. However, internal sub-elements (e.g. a panel card inside the canvas) **may** carry an explicit `lg:max-w-[Npx] mx-auto` to leave horizontal breathing room between the card and the canvas edge.
- **Adding a primitive that already exists.** Check `src/app/components/bz/index.ts` first.
- **Adding new tokens without updating `docs/DESIGN_SYSTEM.md` and `/CLAUDE.md`.**
- **Using `rounded-md` / `rounded-lg`.** Use `rounded-bz-md` / `rounded-bz-lg`.
- **Wrapping `<Section>` in another wrapper for padding.** `<Section>` already provides padding; `<Container>` provides horizontal gutter.
- **Writing a `<Section tone="dark">` closing CTA above `<Footer>`.** The CTA lives inside `<Footer cta={…}>`.
- **Adding `paddingTop: 76`** anywhere. Header is no longer fixed.
- **Forgetting `className="bz-page"`** on the new `*PageLayout` wrapper in `routes.tsx`. `.bz-page` carries `overflow-x: clip` + `text-wrap: balance` — the project's mobile-overflow guard. Forgetting it produces "a tiny horizontal scroll on mobile" even when the page itself is perfectly responsive. The class is set on the outermost `<div>` of the layout, alongside the `Inter` font-family inline style.
- **Reaching for the legacy `marketing/` heroes** (`HeroCentered`, `HeroSplit`, `HeroPanel`). They're pre-rebrand. New heroes use `<Section tone="b">` + `<BadgeGreen>` + `<HeroCanvas>`.
- **Adding `.biz-mesh`** or `<HeroBadge>`. Both retired.
- **Per-page `<style>{@media …}</style>` blocks.** Means a primitive's breakpoint is missing — fix the primitive.
- **Writing desktop-only layouts.** Run the mobile checklist before declaring done.
