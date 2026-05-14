# Bizak Website — Project Instructions

This file is the always-loaded rule set. Read it before touching any page,
component, or styling.

Three reference docs work together. Load whichever fits the task:

| Doc | Use when |
|---|---|
| **`docs/BIZAK_PRODUCT_OVERVIEW.md`** | Writing copy, choosing a story, picking stats, deciding what a section *says*. **Read before any redesign.** |
| **`docs/DESIGN_SYSTEM.md`** | Choosing primitives, tokens, layouts. Full primitive APIs, all token values, hero pattern. |
| **This file (`CLAUDE.md`)** | Always loaded. Hard rules + page-design checklist + migration plan. |

## What this project is

Marketing site for **Bizak ERP** ("The Operating System for Modern Business").
React 18 + Vite 6 + Tailwind 4 + react-router 7. Deploys to GitHub Pages
(`bizakerp.com`).

The site is **mid-rebrand**: legacy pages use the old sage/lime/charcoal
palette + the `marketing/` primitive library. The new direction — paper cream
+ olive + lime (`#d3f969`) + pistachio — is live on the HomePage, Header, and
Footer. **New primitive library: `src/app/components/bz/`.** Never add to
`marketing/`.

## The single most important rule

**Do NOT redeclare design tokens in component files, and do NOT add a second
`:root` block in `style.css`.** Brand tokens live in **one place**:
`src/styles/theme.css`. They are exposed as CSS custom properties
(`var(--bz-paper)`) and Tailwind utilities (`bg-bz-paper`, `text-bz-fire`).

If a value you need isn't a token yet, **add it to `theme.css` first**. Don't
shortcut with a hex literal. Don't create `const C = {...}`. Don't open a
`:root { … }` block anywhere outside `theme.css`.

## Design tokens (quick reference)

Full tables: `docs/DESIGN_SYSTEM.md` §2. Most-referenced values:

| Token | Value | Use |
|---|---|---|
| `--bz-paper` / `--bz-section-a` | `#FCFCF7` | Primary page bg / tone A |
| `--bz-section-b` | `#efefe9` | Alternating section bg tone B |
| `--bz-olive` | `#1A2D20` | Dark `tone="dark"` surfaces |
| `--bz-olive-dark` | `#0A100D` | Footer chrome |
| `--bz-fire` | `#d3f969` | Lime accent — single canonical pop colour |
| `--bz-leaf` | `#DBE9B8` | Pistachio — secondary accent |
| `--bz-text` | `#1A1D19` | Body/heading on light |
| `--bz-text-muted` | `#6E7466` | Description copy, labels |
| `--bz-text-soft` | `#A2A296` | Muted heading spans (`<Heading.Muted>`) |

Key spacing: `--bz-section-y` 140/110/80px · `--bz-container` 1320px ·
`--bz-hero-gap` 78px desktop / 48px mobile.

Radii: `rounded-bz-sm` (6) through `rounded-bz-3xl` (28), `rounded-bz-pill`
(9999). Always use `rounded-bz-*` — not Tailwind's default `rounded-*`.

## Hard rules

1. **One font family: Inter — end-to-end.** No Hedvig, Manrope, Poppins,
   `font-mono`, `font-family: monospace`. `--bz-heading-font` / `--bz-body-font`
   exist for backward compat only — new code should not reference them.
2. **One icon library: `lucide-react`.** No `@mui/icons-material`, no
   `<span className="material-symbols-outlined">`, no per-page `Icon` component.
3. **No gradients. Period.** No `linear-gradient` / `radial-gradient` /
   `conic-gradient`. Heroes use flat paper-cream or flat olive `<HeroCanvas>`
   with `<DotGrid>`.
4. **`className` over inline `style`.** No `onMouseEnter`/`onMouseLeave` style
   mutations. Inline `style` only for truly dynamic values. The hero badge/title
   spacing is the only sanctioned exception — see §"Hero spacing convention".
5. **No per-file color objects.** No `const C = {...}`. Use `var(--bz-fire)` /
   `text-bz-fire`.
6. **Keep page files small.** ~150–300 lines: imports, data arrays, section
   composition. Sections past ~80 JSX lines → extract into a primitive.
7. **No new styles in `src/styles/style.css`.** New visual behavior goes in the
   primitive's component file or a new `.bz-*` class consumed by exactly one
   primitive.
8. **Scope before write.** New global primitives → `bz/`. Scoped section
   primitives stay scoped until a second nav group needs them, then promote to
   `bz/`. Never add files to `marketing/`.
9. **Delegate to atoms.** Raw `<button>` / `<a>` / styled `<div>` whose shape
   mirrors a primitive must delegate to that primitive. Add a variant on the
   primitive first — never fork.
10. **Closing-CTA in `<Footer cta={…}>`, not in the page.** No `<Section
    tone="dark">` closing CTA above `<Footer>`. See `routes.tsx`'s
    `FinancialManagementPageLayout` and `docs/BIZAK_PRODUCT_OVERVIEW.md` §7.1.
11. **Header is not fixed.** No `paddingTop: 76`, `pt-[76px]`, `mt-[76px]`.
    Strip any you find when touching a page.
12. **Sections alternate `tone="a"` / `tone="b"`.** `tone="dark"` (olive)
    sparingly for showcase blocks.
13. **Every layout must be mobile-responsive AND mobile-beautiful.** Two bars —
    both mandatory:
    - **(a) Structural.** No horizontal scroll at 375px. Every `grid-cols-N`
      (N ≥ 2) has a `grid-cols-1` fallback. No fixed pixel heights on hero panels.
    - **(b) Design quality.** A page that fits 375px but feels cramped, bulky, or
      busy is a **failed redesign**. Mobile is its own design pass — density drops,
      card interiors stay generous, decorative extras hide (`hidden md:block`),
      mocks simplify. Full cheatsheet: `.claude/skills/redesign-page/SKILL.md`.
14. **Every `*PageLayout` in `routes.tsx` MUST have `className="bz-page"`.** That
    class carries `overflow-x: clip` + `text-wrap: balance` — the canonical
    mobile-overflow guard. Missing it causes a few-px horizontal scroll on 375px
    viewports. `HomeLayout` and `FinancialManagementPageLayout` are the reference.
15. **CTAs use 4 canonical labels only: `Get Started`, `Free Trial`, `Request
    Demo`, `Talk to Sales`.** No other label on a conversion `<Pill>`. Full
    variant/arrow/substitution table: `docs/DESIGN_SYSTEM.md` §3.1.1.
16. **Every `<Pill>` carries exactly one arrow.** External (`system.bizakerp.com/*`)
    → `withArrowUpRight` (↗). Internal (`/contact`, `/<page>`, `#anchor`) →
    `withArrow` (→). No arrow = bug. Legacy `withTick`/`iconLeft`/`iconRight`/
    `size="lg"` props were removed — don't pass them.
17. **Adjacent `<Pill>` pairs go inside `<PillGroup>`.** Solo pills (single Pill
    in a `cta=…` slot or standalone nav pill) are NOT wrapped.
18. **Footer `cta` uses canonical pair: `primaryLabel="Get Started"` +
    `secondaryLabel="Request Demo"** (or `Free Trial` + `Request Demo`). Set in
    `*PageLayout` in `routes.tsx`.
19. **Hero CTA → mock gap is a token.** Never write `mt-10/12/14/16/[Npx]` on
    the hero mock wrapper. Use `<HeroCanvas>` or `<div className="bz-hero-visual">`
    — both encode `--bz-hero-gap` (78px/48px). When touching a hero page, grep
    for `mt-(10|12|14|16|\[\d+px\])` on the wrapper below `</PillGroup>` and
    substitute.

## Migration plan

| Phase | What | Status |
|---|---|---|
| 0 | Foundation: tokens in `theme.css`, Hedvig removed, docs updated. | ✅ Done |
| 1 | Build primitive library in `bz/` — 28 primitives shipped. | ✅ Done |
| 2 | Refactor HomePage onto new primitives (`HomePage.tsx` is the canonical reference). | ✅ Done |
| 3 | Migrate every other page, one PR per page, in megaMenu order. | ⏳ Next |
| 4 | Retire `hp-*`/`biz-*` CSS, `marketing/` folder, `svg-*.ts`, `@mui/*`, `--bz-sage*` aliases. | Pending |

## Available primitives

```tsx
import {
  Section, Container, SectionHead, BentoGrid, Bento, Pill, PillGroup, Heading,
  BadgeGreen, HeroCanvas, HeroCard, StepCard, Marquee, Carousel, Accordion,
  Eyebrow, DotGrid, Tick, Flag, StatusChip, StripeBar, BigCard, FlagsRow,
  DataRow, MiniBars, EntityRow, JournalRow, ModuleListItem, StatTile,
} from "../bz";
```

**Never import from `marketing/` in new code.** Full prop APIs: `docs/DESIGN_SYSTEM.md` §3.

- **Atoms:** `Pill`, `PillGroup`, `Eyebrow`, `Heading` (+ `Heading.Muted`), `BadgeGreen`, `Flag`, `StatusChip`, `StripeBar`, `Tick`, `DotGrid`
- **Cards:** `Bento` (+ `.Header/.Desc/.Cta/.Footer`), `BigCard`, `StepCard`, `HeroCard`
- **Layout:** `Section`, `Container`, `HeroCanvas`, `SectionHead`, `BentoGrid`, `.bz-hero-visual` (CSS utility)
- **Patterns:** `Marquee`, `Carousel`, `Accordion`, `FlagsRow`
- **Micro-viz:** `DataRow`, `MiniBars`, `EntityRow`, `JournalRow`, `ModuleListItem`, `StatTile`

## The `tone` prop convention

`tone` describes the **SURFACE the element sits on**, not its text colour.

- `tone="light"` (default) → dark text/paint (element sits on a light surface)
- `tone="dark"` → paper text/paint (element sits on a dark surface)

The legacy `marketing/` convention was the **opposite** — ignore it. Applies to
`Section`, `Heading`, `Eyebrow`, `SectionHead`, `DataRow`, `EntityRow`,
`JournalRow`, `MiniBars`, `ModuleListItem`, `StatTile`, `StripeBar`, `Marquee`.

## Hero spacing convention

The hero badge → title → CTA row uses **inline `style={{ marginBottom: N }}`**,
not Tailwind `mb-*` (`.bz-h1`/`.bz-h2` paint classes set `margin: 0` and defeat
Tailwind margins). This is the only sanctioned inline style for static spacing.

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
{/* Then: <HeroCanvas> OR <div className="bz-hero-visual"> — both encode --bz-hero-gap. Never mt-*. */}
```

Mock below CTAs must fill full `<Container>` width — no `max-w-*` on the outer
wrapper. Full hero pattern: `docs/DESIGN_SYSTEM.md` §3.6.

## Anatomy of a marketing page

**Fixed across every page (design language — non-negotiable):**
- Palette + Inter type scale from `theme.css`; `bz/` primitives; composition over forks.
- Alternating `tone="a"`/`tone="b"`; dark sections sparingly.
- Hero shell: `<Section tone="b" pad="hero">` + `<BadgeGreen>` + `<Heading>` + `<PillGroup>` CTAs.
- Closing CTA via `<Footer cta={…}>` — never a page-level dark section.
- No gradients, single lime accent per surface.

**Free per page (design choices — invent these):**
- Sections, their order, their content, the page-specific hero mock.
- Which narratives (§4) and stats (§5.4) from `docs/BIZAK_PRODUCT_OVERVIEW.md`.

**The cloning trap + anti-patterns + hero mock alternatives:**
`docs/BIZAK_PRODUCT_OVERVIEW.md` §7.2–§7.3 and `.claude/skills/redesign-page/SKILL.md`.

## Workflow rules

### Page-design checklist (run before editing any page)

If any item is "no", fix it as part of the work — don't leave it inconsistent.

0. **Product context.** Skim `docs/BIZAK_PRODUCT_OVERVIEW.md` — module, narratives, stats. Skip for cosmetic edits.
1. **Scope.** Find this page in `Header.tsx` `megaMenus`.
2. **Primitives.** Page composes `bz/` primitives — not inline JSX copies.
3. **Tokens.** No `const C = {...}`, no hex literals (except dynamic).
4. **Icons.** `lucide-react` directly — no per-file SVG dictionary.
5. **Fonts.** Inter only. Strip `'Manrope'`/`'Poppins'`/`'Hedvig …'`/`font-mono`/`font-family: monospace` in the same change.
6. **No `<style>{@media …}</style>` blocks.** Responsive logic lives in the primitive.
7. **`className` over inline `style`.** No `onMouseEnter`/`onMouseLeave` style mutations.
8. **Closing-CTA.** Page passes `cta={…}` to `<Footer>` in `routes.tsx` — no dark section in the page.
9. **Header offset.** Grep `paddingTop: 76|pt-\[76` in page file and `*PageLayout`. Both must be zero.
10. **Section alternation.** Consecutive sections alternate `tone="a"`/`tone="b"`. Dark sections sparing.
11. **CTAs.** 4 canonical labels; exactly one arrow per Pill; no `withTick`/`iconLeft`/`iconRight`/`size="lg"`; adjacent pairs in `<PillGroup>`; solo pills bare.
12. **Hero mock gap.** Wrapper below `</PillGroup>` = `<HeroCanvas>` or `<div className="bz-hero-visual">`. Grep hero for `mt-(10|12|14|16|\[\d+px\])` on mock wrapper and substitute.
13. **Mobile.** (a) Structural: no horizontal scroll at 375px, all grids have mobile fallback. (b) Design quality: mentally walk 375px — cramped/bulky/busy = failed redesign. Full checklist: `.claude/skills/redesign-page/SKILL.md`.
14. **`bz-page` wrapper.** `*PageLayout` outer `<div>` has `className="bz-page"`.

### Other workflow rules

- **Touching a page = migrating it.** Fix checklist failures you encounter.
- **New section pattern?** Check if a primitive covers it. If not, add it to `bz/` before using it.
- **Verifying changes.** After non-trivial edits, run `npm run build`. Dev server on port 5173.
- **Routing.** Routes in `src/app/routes.tsx`. Each page uses a `*PageLayout` rendering `<Header>`, the page, and `<Footer cta={…}>`.
- **Footer / mega-menu hrefs.** Many are `#` placeholders — confirm with user before replacing.

## What's outside this design system

- `src/styles/style.css` — paint layer: `.bz-*` (new), `hp-*`/`biz-*` (legacy, Phase 4 to retire).
- `src/app/components/ui/` — shadcn primitives (form controls, dialogs, dropdowns).
- `src/imports/` — auto-generated SVG paths. Treat as legacy; prefer lucide.
- `src/app/components/bz/` — **canonical primitive library.** See `bz/README.md`.
- `src/app/components/marketing/` — **legacy primitives.** Don't add new files. Deleted in Phase 4.
- `src/app/components/solutions/by-industry/` — scoped primitives for 4 industry pages. Re-pointed at `bz/` in Phase 3.

## Common gotchas

- **Tailwind 4 syntax.** Tokens defined in `theme.css` via `@theme inline { ... }`. There is no `tailwind.config.js`.
- **Container gutters.** `<Container>` provides `mx-auto`. `<Section>` owns horizontal padding — don't double-wrap.
- **Dark sections.** `bg-bz-olive` for `tone="dark"`; `bg-bz-olive-dark` for footer chrome; `var(--bz-deep)` for pill-dark fill. `--bz-deep-2` is deprecated.
- **Header non-fixed.** No `paddingTop` offset needed. Any `paddingTop: 76` shim is a bug.
- **`bz-page` missing.** Symptom: small horizontal scroll on mobile even when sections look fine individually. Fix: add `className="bz-page"` to the `*PageLayout` outer `<div>` in `routes.tsx`.

## Memory & docs

- **`docs/BIZAK_PRODUCT_OVERVIEW.md`** — what Bizak *is* (modules, audience, narratives, brand voice, canonical stats).
- **`docs/DESIGN_SYSTEM.md`** — what Bizak *looks like* (all token values, full primitive APIs, hero pattern, migration phases).
- **This file (`CLAUDE.md`)** — hard rules + checklist + migration plan.

When the **product** changes → update `BIZAK_PRODUCT_OVERVIEW.md`. When the
**design system** changes → update both `DESIGN_SYSTEM.md` and this file.
