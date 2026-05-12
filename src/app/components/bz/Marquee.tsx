import * as React from "react";
import { cn } from "../ui/utils";

// Infinite-scroll horizontal marquee for logo strips, trust bars, etc.
// The children are rendered twice internally to enable seamless looping;
// callers pass one set.
//
//   <Marquee speed="36s" pauseOnHover>
//     {LOGOS.map(s => <img key={s} src={`/logos/${s}.svg`} />)}
//   </Marquee>
//
// Paint: .bz-marquee-mask + .bz-marquee-track in style.css.

export type MarqueeProps = {
  /** CSS animation duration string. Default "36s". */
  speed?: string;
  /** Stop animation on hover. Default true. */
  pauseOnHover?: boolean;
  className?: string;
  /** The items to scroll — pass one set; they'll be duplicated. */
  children: React.ReactNode;
} & Omit<React.HTMLAttributes<HTMLDivElement>, "children">;

export function Marquee({
  speed = "36s",
  pauseOnHover = true,
  className,
  children,
  ...rest
}: MarqueeProps) {
  // Duplicate children for seamless wrap-around.
  const items = React.Children.toArray(children);
  return (
    <div className={cn("bz-marquee-mask", className)} {...rest}>
      <div
        className="bz-marquee-track"
        style={{
          animationDuration: speed,
          animationPlayState: pauseOnHover ? undefined : "running",
        }}
      >
        {items}
        {items.map((c, i) =>
          React.isValidElement(c)
            ? React.cloneElement(c, { key: `dup-${i}`, "aria-hidden": true } as any)
            : c,
        )}
      </div>
    </div>
  );
}
