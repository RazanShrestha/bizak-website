# bz/ — Bizak design-system primitives

This folder is the **canonical primitive library** for the Bizak marketing
site. All new pages import from here; the legacy `marketing/` folder is
being retired in Phase 4 of the rebrand migration.

```tsx
import {
  Section, Container, SectionHead, BentoGrid, Bento, Pill, Heading,
  BadgeGreen, HeroCanvas, HeroCard, StepCard, Marquee, Carousel, Accordion,
} from "../bz";
```

## Layers

| Layer | Files | Purpose |
|---|---|---|
| Atoms | `Pill`, `PillGroup`, `Eyebrow`, `Heading`, `BadgeGreen`, `Flag`, `StatusChip`, `StripeBar`, `Tick`, `DotGrid` | Single-element building blocks. |
| Layout | `Container`, `Section`, `HeroCanvas`, `SectionHead`, `BentoGrid` | Page scaffolding + section heads. |
| Card shells | `Bento`, `BigCard`, `StepCard`, `HeroCard` | Repeating card shapes. |
| Patterns | `Marquee`, `Carousel`, `Accordion`, `FlagsRow` | Higher-level interaction patterns. |
| Micro-viz | `DataRow`, `MiniBars`, `EntityRow`, `JournalRow`, `ModuleListItem`, `StatTile` | Rows / mini-charts that fill card insides. |

## CSS utility classes (paint without a React wrapper)

A few `.bz-*` classes in `src/styles/style.css` are paint without a
dedicated React primitive. Pages apply them via `className="…"`:

| Class | Purpose |
|---|---|
| `.bz-page` | Outer wrapper for every `*PageLayout` in `routes.tsx`. Carries `overflow-x: clip` + `text-wrap: balance` — the project's mobile-overflow guard. |
| `.bz-hero-visual` | Wrapper for a page-specific hero mock that is NOT a `<HeroCanvas>` (e.g. `FinancialManagement`'s olive-panel + statement card, `Workflow`'s approval-flow board). Encodes `var(--bz-hero-gap)` / `var(--bz-hero-gap-mobile)` so paper-surface mocks share the olive-canvas spacing — never hardcode `mt-*` on the mock wrapper. See `/CLAUDE.md` §"Hero spacing convention" for the canonical Options A / B. |

## Rules

1. **Every visual decision** (colour, spacing, type, hover) lives in a
   primitive — never in a page. Pages = composition + data.
2. **Tokens** come from `src/styles/theme.css`. No hex literals, no
   `const C = {...}` colour objects, no per-file `:root` blocks.
3. **Inter only.** No `font-mono`, no serif headings, no Hedvig.
4. **No gradients.** Flat fills + `<DotGrid>` overlay for depth.
5. **No `<style>{@media …}</style>` blocks** in pages. Responsive logic
   lives in the primitive that owns the layout.
6. **No `onMouseEnter`/`onMouseLeave` style mutations.** Use `:hover` in
   the primitive's CSS class or Tailwind `hover:` utilities.
7. **CTAs are canonical.** Every conversion `<Pill>` uses one of 4
   labels (Get Started / Free Trial / Request Demo / Talk to Sales) and
   exactly one arrow (`withArrowUpRight` ↗ for external,
   `withArrow` → for internal). Adjacent Pill pairs go inside
   `<PillGroup>`; solo pills do not. The Pill primitive's only props
   are `variant`, `size="sm|md"`, `href`, `withArrow`, and
   `withArrowUpRight` — legacy `withTick`/`iconLeft`/`iconRight`/`size="lg"`
   were removed. Full canon: `/CLAUDE.md` §"CTA conventions" and
   `/docs/DESIGN_SYSTEM.md` §3.1.1.

## Adding a new primitive

1. Decide whether it's an atom, layout, card shell, pattern, or micro-viz.
2. Create the `.tsx` file in this folder.
3. Export it from `index.ts` (plus its prop type).
4. Update `/CLAUDE.md` "Planned primitive library" → "Available
   primitives" once it ships.
5. Update `/docs/DESIGN_SYSTEM.md` §3 with the prop API.

## Retirement plan (Phase 4)

When every page has migrated onto these primitives, `marketing/` and the
legacy `hp-*` / `biz-*` classes in `src/styles/style.css` will be deleted.
Until then, the two folders coexist — legacy pages keep using `marketing/`,
new pages use `bz/`.
