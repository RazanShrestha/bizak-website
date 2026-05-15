import * as React from "react";
import { cn } from "../ui/utils";

// Stat tile big number on the left, descriptive text on the right.
//   <StatTile value="50,000+" desc="Companies powered by Bizak." />
//   <StatTile value="60%" desc="Faster month-end close." />
//
// Used in impact-metrics sections, testimonial side-panels, anywhere a
// page wants to drop a hard number with one line of supporting copy.

export type StatTileProps = {
  value: React.ReactNode;
  desc: React.ReactNode;
  tone?: "light" | "dark";
  className?: string;
} & Omit<React.HTMLAttributes<HTMLDivElement>, "children">;

export function StatTile({
  value,
  desc,
  tone = "light",
  className,
  ...rest
}: StatTileProps) {
  const bg = tone === "dark" ? "bg-white/[0.07]" : "bg-[#F4F5EF]";
  const descColor = tone === "dark" ? "text-white/[0.72]" : "text-bz-text-muted";
  const numClass = tone === "dark" ? "bz-stat-num bz-stat-num-light" : "bz-stat-num";
  return (
    <div
      className={cn(
        "flex items-center gap-[14px] rounded-bz-xl p-4",
        bg,
        className,
      )}
      {...rest}
    >
      <div className={numClass} style={{ fontSize: 30 }}>
        {value}
      </div>
      <p className={cn("m-0 text-[12.5px] leading-[1.5]", descColor)}>
        {desc}
      </p>
    </div>
  );
}
