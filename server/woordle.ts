// Cloudflare Pages Function behind /api/woordle on mattix.nl: the shared scores.
//
//   GET   the scores, in the standard format
//   POST  scores in the standard format; the ones not stored yet are added
//
// Anyone may post, so the server only ever adds: a stored score is never changed or removed,
// and what comes in has to be a plausible score. The chat itself never arrives here; the page
// reads the export on the visitor's device and sends the scores alone.
//
// Storage is the KV namespace bound as WOORDLE: `scores` holds the current file, `scores:prev`
// the one before the last change.
import type { Score } from "../src/lib/scores.ts"
import { dayOf, merge, parseCsv, toCsv, toDay } from "../src/lib/scores.ts"
import type { Env } from "./kv.ts"

const MAX_BYTES = 1_000_000
const MAX_PLAYERS = 12
const MAX_DAYS_LATE = 7
const DAY = 86_400_000

const csv = (body: string, headers: Record<string, string> = {}): Response =>
  new Response(body, {
    headers: { "content-type": "text/csv; charset=utf-8", "cache-control": "no-store", ...headers },
  })
const refuse = (error: string, status = 400): Response =>
  new Response(JSON.stringify({ error }), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  })
const messageOf = (error: unknown): string =>
  error instanceof Error ? error.message : String(error)

export async function onRequestGet({ env }: { env: Env }): Promise<Response> {
  return csv((await env.WOORDLE.get("scores")) ?? "")
}

export async function onRequestPost({
  request,
  env,
}: {
  request: Request
  env: Env
}): Promise<Response> {
  const body = await request.text()
  if (body.length > MAX_BYTES) {
    return refuse("te veel scores in één keer", 413)
  }

  let incoming: Score[]
  try {
    incoming = parseCsv(body, "upload")
  } catch (error) {
    return refuse(messageOf(error))
  }
  const today = Math.floor(Date.now() / DAY)
  for (const row of incoming) {
    const late = row.shared ? toDay(row.shared) - dayOf(row.puzzle) : 0
    if (dayOf(row.puzzle) > today + 1) {
      return refuse(`puzzel ${row.puzzle} is nog niet geweest`)
    }
    if (late < 0 || late > MAX_DAYS_LATE) {
      return refuse(
        `puzzel ${row.puzzle} van ${row.player} is niet rond de dag van de puzzel gedeeld`
      )
    }
  }

  const stored = (await env.WOORDLE.get("scores")) ?? ""
  const { rows, added } = merge(parseCsv(stored, "opslag"), incoming)
  if (new Set(rows.map(row => row.player)).size > MAX_PLAYERS) {
    return refuse("te veel verschillende spelers")
  }
  if (added) {
    if (stored) {
      await env.WOORDLE.put("scores:prev", stored)
    }
    await env.WOORDLE.put("scores", toCsv(rows))
  }
  return csv(toCsv(rows), { "x-added": String(added) })
}
