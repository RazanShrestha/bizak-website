import * as React from "react";
import { cn } from "../ui/utils";

type StatProps = {
  value: React.ReactNode;
  label: React.ReactNode;
  tone?: "dark" | "light";
  size?: "sm" | "md" | "lg";
  align?: "left" | "center";
  className?: string;
};

export function Stat({
  value,
  label,
  tone = "dark",
  size = "md",
  align = "left",
  className,
}: StatProps) {
  return (
    <div
      className={cn(
        align === "center" && "text-center",
        className,
      )}
    >
      <div
        className={cn(
          "font-bold tracking-[-0.02em]",
          size === "sm" && "text-[20px]",
          size === "md" && "text-[28px]",
          size === "lg" && "text-[clamp(32px,3vw,44px)]",
          tone === "dark" ? "text-bz-text" : "text-white",
        )}
      >
        {value}
      </div>
      <div
        className={cn(
          "mt-1 text-[12px]",
          tone === "dark" ? "text-bz-text-muted" : "text-white/45",
        )}
      >
        {label}
      </div>
    </div>
  );
}
