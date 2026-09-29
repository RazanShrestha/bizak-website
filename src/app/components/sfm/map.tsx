import * as React from "react";
import { Crosshair, Minus, Plus } from "lucide-react";
import { cn } from "../ui/utils";
import { NUM } from "../sales/bzw";
import { routeColor } from "./kit";

// ════════════════════════════════════════════════════════════════════════════
// FIELD MAP — the companion, never the answer
//
// Drawn in SVG from tokens because the mockup has no map library; in the app
// this is the tenant-keyed Google map behind <bzk-map-guard> (bizak-maps). The
// ground is quiet (land, the Bagmati, the ring road and a few arterials), so
// the only colour on it is data: route identity on pins, a rep's avatar where
// he was last seen, and a trail whose links are DOTTED — only the fixes are
// observed, the path between them is inferred (the watchfloor's honesty rule).
//
// Everything the map shows is also a row in the list beside it; hovering one
// lights the other (`hot`), and a pin click hands the id back to the page.
// ════════════════════════════════════════════════════════════════════════════

export type MapPin = {
  id: string;
  lat: number;
  lng: number;
  tone: number | null;
  /** How the pin is drawn: a stop's mark, or a plain party. */
  kind: "party" | "productive" | "visited" | "pending" | "missed" | "here" | "unplanned";
  label: string;
  sub?: string;
  seq?: number;
  /** Whose pin this is — hovering that rep's row lights every pin of his day. */
  group?: string;
};
export type MapRep = { id: string; lat: number; lng: number; initials: string; stale?: boolean; label: string; sub?: string };
export type MapTrail = { id: string; points: [number, number][]; tone: number | null; faint?: boolean };

type Geo = { land: [number, number][][]; water: [number, number][][]; roads: { pts: [number, number][]; ring?: boolean }[]; labels: [string, number, number][] };

const KTM: Geo = {
  land: [],
  water: [
    // Bagmati (Gokarna → Guheshwori → Thapathali → Teku → Balkhu → Chovar)
    [[27.742, 85.392], [27.73, 85.372], [27.713, 85.355], [27.708, 85.349], [27.699, 85.333], [27.69, 85.322], [27.692, 85.311], [27.694, 85.303], [27.688, 85.298], [27.683, 85.296], [27.671, 85.294], [27.655, 85.292]],
    // Bishnumati
    [[27.752, 85.305], [27.735, 85.303], [27.72, 85.300], [27.705, 85.302], [27.694, 85.303]],
    // Manohara
    [[27.735, 85.39], [27.712, 85.385], [27.692, 85.368], [27.675, 85.36], [27.66, 85.35]],
  ],
  roads: [
    {
      ring: true,
      pts: [
        [27.6935, 85.2815], [27.6849, 85.2987], [27.6671, 85.3063], [27.6588, 85.3249], [27.6667, 85.3342], [27.6789, 85.349], [27.6935, 85.3475], [27.7068, 85.3444],
        [27.7174, 85.3458], [27.7311, 85.3445], [27.7398, 85.3372], [27.7424, 85.3259], [27.7355, 85.315], [27.7317, 85.3031], [27.7159, 85.2828], [27.6935, 85.2815],
      ],
    },
    { pts: [[27.694, 85.321], [27.689, 85.338], [27.679, 85.349], [27.676, 85.385], [27.672, 85.428]] }, // Arniko
    { pts: [[27.69, 85.32], [27.705, 85.315], [27.722, 85.32], [27.738, 85.331]] }, // Kantipath – Maharajgunj
    { pts: [[27.6935, 85.2815], [27.695, 85.3], [27.694, 85.312], [27.694, 85.321]] }, // Kalanki – Tripureshwor
    { pts: [[27.673, 85.314], [27.678, 85.316], [27.69, 85.32]] }, // Jawalakhel – Thapathali
    { pts: [[27.717, 85.346], [27.721, 85.362], [27.723, 85.38]] }, // Chabahil – Boudha – Jorpati
    { pts: [[27.6935, 85.2815], [27.689, 85.255], [27.689, 85.23]] }, // to Thankot
    { pts: [[27.705, 85.315], [27.711, 85.311], [27.715, 85.309], [27.733, 85.303]] }, // Thamel – Balaju
    { pts: [[27.6849, 85.2987], [27.676, 85.286], [27.671, 85.278]] }, // Balkhu – Kirtipur
  ],
  labels: [
    ["Kalanki", 27.6955, 85.279],
    ["Kirtipur", 27.668, 85.279],
    ["Thamel", 27.7155, 85.3095],
    ["New Road", 27.702, 85.3115],
    ["Patan", 27.672, 85.325],
    ["Baneshwor", 27.691, 85.334],
    ["Koteshwor", 27.676, 85.35],
    ["Chabahil", 27.719, 85.349],
    ["Boudha", 27.7235, 85.362],
    ["Balaju", 27.735, 85.302],
    ["Maharajgunj", 27.741, 85.332],
    ["Thimi", 27.674, 85.386],
    ["Thankot", 27.691, 85.232],
  ],
};

const PKR: Geo = {
  land: [],
  water: [
    // Phewa lake as a closed outline
    [[28.212, 83.935], [28.216, 83.945], [28.214, 83.952], [28.207, 83.957], [28.201, 83.954], [28.199, 83.946], [28.204, 83.938], [28.212, 83.935]],
    // Seti
    [[28.25, 83.99], [28.235, 83.994], [28.22, 83.992], [28.205, 83.989], [28.19, 83.99]],
  ],
  roads: [
    { pts: [[28.2, 83.96], [28.208, 83.961], [28.216, 83.962], [28.222, 83.967]] },
    { pts: [[28.209, 83.97], [28.214, 83.978], [28.219, 83.986], [28.225, 83.991]] },
    { pts: [[28.222, 83.967], [28.227, 83.98], [28.232, 83.99]] },
    { pts: [[28.205, 83.99], [28.215, 83.987], [28.228, 83.983], [28.24, 83.98]] },
  ],
  labels: [
    ["Lakeside", 28.207, 83.962],
    ["Phewa Lake", 28.208, 83.946],
    ["Chipledhunga", 28.219, 83.99],
    ["Prithvi Chowk", 28.228, 83.984],
  ],
};

const geoFor = (lng: number) => (lng < 84.5 ? PKR : KTM);

type Box = { minLat: number; maxLat: number; minLng: number; maxLng: number };
function boxOf(points: [number, number][]): Box | null {
  if (!points.length) return null;
  const b = { minLat: Infinity, maxLat: -Infinity, minLng: Infinity, maxLng: -Infinity };
  for (const [la, ln] of points) {
    b.minLat = Math.min(b.minLat, la);
    b.maxLat = Math.max(b.maxLat, la);
    b.minLng = Math.min(b.minLng, ln);
    b.maxLng = Math.max(b.maxLng, ln);
  }
  return b;
}

const W = 1000;
const H = 720;

export function FieldMap({
  pins = [],
  reps = [],
  trails = [],
  hot,
  onHot,
  onPick,
  onPickRep,
  className,
  caption,
  empty,
  compact,
}: {
  pins?: MapPin[];
  reps?: MapRep[];
  trails?: MapTrail[];
  hot?: string | null;
  onHot?: (id: string | null) => void;
  onPick?: (id: string) => void;
  onPickRep?: (id: string) => void;
  className?: string;
  /** One quiet line at the top-left: what the map is showing. */
  caption?: React.ReactNode;
  /** Said on the map when it has nothing to show — a statement, not an error. */
  empty?: string;
  /** A small map inside a panel: no zoom controls, no labels. */
  compact?: boolean;
}) {
  const all: [number, number][] = [...pins.map((p) => [p.lat, p.lng] as [number, number]), ...reps.map((r) => [r.lat, r.lng] as [number, number]), ...trails.flatMap((t) => t.points)];
  const fit = boxOf(all) ?? { minLat: 27.66, maxLat: 27.745, minLng: 85.27, maxLng: 85.39 };
  // Pad the box and keep the map's aspect so a single pin does not zoom to the street.
  // A floor on the frame: one outlet and its two fixes should still show the streets around it (~1.5 km), not 30 m.
  const padLat = Math.max(0.007, (fit.maxLat - fit.minLat) * 0.18);
  const padLng = Math.max(0.009, (fit.maxLng - fit.minLng) * 0.18);
  let b = { minLat: fit.minLat - padLat, maxLat: fit.maxLat + padLat, minLng: fit.minLng - padLng, maxLng: fit.maxLng + padLng };
  const kmLat = 111;
  const kmLng = 111 * Math.cos(((b.minLat + b.maxLat) / 2) * (Math.PI / 180));
  const wKm = (b.maxLng - b.minLng) * kmLng;
  const hKm = (b.maxLat - b.minLat) * kmLat;
  if (wKm / hKm > W / H) {
    const need = (wKm / (W / H)) / kmLat - (b.maxLat - b.minLat);
    b = { ...b, minLat: b.minLat - need / 2, maxLat: b.maxLat + need / 2 };
  } else {
    const need = (hKm * (W / H)) / kmLng - (b.maxLng - b.minLng);
    b = { ...b, minLng: b.minLng - need / 2, maxLng: b.maxLng + need / 2 };
  }
  const x = (lng: number) => ((lng - b.minLng) / (b.maxLng - b.minLng)) * W;
  const y = (lat: number) => ((b.maxLat - lat) / (b.maxLat - b.minLat)) * H;
  const path = (pts: [number, number][]) => pts.map(([la, ln], i) => `${i ? "L" : "M"}${x(ln).toFixed(1)},${y(la).toFixed(1)}`).join(" ");
  const geo = geoFor((b.minLng + b.maxLng) / 2);

  // Zoom and pan: buttons, ⌘/Ctrl + wheel, and drag. A plain wheel scrolls the page.
  const [view, setView] = React.useState({ k: 1, tx: 0, ty: 0 });
  const key = `${b.minLat.toFixed(4)}${b.minLng.toFixed(4)}${b.maxLat.toFixed(4)}`;
  React.useEffect(() => setView({ k: 1, tx: 0, ty: 0 }), [key]);
  const drag = React.useRef<{ x: number; y: number; tx: number; ty: number } | null>(null);
  const svg = React.useRef<SVGSVGElement>(null);
  const zoomBy = (f: number, cx = W / 2, cy = H / 2) =>
    setView((v) => {
      const k = Math.max(1, Math.min(6, v.k * f));
      const r = k / v.k;
      return { k, tx: cx - (cx - v.tx) * r, ty: cy - (cy - v.ty) * r };
    });
  const toLocal = (e: { clientX: number; clientY: number }) => {
    const r = svg.current!.getBoundingClientRect();
    const s = Math.max(W / r.width, H / r.height);
    const ox = (r.width * s - W) / 2;
    const oy = (r.height * s - H) / 2;
    return { lx: (e.clientX - r.left) * s - ox, ly: (e.clientY - r.top) * s - oy, s };
  };

  // A compact map is drawn into a narrow panel, so its viewBox is scaled down more — its pins start bigger.
  const pinR = compact ? 10 : 7;
  const inv = 1 / view.k;
  const hasData = pins.length + reps.length + trails.length > 0;

  return (
    <div className={cn("relative h-full min-h-0 w-full overflow-hidden bg-[var(--bz-map-land)]", className)}>
      <svg
        ref={svg}
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid meet"
        className={cn("block h-full w-full select-none", !compact && "cursor-grab active:cursor-grabbing")}
        onWheel={(e) => {
          if (compact || !(e.ctrlKey || e.metaKey)) return;
          e.preventDefault();
          const { lx, ly } = toLocal(e);
          zoomBy(e.deltaY < 0 ? 1.25 : 0.8, lx, ly);
        }}
        onPointerDown={(e) => {
          if (compact || (e.target as Element).closest("[data-map-hit]")) return;
          (e.currentTarget as SVGSVGElement).setPointerCapture(e.pointerId);
          drag.current = { x: e.clientX, y: e.clientY, tx: view.tx, ty: view.ty };
        }}
        onPointerMove={(e) => {
          if (!drag.current) return;
          const { s } = toLocal(e);
          setView((v) => ({ ...v, tx: drag.current!.tx + (e.clientX - drag.current!.x) * s, ty: drag.current!.ty + (e.clientY - drag.current!.y) * s }));
        }}
        onPointerUp={() => (drag.current = null)}
        role="img"
        aria-label={typeof caption === "string" ? caption : "Map"}
      >
        <g transform={`translate(${view.tx} ${view.ty}) scale(${view.k})`}>
          {/* ground */}
          {geo.water.map((w, i) => {
            const closed = w[0][0] === w[w.length - 1][0] && w[0][1] === w[w.length - 1][1];
            return closed ? (
              <path key={i} d={`${path(w)} Z`} fill="var(--bz-map-water)" stroke="none" />
            ) : (
              <path key={i} d={path(w)} fill="none" stroke="var(--bz-map-water)" strokeWidth={9 * inv} strokeLinecap="round" strokeLinejoin="round" />
            );
          })}
          {geo.roads.map((r, i) => (
            <path key={`r${i}`} d={path(r.pts)} fill="none" stroke={r.ring ? "var(--bz-map-ring)" : "var(--bz-map-road)"} strokeWidth={(r.ring ? 7 : 4.5) * inv} strokeLinecap="round" strokeLinejoin="round" />
          ))}
          {!compact &&
            geo.labels.map(([t, la, ln]) => (
              <text key={t} x={x(ln)} y={y(la)} fontSize={12 * inv} fill="var(--bz-text-soft)" textAnchor="middle" style={{ letterSpacing: "0.04em", fontWeight: 500 }} opacity={0.75}>
                {t}
              </text>
            ))}

          {/* trails: observed fixes as dots, links between them dotted (inferred) */}
          {trails.map((t) => (
            <g key={t.id} opacity={t.faint ? 0.35 : hot && hot !== t.id ? 0.3 : 1}>
              <path d={path(t.points)} fill="none" stroke={t.tone ? routeColor(t.tone) : "var(--bz-text-muted)"} strokeWidth={2.4 * inv} strokeDasharray={`${2 * inv} ${5 * inv}`} strokeLinecap="round" />
              {t.points.map(([la, ln], i) => (
                <circle key={i} cx={x(ln)} cy={y(la)} r={2.4 * inv} fill={t.tone ? routeColor(t.tone) : "var(--bz-text-muted)"} />
              ))}
            </g>
          ))}

          {/* pins */}
          {pins.map((p) => {
            const c = p.tone ? routeColor(p.tone) : "var(--bz-text-muted)";
            const on = hot === p.id;
            const dim = !!hot && !on && p.group !== hot;
            const r = (on ? pinR + 3 : pinR) * inv;
            return (
              <g
                key={p.id}
                data-map-hit=""
                transform={`translate(${x(p.lng)} ${y(p.lat)})`}
                opacity={dim ? 0.4 : 1}
                style={{ cursor: onPick ? "pointer" : "default" }}
                onMouseEnter={() => onHot?.(p.id)}
                onMouseLeave={() => onHot?.(null)}
                onClick={() => onPick?.(p.id)}
              >
                <title>{`${p.label}${p.sub ? ` — ${p.sub}` : ""}`}</title>
                {p.kind === "unplanned" ? (
                  <rect x={-r * 0.8} y={-r * 0.8} width={r * 1.6} height={r * 1.6} transform="rotate(45)" rx={1.5 * inv} fill="var(--bz-surface)" stroke="var(--bz-text)" strokeWidth={1.6 * inv} />
                ) : (
                  <>
                    <circle r={r + 2 * inv} fill="var(--bz-surface)" />
                    <circle
                      r={r}
                      fill={p.kind === "pending" || p.kind === "party" ? "var(--bz-surface)" : p.kind === "missed" ? "var(--bz-red-soft)" : c}
                      stroke={p.kind === "missed" ? "var(--bz-red-mark)" : c}
                      strokeWidth={(p.kind === "pending" || p.kind === "party" ? 2.4 : 1.6) * inv}
                    />
                    {p.kind === "visited" && <path d={`M0,${-r} A${r},${r} 0 0,1 0,${r} Z`} fill="var(--bz-surface)" opacity={0.85} />}
                    {p.kind === "here" && <circle r={r + 5 * inv} fill="none" stroke="var(--bz-fire)" strokeWidth={3 * inv} />}
                  </>
                )}
                {p.seq !== undefined && !compact && (
                  <text y={-r - 5 * inv} fontSize={10 * inv} textAnchor="middle" fill="var(--bz-text-muted)" style={{ fontWeight: 600 }}>
                    {p.seq}
                  </text>
                )}
                {on && !compact && (
                  <g transform={`translate(${12 * inv} ${-10 * inv})`}>
                    <rect x={0} y={-12 * inv} width={Math.min(260, 7.2 * (p.label.length + 2)) * inv} height={(p.sub ? 34 : 20) * inv} rx={5 * inv} fill="var(--bz-raised)" />
                    <text x={7 * inv} y={2 * inv} fontSize={11.5 * inv} fill="var(--bz-text-on-dark)" style={{ fontWeight: 600 }}>
                      {p.label}
                    </text>
                    {p.sub && (
                      <text x={7 * inv} y={16 * inv} fontSize={10.5 * inv} fill="var(--bz-text-on-dark)" opacity={0.7}>
                        {p.sub}
                      </text>
                    )}
                  </g>
                )}
              </g>
            );
          })}

          {/* reps: the avatar where the rep was last seen */}
          {reps.map((r) => {
            const on = hot === r.id;
            const R = (on ? 15 : 12.5) * inv;
            return (
              <g
                key={r.id}
                data-map-hit=""
                transform={`translate(${x(r.lng)} ${y(r.lat)})`}
                opacity={hot && !on && !pins.some((p) => p.id === hot && p.group === r.id) ? 0.45 : 1}
                style={{ cursor: onPickRep ? "pointer" : "default" }}
                onMouseEnter={() => onHot?.(r.id)}
                onMouseLeave={() => onHot?.(null)}
                onClick={() => onPickRep?.(r.id)}
              >
                <title>{`${r.label}${r.sub ? ` — ${r.sub}` : ""}`}</title>
                {!r.stale && <circle r={R + 6 * inv} fill="var(--bz-fire)" opacity={0.28} />}
                <circle r={R} fill={r.stale ? "var(--bz-paper-warm)" : "var(--bz-olive)"} stroke="var(--bz-surface)" strokeWidth={2.5 * inv} />
                <text y={4 * inv} fontSize={10.5 * inv} textAnchor="middle" fill={r.stale ? "var(--bz-text-muted)" : "var(--bz-fire)"} style={{ fontWeight: 700 }}>
                  {r.initials}
                </text>
              </g>
            );
          })}
        </g>
      </svg>

      {caption && <div className="pointer-events-none absolute left-3 top-3 max-w-[80%] rounded-bz-md bg-bz-surface/90 px-2 py-1 text-[11px] text-bz-text-muted shadow-sm backdrop-blur">{caption}</div>}
      {!hasData && empty && (
        <div className="absolute inset-0 flex items-center justify-center p-6">
          <p className="m-0 rounded-bz-md bg-bz-surface/90 px-3 py-2 text-center text-[12px] text-bz-text-muted">{empty}</p>
        </div>
      )}
      {!compact && (
        <div className="absolute bottom-3 right-3 flex flex-col overflow-hidden rounded-bz-md border border-bz-line bg-bz-surface shadow-sm">
          <button type="button" className="flex size-8 items-center justify-center text-bz-text-muted hover:bg-bz-paper-warm hover:text-bz-text" onClick={() => zoomBy(1.4)} title="Zoom in (⌘ + wheel)" aria-label="Zoom in">
            <Plus size={14} />
          </button>
          <button type="button" className="flex size-8 items-center justify-center border-t border-bz-line-soft text-bz-text-muted hover:bg-bz-paper-warm hover:text-bz-text" onClick={() => zoomBy(1 / 1.4)} title="Zoom out" aria-label="Zoom out">
            <Minus size={14} />
          </button>
          <button type="button" className="flex size-8 items-center justify-center border-t border-bz-line-soft text-bz-text-muted hover:bg-bz-paper-warm hover:text-bz-text" onClick={() => setView({ k: 1, tx: 0, ty: 0 })} title="Fit everything" aria-label="Fit everything">
            <Crosshair size={13} />
          </button>
        </div>
      )}
      {!compact && <span className={cn("pointer-events-none absolute bottom-3 left-3 text-[10px] text-bz-text-soft", NUM)}>Mockup ground · the app draws the tenant's Google map</span>}
    </div>
  );
}
