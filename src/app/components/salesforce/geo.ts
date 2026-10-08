import { SF_NOW, SF_TODAY } from "./data";
import type { Customer, LocationPing, Visit } from "./data";
import { nextId } from "./persist";
import { customersStore, fieldSettingsStore, locationsStore } from "./store";

// ════════════════════════════════════════════════════════════════════════════
// GEO — the phone's GPS, distances, map links, and the location pings
//
// No map library: a point is shown with OpenStreetMap's embed page in an
// iframe and opened in Google Maps by link. Geolocation only runs in a secure
// context (https, localhost, [::1]); anywhere else, and whenever the rep says
// no, `getPosition` resolves to a typed error instead of throwing, so every
// caller keeps working without a fix.
// ════════════════════════════════════════════════════════════════════════════

export type GeoPoint = { lat: number; lng: number };
export type GeoFix = GeoPoint & { accuracy: number };
export type GeoError = "denied" | "unavailable" | "timeout" | "unsupported";
// Both members name both fields so a caller reads `r.error` / `r.fix` without narrowing (the prototype runs without strict).
export type GeoResult = { ok: true; fix: GeoFix; error?: undefined } | { ok: false; fix?: undefined; error: GeoError };

const TIMEOUT = 12_000;

export function getPosition(): Promise<GeoResult> {
  return new Promise((resolve) => {
    const geo = typeof navigator !== "undefined" ? navigator.geolocation : undefined;
    if (!geo || (typeof window !== "undefined" && window.isSecureContext === false)) return resolve({ ok: false, error: "unsupported" });
    let settled = false;
    // A permission prompt that is dismissed (not answered) never calls back in some browsers, and the API's own
    // timeout only starts once permission is given — this guard keeps a button from saying "Finding…" forever.
    const guard = window.setTimeout(() => finish({ ok: false, error: "timeout" }), TIMEOUT + 30_000);
    function finish(r: GeoResult) {
      if (settled) return;
      settled = true;
      window.clearTimeout(guard);
      resolve(r);
    }
    try {
      geo.getCurrentPosition(
        (p) => finish({ ok: true, fix: { lat: p.coords.latitude, lng: p.coords.longitude, accuracy: Math.round(p.coords.accuracy) } }),
        (e) => finish({ ok: false, error: e.code === 1 ? "denied" : e.code === 3 ? "timeout" : "unavailable" }),
        { enableHighAccuracy: true, timeout: TIMEOUT, maximumAge: 0 },
      );
    } catch {
      finish({ ok: false, error: "unsupported" });
    }
  });
}

/** One line on what went wrong and how to fix it. */
export function geoHelp(error: GeoError | null | undefined): string {
  if (error === "denied") return "Location is blocked for this site. Allow it from the lock icon in the address bar, then try again.";
  if (error === "timeout") return "Your location took too long to find. Move near a window or outside, then try again.";
  if (error === "unavailable") return "Your device could not find its location. Turn on location (GPS) in its settings, then try again.";
  if (error === "unsupported")
    return typeof window !== "undefined" && window.isSecureContext === false ? "Location only works on a secure (https) page." : "This browser can't share your location.";
  return "Your location was not found. Try again.";
}

// ── Distances ───────────────────────────────────────────────────────────────

/** Great-circle distance in metres (haversine). */
export function distanceMetres(a: GeoPoint, b: GeoPoint): number {
  const R = 6_371_000;
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** "35 m", "2.4 km", "148 km". */
export function fmtDistance(m: number): string {
  if (!Number.isFinite(m)) return "—";
  if (Math.round(m) < 1000) return `${Math.round(m)} m`;
  return m < 100_000 ? `${(m / 1000).toFixed(1)} km` : `${Math.round(m / 1000)} km`;
}

export const coordsText = (p: GeoPoint) => `${p.lat.toFixed(5)}, ${p.lng.toFixed(5)}`;

export const validLat = (n: number) => Number.isFinite(n) && n >= -90 && n <= 90;
export const validLng = (n: number) => Number.isFinite(n) && n >= -180 && n <= 180;

// ── Maps ────────────────────────────────────────────────────────────────────

export const mapUrl = (lat: number, lng: number) => `https://www.google.com/maps/search/?api=1&query=${lat.toFixed(6)},${lng.toFixed(6)}`;

const r6 = (n: number) => Number(n.toFixed(6));
const embed = (minLng: number, minLat: number, maxLng: number, maxLat: number, marker: GeoPoint) =>
  `https://www.openstreetmap.org/export/embed.html?bbox=${[minLng, minLat, maxLng, maxLat].map(r6).join("%2C")}&layer=mapnik&marker=${r6(marker.lat)}%2C${r6(marker.lng)}`;

/** An OpenStreetMap embed centred on one point. Zoom 16 ≈ a few streets around it. */
export function osmEmbedUrl(lat: number, lng: number, zoom = 16): string {
  const tile = 360 / 2 ** zoom;
  const dLng = tile * 0.9;
  const dLat = tile * 0.55 * Math.cos((lat * Math.PI) / 180);
  return embed(lng - dLng, lat - dLat, lng + dLng, lat + dLat, { lat, lng });
}

/** An embed whose box holds every point, with the marker on `focus` (the embed shows one marker only). */
export function osmBoundsUrl(points: GeoPoint[], focus: GeoPoint): string {
  const all = points.length ? points : [focus];
  if (all.length === 1) return osmEmbedUrl(focus.lat, focus.lng);
  let minLat = Math.min(...all.map((p) => p.lat));
  let maxLat = Math.max(...all.map((p) => p.lat));
  let minLng = Math.min(...all.map((p) => p.lng));
  let maxLng = Math.max(...all.map((p) => p.lng));
  const padLat = Math.max((maxLat - minLat) * 0.2, 0.003);
  const padLng = Math.max((maxLng - minLng) * 0.2, 0.004);
  minLat -= padLat;
  maxLat += padLat;
  minLng -= padLng;
  maxLng += padLng;
  return embed(minLng, minLat, maxLng, maxLat, focus);
}

// ── The geofence ────────────────────────────────────────────────────────────

/** At the shop = within the tenant's radius, plus the fix's own error up to 100 m (a phone indoors reads loose). */
export function withinFence(metres: number, accuracy = 0): boolean {
  return metres <= fieldSettingsStore.get().geofenceMetres + Math.min(Math.max(0, accuracy), 100);
}

export type Geofence = NonNullable<Visit["geofence"]>;

/** The geofence a fix gives at a customer: measured when the shop has a saved location, unmeasured otherwise. */
export function fenceFor(c: Customer | undefined, fix: GeoFix): Geofence {
  if (!c?.location) return { ok: false, metres: null, lat: fix.lat, lng: fix.lng, accuracy: fix.accuracy };
  const metres = Math.round(distanceMetres(fix, c.location));
  return { ok: withinFence(metres, fix.accuracy), metres, lat: fix.lat, lng: fix.lng, accuracy: fix.accuracy };
}

/**
 * What the office reads off a visit's geofence:
 * at = GPS says at the shop · away = GPS says elsewhere · unmeasured = a fix, but the shop had no location ·
 * manual = no fix, the rep said they were there · none = no fix and no word · null = never checked in.
 */
export type FenceState = "at" | "away" | "unmeasured" | "manual" | "none";
export function fenceState(g: Visit["geofence"]): FenceState | null {
  if (!g) return null;
  if (g.manual) return "manual";
  if (g.lat == null || g.lng == null) return g.ok ? "manual" : "none";
  if (g.metres == null) return g.ok ? "at" : "unmeasured";
  return g.ok ? "at" : "away";
}
export const FENCE_LABEL: Record<FenceState, { label: string; tone: "good" | "warn" | "neutral" }> = {
  at: { label: "At the shop", tone: "good" },
  away: { label: "Away", tone: "warn" },
  unmeasured: { label: "Shop had no location", tone: "neutral" },
  manual: { label: "No GPS", tone: "warn" },
  none: { label: "No GPS", tone: "warn" },
};
/** "At the shop (35 m)", "2.4 km from the shop", "Checked in without GPS". */
export function fenceText(g: Visit["geofence"]): string {
  const s = fenceState(g);
  if (!s || !g) return "Not checked in";
  if (s === "at") return g.metres != null ? `At the shop (${fmtDistance(g.metres)})` : "At the shop";
  if (s === "away") return `${fmtDistance(g.metres ?? 0)} from the shop`;
  if (s === "unmeasured") return "Shop had no location";
  if (s === "manual") return "Checked in without GPS";
  return "No GPS fix";
}
/** The visits a manager should look at: checked in away from the shop, or with no GPS fix at all. */
export const needsAudit = (v: Visit) => {
  const s = fenceState(v.geofence);
  return s === "away" || s === "manual" || s === "none";
};

// ── Pings ───────────────────────────────────────────────────────────────────

export function recordPing(p: { repId: string; fix: GeoFix; kind: LocationPing["kind"]; visitId?: string | null; customerId?: string | null }): LocationPing {
  const ping: LocationPing = {
    id: nextId("LP-", locationsStore.get().map((x) => x.id), 5),
    repId: p.repId,
    at: `${SF_TODAY} ${SF_NOW}`,
    lat: p.fix.lat,
    lng: p.fix.lng,
    accuracy: p.fix.accuracy,
    kind: p.kind,
    visitId: p.visitId ?? null,
    customerId: p.customerId ?? null,
  };
  locationsStore.set((l) => [...l, ping]);
  return ping;
}

/** Pings in time order (same minute → the order they were taken; ids only grow). */
const byTime = (a: LocationPing, b: LocationPing) => a.at.localeCompare(b.at) || a.id.localeCompare(b.id);

export function pingsOf(repId: string, date?: string): LocationPing[] {
  return locationsStore
    .get()
    .filter((p) => p.repId === repId && (!date || p.at.startsWith(date)))
    .sort(byTime);
}
export function lastPing(repId: string, date?: string): LocationPing | undefined {
  const l = pingsOf(repId, date);
  return l[l.length - 1];
}
export const pingsOfVisit = (visitId: string) =>
  locationsStore
    .get()
    .filter((p) => p.visitId === visitId)
    .sort(byTime);

export const PING_KIND: Record<LocationPing["kind"], string> = { "check-in": "Check-in", "check-out": "Check-out", update: "Update" };

// ── Where a point is ────────────────────────────────────────────────────────

export type Place = { customer: Customer | null; metres: number | null; at: boolean; scope: "visit" | "beat" | "any" | "none" };

function nearestOf(p: GeoPoint, list: Customer[]): { customer: Customer; metres: number } | null {
  let best: { customer: Customer; metres: number } | null = null;
  for (const c of list) {
    if (!c.location) continue;
    const m = distanceMetres(p, c.location);
    if (!best || m < best.metres) best = { customer: c, metres: m };
  }
  return best;
}

/**
 * Where a ping is, in shop terms: measured from the visit's shop when it was taken on a visit, otherwise from the
 * nearest shop on the rep's beat (`beatIds`), otherwise from the nearest shop with a saved location.
 */
export function placeOf(p: LocationPing, beatIds: string[] = []): Place {
  const customers = customersStore.get();
  const own = p.customerId ? customers.find((c) => c.id === p.customerId) : undefined;
  if (own?.location) {
    const metres = distanceMetres(p, own.location);
    return { customer: own, metres, at: withinFence(metres, p.accuracy), scope: "visit" };
  }
  const beat = nearestOf(p, customers.filter((c) => beatIds.includes(c.id)));
  if (beat) return { ...beat, at: withinFence(beat.metres, p.accuracy), scope: "beat" };
  const any = nearestOf(p, customers);
  if (any) return { ...any, at: withinFence(any.metres, p.accuracy), scope: "any" };
  return { customer: own ?? null, metres: null, at: false, scope: "none" };
}

/** "at Laxmi Store (35 m)", "2.4 km from Laxmi Store, the nearest on the route", "no shop location to compare". */
export function placeText(pl: Place): string {
  if (!pl.customer || pl.metres == null) return pl.customer ? `near ${pl.customer.name} (no shop location saved)` : "no shop location to compare";
  const d = fmtDistance(pl.metres);
  if (pl.at) return `at ${pl.customer.name} (${d})`;
  if (pl.scope === "beat") return `${d} from ${pl.customer.name}, the nearest on the route`;
  if (pl.scope === "any") return `${d} from ${pl.customer.name}, the nearest shop`;
  return `${d} from ${pl.customer.name}`;
}
