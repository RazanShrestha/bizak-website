import * as React from "react";
import { cn } from "../ui/utils";

// Horizontal page wrapper max-width + auto-margin + gutter.
//   <Container>...</Container>                  → 1320px max
//   <Container width="narrow">...</Container>   → 1200px max
//
// Used inside <Section> to constrain content width.

export type ContainerProps = React.HTMLAttributes<HTMLDivElement> & {
  width?: "default" | "narrow";
  as?: React.ElementType;
};

export function Container({
  className,
  width = "default",
  as: Tag = "div",
  ...props
}: ContainerProps) {
  return (
    <Tag
      className={cn(
        "mx-auto w-full bz-container-px",
        width === "default" && "max-w-[1320px]",
        width === "narrow" && "max-w-[1200px]",
        className,
      )}
      {...props}
    />
  );
}
