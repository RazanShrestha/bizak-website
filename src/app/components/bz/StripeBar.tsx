import * as React from "react";
import { cn } from "../ui/utils";

// Thin horizontal progress bar. Used for "X% complete" callouts inside
// bento card footers, hero KPI panels, etc.
//   <StripeBar pct={44} />
//   <StripeBar pct={75} tone="dark" />
//
// Paint: .bz-stripe-bar / .bz-stripe-bar-fill in style.css. The `pct`
// prop is genuinely dynamic inline style for width is the right move.

export type StripeBarProps = {
  /** 0–100. Width of the filled portion. */
  pct: number;
  tone?: "light" | "dark";
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>;

export function StripeBar({
  pct,
  tone = "light",
  className,
  ...rest
}: StripeBarProps) {
  const clamped = Math.max(0, Math.min(100, pct));
  return (
    <div
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn(
        "bz-stripe-bar",
        tone === "dark" && "bg-white/10",
        className,
      )}
      {...rest}
    >
      <div
        className={cn("bz-stripe-bar-fill", tone === "dark" && "bg-bz-leaf")}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
