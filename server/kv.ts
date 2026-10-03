// The part of a Cloudflare KV namespace the server uses.
interface KV {
  get: (key: string) => Promise<string | null>
  put: (key: string, value: string) => Promise<void>
  delete: (key: string) => Promise<void>
}

export interface Env {
  WOORDLE: KV
}
