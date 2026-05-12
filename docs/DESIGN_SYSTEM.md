# Bizak Design System

This document is the long-form reference for the **design system** — the
*how Bizak looks*. For *what Bizak is* (modules, audience, narratives,
brand voice, copy patterns, canonical statistics), see
**`docs/BIZAK_PRODUCT_OVERVIEW.md`**. Both docs together brief any
redesign — read the overview *first* to anchor copy and section structure,
then this doc for primitives and tokens.

Quick rules for AI assistants live in `/CLAUDE.md` at the project root.
Everything below is the *why* and *how* — read this when you're adding a
new primitive, adjusting tokens, or migrating a legacy page.

> **Status note.** The site is mid-rebrand. Phase 0 (foundation) is
> complete — tokens, fonts, and docs reflect the new direction (paper +
> olive + lime + pistachio). Phase 1 (build the new primitive library) is
> next. Until Phase 1 ships, the `marketing/` folder contains the OLD
> primitives (`HeroCentered`, `Button`, `Card`, …) — they still work for
> un-migrated pages but new pages should hold off until the new
> primitives land. The `.bz-*` CSS classes in `style.css` are the *paint*
> for the new primitives; they exist now and the primitive React
> components will be layered on top.

---

## 1. Architecture

```
src/
├── styles/
│   ├── index.css        — entrypoint, imports the others
│   ├── fonts.css        — Google Fonts (Inter + Material Symbols, that's it)
│   ├── tailwind.css     — Tailwind 4 + tw-animate-css
│   ├── theme.css        — DESIGN TOKENS (the single source of truth)
│   └── style.css        — paint layer: .bz-* (new) + hp-* / biz-* (legacy)
├── app/components/
│   ├── marketing/                 — GLOBAL primitives (any page may use)
│   ├── solutions/
│   │   └── by-industry/           — SCOPED primitives (legacy — 4 industry pages)
│   ├── ui/                        — shadcn primitives (Button, Card, Dialog, …)
│   └── *Page.tsx                  — pages: composition + content data
└── ...
```

The design system has **three layers and two scopes**:

1. **Tokens** (`theme.css`) — colors, type scale, radii, spacing, shadows.
   Defined as CSS custom properties (`--bz-*`) and re-exposed as Tailwind 4
   utilities via `@theme inline { ... }`. Truly global.
2. **Primitives** — small React components.
   - `marketing/` — generic atoms used by *any* page (`Pill`, `Eyebrow`, `Heading`, `Container`, `Section`, `Bento`, `BentoGrid`, `SectionHead`, `HeroCanvas`, `HeroCard`, `StepCard`, `BigCard`, `Marquee`, `Carousel`, `Accordion`, `Flag`, `StatusChip`, `StripeBar`, `Tick`, `DotGrid`, `BadgeGreen`, `DataRow`, `MiniBars`, `EntityRow`, `JournalRow`, `ModuleListItem`). Some of these exist today (legacy generation: `Container`, `Section`, `Button`, `Card`, `HeroCentered`, etc.); the rest land in Phase 1.
   - `solutions/by-industry/` — page-family-specific layouts for the 4 industry pages (legacy generation: `IndustryHero`, `HeroVisual`, `ChallengesGrid`, etc.). These will be re-pointed at the new global primitives in Phase 3.
3. **Pages** — content data + composition. No styling decisions live here.
   No hex literals, no per-file `const C = {...}` objects, no per-file
   `Icon` SVG dictionaries, no `<style>{@media …}</style>` blocks.

### Scope hierarchy and the promotion rule

The folder hierarchy mirrors the mega-menu in `src/app/components/Header.tsx`.
Each top-level nav group can have its own scope folder (`solutions/by-industry/`,
`solutions/by-function/` later, `product/` later, etc.) — and within that,
sub-scopes if needed. **Where a primitive lives encodes who is allowed to use
it.**

The rule: **start narrow.** A primitive begins in the smallest scope where
it's used. The moment a *second* nav group needs the same shape, **promote**
it up to `marketing/`. Don't deep-import across scopes.

### Scoped components delegate to global atoms

The promotion rule above is about *layouts*. There's a parallel rule for
*atoms*: **whenever a component renders a raw `<button>` / `<a>` / styled
`<div>` whose shape mirrors a global primitive, it must delegate — never
fork.** This applies inside scoped section primitives too: a scoped
primitive's job is the *page-family-specific layout*; its CTAs, cards,
badges, and stats are still atoms and still belong to `marketing/`.

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
| `--bz-section-a` / `bg-bz-section-a` | `#FCFCF7` (= paper) | Alternating section bg — **tone A**. |
| `--bz-section-b` / `bg-bz-section-b` | `#efefe9` | Alternating section bg — **tone B**. |
| `--bz-surface` / `bg-bz-surface` | `#FFFFFF` | Elevated card on light. |
| `--bz-olive` / `bg-bz-olive` | `#1A2D20` | Dark olive — `tone="dark"` sections, hero canvas, dark bento. |
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
| `--bz-fire` / `bg-bz-fire` / `text-bz-fire` | `#d3f969` | **The lime accent — single canonical value.** Use for primary CTAs, "Live" pills on dark, key callout numbers. |
| `--bz-fire-soft` | `rgba(211,249,105,0.10)` | Tinted fire background. |
| `--bz-fire-mid` | `rgba(211,249,105,0.20)` | Tinted fire border. |
| `--bz-leaf` / `bg-bz-leaf` | `#DBE9B8` | Pistachio — softer secondary accent. Pill backgrounds on dark, badge tints, secondary CTAs. |
| `--bz-leaf-deep` | `#A8C76C` | Pistachio deep — sparingly. |

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

#### Legacy aliases (deprecated — kept for backward compat)

`--bz-accent` → `var(--bz-fire)`, `--bz-bg` → `var(--bz-paper)`,
`--bz-sage`/`--bz-sage-soft`/`--bz-sage-mid`/`--bz-sage-hover` → kept at
their old olive value (`#7A826D`-family) so un-migrated pages don't break.
**Retire when the last legacy page is migrated.**

### 2.2 Typography

**Font family: Inter.** End-to-end, single family. No serif headings, no
`font-mono`, no Hedvig, no Manrope. Loaded once in `fonts.css`. Weights
300, 400, 500, 600, 700 available. **Default weight for marketing headings
is 500** (not 700) — the new direction is calmer.

The variables `--bz-heading-font` and `--bz-body-font` both resolve to
Inter; they exist only for backward compat with code that explicitly sets
`fontFamily` inline. Don't reference them in new code — let Inter inherit
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
- `--bz-tracking-eyebrow` (`0.22em`) — uppercase eyebrows
- `--bz-tracking-tight` (`-0.018em`) — h2/h3 default
- `--bz-tracking-tighter` (`-0.022em`) — h1

**Leading:** `1.7` for body copy, `1.12` for headings.

### 2.3 Radii

`--bz-radius-sm` 6, `--bz-radius-md` 10, `--bz-radius-lg` 12,
`--bz-radius-xl` 18, `--bz-radius-2xl` 22, `--bz-radius-3xl` 28,
`--bz-radius-pill` 9999. Tailwind utilities: `rounded-bz-sm` …
`rounded-bz-3xl`, `rounded-bz-pill`. **Do not** use Tailwind's default
`rounded-md` / `rounded-lg` — they map to a different scale.

### 2.4 Spacing

| Token | Value | Use for |
|---|---|---|
| `--bz-section-y` | `140px` desktop / `110px` tablet / `80px` mobile | Vertical padding of marketing sections |
| `--bz-section-y-tight` | `96px` | Tighter section variant |
| `--bz-section-x` | `24px` | Horizontal page gutter |
| `--bz-container` | `1320px` | Default content max-width |
| `--bz-container-narrow` | `1200px` | Narrower hero/CTA pages |
| `--bz-header-h` | `76px` | **LEGACY** — header is no longer fixed; this token exists for old shims but new code should not use it |

### 2.5 Shadows

`--bz-shadow-card` for default cards, `--bz-shadow-lift` for hover state,
`--bz-shadow-deep` for floating hero cards.

**No gradients.** Project rule, no exceptions. The previous `.biz-mesh`
hero carve-out has been retired — heroes are now flat paper-cream
surfaces (or flat olive `<HeroCanvas>`) with a `<DotGrid>` overlay for
texture. Use shadows + flat fills + DotGrid for depth.

---

## 3. Primitives — the planned library (Phase 1)

When the new primitive library lands in `marketing/`, every page will
compose these. The current Phase 0 state is "tokens + CSS paint ready,
React primitives next." Until they ship, the staged HomePage uses raw
`<a className="bz-pill bz-pill-dark">` style class references; once a
primitive wraps each `.bz-*` family, those raw references become migration
debt.

### 3.1 Atoms

```tsx
<Pill
  variant="dark" | "light" | "ghost" | "ghostDark" | "accent" | "leaf"
  size="sm" | "md" | "lg"
  href?
  withTick?      // appends the green tick suffix
  withArrow?
  iconLeft?
  iconRight?
>Get Started</Pill>

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
  actions={<><Pill variant="dark" withTick>Get Started</Pill><Pill variant="light">Book demo</Pill></>}
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

1. **`<BadgeGreen>`** above the `<h1>` — the pistachio confetti pill. Not a gradient. Not a `<PillBadge>` from the legacy primitives.
2. **`<Heading level={1}>`** with `<Heading.Muted>` for the second-colour span.
3. **Two `<Pill>` CTAs** — typically `<Pill variant="dark" withTick>` (primary) + `<Pill variant="light"><Sparkles/>Book a demo</Pill>` (secondary).
4. **`<HeroCanvas>`** below (optional) — a dark olive panel with a grid overlay, holding 1–3 floating `<HeroCard>`s.
5. **`<Marquee>`** logo strip at the bottom.

The previous three hero options (`HeroCentered` / `HeroSplit` / `HeroPanel`)
are legacy. New pages don't use them. The new hero is one shape — Centered,
flat, paper, with optional HeroCanvas below.

```tsx
<Section tone="b">
  <Container>
    <BadgeGreen>Now Live, Globally 🎉</BadgeGreen>
    <Heading level={1}>
      The operating system for modern business,
      <Heading.Muted> handling finance and ops in one place.</Heading.Muted>
    </Heading>
    <div className="flex flex-wrap gap-2">
      <Pill variant="dark" withTick href="/start">Get Started</Pill>
      <Pill variant="light"><Sparkles/>Book a demo</Pill>
    </div>
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
`marketing/` primitives served two visually-different families (HomePage's
floating-card hero vs Manufacturing's split-with-visual hero vs Careers'
dark KPI-panel hero). Under the new direction, **all heroes share the
same shape** — paper surface, centered copy, `BadgeGreen`, two pills,
optional `HeroCanvas` below. Variation lives in the canvas content, not
the hero shell.

---

## 3.7 Closing-CTA convention

The bottom-of-page CTA — the "Take full control of …" moment — is no
longer a `<Section tone="dark">` block in the page. **It's owned by the
Footer.**

```tsx
// In src/app/routes.tsx — *PageLayout wrapper for each page
<Footer
  cta={{
    title: "Take full control of your financial operations.",
    titleMuted: "Close month-end in hours, not weeks.",
    description: "One ledger, auto-posted journals, real-time P&L — and a full audit trail behind every figure.",
    primaryLabel: "Start free trial",
    primaryHref: "https://system.bizakerp.com/account/self-register",
    secondaryLabel: "Talk to finance team",
    secondaryHref: "/contact",
  }}
/>
```

The `FooterCta` interface is exported from `src/app/components/Footer.tsx`.
Reference implementation: `FinancialManagementPageLayout` in `routes.tsx`.

`<Footer>` falls back to a generic default CTA if none is passed. Override
per-page when the page sells a specific module or industry — the override
copy should reinforce the page's narrative (see
`docs/BIZAK_PRODUCT_OVERVIEW.md` §4 for product narratives).

**Do not** render a separate dark CTA section above `<Footer>` — that's
the legacy pattern. The Footer's warehouse-photo CTA card is the canonical
closing CTA.

---

## 4. Page recipe (after Phase 1)

```tsx
import {
  Section, Container, SectionHead, Bento, BentoGrid, Pill, Heading,
  BadgeGreen, HeroCanvas, HeroCard, StepCard, Marquee,
} from "./marketing";
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
        <div className="flex flex-wrap gap-2">
          <Pill variant="dark" withTick href="/start">Get Started</Pill>
          <Pill variant="light">Book a demo</Pill>
        </div>
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

### Phase 0 — Foundation (✅ complete)

- Token reconciliation in `theme.css` — single source of truth for the new palette.
- Hedvig removed; Inter is the sole font.
- Duplicate `:root` block removed from `style.css`.
- Docs (`CLAUDE.md`, this file, `BIZAK_PRODUCT_OVERVIEW.md`, the `redesign-page` skill) updated to reflect the new direction.

### Phase 1 — Build the primitive library

Extract every recurring shape from the staged HomePage into a React
primitive in `src/app/components/marketing/`. List in §3 above. Each
primitive is paint (CSS class) + structure (React component) + slots
(typed props or compound children).

Acceptance bar: when Phase 1 ships, refactoring the HomePage onto the
primitives drops it from ~800 lines to ~250 lines, with zero
`onMouseEnter` style mutations, zero hex literals, zero
`<style>{@media …}</style>` blocks.

### Phase 2 — HomePage refactor (canonical reference)

Rewrite the staged HomePage using only the new primitives. This becomes
the canonical reference for every subsequent migration — the way
`ManufacturingPage.tsx` was the canonical for the by-industry pages.

### Phase 3 — Per-page migration

One PR per page. Order:

1. **Core modules** (Product mega-menu): Financial Management → Sales & CRM → Inventory & Warehouse → Manufacturing module → Purchasing → Projects & Job Costing → SFM → POS.
2. **Platform capabilities**: Dashboards & Reporting → Workflow Automation → Integrations → Multi-company → Document Management.
3. **By-Industry**: Manufacturing → Distribution → Professional Services → Retail. These currently use `solutions/by-industry/` primitives — re-point them at the new global primitives.
4. **By Company Size**: Startups & SMEs → Mid-Market → Enterprise.
5. **Customers / Partners / Resources / Company** brand pages.

Each PR follows the `redesign-page` skill.

### Phase 4 — Retire legacy

- Delete `hp-*` classes from `style.css` (homepage debt).
- Delete `biz-*` classes from `style.css` if `solutions/by-industry/` no longer references them.
- Delete or thin out the OLD-generation `marketing/` primitives (`HeroCentered`, `HeroSplit`, `HeroPanel`, `Button`, `Card`, etc.) once nothing imports them.
- Delete `--bz-sage*` legacy aliases from `theme.css`.
- Delete `src/imports/svg-eyvfmiiac4.ts`.
- Drop `@mui/icons-material` / `@mui/material` from `package.json` if unreferenced.

---

## 6. When to add a new primitive

Step one is always **scope**. Decide which folder it belongs in:

- **`marketing/`** — pattern serves *any* marketing page. Tokens, fonts, generic atoms.
- **`solutions/by-industry/`** — specific to the 4 industry pages (legacy; new scoped folders use the same pattern).
- **A new sibling scope** — if a page family needs its own rhythm.

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
5. Add `@media` breakpoints inside the primitive's CSS — never make the consumer add a `<style>{…}</style>` block.

### Promotion rule

If a primitive in a scoped folder is needed by a *second* nav group,
**promote it up to `marketing/`** rather than copying or deep-importing
across scopes.

---

## 7. Things still to do

- **Phase 1.** Build the primitive library. Track in CLAUDE.md.
- **Phase 2.** Refactor the HomePage onto primitives.
- **Phase 3.** Migrate the legacy pages one by one.
- **Phase 4.** Retire legacy CSS and the OLD-generation `marketing/` primitives.
- The duplicate `/Manufacturing` route registration in `routes.tsx` (both `Manufacturing.tsx` and `ManufacturingPage.tsx` map there) still needs reconciling. Flag with user before touching.
- Mixed casing in route paths (`/distribution` vs Header's `/Distribution` etc.) — case-sensitive in react-router 7. Flag with user.
- The HomePage currently renders its own `<Header>` / `<Footer>` (legacy pattern). In Phase 2, normalize: routes own the layout, pages own the content. This is also how the closing-CTA-via-`<Footer cta={…}>` pattern is consistently applied.
