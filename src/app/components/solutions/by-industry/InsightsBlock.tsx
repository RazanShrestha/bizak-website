import { type ReactNode } from "react";
import { Icon } from "../../marketing/Icon";

export interface InsightsBullet {
  bold: string;
  rest: string;
}

interface InsightsBlockProps {
  eyebrow: string;
  title: ReactNode;
  description: string;
  bullets: InsightsBullet[];
  /** The visual on the other half of the row — typically a chart frame. */
  chart: ReactNode;
  /**
   * Which side the chart sits on. Default `'right'` (text reads first).
   * Pass `'left'` only if you have a deliberate reason to flip on a given page.
   */
  chartSide?: "left" | "right";
}

/**
 * The "Insights" section: split layout with an eyebrow + headline + bullet
 * list on one side and a chart slot on the other. The `chartSide` prop
 * pins which half holds the chart so the four industry pages stay
 * consistent (default: text-left / chart-right).
 */
export function InsightsBlock({
  eyebrow,
  title,
  description,
  bullets,
  chart,
  chartSide = "right",
}: InsightsBlockProps) {
  const text = (
    <div>
      <span className="biz-label">{eyebrow}</span>
      <h2 className="biz-h2" style={{ marginTop: 16, marginBottom: 20, lineHeight: 1.2 }}>
        {title}
      </h2>
      <p style={{ fontSize: 17, color: "var(--bz-text-muted)", lineHeight: 1.7 }}>
        {description}
      </p>
      <ul className="biz-check-list">
        {bullets.map((item) => (
          <li key={item.bold} className="biz-check-item">
            <span className="biz-check-icon">
              <Icon name="check-circle" size={20} />
            </span>
            <span>
              <strong>{item.bold}</strong>
              {item.rest}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <section className="biz-section" style={{ background: "var(--bz-surface)" }}>
      <div className="biz-container">
        <div className="biz-insights-grid">
          {chartSide === "left" ? (
            <>
              {chart}
              {text}
            </>
          ) : (
            <>
              {text}
              {chart}
            </>
          )}
        </div>
      </div>
    </section>
  );
}

// ─── ChartFrame (the glass-bordered container around the SVG chart) ──────────

interface ChartFrameProps {
  /** The SVG (and any annotations) the page draws. */
  children: ReactNode;
  /** Optional inline tooltip card overlaid on top of the chart. */
  tooltip?: { title: string; subtitle: string };
  /** Side of the decorative glow blob. Default matches `chartSide`. */
  glowSide?: "left" | "right";
}

export function ChartFrame({ children, tooltip, glowSide = "right" }: ChartFrameProps) {
  return (
    <div style={{ position: "relative" }}>
      <div className="biz-chart-frame biz-glass">
        <div className="biz-chart-inner">
          <div className="biz-chart-topbar">
            <div style={{ height: 36, width: 148, background: "var(--bz-border)", borderRadius: 8 }} />
            <div style={{ height: 36, width: 88, background: "rgba(122,130,109,0.18)", borderRadius: 8 }} />
          </div>
          <div
            style={{
              height: 240,
              background: "var(--bz-surface)",
              borderRadius: 8,
              border: "1px solid rgba(232,234,228,0.5)",
              position: "relative",
              padding: 16,
              boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
            }}
          >
            {children}
            {tooltip && (
              <div className="biz-tooltip">
                <div style={{ fontWeight: 700, fontSize: 11, color: "var(--bz-text)" }}>
                  {tooltip.title}
                </div>
                <div style={{ fontSize: 10, color: "#16a34a", fontWeight: 700, marginTop: 4 }}>
                  {tooltip.subtitle}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          bottom: -40,
          ...(glowSide === "left" ? { left: -40 } : { right: -40 }),
          width: 180,
          height: 180,
          background: "rgba(122,130,109,0.05)",
          borderRadius: "50%",
          filter: "blur(60px)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
