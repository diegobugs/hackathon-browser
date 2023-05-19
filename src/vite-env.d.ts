/// <reference types="vite/client" />

interface ImportMetaEnv {
  VITE_APP_OPENAI_API: string
  VITE_APP_OPENAI_ORG: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
