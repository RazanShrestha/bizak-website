import * as React from "react";
import { ArrowRight, ArrowUpRight, Check } from "lucide-react";
import { cn } from "../ui/utils";

// Paint lives in src/styles/style.css under .bz-pill / .bz-pill-<variant>.
// This wrapper:
//  - Renders <a> when href is set, otherwise <button>.
//  - Adds optional left icon, right icon, tick, or arrow.
//  - Provides a typed `variant` API mapped to the existing CSS classes.

type PillVariant =
  | "dark"
  | "light"
  | "ghost"
  | "ghostDark"
  | "accent"
  | "leaf";

type CommonProps = {
  variant?: PillVariant;
  className?: string;
  /** Append a green tick suffix (used on primary CTAs). */
  withTick?: boolean;
  /** Append a right arrow. */
  withArrow?: boolean;
  /** Append a diagonal arrow (links to external / different surfaces). */
  withArrowUpRight?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
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

const VARIANT_CLASS: Record<PillVariant, string> = {
  dark: "bz-pill bz-pill-dark",
  light: "bz-pill bz-pill-light",
  ghost: "bz-pill bz-pill-ghost",
  ghostDark: "bz-pill bz-pill-ghost-dark",
  accent: "bz-pill bz-pill-accent",
  leaf: "bz-pill bz-pill-leaf",
};

export function Pill(props: PillProps) {
  const {
    variant = "dark",
    className,
    withTick,
    withArrow,
    withArrowUpRight,
    iconLeft,
    iconRight,
    children,
  } = props;

  const classes = cn(VARIANT_CLASS[variant], className);

  const content = (
    <>
      {iconLeft}
      {children}
      {iconRight}
      {withArrow && <ArrowRight size={14} />}
      {withArrowUpRight && <ArrowUpRight size={14} />}
      {withTick && (
        <span className="bz-pill-tick" aria-hidden="true">
          <Check size={11} strokeWidth={3} />
        </span>
      )}
    </>
  );

  if ("href" in props && props.href) {
    const {
      href, target, rel,
      variant: _v, className: _c, withTick: _t, withArrow: _a,
      withArrowUpRight: _au, iconLeft: _il, iconRight: _ir, children: _ch,
      ...rest
    } = props;
    return (
      <a href={href} target={target} rel={rel} className={classes} {...rest}>
        {content}
      </a>
    );
  }

  const {
    variant: _v, className: _c, withTick: _t, withArrow: _a,
    withArrowUpRight: _au, iconLeft: _il, iconRight: _ir, children: _ch,
    href: _h,
    ...rest
  } = props as PillAsButton;
  return (
    <button className={classes} {...rest}>
      {content}
    </button>
  );
}
