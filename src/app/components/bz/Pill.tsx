import * as React from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { cn } from "../ui/utils";

// Paint lives in src/styles/style.css under .bz-pill / .bz-pill-<variant>.
// This wrapper:
//  - Renders <a> when href is set, otherwise <button>.
//  - Adds an optional trailing arrow (right or diagonal up-right).
//  - Provides a typed `variant` and `size` API mapped to the existing CSS classes.

type PillVariant =
  | "dark"
  | "light"
  | "ghost"
  | "ghostDark"
  | "accent"
  | "leaf";

type PillSize = "sm" | "md";

const VARIANT_CLASS: Record<PillVariant, string> = {
  dark: "bz-pill bz-pill-dark",
  light: "bz-pill bz-pill-light",
  ghost: "bz-pill bz-pill-ghost",
  ghostDark: "bz-pill bz-pill-ghost-dark",
  accent: "bz-pill bz-pill-accent",
  leaf: "bz-pill bz-pill-leaf",
};

const SIZE_CLASS: Record<PillSize, string> = {
  sm: "bz-pill-sm",
  md: "",
};

type CommonProps = {
  variant?: PillVariant;
  size?: PillSize;
  className?: string;
  /** Append a right arrow → */
  withArrow?: boolean;
  /** Append a diagonal arrow ↗ (external links / different surfaces). */
  withArrowUpRight?: boolean;
  children: React.ReactNode;
};

type PillAsButton = CommonProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
    href?: undefined;
  };

type PillAsLink = CommonProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "children"> & {
    href: string;
  };

export type PillProps = PillAsButton | PillAsLink;

export function Pill(props: PillProps) {
  const {
    variant = "dark",
    size = "md",
    className,
    withArrow,
    withArrowUpRight,
    children,
  } = props;

  const classes = cn(VARIANT_CLASS[variant], SIZE_CLASS[size], className);

  const content = (
    <>
      {children}
      {withArrow && <ArrowRight size={14} />}
      {withArrowUpRight && <ArrowUpRight size={14} />}
    </>
  );

  if ("href" in props && props.href) {
    const {
      href, target, rel,
      variant: _v, size: _s, className: _c,
      withArrow: _a, withArrowUpRight: _au, children: _ch,
      ...rest
    } = props;
    return (
      <a href={href} target={target} rel={rel} className={classes} {...rest}>
        {content}
      </a>
    );
  }

  const {
    variant: _v, size: _s, className: _c,
    withArrow: _a, withArrowUpRight: _au, children: _ch,
    href: _h,
    ...rest
  } = props as PillAsButton;
  return (
    <button className={classes} {...rest}>
      {content}
    </button>
  );
}
