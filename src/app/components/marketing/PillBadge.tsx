import * as React from "react";
import { cn } from "../ui/utils";

type PillBadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  tone?: "sage" | "accent" | "neutral" | "live";
  /** Show a small leading dot. */
  dot?: boolean;
};

export function PillBadge({
  className,
  tone = "sage",
  dot = false,
  children,
  ...props
}: PillBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-bz-pill px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em]",
        tone === "sage" && "bg-bz-sage-soft text-bz-sage",
        tone === "accent" && "bg-bz-accent-soft text-bz-accent border border-bz-accent-mid",
        tone === "neutral" && "bg-bz-bg text-bz-text-muted border border-bz-border",
        tone === "live" && "bg-bz-accent-soft text-bz-accent border border-bz-accent-mid",
        className,
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn(
            "size-1.5 rounded-full",
            tone === "accent" || tone === "live" ? "bg-bz-accent" : "bg-bz-sage",
          )}
        />
      )}
      {children}
    </span>
  );
}
