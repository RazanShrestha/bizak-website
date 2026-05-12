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
| Atoms | `Pill`, `Eyebrow`, `Heading`, `BadgeGreen`, `Flag`, `StatusChip`, `StripeBar`, `Tick`, `DotGrid` | Single-element building blocks. |
| Layout | `Container`, `Section`, `HeroCanvas`, `SectionHead`, `BentoGrid` | Page scaffolding + section heads. |
| Card shells | `Bento`, `BigCard`, `StepCard`, `HeroCard` | Repeating card shapes. |
| Patterns | `Marquee`, `Carousel`, `Accordion`, `FlagsRow` | Higher-level interaction patterns. |
| Micro-viz | `DataRow`, `MiniBars`, `EntityRow`, `JournalRow`, `ModuleListItem` | Rows / mini-charts that fill card insides. |

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
