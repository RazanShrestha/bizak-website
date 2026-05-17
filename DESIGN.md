---
name: Bizak
description: Design system for Bizak ERP — "The Operating System for Modern Business." A unified cloud ERP marketing site and product app, mid-rebrand to a paper + olive + lime + pistachio palette.
version: 1.1.0

colors:
  # Surfaces
  paper: "#FCFCF7"
  paper-warm: "#F4F5EF"
  section-a: "#FCFCF7"
  section-b: "#efefe9"
  surface: "#FFFFFF"
  olive: "#1A2D20"
  olive-soft: "#243A2D"
  olive-dark: "#0A100D"
  deep: "#0F1411"

  # Accents
  primary: "#d3f969"          # lime — the single canonical pop colour
  fire: "#d3f969"
  fire-soft: "rgba(211,249,105,0.10)"
  fire-mid: "rgba(211,249,105,0.20)"
  secondary: "#DBE9B8"        # pistachio — soft secondary
  leaf: "#DBE9B8"
  leaf-deep: "#A8C76C"

  # Text
  on-surface: "#1A1D19"
  text: "#1A1D19"
  text-heading: "#2D332B"     # h1/h2 marketing titles — slightly softer than body
  text-muted: "#5A6053"
  text-soft: "#707064"
  on-dark: "#FCFCF7"
  on-dark-muted: "rgba(252,252,247,0.72)"
  on-dark-soft: "rgba(252,252,247,0.55)"

  # Lines
  line: "#D8D9D3"
  line-soft: "#E5E5E0"
  border-soft: "#F0F1ED"
  border-on-dark: "rgba(252,252,247,0.08)"

  # File-type icon colours — document marks, deliberately OUT of the brand
  # palette so they read as file marks, not page accents. There are NO
  # brand success / warning / error tokens — see "Status & semantic colour".
  file-pdf: "#D9382C"
  file-doc: "#2B579A"
  file-xls: "#217346"
  file-img: "#7A5AF8"

typography:
  font-family-base: Inter
  font-family-heading: Inter
  font-family-mono: Inter           # explicitly Inter — no mono font in this system

  h1:
    fontFamily: Inter
    fontSize: "clamp(32px, 4.5vw, 56px)"
    fontWeight: 500
    lineHeight: 1.12
    letterSpacing: "-0.022em"

  h2:
    fontFamily: Inter
    fontSize: "clamp(26px, 3.4vw, 36px)"
    fontWeight: 500
    lineHeight: 1.12
    letterSpacing: "-0.018em"

  h3:
    fontFamily: Inter
    fontSize: "clamp(20px, 2.6vw, 28px)"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "-0.018em"

  body-xl:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: 400
    lineHeight: 1.6

  body-lg:
    fontFamily: Inter
    fontSize: 17px
    fontWeight: 400
    lineHeight: 1.7

  body-md:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: 400
    lineHeight: 1.7

  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.6

  eyebrow:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "0.22em"
    textTransform: uppercase

  label:
    fontFamily: Inter
    fontSize: 12.5px
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "0.10em"
    textTransform: uppercase

  numeric:
    fontFamily: Inter
    fontWeight: 500
    fontVariantNumeric: tabular-nums
    letterSpacing: "-0.01em"

rounded:
  sm: 6px
  md: 10px
  lg: 12px
  xl: 18px
  "2xl": 22px
  "3xl": 28px
  pill: 9999px

spacing:
  section-y: 140px              # desktop
  section-y-tablet: 110px
  section-y-mobile: 80px
  section-y-tight: 96px
  section-x: 40px               # desktop page gutter; mobile uses 20px
  section-x-mobile: 20px
  hero-pad-top: 56px
  hero-pad-bottom: 96px
  hero-gap: 78px                # hero CTA row → visual/mock below it
  hero-gap-mobile: 48px
  container: 1320px
  container-narrow: 1200px
  card-padding: 28px
  bento-gap: 18px
  pill-gap: 10px                # the grid gap inside PillGroup

shadows:
  card: "0 1px 2px rgba(15,20,17,0.04)"
  lift: "0 8px 32px rgba(15,20,17,0.06)"
  deep: "0 20px 60px -15px rgba(15,20,17,0.18)"

motion:
  ease-standard: "cubic-bezier(0.4, 0, 0.2, 1)"
  duration-fast: 120ms
  duration-base: 200ms
  duration-slow: 320ms
  hover-lift: "translateY(-2px)"

breakpoints:
  sm: 640px
  md: 768px
  lg: 1024px
  xl: 1280px
  "2xl": 1440px

icons:
  library: lucide-react
  default-size: 18px
  default-stroke-width: 1.6
  hero-card-size: 12px
  bento-size: 26px
  bento-stroke-width: 1.4

constraints:
  gradients: forbidden
  shadows-on-buttons: forbidden
  fonts-other-than-inter: forbidden
  multiple-accent-colors: forbidden
  accent-per-screen: 1
---

# Bizak Design System

## Overview

Bizak is a unified cloud ERP — "The Operating System for Modern Business." This design system covers the marketing site (`bizakerp.com`) and the product app (`system.bizakerp.com`). One palette, one font, one accent, two scopes.

The aesthetic is **calm, technical, real-time**. Paper-cream surfaces, deep olive accents, a single lime pop colour, soft pistachio secondary. No gradients, anywhere. Live-data feel over static screenshots — pulsing status chips, streaming journal rows, auto-posting feeds. Inter end-to-end, including for IDs and numerical readouts (differentiate with `tabular-nums` + weight + tracking, never a font swap).

Bizak is sold as a **platform, not a point-tool**. Even module pages frame their module as a piece of a unified whole. Audience: finance directors and ops leads at ~50-person companies that have outgrown spreadsheets but don't want NetSuite/SAP. They want real-time visibility, not feature lists. Bizak is **early-stage and focused on South Asia** — this shapes the copy (see "The numbers rule" and "Regional framing" below).

## Brand voice (anchors copy choices)

- Confident, terse, technical-but-accessible. Short sentences.
- Outcomes over features, stated qualitatively. "Close month-end in hours, not weeks" beats "powerful close engine."
- Show, don't tell. A live-streaming journal panel says "real-time" louder than the word "real-time."
- No hedge words. No AI-magic clichés. Refer to AI features concretely.
- **No vanity metrics.** Bizak is early-stage — make no quantified claims about its scale, traction, or track record (see "The numbers rule").
- If a sentence works equally well for Salesforce or NetSuite, rewrite it.

**The six product narratives** — every page leans on a subset of:

1. **Real-time, not month-end** — every transaction posts the moment it happens.
2. **Single source of truth** — one DB, every module, no integration tax.
3. **No manual coding** — events auto-post their journals. Shipment → COGS / Inventory.
4. **Full audit trail** — every figure resolves to its source transaction.
5. **Multi-entity & multi-currency native** — designed from day 1 for multi-entity groups.
6. **Replaces the spreadsheet stack** — the honest foil is "Excel + QuickBooks + 4 SaaS subs."

### The numbers rule

Bizak is an early-stage company with a small, growing customer base. The site must **not** make quantified claims about Bizak's own scale, traction, track record, or age. Forbidden everywhere:

- **Customer / user counts** — "50,000+ companies", "thousands of teams".
- **Country counts** — "120+ countries", any "N countries" figure.
- **Track-record percentages** — "60% faster month-end", "40% fewer errors", "99.8% consolidation accuracy", "87.4% OEE" presented as a proven Bizak result.
- **Company-age claims** and **awards / partner-count vanity metrics**.

Express the same value **qualitatively** instead: "Growing businesses run on Bizak", "Close month-end in hours, not weeks", "Manual data entry, eliminated", "audit-ready every time".

**Still allowed:** *sample data inside product-mock UIs* — a mock dashboard tile, a sample journal amount, a chart trend. These illustrate how the **product** works; they are not claims about Bizak's size. Keep sample figures South-Asian.

### Regional framing — South Asia

Bizak's market is **South Asia**. Replace every "global" / "worldwide" / "120+ countries" with "across South Asia" / "the region". The canonical flag set, led by Nepal and India, is 🇳🇵 🇮🇳 🇧🇩 🇱🇰 🇵🇰 🇧🇹 🇲🇻 (Nepal, India, Bangladesh, Sri Lanka, Pakistan, Bhutan, Maldives). Multi-entity / multi-currency demos use South-Asian entities and currencies — Bizak Nepal (NPR / Rs), Bizak India (INR / ₹), Bizak Bangladesh (BDT), Bizak Sri Lanka (LKR), Bizak Pakistan (PKR). Drop USD / EUR / GBP entity examples.

## Colors

The new palette is **paper + olive + lime + pistachio**. Legacy sage aliases still resolve in code but are deprecated.

`src/styles/theme.css` is the **single source of truth** for every token — do not redeclare tokens in component files, and do not open a second `:root` block elsewhere. The values below mirror `theme.css`.

### Surfaces

- **Paper** `#FCFCF7` — primary page background. The default light surface. Also serves as section-tone A in the alternating rhythm.
- **Paper-warm** `#F4F5EF` — cards on paper, slightly warmer than the page bg.
- **Section-b** `#efefe9` — alternating section background, warmer cream. Pages alternate paper / section-b between consecutive content sections.
- **Surface** `#FFFFFF` — elevated card on light (rare; paper-warm is preferred).
- **Olive** `#1A2D20` — dark sections, hero canvas, dark bento cards. The dark counterpart to paper.
- **Olive-soft** `#243A2D` — lighter olive variant for hover or stratification within a dark surface.
- **Olive-dark** `#0A100D` — footer chrome only. The deepest olive.
- **Deep** `#0F1411` — pill-dark button fill. Slightly different shade from olive on purpose.

### Accents

- **Fire / Primary** `#d3f969` — **the single canonical pop colour**. Used for primary CTAs, "Live" status pills on dark surfaces, the single most important callout per screen. **Never more than one fire element per visible surface.**
- **Fire-soft** `rgba(211,249,105,0.10)` — tinted fire background (e.g., row-selected state).
- **Fire-mid** `rgba(211,249,105,0.20)` — tinted fire border.
- **Leaf / Secondary** `#DBE9B8` — pistachio. Soft secondary accent for pill backgrounds on dark, badge tints, leaf-tone bento cards.
- **Leaf-deep** `#A8C76C` — used sparingly for emphasis on pistachio surfaces.

### Text

- **Text** `#1A1D19` — body text on light. The default text colour.
- **Text-heading** `#2D332B` — h1/h2 marketing titles; slightly softer than body text.
- **Text-muted** `#5A6053` — description copy, meta labels, secondary text.
- **Text-soft** `#707064` — the muted span inside headings (e.g., the second half of "Replace spreadsheets, _and run smoothly._").
- **On-dark** `#FCFCF7` — body on olive.
- **On-dark-muted** `rgba(252,252,247,0.72)` — muted text on olive.
- **On-dark-soft** `rgba(252,252,247,0.55)` — captions on olive.

### Lines

- **Line** `#D8D9D3` — primary divider on light.
- **Line-soft** `#E5E5E0` — soft divider between rows / inside cards.
- **Border-soft** `#F0F1ED` — the softest hairline, barely-there separation.
- **Border-on-dark** `rgba(252,252,247,0.08)` — default border on olive.

### Status & semantic colour

The brand palette has **no dedicated success / warning / error tokens**. Status is carried by the **StatusChip** primitive, whose variants reuse the brand palette: `live` → fire, `posted` → leaf, `neutral` → paper-warm.

For destructive / validation states the only red in the system is the shadcn compatibility variable `--destructive` (`#d4183d`), consumed by `ui/*` form primitives — it is not a brand token and is not used on marketing surfaces.

The one tokenised non-brand colour set is the **file-type icon colours** — `file-pdf` `#D9382C`, `file-doc` `#2B579A`, `file-xls` `#217346`, `file-img` `#7A5AF8` — used only for document marks in the file-vault mock, deliberately kept outside the brand-accent family so they read as file marks, not page accents.

## Typography

**Inter is the only font family.** End-to-end — body, headings, IDs, SKUs, code-like identifiers, numerical readouts. **There is no mono font.** Differentiate numerical/identifier text with `font-variant-numeric: tabular-nums` + weight 500 + letter-spacing `-0.01em`, never a font swap.

Default marketing-heading weight is **500** (not 700) — the system reads calm and technical, not aggressive. (Raw un-classed `<h1>`–`<h4>` tags default to weight 300 in the base layer; the `Heading` primitive paints the 500 marketing weight.)

- **h1** — hero headline, weight 500, `clamp(32px, 4.5vw, 56px)`, tracking `-0.022em`, leading `1.12`.
- **h2** — section heading, weight 500, `clamp(26px, 3.4vw, 36px)`, tracking `-0.018em`, leading `1.12`. The second half of a heading commonly uses a **muted span** (`Text-soft` `#707064`) for a two-tone effect: _"Replace spreadsheets, **and run smoothly.**"_
- **h3** — card / bento title, weight 500, `clamp(20px, 2.6vw, 28px)`, tracking `-0.018em`.
- **Body lg** — description copy, 17px, weight 400, leading `1.7`.
- **Body md** — body, 15px, weight 400, leading `1.7`.
- **Body sm** — meta, 13px.
- **Eyebrow** — 12px, weight 500, uppercase, tracking `0.22em` — for "[01] HOW IT WORKS" section labels.
- **Label** — 12.5px, weight 500, uppercase, tracking `0.10em` — for form labels above inputs.
- **Numeric** — Inter, weight 500, `tabular-nums`, tracking `-0.01em`. Used for SKUs, document numbers (SO-1041), money amounts, percentages.

## Spacing & layout

- **Section vertical padding** — 140px desktop / 110px tablet / 80px mobile. A "tight" variant is 96px.
- **Hero section padding** — flat 56px top / 96px bottom on **all** viewports (no responsive variation — intentional).
- **Hero gap** — 78px desktop / 48px mobile, between the hero CTA pill row and the visual/mock below it. A token (`hero-gap`) applied by `.bz-hero-canvas` / `.bz-hero-visual` — never a hardcoded margin.
- **Content max-width** — 1320px default container, 1200px narrow container.
- **Page horizontal gutter** — 40px desktop / 20px mobile.
- **Bento gap** — 18px between cards in a `BentoGrid`.
- **Pill gap** — 10px, the grid gap inside `PillGroup`.

### Section rhythm (marketing pages only)

Consecutive content sections **alternate** between Paper (`tone="a"`) and Section-b (`tone="b"`). Dark olive sections (`tone="dark"`) appear sparingly for showcase blocks. This alternation is the new visual rhythm — a single uniform background reads flat; alternating tones give the eye chapter breaks.

Pattern: hero (b) → §01 (a) → §02 (b) → §03 (a) → testimonials (b) → FAQ (a) → footer.

### App screens (product app — NOT marketing)

Marketing rhythm does NOT apply. App screens are continuous surfaces with:

- **Left nav** — 240px expanded / 64px collapsed, `bg: olive`, `text: on-dark`, with a 1px dot-grid overlay at opacity 0.05.
- **Top bar** — 56px tall, `bg: surface`, bottom border `line-soft`.
- **Page header bar** — breadcrumb + page title (h2) on the left, action cluster on the right, bottom border `line-soft`.
- **Content area** — `bg: paper`, no alternation. Cards sit on `paper-warm` or `surface` with `line-soft` borders.

## Components

### Button (Pill)

The canonical CTA is a **pill** (`rounded-pill`), not a rectangle. Pills have semantic variants:

- **dark** — fill `deep` `#0F1411`, text `paper`. Primary CTA on light surfaces.
- **light** — fill `paper-warm`, text `text`, 1px border `line`. Secondary CTA.
- **accent** — fill `fire`, text `olive`. The primary CTA on dark surfaces.
- **leaf** — fill `leaf`, text `olive`. Soft accent CTA, often inside dark cards.
- **ghost** — transparent fill, 1px border `line`, text `text`. Tertiary action on light.
- **ghostDark** — transparent fill, 1px border `border-on-dark`, text `on-dark`. Secondary CTA / tertiary action on olive.

Sizes: **sm / md** only. Every pill carries **exactly one arrow** — `withArrow` (→) for internal hrefs, `withArrowUpRight` (↗) for external links (`system.bizakerp.com/*`). The legacy `withTick`, `iconLeft`, `iconRight` and `size="lg"` props were removed — do not use them.

**The 4 canonical CTA labels.** Every conversion CTA uses one of exactly four labels — never invent others:

- **Get Started** → `system.bizakerp.com/account/self-register` (default primary).
- **Free Trial** → same self-register URL (only when the page leads with the trial story).
- **Request Demo** → `/contact` (default secondary).
- **Talk to Sales** → `/contact` (lower-funnel direct contact).

**PillGroup.** Adjacent pill pairs — the hero CTA row, `SectionHead` actions, the closing-CTA card — are wrapped in `<PillGroup>`, a CSS-grid wrapper that gives both pills equal width (the wider label drives both), caps at 440px on desktop, and fills the container on mobile so both stay on one row. Solo pills (inside a `StepCard` / `BigCard` / `Bento` CTA slot, or a standalone nav pill) are left bare.

### Status chip

Small pill (`rounded-pill`, height 22px, padding 4px × 10px, weight 500, 11px) carrying semantic state. Variants:

- **live** — fill `fire`, text `olive`. Realtime / active.
- **posted** — fill `leaf`, text `olive`. Completed entry.
- **neutral** — fill `paper-warm`, text `text-muted`. Default.

Product-app status (draft / confirmed / shipped / invoiced / paid / overdue / cancelled) reuses these same three variants tinted from the brand palette — there is no separate semantic colour set.

### Card (Bento)

The most-used card shape. Variants by tone:

- **paper** — fill `paper-warm`, text `text`, border `line-soft`. Default light bento.
- **dark** — fill `olive`, text `on-dark`, with optional `dotGrid` overlay for texture.
- **fire** — fill `fire`, text `olive`. Used for the one most important bento per section.
- **leaf** — fill `leaf`, text `olive`. Soft accent bento.

Bentos compose: header (icon + title), description, optional CTA, optional footer (where micro-viz like `DataRow` / `MiniBars` / `JournalRow` lives). Hover state: `translateY(-2px)` + `shadow-lift`.

Radius: `rounded-2xl` (22px). Min-height typically 200–280px depending on the row's density.

### Hero pattern (marketing — one shape, all pages)

Every marketing hero is the same shell:

1. **Section** — `tone="b"` (warm cream surface), `pad="hero"` (56/96 flat).
2. **BadgeGreen** — pistachio confetti pill with a small emoji and label, above the h1. Margin-bottom 28px.
3. **Heading h1** — centered, with the second half in `Heading.Muted` for the two-tone effect. Margin-bottom 36px.
4. **CTA row** — a `<PillGroup>` wrapping two pills: **Get Started** (`variant="dark"`, `withArrowUpRight`) primary + **Request Demo** (`variant="light"`, `withArrow`) secondary. Use **Free Trial** in place of Get Started only when the page leads with the trial story.
5. **HeroCanvas** (optional) — dark olive panel with dot-grid texture, holding 1–3 floating cards (`HeroCard`) showing live, page-specific data. The mock inside is **invented for each page**, not copied.
6. **Marquee** — logo strip (optional) at the bottom.

The badge → heading → CTA spacing (margin-bottom 28 / 36) is the only place inline-style spacing is sanctioned — the heading's CSS sets `margin: 0` and the cascade is brittle. The gap *below* the CTA row is the `hero-gap` token, applied by `.bz-hero-canvas` (for a HeroCanvas) or `.bz-hero-visual` (for a page-specific paper-surface mock) — never a hardcoded `mt-*`. Everywhere else, use className.

### Closing CTA — owned by Footer

The "Take full control of …" moment is **owned by the Footer**, never a page-level dark section. Pages pass a `cta` prop to `<Footer>` in the route layout (or `hideCta` to drop the zone). The Footer's CTA zone is a centered block on the footer surface — dark olive by default, light when `isLightMode` is set: an h2 with a muted second span + description + a `<PillGroup>` of two pills (`Get Started` + `Request Demo`). It is a flat surface, not a photo card.

### Section head

Every marketing section opens with a `SectionHead`: optional eyebrow `[01] HOW IT WORKS` + h2 (with optional Muted span) + optional description + an optional pair of action pills (wrapped in a `<PillGroup>`) on the right.

### Data table (app only)

- Wrapper: `bg: surface`, `border: line-soft`, `rounded: lg`.
- Header row: `bg: paper-warm`, text `text-muted`, 11.5px uppercase tracking `0.12em` weight 500. Sortable headers show a small arrow lucide icon.
- Body rows: 56–64px height, separator `line-soft`, hover `bg: paper-warm` at 60% opacity.
- Selected row: `bg: fire-soft`, left border 2px `fire`.
- Money cells: right-aligned, `tabular-nums`.
- Status cells: use StatusChip.
- Click row → detail view (no row-click jank — make the entire row a link).

### Form

- Single column, max-width 920px, left-aligned (not centered).
- Form sections are cards: `bg: surface`, `border: line-soft`, `rounded: lg`, 28px padding, 20px gap between sections.
- Section header: 24px icon-badge (rounded-md, `bg: paper-warm`) + title (h3) + helper text.
- Field label: 12.5px uppercase tracking `0.10em` `text-muted`, above the input.
- Input: 40px height, `rounded: md`, `border: line`, `bg: surface`, 14px Inter, focus ring `ring-2 ring-fire/40`.
- Validation: error text below field, 12px in the shadcn `destructive` colour.
- Sticky form header at top with primary/secondary save actions. Sticky totals card bottom-right on long forms.

### Inputs

Plain, generous, calm:

- Height 40px (md) or 32px (sm).
- `rounded: md` (10px).
- 1px `border: line`, transparent fill on light (or `bg: surface` for prominence).
- Focus: `border: olive`, `ring: 2px fire/40`.
- Placeholder: `text-soft`.

## Iconography

**Lucide only.** Import `lucide-react` directly. Default size 18px, stroke width 1.6. Inside HeroCards use 12px; inside Bentos use 26px stroke 1.4. Never `material-symbols-outlined`, never `@mui/icons-material`, never a per-file SVG dictionary.

## Motion

Soft and brief. Hover lifts by 2px with a 200ms ease-standard. Section reveals fade-in 320ms with a 16px upward translate. No bounce, no parallax, no scroll-triggered carousels. Loading states are skeleton placeholders in `paper-warm`, not spinners.

## Imagery & data-feel

**Live data over static screenshots.** Hero canvases and showcase blocks show flowing data — pulsing "Live" pills, streaming journal rows, OEE gauges, auto-posting feeds, multi-entity FX columns. This is the visual language of the "real-time" narrative. Mocks compose **micro-viz primitives** (DataRow, MiniBars, EntityRow, JournalRow, StripeBar, ModuleListItem, StatTile) rather than full screenshot crops.

Photography (used sparingly — e.g. case-study pages) is desaturated, olive-tinted, warehouse / factory / workspace scenes — never people on laptops smiling at the camera. The Footer closing-CTA zone is a flat surface, not a photo card.

## Do's and Don'ts

### Do

- **Use lime `#d3f969` sparingly** — at most one element per visible surface. Usually the primary CTA. Sometimes the single most important positive delta.
- **Alternate section backgrounds** on marketing pages — paper / section-b / paper / section-b. Dark olive sections sparingly.
- **Use South-Asian sample data in mocks** — "Rs 12,42,180", not "$1.2M"; NPR / INR entities; the canonical flag set. Sample figures inside product mocks are fine — headline copy makes no quantified claims about Bizak (the numbers rule).
- **Show live data** in hero mocks — status chips, journal rows, auto-posting feeds. The audit trail and the journal-posting preview prove the product narratives, so make them visually proud.
- **Use the two-tone heading** — second half in `text-soft` for the muted-span effect.
- **Use tabular-nums + weight 500** for any number you want to read as monospace — SKUs, document IDs, money amounts. Never a mono font.
- **Pair primary + secondary pills inside `<PillGroup>`** — Get Started (`dark`, ↗) + Request Demo (`light`, →).

### Don't

- **No gradients.** Anywhere. No `linear-gradient`, `radial-gradient`, or `conic-gradient` for cards, buttons, glows, dividers, badges, hero backgrounds, anything. Depth comes from flat fills + shadows + the dot-grid overlay.
- **No second font.** No Hedvig, Manrope, Poppins. No `font-mono`. IDs and SKUs stay Inter — differentiate with tracking, weight, or color.
- **No multiple lime accents on one screen.** If you find yourself adding a second `fire` element, demote one to `leaf` or `text-muted`.
- **No invented CTA labels or removed Pill props.** Conversion CTAs use only the 4 canonical labels; every Pill carries exactly one arrow (`withArrow` / `withArrowUpRight`). The `withTick`, `iconLeft`, `iconRight` and `size="lg"` props were removed.
- **No vanity metrics.** No customer counts, country counts, track-record percentages, or awards as Bizak claims. Express value qualitatively.
- **No closing CTA as a page section.** It goes in the Footer's `cta` prop.
- **No `paddingTop: 76px`** to offset a header — the header is no longer fixed.
- **No per-file color objects** (`const C = {…}`). Tokens only.
- **No rounded-md / rounded-lg from Tailwind default scale.** Use `rounded-bz-md` / `rounded-bz-lg` from this system's scale.
- **No mixed rounded and sharp corners** in the same view. Pills are pill-shaped; cards are `rounded-2xl`; inputs are `rounded-md`; that's the vocabulary.
- **No SaaS adjective stacks** ("powerful, intuitive, modern, scalable…"). No hedge words. No calling Bizak a "tool" or "app" — it's a platform / operating system.

## Accessibility

- All text on light surfaces meets 4.5:1 contrast at body sizes; 3:1 at h2+ sizes.
- Lime `#d3f969` on olive `#1A2D20` carries the brand pop and meets 11.4:1.
- Lime on white fails small-body contrast — never use `fire` for body text on light. It is a **fill** colour, not a text colour, on paper.
- Focus rings are 2px `fire` at 40% opacity — visible against both paper and olive.
- Every interactive element has a `:hover`, `:focus-visible`, and (for inputs) `:invalid` state.
- Lucide icons are decorative when paired with a label; aria-hidden in that case.

## Scope: marketing vs product app

The design language is global; the layouts diverge:

| Scope | Marketing site (`bizakerp.com`) | Product app (`system.bizakerp.com`) |
|---|---|---|
| Layout shell | Header + page + Footer (with CTA prop) | Left nav + top bar + page content |
| Section rhythm | Alternating tone="a" / tone="b" | Continuous surface, no alternation |
| Hero | Centered shell + HeroCanvas + Marquee | Page header bar + KPI strip |
| Recurring shapes | Section, BentoGrid, BadgeGreen, StepCard, BigCard, Marquee, Carousel, Accordion | Data table, detail two-column, create form, side drawer, command palette |
| Closing CTA | Owned by Footer | None — app screens don't have a closing CTA |
| Lime accent budget | One per surface (usually a hero CTA or a featured bento) | One per screen (usually the primary CTA in the page header) |

What carries over completely: palette, Inter type scale, no gradients, lucide icons, radii tokens, status chip vocabulary, the dark-olive surface with dot-grid texture, the live-data visual signature.

## The one mental model

Pages are **composition + data**. Primitives own colour, spacing, type, hover, breakpoints. Tokens own all values. The hero is one shape; section structure is freely invented per page within a fixed design language. Live data over static screenshots. Single lime accent per surface. Inter and only Inter. No gradients, no exceptions.

That's the system. Anything that violates it isn't Bizak.
