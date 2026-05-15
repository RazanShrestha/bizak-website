import { Icon } from "../../marketing/Icon";

export interface SolutionItem {
  /** Registered icon name from the global Icon registry. */
  icon: string;
  title: string;
  desc: string;
}

interface SolutionGridProps {
  eyebrow: string;
  title: string;
  items: SolutionItem[];
}

/**
 * The "solutions" section: white surface, centered headline, 6–7 icon items
 * arranged in a responsive grid. Identical structure across all four "By
 * Industry" pages the only thing that varied was the data, so this is
 * data-only now.
 */
export function SolutionGrid({ eyebrow, title, items }: SolutionGridProps) {
  return (
    <section
      className="biz-section"
      style={{
        background: "var(--bz-surface)",
        borderTop: "1px solid var(--bz-border)",
        borderBottom: "1px solid var(--bz-border)",
      }}
    >
      <div className="biz-container">
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <span className="biz-label">{eyebrow}</span>
          <h2 className="biz-h2" style={{ marginTop: 12 }}>
            {title}
          </h2>
        </div>
        <div className="biz-solution-grid">
          {items.map((s) => (
            <div key={s.title} style={{ display: "flex", flexDirection: "column" }}>
              <div className="biz-sol-icon">
                <Icon name={s.icon} size={22} />
              </div>
              <h4 className="biz-sol-title">{s.title}</h4>
              <p className="biz-sol-desc">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
