// The server behind /api/woordle, run against a stand-in for the KV storage.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import type { KV } from "../server/kv.ts"
import { onRequest } from "../server/woordle.ts"
import { csv } from "./helpers.ts"

const TWO = csv(
  "1592,2025-10-28,Anna,3,2025-10-28T08:00,",
  "1592,2025-10-28,Bram,4,2025-10-28T09:00,"
)
const ONE = csv("1592,2025-10-28,Anna,3,2025-10-28T08:00,")

interface Options {
  body?: string
  title?: string
  key?: string
  aliases?: Record<string, string>
}
/** What the server answers in JSON: an error, or what a start or a removal did. */
interface Answer {
  error?: string
  code?: string
  key?: string
  removed?: string
}

let kv: KV & { data: Map<string, string> }
/** One request to /api/woordle/<code>, answered with its status, body and the headers that matter. */
async function call(
  method: string,
  code: string | undefined,
  { body, title, key, aliases }: Options = {}
): Promise<{
  status: number
  text: string
  json: Answer | null
  title: string
  added: string | null
  aliases: Record<string, string> | null
}> {
  const headers: Record<string, string> = {}
  if (title) {
    headers["x-title"] = encodeURIComponent(title)
  }
  if (key) {
    headers["x-key"] = key
  }
  if (aliases) {
    headers["x-aliases"] = encodeURIComponent(JSON.stringify(aliases))
  }
  const request = new Request(`https://example.test/api/woordle/${code ?? ""}`, {
    method,
    headers,
    body: body ?? null,
  })
  const response = await onRequest({
    request,
    env: { WOORDLE: kv },
    params: code ? { path: code.split("/") } : {},
  })
  const text = await response.text()
  return {
    status: response.status,
    text,
    json: response.headers.get("content-type")?.includes("json")
      ? (JSON.parse(text) as Answer)
      : null,
    title: decodeURIComponent(response.headers.get("x-title") ?? ""),
    added: response.headers.get("x-added"),
    aliases: JSON.parse(decodeURIComponent(response.headers.get("x-aliases") ?? "null")) as Record<
      string,
      string
    > | null,
  }
}
const start = async (code = "familie-test", options: Options = {}): Promise<Answer | null> =>
  (await call("POST", code, { body: TWO, ...options })).json

beforeEach(() => {
  vi.useFakeTimers({ now: new Date("2026-10-04T12:00:00Z") })
  const data = new Map<string, string>()
  kv = {
    data,
    get: name => Promise.resolve(data.get(name) ?? null),
    put: (name, value) => {
      data.set(name, value)
      return Promise.resolve()
    },
    delete: name => {
      data.delete(name)
      return Promise.resolve()
    },
  }
})
afterEach(() => {
  vi.useRealTimers()
})

describe("a code", () => {
  it("is free until a scoreboard is started under it", async () => {
    expect(await call("GET", "familie-test")).toMatchObject({
      status: 404,
      json: { error: "dit scorebord bestaat niet" },
    })
  })

  it.each(["ab", "Hoofdletters", "met spatie", "-begint-met-streep", "a".repeat(33), "een/twee"])(
    'cannot be "%s"',
    async code => {
      expect((await call("GET", code)).status).toBe(400)
      expect((await call("POST", code, { body: TWO })).status).toBe(400)
    }
  )

  it("is needed: there is nothing at /api/woordle itself", async () => {
    expect((await call("POST", undefined, { body: TWO })).status).toBe(400)
  })
})

describe("starting a scoreboard", () => {
  it("takes the code, keeps the scores and the name, and hands out a key", async () => {
    const made = await call("POST", "familie-test", { body: TWO, title: "Familie 🤓" })
    expect(made.status).toBe(201)
    expect(made.json).toEqual({
      code: "familie-test",
      key: expect.stringMatching(/^[a-z2-9]{16}$/),
    })
    expect(await call("GET", "familie-test")).toMatchObject({
      status: 200,
      text: TWO,
      title: "Familie 🤓",
      aliases: {},
    })
  })

  it("needs at least two scores, and leaves the code free otherwise", async () => {
    expect(await call("POST", "familie-test", { body: ONE })).toMatchObject({
      status: 400,
      json: { error: expect.stringContaining("minstens 2 scores") },
    })
    expect((await call("GET", "familie-test")).status).toBe(404)
    expect(kv.data.size).toBe(0)
  })

  it("does not keep the key itself", async () => {
    const key = (await start())?.key ?? ""
    expect([...kv.data.values()].join("\n")).not.toContain(key)
  })

  it("strips markup from the name and falls back to a default", async () => {
    await start("met-opmaak", { title: ' <b>Groep</b> "x" ' })
    await start("zonder-naam")
    expect((await call("GET", "met-opmaak")).title).toBe("bGroep/b x")
    expect((await call("GET", "zonder-naam")).title).toBe("Woordscore")
  })

  it("stops after the daily limit of new scoreboards", async () => {
    kv.data.set("made:2026-10-04", "200")
    expect((await call("POST", "familie-test", { body: TWO })).status).toBe(429)
  })
})

describe("adding scores", () => {
  beforeEach(() => start())

  it("adds what is new and says how many", async () => {
    const more = csv(
      "1592,2025-10-28,Anna,3,2025-10-28T08:00,",
      "1593,2025-10-29,Anna,4,2025-10-29T08:00,"
    )
    const answer = await call("POST", "familie-test", { body: more })
    expect(answer).toMatchObject({ status: 200, added: "1" })
    expect(answer.text).toBe(
      csv(
        "1592,2025-10-28,Anna,3,2025-10-28T08:00,",
        "1592,2025-10-28,Bram,4,2025-10-28T09:00,",
        "1593,2025-10-29,Anna,4,2025-10-29T08:00,"
      )
    )
    expect(kv.data.get("prev:familie-test")).toBe(TWO)
  })

  it("never changes a stored score, the name or the key", async () => {
    const answer = await call("POST", "familie-test", {
      body: csv("1592,2025-10-28,Anna,1,2025-10-28T07:00,GGGGG"),
      title: "Gekaapt",
    })
    expect(answer).toMatchObject({ status: 200, added: "0", text: TWO, title: "Woordscore" })
    expect(kv.data.has("prev:familie-test")).toBe(false)
  })

  it.each([
    ["a puzzle that has not been yet", csv("2500,2028-04-23,Anna,3,,"), "nog niet geweest"],
    [
      "a score shared long after its puzzle",
      csv("1593,2025-10-29,Anna,3,2026-09-01T10:00,"),
      "niet rond de dag van de puzzel",
    ],
    [
      "a score shared before its puzzle",
      csv("1593,2025-10-29,Anna,3,2025-10-28T10:00,"),
      "niet rond de dag van de puzzel",
    ],
    ["a date that does not fit the puzzle", csv("1593,2025-10-30,Anna,3,,"), "valt op 2025-10-29"],
    ["a name with markup", csv("1593,2025-10-29,<script>,3,,"), "bij player"],
    ["something that is not scores", "hallo", "verwacht de kolommen"],
    ["nothing", csv(), "geen scores"],
  ])("refuses %s and stores nothing", async (_, body, message) => {
    expect(await call("POST", "familie-test", { body })).toMatchObject({
      status: 400,
      json: { error: expect.stringContaining(message) },
    })
    expect(kv.data.get("scores:familie-test")).toBe(TWO)
  })

  it("refuses more players than a scoreboard may have", async () => {
    const crowd = csv(
      ...Array.from(
        { length: 30 },
        (_, i) =>
          `1593,2025-10-29,Speler${String.fromCharCode(97 + (i % 26))}${i < 26 ? "" : "x"},3,,`
      )
    )
    expect(await call("POST", "familie-test", { body: crowd })).toMatchObject({
      status: 400,
      json: { error: "te veel verschillende spelers" },
    })
  })

  it("refuses an upload that is too large", async () => {
    expect((await call("POST", "familie-test", { body: "x".repeat(1_000_001) })).status).toBe(413)
  })

  it("keeps scoreboards apart", async () => {
    await start("andere-groep")
    await call("POST", "andere-groep", { body: csv("1593,2025-10-29,Carla,2,,") })
    expect((await call("GET", "familie-test")).text).toBe(TWO)
  })
})

describe("linked names", () => {
  beforeEach(() => start())
  const asPapa = csv(
    "1592,2025-10-28,Papa,4,2025-10-28T09:00,",
    "1593,2025-10-29,Papa,5,2025-10-29T09:00,"
  )

  it("store scores under the player a name is linked to, and keep the link", async () => {
    const answer = await call("POST", "familie-test", { body: asPapa, aliases: { Papa: "Bram" } })
    expect(answer).toMatchObject({ status: 200, added: "1", aliases: { Papa: "Bram" } }) // 1592 was Bram's already
    expect(answer.text).toContain("1593,2025-10-29,Bram,5,")
    expect(answer.text).not.toContain("Papa")
    expect((await call("GET", "familie-test")).aliases).toEqual({ Papa: "Bram" })
  })

  it("apply a stored link to later uploads without being asked again", async () => {
    await call("POST", "familie-test", {
      body: csv("1592,2025-10-28,Anna,3,,"),
      aliases: { Papa: "Bram" },
    })
    const later = await call("POST", "familie-test", {
      body: csv("1594,2025-10-30,Papa,2,2025-10-30T09:00,"),
    })
    expect(later.text).toContain("1594,2025-10-30,Bram,2,")
  })

  it("take several names in one upload, also several for one player", async () => {
    const body = csv(
      "1593,2025-10-29,Papa,5,,",
      "1594,2025-10-30,Pa,4,,",
      "1593,2025-10-29,Mama,3,,"
    )
    const answer = await call("POST", "familie-test", {
      body,
      aliases: { Papa: "Bram", Pa: "Bram", Mama: "Anna" },
    })
    expect(answer.aliases).toEqual({ Papa: "Bram", Pa: "Bram", Mama: "Anna" })
    expect(answer.text.split("\n").slice(3, 6)).toEqual([
      "1593,2025-10-29,Bram,5,,",
      "1594,2025-10-30,Bram,4,,",
      "1593,2025-10-29,Anna,3,,",
    ])
  })

  it("cannot be changed once made", async () => {
    await call("POST", "familie-test", {
      body: csv("1592,2025-10-28,Anna,3,,"),
      aliases: { Papa: "Bram" },
    })
    const again = await call("POST", "familie-test", {
      body: csv("1592,2025-10-28,Anna,3,,"),
      aliases: { Papa: "Anna" },
    })
    expect(again.aliases).toEqual({ Papa: "Bram" })
  })

  it.each([
    ["to someone who is not a player", { Papa: "Carla" }, "Carla is geen speler"],
    ["from a name that is a player already", { Anna: "Bram" }, "Anna is al een speler"],
    ["with a name that is not a name", { "<b>": "Bram" }, "alleen uit letters"],
  ])("refuses a link %s", async (_, aliases, message) => {
    expect(await call("POST", "familie-test", { body: asPapa, aliases })).toMatchObject({
      status: 400,
      json: { error: expect.stringContaining(message) },
    })
    expect(await call("GET", "familie-test")).toMatchObject({ text: TWO, aliases: {} })
  })
})

describe("removing a scoreboard", () => {
  it("needs the key, and then frees the code", async () => {
    const key = (await start())?.key ?? ""
    await call("POST", "familie-test", { body: csv("1593,2025-10-29,Anna,4,,") }) // so that there is a previous version too
    expect((await call("DELETE", "familie-test")).status).toBe(403)
    expect((await call("DELETE", "familie-test", { key: "verkeerd" })).status).toBe(403)
    expect((await call("GET", "familie-test")).status).toBe(200)

    expect(await call("DELETE", "familie-test", { key })).toMatchObject({
      status: 200,
      json: { removed: "familie-test" },
    })
    expect((await call("GET", "familie-test")).status).toBe(404)
    expect([...kv.data.keys()].filter(name => name.includes("familie-test"))).toEqual([])
  })
})
