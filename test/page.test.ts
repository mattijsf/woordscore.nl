// The function in front of the page: what a shared link shows.
import { describe, expect, it } from "vitest"
import type { KV } from "../server/kv.ts"
import { KEEP_OUT, onRequest } from "../server/page.ts"

const PAGE = `<!doctype html><html><head><title>Woordscore</title>
<meta name="robots" content="noindex, nofollow, noarchive, noai, noimageai">
<meta property="og:title" content="Woordscore">
<meta property="og:description" content="Het scorebord bij jullie Woordle-groep.">
<meta property="og:url" content="https://woordscore.nl/">
<meta property="og:image" content="https://woordscore.nl/og.png">
</head><body>pagina</body></html>`

const GROUPS: Record<string, string> = {
  "group:familie-test": JSON.stringify({ title: 'Familie "Jansen" <3' }),
}
const kv: KV = {
  get: name => Promise.resolve(GROUPS[name] ?? null),
  put: () => Promise.resolve(),
  delete: () => Promise.resolve(),
}
const page = (): Response =>
  new Response(PAGE, { headers: { "content-type": "text/html; charset=utf-8", etag: '"abc"' } })
const visit = (
  path: string,
  {
    method = "GET",
    next = page,
    host = "example.test",
  }: { method?: string; next?: () => Response; host?: string } = {}
): Promise<Response> =>
  onRequest({
    request: new Request(`https://${host}${path}`, { method }),
    env: { WOORDLE: kv },
    next: () => Promise.resolve(next()),
  })
const meta = (html: string, property: string): string | undefined =>
  new RegExp(`<meta property="${property}" content="([^"]*)"`).exec(html)?.[1]

describe("the preview of a link", () => {
  it("names the scoreboard at that address", async () => {
    const html = await (await visit("/familie-test")).text()
    expect(meta(html, "og:title")).toBe("Familie &#34;Jansen&#34; &#60;3 | Woordscore")
    expect(meta(html, "og:description")).toContain("De stand van Familie")
    expect(html).toContain("<title>Familie &#34;Jansen&#34; &#60;3 | Woordscore</title>")
  })

  it("points at the address it was asked for, with the picture on the same site", async () => {
    const html = await (await visit("/familie-test")).text()
    expect(meta(html, "og:url")).toBe("https://example.test/familie-test")
    expect(meta(html, "og:image")).toBe("https://example.test/og.png")
  })

  it("finds the scoreboard however the code was capitalised", async () => {
    expect(meta(await (await visit("/Familie-Test/")).text(), "og:title")).toContain("Familie")
  })

  it.each(["/", "/bestaat-niet", "/ab", "/familie-test/meer"])(
    "stays general at %s",
    async path => {
      const html = await (await visit(path)).text()
      expect(meta(html, "og:title")).toBe("Woordscore")
      expect(html).toContain("<title>Woordscore</title>")
      expect(html).toContain("<body>pagina</body>")
    }
  )

  it("drops the headers that belonged to the page as it was built", async () => {
    const response = await visit("/familie-test")
    expect(response.headers.get("etag")).toBeNull()
    expect(response.headers.get("content-type")).toContain("text/html")
  })

  it("leaves everything that is not a page alone", async () => {
    const picture = (): Response =>
      new Response("png", { headers: { "content-type": "image/png" } })
    expect(await (await visit("/og.png", { next: picture })).text()).toBe("png")
    expect(await (await visit("/familie-test", { method: "HEAD" })).text()).toBe(PAGE)
  })
})

describe("the start page built into the page", () => {
  const BUILT = `<html><head></head><body data-mode="start"><div id="root"><main><div>Scorebord openen</div></main></div>
</body></html>`
  const built = (): Response =>
    new Response(BUILT, { headers: { "content-type": "text/html; charset=utf-8" } })

  it("stays at /", async () => {
    expect(await (await visit("/", { next: built })).text()).toContain("Scorebord openen")
  })

  it("is left out at any other address, which starts empty", async () => {
    const html = await (await visit("/familie-test", { next: built })).text()
    expect(html).not.toContain("Scorebord openen")
    expect(html).toContain('<body data-mode="loading"><div id="root"></div>\n</body>')
  })
})

describe("who may find a page", () => {
  const robots = (html: string): string | undefined =>
    /<meta name="robots" content="([^"]*)"/.exec(html)?.[1]

  it("opens the start page of woordscore.nl to search engines", async () => {
    const response = await visit("/", { host: "woordscore.nl" })
    expect(robots(await response.text())).toBe("index, follow")
    expect(response.headers.get("x-robots-tag")).toBeNull()
  })

  it.each([
    ["a scoreboard", "/familie-test", "woordscore.nl"],
    ["a code nobody uses", "/nog-vrij-123", "woordscore.nl"],
    ["the example", "/voorbeeld", "woordscore.nl"],
    ["the start page on another address", "/", "woordscore.pages.dev"],
  ])("keeps %s out", async (_, path, host) => {
    const response = await visit(path, { host })
    expect(robots(await response.text())).toBe(KEEP_OUT)
    expect(response.headers.get("x-robots-tag")).toBe(KEEP_OUT)
  })

  it("does not pass the address of a scoreboard on to other sites", async () => {
    expect(
      (await visit("/familie-test", { host: "woordscore.nl" })).headers.get("referrer-policy")
    ).toBe("same-origin")
  })
})
