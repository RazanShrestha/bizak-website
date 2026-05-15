# Bizak Website Project Instructions

This file is the always-loaded rule set for this repository. Read it before
touching any page, component, or styling.

Three reference docs work together. Load whichever fits the task:

| Doc | Use when |
|---|---|
| **`docs/BIZAK_PRODUCT_OVERVIEW.md`** | You're about to write copy, choose a story, decide what a section *says*, or pick stats. Tells you **what Bizak is** modules, audience, product narratives, brand voice, copy patterns. **Read this whenever the user asks to "redesign", "design a new page", or "rewrite a section."** |
| **`docs/DESIGN_SYSTEM.md`** | You're choosing primitives, tokens, or layouts. Tells you **what Bizak looks like** primitive APIs, tokens, scopes, hero pattern. |
| **This file (`CLAUDE.md`)** | Always loaded. The hard rules + the page-design checklist + the migration plan. |

## What this project is

Marketing site for **Bizak ERP** ("The Operating System for Modern Business").
React 18 + Vite 6 + Tailwind 4 + react-router 7. Deploys to GitHub Pages
(`bizakerp.com`).

The site is **mid-rebrand**: legacy pages still use the old sage/lime/charcoal
palette + the `marketing/` primitive library (Container, Section, Button,
HeroCentered, etc.). The new direction paper cream + olive + lime
(`#d3f969`) + pistachio, with alternating section backgrounds landed on
the HomePage, Header, and Footer in the most recent change.

**The new primitive library lives in `src/app/components/bz/`** (matches
the `.bz-*` CSS class prefix). All new pages import from `bz/`. The old
`marketing/` folder stays untouched until Phase 4. **Future sessions: use
`bz/` for everything new. Never add to `marketing/`.**

The migration plan to bring every page onto the new system is in
§"Migration plan" below.

For the full product brief modules, audience, narratives, brand voice,
canonical statistics see **`docs/BIZAK_PRODUCT_OVERVIEW.md`**. Read it
before any redesign so the copy, sections and data points reinforce the
product story (and don't drift into generic SaaS).

## The single most important rule

**Do NOT redeclare design tokens in component files, and do NOT add a second
`:root` block in `style.css`.** Brand tokens live in **one place**:
`src/styles/theme.css`. They are exposed as both CSS custom properties
(`var(--bz-paper)`) and Tailwind utilities (`bg-bz-paper`, `text-bz-fire`,
`rounded-bz-2xl`).

If a value you need isn't a token yet, **add it to `theme.css` first**, then
use it. Don't shortcut with a hex literal. Don't create a parallel
`const C = {...}` in a page file. Don't open a `:root { … }` block anywhere
outside `theme.css`.

## Design tokens (new palette)

The current canonical palette what every new component should use.
Legacy `--bz-sage` / `--bz-accent` / `--bz-bg` aliases still resolve, but
they point to the new values; prefer the descriptive names.

| Token | Value | Use |
|---|---|---|
| `--bz-paper` | `#FCFCF7` | Primary page bg (light). |
| `--bz-paper-warm` | `#F4F4ED` | Slightly warmer cream cards on paper. |
| `--bz-section-a` | `#FCFCF7` (= paper) | Alternating section bg, tone A. |
| `--bz-section-b` | `#efefe9` | Alternating section bg, tone B. Pages alternate A/B/A/B/… between sections this is the new visual rhythm. |
| `--bz-surface` | `#FFFFFF` | Elevated card on light. |
| `--bz-olive` | `#1A2D20` | Dark olive surface `tone="dark"` sections, hero canvas, dark bento. |
| `--bz-olive-soft` | `#243A2D` | Lighter olive variant. |
| `--bz-olive-dark` | `#0A100D` | Footer chrome deepest olive. |
| `--bz-deep` | `#0F1411` | Pill-dark button fill. |
| `--bz-fire` | `#d3f969` | **Lime accent single canonical pop colour.** |
| `--bz-fire-soft` / `--bz-fire-mid` | rgba(211,249,105,0.10/.20) | Tinted fire backgrounds/borders. |
| `--bz-leaf` | `#DBE9B8` | Soft pistachio secondary accent. |
| `--bz-leaf-deep` | `#A8C76C` | Pistachio deep. |
| `--bz-text` | `#1A1D19` | Body and heading on light. |
| `--bz-text-muted` | `#6E7466` | Description copy, secondary labels. |
| `--bz-text-soft` | `#A2A296` | Muted heading spans (e.g., `<H2.Muted>`). |
| `--bz-text-on-dark` | `#FCFCF7` | Body on dark. |
| `--bz-text-on-dark-muted` | `rgba(252,252,247,0.62)` | Muted on dark. |
| `--bz-line` | `#D8D9D3` | Primary divider on light. |
| `--bz-line-soft` | `#E5E5E0` | Soft divider. |

Type scale:

| Token | Value |
|---|---|
| `--bz-text-h1` | `clamp(32px, 4.5vw, 56px)` |
| `--bz-text-h2` | `clamp(26px, 3.4vw, 36px)` |
| `--bz-text-h3` | `clamp(20px, 2.6vw, 28px)` |
| Body / labels | 13–17px from `--bz-text-sm/base/lg` |

Spacing:

| Token | Value |
|---|---|
| `--bz-section-y` | `140px` desktop / `110px` tablet / `80px` mobile |
| `--bz-section-y-tight` | `96px` |
| `--bz-container` | `1320px` |
| `--bz-container-narrow` | `1200px` |
| `--bz-hero-gap` | `78px` desktop / `48px` mobile gap between the hero CTA pill row and the visual/mock immediately below it. Consumed by `.bz-hero-canvas` and `.bz-hero-visual` so every hero page shares one measurement. **Never hardcode this gap as `mt-10` / `mt-16` / `mt-[48px] md:mt-[78px]` on a mock wrapper use the class** (see §"Hero spacing convention"). |
| `--bz-header-h` | `76px` **LEGACY**. Header is no longer `position: fixed`. Do not add `paddingTop: 76` shims to new pages, and strip any you find when touching a page. |

Radii: `--bz-radius-sm` 6, `--bz-radius-md` 10, `--bz-radius-lg` 12,
`--bz-radius-xl` 18, `--bz-radius-2xl` 22, `--bz-radius-3xl` 28, pill 9999.

## Hard rules

1. **One font family: Inter end-to-end, no exceptions.** It's the only family loaded in `fonts.css`. No Hedvig, no Manrope, no Poppins, no `font-mono`/`font-family: monospace`. Inter inherits from `<body>` and must reach every leaf (IDs, SKUs, step numbers, code-like identifiers all stay Inter; differentiate with letter-spacing, weight, or color tint, not a font swap). The CSS variables `--bz-heading-font` and `--bz-body-font` both resolve to Inter and exist only for backward compat with inline `style={{fontFamily: "var(--bz-…)"}}` references; new code should not reference them.
2. **One icon library: `lucide-react`.** For new code, import lucide icons directly. The legacy `<Icon name>` registry in `marketing/Icon.tsx` is only for data-driven loops in legacy pages. Do not redefine an `Icon` component inside a page. Do not import `@mui/icons-material`. Do not add `<span className="material-symbols-outlined">` in new code.
3. **No gradients. Period.** The previous "gradient carve-out for `.biz-mesh`" is **retired** the new hero pattern is a flat paper-cream surface with a `<DotGrid>` overlay (or a flat olive `<HeroCanvas>`), not a radial mesh. No `linear-gradient` / `radial-gradient` / `conic-gradient` anywhere for cards, buttons, glows, dividers, badges, hero backgrounds, anything.
4. **`className` over inline `style`.** Never use `onMouseEnter`/`onMouseLeave` to mutate `e.currentTarget.style` use Tailwind `hover:` utilities or `:hover` rules on `.bz-*` classes. The only legitimate inline `style` is a *dynamic* value that can't be expressed in className (computed `width: ${pct}%`, prop-derived `maxWidth`). **Inline `style={{fontFamily, padding, margin, display, gridTemplateColumns, color, background}}` for static values is a code smell extract to a primitive or a className.**
5. **No per-file color objects.** No `const C = {...}` at the top of a page file. Use tokens (`var(--bz-fire)`) or Tailwind utilities (`text-bz-fire`).
6. **Keep page files small.** Pages should be composition + data arrays. If a section grows past ~80 lines of JSX, extract it into a primitive. The end-state for a page is ~150–300 lines: imports, data arrays, section composition.
7. **No new files/styles in `src/styles/style.css`.** That file is currently the paint layer for the `.bz-*` primitives and the legacy `hp-*` / `biz-*` classes. Once a primitive wraps a `.bz-*` rule, leave the CSS alone new visual behavior goes in the primitive's component file (Tailwind `className`) or a new `.bz-*` class consumed by exactly one primitive.
8. **Scope before write.** Before creating a new component, decide which scope it belongs in. New global primitives go in **`bz/`** (the canonical folder). Scoped section primitives (e.g., for the 4 industry pages, currently in `solutions/by-industry/`) stay scoped until a second nav group needs them, then promote up to `bz/`. **Never add new files to `marketing/`** that folder is being retired in Phase 4.
9. **Delegate to atoms don't reinvent.** Any raw `<button>` / `<a>` / styled `<div>` whose shape mirrors a primitive MUST delegate to that primitive. If the visual shape isn't expressible by an existing variant, *add a variant on the primitive first*, then delegate never fork. The `.bz-pill *` and `.bz-bento *` CSS classes are the paint of the future `<Pill>` and `<Bento>` primitives; once those primitives ship, raw `className="bz-pill bz-pill-dark"` on an `<a>` is a code smell wrap it.
10. **Closing-CTA section lives in `<Footer cta={…}>`, not in the page.** The bottom-of-page CTA (the "Take full control of …" moment) is rendered by `<Footer>` via its `cta?: FooterCta` prop. Pages override the default by passing a `cta` prop from their `*PageLayout` in `routes.tsx`. Do NOT add a separate `<Section tone="dark">` closing-CTA block above `<Footer>`. The `FooterCta` interface is in `src/app/components/Footer.tsx`. See `docs/BIZAK_PRODUCT_OVERVIEW.md` §7.1.
11. **Header is no longer `position: fixed`.** It sits in normal document flow on a `bz-section-b` strip at the top of the page. Do NOT add `paddingTop: 76`, `pt-[76px]`, `mt-[76px]`, or any offset compensating for a fixed header those are legacy shims from before this change. When you touch a page that has one, strip it in the same change. Grep for `paddingTop: 76|pt-\[76`.
12. **Sections alternate between two paper tones.** The new visual rhythm is bg-bz-section-a / bg-bz-section-b / bg-bz-section-a / bg-bz-section-b / … between consecutive content sections, with `tone="dark"` (olive) used sparingly for showcase blocks. The `<Section>` primitive (when rebuilt in Phase 1) will encode this automatically; until then, set explicitly.
13. **Every layout must be mobile-responsive AND mobile-beautiful.** Two distinct bars both mandatory:

    **(a) Structural correctness.** Pages must look correct from 375px through desktop without horizontal scroll. Every `grid-cols-N` (N ≥ 2) needs a `grid-cols-1` mobile fallback. No fixed pixel heights on hero panels. Decorative sidebars `hidden md:flex`. Connectivity sections stack on mobile.

    **(b) Mobile design quality.** A page that *technically* fits 375px but feels cramped, bulky, or busy on mobile is a **failed redesign**, not a passing one. The desktop and mobile views are two distinct designs of the same content the mobile view earns its own design pass. The principles:

    - **Density drops on mobile.** Cards that sit side-by-side on desktop stack vertically and become *taller and looser* on mobile bigger padding inside, more line-height on body, more space between items. Don't just shrink the desktop card; re-tune it for the wider single-column.
    - **Padding scales down at the wrapper, scales up inside cards.** Section/container outer padding shrinks on mobile (`px-4 md:px-6 lg:px-8`), but card *inner* padding usually stays generous (`p-5 md:p-6`) a stacked card with cramped internals looks worst of all.
    - **Hide what only earned its place on desktop.** Decorative side-cards, secondary metric tiles, "extra row" mocks, large hero illustrations if they only existed because the desktop column was wide, drop them on mobile (`hidden md:block`) rather than letting them shrink into a thumbnail.
    - **Mocks simplify, not just shrink.** A 4-tile bento mock that fills a hero panel on desktop should reduce to 2 tiles (or 1 hero tile + a single summary line) on mobile `hidden md:grid` the extras. A complex chart/visual that loses meaning at 320px wide should be replaced with a simpler representation, not crushed.
    - **Type scale is already responsive at the token level** (`--bz-text-h1` / `--bz-text-h2` are `clamp(...)`s) don't override on mobile unless the existing scale genuinely breaks the layout.
    - **One column on mobile means more breathing room, not more content.** Resist the temptation to fill the now-empty horizontal space with extra elements. Empty space is the design.
    - **Test the feel, not just the fit.** When you finish a page, mentally walk a 375px viewport top-to-bottom: does any section feel bulky? cramped? bzy? If yes, fix it before reporting done even if `npm run build` passes and there's no horizontal scroll.

    See "Mobile responsiveness" in `.claude/skills/redesign-page/SKILL.md` for the full cheatsheet (structural patterns + the mobile design-quality checklist).
14. **Every `*PageLayout` in `routes.tsx` MUST have `className="bz-page"` on its outer `<div>`.** That class lives in `src/styles/style.css` and carries `overflow-x: clip` + `text-wrap: balance` the project's canonical mobile-overflow guard. Without it, long `.bz-h1` / `.bz-h2` titles and any wide nested viz produce a few-px horizontal scroll on 375px viewports, even when every section looks correct in isolation. `HomeLayout` and `FinancialManagementPageLayout` are the reference. When you migrate a page, set `className="bz-page"` on its `*PageLayout` in the same change. Symptom that points to a missing `bz-page`: "small horizontal scroll on mobile" reported on a page whose individual sections all look responsive.
15. **CTAs use the 4 canonical labels no other label on a conversion `<Pill>`.** The site funnels every visitor through the same four CTAs. Pick the one whose href fits the destination; do not invent variants like "Book a Demo", "Start free trial", "See it live", "Talk to operations", "Browse connectors", etc. The 4 canonical labels are: **Get Started** (self-register), **Request Demo** (`/contact`), **Free Trial** (self-register, used when the page leads with the trial-first story), **Talk to Sales** (`/contact`, lower-funnel direct contact). Navigational pills that scroll within a page (e.g. `href="#open-roles"`) may keep descriptive labels they're not conversion CTAs. See §"CTA conventions" below for the full variant + arrow mapping.
16. **Every `<Pill>` must carry exactly one arrow.** External hrefs (`https://system.bizakerp.com/*`) → `withArrowUpRight` (↗). Internal hrefs (`/contact`, `/<page>`, `#anchor`) → `withArrow` (→). A `<Pill>` with neither is a bug. The `<Pill>` primitive only exposes these two arrow props the legacy `withTick`, `iconLeft`, `iconRight` props were removed; do not pass them.
17. **Adjacent `<Pill>` pairs go inside `<PillGroup>`.** Pages used to wrap two pills in `<div className="flex flex-wrap justify-center gap-[10px]">` or in a `<>…</>` fragment for `SectionHead actions`. Both patterns are replaced by `<PillGroup>` a CSS-grid wrapper that gives both pills equal width (the wider label drives both), caps at 440px on desktop, and fills the container on mobile so both stay on one row. **Solo pills** (a single Pill in a `<StepCard>` / `<BigCard>` / `<Bento>` cta slot, or a standalone navigational pill) are NOT wrapped in PillGroup.
18. **Closing-CTA labels in `<Footer cta={…}>` use the canonical pair: `primaryLabel="Get Started"` + `secondaryLabel="Request Demo"`** (or `Free Trial` + `Request Demo` if the page leads with the trial story). The `*PageLayout` in `routes.tsx` sets these. See `docs/BIZAK_PRODUCT_OVERVIEW.md` §7.1 for the closing-CTA spec.
19. **The gap between the hero CTA pills and the visual/mock below them is a TOKEN, not a per-page magic number.** Pages used to set it ad-hoc as `mt-10`, `mt-14`, `mt-16`, `mt-12 md:mt-16`, `mt-[48px] md:mt-[78px]`, etc. all replaced. The canonical pattern is now: `<HeroCanvas>` (which already encodes the gap via `.bz-hero-canvas`) for olive-canvas heroes, OR `<div className="bz-hero-visual">…</div>` for page-specific paper-surface mocks. Both classes read from `--bz-hero-gap` / `--bz-hero-gap-mobile` in `theme.css` (78px / 48px) change the gap site-wide by editing those tokens. **Never write a fresh `mt-*` on the mock wrapper inside `<Section pad="hero">`.** When you touch a hero page, grep its hero for `mt-(10|12|14|16|\[\d+px\])` on the wrapper div directly below `</PillGroup>` and substitute `bz-hero-visual` in the same change.

## CTA conventions the 4 canonical labels

Every conversion CTA on every page maps to exactly one of these four labels. **Do not invent new labels.** When you find a label that doesn't match (e.g. "Book a Demo", "Start free trial", "See it live", "Talk to operations", "Browse connectors", "Visit help center", "Talk to support"), substitute it per the table below in the same change.

| Label | Destination | Variant on light surface | Variant on dark surface | Arrow |
|---|---|---|---|---|
| **Get Started** | `https://system.bizakerp.com/account/self-register` | `dark` | `accent` | `withArrowUpRight` |
| **Free Trial** | `https://system.bizakerp.com/account/self-register` | `dark` | `accent` | `withArrowUpRight` |
| **Request Demo** | `/contact` | `light` | `ghostDark` (secondary) / `accent` (primary on dark) | `withArrow` |
| **Talk to Sales** | `/contact` | `light` | `ghostDark` | `withArrow` |

**The standard hero pair** = `Get Started` (dark, ↗, self-register) + `Request Demo` (light, →, /contact), wrapped in `<PillGroup>`. Use this pair on every page's hero unless the page genuinely leads with the trial story (in which case the primary is `Free Trial` instead of `Get Started`).

**Label substitution table** (apply on sight whenever you touch a page):

| Old label | New label | Notes |
|---|---|---|
| "Book a Demo" / "Book a demo" / "Request a Demo" / "Request demo" | "Request Demo" | always |
| "Start free trial" / "Start Free Trial" | "Free Trial" | always |
| "See it live" | "Get Started" if href = self-register, else "Request Demo" if href = `/contact` | check the href |
| "See it in action" | "Request Demo" | force href to `/contact` |
| "Talk to practice team" / "Talk to support" / "Talk to operations" / "Talk to ops" / "Talk to an integration engineer" / "Talk to sales team" | "Talk to Sales" | always |
| "Browse connectors" / "Visit help center" / "View features" / "Explore purchasing" | "Request Demo" (force href to `/contact`) or "Get Started" (if the page is clearly self-serve) | use judgement |

**Forbidden Pill props.** The primitive only accepts `variant`, `size="sm|md"`, `href`, `withArrow`, `withArrowUpRight`, and standard HTML attributes. **Do NOT pass** `withTick`, `iconLeft`, `iconRight`, or `size="lg"` they were removed from the type when the CTA system was canonicalised. If you grep the codebase and find any of these, strip them in the same change.

**PillGroup wrapping.** Adjacent pill pairs whether in the hero CTA row or in a `<SectionHead actions={…}>` go inside `<PillGroup>`:

```tsx
<PillGroup>
  <Pill variant="dark" withArrowUpRight href="https://system.bizakerp.com/account/self-register">Get Started</Pill>
  <Pill variant="light" withArrow href="/contact">Request Demo</Pill>
</PillGroup>

// inside a SectionHead
<SectionHead
  …
  actions={
    <PillGroup>
      <Pill variant="dark" withArrowUpRight href="https://system.bizakerp.com/account/self-register">Get Started</Pill>
      <Pill variant="light" withArrow href="/contact">Request Demo</Pill>
    </PillGroup>
  }
/>
```

Solo pills (single Pill in a `<StepCard cta=…>`, `<BigCard cta=…>`, `<Bento.Cta>`, or a single standalone nav pill) are **NOT** wrapped in PillGroup leave them bare. The grid wrapper only makes sense for pairs.

## Migration plan the path from legacy to the new system

The site is being migrated in five phases. **Where we are: Phase 2 done, Phase 3 is next.**

| Phase | What | Status |
|---|---|---|
| 0 | Foundation: tokens reconciled in `theme.css`, Hedvig removed, docs updated. | ✅ Done. |
| 1 | Build the primitive library in `bz/`. | ✅ Done 28 primitives shipped (see "Available primitives" below). |
| 2 | Refactor the staged HomePage onto the new primitives. | ✅ Done `HomePage.tsx` is the canonical reference. Routes' `HomeLayout` renders Header + HomePage + Footer. |
| 3 | Migrate every other page onto the new primitives, one PR per page, in megaMenu order. | ⏳ **Next.** Start with `FinancialManagementPage` (already has `cta` override). |
| 4 | Retire legacy: `hp-*` and `biz-*` classes in `style.css`, the entire `marketing/` folder, `src/imports/svg-*.ts`, `@mui/*` deps, `--bz-sage*` aliases. | Pending. |

## Available primitives (Phase 1 shipped)

Every recurring shape from the HomePage is now a React primitive in `src/app/components/bz/`. Pages compose primitives + data no inline `style={{}}` for static values, no `onMouseEnter`/`onMouseLeave` mutations, no media-query `<style>{…}</style>` strings, no per-file `function Container` / `function Pill` forks.

```tsx
import {
  Section, Container, SectionHead, BentoGrid, Bento, Pill, Heading,
  BadgeGreen, HeroCanvas, HeroCard, StepCard, Marquee, Carousel, Accordion,
} from "../bz";
```

**Never import from `marketing/` in new code.** That folder is the legacy generation; it will be deleted in Phase 4.

### Atoms

- **`<Pill variant="dark|light|ghost|ghostDark|accent|leaf" size="sm|md" href? withArrow? withArrowUpRight?>`** paint comes from `.bz-pill *` CSS classes. Exactly one arrow prop is mandatory: internal hrefs use `withArrow` (→), external hrefs (`system.bizakerp.com`) use `withArrowUpRight` (↗). The legacy `withTick`, `iconLeft`, `iconRight`, and `size="lg"` props were removed see §"CTA conventions" above for the canonical label + variant + arrow mapping.
- **`<PillGroup>{two Pills}</PillGroup>`** CSS-grid wrapper that gives both pills equal width (wider label drives both), caps at 440px on desktop, fills the container on mobile so both stay on one row. Use for every adjacent `<Pill>` pair (hero CTA row, `SectionHead actions`, dark closing-CTA card on the home FAQ). **Do not** wrap solo pills (single Pill in `<StepCard cta=…>` / `<BigCard cta=…>` / `<Bento.Cta>` or a standalone nav pill).
- **`<Eyebrow index?="01" tone?="light">How it works</Eyebrow>`** replaces inline `[01] HOW IT WORKS` rendering; `tone="light"` for use on dark surfaces.
- **`<Heading level={1|2|3}>`** with `<Heading.Muted>` for the second-colour spans.
- **`<BadgeGreen>Now Live, Globally 🎉</BadgeGreen>`** the pistachio confetti pill used in the hero badge slot.
- **`<Flag>🇺🇸</Flag>`** small flag chip.
- **`<StatusChip variant="live|posted|neutral">`** the small status pills inside hero/bento cards.
- **`<StripeBar pct={44}/>`** progress bar.
- **`<Tick/>`** the green check used in bullet lists / step cards.
- **`<DotGrid tone="dark|light"/>`** `position: absolute; inset: 0` 1px grid overlay used inside dark surfaces.

### Card shells

- **`<Bento tone="dark|fire|leaf|paper" hover? dotGrid? span?>`** compound: `<Bento.Header title icon/>`, `<Bento.Desc>`, `<Bento.Cta>`, `<Bento.Footer>`. The most-used primitive.
- **`<BigCard text={{title,body,bullets,cta}} visual={…}/>`** 2-column dark card with text + visual halves (multi-entity consolidation pattern).
- **`<StepCard number tag title bullets cta visual/>`** 2-column step card with copy on one side + visual on the other.
- **`<HeroCard icon title badge eyebrow value>{footer}</HeroCard>`** the small floating card inside `<HeroCanvas>`.

### Layout

- **`<Section tone="a|b|dark|paper" pad="default|tight|hero|none">`** pages alternate `tone="a"` and `tone="b"` between consecutive content sections. `tone="dark"` for showcase blocks. `pad="hero"` = flat 56px/96px to match the hero spec.
- **`<Container width="default|narrow">`** 1320 / 1200.
- **`<HeroCanvas>`** dark olive panel with grid overlay; holds `<HeroCard>`s. Automatically applies `var(--bz-hero-gap)` as margin-top, so the gap below the hero CTA pills is always tokenised do not wrap it in another `mt-*` container.
- **`.bz-hero-visual`** (CSS utility not a React primitive) apply on the wrapper `<div>` of a page-specific hero mock that is NOT a `<HeroCanvas>`. Encodes the same `var(--bz-hero-gap)` / `var(--bz-hero-gap-mobile)` margin-top so paper-surface hero mocks share the olive-canvas spacing. Replaces all the ad-hoc `mt-10` / `mt-14` / `mt-16` / `mt-[48px] md:mt-[78px]` patterns that used to live on hero mock wrappers. See §"Hero spacing convention" for the canonical Options A / B.
- **`<SectionHead index label title description? actions? tone? titleMaxWidth? spacing?>`** opening row of every section: eyebrow + h2 + optional CTA pair on the right.
- **`<BentoGrid cols={2|3|4|12} gap?>`** auto-responsive grid; owns its own breakpoints (no `<style>{@media …}</style>` per page).

### Patterns

- **`<Marquee speed pauseOnHover tone>`** logo strip / banks-row.
- **`<Carousel autoAdvance render>`** testimonial slider with prev/next + dots; keyboard + ARIA built in.
- **`<Accordion>`** with `<Accordion.Item question>` FAQ pattern.
- **`<FlagsRow prefix suffix flags/>`** "Available in 120+ countries" pill row.

### Micro-viz (used inside card footers / step visuals)

- **`<DataRow label value emphasis? tone?/>`** recurring "label / value" rows.
- **`<MiniBars values highlightLast? tone? height?/>`** small bar chart in HeroCard footers.
- **`<EntityRow flag name amount tone?/>`** multi-entity rows.
- **`<JournalRow txn debit credit tone?/>`** auto-posting journal entry rows.
- **`<ModuleListItem active? tone?>`** sidebar nav row (used in PlatformDashboard).
- **`<StatTile value desc tone?/>`** big-number + descriptive-text card (testimonials side-panel, impact metrics).

**Every page becomes composition + data.** Adding a new module page should be ~250–400 lines of TSX. Changing the bento hover effect = one CSS rule in `style.css`. That's the contract.

## The `tone` prop convention

All primitives that accept `tone` use the **same mental model**: `tone` describes the **SURFACE the element sits on**, not its text colour.

- `tone="light"` (default) = the element sits on a light surface → renders with dark text / paint
- `tone="dark"` = the element sits on a dark surface → renders with paper text / paint

This applies to `Section`, `Heading`, `Eyebrow`, `SectionHead`, `DataRow`, `EntityRow`, `JournalRow`, `MiniBars`, `ModuleListItem`, `StatTile`, `StripeBar`, `Marquee`. **The legacy `marketing/` convention was the opposite** (tone="light" meant "for use on dark surfaces"); ignore that `bz/` is surface-tone.

## Hero spacing convention (use inline `style` for badge → title → buttons)

The hero stack `<BadgeGreen>` → `<Heading>` → CTA row uses **inline `style={{ marginBottom: N }}`** for the vertical gaps, not Tailwind `mb-*` utilities. This is a deliberate carve-out because:

1. `.bz-h1` and `.bz-h2` paint classes set `margin: 0`; their cascade priority can defeat Tailwind margin utilities in unexpected ways (mixed `@layer utilities` vs unlayered, `twMerge` interactions with custom classes, etc.).
2. Inline `style` always wins. For the *exact* hero rhythm to match across pages without surprises, use it for these three measurements only.

Canonical hero rhythm:

```tsx
<BadgeGreen style={{ marginBottom: 28 }}>Now Live, Globally 🎉</BadgeGreen>
<Heading level={2} style={{ marginBottom: 36 }}>
  The operating system for modern business,{" "}
  <Heading.Muted>handling finance and ops in one place.</Heading.Muted>
</Heading>
<PillGroup>
  <Pill variant="dark" withArrowUpRight href="https://system.bizakerp.com/account/self-register">Get Started</Pill>
  <Pill variant="light" withArrow href="/contact">Request Demo</Pill>
</PillGroup>
```

- Badge → title: `marginBottom: 28`
- Title → buttons: `marginBottom: 36`
- Buttons → visual/mock below: **owned by a token, not by inline `style` or `mt-*`.** Use `<HeroCanvas>` (which already applies the gap via `.bz-hero-canvas`) for olive-canvas heroes, or wrap the page-specific mock in `<div className="bz-hero-visual">…</div>` for paper-surface heroes. Both classes read `--bz-hero-gap` / `--bz-hero-gap-mobile` from `theme.css` (78px desktop / 48px mobile). Tweak the gap site-wide by editing the token never per page.
- Section padding: `pad="hero"` (56px top / 96px bottom, flat)
- CTA pair: the canonical hero pair is **Get Started + Request Demo** (see §"CTA conventions") wrapped in `<PillGroup>`. The PillGroup gives both pills equal width and centres them on the hero canvas never use a raw `<div className="flex flex-wrap justify-center gap-[10px]">` for hero pills any more.

**Hero mock width:** The mock panel / card group below the CTAs must fill the full `<Container>` width. Never put `max-w-xl`, `max-w-2xl`, `max-w-3xl`, or `mx-auto max-w-*` on the mock's outer wrapper `<div>`. Only internal sub-elements may carry explicit widths. A full-width mock looks intentional and fills the canvas; a constrained one feels like a centred widget dropped into the hero.

**Hero mock wrapper canonical pattern.** Whatever mock sits directly below `</PillGroup>` inside `<Section pad="hero">` follows one of these two shapes:

```tsx
// Option A olive canvas with floating cards (HomePage, Manufacturing, …)
<HeroCanvas>
  <HeroCard … />
  <HeroCard … />
</HeroCanvas>

// Option B page-specific mock on the paper surface (FinancialManagement, Workflow, …)
<div className="bz-hero-visual mx-auto w-full max-w-[1140px] …">
  <PageSpecificMock />
</div>
```

Both encode the gap from `--bz-hero-gap`. **Do NOT write** `mt-10`, `mt-14`, `mt-16`, `mt-[48px] md:mt-[78px]`, or any other ad-hoc top-margin on the wrapper those are migration debt. When you encounter one on a page you're touching, swap it for `bz-hero-visual` in the same change (and confirm the page isn't already using `<HeroCanvas>`, which already owns the gap).

This is the **only place** inline `style` for static spacing is sanctioned. Mid-page sections, bentos, etc. use `BentoGrid` / `SectionHead` / `Section pad` / built-in primitive spacing no inline styles there.

## Anatomy of a marketing page

`src/app/components/HomePage.tsx` is **one valid composition** the
reference for how primitives fit together, not a template every other
page must mirror.

What every page must share **the design language**:

- The palette, tokens and Inter type scale from `theme.css`.
- The `bz/` primitive vocabulary (`Section`, `Container`, `SectionHead`, `Pill`, `Heading`, `Bento`, etc.) composition over forks.
- Alternating `tone="a"` / `tone="b"` between consecutive content sections; dark sections sparingly.
- The hero *shell* `<Section tone="b" pad="hero">` + centered `<BadgeGreen>` + `<Heading>` + two `<Pill>` CTAs, optionally with `<HeroCanvas>` below.
- Closing-CTA owned by `<Footer cta={…}>` never a page-level dark CTA section.
- Clean, minimalistic, no gradients, single lime accent per surface.

What every page may vary **the design choices**:

- Which sections the page has, in what order, and what each section *is* (bento grid, step card row, custom dashboard mock, streaming-data panel, something invented for this page).
- The page-specific mocks inside the hero and showcase blocks these should feel **invented for this page**, not copied from HomePage or another module.
- Which canonical narratives (`docs/BIZAK_PRODUCT_OVERVIEW.md` §4) and stats (§5.4) the page leans on.

**Rule of thumb:** if two redesigned pages feel like the same page with
different copy, the structure is too rigid invent the next one
differently. The design *language* is the constant; the design
*choices* are the variable.

**Concrete anti-patterns (do not repeat):**

*Section-list clone* `src/app/components/FinancialManagement.tsx` and
`src/app/components/SalesCrm.tsx` were both migrated and ended up with
the **same six section function names in the same order**
`HeroSection`, `FoundationsSection`, `TechnicalShowcaseSection`,
`ReportingSection`, `ConnectivitySection`, `MetricsSection` with
content swapped (multi-entity → pipeline-intelligence, financial-control
→ smart-followups, etc.). Two different products, one identical page
shape.

*Hero-mock clone* `SalesCrm.tsx`'s hero is a literal label-swap of
the *original* HomePage hero: `<HeroCanvas>` wrapping **two
`<HeroCard>`s** with identical prop shapes (`icon`/`title`/`badge`/
`badgeVariant`/`eyebrow`/`value` + `<DataRow>` + `<MiniBars>` footer).
"Live ledger" → "Live pipeline", "Invoice INV-2046" → "Sales Order
SO-1041". Same shape, swapped strings. **The hero mock the visual
below badge/heading/pills must be invented per page.** `<HeroCard>`
is one option among many; `<HeroCanvas>` is optional too. Valid
alternatives include: a single big feature mock, a 3-card row with
distinct shapes, a vertical streaming feed, a before/after split, a
process-flow diagram, a map, a document mock, or no mock at all. See
`.claude/skills/redesign-page/SKILL.md` "Hero mock" section for the
full taken-mock register and the alternatives list.

When redesigning a page, do not look at the most-recently-redesigned
page and re-use its section function names, section order, or
section types. Look at the *legacy file* of the page you're redesigning,
understand what the page is actually selling, and design *its* sections
for *its* story. The primitive vocabulary is shared; the sentences
written with that vocabulary should not be.

Reference composition (HomePage's shape useful as a starting point):

```tsx
import {
  Section, Container, SectionHead, Bento, BentoGrid, Pill, PillGroup, Heading,
  HeroCard, HeroCanvas, BadgeGreen, Marquee, StepCard,
} from "./bz";
import { Layers, ShieldCheck } from "lucide-react";

const FEATURES = [
  { icon: Layers,      title: "One ledger",  desc: "…" },
  { icon: ShieldCheck, title: "Audit trail", desc: "…" },
];

function HeroSection() {
  return (
    <Section tone="b" pad="hero">
      <Container>
        <div className="flex flex-col items-center text-center">
          <BadgeGreen style={{ marginBottom: 28 }}>Now Live, Globally 🎉</BadgeGreen>
          <Heading level={2} style={{ marginBottom: 36 }}>
            The operating system for modern business,{" "}
            <Heading.Muted>finance and ops in one place.</Heading.Muted>
          </Heading>
          <PillGroup>
            <Pill variant="dark" withArrowUpRight href="https://system.bizakerp.com/account/self-register">Get Started</Pill>
            <Pill variant="light" withArrow href="/contact">Request Demo</Pill>
          </PillGroup>
        </div>
        <HeroCanvas>
          <HeroCard icon={<Activity/>} title="Live ledger" badge="Live" value="$1,242,180"/>
          <HeroCard icon={<Receipt/>} title="Invoice INV-2046" value="$12,400.00"/>
        </HeroCanvas>
      </Container>
    </Section>
  );
}

function FeaturesSection() {
  return (
    <Section tone="a">
      <Container>
        <SectionHead index="01" label="How it works" title={<>Replace spreadsheets, <Heading.Muted>run smoothly.</Heading.Muted></>} />
        <BentoGrid cols={3}>
          {FEATURES.map(({icon: Icon, title, desc}) => (
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
      <Header/>
      <HeroSection/>
      <FeaturesSection/>
      <Footer cta={{title: "…", primaryLabel: "Start", secondaryLabel: "Book demo"}}/>
    </div>
  );
}
```

The pattern is: each page is composition. Decisions about colour, spacing, type, hover state all live in the primitives. **One change to a primitive changes every page.**

## Workflow rules

### Page-design checklist (run this every time you open a page)

Before editing **any** page file, walk through this checklist. If any item is "no", that's part of the work bring the page into compliance with the items you touch (don't bandaid around them, don't silently leave them inconsistent).

0. **Product context.** Skim `docs/BIZAK_PRODUCT_OVERVIEW.md`. Confirm which module / industry / capability this page sits under, which product narratives it should lean on, and which canonical statistics to reuse. Skip only for cosmetic / token-only edits.
1. **Scope.** Open `src/app/components/Header.tsx` and find this page in the `megaMenus` data structure. Which top-level group + sub-heading does it sit under?
2. **Primitives.** Is the page composing the new primitives (`Section`, `Container`, `SectionHead`, `Pill`, `Bento`, `BentoGrid`, `Heading`, `HeroCanvas`, `HeroCard`, `StepCard`, `Carousel`, `Accordion`, `Marquee`)? Or is it duplicating their JSX inline? Inline duplication = migration work.
3. **Tokens.** No per-file `const C = {...}`, no hex literals (except in genuinely dynamic style props). All colors via `var(--bz-fire)` / `var(--bz-paper)` / etc. or Tailwind utilities (`text-bz-fire`, `bg-bz-paper`).
4. **Icons.** No per-file SVG dictionary. Use `lucide-react` directly for new code; use the global `<Icon name>` only for legacy data-driven loops.
5. **Fonts.** Inter only end-to-end, including monospace. References to `'Manrope'`, `'Poppins'`, `'Hedvig …'`, `font-mono`, `font-family: monospace` are all bugs. If you find any in a file you're touching, strip them in the same change.
6. **No `<style>{`@media …`}</style>` blocks inside pages.** Responsive logic lives in the primitive that owns the layout. If you find one, it means a primitive is missing extract it.
7. **className over inline `style`.** Static values in className. Inline `style` only for truly dynamic values. No `onMouseEnter`/`onMouseLeave` style mutations use `hover:` utilities or `:hover` on the primitive's CSS class.
8. **Closing-CTA pattern.** Page does NOT render its own dark CTA section above the footer it passes a `cta={...}` prop to `<Footer>` in `routes.tsx`. See `routes.tsx`'s `FinancialManagementPageLayout` for the reference.
9. **Header offset shim.** Grep `paddingTop: 76|pt-\[76` inside the page file AND its layout in `routes.tsx`. Both must be zero. The header is no longer fixed.
10. **Section alternation.** Consecutive content sections alternate between `tone="a"` and `tone="b"`. Dark sections (`tone="dark"`) are sparing and intentional.
11. **CTAs.** Every `<Pill>` uses one of the 4 canonical labels (Get Started / Free Trial / Request Demo / Talk to Sales see §"CTA conventions"); has exactly one arrow (`withArrowUpRight` for external, `withArrow` for internal); has no `withTick`/`iconLeft`/`iconRight`/`size="lg"` props (they were removed). Adjacent Pill pairs are wrapped in `<PillGroup>`. Solo pills in `cta=…` slots are left bare.
12. **Hero mock gap.** The wrapper `<div>` immediately below `</PillGroup>` inside `<Section pad="hero">` must be either a `<HeroCanvas>` or a `<div className="bz-hero-visual">`. Both encode `var(--bz-hero-gap)` (78px / 48px mobile) from `theme.css`. Grep the hero for any `mt-(10|12|14|16|\[\d+px\])` on the mock wrapper substitute `bz-hero-visual` in the same change. Pages that have no mock below the buttons are fine and need no class.
13. **Mobile responsiveness AND mobile design quality.** Two checks, both mandatory:
    - **(a) Structural.** Every grid, flex row, fixed width, and hero visual works at 375px without horizontal scroll.
    - **(b) Design quality.** Mentally walk the page at 375px top-to-bottom. Does any section feel cramped, bulky, or busy? Common culprits: a 4-tile dashboard mock crushed into a tiny hero panel; a 2-col card grid with 3 metrics each visible at once; a side-by-side text+visual block where the visual barely renders; tight inner card padding that worked on desktop but suffocates a stacked column. Fix by simplifying the mobile view (`hidden md:grid` extras, increase inner padding on stacked cards, replace complex viz with a simpler summary). The mobile view is its own design pass not just the desktop view at smaller width.
    - See `.claude/skills/redesign-page/SKILL.md` for the structural patterns + the design-quality cheatsheet.

### Other workflow rules

- **Touching a page = migrating it.** When you edit a page that fails any checklist item, fix what you touch.
- **Adding a new section pattern?** First check if a primitive already covers it. If not, decide the scope and add the primitive *before* using it.
- **Verifying changes.** After non-trivial edits, run `npm run build` (Vite's TS check + bundling). The dev server (`npm run dev`) is on port 5173 start it for visual verification.
- **Routing.** Routes are in `src/app/routes.tsx`. Each page route uses a `*PageLayout` wrapper that renders `<Header>`, the page, and `<Footer cta={...}>`. Pages should NOT render their own `<Header>` / `<Footer>` (the HomePage currently does it'll be normalized in Phase 2).
- **Footer / mega-menu hrefs.** Many are `#` placeholders. Don't replace with guessed URLs confirm with the user.

## What's outside this design system

- `src/styles/style.css` the paint layer. Contains: the new `.bz-*` classes (Phase 0+), the homepage's legacy `hp-*` classes (Phase 4 to retire), the by-industry `biz-*` classes (Phase 4 to retire). Do not add new page-level CSS here; new visual logic goes in a primitive.
- `src/app/components/ui/` shadcn primitives. Use them when you need form controls, dialogs, dropdowns.
- `src/imports/` auto-generated SVG paths from the original Figma export. Treat as legacy; prefer lucide.
- `src/app/components/bz/` **the canonical primitive library.** All new pages import from here. See its `README.md` for the catalogue.
- `src/app/components/marketing/` **legacy primitive library.** Old generation (`Container`, `Section`, `SectionHeading`, `Button`, `Card`, `HeroCentered`, `HeroSplit`, `HeroPanel`, `Eyebrow`, `IconBadge`, `PillBadge`, `HeroBadge`, `Icon`, `Stat`). Kept un-touched so un-migrated legacy pages keep rendering. **Do not add new files here.** Slated for deletion in Phase 4.
- `src/app/components/solutions/by-industry/` scoped primitives for the 4 industry pages. Will be re-pointed at the new global primitives in Phase 3.

## Common gotchas

- **Tailwind 4 syntax.** Tokens are defined in `theme.css` via `@theme inline { ... }`, not `tailwind.config.js`. There is no `tailwind.config.js`.
- **Container gutters.** `<Container>` provides `mx-auto`. The new `<Section>` primitive will own horizontal padding via `bz-section`; don't add a second wrapper.
- **Dark sections.** When using a dark surface, prefer the new tokens: `bg-bz-olive` for `tone="dark"` sections; `bg-bz-olive-dark` for footer chrome; `var(--bz-deep)` for pill-dark button fill. The legacy `--bz-deep-2` (#121212) is deprecated.
- **Header non-fixed.** The Header now sits in the document flow. Pages do not need `paddingTop` to offset it. Any legacy `paddingTop: 76` shim in a page file or `routes.tsx` `*PageLayout` is a bug to remove.

## Memory & docs

Three docs to keep in sync:

- **`docs/BIZAK_PRODUCT_OVERVIEW.md`** what Bizak *is* (modules, audience, narratives, brand voice, canonical stats, section conventions).
- **`docs/DESIGN_SYSTEM.md`** what Bizak *looks like* (tokens, primitives, scopes, hero pattern, alternating section bg).
- **This file (`CLAUDE.md`)** hard rules + page-design checklist + migration plan. Always loaded.

The `/redesign-page` skill at `.claude/skills/redesign-page/SKILL.md` is the canonical workflow when converting a page; it cross-refs all three.

When the **product** changes (new module, new positioning, new canonical statistic) → update `BIZAK_PRODUCT_OVERVIEW.md`. When the **design system** changes (token, primitive API, hero pattern) → update both this file and `DESIGN_SYSTEM.md`. Keep them in sync.
