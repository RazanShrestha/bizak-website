// ─────────────────────────────────────────────────────────────────────────────
// API origin for public (anonymous) form submissions.
//
// This static marketing site posts to the same Bizak backend the ERP app uses.
// The exact origin is AMBIGUOUS in this repo and MUST be confirmed before a
// production build:
//   • package.json  homepage   → https://bizakerp.com
//   • app CTAs                  → https://system.bizakerp.com
//   • backend CORS allow-list   → *.bizakerp.com.np   (backend Startup.cs)
// The production website origin is very likely NOT in the backend CORS allow-list
// yet, so a browser POST would be blocked until the backend adds it. See README.
//
// Override with VITE_API_BASE_URL — a BUILD-TIME env var Vite bakes into the
// bundle (changing it needs a rebuild + redeploy). For local dev, point it at a
// local backend, e.g. https://localhost:5001 (localhost is already CORS-allowed).
// ─────────────────────────────────────────────────────────────────────────────
const DEFAULT_API_BASE_URL = "https://system.bizakerp.com";

export const API_BASE_URL: string =
  import.meta.env.VITE_API_BASE_URL?.trim().replace(/\/+$/, "") || DEFAULT_API_BASE_URL;
