import { type ReactNode } from "react";
import { cn } from "../ui/utils";
import { Section } from "./Section";
import { Container } from "./Container";

export interface HeroPanelStat {
  value: ReactNode;
  label: ReactNode;
}

export interface HeroPanelProps {
  badge?: ReactNode;
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  stats?: HeroPanelStat[];
  panel: ReactNode;
  tone?: "dark" | "light";
  mesh?: boolean;
  className?: string;
  /** column ratio left/right default "55/45" matches Careers. */
  ratio?: "55/45" | "1/1" | "60/40";
  reverse?: boolean;
}

const RATIO_CLASS: Record<NonNullable<HeroPanelProps["ratio"]>, string> = {
  "55/45": "lg:grid-cols-[55fr_45fr]",
  "1/1": "lg:grid-cols-2",
  "60/40": "lg:grid-cols-[60fr_40fr]",
};

/**
 * Option 3 Panel hero (Careers pattern).
 *
 * Two-column hero on a dark surface by default: copy on the left (badge →
 * h1 → description → actions → stats row separated by a top border), an
 * arbitrary "panel" on the right (typically a `<Card tone="dark">` with
 * KPIs, lists, mini dashboards). Collapses cleanly on mobile.
 *
 * Use this when the right-hand content is a *self-contained card* (live
 * stats, leaderboard, snapshot) rather than a free-floating illustration
 * it gives the panel a clear container instead of letting it bleed.
 */
export function HeroPanel({
  badge,
  eyebrow,
  title,
  description,
  actions,
  stats,
  panel,
  tone = "dark",
  mesh = false,
  className,
  ratio = "55/45",
  reverse = false,
}: HeroPanelProps) {
  const isDark = tone === "dark";
  return (
    <Section
      tone={tone}
      pad="hero"
      className={cn(mesh && "biz-mesh", "overflow-hidden", className)}
    >
      <Container width="narrow">
        <div
          className={cn(
            "grid gap-12 lg:gap-[64px] items-center grid-cols-1",
            RATIO_CLASS[ratio],
            reverse && "lg:[&>*:first-child]:order-2",
          )}
        >
          {/* Copy */}
          <div>
            {(badge || eyebrow) && (
              <div className="mb-7">
                {badge ?? (
                  <span
                    className={cn(
                      "text-[11px] font-bold uppercase tracking-[0.14em]",
                      isDark ? "text-bz-accent" : "text-bz-sage",
                    )}
                  >
                    {eyebrow}
                  </span>
                )}
              </div>
            )}
            <h1
              className={cn(
                "font-bold tracking-[-0.02em] text-[clamp(32px,5vw,56px)] [line-height:1.15]",
                isDark ? "text-white" : "text-bz-text",
              )}
            >
              {title}
            </h1>
            {description && (
              <p
                className={cn(
                  "mt-6 text-[15px] md:text-[17px] leading-[1.7] max-w-[560px]",
                  isDark ? "text-white/65" : "text-bz-text-muted",
                )}
              >
                {description}
              </p>
            )}
            {actions && (
              <div className="mt-10 md:mt-12 flex gap-4 flex-wrap">
                {actions}
              </div>
            )}
            {stats && stats.length > 0 && (
              <div
                className={cn(
                  "mt-12 md:mt-14 pt-10 md:pt-12 flex flex-wrap gap-x-10 gap-y-6 border-t",
                  isDark ? "border-white/10" : "border-bz-border",
                )}
              >
                {stats.map((s, i) => (
                  <div key={i}>
                    <div
                      className={cn(
                        "text-[24px] font-bold leading-tight",
                        isDark ? "text-white" : "text-bz-text",
                      )}
                    >
                      {s.value}
                    </div>
                    <div
                      className={cn(
                        "mt-1 text-[11px] font-semibold uppercase tracking-[0.1em]",
                        isDark ? "text-white/50" : "text-bz-text-muted",
                      )}
                    >
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Panel */}
          <div className="w-full">{panel}</div>
        </div>
      </Container>
    </Section>
  );
}
