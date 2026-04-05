interface ImportMetaEnv {
  readonly VITE_VISIONS_URL: string;
  readonly VITE_VISIONS_SOCKETIO_URL: string;
}

declare global {
  interface ImportMeta {
    // readonly dirname: string;
    // readonly filename: string;
    readonly env: ImportMetaEnv;
  }
}
