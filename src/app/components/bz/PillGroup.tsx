import * as React from "react";
import { cn } from "../ui/utils";

// Wraps a pair of <Pill> elements so they always share equal width.
// Layout: CSS Grid 1fr 1fr the wider label drives both column widths.
// Desktop: capped at max-width so they don't sprawl across the container.
// Mobile:  fills available width, both buttons stay on the same row.
//
// Usage:
//   <PillGroup>
//     <Pill variant="dark" withArrow href="/start">Get Started</Pill>
//     <Pill variant="light" href="/contact">Request Demo</Pill>
//   </PillGroup>

export type PillGroupProps = {
  className?: string;
  children: React.ReactNode;
};

export function PillGroup({ className, children }: PillGroupProps) {
  return (
    <div className={cn("bz-pill-group", className)}>
      {children}
    </div>
  );
}
