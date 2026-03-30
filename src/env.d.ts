/// <reference path="../.astro/types.d.ts" />

interface ImportMetaEnv {
  readonly PUBLIC_BUTTONDOWN_ACTION_URL?: string;
  readonly PUBLIC_SUBSCRIBE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}