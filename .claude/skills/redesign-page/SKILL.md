---
name: redesign-page
description: Migrate a legacy Bizak marketing page to the new design system (paper/olive/lime/pistachio palette + Phase 1 primitives). Use when the user says "redesign <PageName>", "migrate <PageName>", "update <PageName> to the new pattern", or after touching any page that still uses inline styles, per-file `const C = {...}` colour objects, or the legacy `marketing/` `HeroCentered`/`HeroSplit`/`HeroPanel` heroes.
---

# Skill: redesign-page

This skill is the canonical workflow for converting a marketing page to
the project's current design system. Three reference docs anchor the
work — load them before you start (or recall them if already loaded this
session):

| Doc | Why you need it |
|---|---|
| **`docs/BIZAK_PRODUCT_OVERVIEW.md`** | **What Bizak is** — modules, audience, product narratives, brand voice, canonical statistics, section conventions. Read first so copy + structure reinforce the rest of the site. |
| **`/CLAUDE.md`** | Hard rules + page-design checklist + the migration plan (always loaded). |
| **`/docs/DESIGN_SYSTEM.md`** | Long-form design reference — tokens, primitive APIs, hero pattern, closing-CTA-via-Footer convention. |

## Status — Phase 3 is active

Phase 0 (foundation), Phase 1 (28 primitives), and Phase 2 (HomePage
refactor onto primitives) are **done**. **Phase 3 is the per-page
migration loop** — one PR per page, mirroring `HomePage.tsx`'s structure.

- **Canonical reference page**: `src/app/components/HomePage.tsx`. Read it before any redesign.
- **Primitive library**: 28 primitives in `src/app/components/bz/`. Barrel: `bz/index.ts`. Catalogue: `bz/README.md`.
- **Never import from `marketing/` in new code** — that folder is legacy and slated for deletion in Phase 4.

If you're asked to redesign a page, you can proceed — every primitive
you'll need already exists. If you encounter a shape that ISN'T covered
by an existing primitive, **add it to `bz/` first** (with paint in
`style.css`, React wrapper in `bz/`, export in `bz/index.ts`), then use
it on the page.

## Conventions learned from the HomePage refactor (read before editing)

These rules came out of Phase 2 and are now load-bearing across every page:

1. **`tone` means SURFACE, not text colour.** `tone="dark"` = "I sit on a dark surface" → renders paper text. `tone="light"` (default) = "I sit on a light surface" → renders dark text. Applies to `Section`, `Heading`, `Eyebrow`, `SectionHead`, `DataRow`, `EntityRow`, `JournalRow`, `MiniBars`, `ModuleListItem`, `StatTile`, `StripeBar`, `Marquee`. The legacy `marketing/` convention was the opposite — ignore that.

2. **Hero spacing uses inline `style`, not Tailwind margin utilities.** This is the *only* place inline `style` for static spacing is sanctioned. The canonical hero rhythm:

   ```tsx
   <BadgeGreen style={{ marginBottom: 28 }}>...</BadgeGreen>
   <Heading level={2} style={{ marginBottom: 36 }}>...</Heading>
   <div className="flex flex-wrap justify-center gap-[10px]">{pills}</div>
   ```

   Why: `.bz-h1`/`.bz-h2` paint classes set `margin: 0` and their cascade priority can defeat Tailwind `mb-*` utilities in subtle ways (twMerge, layer ordering). Inline `style` always wins. Don't try to "fix" this back to Tailwind utilities — it has been tried and the rhythm broke.

3. **`Section pad="hero"`** = flat `pt-[56px] pb-[96px]` on all viewport sizes. This matches the staged spec exactly. Don't add responsive variation.

4. **Page-specific domain visuals (dashboards, mock invoices, multi-entity panels) stay as in-page sub-components**, but compose `bz/` micro-viz primitives (`DataRow`, `EntityRow`, `JournalRow`, `MiniBars`, `ModuleListItem`, `StatTile`) instead of duplicating JSX. See `HomePage.tsx`'s `PlatformDashboard`, `StepVisualConnect`, `StepVisualScale`, `MultiEntityVisual` for the pattern.

5. **Page-internal styles never use `<style>{@media ...}</style>` blocks.** If a section needs responsive logic, the primitive that owns the layout owns the breakpoint. If you reach for a `<style>` block in a page, the primitive is missing a breakpoint — extend it.

## Product brief first

The very first step of any redesign is **"what is this page selling, and to whom?"** — answered from `BIZAK_PRODUCT_OVERVIEW.md`:

1. Which module / industry / capability does this page cover? (See §3.)
2. Which 2–3 product narratives (§4) should the page lean on?
3. Which canonical statistics (§5.4) should it reuse?
4. What's the section rhythm appropriate for this kind of page (§7.3)?
5. What closing-CTA copy goes into `<Footer cta={…}>` for this page (§7.1)?

If you're about to write copy that could equally describe Salesforce,
NetSuite or HubSpot, you skipped this step.

## Page-design checklist (run BEFORE editing anything)

Walk through every item; whatever is "no" becomes part of this redesign.

1. **Scope.** Open `src/app/components/Header.tsx` and find this page inside the `megaMenus` object. Which top-level group + sub-heading?
2. **Primitives available?** The new primitive library lives in **`src/app/components/bz/`**. Confirm `<Pill>` / `<Bento>` / `<SectionHead>` / `<Section>` / `<Container>` / `<Heading>` etc. exist there. If any are missing, Phase 1 isn't complete — flag and stop (build the primitive in `bz/` FIRST). **Never import primitives from `marketing/` in new code** — that folder is legacy and slated for deletion in Phase 4.
3. **Primitive composition.** Is the page composing the new primitives, or duplicating their JSX inline? Inline duplication = migration work.
4. **Tokens.** No per-file `const C = {...}`. No hex literals (except dynamic style props). All colours via `var(--bz-fire)` / `var(--bz-paper)` / etc. or Tailwind utilities (`text-bz-fire`, `bg-bz-paper`).
5. **Icons.** No per-file SVG dictionary. Use `lucide-react` directly for new code.
6. **Fonts.** Inter only — end-to-end. References to `'Hedvig …'`, `'Manrope'`, `'Poppins'`, `font-mono`, `font-family: monospace` are bugs. Strip in the same change.
7. **No `<style>{`@media …`}</style>` blocks inside pages.** Responsive logic lives in the primitive. If you find one, the primitive's API is missing a breakpoint — extract it.
8. **className over inline `style`.** Static values in className. Inline `style` only for truly dynamic values. No `onMouseEnter`/`onMouseLeave` style mutations — use `hover:` utilities or `:hover` on the primitive's CSS class.
9. **Closing-CTA pattern.** Page does NOT render its own closing CTA section. CTA goes in `<Footer cta={…}>` in `routes.tsx`. See `FinancialManagementPageLayout` for the reference.
10. **Header offset shim.** Grep `paddingTop: 76|pt-\[76|mt-\[76` inside the page file AND its `*PageLayout` in `routes.tsx`. Both must be zero. The header is no longer fixed.
11. **Section alternation.** Consecutive content sections alternate `tone="a"` / `tone="b"`. Dark sections sparing and intentional.
12. **Mobile responsiveness.** Every grid, flex row, fixed width, hero visual works at 375px without horizontal scroll. See the mobile cheatsheet below.

If any item fails, the redesign is the work to bring it into compliance.

## When to invoke

- User explicitly asks: "redesign the X page", "migrate X to the new pattern".
- You are about to edit a page file that still has any of these signals:
  - `const C = { ... }` colour object at the top
  - inline `style={{ ... }}` for static values (colours, padding, fonts, grids)
  - `onMouseEnter` / `onMouseLeave` mutating `e.currentTarget.style`
  - `'Manrope'` / `'Poppins'` / `'Hedvig …'` / any non-Inter font
  - `font-mono` / `font-family: monospace`
  - `linear-gradient(...)` / `radial-gradient(...)` — no exceptions, the `.biz-mesh` carve-out has been retired
  - a per-file `function Icon({ name }) { … }` SVG dictionary
  - `<span className="material-symbols-outlined">`
  - a local `function FooButton(...)` / `function FooCard(...)` / `function FooBadge(...)` mirroring a primitive's shape
  - `paddingTop: 76` / `pt-[76px]` / `mt-[76px]` anywhere — the header is no longer fixed
  - a `<Section tone="dark">` block above `<Footer>` posing as a closing CTA — moved into Footer
  - `<HeroCentered>`, `<HeroSplit>`, or `<HeroPanel>` imported from `../marketing` — those are pre-rebrand legacy primitives; new pages use `<Section tone="b">` + `<BadgeGreen>` + `<HeroCanvas>` from `../bz` instead
  - any other import from `../marketing/*` or `../marketing` in a page file — new pages must import from `../bz`
  - `.biz-mesh` or `<HeroBadge>` (legacy) — replaced by `<BadgeGreen>` on a flat surface
  - any reference to `--bz-sage*` tokens (deprecated) — use `--bz-fire` / `--bz-paper` / etc.

## The migration

### Step 1 — Read the page

Read the entire file end-to-end. Note sections, content data, icons,
bespoke visuals.

### Step 2 — Plan section-by-section

For each section, identify:

- **Wrapper** — `<Section tone="a|b|dark">`.
- **Width** — `<Container width="default|narrow">`.
- **Heading block** — `<SectionHead index? label title titleMuted? actions?>`.
- **CTAs** — `<Pill variant="..." withTick? withArrow? href>`.
- **Cards / grids** — `<BentoGrid cols={N}>` + `<Bento tone=... hover>` (compound: `<Bento.Header>`, `<Bento.Desc>`, `<Bento.Cta>`, `<Bento.Footer>`).
- **Stats** — `<DataRow>` or `<EntityRow>` inside a `<Bento.Footer>`.
- **Eyebrow / pills** — `<Eyebrow index="..." label="...">`.
- **Hero** — `<Section tone="b"><Container><BadgeGreen>…</BadgeGreen><Heading level={1}>…</Heading><div>{pills}</div><HeroCanvas>{heroCards}</HeroCanvas></Container></Section>`.

### Step 3 — Replace, don't rewrite from scratch

- Lift inline content into `const ARRAY = [...]` data structures.
- Convert each inline `style={...}` into a token reference or className.
- Token map:
  - `'#FCFCF7'` → `bg-bz-paper` / `var(--bz-paper)`
  - `'#efefe9'` → `bg-bz-section-b` / `var(--bz-section-b)`
  - `'#FFFFFF'` → `bg-bz-surface`
  - `'#1A2D20'` → `bg-bz-olive`
  - `'#0F1411'` → `bg-bz-deep` / `var(--bz-deep)` (pill-dark)
  - `'#0A100D'` → `bg-bz-olive-dark` (footer chrome)
  - `'#d3f969'` → `bg-bz-fire` / `text-bz-fire`
  - `'#DBE9B8'` → `bg-bz-leaf`
  - `'#1A1D19'` → `text-bz-text`
  - `'#6E7466'` → `text-bz-text-muted`
  - `'#A2A296'` → `text-bz-text-soft`
  - `'#D8D9D3'` → `border-bz-line`
  - `'#E5E5E0'` → `border-bz-line-soft`
  - `rgba(252,252,247,0.62)` → `text-white/[0.62]` or `var(--bz-text-on-dark-muted)`
  - `rgba(252,252,247,0.08)` → `border-white/[0.08]`

- Replace `onMouseEnter`/`onMouseLeave` style mutations with `:hover` rules on the primitive's CSS class or Tailwind `hover:` utilities.
- Replace gradients with flat colours, shadows, or `<DotGrid>` overlays. No exceptions.
- Replace `<svg>` icons with lucide equivalents (or `<Icon name>` for data-driven arrays).

### Step 4 — Remove dead code

- Delete `const C = { ... }` objects.
- Delete unused imports.
- Delete `onMouseEnter`/`onMouseLeave` handlers that only mutated style.
- Delete `<style>{@media …}</style>` blocks once the primitive owns the breakpoint.
- Delete `paddingTop: 76` shims in the page AND in `routes.tsx`'s `*PageLayout`.
- Delete `<Section tone="dark">` closing CTAs — move copy into `<Footer cta={…}>`.
- Do **not** leave `// removed` comments.

### Step 5 — Verify

1. Read the migrated file end-to-end. Sanity-check that no `'#hex'` literals remain (except dynamic).
2. Grep for forbidden patterns:
   ```
   Hedvig|Manrope|Poppins|font-mono|monospace|linear-gradient|radial-gradient|material-symbols-outlined|onMouseEnter|paddingTop: 76|biz-mesh|HeroBadge
   ```
   Inside the migrated file, all results should be 0.
3. Grep also for legacy palette references inside the migrated file:
   ```
   --bz-sage|bg-bz-sage|text-bz-sage|--bz-deep-2|bg-bz-deep-2|#7A826D|#C7FF35|#1A1D19|#121212
   ```
   Should be 0 (the legacy aliases still resolve, but new code should use the descriptive tokens).
4. If non-trivial, run `npm run build` + `npm run dev`.

### Step 6 — Update the route layout

Open `src/app/routes.tsx`. Find the page's `*PageLayout`. Confirm:
- It renders `<Header />`, the page, `<Footer cta={…}>` — in that order.
- It does NOT have a `<div style={{paddingTop: 76}}>` wrapper.
- The `cta` prop on `<Footer>` reflects this page's specific closing copy (or is omitted to use the generic default).

### Step 7 — Report

End with a short summary: what sections were migrated, what bespoke
pieces remained (if any), what primitives were added/extended as a side
effect (if any).

## Out of scope

- Don't rewrite content copy unless the user asked. The goal is *design* migration.
- Don't change routes, props, or exported component names — pages are imported by `routes.tsx`.
- Don't touch `src/styles/style.css`'s `.bz-*` CSS classes unless adding paint for a new primitive variant.
- Don't migrate >1 page per session unless explicitly asked.

## Mobile responsiveness (mandatory)

Every section must look correct from 375px through desktop without horizontal scroll. Patterns:

```tsx
// Bento grid — `BentoGrid cols={N}` owns its breakpoints; don't re-encode
<BentoGrid cols={3} />          // collapses to 1-col on mobile, 2-col on tablet automatically

// If you write a raw grid for one-off layouts
<div className="grid grid-cols-1 md:grid-cols-3 gap-5">

// Fixed-ratio grids
<div className="grid grid-cols-1 lg:grid-cols-[3fr_1fr] gap-5">

// 12-col bentos
<div className="grid grid-cols-1 md:grid-cols-12 gap-5">
  <div className="col-span-full md:col-span-7 ...">
  <div className="col-span-full md:col-span-5 ...">

// Hero dashboard decorative sidebars — desktop only
<div className="hidden md:flex w-[200px] shrink-0 ...">

// Fixed-height hero panels — never
<div className="... h-auto">                          // not h-[480px]

// Connectivity / hub rows
<div className="flex flex-col items-center gap-6 md:flex-row md:gap-0 md:justify-center">
<div className="hidden md:block w-16 h-px bg-bz-line ..."/>   // connector lines hide on mobile

// Fixed-width sidepanels
<div className="w-full lg:w-[360px] lg:flex-shrink-0">

// Dense tables — wrap and set min-w on inner rows
<div className="rounded-bz-lg border border-bz-line-soft overflow-hidden overflow-x-auto">
  <div className="hidden md:grid grid-cols-[68px_92px_1fr_120px_72px] ... min-w-[560px]">

// Padding
<div className="px-4 md:px-8 py-5 md:py-7">
```

### Mobile checklist (run before Step 5)

- [ ] All `grid-cols-N` (N ≥ 2) have a `grid-cols-1` mobile prefix.
- [ ] No inline `display: grid` / `display: flex` layout styles.
- [ ] No fixed `h-[Npx]` on hero panels — use `h-auto`.
- [ ] Decorative sidebars `hidden md:flex`.
- [ ] Connectivity sections stack on mobile; connectors `hidden md:block`.
- [ ] Dense tables wrapped in `overflow-x-auto` + `min-w-[…]` on rows.
- [ ] Fixed-width sidepanels become `w-full` on mobile.
- [ ] Padding reduced on mobile where appropriate.

## Common mistakes to avoid

- **Adding a primitive that already exists.** Check `src/app/components/bz/index.ts` first.
- **Adding new tokens without updating `docs/DESIGN_SYSTEM.md` and `/CLAUDE.md`.**
- **Using `rounded-md` / `rounded-lg`.** Use `rounded-bz-md` / `rounded-bz-lg`.
- **Wrapping `<Section>` in another wrapper for padding.** `<Section>` already provides padding; `<Container>` provides horizontal gutter.
- **Writing a `<Section tone="dark">` closing CTA above `<Footer>`.** The CTA lives inside `<Footer cta={…}>`.
- **Adding `paddingTop: 76`** anywhere. Header is no longer fixed.
- **Reaching for the legacy `marketing/` heroes** (`HeroCentered`, `HeroSplit`, `HeroPanel`). They're pre-rebrand. New heroes use `<Section tone="b">` + `<BadgeGreen>` + `<HeroCanvas>`.
- **Adding `.biz-mesh`** or `<HeroBadge>`. Both retired.
- **Per-page `<style>{@media …}</style>` blocks.** Means a primitive's breakpoint is missing — fix the primitive.
- **Writing desktop-only layouts.** Run the mobile checklist before declaring done.
