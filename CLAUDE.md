# Bizak Website — Project Instructions

This file is the always-loaded rule set for this repository. Read it before
touching any page, component, or styling. The full design system reference
lives in `docs/DESIGN_SYSTEM.md`.

## What this project is

Marketing site for **Bizak ERP** ("The Operating System for Modern Business").
React 18 + Vite 6 + Tailwind 4 + react-router 7. Deploys to GitHub Pages
(`bizakerp.com`). Built originally from a Figma export — the page-by-page
export style is why every page used to redeclare its own colors. **That is no
longer how we work.**

## The single most important rule

**Do NOT redeclare design tokens in component files.** No more
`const C = { sage: "#7A826D", accent: "#C7FF35", ... }` at the top of a page.
Brand tokens live in **one place**: `src/styles/theme.css`. They are exposed
as both CSS custom properties (`var(--bz-sage)`) and Tailwind utilities
(`bg-bz-sage`, `text-bz-text-muted`, `rounded-bz-lg`).

If a value you need isn't a token yet, **add it to `theme.css` first**, then
use it. Don't shortcut with a hex literal.

## Design system at a glance

| Layer | Location | Purpose |
|---|---|---|
| Tokens | `src/styles/theme.css` | colors, type scale, radii, spacing, shadows |
| Fonts | `src/styles/fonts.css` | **Inter only** + Material Symbols (legacy, prefer lucide) |
| Marketing primitives | `src/app/components/marketing/` | `Container`, `Section`, `Eyebrow`, `SectionHeading`, `Button`, `Card`, `Stat`, `IconBadge`, `PillBadge` |
| shadcn primitives | `src/app/components/ui/` | low-level Radix components (Button, Card, Dialog…) |
| Page CSS | `src/styles/style.css` | homepage-specific bespoke CSS (`hp-*` prefix) — kept for the dashboard mockup; do **not** add new pages here |
| Pages | `src/app/components/*.tsx` | composition of primitives + content data |

Import primitives from the barrel:

```tsx
import { Section, Container, SectionHeading, Button, Card } from "./marketing";
```

## Hard rules

1. **One font family: Inter.** It's the only family loaded in `fonts.css`. Do not introduce Manrope, Poppins, Roboto, or anything else without first adding the `@import` to `fonts.css`. References to unloaded fonts silently fall back and create real visual bugs.
2. **One icon library for marketing pages: `lucide-react`.** Already a dep, used by the Header. Do not bring in `@mui/icons-material`, do not use Material Symbols (`<span className="material-symbols-outlined">`) in *new* code. Existing usage in `HomePage.tsx`'s dashboard mockup may stay until rewritten.
3. **No gradients.** Project rule (`linear-gradient`, `radial-gradient`, conic-gradient). Use flat fills, layered solid colors, subtle dot patterns, or shadows for depth. This includes "glow" mesh backgrounds.
4. **`className` over inline `style`.** Never use `onMouseEnter`/`onMouseLeave` to mutate `e.currentTarget.style` — use Tailwind `hover:` utilities. The only legitimate inline `style` is for **dynamic values that can't be expressed in className** (e.g., a computed `width: ${pct}%` for a progress bar, or `style={{ maxWidth: 560 }}` when the value comes from a prop).
5. **No per-file color objects.** No `const C = {...}` at the top of a page file. Use tokens.
6. **Keep page files small.** Pages should be composition + data arrays. If a section grows past ~80 lines of JSX, extract it into a sibling component or a primitive.
7. **No new files in `src/styles/style.css`.** That file is reserved for the homepage's bespoke dashboard/iso/floating-card animations. New page-level styles go in component className.

## Available primitives

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
```

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

- **Touching a page = migrating it.** When you edit a marketing page that still uses the old per-file `C = {...}` pattern, migrate the parts you touch to primitives + tokens. Don't bandaid the inline-style world.
- **Adding a new section pattern?** First check if a primitive already covers it. If not, propose adding one to `marketing/` *before* one-offing it inside a page.
- **Verifying changes.** After non-trivial edits, run `npm run build` (Vite's TS check + bundling). The dev server (`npm run dev`) is on port 5173 — start it for visual verification of UI changes.
- **Routing.** Routes are in `src/app/routes.tsx`. There's a known duplicate route registration for `/Manufacturing` (both `Manufacturing.tsx` and `ManufacturingPage.tsx` map to it) — flag it before touching that route, don't silently fix.
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

The full reference (token names, values, rationale, migration checklist) is at
`docs/DESIGN_SYSTEM.md`. The `/redesign-page` skill at
`.claude/skills/redesign-page/SKILL.md` is the canonical workflow when
converting a page to the new system.

When something about the design system changes, update both this file and
`docs/DESIGN_SYSTEM.md`. Keep them in sync.
