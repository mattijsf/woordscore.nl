// The server that keeps the scoreboards, at config.api/<code>.
import config from "../../data/config.json"
import type { Score } from "./scores.ts"
import { parseCsv, toCsv } from "./scores.ts"

export type Aliases = Record<string, string>

export interface Board {
  title: string
  aliases: Aliases
  rows: Score[]
}

const address = (code: string): string => `${config.api}/${code}`

/** Why the server refused, as it says itself in its answer. */
async function refusal(response: Response): Promise<string> {
  const body: unknown = await response.json().catch(() => ({}))
  const error = typeof body === "object" && body !== null && "error" in body ? body.error : null
  return typeof error === "string" ? error : `de server antwoordt ${response.status}`
}
async function refused(response: Response): Promise<never> {
  throw new Error(await refusal(response))
}

const readAliases = (response: Response): Aliases => {
  try {
    return JSON.parse(decodeURIComponent(response.headers.get("x-aliases") ?? "%7B%7D")) as Aliases
  } catch {
    return {}
  }
}

/** The scoreboard under a code, or null when the code is still free. */
export async function getBoard(code: string): Promise<Board | null> {
  const response = await fetch(address(code), { cache: "no-store" })
  if (response.status === 404) {
    return null
  }
  if (!response.ok) {
    return refused(response)
  }
  return {
    title: decodeURIComponent(response.headers.get("x-title") ?? ""),
    aliases: JSON.parse(
      decodeURIComponent(response.headers.get("x-aliases") ?? "%7B%7D")
    ) as Aliases,
    rows: parseCsv(await response.text(), "server"),
  }
}

/**
 * Starts a scoreboard under a free code. Answers the key to remove it with, or "" when someone
 * started it a moment ago and these scores were added to theirs.
 */
export async function startBoard(code: string, rows: Score[], title: string): Promise<string> {
  const response = await fetch(address(code), {
    method: "POST",
    headers: { "content-type": "text/csv", "x-title": encodeURIComponent(title) },
    body: toCsv(rows),
  })
  if (!response.ok) {
    return refused(response)
  }
  // 201: the code is now ours. 200: someone started it a moment ago, and our scores were added.
  if (response.status !== 201) {
    return ""
  }
  const { key } = (await response.json()) as { key: string }
  return key
}

/** Adds scores, and links names to players; answers everything the server keeps now. */
export async function addScores(
  code: string,
  rows: Score[],
  links: Aliases
): Promise<{ rows: Score[]; aliases: Aliases }> {
  const response = await fetch(address(code), {
    method: "POST",
    headers: { "content-type": "text/csv", "x-aliases": encodeURIComponent(JSON.stringify(links)) },
    body: toCsv(rows),
  })
  if (!response.ok) {
    return refused(response)
  }
  return { aliases: readAliases(response), rows: parseCsv(await response.text(), "server") }
}

export async function removeBoard(code: string, key: string): Promise<void> {
  const response = await fetch(address(code), { method: "DELETE", headers: { "x-key": key } })
  if (!response.ok) {
    await refused(response)
  }
}
