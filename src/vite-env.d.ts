/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * Origin of the Bizak backend API that receives public form submissions
   * (contact / partner / careers → /api/contact-us/save). Baked into the static
   * bundle at build time. See .env.example and src/app/lib/api/config.ts.
   */
  readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
