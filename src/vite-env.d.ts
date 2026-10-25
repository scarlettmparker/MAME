/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DISCORD_REDIRECT_URI: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

export declare global {
  interface Window {
    hydratePageDataFromPostlude?: (initialData: Record<string, Record<string, unknown>>) => void;
    __serverCacheData__?: Record<string, Record<string, unknown>>;
    __locale__?: string;
    /**
     * Current loaded translations.
     */
    __translations__?: Record<string, unknown>;
    /**
     * Posthog Key.
     */
    __posthog_key__?: string;
    /**
     * Posthog Host.
     */
    __posthog_host__?: string;
    /**
     * Trusted Types factory when the browser supports it.
     */
    trustedTypes?: {
      createPolicy(
        name: string,
        rules: {
          createHTML?: (html: string) => string;
          createScriptURL?: (url: string) => string;
        },
      ): {
        createHTML: (html: string) => string;
        createScriptURL: (url: string) => string;
      };
    };
  }
}
