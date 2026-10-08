import * as React from "react";
import { ExternalLink, Loader2, LocateFixed } from "lucide-react";
import { cn } from "../ui/utils";
import { BTN, Dialog, Field, GHOST, GHOST_SM, INPUT } from "../sales/bzw";
import { coordsText, getPosition, geoHelp, mapUrl, validLat, validLng } from "./geo";
import type { GeoError, GeoFix, GeoPoint } from "./geo";

// ════════════════════════════════════════════════════════════════════════════
// GEO · SMALL PARTS — the map embed, a map link, "use my location", and the
// coordinates dialog. Shared by the rep app, the customer panel, quick add and
// the field pages.
// ════════════════════════════════════════════════════════════════════════════

/** Ask the device where it is, with the busy/error state a button needs. */
export function useLocate() {
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<GeoError | null>(null);
  const alive = React.useRef(true);
  React.useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  const locate = React.useCallback(async (): Promise<GeoFix | null> => {
    setBusy(true);
    setError(null);
    const r = await getPosition();
    if (alive.current) {
      setBusy(false);
      if (!r.ok) setError(r.error);
    }
    return r.ok ? r.fix : null;
  }, []);
  const clear = React.useCallback(() => setError(null), []);
  return { busy, error, locate, clear };
}

/** An OpenStreetMap view. Only rendered where there is a point to show, and loaded lazily. */
export function MapEmbed({ src, title, className }: { src: string; title: string; className?: string }) {
  return (
    <iframe
      src={src}
      title={title}
      loading="lazy"
      className={cn("block h-[180px] w-full rounded-bz-md border border-bz-line-soft bg-bz-paper-warm [.bzw-dark_&]:brightness-[.85]", className)}
    />
  );
}

export function MapLink({ p, children = "Open in map", className }: { p: GeoPoint; children?: React.ReactNode; className?: string }) {
  return (
    <a href={mapUrl(p.lat, p.lng)} target="_blank" rel="noopener noreferrer" className={cn("inline-flex items-center gap-1 whitespace-nowrap text-[11.5px] text-bz-text-muted underline-offset-2 hover:text-bz-text hover:underline", className)}>
      {children}
      <ExternalLink size={11} className="shrink-0" />
    </a>
  );
}

/** "Finding your location…" with a spinner. */
export function Finding({ className, children = "Finding your location…" }: { className?: string; children?: React.ReactNode }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-[11.5px] text-bz-text-muted", className)} role="status">
      <Loader2 size={12} className="shrink-0 animate-spin" /> {children}
    </span>
  );
}

/** A "Use my current location" button that reports the fix, or one line on what went wrong. */
export function UseMyLocation({ onFix, label = "Use my current location", small }: { onFix: (fix: GeoFix) => void; label?: string; small?: boolean }) {
  const { busy, error, locate } = useLocate();
  return (
    <div className="flex min-w-0 flex-col items-start gap-1.5">
      <button
        type="button"
        className={small ? GHOST_SM : GHOST}
        disabled={busy}
        onClick={async () => {
          const fix = await locate();
          if (fix) onFix(fix);
        }}
      >
        <LocateFixed size={13} /> {busy ? "Finding…" : label}
      </button>
      {busy && <Finding />}
      {error && <span className="text-[11px] leading-snug text-bz-red">{geoHelp(error)}</span>}
    </div>
  );
}

/** "27.7, 85.3" pasted from a map app → both numbers. */
function splitPair(s: string): [string, string] | null {
  const m = s.trim().match(/^(-?\d+(?:\.\d+)?)\s*[, ]\s*(-?\d+(?:\.\d+)?)$/);
  return m ? [m[1], m[2]] : null;
}

export function CoordsDialog({ open, initial, eyebrow, onClose, onSave }: { open: boolean; initial?: GeoPoint | null; eyebrow?: string; onClose: () => void; onSave: (p: GeoPoint) => void }) {
  const [lat, setLat] = React.useState("");
  const [lng, setLng] = React.useState("");
  const [tried, setTried] = React.useState(false);
  React.useEffect(() => {
    if (!open) return;
    setLat(initial ? String(initial.lat) : "");
    setLng(initial ? String(initial.lng) : "");
    setTried(false);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps
  const la = Number(lat.trim());
  const ln = Number(lng.trim());
  const latBad = !lat.trim() || !validLat(la);
  const lngBad = !lng.trim() || !validLng(ln);
  const zero = !latBad && !lngBad && la === 0 && ln === 0;
  const error = latBad ? "Latitude is a number from -90 to 90." : lngBad ? "Longitude is a number from -180 to 180." : zero ? "0, 0 is in the sea. Check the numbers." : null;
  const typeLat = (v: string) => {
    const pair = splitPair(v);
    if (pair) {
      setLat(pair[0]);
      setLng(pair[1]);
    } else setLat(v);
  };
  const save = () => {
    setTried(true);
    if (error) return;
    onSave({ lat: la, lng: ln });
  };
  return (
    <Dialog
      open={open}
      size="sm"
      eyebrow={eyebrow}
      title="Enter coordinates"
      onClose={onClose}
      foot={
        <>
          {tried && error && <span className="mr-auto text-[11.5px] text-bz-red">{error}</span>}
          <button type="button" className={GHOST} onClick={onClose}>
            Cancel
          </button>
          <button type="button" className={BTN} onClick={save}>
            Save
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <p className="m-0 text-[11.5px] text-bz-text-soft">Paste “27.70172, 85.31831” from a map app into Latitude to fill both.</p>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Latitude" required>
            <input autoFocus inputMode="decimal" value={lat} onChange={(e) => typeLat(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), save())} className={cn(INPUT, tried && latBad && "border-bz-red-mark")} placeholder="27.70172" aria-invalid={tried && latBad} />
          </Field>
          <Field label="Longitude" required>
            <input inputMode="decimal" value={lng} onChange={(e) => setLng(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), save())} className={cn(INPUT, tried && lngBad && "border-bz-red-mark")} placeholder="85.31831" aria-invalid={tried && lngBad} />
          </Field>
        </div>
        {!error && <p className="m-0 text-[11px] text-bz-text-soft">{coordsText({ lat: la, lng: ln })}</p>}
      </div>
    </Dialog>
  );
}
