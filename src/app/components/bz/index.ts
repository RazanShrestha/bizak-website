// ────────────────────────────────────────────────────────────────────────────
// Bizak design-system primitives (Phase 1 rebrand)
//
// This barrel is the SINGLE import surface for the new design system.
// Pages should import primitives from here NEVER from individual files,
// NEVER from the legacy `marketing/` folder.
//
//   import { Section, Container, Bento, Pill, Heading } from "../bz";
//
// Folder convention:
//   src/app/components/bz/   ← canonical (this folder)
//   src/app/components/marketing/   ← legacy; will be deleted in Phase 4
//
// See /CLAUDE.md and /docs/DESIGN_SYSTEM.md for the design rules and the
// migration plan. See /docs/BIZAK_PRODUCT_OVERVIEW.md for product brief.
// ────────────────────────────────────────────────────────────────────────────

// ── Atoms ────────────────────────────────────────────────────────────────────
export { Pill } from "./Pill";
export type { PillProps } from "./Pill";

export { PillGroup } from "./PillGroup";
export type { PillGroupProps } from "./PillGroup";

export { Eyebrow } from "./Eyebrow";
export type { EyebrowProps } from "./Eyebrow";

export { Heading } from "./Heading";
export type { HeadingProps } from "./Heading";

export { BadgeGreen } from "./BadgeGreen";
export type { BadgeGreenProps } from "./BadgeGreen";

export { Flag } from "./Flag";
export type { FlagProps } from "./Flag";

export { StatusChip } from "./StatusChip";
export type { StatusChipProps } from "./StatusChip";

export { StripeBar } from "./StripeBar";
export type { StripeBarProps } from "./StripeBar";

export { Tick } from "./Tick";
export type { TickProps } from "./Tick";

export { DotGrid } from "./DotGrid";
export type { DotGridProps } from "./DotGrid";

// ── Layout ───────────────────────────────────────────────────────────────────
export { Container } from "./Container";
export type { ContainerProps } from "./Container";

export { Section } from "./Section";
export type { SectionProps } from "./Section";

export { HeroCanvas } from "./HeroCanvas";
export type { HeroCanvasProps } from "./HeroCanvas";

export { SectionHead } from "./SectionHead";
export type { SectionHeadProps } from "./SectionHead";

export { BentoGrid } from "./BentoGrid";
export type { BentoGridProps } from "./BentoGrid";

// ── Card shells ──────────────────────────────────────────────────────────────
export { Bento } from "./Bento";
export type { BentoProps } from "./Bento";

export { BigCard } from "./BigCard";
export type { BigCardProps } from "./BigCard";

export { StepCard } from "./StepCard";
export type { StepCardProps } from "./StepCard";

export { HeroCard } from "./HeroCard";
export type { HeroCardProps } from "./HeroCard";

// ── Patterns ─────────────────────────────────────────────────────────────────
export { Marquee } from "./Marquee";
export type { MarqueeProps } from "./Marquee";

export { Carousel } from "./Carousel";
export type { CarouselProps } from "./Carousel";

export { Accordion } from "./Accordion";
export type { AccordionProps, AccordionItemProps } from "./Accordion";

export { FlagsRow } from "./FlagsRow";
export type { FlagsRowProps } from "./FlagsRow";

// ── Micro-viz ────────────────────────────────────────────────────────────────
export { DataRow } from "./DataRow";
export type { DataRowProps } from "./DataRow";

export { MiniBars } from "./MiniBars";
export type { MiniBarsProps } from "./MiniBars";

export { EntityRow } from "./EntityRow";
export type { EntityRowProps } from "./EntityRow";

export { JournalRow } from "./JournalRow";
export type { JournalRowProps } from "./JournalRow";

export { ModuleListItem } from "./ModuleListItem";
export type { ModuleListItemProps } from "./ModuleListItem";

export { StatTile } from "./StatTile";
export type { StatTileProps } from "./StatTile";
