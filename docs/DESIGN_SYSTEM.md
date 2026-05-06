# Bizak Design System

This document is the long-form reference for the design system. Quick rules
for AI assistants live in `/CLAUDE.md` at the project root. Everything below
is the *why* and *how* — read this when you're adding a new primitive,
adjusting tokens, or migrating a legacy page.

---

## 1. Architecture

```
src/
├── styles/
│   ├── index.css        — entrypoint, imports the others
│   ├── fonts.css        — Google Fonts (Inter + Material Symbols)
│   ├── tailwind.css     — Tailwind 4 + tw-animate-css
│   ├── theme.css        — DESIGN TOKENS (the source of truth)
│   └── style.css        — legacy hp-* homepage CSS (do not extend)
├── app/components/
│   ├── marketing/       — primitives (Container, Section, Eyebrow, …)
│   ├── ui/              — shadcn primitives (Button, Card, Dialog, …)
│   └── *Page.tsx        — pages: composition + content data
└── ...
```

The design system has three layers:

1. **Tokens** (`theme.css`) — colors, type scale, radii, spacing, shadows.
   Defined as CSS custom properties (`--bz-*`) and re-exposed as Tailwind 4
   utilities via `@theme inline { ... }`.
2. **Primitives** (`marketing/`) — small React components. className-driven
   with `class-variance-authority` variants. Compose pages from these.
3. **Pages** — content data + composition. No styling decisions live here.
   No hex literals, no per-file `const C = {...}` objects.

---

## 2. Tokens

### 2.1 Colors

| Token | Value | When to use |
|---|---|---|
| `--bz-sage` / `bg-bz-sage` | `#7A826D` | Primary brand. Eyebrow text, icon badges, primary borders on light. |
| `--bz-sage-hover` | `#616857` | Hover state of sage-filled buttons. |
| `--bz-sage-soft` | `rgba(122,130,109,0.10)` | Backgrounds for sage-tinted icon containers, soft pills. |
| `--bz-sage-mid` | `rgba(122,130,109,0.20)` | Slightly stronger tint. |
| `--bz-accent` / `bg-bz-accent` | `#C7FF35` | Lime accent. CTA buttons on dark, "LIVE" pills, key numbers on dark. **One canonical value across the site** — do not also use `#D4F24D`. |
| `--bz-accent-soft` | `rgba(199,255,53,0.10)` | Accent-tinted backgrounds. |
| `--bz-accent-mid` | `rgba(199,255,53,0.20)` | Accent-tinted borders. |
| `--bz-bg` / `bg-bz-bg` | `#F8F9F7` | Page off-white. Default `<Section tone="light">`. |
| `--bz-bg-alt` | `#FBFBFB` | Slight variation when alternating sections. |
| `--bz-surface` / `bg-bz-surface` | `#FFFFFF` | Cards on a light background. `<Section tone="white">`. |
| `--bz-deep` / `bg-bz-deep` | `#1A1D19` | Canonical dark surface. Hero on dark, CTA, careers. |
| `--bz-deep-2` / `bg-bz-deep-2` | `#121212` | Deeper dark for footer or contrast. |
| `--bz-text` / `text-bz-text` | `#333333` | Body and heading on light. |
| `--bz-text-muted` / `text-bz-text-muted` | `#666666` | Description copy, secondary labels. |
| `--bz-text-soft` / `text-bz-text-soft` | `#999999` | Captions, disabled. |
| `--bz-border` / `border-bz-border` | `#E8EAE4` | Default border on light surfaces. |
| `--bz-border-soft` / `border-bz-border-soft` | `#F0F1ED` | Dividers between rows in cards. |

For dark surfaces, prefer Tailwind opacity utilities: `text-white/60`,
`border-white/10`, `bg-white/[0.04]`. These compose better than declaring
new tokens for every alpha level.

### 2.2 Typography

**Font family:** `Inter` (sans-serif). Loaded once in `fonts.css`. Weights
300, 400, 500, 600, 700 are available.

**Scale (CSS custom properties):**

| Token | Value | Use for |
|---|---|---|
| `--bz-text-h1` | `clamp(40px, 5vw, 64px)` | Hero headline (fluid) |
| `--bz-text-h2` | `clamp(30px, 4vw, 48px)` | Section heading |
| `--bz-text-h3` | `22px` | Card title |
| `--bz-text-xl` | `20px` | Large body / lead paragraph |
| `--bz-text-lg` | `17px` | Description copy |
| `--bz-text-base` | `15px` | Body |
| `--bz-text-sm` | `13px` | Meta, secondary labels |
| `--bz-text-eyebrow` | `11px` | Uppercase eyebrow |

Note: `<SectionHeading>` already encodes the canonical heading sizes via
its `level` prop. Use it instead of writing raw `<h1>`/`<h2>` for marketing
sections.

**Tracking (letter-spacing):**
- `--bz-tracking-eyebrow` (`0.12em`) — uppercase eyebrows
- `--bz-tracking-tight` (`-0.02em`) — h2/h3
- `--bz-tracking-tighter` (`-0.03em`) — h1

**Leading:** `1.7` for body copy, `1.1` for headings.

### 2.3 Radii

`--bz-radius-sm` 6, `--bz-radius-md` 8, `--bz-radius-lg` 12,
`--bz-radius-xl` 16, `--bz-radius-2xl` 20, `--bz-radius-pill` 9999.

Tailwind utilities: `rounded-bz-sm`, `rounded-bz-md`, … `rounded-bz-pill`.
**Do not** use Tailwind's default `rounded-md` / `rounded-lg` — they map
to a different scale. Stick to the `bz-` variants.

### 2.4 Spacing

| Token | Value | Use for |
|---|---|---|
| `--bz-section-y` | `96px` | Vertical padding of marketing sections |
| `--bz-section-x` | `24px` | Horizontal page gutter |
| `--bz-container` | `1320px` | Default content max-width |
| `--bz-container-narrow` | `1200px` | Narrower hero/CTA pages |
| `--bz-header-h` | `76px` | Fixed Header height (used by `pad="hero"`) |

`<Section>` and `<Container>` already encode these — use them.

### 2.5 Shadows

`--bz-shadow-card` for default cards, `--bz-shadow-lift` for hover state,
`--bz-shadow-deep` for dashboard/hero floating cards.

**No gradients.** Project rule. Use shadows + flat fills + dot patterns for
depth. If you find a gradient in legacy code, replace it with a flat color
or shadow when migrating.

---

## 3. Primitives

### Container

```tsx
<Container>...</Container>                      // 1320px max
<Container width="narrow">...</Container>       // 1200px max
<Container as="header">...</Container>
```

Provides `mx-auto` + `px-6`. Don't add another wrapper for centering.

### Section

```tsx
<Section tone="light" pad="default">...</Section>     // default: bg-bz-bg, py-24
<Section tone="white">...</Section>                   // bg-bz-surface
<Section tone="dark">...</Section>                    // bg-bz-deep, white text
<Section tone="deeper">...</Section>                  // bg-bz-deep-2
<Section pad="compact">...</Section>                  // py-16
<Section pad="hero">...</Section>                     // pt-[140px], accounts for fixed header
```

### Eyebrow

```tsx
<Eyebrow>Our Culture</Eyebrow>                        // sage by default
<Eyebrow tone="accent">LIVE</Eyebrow>
```

Renders as small uppercase 0.12em-tracked text. Used standalone or inside
`<SectionHeading eyebrow="..." />`.

### SectionHeading

```tsx
<SectionHeading
  eyebrow="Capabilities"
  title="What Bizak does"
  description="One sentence of supporting copy."
  level="h2"          // h1 | h2 | h3
  tone="dark"         // dark | light  (light = on dark backgrounds)
  align="left"        // left | center
  maxWidth={640}      // optional content width clamp
/>
```

`title` accepts JSX so you can do `<>Headline with <span className="text-bz-accent">accent</span>.</>`.

### Button

```tsx
<Button variant="primary">Request Demo</Button>              // dark bg, white text
<Button variant="accent" withArrow>Get started</Button>      // lime, dark text — main CTA
<Button variant="outline">Learn more</Button>                // bordered light
<Button variant="ghost">Cancel</Button>                      // borderless light
<Button variant="ghostDark">Browse</Button>                  // for dark sections

<Button href="/contact">As link</Button>                     // renders <a>
<Button onClick={...}>As button</Button>                     // renders <button>

<Button size="sm">Small</Button>
<Button size="md">Medium</Button>     // default
<Button size="lg">Large</Button>      // hero CTAs
```

### Card

```tsx
<Card>...</Card>                            // tone=light, pad=md
<Card tone="soft">...</Card>                // bg-bz-bg
<Card tone="dark">...</Card>                // for dark sections
<Card pad="lg" hover="lift">...</Card>      // hover lifts +2px with shadow
<Card hover="glow">...</Card>               // hover tints accent
```

### Stat

```tsx
<Stat value="50,000+" label="businesses powered" />
<Stat value="98.2%" label="uptime" tone="light" size="lg" align="center" />
```

### IconBadge

```tsx
<IconBadge tone="sage"><ShieldCheck className="size-5" /></IconBadge>
<IconBadge tone="accent" size="lg"><Zap className="size-6" /></IconBadge>
<IconBadge tone="darkSurface"><Layers className="size-5" /></IconBadge>
```

### PillBadge

```tsx
<PillBadge tone="accent" dot>LIVE</PillBadge>
<PillBadge tone="sage">NEW</PillBadge>
<PillBadge tone="neutral">v2.4</PillBadge>
```

---

## 4. Page recipe

```tsx
import { Container, Section, SectionHeading, Card, Button, Stat } from "./marketing";
import { Factory, ShieldCheck, Zap } from "lucide-react";

// 1. Data first (extractable, easy to localize)
const FEATURES = [
  { icon: Factory,     title: "Production",  body: "..." },
  { icon: ShieldCheck, title: "Compliance",  body: "..." },
  { icon: Zap,         title: "Automation",  body: "..." },
];

// 2. Sections as small components
function HeroSection() {
  return (
    <Section tone="dark" pad="hero">
      <Container width="narrow">
        <SectionHeading
          eyebrow="Module"
          title={<>Run finance with <span className="text-bz-accent">clarity</span>.</>}
          description="Streamline ledger to report in one platform."
          level="h1"
          tone="light"
          maxWidth={640}
        />
        <div className="mt-10 flex gap-4 flex-wrap">
          <Button variant="accent" href="/contact" withArrow>Request Demo</Button>
          <Button variant="ghostDark" href="#features">View features</Button>
        </div>
      </Container>
    </Section>
  );
}

function FeaturesSection() {
  return (
    <Section tone="light">
      <Container>
        <SectionHeading
          eyebrow="Capabilities"
          title="Everything you need"
          description="..."
          maxWidth={640}
          className="mb-16"
        />
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

// 3. Page = composition
export function MyPage() {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
    </>
  );
}
```

---

## 5. Migration checklist (for legacy pages)

When converting a page that still uses inline-style + per-file `const C = {...}`:

1. **Remove `const C = {...}`.** Map every reference to a token equivalent. If a value isn't tokenized yet, add it to `theme.css` first.
2. **Remove non-Inter font references.** No `'Manrope'`, `'Poppins'`, etc. — the site loads Inter only.
3. **Replace `style={{ ... }}` blobs with className.** Inline `style` is reserved for genuinely dynamic values (`width: ${pct}%`). Static values move to className.
4. **Replace `onMouseEnter`/`onMouseLeave` style mutations** with Tailwind `hover:` utilities.
5. **Replace inline `<svg>` icons** with `lucide-react` equivalents where they exist. Keep custom SVG only for genuinely bespoke art.
6. **Replace bespoke `<section style={...}>`** with `<Section tone="..." pad="...">`.
7. **Replace bespoke heading blocks** with `<SectionHeading eyebrow=... title=... description=... />`.
8. **Replace bespoke buttons** with `<Button variant=... />`.
9. **Replace bespoke cards** with `<Card tone=... hover=... />`.
10. **Remove gradients.** Replace `linear-gradient(...)` and `radial-gradient(...)` with flat colors, dot patterns, or shadows.
11. **Verify the build:** `npm run build`. Eyeball the page in dev (`npm run dev`).

---

## 6. When to add a new primitive

Add to `marketing/` if:

- The pattern shows up in **2+ pages** with the same structure.
- It bundles a meaningful design decision (spacing, type, color combo) you don't want each page to re-decide.
- It would otherwise be copy-pasted JSX.

Don't add a primitive for one-off layouts. A `<div className="grid ...">` inside a page is fine if it only happens once.

When you do add one:

1. Place it in `src/app/components/marketing/<Name>.tsx`.
2. Export it from `marketing/index.ts`.
3. Use `cva` for variants if there are >2 options per axis.
4. Document the prop API in this file (Section 3).
5. Update `/CLAUDE.md` rule list if relevant.

---

## 7. Things still on the todo list

- Migrate the remaining marketing pages (FinancialManagement, SalesCrm, Inventory, Manufacturing, Purchasing, Distribution, Retail, ProfessionalService, ProjectAndJobCosting, SalesForceManagement, DashboardAndReporting, Integrations, Multicompany, DocumentManagement, WhyBizak, Workflow, Partners, CaseStudies, Blog, About, Contact). Migrate opportunistically when touched.
- Remove `@mui/icons-material` and `@mui/material` from `package.json` once the codebase no longer references them.
- Reconcile the duplicate `/Manufacturing` route registration in `routes.tsx` (both `Manufacturing.tsx` and `ManufacturingPage.tsx` map there).
- Decide whether `src/styles/style.css` should be split into `homepage.module.css` once the page is fully migrated.
