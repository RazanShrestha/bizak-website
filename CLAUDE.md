# Bizak Website — Project Instructions

This file is the always-loaded rule set for this repository. Read it before
touching any page, component, or styling.

Three reference docs work together. Load whichever fits the task:

| Doc | Use when |
|---|---|
| **`docs/BIZAK_PRODUCT_OVERVIEW.md`** | You're about to write copy, choose a story, decide what a section *says*, or pick stats. Tells you **what Bizak is** — modules, audience, product narratives, brand voice, copy patterns. **Read this whenever the user asks to "redesign", "design a new page", or "rewrite a section."** |
| **`docs/DESIGN_SYSTEM.md`** | You're choosing primitives, tokens, or layouts. Tells you **what Bizak looks like** — primitive APIs, tokens, scopes, hero pattern. |
| **This file (`CLAUDE.md`)** | Always loaded. The hard rules + the page-design checklist. |

## What this project is

Marketing site for **Bizak ERP** ("The Operating System for Modern Business").
React 18 + Vite 6 + Tailwind 4 + react-router 7. Deploys to GitHub Pages
(`bizakerp.com`). Built originally from a Figma export — the page-by-page
export style is why every page used to redeclare its own colors. **That is no
longer how we work.**

For the full product brief — modules, audience, narratives, brand voice,
canonical statistics — see **`docs/BIZAK_PRODUCT_OVERVIEW.md`**. Read it
before any redesign so the copy, sections and data points reinforce the
product story (and don't drift into generic SaaS).

## The single most important rule

**Do NOT redeclare design tokens in component files.** No more
`const C = { sage: "#7A826D", accent: "#C7FF35", ... }` at the top of a page.
Brand tokens live in **one place**: `src/styles/theme.css`. They are exposed
as both CSS custom properties (`var(--bz-sage)`) and Tailwind utilities
(`bg-bz-sage`, `text-bz-text-muted`, `rounded-bz-lg`).

If a value you need isn't a token yet, **add it to `theme.css` first**, then
use it. Don't shortcut with a hex literal.

## Design system at a glance

The component layer has **two scopes**, and where a primitive lives encodes who is allowed to use it:

| Scope | Location | Used by | Examples |
|---|---|---|---|
| **Global** | `src/app/components/marketing/` | *any* marketing page | `Container`, `Section`, `Eyebrow`, `SectionHeading`, `Button`, `Card`, `Stat`, `IconBadge`, `PillBadge`, `HeroBadge`, `Icon` |
| **Solutions → By Industry** | `src/app/components/solutions/by-industry/` | only the 4 "By Industry" pages (Manufacturing, Distribution, ProfessionalService, Retail) | `IndustryHero`, `HeroVisual` (+ `HeroMainCard` / `HeroInventoryCard` / `HeroGlobeCard` / `HeroCircleCard`), `Node`, `ChallengesGrid` (+ `ChallengeCard`), `SolutionGrid`, `CapabilitiesGrid` (+ `CapabilityCard`, `SimpleFeatureCard`, `MonoTable`, `MethodGrid`, `MiniStatBlock`), `InsightsBlock` (+ `ChartFrame`), `WorkflowStrip`, `IndustryCta` |

The folder hierarchy mirrors `Header.tsx`'s mega-menu hierarchy. When you add a new family of pages (e.g., "Solutions → By Function"), create a new sibling scope folder rather than dumping into `marketing/`.

Other layers:

| Layer | Location | Purpose |
|---|---|---|
| Tokens | `src/styles/theme.css` | colors, type scale, radii, spacing, shadows |
| Fonts | `src/styles/fonts.css` | **Inter only** + Material Symbols (legacy, prefer lucide) |
| shadcn primitives | `src/app/components/ui/` | low-level Radix components (Button, Card, Dialog…) |
| Page CSS | `src/styles/style.css` | homepage-specific bespoke CSS (`hp-*` prefix) **and** the legacy `biz-*` classes that back the by-industry primitives. Do **not** add new pages here |
| Pages | `src/app/components/*.tsx` | composition of primitives + content data |

Import primitives from the right barrel:

```tsx
// any page
import { Section, Container, SectionHeading, Button, Card, Icon } from "./marketing";

// only "By Industry" pages
import {
  IndustryHero, HeroVisual, HeroMainCard, HeroInventoryCard, HeroGlobeCard, HeroCircleCard,
  Node, ChallengesGrid, ChallengeCard, SolutionGrid, CapabilitiesGrid, CapabilityCard,
  SimpleFeatureCard, MonoTable, MethodGrid, MiniStatBlock,
  InsightsBlock, ChartFrame, WorkflowStrip, IndustryCta,
} from "./solutions/by-industry";
```

### Scope promotion rule

A primitive starts in the **narrowest scope** where it's used. The moment a *second* nav group needs the same shape, **promote it up to `marketing/`** — don't duplicate, don't deep-import across scopes.

- Stays scoped: anything that encodes a *page-family-specific layout* (the 4-card hero scaffold, the 6-card challenges bento, the workflow strip — these are the "By Industry" rhythm; another page family would have a different rhythm).
- Belongs global: tokens, fonts, animations, generic primitives (`Container`, `Section`, `Button`, `Card`, `Icon`, `Stat`).

Never deep-import from another scope's folder (`solutions/by-industry/IndustryHero.tsx` from a Product page is wrong). If you need it, promote it.

## Hard rules

1. **One font family: Inter.** It's the only family loaded in `fonts.css`. Do not introduce Manrope, Poppins, Roboto, or anything else without first adding the `@import` to `fonts.css`. References to unloaded fonts silently fall back and create real visual bugs.
2. **One icon library: `lucide-react`** — wrapped by the global `<Icon>` registry at `marketing/Icon.tsx` for legacy-name aliases (`work-order`, `bom`, `mrp`, etc.). Do not redefine an `Icon` component inside a page file. Do not bring in `@mui/icons-material`. Do not use Material Symbols (`<span className="material-symbols-outlined">`) in *new* code. Existing usage in `HomePage.tsx`'s dashboard mockup may stay until rewritten.
3. **No gradients — except the canonical hero treatment.** Don't add decorative `linear-gradient`/`radial-gradient`/`conic-gradient` for cards, sections, dividers, glows, etc. **The one exception is the hero pattern** (see "Canonical hero pattern" below): hero `<section>`s wear `.biz-mesh` (a 3-stop radial mesh defined once in `style.css`) and any hero pill uses the `<HeroBadge>` primitive (which has the brand accent→sage gradient baked in). Reuse those — don't reinvent the gradient inline.
4. **`className` over inline `style`.** Never use `onMouseEnter`/`onMouseLeave` to mutate `e.currentTarget.style` — use Tailwind `hover:` utilities. The only legitimate inline `style` is for **dynamic values that can't be expressed in className** (e.g., a computed `width: ${pct}%` for a progress bar, or `style={{ maxWidth: 560 }}` when the value comes from a prop).
5. **No per-file color objects.** No `const C = {...}` at the top of a page file. Use tokens (`var(--bz-sage)`) or Tailwind utilities (`text-bz-sage`).
6. **Keep page files small.** Pages should be composition + data arrays. If a section grows past ~80 lines of JSX, extract it into a sibling component or a primitive.
7. **No new files in `src/styles/style.css`.** That file is reserved for the homepage's bespoke dashboard/iso/floating-card animations and the legacy `biz-*` classes the by-industry primitives consume. New page-level styles go in component className.
8. **Scope before write.** Before creating a new component, decide which scope it belongs in (global `marketing/` vs scoped `solutions/by-industry/` vs a future `solutions/by-function/` etc.). When in doubt, start narrow — the promotion rule (above) handles the upgrade later.
9. **Delegate to global atoms — don't reinvent.** Whenever any component (a page, a scoped section primitive, *anything*) renders a raw `<button>` / `<a>` / styled `<div>` whose shape mirrors a global primitive (`<Button>`, `<Card>`, `<IconBadge>`, `<PillBadge>`, `<Stat>`, …), it MUST delegate to the global primitive. If the visual shape isn't expressible by an existing variant, **add a variant on the global primitive first**, then delegate — never fork. This is the same promotion logic as rule 8, applied to atoms instead of layouts: a CTA button shouldn't be reinvented inside `IndustryHero`, a card shouldn't be reinvented inside a scoped grid, a stat shouldn't be reinvented inside a hero. *Known debt:* `solutions/by-industry/IndustryHero.tsx` (`HeroCtaButton`) and `solutions/by-industry/IndustryCta.tsx` (`CtaButton`) currently render bespoke `.biz-shimmer-btn` / `.biz-btn-outline` / `.biz-btn-ghost` instead of `<Button>`. The shimmer treatment is the missing variant — when those files get touched, add a `shimmer` variant on `<Button>` and refactor the local wrappers to delegate.
10. **Closing-CTA section uses `tone="dark"`.** The bottom-of-page CTA (the "Take full control of …" / "Run your factory floor with …" moment) must use `<Section tone="dark">` — the olive-tinted `bg-bz-deep` (`#1A1D19`) — **not** `tone="deeper"` (`bg-bz-deep-2` = `#121212` pure black). This matches what the by-industry pages' `IndustryCta` already renders (`.biz-cta-section` → `var(--bz-deep)`). The olive undertone is what lets the lime accent CTA button glow against the surface; pure black flattens it. Action pair: `<Button variant="accent">` + `<Button variant="ghostDark">`. The closing CTA isn't always literally the last section, but **whenever a page has one, it lives on `tone="dark"`**. Full pattern in `docs/BIZAK_PRODUCT_OVERVIEW.md` §7.1.

## Available primitives

### Global — `marketing/`

```tsx
<Container width="default" | "narrow">     // 1320px | 1200px, mx-auto, gutter
<Section tone="light"|"white"|"dark"|"deeper" pad="default"|"compact"|"hero">
<Eyebrow tone="sage"|"accent">             // small uppercase label
<SectionHeading
  eyebrow="Our Culture"
  title="Principles that shape how we work"
  description="..."
  level="h1"|"h2"|"h3"
  tone="dark"|"light"
  align="left"|"center"
  maxWidth={640}
/>
<Button variant="primary"|"accent"|"outline"|"ghost"|"ghostDark"
        size="sm"|"md"|"lg"
        href="..."         // renders <a>; otherwise renders <button>
        withArrow />
<Card tone="light"|"soft"|"dark" pad="sm"|"md"|"lg" hover="none"|"lift"|"glow">
<Stat value="50,000+" label="businesses" tone="dark"|"light" size="sm"|"md"|"lg" align="left"|"center" />
<IconBadge size="sm"|"md"|"lg" tone="sage"|"accent"|"darkSurface"><Icon/></IconBadge>
<PillBadge tone="sage"|"accent"|"neutral"|"live" dot>NEW</PillBadge>
<HeroBadge>Transition from Chaos to Control</HeroBadge>
   // Hero-only pill. Brand accent→sage gradient baked in. Pair with
   // <section className="biz-mesh ..."> (or any hero-mesh section).
   // For non-hero pills use <PillBadge> instead.
<Icon name="work-order" size={22} strokeWidth={1.8} />
   // single SVG registry; wraps lucide-react with legacy aliases
   // (work-order, bom, mrp, floor, quality, hub, …). For *new* code,
   // prefer importing the lucide icon directly. The registry exists so
   // the by-industry pages and any data-driven loops (where the icon
   // is a string in an array) keep working.
```

### Solutions → By Industry — `solutions/by-industry/`

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

<HeroVisual
  main={<HeroMainCard panelTitle="Bizak · Production Control">{/* nodes + rows */}</HeroMainCard>}
  inventory={<HeroInventoryCard iconName="work-order" eyebrow="..." value="248 WO" barLabel="..." barValue="92%" barPct={92} />}
  globe={<HeroGlobeCard iconName="schedule" eyebrow="...">{/* content */}</HeroGlobeCard>}
  circle={<HeroCircleCard eyebrow="OEE Rate" value="87%" progressPct={75} />}
/>

<Node icon="floor" code="M-01" label="Cutting" value="89%" active={true} />

<ChallengesGrid eyebrow="Challenges" title="..." description="...">
  <ChallengeCard icon="downtime" title="..." description="...">
    {/* unique footer viz */}
  </ChallengeCard>
  // …5 more
</ChallengesGrid>

<SolutionGrid
  eyebrow="The Solution"
  title="A complete production platform for modern manufacturers"
  items={[{ icon: "work-order", title: "...", desc: "..." }, /* … */]}
/>

<CapabilitiesGrid eyebrow="Capabilities" title="...">
  <CapabilityCard span={6} minHeight={260}>{/* full-width dashboard */}</CapabilityCard>
  <CapabilityCard span={3} minHeight={420}>
    <h3>BOM &amp; Routing</h3><p>...</p>
    <MonoTable headers={["COMPONENT","QTY","STATE"]} rows={[...]} />
  </CapabilityCard>
  <CapabilityCard span={3}>... <MethodGrid items={[...]} /> </CapabilityCard>
  <SimpleFeatureCard span={2} iconName="mrp" title="..." body="..." />
  <SimpleFeatureCard span={2} iconName="floor" title="..." body="..." neon cornerBadge="Live Tracking" />
  <SimpleFeatureCard span={2} iconName="cost"  title="..." body="..." progressPct={91} />
</CapabilitiesGrid>

<InsightsBlock
  eyebrow="Production Intelligence"
  title="Make faster, smarter production decisions."
  description="..."
  bullets={[{ bold: "Real-time OEE Monitoring", rest: " — ..." }, /* … */]}
  chart={<ChartFrame tooltip={{title:"OEE: 87.4% ↑", subtitle:"+3.1% vs last quarter"}}>{/* svg */}</ChartFrame>}
  chartSide="right"   // default; the four pages stay consistent at chart-right
/>

<WorkflowStrip
  eyebrow="Production Engine"
  title="End-to-End Manufacturing Workflow"
  steps={[{ icon: "bom", label: "Plan" }, /* … */]}
/>

<IndustryCta
  title="Run your factory floor with complete precision."
  description="..."
  primaryLabel="Request Demo"
  secondaryLabel="View Pricing"
/>
```

The canonical reference page using all of these: `src/app/components/ManufacturingPage.tsx`. When migrating Distribution / ProfessionalService / Retail, mirror its structure.

## Canonical hero pattern

Every marketing hero (HomePage, By-Industry, By-Function, product, "Why Bizak", etc.) shares **two reusable visual primitives**. Don't reinvent them per page.

1. **Hero background — `.biz-mesh`.** A 3-stop radial mesh defined once at `src/styles/style.css`'s `.biz-mesh` rule. Apply it on the hero `<section>`:
   ```tsx
   <section className="biz-mesh ..."> ... </section>
   // or with the Section primitive:
   <Section pad="hero" className="biz-mesh"> ... </Section>
   ```
   `<Section tone="light">` sets a flat `bg-bz-bg`; adding `className="biz-mesh"` layers the mesh on top (the mesh wins because it's a `background-image`). Don't redeclare radial-gradient stops inline — if the mesh needs adjusting, edit `.biz-mesh` once.

2. **Hero pill — `<HeroBadge>`.** The eyebrow pill above the hero `<h1>`. It carries the brand accent→sage gradient + soft shadow + tight uppercase tracking. Use it instead of `<PillBadge tone="accent">` *whenever the pill sits above an `<h1>` in a hero*. For non-hero contexts (cards, callouts, status chips), keep using `<PillBadge>`.

   ```tsx
   <HeroBadge>Transition from Chaos to Control</HeroBadge>
   <h1 className="...">Still running your business on Excel?</h1>
   ```

**Hero spacing baseline.** When stacking `HeroBadge → h1 → subhead → buttons`, the badge sits ~16px above the h1 (don't pad it 28px+ — the gradient pill is loud enough that big gaps fight it). Hero `<section>` top padding is moderate (~72px on top of the 76px header offset, not 120px).

**When this rule applies.** Any hero — landing pages, top-of-page sections of marketing pages, "above the fold." It does **not** apply to mid-page section headings (those use `<SectionHeading>` + `<Eyebrow>` on a flat `<Section tone="light"|"white"|"dark">`).

## Anatomy of a marketing page

Every marketing page follows this shape:

```tsx
import { Container, Section, SectionHeading, Card, Button } from "./marketing";
import { Factory, ShieldCheck } from "lucide-react";

const FEATURES = [
  { icon: Factory,     title: "...", body: "..." },
  { icon: ShieldCheck, title: "...", body: "..." },
];

function HeroSection() {
  return (
    <Section tone="dark" pad="hero">
      <Container width="narrow">
        <SectionHeading
          eyebrow="Module"
          title={<>Headline with <span className="text-bz-accent">accent</span>.</>}
          description="..."
          level="h1"
          tone="light"
          maxWidth={640}
        />
        <div className="mt-8 flex gap-4">
          <Button variant="accent" href="/contact" withArrow>Request Demo</Button>
          <Button variant="ghostDark" href="#features">Learn more</Button>
        </div>
      </Container>
    </Section>
  );
}

function FeaturesSection() {
  return (
    <Section tone="light">
      <Container>
        <SectionHeading eyebrow="Capabilities" title="What it does" maxWidth={640} className="mb-16" />
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

export function MyPage() {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
    </>
  );
}
```

## Workflow rules

### Page-design checklist (run this every time you open a page)

Before editing **any** page file, walk through this checklist. If any item is "no", that's part of the work — bring the page into compliance with the items you touch (don't bandaid around them, don't silently leave them inconsistent).

0. **Product context.** Skim `docs/BIZAK_PRODUCT_OVERVIEW.md` (or, if already loaded this session, recall it). Confirm which module / industry / capability this page sits under, which **product narratives** (real-time, single source of truth, no manual coding, audit trail, multi-entity, replaces-spreadsheets) it should lean on, and which **canonical statistics** to reuse so the page reinforces the rest of the site instead of drifting into generic SaaS copy. **Required before any redesign or new page.** Skip only for cosmetic / token-only edits.
1. **Scope.** Open `src/app/components/Header.tsx` and find this page in the `megaMenus` data structure. Which top-level group + sub-heading does it sit under? Does a corresponding scope folder exist (e.g., `solutions/by-industry/`)?
2. **Section primitives.** If the page belongs to a family with a scope folder, is it composing those scoped section primitives (`IndustryHero`, `ChallengesGrid`, etc.)? Or is it duplicating their JSX inline? If duplicated → migrate to the primitives. If a sibling page in the same family has invented a section the primitive doesn't cover yet → promote that pattern into the scope folder before using it.
3. **Global primitives.** Is the page using `marketing/` for atoms (`Container`, `Section`, `SectionHeading`, `Button`, `Card`, `Stat`, `IconBadge`, `PillBadge`, `HeroBadge`, `Eyebrow`)? Hand-rolled wrappers around those shapes are red flags.
3a. **Hero pattern.** If this page has a hero `<section>`, it must use `.biz-mesh` for the background **and** `<HeroBadge>` for the eyebrow pill (not a hand-rolled `<div>` with a custom gradient, not `<PillBadge>`). Hero top padding is moderate (~72px), and the badge sits ~16px above the `<h1>`. See "Canonical hero pattern" above.
4. **Tokens.** No per-file `const C = {...}`, no hex literals (except in genuinely dynamic style props). All colors via `var(--bz-*)` or Tailwind utilities (`text-bz-sage`, `bg-bz-accent`).
5. **Icons.** No per-file `function Icon({ name }) { const icons = {...} }` SVG dictionary. Use the global `<Icon>` from `marketing/Icon.tsx` for data-driven loops; import lucide directly for static usage.
6. **Fonts.** Inter only. No `'Manrope'`, `'Poppins'`, etc.
7. **Animations / motion.** Reuse the global keyframe classes from `style.css` (`biz-pulse-glow`, `biz-float`, `biz-particle`, `biz-flow`, etc.) — don't redeclare keyframes per page.
8. **className over inline `style`.** Static values (colors, padding, fonts) live in className. Inline `style` is reserved for genuinely dynamic values (computed `width: ${pct}%`, prop-derived `maxWidth`). No `onMouseEnter`/`onMouseLeave` style mutations — use Tailwind `hover:`.
9. **Promotion check.** If a JSX pattern in this page also exists in another nav group's pages with the same shape, the pattern belongs in `marketing/`, not duplicated. Promote it.
10. **Delegate-to-atom check.** Walk every `<button>`, `<a>`-styled-as-button, and styled `<div>`/`<span>` in the file. If its shape mirrors a global primitive (`<Button>`, `<Card>`, `<IconBadge>`, `<PillBadge>`, `<Stat>`, `<HeroBadge>`, `<Eyebrow>`), replace it with that primitive. If a needed variant doesn't exist yet (e.g., the by-industry "shimmer" CTA isn't a `<Button>` variant), **add the variant on the global primitive first**, then delegate. This applies equally inside scoped section primitives — `IndustryHero` should compose `<Button>`, not roll its own `HeroCtaButton`.
11. **Closing-CTA tone.** If the page has a closing CTA section (the "Take full control of …" / "Run your factory floor with …" moment, usually right above the footer), it MUST sit on `<Section tone="dark">` — not `tone="deeper"`. Action pair: `<Button variant="accent">` + `<Button variant="ghostDark">`. See hard rule 10 and `docs/BIZAK_PRODUCT_OVERVIEW.md` §7.1.

When in doubt, mirror the canonical reference for the page's family — currently `src/app/components/ManufacturingPage.tsx` for the by-industry family.

### Other workflow rules

- **Touching a page = migrating it.** When you edit a page that fails any checklist item above, fix what you touch. Don't bandaid the legacy pattern.
- **Adding a new section pattern?** First check if a primitive already covers it (in the right scope). If not, decide which scope it belongs in and add the primitive there *before* using it.
- **Verifying changes.** After non-trivial edits, run `npm run build` (Vite's TS check + bundling). The dev server (`npm run dev`) is on port 5173 — start it for visual verification of UI changes.
- **Routing.** Routes are in `src/app/routes.tsx`. There's a known duplicate route registration for `/Manufacturing` (both `Manufacturing.tsx` and `ManufacturingPage.tsx` are imported), and a known case-sensitivity mismatch between Header hrefs (`/Distribution`, `/Retail`, `/ProfessionalService`) and registered routes (lowercase). Flag before touching, don't silently fix.
- **Footer / mega-menu hrefs.** Many are `#` placeholders. Don't replace with guessed URLs — confirm with the user.

## What's outside this design system

- `src/styles/style.css` — the homepage's existing `hp-*` CSS. We've migrated its color literals to tokens (`var(--bz-...)`), but the layout and animations remain class-based. Do not add new `hp-*` classes for new pages.
- `src/app/components/ui/` — shadcn-style primitives. Use them when you need form controls, dialogs, dropdowns. They've been wired through `theme.css` so they inherit our brand colors.
- `src/imports/` — auto-generated SVG path objects from the original Figma export. Treat as legacy; prefer lucide icons for new work.

## Common gotchas

- **Tailwind 4 syntax.** Tokens are defined in `theme.css` via `@theme inline { ... }`, not `tailwind.config.js`. There is no `tailwind.config.js`.
- **Container gutters.** `<Container>` already provides `px-6` and `mx-auto`. Don't double-wrap or re-pad inside it.
- **`<Section pad="hero">`** assumes a fixed Header above with 76px height. If you change header height, update the `--bz-header-h` token, not magic numbers.
- **Dark sections.** When `<Section tone="dark">`, pass `tone="light"` to children that take a tone prop (`SectionHeading`, `Stat`). They default to dark text.

## Memory & docs

Three docs to keep in sync:

- **`docs/BIZAK_PRODUCT_OVERVIEW.md`** — what Bizak *is* (modules, audience, narratives, brand voice, canonical stats, section conventions). The product brief; consulted before any redesign or new page.
- **`docs/DESIGN_SYSTEM.md`** — what Bizak *looks like* (tokens, primitives, scopes, hero pattern). The long-form design reference.
- **This file (`CLAUDE.md`)** — hard rules + the page-design checklist. Always loaded.

The `/redesign-page` skill at `.claude/skills/redesign-page/SKILL.md` is the
canonical workflow when converting a page to the new system; it cross-refs
all three docs above.

When the **product** changes (new module, new positioning, new canonical
statistic) → update `BIZAK_PRODUCT_OVERVIEW.md`. When the **design system**
changes → update both this file and `DESIGN_SYSTEM.md`. Keep them in sync.
