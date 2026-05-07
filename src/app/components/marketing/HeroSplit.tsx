import { type ReactNode } from "react";
import { cn } from "../ui/utils";
import { Section } from "./Section";
import { Container } from "./Container";

export interface HeroSplitStat {
  value: ReactNode;
  label: ReactNode;
}

export interface HeroSplitProps {
  eyebrow?: ReactNode;
  badge?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  stats?: HeroSplitStat[];
  visual: ReactNode;
  tone?: "light" | "dark";
  mesh?: boolean;
  className?: string;
  reverse?: boolean;
  /**
   * className for the right-column wrapper around `visual`.
   * Defaults to `biz-hero-visual` — the by-industry positioning context
   * (`position:relative; width:100%; aspect-ratio:1; perspective:2000px`,
   * hidden ≤1024px) that the by-industry `<HeroVisual>` 4-card scaffold
   * needs for its absolutely positioned slot cards.
   *
   * Override with `""` (or any other class) when the visual doesn't depend
   * on that context — e.g., a single illustration, chart, or img.
   */
  visualClassName?: string;
}

/**
 * Option 2 — Split hero (Manufacturing / by-industry pattern).
 *
 * Two-column hero: copy on the left (eyebrow/badge → h1 → description →
 * actions → stats row separated by a top border), product visual on the
 * right. Collapses to a single stacked column on tablet/mobile (≤1024px).
 *
 * Use this when the hero's job is "explain *and* demo" — the visual is a
 * domain-specific cluster (dashboard, diagram, multi-card composition) that
 * sits beside the copy at the same vertical weight.
 */
export function HeroSplit({
  eyebrow,
  badge,
  title,
  description,
  actions,
  stats,
  visual,
  tone = "light",
  mesh = true,
  className,
  reverse = false,
  visualClassName = "biz-hero-visual",
}: HeroSplitProps) {
  const isDark = tone === "dark";
  return (
    <Section
      tone={tone}
      pad="hero"
      className={cn(mesh && "biz-mesh", "overflow-hidden", className)}
    >
      <Container>
        <div
          className={cn(
            "grid gap-12 lg:gap-12 items-center lg:grid-cols-2",
            reverse && "lg:[&>*:first-child]:order-2",
          )}
        >
          {/* Copy */}
          <div className="flex flex-col">
            {(eyebrow || badge) && (
              <div className="mb-5">
                {badge ? (
                  badge
                ) : (
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
                "font-bold tracking-[-0.04em] text-[clamp(2rem,5vw,3.7rem)] [line-height:1.1]",
                isDark ? "text-white" : "text-bz-text",
              )}
            >
              {title}
            </h1>
            {description && (
              <p
                className={cn(
                  "mt-6 text-[17px] md:text-[18px] leading-[1.7] max-w-[520px]",
                  isDark ? "text-white/65" : "text-bz-text-muted",
                )}
              >
                {description}
              </p>
            )}
            {actions && (
              <div className="mt-9 flex gap-4 flex-wrap">{actions}</div>
            )}
            {stats && stats.length > 0 && (
              <div
                className={cn(
                  "mt-10 pt-8 flex flex-wrap items-center gap-x-8 gap-y-5 border-t",
                  isDark ? "border-white/10" : "border-bz-border",
                )}
              >
                {stats.map((s, i) => (
                  <div key={i} className="flex items-center gap-x-8">
                    <div>
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
                          "mt-1 text-[10px] font-semibold uppercase tracking-[0.12em]",
                          isDark ? "text-white/50" : "text-bz-text-muted",
                        )}
                      >
                        {s.label}
                      </div>
                    </div>
                    {i < stats.length - 1 && (
                      <div
                        className={cn(
                          "h-10 w-px",
                          isDark ? "bg-white/10" : "bg-bz-border",
                        )}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Visual */}
          <div className={visualClassName || "relative w-full"}>{visual}</div>
        </div>
      </Container>
    </Section>
  );
}
