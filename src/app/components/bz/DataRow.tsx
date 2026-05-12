import * as React from "react";
import { cn } from "../ui/utils";

// The ubiquitous "label / value" row that fills bento footers, hero card
// panels, dashboard mocks. Two columns: label left, value right.
//
//   <DataRow label="AR" value="+$12,400.00" />
//   <DataRow label="Today's journal entries" value="247 auto-posted" tone="light" />
//
// tone="dark" = use on dark surfaces (muted text becomes paper-on-dark).

export type DataRowProps = {
  label: React.ReactNode;
  value: React.ReactNode;
  tone?: "light" | "dark";
  /** Highlight the value (used for emphasis like "+$12,400.00"). */
  emphasis?: boolean;
  className?: string;
} & Omit<React.HTMLAttributes<HTMLDivElement>, "children">;

export function DataRow({
  label,
  value,
  tone = "light",
  emphasis = false,
  className,
  ...rest
}: DataRowProps) {
  const labelColor =
    tone === "dark" ? "text-white/[0.72]" : "text-bz-text-muted";
  const valueColor = emphasis
    ? "text-bz-leaf-deep font-medium"
    : tone === "dark"
    ? "text-bz-leaf"
    : "text-bz-text";
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3",
        className,
      )}
      {...rest}
    >
      <span className={cn("text-[11.5px]", labelColor)}>{label}</span>
      <span className={cn("text-[10.5px] font-medium", valueColor)}>
        {value}
      </span>
    </div>
  );
}
