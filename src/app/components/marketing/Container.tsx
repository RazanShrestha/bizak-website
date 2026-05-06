import * as React from "react";
import { cn } from "../ui/utils";

type ContainerProps = React.HTMLAttributes<HTMLDivElement> & {
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
        "mx-auto w-full px-6",
        width === "default" && "max-w-[1320px]",
        width === "narrow" && "max-w-[1200px]",
        className,
      )}
      {...props}
    />
  );
}
