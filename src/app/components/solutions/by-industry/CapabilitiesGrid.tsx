import { type ReactNode } from "react";
import { Icon } from "../../marketing/Icon";

interface CapabilitiesGridProps {
  eyebrow: string;
  title: ReactNode;
  /** Optional max-width for the headline block. Default: 560. */
  headlineMaxWidth?: number;
  /** Cards via `<CapabilityCard>` (col-2/3/6). */
  children: ReactNode;
}

/**
 * Dark section + 6-column bento grid for the "Capabilities" section.
 * Each card declares its column span via the `span` prop on `CapabilityCard`
 * (`2`, `3`, or `6`).
 */
export function CapabilitiesGrid({
  eyebrow,
  title,
  headlineMaxWidth = 560,
  children,
}: CapabilitiesGridProps) {
  return (
    <section className="biz-dark-section">
      <div className="biz-container">
        <div style={{ marginBottom: 64, maxWidth: headlineMaxWidth }}>
          <span className="biz-label">{eyebrow}</span>
          <h2 className="biz-h2-white" style={{ marginTop: 12 }}>
            {title}
          </h2>
        </div>
        <div className="biz-caps-grid">{children}</div>
      </div>
    </section>
  );
}

// ─── Card ────────────────────────────────────────────────────────────────────

interface CapabilityCardProps {
  /** Column span: 2 (small), 3 (half), 6 (full-width). */
  span: 2 | 3 | 6;
  /** Adds the accent neon-border highlight. */
  neon?: boolean;
  minHeight?: number;
  /** When true, sets `justifyContent: 'space-between'` so trailing content sticks to bottom. */
  spaceBetween?: boolean;
  /** Optional small accent label in the top-right (e.g., "Live Tracking", "AI"). */
  cornerBadge?: string;
  style?: React.CSSProperties;
  children: ReactNode;
}

export function CapabilityCard({
  span,
  neon,
  minHeight,
  spaceBetween,
  cornerBadge,
  style,
  children,
}: CapabilityCardProps) {
  return (
    <div
      className={`biz-dark-card biz-col-${span}${neon ? " biz-neon-border" : ""}`}
      style={{
        position: cornerBadge ? "relative" : undefined,
        minHeight,
        justifyContent: spaceBetween ? "space-between" : undefined,
        ...style,
      }}
    >
      {cornerBadge && (
        <div style={{ position: "absolute", top: 16, right: 22 }}>
          <span
            style={{
              fontSize: 9,
              fontWeight: 700,
              color: "var(--bz-accent)",
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              opacity: 0.85,
            }}
          >
            {cornerBadge}
          </span>
        </div>
      )}
      {children}
    </div>
  );
}

// ─── Small col-2 card variant: icon + title + body, optional progress bar ────

interface SimpleFeatureCardProps {
  iconName: string;
  title: string;
  body: string;
  /** Optional bottom progress bar (0–100). */
  progressPct?: number;
  /** Optional sub-label below the progress bar. */
  progressLabel?: string;
  /** Card spans 2 columns by default; pass `3` for half-width. */
  span?: 2 | 3;
  neon?: boolean;
  cornerBadge?: string;
  minHeight?: number;
}

export function SimpleFeatureCard({
  iconName,
  title,
  body,
  progressPct,
  progressLabel,
  span = 2,
  neon,
  cornerBadge,
  minHeight = 240,
}: SimpleFeatureCardProps) {
  return (
    <CapabilityCard
      span={span}
      neon={neon}
      cornerBadge={cornerBadge}
      minHeight={minHeight}
      spaceBetween={progressPct !== undefined}
    >
      <div>
        <div style={{ color: "var(--bz-accent)", marginBottom: 20 }}>
          <Icon name={iconName} size={34} />
        </div>
        <h4 style={{ fontWeight: 700, fontSize: 17, color: "#fff", marginBottom: 10 }}>
          {title}
        </h4>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.48)", lineHeight: 1.6 }}>
          {body}
        </p>
      </div>
      {progressPct !== undefined && (
        <div style={{ marginTop: "auto", paddingTop: 16 }}>
          <div
            style={{
              height: 6,
              background: "rgba(255,255,255,0.1)",
              borderRadius: 99,
              overflow: "hidden",
            }}
          >
            <div
              style={{ height: "100%", width: `${progressPct}%`, background: "var(--bz-accent)" }}
            />
          </div>
          {progressLabel && (
            <div
              style={{
                fontSize: 9,
                color: "rgba(255,255,255,0.3)",
                marginTop: 6,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              {progressLabel}
            </div>
          )}
        </div>
      )}
    </CapabilityCard>
  );
}

// ─── MonoTable (used inside col-3 cards) ─────────────────────────────────────

interface MonoTableRow {
  values: ReactNode[];
  /** Override color of the right-most cell. */
  statusColor?: string;
}

interface MonoTableProps {
  headers: string[];
  rows: MonoTableRow[];
}

export function MonoTable({ headers, rows }: MonoTableProps) {
  return (
    <div className="biz-mono-table">
      <div className="biz-mono-header">
        {headers.map((h) => (
          <span key={h}>{h}</span>
        ))}
      </div>
      {rows.map((r, idx) => (
        <div key={idx} className="biz-mono-row">
          {r.values.map((v, i) => (
            <span
              key={i}
              style={i === r.values.length - 1 && r.statusColor ? { color: r.statusColor } : undefined}
            >
              {v}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── MethodGrid (3-up "label / sub" boxes inside col-3 cards) ────────────────

interface MethodGridItem {
  label: string;
  sub: string;
}

export function MethodGrid({ items }: { items: MethodGridItem[] }) {
  return (
    <div className="biz-method-grid">
      {items.map((m) => (
        <div key={m.sub} className="biz-method-box">
          <div className="biz-method-label">{m.label}</div>
          <div className="biz-method-sub">{m.sub}</div>
        </div>
      ))}
    </div>
  );
}

// ─── FeatureWithMockupCard ───────────────────────────────────────────────────
//
// Used by ProfessionalServicePage's "Time & Engagement Tracker" and
// RetailAndEcommercePage's "POS Billing" the col-6 dark card with a
// feature list on the left and a branded device-mockup card on the right.

interface FeatureItem {
  /** Registered icon name from the global Icon registry. */
  icon: string;
  text: string;
}

interface MockupHeader {
  /** Left-side header label (e.g., "Active Timesheet", "Bizak POS"). */
  title: string;
  /** Right-side status label (e.g., "Running", "Terminal 01"). */
  rightLabel: string;
}

interface MockupBadge {
  val: string;
  lbl: string;
}

interface FeatureWithMockupCardProps {
  iconName: string;
  /** Small uppercase eyebrow shown above the title (e.g., "Point of Sale"). */
  eyebrow: string;
  title: string;
  description: string;
  features: FeatureItem[];
  /** Mockup header strip configuration (left title + right status label). */
  mockupHeader: MockupHeader;
  /** Mockup body slot page-specific content (timesheet rows, POS bill, etc.). */
  mockupBody: ReactNode;
  /** Optional stat badges rendered below the mockup. */
  mockupBadges?: MockupBadge[];
  /** Mockup card width. Default 280. */
  mockupWidth?: number;
  neon?: boolean;
  minHeight?: number;
}

export function FeatureWithMockupCard({
  iconName,
  eyebrow,
  title,
  description,
  features,
  mockupHeader,
  mockupBody,
  mockupBadges,
  mockupWidth = 280,
  neon,
  minHeight = 280,
}: FeatureWithMockupCardProps) {
  return (
    <CapabilityCard span={6} neon={neon} minHeight={minHeight}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 48, flexWrap: "wrap" }}>
        {/* Left: icon-badge + headline + description + feature bullets */}
        <div style={{ flex: 1, minWidth: 260 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: "rgba(199,255,53,0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--bz-accent)",
                flexShrink: 0,
              }}
            >
              <Icon name={iconName} size={26} />
            </div>
            <div>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.35)",
                  marginBottom: 4,
                }}
              >
                {eyebrow}
              </div>
              <h4 style={{ fontWeight: 700, fontSize: 20, color: "#fff", margin: 0 }}>{title}</h4>
            </div>
          </div>
          <p
            style={{
              fontSize: 13,
              color: "rgba(255,255,255,0.48)",
              lineHeight: 1.7,
              marginBottom: 24,
            }}
          >
            {description}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {features.map((f) => (
              <div key={f.text} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 7,
                    background: "rgba(199,255,53,0.08)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--bz-accent)",
                    flexShrink: 0,
                    marginTop: 1,
                  }}
                >
                  <Icon name={f.icon} size={14} />
                </div>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", lineHeight: 1.55 }}>
                  {f.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: branded mockup card */}
        <div style={{ flexShrink: 0, width: mockupWidth }}>
          <div
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 16,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                background: "rgba(199,255,53,0.08)",
                borderBottom: "1px solid rgba(255,255,255,0.07)",
                padding: "10px 16px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: "var(--bz-accent)",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                }}
              >
                {mockupHeader.title}
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div
                  className="biz-pulse-glow"
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "var(--bz-accent)",
                  }}
                />
                <span
                  style={{
                    fontSize: 8,
                    color: "rgba(255,255,255,0.4)",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                  }}
                >
                  {mockupHeader.rightLabel}
                </span>
              </div>
            </div>
            {mockupBody}
          </div>
          {mockupBadges && (
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              {mockupBadges.map((s) => (
                <div
                  key={s.lbl}
                  style={{
                    flex: 1,
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 10,
                    padding: "10px 12px",
                  }}
                >
                  <div style={{ fontSize: 16, fontWeight: 700, color: "var(--bz-accent)" }}>
                    {s.val}
                  </div>
                  <div
                    style={{
                      fontSize: 9,
                      color: "rgba(255,255,255,0.35)",
                      marginTop: 2,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                    }}
                  >
                    {s.lbl}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </CapabilityCard>
  );
}

// ─── MiniStatBlock (the big "248 / Active Orders" block inside col-6 cards) ──

interface MiniStatBlockProps {
  value: string;
  label: string;
  /** Optional secondary stat row beneath. */
  secondary?: { value: string; label: string }[];
}

export function MiniStatBlock({ value, label, secondary }: MiniStatBlockProps) {
  return (
    <div style={{ flexShrink: 0 }}>
      <div className="biz-mini-stat">{value}</div>
      <p
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.45)",
          marginTop: 6,
        }}
      >
        {label}
      </p>
      {secondary && (
        <div style={{ display: "flex", gap: 28, marginTop: 20 }}>
          {secondary.map((s) => (
            <div key={s.label}>
              <div style={{ fontSize: 22, fontWeight: 700, color: "var(--bz-accent)" }}>{s.value}</div>
              <div
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "rgba(255,255,255,0.35)",
                  marginTop: 3,
                }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
