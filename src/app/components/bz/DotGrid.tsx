import * as React from "react";
import { cn } from "../ui/utils";

// 1px grid overlay used inside dark surfaces (HeroCanvas, dark Bento,
// FAQ intro panel, PlatformDashboard mock). Replaces the retired
// `.biz-mesh` radial gradient the new direction is flat surface +
// dot/grid overlay for texture, never gradients.
//
//   <div className="relative">
//     <DotGrid />
//     {content}
//   </div>
//
// The component is `position: absolute; inset: 0; pointer-events: none`
// so it doesn't intercept clicks. Always wrap it in a `position: relative`
// parent.

export type DotGridProps = {
  tone?: "dark" | "light";
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>;

export function DotGrid({ tone = "dark", className, ...rest }: DotGridProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "absolute inset-0 pointer-events-none",
        tone === "dark" ? "bz-grid-dark" : "bz-grid-white",
        className,
      )}
      {...rest}
    />
  );
}
