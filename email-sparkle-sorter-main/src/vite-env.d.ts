/// <reference types="vite/client" />

// Expose environment variables to TypeScript
interface ImportMetaEnv {
  readonly VITE_GOOGLE_CLIENT_ID: string;
  readonly VITE_GOOGLE_CLIENT_SECRET: string;
  readonly VITE_REDIRECT_URI?: string;
  readonly VITE_DEEPSEEK_API_KEY: string;
  // add more VITE_ env vars here as needed
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
