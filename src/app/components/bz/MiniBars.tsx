import * as React from "react";
import { cn } from "../ui/utils";

// Compact bar-chart strip used in hero card footers / dashboard mocks.
// Renders a row of vertical bars at percentages 0-100.
//
//   <MiniBars values={[40, 65, 50, 80, 60, 88, 92]} highlightLast />
//   <MiniBars values={[…]} tone="dark" />

export type MiniBarsProps = {
  /** Height percentages 0-100, one per bar. */
  values: number[];
  /** Make the last bar fully saturated (the "today" / "now" bar). */
  highlightLast?: boolean;
  tone?: "light" | "dark";
  /** Height of the strip in px. Default 32. */
  height?: number;
  className?: string;
} & Omit<React.HTMLAttributes<HTMLDivElement>, "children">;

export function MiniBars({
  values,
  highlightLast = true,
  tone = "light",
  height = 32,
  className,
  ...rest
}: MiniBarsProps) {
  const lastIdx = values.length - 1;
  const highlightBg = tone === "dark" ? "bg-bz-leaf" : "bg-bz-olive";
  const dimBg = tone === "dark" ? "bg-white/[0.14]" : "bg-black/[0.14]";
  return (
    <div
      className={cn(
        "flex items-end gap-[3px]",
        className,
      )}
      style={{ height }}
      {...rest}
    >
      {values.map((v, i) => (
        <div
          key={i}
          className={cn(
            "flex-1 rounded-[3px]",
            highlightLast && i === lastIdx ? highlightBg : dimBg,
          )}
          style={{ height: `${Math.max(0, Math.min(100, v))}%` }}
        />
      ))}
    </div>
  );
}
