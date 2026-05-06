import { type ReactNode } from "react";
import { Icon } from "../../marketing/Icon";

interface NodeProps {
  /** Either a registered icon name from the global registry, or any ReactNode. */
  icon: string | ReactNode;
  /** Uppercase code badge (e.g., "M-01", "WEB", "SR"). */
  code: string;
  /** Lower-case description (e.g., "Cutting", "Storefront", "Senior"). */
  label: string;
  /** Right-most metric (e.g., "89%", "54%", "92%"). Use `"—"` to mark inactive. */
  value: string;
  /** When true: accent border + glow + green status dot. When false: muted gray. */
  active: boolean;
  /** Optional override for the corner status dot color when inactive. */
  inactiveDotColor?: string;
}

/**
 * Generic "node" tile used inside HeroMainCard panel bodies. Replaces the
 * page-specific WorkCenterNode / ChannelNode / TeamLoadNode duplicates.
 *
 * Pass `icon` as a string to look up the global Icon registry, or as any
 * ReactNode (e.g., `<span>{code}</span>`) when the slot needs custom content.
 */
export function Node({
  icon,
  code,
  label,
  value,
  active,
  inactiveDotColor = "#fbbf24",
}: NodeProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 5,
        flex: 1,
      }}
    >
      <div
        style={{
          width: 42,
          height: 42,
          borderRadius: 10,
          border: `1.5px solid ${active ? "rgba(199,255,53,0.5)" : "rgba(122,130,109,0.18)"}`,
          background: active ? "rgba(199,255,53,0.06)" : "rgba(122,130,109,0.03)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          boxShadow: active ? "0 0 12px rgba(199,255,53,0.12)" : "none",
        }}
      >
        {typeof icon === "string" ? (
          <Icon name={icon} size={17} style={{ color: active ? "var(--bz-sage)" : "#ccc" }} />
        ) : (
          icon
        )}
        <div
          style={{
            position: "absolute",
            top: -3,
            right: -3,
            width: 9,
            height: 9,
            borderRadius: "50%",
            background: active ? "var(--bz-accent)" : inactiveDotColor,
            boxShadow: active ? "0 0 5px var(--bz-accent)" : "none",
          }}
        />
      </div>
      <span
        style={{
          fontSize: 7,
          fontWeight: 700,
          color: "#888",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
        }}
      >
        {code}
      </span>
      <span style={{ fontSize: 7, color: "#bbb", letterSpacing: "0.03em" }}>{label}</span>
      <span
        style={{
          fontSize: 9,
          fontWeight: 700,
          color: active ? "var(--bz-accent)" : "#bbb",
        }}
      >
        {value}
      </span>
    </div>
  );
}
