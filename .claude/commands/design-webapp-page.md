---
description: Design a NEW Bizak web-app (product UI) page from a page description + behavioural component spec. Follows the app design system (AppShell + bz-* tokens, NOT the marketing bz/ primitives). You own hierarchy, layout, structure and UX — reason hard and design around the page's primary action.
argument-hint: <page name> — then paste the page description and/or behaviour-only component inventory
---

# Design a web-app page

You are designing a **new product/web-app screen** for Bizak ERP — the kind of
screen that lives behind the login, inside the application shell (sidebar + top
bar), like the Sales Order list/form/detail, the Custom-Form builder, and the
Role & Permission manager. This is **NOT a marketing page.**

Read this whole prompt, then **think deeply before writing any code.** The
quality of the result depends almost entirely on how well you (a) infer the
user's *primary action* and (b) shape a hierarchy around it. Do that reasoning
first; only then build.

---

## Your authority and mandate (read this twice)

**You have full authority over the UI.** Hierarchy, structure, layout, which
component goes where, how things are grouped, sizing, spacing, what's primary vs
secondary, what collapses, what's a table vs cards vs a master-detail split —
**all of that is yours to decide.** The user is handing you a *page description*
and a *behaviour-only component inventory*; they are deliberately **not**
prescribing layout. Do not hand that decision back to them.

- **Design around the primary action.** From the brief, work out the ONE thing
  the user is on this screen to do (create a record? scan & act on many? grant
  access? configure something?). Make that the centre of gravity. Everything
  else is arranged to serve it. State your read of the primary action to
  yourself before you lay anything out.
- **Be creative; reinvent the structure for THIS page.** Do not clone the
  most-recently-built design page's section list, header shape, or mocks with
  the labels swapped. Two app pages should not feel like the same page with
  different strings. The design *language* (below) is the constant; the *layout
  and structure* are yours to invent.
- **Reason about UX, not just fit.** Think about scanning order, what the eye
  hits first, how many decisions per screen, where the user's hands go, what the
  empty/loading/error moments feel like. Optimise for the best experience of the
  primary action.
- **Don't pepper the user with layout questions.** Decide. Only ask a clarifying
  question if the page's *purpose* or a *critical data point* is genuinely
  ambiguous and you cannot proceed with a sensible default — never to outsource a
  design decision.

---

## What you're building on (the app subsystem — distinct from marketing)

This repo has **two** design subsystems. You are working in the **app** one.

| | Marketing site | **App pages (THIS command)** |
|---|---|---|
| Vocabulary | `bz/` primitives (`Section`, `Pill`, `HeroCanvas`, `PillGroup`, `Footer cta`) | `AppShell` + local atoms composed à la the `*DesignPage` files |
| Shell | `<Header>` / `<Footer>` marketing chrome | `<AppShell>` = sidebar + top bar + scrollable main + overlay slot |
| Lives at | `/`, `/financial-management`, … | `/design/<slug>` |
| Reference | `HomePage.tsx`, `docs/DESIGN_SYSTEM.md` | the files listed below |

**Do NOT import the marketing `bz/` primitives or anything from `marketing/`**
(no `HeroCanvas`, `PillGroup`, `Section`, `Footer cta`, etc.) into an app page.
The app pages use plain Tailwind with the `bz-*` **tokens**, the `AppShell`, and
small local atoms (Switch, StatusChip, portal dropdowns, …).

What you DO inherit from `/CLAUDE.md`: **Inter only** end-to-end (incl.
code-like identifiers — differentiate with weight/letter-spacing/`tabular-nums`,
never a font swap), **no gradients ever**, **lucide-react only** for icons,
**className over inline `style`** (inline only for genuinely dynamic values), no
per-file `const C = {…}` colour objects, all colour via `bz-*` tokens/utilities.

---

## Step 1 — Study the references (do this first, every time)

Read these before designing. They define the actual API of `AppShell`, the atom
patterns, the token usage, and the interaction conventions. Don't guess them.

- `src/app/components/SalesOrderListDesignPage.tsx` — **owns the exported
  `AppShell`** (`{ breadcrumb, topBarTone?, overlay?, children }`), plus the
  list/table pattern, pulse tiles, filter drawer, status-chip vocabulary, flat
  micro-viz (StackBar/MeterBar — no donuts/sparklines/gradients), loading &
  empty states.
- `src/app/components/SalesOrderFormDesignPage.tsx` — create/edit form: portal
  dropdowns (type-to-filter, create-new, advanced-search), lookup fields,
  editable line grid, tabs, classification/custom-field collapsibles, save +
  spinner.
- `src/app/components/SalesOrderDetailDesignPage.tsx` — read-only record:
  calm header, lifecycle bars, quiet rail, one tab strip, docked toast.
- `src/app/components/CustomFieldsBuilder.tsx` — **master-detail editor**:
  list ⇄ inspector, live counts, reducer state, drag-reorder, save/dirty/toast,
  popovers, segmented controls, the `Switch` atom, empty/placeholder states.
- `src/app/components/RolePermissionDesignPage.tsx` — master-detail access
  matrix: reactive counts, cascading toggles, conditional table vs matrix,
  lazy/paginated picker, docked footer via the `overlay` slot.
- `src/app/components/DesignSidebar.tsx` and `DesignTopBar.tsx` — the shell nav;
  you'll add your page to the sidebar groups.

Pick the reference whose *shape* is closest to your page's primary action and
learn its idioms — but **invent your page's own structure**, don't relabel it.

---

## Step 2 — App design-system cheat-sheet (so you get the details right)

**Shell.** Every page returns `<AppShell breadcrumb={…} overlay={…}>…</AppShell>`.
Pages never render their own sidebar/top bar. Breadcrumb is a ReactNode:
`<span className="text-bz-text-muted">Section</span>` + `<ChevronRight size={11} className="text-bz-text-soft"/>` + `<span className="font-semibold text-bz-text">Page</span>`.
The `overlay` slot sits below `<main>` in the flex column — put a **docked
footer** there (it stays put while `main` scrolls) and `position:fixed` toasts/
drawers.

**Surfaces.** App bg `bg-bz-section-b`. Header bands `bg-bz-paper` with
`border-b border-bz-line`. Cards `rounded-bz-lg border border-bz-line-soft
bg-bz-surface`. Inset/zebra `bg-bz-paper-warm`. Dark/olive sparingly.

**Accent + state colour.** `bz-fire` (`#d3f969` lime) is the single pop / the
"on" state (switches, selection bars, active toggles). `bz-leaf` / `bz-leaf-deep`
secondary. **Danger uses literals** (no token): bg `#FBE5E2`/`#FBE7E5`, text
`#9A2E29`, dot `#C0413A`.

**Type.** Small and dense: section labels `text-[10px] font-bold uppercase
tracking-[0.14em] text-bz-text-soft`; body 11–13px; page title ~22–26px
`font-semibold tracking-tight`. **`tabular-nums` on every number** (ids, counts,
money, dates). Text colour ladder: `text-bz-text` → `-muted` → `-soft`.

**Radii.** `rounded-bz-sm|md|lg|pill`. Buttons/inputs ~`h-8`/`h-9`.

**Primary button.** `bg-bz-deep text-bz-text-on-dark` + `<Loader2 className="animate-spin"/>`
while pending + `disabled:opacity-…`. Ghost: `border border-bz-line bg-bz-surface
hover:bg-bz-paper-warm`.

**Status chip.** dot + label, five tones (positive/partial/pending/danger/
neutral) — copy the `StatusChip` pattern from the list/detail page.

**Switch atom.** `role="switch"`, ~`h-[18px] w-8`, `bz-fire` track when on, sliding
knob — copy from `CustomFieldsBuilder`/`RolePermissionDesignPage`.

**Menus / dropdowns.** Use `createPortal`, anchor off `getBoundingClientRect()`,
close on outside-click / Esc / scroll, type-to-filter — copy the `Dropdown` /
`Popover` patterns. `cn` comes from `./ui/utils`.

**Micro-viz.** Flat thin bars only (segmented or meter), legends with a dot +
`tabular-nums` value. No gradients, donuts, sparklines.

If a value/utility you need doesn't exist as a token, it almost certainly does —
check `src/styles/theme.css` before reaching for a hex literal (danger colours
are the only sanctioned literals).

---

## Step 3 — Turn the brief into a design

The user's brief is a **page description** plus a **behaviour-only component
inventory** (each item describes *what a component does* and its *states* —
never its layout). For each item:

1. **Decide its concrete UI** — what shape best serves it given the primary
   action (a master list? a docked footer? a metric strip? a collapsible
   group? a conditional table?). The inventory's order is **not** a layout
   order; regroup freely.
2. **Build every state it names.** App mockups are genuinely interactive. If a
   component says loading/empty/no-results/disabled/selected/expanded/error —
   build each variant with `useState`/`useReducer`, not a static snapshot.
3. **Wire the reactivity.** Counts, badges, ratios, status indicators,
   select-all/expand affordances must recompute live from state (derive with
   `useMemo`). If the brief implies cascading (a higher scope toggles everything
   beneath), implement it for real.
4. **Honour any text/transform rules** the brief specifies (e.g. cleaning an
   action name, mapping a type → icon) as real functions.
5. **Use realistic, self-consistent seed data.** Numbers that are supposed to
   reconcile must reconcile. Match the house context where it fits (the existing
   pages use Nepal/NPR, multi-subsidiary ERP data) unless the brief says
   otherwise.

Keep the page file as **composition + data + small local atoms**. Extract a
local atom/sub-component once a block repeats or a section gets unwieldy — mirror
how the reference files are organised (banner comments, atoms → cards → sections
→ root).

---

## Step 4 — Wire it in (always, in the same change)

1. **File:** `src/app/components/<Name>DesignPage.tsx`, exporting
   `<Name>DesignPage`. Import `{ AppShell }` from `./SalesOrderListDesignPage`
   and `{ cn }` from `./ui/utils`.
2. **Route:** in `src/app/routes.tsx` — add `import { <Name>DesignPage } from
   "./components/<Name>DesignPage";`, a `<Name>DesignPageLayout` wrapper
   (`<div style={{ fontFamily: "'Inter', sans-serif" }}><<Name>DesignPage/></div>`,
   matching the siblings), and a route `{ path: "design/<slug>", Component:
   <Name>DesignPageLayout }`.
3. **Sidebar:** add the page to `SIDEBAR_GROUPS` in
   `src/app/components/DesignSidebar.tsx` (a child with `href: "/design/<slug>"`,
   or a new top-level item/section if it's its own domain). Pick a sensible
   lucide icon. The sidebar's `pathMatches` keeps the entry highlighted on the
   page and its sub-routes.
4. **Breadcrumb** in `AppShell` should read `Section › Page` and match the
   sidebar placement.

---

## Step 5 — Quality bar (self-review before reporting done)

- **Primary action is obviously primary.** A first-time viewer's eye lands on it.
- **Not a clone.** Structure is invented for this page, not a relabel of a sibling.
- **Every named state exists** and is reachable (loading, empty, no-results,
  disabled, selected, expanded, error/partial).
- **Counts/badges are live** and reconcile with the data they summarise.
- **Mobile.** Works 375px → desktop with no horizontal scroll; grids fall back to
  one column; dense desktop tables become cards or scroll within a container;
  stacked cards get *more* breathing room, not cramped internals. Mobile is its
  own pass, not the desktop view shrunk.
- **System fidelity.** Inter only, no gradients, lucide only, `bz-*` tokens
  (danger literals aside), `tabular-nums` on numbers, className over inline style.
- **Build is green:** run `npm run build` (this repo has no standalone `tsc`;
  the Vite/Rollup build is the resolution + syntax gate — fix anything it flags).

Then summarise: the primary action you designed around, the hierarchy you chose
and why, the route + sidebar entry, and which states aren't visible on first
load (so the user knows where to look).

---

## The brief

$ARGUMENTS

> If the brief above is empty or missing the page's purpose, ask the user for the
> page name + description + behavioural component inventory before proceeding —
> but never ask them to make layout/hierarchy decisions that are yours to make.
