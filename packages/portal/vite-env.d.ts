/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_USE_MOCK_AUTH: string
  readonly VITE_USE_MOCK_API: string
  readonly VITE_API_BASE_URL: string
  readonly VITE_OKTA_CLIENT_ID: string
  readonly VITE_OKTA_ISSUER: string
  readonly VITE_MANIFEST_URL: string
  readonly VITE_APP_NAME: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

