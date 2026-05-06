import { type ReactNode } from "react";
import { Icon } from "../../marketing/Icon";

export interface IndustryHeroStat {
  value: string;
  label: string;
}

export interface IndustryHeroCta {
  label: string;
  href?: string;
  onClick?: () => void;
}

interface IndustryHeroProps {
  eyebrow: string;
  title: ReactNode;
  description: string;
  primaryCta: IndustryHeroCta;
  secondaryCta?: IndustryHeroCta;
  stats?: IndustryHeroStat[];
  visual: ReactNode;
}

/**
 * The split copy/visual hero used by every "By Industry" page.
 *
 * Left column — eyebrow, headline (`title` accepts JSX so callers can wrap
 * a span in `text-bz-sage`/`text-bz-accent`), description, two CTAs, and a
 * row of two stats divided by a vertical rule.
 *
 * Right column — `visual` slot. Pages compose this with `<HeroVisual />`
 * plus the four card primitives, or pass any custom JSX.
 */
export function IndustryHero({
  eyebrow,
  title,
  description,
  primaryCta,
  secondaryCta,
  stats,
  visual,
}: IndustryHeroProps) {
  return (
    <section
      className="biz-mesh"
      style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background: "linear-gradient(to left, rgba(199,255,53,0.04), transparent)",
          left: "50%",
        }}
      />
      <div className="biz-container" style={{ width: "100%", paddingTop: 80, paddingBottom: 80 }}>
        <div className="biz-hero-grid">
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span className="biz-label" style={{ marginBottom: 20 }}>
              {eyebrow}
            </span>
            <h1 className="biz-h1">{title}</h1>
            <p className="biz-hero-sub" style={{ marginTop: 24 }}>
              {description}
            </p>
            <div className="biz-hero-cta-row">
              <button
                className="biz-shimmer-btn biz-shimmer-lg"
                onClick={primaryCta.onClick}
              >
                {primaryCta.label}
              </button>
              {secondaryCta && (
                <button className="biz-btn-outline" onClick={secondaryCta.onClick}>
                  {secondaryCta.label} <Icon name="play" size={16} />
                </button>
              )}
            </div>
            {stats && stats.length > 0 && (
              <div className="biz-hero-stats">
                {stats.map((stat, idx) => (
                  <Stat key={stat.label} stat={stat} showDivider={idx < stats.length - 1} />
                ))}
              </div>
            )}
          </div>

          <div className="biz-hero-visual">{visual}</div>
        </div>
      </div>
    </section>
  );
}

function Stat({ stat, showDivider }: { stat: IndustryHeroStat; showDivider: boolean }) {
  return (
    <>
      <div>
        <div className="biz-stat-value">{stat.value}</div>
        <div className="biz-stat-label">{stat.label}</div>
      </div>
      {showDivider && <div className="biz-divider-v" />}
    </>
  );
}
