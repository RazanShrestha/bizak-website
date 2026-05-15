import * as React from "react";
import { cn } from "../ui/utils";
import { StatusChip } from "./StatusChip";

// The small floating card that sits inside <HeroCanvas>. Has a fixed
// top-row (icon-circle + title + status badge), eyebrow + big number
// below, and an optional viz-panel slot.
//
//   <HeroCard
//     icon={<Activity size={12}/>}
//     title="Live ledger"
//     badge="Live"
//     eyebrow="Cash position"
//     value="$1,242,180"
//   >
//     {/* optional bottom panel DataRow, MiniBars, etc. */}
//   </HeroCard>
//
// Paint: .bz-hero-card in style.css.

export type HeroCardProps = {
  icon?: React.ReactNode;
  title: React.ReactNode;
  /** Badge string shown in the top-right (e.g. "Live", "Posted"). */
  badge?: string;
  /** Badge variant defaults to "live" (pistachio). */
  badgeVariant?: "live" | "posted" | "neutral";
  /** Eyebrow label above the big value. */
  eyebrow?: React.ReactNode;
  /** Big number the headline KPI. */
  value: React.ReactNode;
  /** Optional bottom panel typically a viz / mini-stats row. */
  children?: React.ReactNode;
  className?: string;
} & Omit<React.HTMLAttributes<HTMLDivElement>, "children" | "title">;

export function HeroCard({
  icon,
  title,
  badge,
  badgeVariant = "live",
  eyebrow,
  value,
  children,
  className,
  ...rest
}: HeroCardProps) {
  return (
    <div className={cn("bz-hero-card", className)} {...rest}>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon && (
            <span
              className="inline-flex h-6 w-6 items-center justify-center rounded-bz-pill bg-bz-olive text-bz-leaf"
            >
              {icon}
            </span>
          )}
          <span className="text-[12.5px] font-medium text-bz-text">
            {title}
          </span>
        </div>
        {badge && <StatusChip variant={badgeVariant}>{badge}</StatusChip>}
      </div>

      {eyebrow && (
        <div className="text-[11px] text-bz-text-muted">{eyebrow}</div>
      )}
      <div
        className="bz-bento-title"
        style={{ fontSize: 24, marginTop: 2, marginBottom: 0 }}
      >
        {value}
      </div>

      {children && <div className="mt-3">{children}</div>}
    </div>
  );
}
