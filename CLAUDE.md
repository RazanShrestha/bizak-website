# Bizak Website — Project Instructions

This file is the always-loaded rule set for this repository. Read it before
touching any page, component, or styling.

Three reference docs work together. Load whichever fits the task:

| Doc | Use when |
|---|---|
| **`docs/BIZAK_PRODUCT_OVERVIEW.md`** | You're about to write copy, choose a story, decide what a section *says*, or pick stats. Tells you **what Bizak is** — modules, audience, product narratives, brand voice, copy patterns. **Read this whenever the user asks to "redesign", "design a new page", or "rewrite a section."** |
| **`docs/DESIGN_SYSTEM.md`** | You're choosing primitives, tokens, or layouts. Tells you **what Bizak looks like** — primitive APIs, tokens, scopes, hero pattern. |
| **This file (`CLAUDE.md`)** | Always loaded. The hard rules + the page-design checklist + the migration plan. |

## What this project is

Marketing site for **Bizak ERP** ("The Operating System for Modern Business").
React 18 + Vite 6 + Tailwind 4 + react-router 7. Deploys to GitHub Pages
(`bizakerp.com`).

The site is **mid-rebrand**: legacy pages still use the old sage/lime/charcoal
palette + the `marketing/` primitive library (Container, Section, Button,
HeroCentered, etc.). The new direction — paper cream + olive + lime
(`#d3f969`) + pistachio, with alternating section backgrounds — landed on
the HomePage, Header, and Footer in the most recent change.

**The new primitive library lives in `src/app/components/bz/`** (matches
the `.bz-*` CSS class prefix). All new pages import from `bz/`. The old
`marketing/` folder stays untouched until Phase 4. **Future sessions: use
`bz/` for everything new. Never add to `marketing/`.**

The migration plan to bring every page onto the new system is in
§"Migration plan" below.

For the full product brief — modules, audience, narratives, brand voice,
canonical statistics — see **`docs/BIZAK_PRODUCT_OVERVIEW.md`**. Read it
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

The current canonical palette — what every new component should use.
Legacy `--bz-sage` / `--bz-accent` / `--bz-bg` aliases still resolve, but
they point to the new values; prefer the descriptive names.

| Token | Value | Use |
|---|---|---|
| `--bz-paper` | `#FCFCF7` | Primary page bg (light). |
| `--bz-paper-warm` | `#F4F4ED` | Slightly warmer cream — cards on paper. |
| `--bz-section-a` | `#FCFCF7` (= paper) | Alternating section bg, tone A. |
| `--bz-section-b` | `#efefe9` | Alternating section bg, tone B. Pages alternate A/B/A/B/… between sections — this is the new visual rhythm. |
| `--bz-surface` | `#FFFFFF` | Elevated card on light. |
| `--bz-olive` | `#1A2D20` | Dark olive surface — `tone="dark"` sections, hero canvas, dark bento. |
| `--bz-olive-soft` | `#243A2D` | Lighter olive variant. |
| `--bz-olive-dark` | `#0A100D` | Footer chrome — deepest olive. |
| `--bz-deep` | `#0F1411` | Pill-dark button fill. |
| `--bz-fire` | `#d3f969` | **Lime accent — single canonical pop colour.** |
| `--bz-fire-soft` / `--bz-fire-mid` | rgba(211,249,105,0.10/.20) | Tinted fire backgrounds/borders. |
| `--bz-leaf` | `#DBE9B8` | Soft pistachio — secondary accent. |
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
| `--bz-header-h` | `76px` — **LEGACY**. Header is no longer `position: fixed`. Do not add `paddingTop: 76` shims to new pages, and strip any you find when touching a page. |

Radii: `--bz-radius-sm` 6, `--bz-radius-md` 10, `--bz-radius-lg` 12,
`--bz-radius-xl` 18, `--bz-radius-2xl` 22, `--bz-radius-3xl` 28, pill 9999.

## Hard rules

1. **One font family: Inter — end-to-end, no exceptions.** It's the only family loaded in `fonts.css`. No Hedvig, no Manrope, no Poppins, no `font-mono`/`font-family: monospace`. Inter inherits from `<body>` and must reach every leaf (IDs, SKUs, step numbers, code-like identifiers — all stay Inter; differentiate with letter-spacing, weight, or color tint, not a font swap). The CSS variables `--bz-heading-font` and `--bz-body-font` both resolve to Inter and exist only for backward compat with inline `style={{fontFamily: "var(--bz-…)"}}` references; new code should not reference them.
2. **One icon library: `lucide-react`.** For new code, import lucide icons directly. The legacy `<Icon name>` registry in `marketing/Icon.tsx` is only for data-driven loops in legacy pages. Do not redefine an `Icon` component inside a page. Do not import `@mui/icons-material`. Do not add `<span className="material-symbols-outlined">` in new code.
3. **No gradients. Period.** The previous "gradient carve-out for `.biz-mesh`" is **retired** — the new hero pattern is a flat paper-cream surface with a `<DotGrid>` overlay (or a flat olive `<HeroCanvas>`), not a radial mesh. No `linear-gradient` / `radial-gradient` / `conic-gradient` anywhere — for cards, buttons, glows, dividers, badges, hero backgrounds, anything.
4. **`className` over inline `style`.** Never use `onMouseEnter`/`onMouseLeave` to mutate `e.currentTarget.style` — use Tailwind `hover:` utilities or `:hover` rules on `.bz-*` classes. The only legitimate inline `style` is a *dynamic* value that can't be expressed in className (computed `width: ${pct}%`, prop-derived `maxWidth`). **Inline `style={{fontFamily, padding, margin, display, gridTemplateColumns, color, background}}` for static values is a code smell — extract to a primitive or a className.**
5. **No per-file color objects.** No `const C = {...}` at the top of a page file. Use tokens (`var(--bz-fire)`) or Tailwind utilities (`text-bz-fire`).
6. **Keep page files small.** Pages should be composition + data arrays. If a section grows past ~80 lines of JSX, extract it into a primitive. The end-state for a page is ~150–300 lines: imports, data arrays, section composition.
7. **No new files/styles in `src/styles/style.css`.** That file is currently the paint layer for the `.bz-*` primitives and the legacy `hp-*` / `biz-*` classes. Once a primitive wraps a `.bz-*` rule, leave the CSS alone — new visual behavior goes in the primitive's component file (Tailwind `className`) or a new `.bz-*` class consumed by exactly one primitive.
8. **Scope before write.** Before creating a new component, decide which scope it belongs in. New global primitives go in **`bz/`** (the canonical folder). Scoped section primitives (e.g., for the 4 industry pages, currently in `solutions/by-industry/`) stay scoped until a second nav group needs them, then promote up to `bz/`. **Never add new files to `marketing/`** — that folder is being retired in Phase 4.
9. **Delegate to atoms — don't reinvent.** Any raw `<button>` / `<a>` / styled `<div>` whose shape mirrors a primitive MUST delegate to that primitive. If the visual shape isn't expressible by an existing variant, *add a variant on the primitive first*, then delegate — never fork. The `.bz-pill *` and `.bz-bento *` CSS classes are the paint of the future `<Pill>` and `<Bento>` primitives; once those primitives ship, raw `className="bz-pill bz-pill-dark"` on an `<a>` is a code smell — wrap it.
10. **Closing-CTA section lives in `<Footer cta={…}>`, not in the page.** The bottom-of-page CTA (the "Take full control of …" moment) is rendered by `<Footer>` via its `cta?: FooterCta` prop. Pages override the default by passing a `cta` prop from their `*PageLayout` in `routes.tsx`. Do NOT add a separate `<Section tone="dark">` closing-CTA block above `<Footer>`. The `FooterCta` interface is in `src/app/components/Footer.tsx`. See `docs/BIZAK_PRODUCT_OVERVIEW.md` §7.1.
11. **Header is no longer `position: fixed`.** It sits in normal document flow on a `bz-section-b` strip at the top of the page. Do NOT add `paddingTop: 76`, `pt-[76px]`, `mt-[76px]`, or any offset compensating for a fixed header — those are legacy shims from before this change. When you touch a page that has one, strip it in the same change. Grep for `paddingTop: 76|pt-\[76`.
12. **Sections alternate between two paper tones.** The new visual rhythm is bg-bz-section-a / bg-bz-section-b / bg-bz-section-a / bg-bz-section-b / … between consecutive content sections, with `tone="dark"` (olive) used sparingly for showcase blocks. The `<Section>` primitive (when rebuilt in Phase 1) will encode this automatically; until then, set explicitly.
13. **Every layout must be mobile-responsive.** All pages must look correct from 375px through desktop without horizontal scroll. Every `grid-cols-N` (N ≥ 2) needs a `grid-cols-1` mobile fallback. No fixed pixel heights on hero panels. Decorative sidebars `hidden md:flex`. Connectivity sections stack on mobile. See "Mobile responsiveness" in `.claude/skills/redesign-page/SKILL.md` for the full cheatsheet.

## Migration plan — the path from legacy to the new system

The site is being migrated in five phases. **Where we are right now: Phase 0 is in progress / just completed.**

| Phase | What | Status |
|---|---|---|
| 0 | Foundation: token reconciliation in `theme.css`, Hedvig removed, docs updated. | ✅ Phase 0 lands the foundation. After this PR, future Claude sessions read the new palette and primitive plan from the docs. |
| 1 | Build the primitive library in `bz/` (see §"Planned primitive library" below). | In progress. |
| 2 | Refactor the staged HomePage onto the new primitives — proves the system works, becomes the canonical reference. | Pending. |
| 3 | Migrate every other page onto the new primitives, one PR per page, in megaMenu order. | Pending. |
| 4 | Retire legacy: `hp-*` and `biz-*` classes in `style.css`, the entire `marketing/` folder (all old primitives), `src/imports/svg-*.ts`, `@mui/*` deps. | Pending. |

## Planned primitive library (Phase 1)

Every recurring shape in the staged HomePage becomes a React primitive in `src/app/components/bz/`. The contract: pages compose primitives with data + slot children. No inline `style={{}}` for static values; no `onMouseEnter`/`onMouseLeave` mutations; no media-query `<style>{…}</style>` strings.

```tsx
import {
  Section, Container, SectionHead, BentoGrid, Bento, Pill, Heading,
  BadgeGreen, HeroCanvas, HeroCard, StepCard, Marquee, Carousel, Accordion,
} from "../bz";
```

**Never import from `marketing/` in new code.** That folder is the legacy generation; it will be deleted in Phase 4.

### Atoms

- **`<Pill variant="dark|light|ghost|ghostDark|accent|leaf" size="sm|md|lg" href? withTick? withArrow? iconLeft? iconRight?>`** — paint comes from `.bz-pill *` CSS classes.
- **`<Eyebrow index?="01" tone?="light">How it works</Eyebrow>`** — replaces inline `[01] HOW IT WORKS` rendering; `tone="light"` for use on dark surfaces.
- **`<Heading level={1|2|3}>`** with `<Heading.Muted>` for the second-colour spans.
- **`<BadgeGreen>Now Live, Globally 🎉</BadgeGreen>`** — the pistachio confetti pill used in the hero badge slot.
- **`<Flag>🇺🇸</Flag>`** — small flag chip.
- **`<StatusChip variant="live|posted|neutral">`** — the small status pills inside hero/bento cards.
- **`<StripeBar pct={44}/>`** — progress bar.
- **`<Tick/>`** — the green check used in bullet lists / step cards.
- **`<DotGrid tone="dark|light"/>`** — `position: absolute; inset: 0` 1px grid overlay used inside dark surfaces.

### Card shells

- **`<Bento tone="dark|fire|leaf|paper" hover? dotGrid? span?>`** — compound: `<Bento.Header title icon/>`, `<Bento.Desc>`, `<Bento.Cta>`, `<Bento.Footer>`. The most-used primitive.
- **`<BigCard text={{title,body,bullets,cta}} visual={…}/>`** — 2-column dark card with text + visual halves (multi-entity consolidation pattern).
- **`<StepCard number tag title bullets cta visual/>`** — 2-column step card with copy on one side + visual on the other.
- **`<HeroCard icon title badge eyebrow value>{footer}</HeroCard>`** — the small floating card inside `<HeroCanvas>`.

### Layout

- **`<Section tone="a|b|dark" pad="default|tight">`** — automatic alternation: pass `tone="a"` or `tone="b"` explicitly, or let a `<SectionGroup>` parent alternate. Encodes the section-y padding from `theme.css`.
- **`<Container width="default|narrow">`** — 1320 / 1200.
- **`<HeroCanvas>`** — dark olive panel with grid overlay; holds `<HeroCard>`s.
- **`<SectionHead index label title titleMuted actions/>`** — opening row of every section: eyebrow + h2 + optional CTA pair.
- **`<BentoGrid cols={2|3|4}>`** — auto-responsive grid; owns its own breakpoints (no `<style>{@media …}</style>` per page).

### Patterns

- **`<Marquee speed pauseOnHover tone>`** — logo strip / banks-row.
- **`<Carousel autoAdvance render>`** — testimonial slider with prev/next + dots; keyboard + ARIA built in.
- **`<Accordion>`** with `<Accordion.Item question>` — FAQ pattern.
- **`<FlagsRow prefix suffix flags/>`** — "Available in 120+ countries" pill row.

### Micro-viz (used inside card footers / step visuals)

- **`<DataRow label value/>`** — recurring "label / value" rows.
- **`<MiniBars values highlightLast/>`** — small bar chart in HeroCard footers.
- **`<EntityRow flag name amount/>`** — multi-entity rows.
- **`<JournalRow txn debit credit/>`** — auto-posting journal entry rows.
- **`<ModuleListItem active>`** — PlatformDashboard sidebar item.

Once these primitives ship, **every page becomes composition + data**. Adding a new module page should be ~200 lines of TSX. Changing the bento hover effect should be one CSS rule in `style.css`. That's the contract.

## Anatomy of a marketing page (after Phase 1)

```tsx
import {
  Section, Container, SectionHead, Bento, BentoGrid, Pill, Heading,
  HeroCard, HeroCanvas, BadgeGreen, Marquee, StepCard,
} from "./marketing";
import { Layers, ShieldCheck } from "lucide-react";

const FEATURES = [
  { icon: Layers,      title: "One ledger",  desc: "…" },
  { icon: ShieldCheck, title: "Audit trail", desc: "…" },
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

The pattern is: each page is composition. Decisions about colour, spacing, type, hover state — all live in the primitives. **One change to a primitive changes every page.**

## Workflow rules

### Page-design checklist (run this every time you open a page)

Before editing **any** page file, walk through this checklist. If any item is "no", that's part of the work — bring the page into compliance with the items you touch (don't bandaid around them, don't silently leave them inconsistent).

0. **Product context.** Skim `docs/BIZAK_PRODUCT_OVERVIEW.md`. Confirm which module / industry / capability this page sits under, which product narratives it should lean on, and which canonical statistics to reuse. Skip only for cosmetic / token-only edits.
1. **Scope.** Open `src/app/components/Header.tsx` and find this page in the `megaMenus` data structure. Which top-level group + sub-heading does it sit under?
2. **Primitives.** Is the page composing the new primitives (`Section`, `Container`, `SectionHead`, `Pill`, `Bento`, `BentoGrid`, `Heading`, `HeroCanvas`, `HeroCard`, `StepCard`, `Carousel`, `Accordion`, `Marquee`)? Or is it duplicating their JSX inline? Inline duplication = migration work.
3. **Tokens.** No per-file `const C = {...}`, no hex literals (except in genuinely dynamic style props). All colors via `var(--bz-fire)` / `var(--bz-paper)` / etc. or Tailwind utilities (`text-bz-fire`, `bg-bz-paper`).
4. **Icons.** No per-file SVG dictionary. Use `lucide-react` directly for new code; use the global `<Icon name>` only for legacy data-driven loops.
5. **Fonts.** Inter only — end-to-end, including monospace. References to `'Manrope'`, `'Poppins'`, `'Hedvig …'`, `font-mono`, `font-family: monospace` are all bugs. If you find any in a file you're touching, strip them in the same change.
6. **No `<style>{`@media …`}</style>` blocks inside pages.** Responsive logic lives in the primitive that owns the layout. If you find one, it means a primitive is missing — extract it.
7. **className over inline `style`.** Static values in className. Inline `style` only for truly dynamic values. No `onMouseEnter`/`onMouseLeave` style mutations — use `hover:` utilities or `:hover` on the primitive's CSS class.
8. **Closing-CTA pattern.** Page does NOT render its own dark CTA section above the footer — it passes a `cta={...}` prop to `<Footer>` in `routes.tsx`. See `routes.tsx`'s `FinancialManagementPageLayout` for the reference.
9. **Header offset shim.** Grep `paddingTop: 76|pt-\[76` inside the page file AND its layout in `routes.tsx`. Both must be zero. The header is no longer fixed.
10. **Section alternation.** Consecutive content sections alternate between `tone="a"` and `tone="b"`. Dark sections (`tone="dark"`) are sparing and intentional.
11. **Mobile responsiveness.** Every grid, flex row, fixed width, and hero visual works at 375px without horizontal scroll. See `.claude/skills/redesign-page/SKILL.md` for the full cheatsheet.

### Other workflow rules

- **Touching a page = migrating it.** When you edit a page that fails any checklist item, fix what you touch.
- **Adding a new section pattern?** First check if a primitive already covers it. If not, decide the scope and add the primitive *before* using it.
- **Verifying changes.** After non-trivial edits, run `npm run build` (Vite's TS check + bundling). The dev server (`npm run dev`) is on port 5173 — start it for visual verification.
- **Routing.** Routes are in `src/app/routes.tsx`. Each page route uses a `*PageLayout` wrapper that renders `<Header>`, the page, and `<Footer cta={...}>`. Pages should NOT render their own `<Header>` / `<Footer>` (the HomePage currently does — it'll be normalized in Phase 2).
- **Footer / mega-menu hrefs.** Many are `#` placeholders. Don't replace with guessed URLs — confirm with the user.

## What's outside this design system

- `src/styles/style.css` — the paint layer. Contains: the new `.bz-*` classes (Phase 0+), the homepage's legacy `hp-*` classes (Phase 4 to retire), the by-industry `biz-*` classes (Phase 4 to retire). Do not add new page-level CSS here; new visual logic goes in a primitive.
- `src/app/components/ui/` — shadcn primitives. Use them when you need form controls, dialogs, dropdowns.
- `src/imports/` — auto-generated SVG paths from the original Figma export. Treat as legacy; prefer lucide.
- `src/app/components/bz/` — **the canonical primitive library.** All new pages import from here. See its `README.md` for the catalogue.
- `src/app/components/marketing/` — **legacy primitive library.** Old generation (`Container`, `Section`, `SectionHeading`, `Button`, `Card`, `HeroCentered`, `HeroSplit`, `HeroPanel`, `Eyebrow`, `IconBadge`, `PillBadge`, `HeroBadge`, `Icon`, `Stat`). Kept un-touched so un-migrated legacy pages keep rendering. **Do not add new files here.** Slated for deletion in Phase 4.
- `src/app/components/solutions/by-industry/` — scoped primitives for the 4 industry pages. Will be re-pointed at the new global primitives in Phase 3.

## Common gotchas

- **Tailwind 4 syntax.** Tokens are defined in `theme.css` via `@theme inline { ... }`, not `tailwind.config.js`. There is no `tailwind.config.js`.
- **Container gutters.** `<Container>` provides `mx-auto`. The new `<Section>` primitive will own horizontal padding via `bz-section`; don't add a second wrapper.
- **Dark sections.** When using a dark surface, prefer the new tokens: `bg-bz-olive` for `tone="dark"` sections; `bg-bz-olive-dark` for footer chrome; `var(--bz-deep)` for pill-dark button fill. The legacy `--bz-deep-2` (#121212) is deprecated.
- **Header non-fixed.** The Header now sits in the document flow. Pages do not need `paddingTop` to offset it. Any legacy `paddingTop: 76` shim in a page file or `routes.tsx` `*PageLayout` is a bug to remove.

## Memory & docs

Three docs to keep in sync:

- **`docs/BIZAK_PRODUCT_OVERVIEW.md`** — what Bizak *is* (modules, audience, narratives, brand voice, canonical stats, section conventions).
- **`docs/DESIGN_SYSTEM.md`** — what Bizak *looks like* (tokens, primitives, scopes, hero pattern, alternating section bg).
- **This file (`CLAUDE.md`)** — hard rules + page-design checklist + migration plan. Always loaded.

The `/redesign-page` skill at `.claude/skills/redesign-page/SKILL.md` is the canonical workflow when converting a page; it cross-refs all three.

When the **product** changes (new module, new positioning, new canonical statistic) → update `BIZAK_PRODUCT_OVERVIEW.md`. When the **design system** changes (token, primitive API, hero pattern) → update both this file and `DESIGN_SYSTEM.md`. Keep them in sync.
