import { type ReactNode } from "react";
import { Icon } from "../../marketing/Icon";

interface ChallengesGridProps {
  eyebrow: string;
  title: ReactNode;
  description: string;
  /** Optional max-width for the headline block. Default: 680. */
  headlineMaxWidth?: number;
  /** Six `<ChallengeCard>` children. */
  children: ReactNode;
}

/**
 * Light section + 6-card bento grid. Each "challenge" card carries an icon,
 * a title, a description, and a slot (`children` of `ChallengeCard`) for
 * the unique data visualization that varies per row.
 */
export function ChallengesGrid({
  eyebrow,
  title,
  description,
  headlineMaxWidth = 680,
  children,
}: ChallengesGridProps) {
  return (
    <section className="biz-section" style={{ background: "var(--bz-bg)" }}>
      <div className="biz-container">
        <div style={{ marginBottom: 48 }}>
          <span className="biz-label">{eyebrow}</span>
          <h2 className="biz-h2" style={{ marginTop: 16, maxWidth: headlineMaxWidth }}>
            {title}
          </h2>
          <p className="biz-section-intro">{description}</p>
        </div>
        <div className="biz-bento-grid">{children}</div>
      </div>
    </section>
  );
}

interface ChallengeCardProps {
  /** Either a registered icon name, or any custom ReactNode (e.g., a lucide icon). */
  icon: string | ReactNode;
  title: string;
  description: string;
  /** The unique footer visualization. */
  children?: ReactNode;
}

export function ChallengeCard({ icon, title, description, children }: ChallengeCardProps) {
  return (
    <div className="biz-bento-card">
      <div className="biz-icon-wrap">
        {typeof icon === "string" ? <Icon name={icon} size={22} /> : icon}
      </div>
      <h3 className="biz-card-title">{title}</h3>
      <p className="biz-card-desc">{description}</p>
      {children && <div className="biz-card-footer">{children}</div>}
    </div>
  );
}
