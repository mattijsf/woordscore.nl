// The server that keeps the shared scores, at config.api.
import type { Score } from "./scores.ts"
import { parseCsv, toCsv } from "./scores.ts"

/** Why the server refused, as it says itself in its answer. */
async function refusal(response: Response): Promise<string> {
  const body: unknown = await response.json().catch(() => ({}))
  const error = typeof body === "object" && body !== null && "error" in body ? body.error : null
  return typeof error === "string" ? error : `de server antwoordt ${response.status}`
}

export async function fetchScores(api: string): Promise<Score[]> {
  const response = await fetch(api, { cache: "no-store" })
  if (!response.ok) {
    throw new Error(`de server antwoordt ${response.status}`)
  }
  return parseCsv(await response.text(), "server")
}

/** Sends scores to be kept; the answer is everything the server keeps now. */
export async function postScores(api: string, rows: Score[]): Promise<Score[]> {
  const response = await fetch(api, {
    method: "POST",
    headers: { "content-type": "text/csv" },
    body: toCsv(rows),
  })
  if (!response.ok) {
    throw new Error(await refusal(response))
  }
  return parseCsv(await response.text(), "server")
}
