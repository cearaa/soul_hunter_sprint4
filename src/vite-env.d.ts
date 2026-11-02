/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL base da API Java (ex.: https://soulhunter-rm571411.onrender.com/soulhunter) */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
