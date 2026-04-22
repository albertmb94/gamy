/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Frontend env variables can be declared here if needed.
  // Turso credentials should stay on the backend/server side.
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
