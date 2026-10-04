// Cloudflare Pages Function behind /api/woordle: the scoreboards people made.
//
//   GET     /api/woordle/<code>   the scores of that scoreboard, in the standard format
//   POST    /api/woordle/<code>   scores in the standard format. If the scoreboard exists, the
//                                 ones not stored yet are added. If it does not, this starts it
//                                 and answers { code, key }; that takes at least two scores.
//   DELETE  /api/woordle/<code>   removes it; needs the key that was handed out when it was started
//
// People pick the code themselves, and it is the only lock on a scoreboard: whoever knows it
// can look and can add. A code is only taken once a scoreboard has been started under it.
// So the server only ever adds. A stored score is never changed or removed, and what comes in
// has to be a plausible score. The chat itself never arrives here; the page reads the export
// on the visitor's device and sends the scores alone.
//
// A name in WhatsApp can change, or differ from one phone to the next. A scoreboard therefore
// keeps links from such a name to the player it belongs to (`x-aliases`, as JSON). Scores that
// come in under a linked name are stored under the player. Links are only ever added too.
//
// Storage is the KV namespace bound as WOORDLE. Per scoreboard: `group:<code>` holds its title,
// the day it was made, the hash of its key and the linked names; `scores:<code>` the current scores;
// `prev:<code>` the scores before the last change.
import type { Score } from "../src/lib/scores.ts"
import { dayOf, isPlayerName, merge, parseCsv, toCsv, toDay } from "../src/lib/scores.ts"
import type { KV, PagesContext } from "./kv.ts"

const MAX_BYTES = 1_000_000
const MAX_PLAYERS = 30
const MAX_ALIASES = 60
const MAX_DAYS_LATE = 7
const MAX_NEW_PER_DAY = 200 // scoreboards started per day, all visitors together
const MIN_TO_START = 2 // scores an export must hold before its code is taken
const DEFAULT_TITLE = "Woordscore"
const ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789" // for keys; no i, l, o, 0 or 1: they are easy to mix up
const CODE = /^[a-z0-9][a-z0-9-]{4,30}[a-z0-9]$/ // 6 to 32 characters
const DAY = 86_400_000
// eslint-disable-next-line no-control-regex -- control characters are what a title may not hold
const UNSAFE_IN_TITLE = /[\u0000-\u001f<>&"']/g

/** What is kept about a scoreboard besides its scores. */
interface Group {
  title: string
  made: string
  key: string
  aliases?: Record<string, string>
}

class Refusal extends Error {
  status: number
  constructor(message: string, status = 400) {
    super(message)
    this.status = status
  }
}

const json = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  })
const csv = (body: string, title: string, headers: Record<string, string> = {}): Response =>
  new Response(body, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "cache-control": "no-store",
      "x-title": encodeURIComponent(title),
      ...headers,
    },
  })
const messageOf = (error: unknown): string =>
  error instanceof Error ? error.message : String(error)

const random = (length: number): string =>
  Array.from(
    crypto.getRandomValues(new Uint8Array(length)),
    byte => ALPHABET[byte % ALPHABET.length] ?? ""
  ).join("")
async function hash(text: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text))
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, "0")).join("")
}

function cleanTitle(header: string | null): string {
  let title = ""
  try {
    title = decodeURIComponent(header ?? "")
  } catch {
    // not a valid title: use the default
  }
  return title.replace(UNSAFE_IN_TITLE, "").trim().slice(0, 60) || DEFAULT_TITLE
}

/** The scores in a request, or a Refusal that says what is wrong with them. */
async function incoming(request: Request): Promise<Score[]> {
  const body = await request.text()
  if (body.length > MAX_BYTES) {
    throw new Refusal("te veel scores in één keer", 413)
  }
  let rows: Score[]
  try {
    rows = parseCsv(body, "upload")
  } catch (error) {
    throw new Refusal(messageOf(error))
  }
  if (!rows.length) {
    throw new Refusal("er zitten geen scores in")
  }
  const today = Math.floor(Date.now() / DAY)
  for (const row of rows) {
    const late = row.shared ? toDay(row.shared) - dayOf(row.puzzle) : 0
    if (dayOf(row.puzzle) > today + 1) {
      throw new Refusal(`puzzel ${row.puzzle} is nog niet geweest`)
    }
    if (late < 0 || late > MAX_DAYS_LATE) {
      throw new Refusal(
        `puzzel ${row.puzzle} van ${row.player} is niet rond de dag van de puzzel gedeeld`
      )
    }
  }
  return rows
}
function checkPlayers(rows: Score[]): void {
  if (new Set(rows.map(row => row.player)).size > MAX_PLAYERS) {
    throw new Refusal("te veel verschillende spelers")
  }
}

async function start(request: Request, kv: KV, code: string): Promise<Response> {
  const rows = await incoming(request)
  checkPlayers(rows)
  if (rows.length < MIN_TO_START) {
    throw new Refusal(`er zijn minstens ${MIN_TO_START} scores nodig om een scorebord te beginnen`)
  }

  const counter = `made:${new Date().toISOString().slice(0, 10)}`
  const made = Number((await kv.get(counter)) ?? 0)
  if (made >= MAX_NEW_PER_DAY) {
    throw new Refusal(
      "vandaag zijn er al te veel scoreborden begonnen; probeer het morgen opnieuw",
      429
    )
  }
  await kv.put(counter, String(made + 1), { expirationTtl: 2 * 86_400 })

  const key = random(16)
  const group: Group = {
    title: cleanTitle(request.headers.get("x-title")),
    made: new Date().toISOString().slice(0, 10),
    key: await hash(key),
  }
  await kv.put(`scores:${code}`, toCsv(rows))
  await kv.put(`group:${code}`, JSON.stringify(group))
  return json({ code, key }, 201)
}

const aliasHeader = (aliases: Record<string, string> | undefined): Record<string, string> => ({
  "x-aliases": encodeURIComponent(JSON.stringify(aliases ?? {})),
})

/** The stored links plus the new ones in the request. A name links to one player, and the first link stands. */
function linkNames(request: Request, group: Group, players: Set<string>): Record<string, string> {
  let fresh: unknown
  try {
    fresh = JSON.parse(decodeURIComponent(request.headers.get("x-aliases") ?? "%7B%7D"))
  } catch {
    throw new Refusal("de gekoppelde namen zijn niet leesbaar")
  }
  const aliases = { ...group.aliases }
  for (const [alias, player] of Object.entries(fresh ?? {})) {
    if (!isPlayerName(alias) || typeof player !== "string" || !isPlayerName(player)) {
      throw new Refusal("een gekoppelde naam bestaat alleen uit letters")
    }
    if (!players.has(player)) {
      throw new Refusal(`${player} is geen speler op dit scorebord`)
    }
    if (players.has(alias)) {
      throw new Refusal(`${alias} is al een speler op dit scorebord`)
    }
    aliases[alias] ??= player
  }
  if (Object.keys(aliases).length > MAX_ALIASES) {
    throw new Refusal("te veel gekoppelde namen")
  }
  return aliases
}

async function add(request: Request, kv: KV, code: string, group: Group): Promise<Response> {
  const stored = (await kv.get(`scores:${code}`)) ?? ""
  const before = parseCsv(stored, "opslag")
  const aliases = linkNames(request, group, new Set(before.map(row => row.player)))
  const underPlayer = (await incoming(request)).map(row => {
    const player = aliases[row.player]
    return player ? { ...row, player } : row
  })
  const { rows, added } = merge(before, underPlayer)
  checkPlayers(rows)
  if (added) {
    if (stored) {
      await kv.put(`prev:${code}`, stored)
    }
    await kv.put(`scores:${code}`, toCsv(rows))
  }
  if (Object.keys(aliases).length !== Object.keys(group.aliases ?? {}).length) {
    await kv.put(`group:${code}`, JSON.stringify({ ...group, aliases }))
  }
  return csv(toCsv(rows), group.title, { "x-added": String(added), ...aliasHeader(aliases) })
}

async function remove(request: Request, kv: KV, code: string, group: Group): Promise<Response> {
  if ((await hash(request.headers.get("x-key") ?? "")) !== group.key) {
    throw new Refusal("deze beheercode klopt niet", 403)
  }
  await Promise.all(
    [`group:${code}`, `scores:${code}`, `prev:${code}`].map(name => kv.delete(name))
  )
  return json({ removed: code })
}

const readGroup = (text: string | null): Group | null =>
  text === null ? null : (JSON.parse(text) as Group | null)

export async function onRequest({ request, env, params }: PagesContext): Promise<Response> {
  const kv = env.WOORDLE
  const [code, ...rest] = [params.path ?? []].flat()
  try {
    if (!code || rest.length || !CODE.test(code)) {
      throw new Refusal("dit kan geen code van een scorebord zijn", 400)
    }
    const group = readGroup(await kv.get(`group:${code}`))
    if (request.method === "POST") {
      return group ? await add(request, kv, code, group) : await start(request, kv, code)
    }
    if (!group) {
      throw new Refusal("dit scorebord bestaat niet", 404)
    }
    if (request.method === "GET") {
      return csv((await kv.get(`scores:${code}`)) ?? "", group.title, aliasHeader(group.aliases))
    }
    if (request.method === "DELETE") {
      return await remove(request, kv, code, group)
    }
    throw new Refusal("dat kan hier niet", 405)
  } catch (error) {
    if (error instanceof Refusal) {
      return json({ error: error.message }, error.status)
    }
    throw error
  }
}
