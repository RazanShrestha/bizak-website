import { Icon } from "../../marketing/Icon";

export interface WorkflowStep {
  /** Registered icon name from the global Icon registry. */
  icon: string;
  label: string;
}

interface WorkflowStripProps {
  eyebrow: string;
  title: string;
  steps: WorkflowStep[];
}

/**
 * The dashed-line + step-circles workflow ribbon. Identical structure
 * across all four "By Industry" pages — only the steps differ.
 */
export function WorkflowStrip({ eyebrow, title, steps }: WorkflowStripProps) {
  return (
    <section className="biz-workflow-section">
      <div className="biz-container">
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <span className="biz-label">{eyebrow}</span>
          <h2 className="biz-h2" style={{ marginTop: 12 }}>
            {title}
          </h2>
        </div>
        <div className="biz-workflow-steps">
          <div className="biz-workflow-line">
            <svg
              style={{ width: "100%", height: "100%" }}
              viewBox="0 0 1000 100"
              fill="none"
              preserveAspectRatio="none"
            >
              <path
                d="M50,50 L950,50"
                stroke="var(--bz-sage)"
                strokeOpacity="0.15"
                strokeWidth="1"
              />
              <path
                className="biz-flow"
                d="M50,50 L950,50"
                stroke="var(--bz-accent)"
                strokeDasharray="12 40"
                strokeLinecap="round"
                strokeWidth="3"
              />
            </svg>
          </div>
          <div className="biz-steps-grid">
            {steps.map((s) => (
              <div key={s.label} className="biz-step-item">
                <div className="biz-step-circle">
                  <Icon name={s.icon} size={24} />
                </div>
                <span className="biz-step-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
