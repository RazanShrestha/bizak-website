# Bizak Design System

This document is the long-form reference for the design system. Quick rules
for AI assistants live in `/CLAUDE.md` at the project root. Everything below
is the *why* and *how* — read this when you're adding a new primitive,
adjusting tokens, or migrating a legacy page.

---

## 1. Architecture

```
src/
├── styles/
│   ├── index.css        — entrypoint, imports the others
│   ├── fonts.css        — Google Fonts (Inter + Material Symbols)
│   ├── tailwind.css     — Tailwind 4 + tw-animate-css
│   ├── theme.css        — DESIGN TOKENS (the source of truth)
│   └── style.css        — legacy hp-* homepage CSS + biz-* classes
│                          backing the by-industry primitives (do not extend)
├── app/components/
│   ├── marketing/                 — GLOBAL primitives (any page may use)
│   ├── solutions/
│   │   └── by-industry/           — SCOPED primitives (only the 4 industry pages)
│   ├── ui/                        — shadcn primitives (Button, Card, Dialog, …)
│   └── *Page.tsx                  — pages: composition + content data
└── ...
```

The design system has **three layers and two scopes**:

1. **Tokens** (`theme.css`) — colors, type scale, radii, spacing, shadows.
   Defined as CSS custom properties (`--bz-*`) and re-exposed as Tailwind 4
   utilities via `@theme inline { ... }`. Truly global.
2. **Primitives** — small React components. className-driven with `cva`
   variants. Live in **two scopes**:
   - `marketing/` — generic, used by *any* page (`Container`, `Section`,
     `Eyebrow`, `SectionHeading`, `Button`, `Card`, `Stat`, `IconBadge`,
     `PillBadge`, `HeroBadge`, `Icon`).
   - `solutions/by-industry/` — page-family-specific, used only by the 4
     "By Industry" pages (Manufacturing, Distribution, ProfessionalService,
     Retail). These encode the *rhythm* of the industry shape:
     `IndustryHero`, `HeroVisual` (and its 4 card sub-primitives),
     `Node`, `ChallengesGrid`, `SolutionGrid`, `CapabilitiesGrid`
     (and its helpers), `InsightsBlock`, `WorkflowStrip`, `IndustryCta`.
3. **Pages** — content data + composition. No styling decisions live here.
   No hex literals, no per-file `const C = {...}` objects, no per-file
   `Icon` SVG dictionaries.

### Scope hierarchy and the promotion rule

The folder hierarchy mirrors the mega-menu in `src/app/components/Header.tsx`.
Each top-level nav group can have its own scope folder (`solutions/by-industry/`,
`solutions/by-function/` later, `product/` later, etc.) — and within that,
sub-scopes if needed. **Where a primitive lives encodes who is allowed to use
it.**

The rule: **start narrow.** A primitive begins in the smallest scope where
it's used. The moment a *second* nav group needs the same shape, **promote**
it up to `marketing/`. Don't deep-import across scopes (`Product/SomePage` reaching
into `solutions/by-industry/IndustryHero.tsx` is wrong — promote the primitive
first, then import).

| Belongs in `marketing/` | Belongs in a scoped folder |
|---|---|
| Tokens, fonts, animations | Page-family-specific layouts (4-card hero scaffold, 6-card challenges bento, workflow strip, etc.) |
| Generic atoms (`Button`, `Card`, `Section`, `Stat`) | Page-family-specific data structures (e.g., `WorkflowStep[]`, `SolutionItem[]`) that only make sense for that family |
| `<Icon>` registry — anything used across ≥2 nav groups | "Bento grid" / "method grid" structures tuned for the family's rhythm |

---

## 2. Tokens

### 2.1 Colors

| Token | Value | When to use |
|---|---|---|
| `--bz-sage` / `bg-bz-sage` | `#7A826D` | Primary brand. Eyebrow text, icon badges, primary borders on light. |
| `--bz-sage-hover` | `#616857` | Hover state of sage-filled buttons. |
| `--bz-sage-soft` | `rgba(122,130,109,0.10)` | Backgrounds for sage-tinted icon containers, soft pills. |
| `--bz-sage-mid` | `rgba(122,130,109,0.20)` | Slightly stronger tint. |
| `--bz-accent` / `bg-bz-accent` | `#C7FF35` | Lime accent. CTA buttons on dark, "LIVE" pills, key numbers on dark. **One canonical value across the site** — do not also use `#D4F24D`. |
| `--bz-accent-soft` | `rgba(199,255,53,0.10)` | Accent-tinted backgrounds. |
| `--bz-accent-mid` | `rgba(199,255,53,0.20)` | Accent-tinted borders. |
| `--bz-bg` / `bg-bz-bg` | `#F8F9F7` | Page off-white. Default `<Section tone="light">`. |
| `--bz-bg-alt` | `#FBFBFB` | Slight variation when alternating sections. |
| `--bz-surface` / `bg-bz-surface` | `#FFFFFF` | Cards on a light background. `<Section tone="white">`. |
| `--bz-deep` / `bg-bz-deep` | `#1A1D19` | Canonical dark surface. Hero on dark, CTA, careers. |
| `--bz-deep-2` / `bg-bz-deep-2` | `#121212` | Deeper dark for footer or contrast. |
| `--bz-text` / `text-bz-text` | `#333333` | Body and heading on light. |
| `--bz-text-muted` / `text-bz-text-muted` | `#666666` | Description copy, secondary labels. |
| `--bz-text-soft` / `text-bz-text-soft` | `#999999` | Captions, disabled. |
| `--bz-border` / `border-bz-border` | `#E8EAE4` | Default border on light surfaces. |
| `--bz-border-soft` / `border-bz-border-soft` | `#F0F1ED` | Dividers between rows in cards. |

For dark surfaces, prefer Tailwind opacity utilities: `text-white/60`,
`border-white/10`, `bg-white/[0.04]`. These compose better than declaring
new tokens for every alpha level.

### 2.2 Typography

**Font family:** `Inter` (sans-serif). Loaded once in `fonts.css`. Weights
300, 400, 500, 600, 700 are available.

**Scale (CSS custom properties):**

| Token | Value | Use for |
|---|---|---|
| `--bz-text-h1` | `clamp(40px, 5vw, 64px)` | Hero headline (fluid) |
| `--bz-text-h2` | `clamp(30px, 4vw, 48px)` | Section heading |
| `--bz-text-h3` | `22px` | Card title |
| `--bz-text-xl` | `20px` | Large body / lead paragraph |
| `--bz-text-lg` | `17px` | Description copy |
| `--bz-text-base` | `15px` | Body |
| `--bz-text-sm` | `13px` | Meta, secondary labels |
| `--bz-text-eyebrow` | `11px` | Uppercase eyebrow |

Note: `<SectionHeading>` already encodes the canonical heading sizes via
its `level` prop. Use it instead of writing raw `<h1>`/`<h2>` for marketing
sections.

**Tracking (letter-spacing):**
- `--bz-tracking-eyebrow` (`0.12em`) — uppercase eyebrows
- `--bz-tracking-tight` (`-0.02em`) — h2/h3
- `--bz-tracking-tighter` (`-0.03em`) — h1

**Leading:** `1.7` for body copy, `1.1` for headings.

### 2.3 Radii

`--bz-radius-sm` 6, `--bz-radius-md` 8, `--bz-radius-lg` 12,
`--bz-radius-xl` 16, `--bz-radius-2xl` 20, `--bz-radius-pill` 9999.

Tailwind utilities: `rounded-bz-sm`, `rounded-bz-md`, … `rounded-bz-pill`.
**Do not** use Tailwind's default `rounded-md` / `rounded-lg` — they map
to a different scale. Stick to the `bz-` variants.

### 2.4 Spacing

| Token | Value | Use for |
|---|---|---|
| `--bz-section-y` | `96px` | Vertical padding of marketing sections |
| `--bz-section-x` | `24px` | Horizontal page gutter |
| `--bz-container` | `1320px` | Default content max-width |
| `--bz-container-narrow` | `1200px` | Narrower hero/CTA pages |
| `--bz-header-h` | `76px` | Fixed Header height (used by `pad="hero"`) |

`<Section>` and `<Container>` already encode these — use them.

### 2.5 Shadows

`--bz-shadow-card` for default cards, `--bz-shadow-lift` for hover state,
`--bz-shadow-deep` for dashboard/hero floating cards.

**No gradients.** Project rule. Use shadows + flat fills + dot patterns for
depth. If you find a gradient in legacy code, replace it with a flat color
or shadow when migrating.

---

## 3. Primitives

### Container

```tsx
<Container>...</Container>                      // 1320px max
<Container width="narrow">...</Container>       // 1200px max
<Container as="header">...</Container>
```

Provides `mx-auto` + `px-6`. Don't add another wrapper for centering.

### Section

```tsx
<Section tone="light" pad="default">...</Section>     // default: bg-bz-bg, py-24
<Section tone="white">...</Section>                   // bg-bz-surface
<Section tone="dark">...</Section>                    // bg-bz-deep, white text
<Section tone="deeper">...</Section>                  // bg-bz-deep-2
<Section pad="compact">...</Section>                  // py-16
<Section pad="hero">...</Section>                     // pt-[140px], accounts for fixed header
```

### Eyebrow

```tsx
<Eyebrow>Our Culture</Eyebrow>                        // sage by default
<Eyebrow tone="accent">LIVE</Eyebrow>
```

Renders as small uppercase 0.12em-tracked text. Used standalone or inside
`<SectionHeading eyebrow="..." />`.

### SectionHeading

```tsx
<SectionHeading
  eyebrow="Capabilities"
  title="What Bizak does"
  description="One sentence of supporting copy."
  level="h2"          // h1 | h2 | h3
  tone="dark"         // dark | light  (light = on dark backgrounds)
  align="left"        // left | center
  maxWidth={640}      // optional content width clamp
/>
```

`title` accepts JSX so you can do `<>Headline with <span className="text-bz-accent">accent</span>.</>`.

### Button

```tsx
<Button variant="primary">Request Demo</Button>              // dark bg, white text
<Button variant="accent" withArrow>Get started</Button>      // lime, dark text — main CTA
<Button variant="outline">Learn more</Button>                // bordered light
<Button variant="ghost">Cancel</Button>                      // borderless light
<Button variant="ghostDark">Browse</Button>                  // for dark sections

<Button href="/contact">As link</Button>                     // renders <a>
<Button onClick={...}>As button</Button>                     // renders <button>

<Button size="sm">Small</Button>
<Button size="md">Medium</Button>     // default
<Button size="lg">Large</Button>      // hero CTAs
```

### Card

```tsx
<Card>...</Card>                            // tone=light, pad=md
<Card tone="soft">...</Card>                // bg-bz-bg
<Card tone="dark">...</Card>                // for dark sections
<Card pad="lg" hover="lift">...</Card>      // hover lifts +2px with shadow
<Card hover="glow">...</Card>               // hover tints accent
```

### Stat

```tsx
<Stat value="50,000+" label="businesses powered" />
<Stat value="98.2%" label="uptime" tone="light" size="lg" align="center" />
```

### IconBadge

```tsx
<IconBadge tone="sage"><ShieldCheck className="size-5" /></IconBadge>
<IconBadge tone="accent" size="lg"><Zap className="size-6" /></IconBadge>
<IconBadge tone="darkSurface"><Layers className="size-5" /></IconBadge>
```

### PillBadge

```tsx
<PillBadge tone="accent" dot>LIVE</PillBadge>
<PillBadge tone="sage">NEW</PillBadge>
<PillBadge tone="neutral">v2.4</PillBadge>
```

### HeroBadge

```tsx
<HeroBadge>Transition from Chaos to Control</HeroBadge>
```

The eyebrow pill that sits above a hero `<h1>`. Has the brand
accent→sage gradient, soft sage shadow, and tight uppercase tracking.

**Use it instead of `<PillBadge>` whenever the pill sits in a hero**
(directly above an `<h1>`). For non-hero contexts (cards, callouts, status
chips, mid-page section eyebrows), keep using `<PillBadge>` or `<Eyebrow>`.

Pair with `.biz-mesh` on the hero `<section>` — the mesh background and
the badge gradient are the canonical hero treatment together. See
"Canonical hero pattern" below.

### Icon

```tsx
<Icon name="work-order" size={22} strokeWidth={1.8} className="..." style={{...}} />
```

A thin wrapper around `lucide-react` that maps the legacy industry-page
names (`work-order`, `bom`, `mrp`, `floor`, `quality`, `hub`, `cost`, …)
to lucide components. Default `strokeWidth={1.8}` to match the look the
industry pages were drawn against (lucide's default is `2`).

The registry exists for two reasons:
1. **Single source of truth.** Before this, each of the four industry pages
   redeclared its own SVG dictionary — ~25 icons each, with massive overlap.
2. **Data-driven loops.** The `solutions/by-industry/` primitives accept icon
   *names* (strings) inside data arrays (`SolutionItem[]`, `WorkflowStep[]`).

For *new* code that doesn't need either of those properties, prefer importing
the lucide icon directly:

```tsx
import { Factory, ShieldCheck } from "lucide-react";
```

---

## 3.5 Solutions → By Industry primitives

Lives at `src/app/components/solutions/by-industry/`. Used **only** by:
- `ManufacturingPage.tsx` (canonical reference)
- `DistributionPage.tsx`
- `ProfessionalServicePage.tsx`
- `RetailAndEcommercePage.tsx`

A new "By Industry" page should compose these primitives + the global
`marketing/` ones, with content as data arrays.

### IndustryHero

```tsx
<IndustryHero
  eyebrow="Smart Manufacturing Platform"
  title={<>Command the Floor.<br /><span>Master</span> the Output.</>}
  description="..."
  primaryCta={{ label: "Request Demo" }}
  secondaryCta={{ label: "See How It Works" }}
  stats={[{ value: "87.4%", label: "Average OEE" }, { value: "96.2%", label: "On-Time" }]}
  visual={<HeroVisual main={...} inventory={...} globe={...} circle={...} />}
/>
```

Renders the split copy/visual layout, the eyebrow + h1 + sub + CTA row, and
a stats strip. The `visual` slot is page-specific.

### HeroVisual + 4 card sub-primitives

```tsx
<HeroVisual
  main={<HeroMainCard panelTitle="Bizak · Production Control">{children}</HeroMainCard>}
  inventory={<HeroInventoryCard iconName="..." eyebrow="..." value="..." barLabel="..." barValue="..." barPct={92} />}
  globe={<HeroGlobeCard iconName="..." eyebrow="...">{children}</HeroGlobeCard>}
  circle={<HeroCircleCard eyebrow="OEE Rate" value="87%" progressPct={75} />}
/>
```

Provides the 4-card floating scaffold (main glass center + dark inventory
top-right + light globe bottom-left + circular gauge bottom-right) plus the
animated decorative particles + glow. Each sub-card is independently usable
inside `HeroVisual.main` etc.

### Node

```tsx
<Node icon="floor" code="M-01" label="Cutting" value="89%" active={true} />
```

The small icon-tile-with-status used inside `HeroMainCard`. Replaces the
former page-specific `WorkCenterNode` / `ChannelNode` / "team load"
components.

### ChallengesGrid + ChallengeCard

```tsx
<ChallengesGrid
  eyebrow="Challenges"
  title="Manufacturing complexity grows faster than your spreadsheets"
  description="..."
>
  <ChallengeCard icon="downtime" title="Unplanned Downtime" description="...">
    {/* unique data viz for this card */}
  </ChallengeCard>
  // 5 more
</ChallengesGrid>
```

Light section + 6-card bento. The unique data viz inside each card stays
inline because it varies per row — that's the point of the section.

### SolutionGrid

```tsx
<SolutionGrid
  eyebrow="The Solution"
  title="A complete production platform for modern manufacturers"
  items={[{ icon: "work-order", title: "...", desc: "..." }, /* … */]}
/>
```

Pure data. Identical structure across all 4 pages.

### CapabilitiesGrid + CapabilityCard + helpers

```tsx
<CapabilitiesGrid eyebrow="Capabilities" title="...">
  <CapabilityCard span={6} minHeight={260}>{/* full-width card */}</CapabilityCard>
  <CapabilityCard span={3} minHeight={420}>
    <h3>BOM &amp; Routing</h3><p>...</p>
    <MonoTable headers={[...]} rows={[...]} />
  </CapabilityCard>
  <CapabilityCard span={3}>
    <h3>Quality</h3><p>...</p>
    <MethodGrid items={[{ label: "99.1%", sub: "First Pass" }, /* … */]} />
  </CapabilityCard>
  <SimpleFeatureCard span={2} iconName="mrp" title="..." body="..." />
  <SimpleFeatureCard span={2} iconName="floor" title="..." body="..." neon cornerBadge="Live Tracking" />
  <SimpleFeatureCard span={2} iconName="cost"  title="..." body="..." progressPct={91} />
</CapabilitiesGrid>
```

Helpers:
- `<MonoTable headers={...} rows={[{ values, statusColor }]} />` — the
  monospace table inside col-3 cards.
- `<MethodGrid items={[{ label, sub }]} />` — the 3-up "label / sub" grid.
- `<MiniStatBlock value="248" label="Active Orders" secondary={[...]} />` —
  the big stat used inside col-6 cards.
- `<SimpleFeatureCard iconName="..." title="..." body="..." [progressPct]
  [neon] [cornerBadge] />` — the col-2 card with optional neon border,
  corner badge, and bottom progress bar.
- `<FeatureWithMockupCard iconName eyebrow title description features
  mockupHeader mockupBody [mockupBadges] [mockupWidth] [neon] />` — the
  full-width col-6 card with a feature list on the left and a branded
  device-mockup card on the right (used by Professional's Time Tracker
  and Retail's POS Billing). Body of the mockup is a slot.

### InsightsBlock + ChartFrame

```tsx
<InsightsBlock
  eyebrow="Production Intelligence"
  title="Make faster, smarter production decisions."
  description="..."
  bullets={[{ bold: "Real-time OEE Monitoring", rest: " — ..." }, /* … */]}
  chart={<ChartFrame tooltip={{title:"OEE: 87.4% ↑", subtitle:"+3.1% vs last quarter"}}>{/* svg */}</ChartFrame>}
  chartSide="right"   // default. four pages stay consistent at chart-right.
/>
```

`chartSide` defaults to `"right"` — text reads first, chart confirms.
**The four industry pages all use the default**; don't pass `"left"` per
page unless we agree on a deliberate exception.

### WorkflowStrip

```tsx
<WorkflowStrip
  eyebrow="Production Engine"
  title="End-to-End Manufacturing Workflow"
  steps={[{ icon: "bom", label: "Plan" }, /* … */]}
/>
```

Pure data. Dashed-line + 6 step circles.

### IndustryCta

```tsx
<IndustryCta
  title="Run your factory floor with complete precision."
  description="..."
  primaryLabel="Request Demo"   // default
  secondaryLabel="View Pricing" // default
/>
```

Closing CTA section.

---

## 3.6 Canonical hero pattern

Marketing heroes (HomePage, By-Industry, By-Function, product, "Why Bizak", etc.) share two reusable visual primitives. Don't reinvent them per page — they're the visual signature of a Bizak hero.

### Hero background — `.biz-mesh`

A 3-stop radial mesh defined once at `src/styles/style.css`'s `.biz-mesh` rule. Apply it to the hero `<section>`:

```tsx
// Plain section
<section className="biz-mesh ..."> ... </section>

// With the Section primitive (preferred for new pages)
<Section pad="hero" className="biz-mesh"> ... </Section>
```

`<Section tone="light">` sets a flat `bg-bz-bg`; layering `className="biz-mesh"` on top wins because the mesh uses `background-image` (the section's `background-color` shows through where the radial stops fade out — that's the design).

If the mesh needs adjusting (different hue, stronger contrast), edit `.biz-mesh` once. **Do not redeclare radial-gradient stops inline** in a page file.

### Hero pill — `<HeroBadge>`

The eyebrow pill above the hero `<h1>`:

```tsx
import { HeroBadge } from "./marketing";

<HeroBadge>Transition from Chaos to Control</HeroBadge>
<h1 className="...">Still running your business on Excel?</h1>
```

It carries the brand accent→sage gradient, a soft sage shadow, and tight uppercase tracking. **Use it instead of `<PillBadge tone="accent">` whenever the pill is in a hero.** For non-hero contexts (cards, callouts, mid-page eyebrows, status chips), keep using `<PillBadge>` / `<Eyebrow>`.

### Hero spacing baseline

When stacking `HeroBadge → h1 → subhead → buttons`:

- The badge sits **~16px** above the `<h1>` (the gradient pill is loud — big gaps fight it).
- Hero `<section>` top padding is **moderate (~72px)** on top of the 76px header offset, **not** 120px.

If a page has its own legacy `wb-*` / page-prefix hero CSS, drop the inlined gradients and tighten the spacing to this baseline before adding new content.

### When this pattern applies

Any hero — landing pages, top-of-page sections, "above the fold" sections. It does **not** apply to mid-page section headings (those use `<SectionHeading>` + `<Eyebrow>` on a flat `<Section tone="light"|"white"|"dark">`).

### Why these are the only allowed gradients

Project-wide rule is "no gradients" (no decorative `linear-gradient` for cards, dividers, glows, chip backgrounds, etc.). The hero mesh and the hero badge are the **two carve-outs**: they're the visual signature of a Bizak hero, defined once in shared infrastructure (a CSS class + a React primitive), so reuse stays effortless and there's no drift.

---

## 4. Page recipe

```tsx
import { Container, Section, SectionHeading, Card, Button, Stat } from "./marketing";
import { Factory, ShieldCheck, Zap } from "lucide-react";

// 1. Data first (extractable, easy to localize)
const FEATURES = [
  { icon: Factory,     title: "Production",  body: "..." },
  { icon: ShieldCheck, title: "Compliance",  body: "..." },
  { icon: Zap,         title: "Automation",  body: "..." },
];

// 2. Sections as small components
function HeroSection() {
  return (
    <Section tone="dark" pad="hero">
      <Container width="narrow">
        <SectionHeading
          eyebrow="Module"
          title={<>Run finance with <span className="text-bz-accent">clarity</span>.</>}
          description="Streamline ledger to report in one platform."
          level="h1"
          tone="light"
          maxWidth={640}
        />
        <div className="mt-10 flex gap-4 flex-wrap">
          <Button variant="accent" href="/contact" withArrow>Request Demo</Button>
          <Button variant="ghostDark" href="#features">View features</Button>
        </div>
      </Container>
    </Section>
  );
}

function FeaturesSection() {
  return (
    <Section tone="light">
      <Container>
        <SectionHeading
          eyebrow="Capabilities"
          title="Everything you need"
          description="..."
          maxWidth={640}
          className="mb-16"
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {FEATURES.map(({ icon: Icon, title, body }) => (
            <Card key={title} hover="lift">
              <Icon className="size-6 text-bz-sage mb-4" />
              <h3 className="text-[18px] font-bold mb-2">{title}</h3>
              <p className="text-bz-text-muted leading-[1.7]">{body}</p>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}

// 3. Page = composition
export function MyPage() {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
    </>
  );
}
```

---

## 5. Migration checklist (for legacy pages)

When converting a page that still uses inline-style + per-file `const C = {...}`:

1. **Remove `const C = {...}`.** Map every reference to a token equivalent. If a value isn't tokenized yet, add it to `theme.css` first.
2. **Remove non-Inter font references.** No `'Manrope'`, `'Poppins'`, etc. — the site loads Inter only.
3. **Replace `style={{ ... }}` blobs with className.** Inline `style` is reserved for genuinely dynamic values (`width: ${pct}%`). Static values move to className.
4. **Replace `onMouseEnter`/`onMouseLeave` style mutations** with Tailwind `hover:` utilities.
5. **Replace inline `<svg>` icons** with `lucide-react` equivalents where they exist. Keep custom SVG only for genuinely bespoke art.
6. **Replace bespoke `<section style={...}>`** with `<Section tone="..." pad="...">`.
7. **Replace bespoke heading blocks** with `<SectionHeading eyebrow=... title=... description=... />`.
8. **Replace bespoke buttons** with `<Button variant=... />`.
9. **Replace bespoke cards** with `<Card tone=... hover=... />`.
10. **Remove gradients.** Replace `linear-gradient(...)` and `radial-gradient(...)` with flat colors, dot patterns, or shadows.
11. **Verify the build:** `npm run build`. Eyeball the page in dev (`npm run dev`).

---

## 6. When to add a new primitive

Step one is always **scope**. Decide which folder it belongs in:

- **`marketing/`** — the pattern serves *any* marketing page. Tokens, fonts, generic atoms.
- **`solutions/by-industry/`** — the pattern is specific to the rhythm of the 4 "By Industry" pages.
- **A new sibling scope** (e.g., `solutions/by-function/`, `product/core-modules/`) — if the page family has its own rhythm and the existing scopes don't fit.

Then add to that scope if:

- The pattern shows up in **2+ pages** within that scope with the same structure.
- It bundles a meaningful design decision (spacing, type, color combo) you don't want each page to re-decide.
- It would otherwise be copy-pasted JSX.

Don't add a primitive for one-off layouts. A `<div className="grid ...">` inside a page is fine if it only happens once.

When you do add one:

1. Place it in the right scope folder (`marketing/` or `solutions/<group>/<sub-group>/`).
2. Export it from that scope's `index.ts` barrel.
3. Use `cva` for variants if there are >2 options per axis.
4. Document the prop API in this file (Section 3 for global, Section 3.5 for by-industry, future sections for new scopes).
5. Update `/CLAUDE.md` quick-reference if relevant.

### Promotion rule

If a primitive in a scoped folder is needed by a *second* nav group, **promote
it up to `marketing/`** rather than copying or deep-importing across scopes.
Update its prop API to be generic, update both barrels, update both this
doc and `/CLAUDE.md`.

Conversely, if a `marketing/` primitive is only ever used by one page family
(e.g., it was promoted speculatively), demote it back down. The goal is that
each scope contains exactly the primitives that scope's pages need —
no more, no less.

---

## 7. Things still on the todo list

- ~~**By Industry pages — finish the migration.**~~ ✅ Complete. All 4 (Manufacturing, Distribution, ProfessionalService, Retail) now compose the `solutions/by-industry/` primitives. `chartSide="right"` is the consistent default. The promotion rule was applied during migration: `FeatureWithMockupCard` was extracted from the Professional/Retail col-6 capability card.
- Migrate the remaining marketing pages (FinancialManagement, SalesCrm, Inventory, Purchasing, ProjectAndJobCosting, SalesForceManagement, DashboardAndReporting, Integrations, Multicompany, DocumentManagement, WhyBizak, Workflow, Partners, CaseStudies, Blog, About, Contact). Migrate opportunistically when touched.
- The `solutions/by-industry/` primitives currently consume the legacy `biz-*` CSS classes from `src/styles/style.css`. That's intentional for now — the *primary* goal of the by-industry refactor was to eliminate JSX duplication, not to migrate the underlying CSS. A follow-up pass should swap those classes to Tailwind utilities + tokens (or move them to a colocated CSS module). Until then: **do not add new biz-* classes**, but the existing ones are load-bearing and stay.
- Remove `@mui/icons-material` and `@mui/material` from `package.json` once the codebase no longer references them.
- Reconcile the duplicate `/Manufacturing` route registration in `routes.tsx` (both `Manufacturing.tsx` and `ManufacturingPage.tsx` map there). The Header points industry-section users to `/Manufacturing` — that should be `ManufacturingPage` (the by-industry one). Confirm with user before touching.
- The route paths use mixed casing (`/distribution` lowercase but Header links `/Distribution` capitalized; same for `/Retail`, `/ProfessionalService`). React Router 7 paths are case-sensitive — these need to be reconciled. Flag with user.
- Decide whether `src/styles/style.css` should be split into `homepage.module.css` + `by-industry.css` once both are fully migrated to Tailwind.
