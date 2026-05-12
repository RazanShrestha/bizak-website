import * as React from "react";
import { cn } from "../ui/utils";
import { DotGrid } from "./DotGrid";

// The dark olive panel that sits below the hero copy and holds floating
// <HeroCard>s. The panel has rounded corners, a grid overlay for texture,
// and the cards visually "lift off" via the half-overlapping translateY.
//
//   <HeroCanvas>
//     <HeroCard … />
//     <HeroCard … />
//     <HeroCard … />
//   </HeroCanvas>
//
// Paint: .bz-hero-canvas / .bz-hero-canvas-grid / .bz-hero-cards in style.css.
// HeroCanvas owns its own background — don't wrap it in another bg layer.

export type HeroCanvasProps = {
  className?: string;
  children: React.ReactNode;
} & Omit<React.HTMLAttributes<HTMLDivElement>, "children">;

export function HeroCanvas({ className, children, ...rest }: HeroCanvasProps) {
  return (
    <div className={cn("bz-hero-canvas", className)} {...rest}>
      <DotGrid tone="dark" className="bz-hero-canvas-grid" />
      <div className="bz-hero-cards">{children}</div>
    </div>
  );
}
