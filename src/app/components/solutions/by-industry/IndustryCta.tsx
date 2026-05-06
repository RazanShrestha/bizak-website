interface IndustryCtaProps {
  title: string;
  description: string;
  primaryLabel?: string;
  primaryHref?: string;
  primaryOnClick?: () => void;
  secondaryLabel?: string;
  secondaryHref?: string;
  secondaryOnClick?: () => void;
}

/**
 * Closing CTA section: dark surface, centered headline + description,
 * primary accent button + secondary ghost button. Used at the bottom of
 * every "By Industry" page.
 */
export function IndustryCta({
  title,
  description,
  primaryLabel = "Request Demo",
  primaryHref,
  primaryOnClick,
  secondaryLabel = "View Pricing",
  secondaryHref,
  secondaryOnClick,
}: IndustryCtaProps) {
  return (
    <section className="biz-cta-section">
      <div className="biz-cta-glow" />
      <div className="biz-container" style={{ position: "relative", zIndex: 10 }}>
        <h2 className="biz-cta-title">{title}</h2>
        <p className="biz-cta-sub">{description}</p>
        <div className="biz-cta-btn-row">
          <CtaButton
            kind="primary"
            label={primaryLabel}
            href={primaryHref}
            onClick={primaryOnClick}
          />
          <CtaButton
            kind="ghost"
            label={secondaryLabel}
            href={secondaryHref}
            onClick={secondaryOnClick}
          />
        </div>
      </div>
    </section>
  );
}

function CtaButton({
  kind,
  label,
  href,
  onClick,
}: {
  kind: "primary" | "ghost";
  label: string;
  href?: string;
  onClick?: () => void;
}) {
  const className = kind === "primary" ? "biz-shimmer-btn" : "biz-btn-ghost";
  const style =
    kind === "primary"
      ? {
          fontSize: 17,
          fontWeight: 700,
          padding: "16px 44px",
          borderRadius: 8,
          boxShadow: "0 0 20px rgba(199,255,53,0.38)",
        }
      : undefined;

  if (href) {
    return (
      <a className={className} href={href} style={style as React.CSSProperties | undefined}>
        {label}
      </a>
    );
  }
  return (
    <button className={className} onClick={onClick} style={style}>
      {label}
    </button>
  );
}
