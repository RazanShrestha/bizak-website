import * as React from "react";
import { cn } from "../ui/utils";

type IconBadgeProps = {
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
  tone?: "sage" | "accent" | "darkSurface";
  className?: string;
};

export function IconBadge({
  children,
  size = "md",
  tone = "sage",
  className,
}: IconBadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center justify-center rounded-bz-lg shrink-0",
        size === "sm" && "size-9",
        size === "md" && "size-11",
        size === "lg" && "size-12",
        tone === "sage" && "bg-bz-sage-soft text-bz-sage",
        tone === "accent" && "bg-bz-accent-soft text-bz-accent",
        tone === "darkSurface" && "bg-white/[0.06] text-white",
        className,
      )}
    >
      {children}
    </div>
  );
}
