import { type ReactNode } from "react";
import { Icon } from "../../marketing/Icon";

interface HeroVisualProps {
  /** Center glass panel — typically `<HeroMainCard>...</HeroMainCard>`. */
  main: ReactNode;
  /** Top-right dark card — typically `<HeroInventoryCard ... />`. */
  inventory: ReactNode;
  /** Bottom-left light card — typically `<HeroGlobeCard ... />`. */
  globe: ReactNode;
  /** Small circular gauge bottom-right — typically `<HeroCircleCard ... />`. */
  circle: ReactNode;
}

/**
 * The 4-card floating scaffold every industry-page hero shares.
 *
 * Slots (`main`, `inventory`, `globe`, `circle`) keep the layout fixed so
 * the four pages stay visually consistent; only the content inside each
 * card changes per page. The decorative glow + animated particles are
 * rendered automatically.
 */
export function HeroVisual({ main, inventory, globe, circle }: HeroVisualProps) {
  return (
    <>
      <div className="biz-vis-glow" />
      {main}
      {inventory}
      {globe}
      {circle}
      {PARTICLES.map((p, i) => (
        <div
          key={i}
          className="biz-data-dot biz-particle"
          style={{ top: p.top, left: p.left, animationDelay: p.delay }}
        />
      ))}
    </>
  );
}

const PARTICLES = [
  { top: "40%", left: "50%", delay: "0s" },
  { top: "60%", left: "30%", delay: "1.5s" },
  { top: "30%", left: "70%", delay: "2.5s" },
];

// ─── Hero Main Card (the center glass panel) ─────────────────────────────────

interface HeroMainCardProps {
  /** Centered uppercase title in the panel header (e.g., "Bizak · Production Control"). */
  panelTitle: string;
  /** Right-side live status label (e.g., "Live", "Tracking"). Default: "Live". */
  liveLabel?: string;
  children?: ReactNode;
}

export function HeroMainCard({ panelTitle, liveLabel = "Live", children }: HeroMainCardProps) {
  return (
    <div className="biz-card-main biz-glass biz-float">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 14,
        }}
      >
        <div style={{ display: "flex", gap: 6 }}>
          <div className="biz-traffic-dot" style={{ background: "rgba(248,113,113,0.5)" }} />
          <div className="biz-traffic-dot" style={{ background: "rgba(251,191,36,0.5)" }} />
          <div className="biz-traffic-dot" style={{ background: "rgba(74,222,128,0.5)" }} />
        </div>
        <span
          style={{
            fontSize: 8,
            fontWeight: 700,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "rgba(122,130,109,0.65)",
          }}
        >
          {panelTitle}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <div
            className="biz-pulse-glow"
            style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--bz-accent)" }}
          />
          <span
            style={{
              fontSize: 7,
              fontWeight: 700,
              letterSpacing: "0.1em",
              color: "var(--bz-sage)",
              textTransform: "uppercase",
            }}
          >
            {liveLabel}
          </span>
        </div>
      </div>
      {children}
    </div>
  );
}

// ─── Hero Inventory Card (top-right dark card) ───────────────────────────────

interface HeroInventoryCardProps {
  iconName: string;
  eyebrow: string;
  value: string;
  barLabel: string;
  barValue: string;
  /** Progress bar fill, 0–100. */
  barPct: number;
}

export function HeroInventoryCard({
  iconName,
  eyebrow,
  value,
  barLabel,
  barValue,
  barPct,
}: HeroInventoryCardProps) {
  return (
    <div className="biz-card-inventory biz-glass-dark biz-float-d">
      <div className="biz-tag-row">
        <div
          className="biz-icon-box"
          style={{ background: "rgba(199,255,53,0.15)", color: "var(--bz-accent)" }}
        >
          <Icon name={iconName} size={18} />
        </div>
        <div>
          <div
            style={{
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.45)",
            }}
          >
            {eyebrow}
          </div>
          <div style={{ fontSize: 17, fontWeight: 700, color: "#fff" }}>{value}</div>
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 9, color: "rgba(255,255,255,0.38)" }}>{barLabel}</span>
        <span style={{ fontSize: 9, color: "var(--bz-accent)", fontWeight: 700 }}>{barValue}</span>
      </div>
      <div
        style={{
          height: 4,
          background: "rgba(255,255,255,0.1)",
          borderRadius: 99,
          overflow: "hidden",
        }}
      >
        <div className="biz-accent-bar" style={{ width: `${barPct}%` }} />
      </div>
    </div>
  );
}

// ─── Hero Globe Card (bottom-left light card) ────────────────────────────────

interface HeroGlobeCardProps {
  iconName: string;
  eyebrow: string;
  children?: ReactNode;
}

export function HeroGlobeCard({ iconName, eyebrow, children }: HeroGlobeCardProps) {
  return (
    <div className="biz-card-globe biz-glass biz-float-s">
      <div className="biz-tag-row">
        <div
          className="biz-icon-box"
          style={{ background: "rgba(122,130,109,0.1)", color: "var(--bz-sage)" }}
        >
          <Icon name={iconName} size={18} />
        </div>
        <div
          style={{
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--bz-sage)",
          }}
        >
          {eyebrow}
        </div>
      </div>
      {children}
    </div>
  );
}

// ─── Hero Circle Card (bottom-right circular gauge) ──────────────────────────

interface HeroCircleCardProps {
  eyebrow: string;
  /** Center text inside the circle (e.g., "87%"). */
  value: string;
  /** Fill percentage, 0–100. */
  progressPct: number;
}

export function HeroCircleCard({ eyebrow, value, progressPct }: HeroCircleCardProps) {
  // Circumference of r=32 ≈ 201; offset = (1 - pct/100) * circumference
  const dashOffset = Math.round(201 * (1 - progressPct / 100));
  return (
    <div className="biz-card-circle biz-glass biz-float">
      <div
        style={{
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "var(--bz-sage)",
          marginBottom: 12,
        }}
      >
        {eyebrow}
      </div>
      <div
        style={{
          position: "relative",
          width: 72,
          height: 72,
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg
          style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }}
          viewBox="0 0 80 80"
        >
          <circle
            cx="40"
            cy="40"
            r="32"
            fill="transparent"
            stroke="rgba(199,255,53,0.18)"
            strokeWidth="8"
            strokeDasharray="201"
            strokeDashoffset="0"
          />
          <circle
            cx="40"
            cy="40"
            r="32"
            fill="transparent"
            stroke="var(--bz-accent)"
            strokeWidth="8"
            strokeDasharray="201"
            strokeDashoffset={dashOffset}
          />
        </svg>
        <div style={{ position: "absolute", fontSize: 13, fontWeight: 700, color: "var(--bz-text)" }}>
          {value}
        </div>
      </div>
    </div>
  );
}
