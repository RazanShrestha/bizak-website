import * as React from "react";
import { cn } from "../ui/utils";
import { Flag } from "./Flag";

// The "Available in 120+ countries 🇺🇸 🇬🇧 🇩🇪 … with localised tax & compliance"
// pill row that appears below content sections to convey international reach.
//
//   <FlagsRow
//     prefix="Available in 120+ countries"
//     flags={["🇺🇸","🇬🇧","🇩🇪","🇫🇷","🇪🇸"]}
//     suffix="with localised tax & compliance"
//   />

export type FlagsRowProps = {
  prefix?: React.ReactNode;
  flags: string[];
  suffix?: React.ReactNode;
  className?: string;
};

export function FlagsRow({ prefix, flags, suffix, className }: FlagsRowProps) {
  return (
    <div className={cn("flex justify-center", className)}>
      <div
        className={cn(
          "flex max-w-full flex-wrap items-center justify-center gap-3",
          "rounded-bz-pill border border-bz-line-soft bg-bz-surface px-[18px] py-3",
        )}
      >
        {prefix && (
          <span className="text-[13px] font-medium text-bz-text">
            {prefix}
          </span>
        )}
        <div className="flex flex-wrap gap-1">
          {flags.map((f, i) => (
            <Flag key={i}>{f}</Flag>
          ))}
        </div>
        {suffix && (
          <span className="text-[13px] text-bz-text-muted">{suffix}</span>
        )}
      </div>
    </div>
  );
}
