/// <reference types="vite/client" />

interface ImportMetaEnv {
  VITE_APP_OPENAI_API: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
