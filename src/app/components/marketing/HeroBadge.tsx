import * as React from "react";
import { cn } from "../ui/utils";

type HeroBadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  tone?: "light" | "dark";
};

/**
 * Hero pill used as the eyebrow above a hero <h1>. Elevated glass pill
 * with a subtle lime brand wash and a slow shine sweep.
 *
 * tone="light" (default) — for `.biz-mesh` light hero backgrounds (HomePage,
 *   by-industry pages, HeroCentered/HeroSplit).
 * tone="dark" — for dark hero surfaces (HeroPanel, e.g. StartupsAndSmes,
 *   Careers).
 */
export function HeroBadge({ tone = "light", className, children, ...props }: HeroBadgeProps) {
  const isDark = tone === "dark";

  return (
    <span
      className={cn(
        "relative inline-flex items-center gap-2 rounded-bz-pill overflow-hidden isolate",
        "pl-2.5 pr-3.5 py-[6px]",
        "text-[11px] font-semibold uppercase tracking-[0.14em]",
        "backdrop-blur-md",
        isDark
          ? "text-white shadow-[0_1px_0_rgba(255,255,255,0.08)_inset,0_2px_6px_rgba(0,0,0,0.35),0_12px_28px_-12px_rgba(199,255,53,0.28),0_20px_44px_-22px_rgba(0,0,0,0.55)]"
          : "text-bz-text shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_2px_4px_rgba(26,29,25,0.05),0_10px_24px_-10px_rgba(122,130,109,0.28),0_18px_40px_-20px_rgba(26,29,25,0.18)]",
        className,
      )}
      style={{
        backgroundImage: isDark
          ? "linear-gradient(120deg, rgba(199,255,53,0.20) 0%, rgba(38,42,36,0.92) 50%, rgba(199,255,53,0.16) 100%)"
          : "linear-gradient(120deg, rgba(199,255,53,0.22) 0%, rgba(255,255,255,0.92) 50%, rgba(199,255,53,0.18) 100%)",
      }}
      {...props}
    >
      <span className="relative z-10">{children}</span>
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 z-0",
          isDark ? "opacity-30 mix-blend-screen" : "opacity-60 mix-blend-overlay",
        )}
        style={{
          backgroundImage:
            "linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.9) 50%, transparent 70%)",
          backgroundSize: "220% 100%",
          animation: "bizShimmer 4.5s linear infinite",
        }}
      />
    </span>
  );
}
