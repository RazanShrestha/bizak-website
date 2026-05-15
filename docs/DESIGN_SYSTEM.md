# Bizak Design System

This document is the long-form reference for the **design system** the
*how Bizak looks*. For *what Bizak is* (modules, audience, narratives,
brand voice, copy patterns, canonical statistics), see
**`docs/BIZAK_PRODUCT_OVERVIEW.md`**. Both docs together brief any
redesign read the overview *first* to anchor copy and section structure,
then this doc for primitives and tokens.

Quick rules for AI assistants live in `/CLAUDE.md` at the project root.
Everything below is the *why* and *how* read this when you're adding a
new primitive, adjusting tokens, or migrating a legacy page.

> **Status note.** Phase 0 (foundation) + Phase 1 (28 primitives) + Phase 2
> (HomePage refactor) are complete. **Phase 3 (per-page migration) is next.**
>
> **The primitive library lives in `src/app/components/bz/`** the
> canonical folder. The OLD `marketing/` folder (`HeroCentered`, `Button`,
> `Card`, …) is kept un-touched so un-migrated legacy pages still render,
> but **new code never imports from `marketing/`**. The `marketing/` folder
> will be deleted in Phase 4 once every page is migrated.
>
> The `.bz-*` CSS classes in `style.css` are the *paint* for the new
> primitives in `bz/`; both layers CSS class + React wrapper live in
> lockstep.
>
> **Canonical reference page**: `src/app/components/HomePage.tsx`. Every
> Phase 3 page migration mirrors its structure (content data arrays at the
> top, section components composing primitives, page-specific domain
> visuals as in-page sub-components composing micro-viz primitives).

---

## 1. Architecture

```
src/
├── styles/
│   ├── index.css        entrypoint, imports the others
│   ├── fonts.css        Google Fonts (Inter + Material Symbols, that's it)
│   ├── tailwind.css     Tailwind 4 + tw-animate-css
│   ├── theme.css        DESIGN TOKENS (the single source of truth)
│   └── style.css        paint layer: .bz-* (new) + hp-* / biz-* (legacy)
├── app/components/
│   ├── bz/                        CANONICAL primitive library (new used by every new page)
│   ├── marketing/                 LEGACY primitives (kept for un-migrated pages; deleted in Phase 4)
│   ├── solutions/
│   │   └── by-industry/           SCOPED primitives (legacy 4 industry pages; re-pointed at bz/ in Phase 3)
│   ├── ui/                        shadcn primitives (Button, Card, Dialog, …)
│   └── *Page.tsx                  pages: composition + content data
└── ...
```

The design system has **three layers and two scopes**:

1. **Tokens** (`theme.css`) colors, type scale, radii, spacing, shadows.
   Defined as CSS custom properties (`--bz-*`) and re-exposed as Tailwind 4
   utilities via `@theme inline { ... }`. Truly global.
2. **Primitives** small React components.
   - **`bz/`** the canonical primitive library, used by every new page. Atoms (`Pill`, `Eyebrow`, `Heading`, `BadgeGreen`, `Flag`, `StatusChip`, `StripeBar`, `Tick`, `DotGrid`), layout (`Container`, `Section`, `HeroCanvas`, `SectionHead`, `BentoGrid`), card shells (`Bento`, `BigCard`, `StepCard`, `HeroCard`), patterns (`Marquee`, `Carousel`, `Accordion`, `FlagsRow`), micro-viz (`DataRow`, `MiniBars`, `EntityRow`, `JournalRow`, `ModuleListItem`).
   - `marketing/` **legacy** primitive library. The OLD generation (`Container`, `Section`, `Button`, `Card`, `SectionHeading`, `Eyebrow`, `IconBadge`, `PillBadge`, `HeroBadge`, `Icon`, `Stat`, `HeroCentered`, `HeroSplit`, `HeroPanel`). Kept un-touched so un-migrated pages keep rendering. **Do not add new files here.** Deleted in Phase 4.
   - `solutions/by-industry/` page-family-specific layouts for the 4 industry pages (legacy generation: `IndustryHero`, `HeroVisual`, `ChallengesGrid`, etc.). These will be re-pointed at `bz/` in Phase 3.
3. **Pages** content data + composition. No styling decisions live here.
   No hex literals, no per-file `const C = {...}` objects, no per-file
   `Icon` SVG dictionaries, no `<style>{@media …}</style>` blocks.

### Scope hierarchy and the promotion rule

The folder hierarchy mirrors the mega-menu in `src/app/components/Header.tsx`.
Each top-level nav group can have its own scope folder (`solutions/by-industry/`,
`solutions/by-function/` later, `product/` later, etc.) and within that,
sub-scopes if needed. **Where a primitive lives encodes who is allowed to use
it.**

The rule: **start narrow.** A primitive begins in the smallest scope where
it's used. The moment a *second* nav group needs the same shape, **promote**
it up to `bz/`. Don't deep-import across scopes.

### Scoped components delegate to global atoms

The promotion rule above is about *layouts*. There's a parallel rule for
*atoms*: **whenever a component renders a raw `<button>` / `<a>` / styled
`<div>` whose shape mirrors a global primitive, it must delegate never
fork.** This applies inside scoped section primitives too: a scoped
primitive's job is the *page-family-specific layout*; its CTAs, cards,
badges, and stats are still atoms and still belong to `bz/`.

If the visual you need isn't expressible by an existing variant on the
global primitive: add a new variant on the global primitive first, update
its prop docs in this file and `CLAUDE.md`, then delegate from the scoped
primitive.

---

## 2. Tokens

### 2.1 Colors

The new palette (paper / olive / lime / pistachio). Use the descriptive
names below. Legacy aliases (`--bz-sage`, `--bz-accent`, `--bz-bg`) still
resolve so un-migrated pages keep rendering, but new code should not use
them.

#### Surfaces

| Token | Value | When to use |
|---|---|---|
| `--bz-paper` / `bg-bz-paper` | `#FCFCF7` | Primary page bg. Default light surface. |
| `--bz-paper-warm` / `bg-bz-paper-warm` | `#F4F4ED` | Cards or callouts on paper. |
| `--bz-section-a` / `bg-bz-section-a` | `#FCFCF7` (= paper) | Alternating section bg **tone A**. |
| `--bz-section-b` / `bg-bz-section-b` | `#efefe9` | Alternating section bg **tone B**. |
| `--bz-surface` / `bg-bz-surface` | `#FFFFFF` | Elevated card on light. |
| `--bz-olive` / `bg-bz-olive` | `#1A2D20` | Dark olive `tone="dark"` sections, hero canvas, dark bento. |
| `--bz-olive-soft` | `#243A2D` | Lighter olive variant. |
| `--bz-olive-dark` / `bg-bz-olive-dark` | `#0A100D` | Footer chrome. |
| `--bz-deep` | `#0F1411` | Pill-dark button fill. Slightly different shade from `--bz-olive`. |

**Alternation pattern.** Marketing pages alternate consecutive sections
between `tone="a"` and `tone="b"`. Pattern: hero (b) → §01 (a) → §02 (b) →
§03 (a) → testimonials (b) → FAQ (a) → Footer. Dark sections
(`tone="dark"`) appear sparingly for showcase blocks. The `<Section>`
primitive (Phase 1) will encode this automatically.

#### Accents

| Token | Value | When to use |
|---|---|---|
| `--bz-fire` / `bg-bz-fire` / `text-bz-fire` | `#d3f969` | **The lime accent single canonical value.** Use for primary CTAs, "Live" pills on dark, key callout numbers. |
| `--bz-fire-soft` | `rgba(211,249,105,0.10)` | Tinted fire background. |
| `--bz-fire-mid` | `rgba(211,249,105,0.20)` | Tinted fire border. |
| `--bz-leaf` / `bg-bz-leaf` | `#DBE9B8` | Pistachio softer secondary accent. Pill backgrounds on dark, badge tints, secondary CTAs. |
| `--bz-leaf-deep` | `#A8C76C` | Pistachio deep sparingly. |

#### Text

| Token | Value | Use |
|---|---|---|
| `--bz-text` / `text-bz-text` | `#1A1D19` | Body and heading on light. |
| `--bz-text-muted` / `text-bz-text-muted` | `#6E7466` | Description copy, meta labels. |
| `--bz-text-soft` / `text-bz-text-soft` | `#A2A296` | The muted span inside headings ("…and inventory in one place" muted half). |
| `--bz-text-on-dark` | `#FCFCF7` | Body on dark olive. |
| `--bz-text-on-dark-muted` | `rgba(252,252,247,0.62)` | Muted on dark. |
| `--bz-text-on-dark-soft` | `rgba(252,252,247,0.45)` | Captions on dark. |

#### Borders / lines

| Token | Value | Use |
|---|---|---|
| `--bz-line` / `border-bz-line` | `#D8D9D3` | Primary line on light. |
| `--bz-line-soft` / `border-bz-line-soft` | `#E5E5E0` | Soft divider. |
| `--bz-border-on-dark` | `rgba(252,252,247,0.08)` | Default border on dark. |

#### Legacy aliases (deprecated kept for backward compat)

`--bz-accent` → `var(--bz-fire)`, `--bz-bg` → `var(--bz-paper)`,
`--bz-sage`/`--bz-sage-soft`/`--bz-sage-mid`/`--bz-sage-hover` → kept at
their old olive value (`#7A826D`-family) so un-migrated pages don't break.
**Retire when the last legacy page is migrated.**

### 2.2 Typography

**Font family: Inter.** End-to-end, single family. No serif headings, no
`font-mono`, no Hedvig, no Manrope. Loaded once in `fonts.css`. Weights
300, 400, 500, 600, 700 available. **Default weight for marketing headings
is 500** (not 700) the new direction is calmer.

The variables `--bz-heading-font` and `--bz-body-font` both resolve to
Inter; they exist only for backward compat with code that explicitly sets
`fontFamily` inline. Don't reference them in new code let Inter inherit
from `<body>`.

**Scale (CSS custom properties):**

| Token | Value | Use for |
|---|---|---|
| `--bz-text-h1` | `clamp(32px, 4.5vw, 56px)` | Hero headline |
| `--bz-text-h2` | `clamp(26px, 3.4vw, 36px)` | Section heading |
| `--bz-text-h3` | `clamp(20px, 2.6vw, 28px)` | Card / bento title |
| `--bz-text-xl` | `20px` | Lead paragraph |
| `--bz-text-lg` | `17px` | Description copy |
| `--bz-text-base` | `15px` | Body |
| `--bz-text-sm` | `13px` | Meta, secondary labels |
| `--bz-text-eyebrow` | `12px` | Eyebrow `[01] LABEL` |

**Tracking (letter-spacing):**
- `--bz-tracking-eyebrow` (`0.22em`) uppercase eyebrows
- `--bz-tracking-tight` (`-0.018em`) h2/h3 default
- `--bz-tracking-tighter` (`-0.022em`) h1

**Leading:** `1.7` for body copy, `1.12` for headings.

### 2.3 Radii

`--bz-radius-sm` 6, `--bz-radius-md` 10, `--bz-radius-lg` 12,
`--bz-radius-xl` 18, `--bz-radius-2xl` 22, `--bz-radius-3xl` 28,
`--bz-radius-pill` 9999. Tailwind utilities: `rounded-bz-sm` …
`rounded-bz-3xl`, `rounded-bz-pill`. **Do not** use Tailwind's default
`rounded-md` / `rounded-lg` they map to a different scale.

### 2.4 Spacing

| Token | Value | Use for |
|---|---|---|
| `--bz-section-y` | `140px` desktop / `110px` tablet / `80px` mobile | Vertical padding of marketing sections |
| `--bz-section-y-tight` | `96px` | Tighter section variant |
| `--bz-section-x` | `24px` | Horizontal page gutter |
| `--bz-container` | `1320px` | Default content max-width |
| `--bz-container-narrow` | `1200px` | Narrower hero/CTA pages |
| `--bz-hero-gap` | `78px` desktop / `48px` mobile (`--bz-hero-gap-mobile`) | Gap between the hero CTA pill row and the visual/mock immediately below. Consumed by `.bz-hero-canvas` and `.bz-hero-visual` (see §3.6). **Always use the class** never hardcode this gap as `mt-10` / `mt-16` / `mt-[78px]` etc. on a hero mock wrapper. Change the token to shift the gap site-wide. |
| `--bz-header-h` | `76px` | **LEGACY** header is no longer fixed; this token exists for old shims but new code should not use it |

### 2.5 Shadows

`--bz-shadow-card` for default cards, `--bz-shadow-lift` for hover state,
`--bz-shadow-deep` for floating hero cards.

**No gradients.** Project rule, no exceptions. The previous `.biz-mesh`
hero carve-out has been retired heroes are now flat paper-cream
surfaces (or flat olive `<HeroCanvas>`) with a `<DotGrid>` overlay for
texture. Use shadows + flat fills + DotGrid for depth.

---

## 3. Primitives the planned library (Phase 1)

When the new primitive library lands in `bz/`, every page will
compose these. The current Phase 0 state is "tokens + CSS paint ready,
React primitives next." Until they ship, the staged HomePage uses raw
`<a className="bz-pill bz-pill-dark">` style class references; once a
primitive wraps each `.bz-*` family, those raw references become migration
debt.

### 3.1 Atoms

```tsx
<Pill
  variant="dark" | "light" | "ghost" | "ghostDark" | "accent" | "leaf"
  size="sm" | "md"
  href?
  withArrow?         // internal hrefs (→)
  withArrowUpRight?  // external hrefs (↗) system.bizakerp.com/*
>Get Started</Pill>
   // Exactly one arrow prop is mandatory.
   // Legacy props removed: withTick, iconLeft, iconRight, size="lg".
   // See §3.1.1 below for the 4 canonical CTA labels and arrow mapping.

<PillGroup>
  <Pill variant="dark"  withArrowUpRight href="https://system.bizakerp.com/account/self-register">Get Started</Pill>
  <Pill variant="light" withArrow         href="/contact">Request Demo</Pill>
</PillGroup>
   // CSS-grid wrapper for adjacent pill PAIRS. 1fr 1fr → equal width
   // (wider label drives both). Max 440px desktop, 100% mobile (both
   // stay on one row). Do NOT wrap solo pills (StepCard cta=…, BigCard
   // cta=…, Bento.Cta, standalone nav pills) in PillGroup.

<Eyebrow index?="01" tone?="dark|light">How it works</Eyebrow>
   // renders "[01] HOW IT WORKS" when index is set

<Heading level={1|2|3}>
  Replace spreadsheets and run smoothly,
  <Heading.Muted> across every part of your business.</Heading.Muted>
</Heading>

<BadgeGreen>Now Live, Globally 🎉</BadgeGreen>     // pistachio confetti pill, hero badge slot

<Flag>🇺🇸</Flag>                                    // small flag chip

<StatusChip variant="live|posted|neutral">Live</StatusChip>

<StripeBar pct={44} />

<Tick />                                            // green-on-pistachio check

<DotGrid tone="dark|light" />                       // position: absolute; inset: 0 grid overlay
```

### 3.1.1 CTA conventions the 4 canonical labels

Every conversion CTA on the site maps to exactly one of four labels. **Do not invent new labels.** When migrating a page, substitute any older label per the table below.

| Label | href | Variant (light surface) | Variant (dark surface) | Arrow |
|---|---|---|---|---|
| **Get Started** | `https://system.bizakerp.com/account/self-register` | `dark` | `accent` | `withArrowUpRight` |
| **Free Trial** | `https://system.bizakerp.com/account/self-register` | `dark` | `accent` | `withArrowUpRight` |
| **Request Demo** | `/contact` | `light` | `ghostDark` (secondary) / `accent` (primary on dark) | `withArrow` |
| **Talk to Sales** | `/contact` | `light` | `ghostDark` | `withArrow` |

**Standard hero pair.** Every page's hero CTA row is `Get Started` (dark, ↗) + `Request Demo` (light, →) inside `<PillGroup>`. Use `Free Trial` instead of `Get Started` only when the page leads explicitly with the trial-first story.

**Standard closing pair (in `<Footer cta={…}>`).** `primaryLabel="Get Started"` + `secondaryLabel="Request Demo"` (or `Free Trial` + `Request Demo`). Set in the page's `*PageLayout` in `routes.tsx`.

**Standard dark-surface pair.** On a dark olive panel (e.g. HomePage's FAQ intro card), primary is `accent` lime (`Get Started`) and secondary is `ghostDark` outlined (`Talk to Sales`). Both still go through `<PillGroup>`.

**Solo pills** in `<StepCard cta=…>`, `<BigCard cta=…>`, `<Bento.Cta>` same label and arrow rules, but **not** wrapped in PillGroup. If the StepCard / BigCard cta is the page's secondary "Learn more" pill that doesn't link to one of the 4 destinations, keep its descriptive label (e.g. "See finance link" → `/FinancialManagement`) but still apply the arrow rule (internal = `withArrow`).

**Label substitution table** (apply on sight whenever you touch a page):

| Old label | New label |
|---|---|
| "Book a Demo" / "Book a demo" / "Request a Demo" / "Request demo" | "Request Demo" |
| "Start free trial" / "Start Free Trial" | "Free Trial" |
| "See it live" | "Get Started" (if href = self-register) / "Request Demo" (if href = `/contact`) |
| "See it in action" | "Request Demo" (force href to `/contact`) |
| "Talk to practice team" / "Talk to support" / "Talk to operations" / "Talk to ops" / "Talk to an integration engineer" / "Talk to sales team" | "Talk to Sales" |
| "Browse connectors" / "Visit help center" / "View features" / "Explore purchasing" | "Request Demo" (force `/contact`) or "Get Started" if the page is clearly self-serve |

The migration of every page onto these labels landed in May 2026 with the introduction of `<PillGroup>`. From that point onward, **a Pill on any non-legacy page that fails these rules is a bug** fix it in the same change.

### 3.2 Card shells

```tsx
<Bento tone="dark|fire|leaf|paper" hover? dotGrid? span?>
  <Bento.Header
    title={<>One ledger,<br/>every module</>}
    icon={<Layers/>}
  />
  <Bento.Desc>Every transaction posts the right journals automatically.</Bento.Desc>
  <Bento.Cta href="/x" variant="leaf">Learn more</Bento.Cta>
  <Bento.Footer>{/* mini-viz slot */}</Bento.Footer>
</Bento>

<BigCard
  text={{ title, body, bullets, cta }}
  visual={<MultiEntityVisual/>}
/>

<StepCard
  number="01"
  tag="Set up"
  title="Pick your modules and go live"
  bullets={["…", "…"]}
  cta={{ label: "Learn more", href: "/product" }}
  visual={<StepVisualSetup/>}
/>

<HeroCard
  icon={<Activity/>}
  title="Live ledger"
  badge="Live"
  eyebrow="Cash position"
  value="$1,242,180"
>{/* footer-viz slot */}</HeroCard>
```

### 3.3 Layout

```tsx
<Section tone="a|b|dark" pad="default|tight">…</Section>
   // tone="a"/"b" alternate; tone="dark" for showcase blocks.
   // Encodes section-y padding (140/110/80).

<Container width="default|narrow">…</Container>     // 1320 / 1200, mx-auto

<HeroCanvas>                                         // dark olive panel + grid overlay
  <HeroCard/>
  <HeroCard/>
</HeroCanvas>

<SectionHead
  index="02"
  label="Platform"
  title={<>A unified platform … <Heading.Muted>across every part.</Heading.Muted></>}
  actions={
    <PillGroup>
      <Pill variant="dark"  withArrowUpRight href="https://system.bizakerp.com/account/self-register">Get Started</Pill>
      <Pill variant="light" withArrow         href="/contact">Request Demo</Pill>
    </PillGroup>
  }
/>

<BentoGrid cols={2|3|4}>…</BentoGrid>                // owns its own breakpoints
```

### 3.4 Patterns

```tsx
<Marquee speed="36s" pauseOnHover tone="light|dark">
  {LOGOS.map(s => <img key={s} src={…}/>)}
</Marquee>

<Carousel autoAdvance={6000} render={(t) => <TestimonialQuote {...t}/>}>
  {TESTIMONIALS}
</Carousel>

<Accordion>
  {FAQS.map((f, i) => (
    <Accordion.Item key={i} question={f.q}>{f.a}</Accordion.Item>
  ))}
</Accordion>

<FlagsRow prefix="Available in 120+ countries" suffix="with localised tax & compliance"/>
```

### 3.5 Micro-viz (for filling card insides)

```tsx
<DataRow label="AR" value="+$12,400.00"/>
<MiniBars values={[40,65,50,80,60,88,92]} highlightLast/>
<EntityRow flag="🇺🇸" name="Bizak US" amount="$1.24M"/>
<JournalRow txn="Sales order SO-1041" debit="AR" credit="Revenue + VAT"/>
<ModuleListItem active>Dashboard</ModuleListItem>
```

These are the rows that fill bento footers, step visuals, and HeroCard
panels. Extracting them is what kills the 60-line `style={{}}` blobs
currently in the staged HomePage.

---

## 3.6 Hero pattern (new direction)

Every marketing hero on the site is a **flat paper-cream surface** (using
`bg-bz-section-b` for warmth, or `bg-bz-paper` for cleaner pages) with:

1. **`<BadgeGreen>`** above the `<h1>` the pistachio confetti pill. Not a gradient. Not a `<PillBadge>` from the legacy primitives.
2. **`<Heading level={1}>`** with `<Heading.Muted>` for the second-colour span.
3. **Two `<Pill>` CTAs in `<PillGroup>`** the canonical pair is `Get Started` (dark, `withArrowUpRight`, self-register) + `Request Demo` (light, `withArrow`, `/contact`). See §3.1.1 for the 4-label canon. The PillGroup gives both pills equal width.
4. **`<HeroCanvas>`** below (optional) a dark olive panel with a grid overlay, holding 1–3 floating `<HeroCard>`s. Encodes the canonical gap below the CTA pills via `.bz-hero-canvas { margin-top: var(--bz-hero-gap) }`.
5. **OR** `<div className="bz-hero-visual">` wrapping a page-specific paper-surface mock (e.g. `FinancialManagement`'s olive-panel + statement card, `Workflow`'s approval-flow board). Encodes the same `var(--bz-hero-gap)` so paper-surface and olive-canvas heroes share one measurement.
6. **`<Marquee>`** logo strip at the bottom.

The previous three hero options (`HeroCentered` / `HeroSplit` / `HeroPanel`)
are legacy. New pages don't use them. The new hero is one shape Centered,
flat, paper, with optional HeroCanvas below.

### The hero-gap rule

The vertical space between the CTA pill row and whatever visual sits
directly below it (`<HeroCanvas>` *or* a page-specific mock) is owned
by **one token** `--bz-hero-gap` (78px desktop / 48px mobile via
`--bz-hero-gap-mobile`). Two CSS classes read it:

- `.bz-hero-canvas` applied automatically by the `<HeroCanvas>` primitive.
- `.bz-hero-visual` apply manually on the outer `<div>` of a non-canvas hero mock.

```tsx
// Option A olive canvas (HomePage, Manufacturing, Distribution, Inventory, …)
<HeroCanvas>
  <HeroCard … />
  <HeroCard … />
</HeroCanvas>

// Option B paper-surface page-specific mock (FinancialManagement, Workflow, Integrations, …)
<div className="bz-hero-visual mx-auto w-full max-w-[1140px] …">
  <PageSpecificMock />
</div>
```

**Never** write a fresh top-margin (`mt-10`, `mt-14`, `mt-16`, `mt-12 md:mt-16`, `mt-[48px] md:mt-[78px]`, etc.) on the hero mock wrapper those are migration debt from before the token landed. To shift the gap site-wide, edit `--bz-hero-gap` / `--bz-hero-gap-mobile` in `theme.css`; both classes update everywhere.

```tsx
<Section tone="b">
  <Container>
    <BadgeGreen>Now Live, Globally 🎉</BadgeGreen>
    <Heading level={1}>
      The operating system for modern business,
      <Heading.Muted> handling finance and ops in one place.</Heading.Muted>
    </Heading>
    <PillGroup>
      <Pill variant="dark"  withArrowUpRight href="https://system.bizakerp.com/account/self-register">Get Started</Pill>
      <Pill variant="light" withArrow         href="/contact">Request Demo</Pill>
    </PillGroup>
    <HeroCanvas>
      <HeroCard … />
      <HeroCard … />
    </HeroCanvas>
    <Marquee>{LOGOS.map(…)}</Marquee>
  </Container>
</Section>
```

### Why the new pattern is simpler

The previous spec offered three hero variants because the legacy
legacy `marketing/` primitives served two visually-different families (HomePage's
floating-card hero vs Manufacturing's split-with-visual hero vs Careers'
dark KPI-panel hero). Under the new direction, **all heroes share the
same shape** paper surface, centered copy, `BadgeGreen`, two pills,
optional `HeroCanvas` below. Variation lives in the canvas content, not
the hero shell.

---

## 3.7 Closing-CTA convention

The bottom-of-page CTA the "Take full control of …" moment is no
longer a `<Section tone="dark">` block in the page. **It's owned by the
Footer.**

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

**Use the canonical labels.** `primaryLabel` and `secondaryLabel` must be one of the four labels from §3.1.1 typically `Get Started` + `Request Demo`, or `Free Trial` + `Request Demo` if the page leads with the trial story. Don't write "Start free trial" / "Talk to finance team" / etc.

The `FooterCta` interface is exported from `src/app/components/Footer.tsx`.
Reference implementation: `FinancialManagementPageLayout` in `routes.tsx`.

`<Footer>` falls back to a generic default CTA if none is passed. Override
per-page when the page sells a specific module or industry the override
copy should reinforce the page's narrative (see
`docs/BIZAK_PRODUCT_OVERVIEW.md` §4 for product narratives).

**Do not** render a separate dark CTA section above `<Footer>` that's
the legacy pattern. The Footer's warehouse-photo CTA card is the canonical
closing CTA.

---

## 3.8 Mobile design quality (the second bar)

The site has **two mobile bars** both mandatory:

1. **Structural correctness** fits 375px without horizontal scroll, no broken grids, no fixed heights crushing content. Mechanics covered by `<Section>`, `<Container>`, `<BentoGrid>` breakpoints + the patterns in `.claude/skills/redesign-page/SKILL.md`.
2. **Mobile design quality** looks *intentionally designed* at 375px, not "the desktop layout, smaller." Mechanics covered below.

The desktop view and the mobile view are **two distinct designs of the same content**. The mobile view earns its own design pass. A page that passes (1) but fails (2) fits the viewport but feels cramped, busy, or bulky on a phone is a failed redesign.

### Why this is a design-system concern, not a per-page concern

The temptation is to treat mobile as "make it not break." That's the *minimum* bar; the design-system bar is higher. A few principles that should hold across every page:

- **Density drops on mobile.** A 4-tile bento that fills a hero panel on desktop should *reduce*, not *crush*, on mobile typically to 2 tiles, or to a single hero summary card. The remaining tiles are `hidden md:block` (or replaced with a separate mobile-specific composition).
- **Card interiors stay generous.** Outer/section padding shrinks on mobile, but a stacked single-column card with cramped internals reads worse than a roomy one. Card `p-5` is often bumped *up* (not down) on mobile.
- **Decorative elements hide.** Anything that exists only because the desktop column was wide sidecards, secondary metric tiles, large illustrations drops on mobile rather than shrinking into a thumbnail.
- **Mocks simplify, don't shrink.** Complex multi-axis charts, 6-row dashboards, sidebar+main-panel layouts all get a *simpler representation* on mobile (headline number + 1-line summary, first 3 rows + "view more", main panel only).
- **One-column ≠ more content.** When a grid collapses to one column, the empty horizontal space *is* the design. Don't fill it with extras.

### Tokens & utilities that support this

- `--bz-section-y` already responsive (`140 / 110 / 80px`); section vertical padding scales automatically.
- `--bz-text-h1` / `--bz-text-h2` `clamp(...)` values; type scale is responsive at the token level. Don't override unless the layout genuinely breaks.
- `--bz-hero-gap` / `--bz-hero-gap-mobile` hero CTA → mock gap (`78 / 48px`). One token; both `.bz-hero-canvas` and `.bz-hero-visual` consume it.
- Tailwind responsive prefixes (`sm:`, `md:`, `lg:`) for per-component density tuning. Default breakpoints; no custom breakpoints in `theme.css`.
- `hidden md:block` / `hidden md:grid` / `hidden md:flex` the canonical "this only earns its place on desktop" utility.

### When to write a separate mobile composition vs. responsive utility classes

Two valid approaches; pick the one that matches the gap between desktop and mobile designs:

```tsx
// Approach A small differences. Use responsive utilities on one composition.
<Bento className="p-5 md:p-4">
  <Bento.Header className="mb-3 md:mb-2" />
  <Bento.Desc className="text-[14px] md:text-[13px] leading-relaxed" />
</Bento>

// Approach B large differences (mock simplification). Two compositions, swap with hidden.
<>
  <div className="hidden md:block">
    <DesktopComplexDashboard />          {/* 4 tiles + sidebar + chart */}
  </div>
  <div className="md:hidden">
    <MobileSummaryCard />                {/* 1 hero stat + 2-row summary */}
  </div>
</>
```

Approach A is the default; reach for B only when the desktop mock would be unreadable at < 280px wide.

### The mobile design-quality rule applies to every primitive

When you add a new primitive to `bz/`, its responsive behaviour is part of the API contract not an afterthought. Specifically:

- The primitive must look intentional at 375px without consumer override. A `<Bento>` that requires the page to wrap it in `hidden md:block` to look good is a broken primitive.
- The primitive's responsive tuning lives **in the primitive** (its `.bz-*` CSS class or its component's Tailwind classes), not in the page that uses it.
- If a primitive has a fundamentally different mobile shape (e.g. a dense table primitive that should become a card list on mobile), build that into the primitive itself don't make every consumer reinvent the swap.

For the per-page workflow checklist (the design-quality questions to ask while walking a finished page top-to-bottom at 375px), see `.claude/skills/redesign-page/SKILL.md` §"Mobile design-quality cheatsheet."

---

## 4. Page recipe (after Phase 1)

```tsx
import {
  Section, Container, SectionHead, Bento, BentoGrid, Pill, PillGroup, Heading,
  BadgeGreen, HeroCanvas, HeroCard, StepCard, Marquee,
} from "./bz";
import { Layers, ShieldCheck, Activity, Receipt } from "lucide-react";

const FEATURES = [
  { icon: Layers,      title: "One ledger",   desc: "…" },
  { icon: ShieldCheck, title: "Audit trail",  desc: "…" },
  { icon: Activity,    title: "Real-time",    desc: "…" },
];

function HeroSection() {
  return (
    <Section tone="b">
      <Container>
        <BadgeGreen>Now Live, Globally</BadgeGreen>
        <Heading level={1}>
          The operating system for modern business,
          <Heading.Muted> finance and ops in one place.</Heading.Muted>
        </Heading>
        <PillGroup>
          <Pill variant="dark"  withArrowUpRight href="https://system.bizakerp.com/account/self-register">Get Started</Pill>
          <Pill variant="light" withArrow         href="/contact">Request Demo</Pill>
        </PillGroup>
        <HeroCanvas>
          <HeroCard icon={<Activity/>} title="Live ledger" badge="Live" value="$1,242,180"/>
          <HeroCard icon={<Receipt/>}  title="Invoice INV-2046" value="$12,400.00"/>
        </HeroCanvas>
      </Container>
    </Section>
  );
}

function FeaturesSection() {
  return (
    <Section tone="a">
      <Container>
        <SectionHead
          index="01"
          label="How it works"
          title={<>Replace spreadsheets, <Heading.Muted>run smoothly.</Heading.Muted></>}
        />
        <BentoGrid cols={3}>
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <Bento key={title} tone="paper" hover>
              <Bento.Header title={title} icon={<Icon/>}/>
              <Bento.Desc>{desc}</Bento.Desc>
            </Bento>
          ))}
        </BentoGrid>
      </Container>
    </Section>
  );
}

export function MyPage() {
  return (
    <div className="bz-page">
      <HeroSection/>
      <FeaturesSection/>
    </div>
  );
}
```

Header and Footer are rendered by the route layout (`routes.tsx`), not the
page itself.

---

## 5. Migration plan

The site is being migrated in five phases.

### Phase 0 Foundation (✅ complete)

- Token reconciliation in `theme.css` single source of truth for the new palette.
- Hedvig removed; Inter is the sole font.
- Duplicate `:root` block removed from `style.css`.
- Docs (`CLAUDE.md`, this file, `BIZAK_PRODUCT_OVERVIEW.md`, the `redesign-page` skill) updated to reflect the new direction.

### Phase 1 Build the primitive library (✅ complete)

28 primitives shipped in `src/app/components/bz/`. See §3 for the prop
APIs. Each primitive is paint (CSS class in `style.css` under `.bz-*`) +
structure (React component) + slots (typed props or compound children).

### Phase 2 HomePage refactor (✅ complete)

`src/app/components/HomePage.tsx` now composes the `bz/` primitives. This
is the canonical reference for every Phase 3 migration. `HomeLayout` in
`routes.tsx` renders `<Header /> <HomePage /> <Footer />` pages own
content; the layout owns chrome.

Key lessons that became conventions (documented in `/CLAUDE.md`):

- `tone` means **surface** everywhere (`tone="dark"` = dark surface, light text).
- Hero badge → title → buttons uses inline `style={{ marginBottom: 28|36 }}` to bypass cascade issues with `.bz-h1`/`.bz-h2` paint classes.
- `Section pad="hero"` = flat `pt-[56px] pb-[96px]` (no responsive variation).
- Mobile Header hamburger = bare 3-line icon, no chrome.

### Phase 3 Per-page migration (⏳ next)

One PR per page. Order:

1. **Core modules** (Product mega-menu): Financial Management → Sales & CRM → Inventory & Warehouse → Manufacturing module → Purchasing → Projects & Job Costing → SFM → POS.
2. **Platform capabilities**: Dashboards & Reporting → Workflow Automation → Integrations → Multi-company → Document Management.
3. **By-Industry**: Manufacturing → Distribution → Professional Services → Retail. These currently use `solutions/by-industry/` primitives re-point them at the new global primitives.
4. **By Company Size**: Startups & SMEs → Mid-Market → Enterprise.
5. **Customers / Partners / Resources / Company** brand pages.

Each PR follows the `redesign-page` skill.

### Phase 4 Retire legacy

- Delete `hp-*` classes from `style.css` (homepage debt).
- Delete `biz-*` classes from `style.css` if `solutions/by-industry/` no longer references them.
- Delete the entire `marketing/` folder once no page imports from it.
- Delete `--bz-sage*` legacy aliases from `theme.css`.
- Delete `src/imports/svg-eyvfmiiac4.ts`.
- Drop `@mui/icons-material` / `@mui/material` from `package.json` if unreferenced.

---

## 6. When to add a new primitive

Step one is always **scope**. Decide which folder it belongs in:

- **`bz/`** pattern serves *any* marketing page. Tokens, fonts, generic atoms. This is the canonical home for new primitives.
- **`solutions/by-industry/`** specific to the 4 industry pages (legacy; new scoped folders use the same pattern).
- **A new sibling scope** if a page family needs its own rhythm.

Then add to that scope if:

- The pattern shows up in **2+ pages** within that scope with the same structure.
- It bundles a meaningful design decision (spacing, type, color combo) you don't want each page to re-decide.
- It would otherwise be copy-pasted JSX.

Don't add a primitive for one-off layouts.

When you do add one:

1. Place it in the right scope folder.
2. Export it from that scope's `index.ts` barrel.
3. Use `cva` for variants if there are >2 options per axis.
4. Document the prop API in this file (§3) and in `/CLAUDE.md`'s "Planned primitive library" block (or "Available primitives" once it ships).
5. Add `@media` breakpoints inside the primitive's CSS never make the consumer add a `<style>{…}</style>` block.

### Promotion rule

If a primitive in a scoped folder is needed by a *second* nav group,
**promote it up to `bz/`** rather than copying or deep-importing
across scopes.

---

## 7. Things still to do

- **Phase 1.** Build the primitive library. Track in CLAUDE.md.
- **Phase 2.** Refactor the HomePage onto primitives.
- **Phase 3.** Migrate the legacy pages one by one.
- **Phase 4.** Retire legacy CSS and the entire `marketing/` folder.
- The duplicate `/Manufacturing` route registration in `routes.tsx` (both `Manufacturing.tsx` and `ManufacturingPage.tsx` map there) still needs reconciling. Flag with user before touching.
- Mixed casing in route paths (`/distribution` vs Header's `/Distribution` etc.) case-sensitive in react-router 7. Flag with user.
- The HomePage currently renders its own `<Header>` / `<Footer>` (legacy pattern). In Phase 2, normalize: routes own the layout, pages own the content. This is also how the closing-CTA-via-`<Footer cta={…}>` pattern is consistently applied.
