---
name: redesign-page
description: Migrate a legacy Bizak marketing page to the new design system (tokens + marketing primitives). Use when the user says "redesign <PageName>", "migrate <PageName>", "update <PageName> to the new pattern", or after touching any page that still uses inline styles + per-file `const C = {...}` color objects.
---

# Skill: redesign-page

This skill is the canonical workflow for converting a marketing page to the
project's design system. Read `/CLAUDE.md` and `/docs/DESIGN_SYSTEM.md` first
if you haven't loaded them in this session.

## Scope first

Before doing anything else, decide which **scope** the page belongs to:

- The 4 "By Industry" pages (`ManufacturingPage`, `DistributionPage`,
  `ProfessionalServicePage`, `RetailAndEcommercePage`) compose
  `src/app/components/solutions/by-industry/` primitives + the global
  `marketing/` primitives. The canonical reference is
  `ManufacturingPage.tsx` — mirror its structure.
- Any other marketing page composes `marketing/` primitives directly.

Where a primitive lives encodes who is allowed to use it. **Never deep-import
across scopes** — if a non-industry page needs `IndustryHero`, the right move
is to promote it up to `marketing/` first (see "Scope promotion rule" in
`/CLAUDE.md`), not to import from another scope's folder.

## Page-design checklist (run BEFORE editing anything)

This is the non-negotiable preflight. Walk through every item; whatever is
"no" becomes part of this redesign — fix what you touch, don't bandaid:

1. **Scope.** Open `src/app/components/Header.tsx` and find this page inside the `megaMenus` object. Which top-level group + sub-heading does it sit under? Does a corresponding scope folder exist (e.g., `solutions/by-industry/`)?
2. **Section primitives.** If the page belongs to a family with a scope folder, is it composing those scoped section primitives, or duplicating their JSX inline? If a sibling page in the same family has invented a section the primitive doesn't cover yet, **promote that pattern into the scope folder first**, then use it.
3. **Global primitives.** `Container`, `Section`, `SectionHeading`, `Button`, `Card`, `Stat`, `IconBadge`, `PillBadge`, `HeroBadge`, `Eyebrow` from `marketing/` — used wherever they fit?
3a. **Hero pattern (canonical).** If the page has a hero `<section>`: it MUST use `.biz-mesh` for the background and `<HeroBadge>` for the eyebrow pill. No inline `linear-gradient` / `radial-gradient` for the hero bg. No hand-rolled `<div className="...-badge">` with a custom gradient. Spacing baseline: hero top padding ~72px, badge sits ~16px above the `<h1>`. See "Canonical hero pattern" in `/docs/DESIGN_SYSTEM.md` §3.6 and `/CLAUDE.md`.
4. **Tokens.** No per-file `const C = {...}` color object. No hex literals except in genuinely dynamic style props. All colors via `var(--bz-*)` or Tailwind utilities.
5. **Icons.** No per-file SVG dictionary `function Icon({ name }) {...}`. Use the global `<Icon name="..." />` from `marketing/` for data-driven loops; import lucide directly (`import { Factory } from "lucide-react"`) for statically known icons.
6. **Fonts.** Inter only. References to `'Manrope'`, `'Poppins'`, etc. are silent visual bugs.
7. **Animations / motion.** Reuse the existing global keyframe classes (`biz-pulse-glow`, `biz-float`, `biz-particle`, `biz-flow`, `biz-radar-ping`, …) — don't redeclare keyframes per page.
8. **className over inline `style`.** Static values in className. Inline `style` only for dynamic values. No `onMouseEnter`/`onMouseLeave` style mutations — use Tailwind `hover:`.
9. **Promotion check.** A JSX pattern that appears in this page **and** in another nav group's pages with the same shape belongs in `marketing/`, not duplicated. Promote it.
10. **Delegate-to-atom check.** Walk every `<button>`, `<a>` styled as a button, and styled `<div>`/`<span>` in the file (and inside any scoped section primitive the page composes). If its shape mirrors a global primitive (`<Button>`, `<Card>`, `<IconBadge>`, `<PillBadge>`, `<Stat>`, `<HeroBadge>`, `<Eyebrow>`), replace it with that primitive. If the needed variant doesn't exist yet (e.g., the by-industry "shimmer" CTA), **add the variant on the global primitive first** (`marketing/Button.tsx` etc.), update its prop docs in `/CLAUDE.md` + `/docs/DESIGN_SYSTEM.md`, then delegate. *This applies inside scoped primitives too:* `IndustryHero` should compose `<Button>`, not roll its own `HeroCtaButton`. Known offenders: `IndustryHero.tsx` (local `HeroCtaButton`) and `IndustryCta.tsx` (local `CtaButton`) — when you touch either, fix both.

If any item fails, the redesign is the work to bring it into compliance.
The end state of any page edit is "all items pass for the parts of the
file you touched."

## When to invoke

- User explicitly asks: "redesign the X page", "migrate X to the new pattern", "convert X to use the design system".
- You are about to edit a page file that still has any of these signals:
  - `const C = { ... }` color object at the top of the file
  - inline `style={{ ... }}` for static values (colors, padding, fonts)
  - `onMouseEnter` / `onMouseLeave` mutating `e.currentTarget.style`
  - `'Manrope'` / `'Poppins'` / any font that isn't `'Inter'`
  - `linear-gradient(...)` / `radial-gradient(...)` (except via the canonical `.biz-mesh` class on a hero, or inside the `<HeroBadge>` primitive — those two are the allowed reuses)
  - a per-file `function Icon({ name }) { const icons = {...} }` SVG dictionary (legacy industry-page pattern — replace with the global `marketing/Icon`)
  - `<svg>` with hardcoded path strings where a lucide equivalent exists
  - `<span className="material-symbols-outlined">`
  - a local `function FooButton(...)` / `function FooCard(...)` / `function FooBadge(...)` that returns a raw `<button>`/`<a>`/styled `<div>` mirroring the shape of a global primitive (`<Button>`/`<Card>`/`<PillBadge>`/etc.) — even when it's inside a scoped section primitive in `solutions/by-industry/`. Delegate to the global primitive (adding a variant first if needed); don't fork.

If any signal is present and you're touching the file, run this skill before
making other changes — don't bandaid the legacy pattern.

## The migration

### Step 1 — Read the page

Read the entire file end-to-end. Note:

- What sections exist (Hero, Features, Stats, Testimonial, CTA…).
- What content data is hardcoded inside JSX vs. lifted into a `const ARRAY = [...]`.
- What icons are used and where they come from.
- Any genuinely bespoke visuals (animations, dashboard mockups) that don't fit primitives.

### Step 2 — Plan section by section

**For "By Industry" pages**, prefer the section primitives in
`solutions/by-industry/` — they encode the canonical hero / challenges /
solution / capabilities / insights / workflow / CTA rhythm those pages
share. Mirror `ManufacturingPage.tsx`. The page becomes ~150–250 lines of
data + a custom hero visual.

**For all other pages**, decide section-by-section:

- **Wrapper** — `<Section tone="light"|"white"|"dark"|"deeper" pad="default"|"compact"|"hero">`.
- **Width** — `<Container>` (1320) or `<Container width="narrow">` (1200).
- **Heading block** — `<SectionHeading eyebrow="..." title="..." description="..." level="h1"|"h2" tone="dark"|"light" align="left"|"center" maxWidth={...}>`.
- **Buttons** — `<Button variant="..." size="..." href="..." withArrow>`.
- **Cards / grids** — `<Card>` plus a Tailwind grid (`grid grid-cols-1 md:grid-cols-3 gap-4`).
- **Stats** — `<Stat value=... label=... tone=... size=... />`.
- **Eyebrow / pills** — `<Eyebrow>`, `<PillBadge>`.
- **Icon containers** — `<IconBadge tone=... size=...><Icon className="size-5" /></IconBadge>`.
- **Icons inside data arrays** — use `<Icon name="..." size={N} />` from `marketing/`. For new code with statically-known icons, prefer importing the lucide icon directly (`import { Factory } from "lucide-react"`).

### Step 3 — Replace, don't rewrite from scratch

- Lift any inline content arrays already defined (like `VALUES = [...]`) — keep them as-is, they're the right shape.
- Lift any inline content that isn't yet in an array but should be (e.g., feature list inside JSX → extract to a `const FEATURES = [...]`).
- For each old inline `style={...}`, find the equivalent token / utility class. The token map:
  - `'#7A826D'` → `text-bz-sage` / `bg-bz-sage` / `var(--bz-sage)`
  - `'#C7FF35'` → `text-bz-accent` / `bg-bz-accent`
  - `'#1A1D19'` → `bg-bz-deep`
  - `'#121212'` → `bg-bz-deep-2`
  - `'#F8F9F7'` → `bg-bz-bg`
  - `'#FFFFFF'` → `bg-bz-surface`
  - `'#333333'` / `'#333'` → `text-bz-text`
  - `'#666666'` / `'#666'` → `text-bz-text-muted`
  - `'#E8EAE4'` → `border-bz-border`
  - `rgba(255,255,255,0.07)` (border on dark) → `border-white/10`
  - `rgba(255,255,255,0.04)` (surface on dark) → `bg-white/[0.04]`
  - `rgba(255,255,255,0.6)` (text on dark muted) → `text-white/60`

- For each old `onMouseEnter` style mutation, replace with Tailwind `hover:` utility.
- For each old gradient (`linear-gradient` or `radial-gradient`):
  - **If it's the hero `<section>` background** → replace with the `.biz-mesh` className (no inline radials).
  - **If it's a hero eyebrow/badge** → replace with `<HeroBadge>` from `marketing/`.
  - **Anything else** (cards, dividers, glows, chip backgrounds, decorative blobs) → flat fill or delete the decorative element. Project rule still bans non-hero gradients.
- For each `<svg>` with a hardcoded path, look up the lucide-react equivalent. If unsure, leave the SVG temporarily and flag it in your summary — don't guess wrong icons.

### Step 4 — Remove dead code

- Delete the `const C = { ... }` object at the top of the file.
- Delete any unused imports (`useState` if no longer used, etc.).
- Delete inline event handlers that only existed for hover style mutations.
- Do **not** leave `// removed` comments. Just delete.

### Step 5 — Verify

1. Read the migrated file end-to-end. Sanity-check that no `'#hex'` literals remain (except in genuinely dynamic style props like progress bars).
2. Grep for forbidden patterns:
   ```
   Manrope|Poppins|linear-gradient|radial-gradient|material-symbols-outlined|onMouseEnter
   ```
   Inside the file you migrated, all results should be 0. **Justified exceptions:** if the file is a hero, it should reference `.biz-mesh` (className) and `<HeroBadge>` instead of inline `linear-gradient`/`radial-gradient` — verify those references are present, not the raw gradient strings.
3. If non-trivial, ask the user to run `npm run build` and `npm run dev` to verify visually.

### Step 6 — Report

End with a short summary: what sections were migrated, what bespoke pieces remained (if any), what tokens or primitives were *added* to the system as a side effect (if any).

## Out of scope

- Don't rewrite content copy unless the user asked. The goal is *design* migration, not editorial.
- Don't change routes, props, or exported component names — pages are imported by `routes.tsx`.
- Don't touch `src/styles/style.css` (the homepage's bespoke CSS) — its color literals were already swapped to tokens.
- Don't migrate >1 page per session unless the user explicitly asked. One page at a time keeps reviewable diffs.

## Common mistakes to avoid

- **Adding a primitive that already exists.** Check `src/app/components/marketing/index.ts` first.
- **Adding new tokens without updating `docs/DESIGN_SYSTEM.md`.** Tokens and docs stay in sync.
- **Using `rounded-md` / `rounded-lg`.** Those are Tailwind defaults that don't match our scale. Use `rounded-bz-md` / `rounded-bz-lg`.
- **Wrapping `<Section>` in another wrapper for padding.** `<Section>` already provides vertical padding via `pad`. `<Container>` provides horizontal gutter. Don't double-wrap.
- **Passing `tone="light"` to children inside `<Section tone="light">`.** "light" on `Section` means *light surface, dark text*. "light" on `SectionHeading`/`Stat` means *for use on dark surfaces*. Match them carefully:
  - `<Section tone="light">` → children: `tone="dark"` (default)
  - `<Section tone="dark">` → children: `tone="light"`
