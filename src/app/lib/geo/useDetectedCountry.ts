import { useEffect, useState } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// Detect the visitor's country once and cache it for the session.
// Uses https://api.country.is/ — free, no API key, returns { ip, country } where
// `country` is an ISO-3166 alpha-2 code (e.g. "NP"). Falls back silently to null
// if the request fails, times out or is blocked. Shared by the partner directory
// (filters by country) and the public forms (fills the contact-us `country`).
// ─────────────────────────────────────────────────────────────────────────────
export function useDetectedCountry(): string | null {
  const [country, setCountry] = useState<string | null>(() => {
    try {
      return sessionStorage.getItem("bz_detected_country");
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (country) return;
    let cancelled = false;

    (async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);
        const res = await fetch("https://api.country.is/", {
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        if (!res.ok) return;
        const data: { country?: string } = await res.json();
        if (cancelled || !data?.country) return;
        setCountry(data.country);
        try {
          sessionStorage.setItem("bz_detected_country", data.country);
        } catch {
          /* sessionStorage unavailable — acceptable */
        }
      } catch {
        /* network failure / timeout / blocked — silent fallback */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [country]);

  return country;
}

// Expands an ISO-3166 alpha-2 code to a readable country name ("NP" → "Nepal") so
// the value stored on the enquiry is legible in the admin, not a bare code. Falls
// back to the raw code where Intl.DisplayNames is unavailable or the code is unknown.
export function countryNameFromCode(code: string | null | undefined): string | null {
  if (!code) return null;
  try {
    const dn = new Intl.DisplayNames(["en"], { type: "region" });
    return dn.of(code.toUpperCase()) ?? code;
  } catch {
    return code;
  }
}

// Convenience: the visitor's detected country as a readable name (or null).
export function useDetectedCountryName(): string | null {
  return countryNameFromCode(useDetectedCountry());
}
