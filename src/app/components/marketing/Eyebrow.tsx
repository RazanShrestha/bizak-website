import * as React from "react";
import { cn } from "../ui/utils";

type EyebrowProps = React.HTMLAttributes<HTMLSpanElement> & {
  tone?: "sage" | "accent";
};

export function Eyebrow({
  className,
  tone = "sage",
  children,
  ...props
}: EyebrowProps) {
  return (
    <span
      className={cn(
        "inline-block text-[11px] font-bold uppercase tracking-[0.12em]",
        tone === "sage" && "text-bz-sage",
        tone === "accent" && "text-bz-accent",
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
