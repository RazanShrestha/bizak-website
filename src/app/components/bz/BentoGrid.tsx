import * as React from "react";
import { cn } from "../ui/utils";

// Responsive grid wrapper for <Bento> children. Owns its own breakpoints
// so consumer pages don't write <style>{@media …}</style> blocks.
//
//   <BentoGrid cols={3}>
//     <Bento ... />
//     <Bento ... />
//     <Bento ... />
//   </BentoGrid>
//
// Breakpoint behaviour:
//   cols=2  →  1 col (mobile) → 2 cols (md ≥768)
//   cols=3  →  1 col → 2 cols (md) → 3 cols (lg ≥1024)
//   cols=4  →  1 col → 2 cols (md) → 4 cols (xl ≥1280)
//   cols=12 →  12-col bento (no auto-fit; rely on Bento span prop)

export type BentoGridProps = {
  cols?: 2 | 3 | 4 | 12;
  /** Gap between cells in pixels. Default 18. */
  gap?: number;
  className?: string;
  children: React.ReactNode;
} & Omit<React.HTMLAttributes<HTMLDivElement>, "children">;

const COLS_CLASS: Record<NonNullable<BentoGridProps["cols"]>, string> = {
  2: "grid-cols-1 md:grid-cols-2",
  3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 md:grid-cols-2 xl:grid-cols-4",
  12: "grid-cols-1 md:grid-cols-12",
};

export function BentoGrid({
  cols = 3,
  gap = 18,
  className,
  children,
  style,
  ...rest
}: BentoGridProps) {
  return (
    <div
      className={cn("grid", COLS_CLASS[cols], className)}
      style={{ gap, ...style }}
      {...rest}
    >
      {children}
    </div>
  );
}
