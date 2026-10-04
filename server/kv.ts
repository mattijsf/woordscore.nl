// The parts of Cloudflare's Pages Functions and KV that the server uses.
export interface KV {
  get: (key: string) => Promise<string | null>
  put: (key: string, value: string, options?: { expirationTtl?: number }) => Promise<void>
  delete: (key: string) => Promise<void>
}

interface Env {
  WOORDLE: KV
}

/** What a Pages Function is called with. `params.path` holds the parts of a [[path]] route. */
export interface PagesContext {
  request: Request
  env: Env
  params: { path?: string | string[] }
}
