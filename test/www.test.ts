// The other names of the site send everything on to woordscore.nl.
import { describe, expect, it } from "vitest"
import { onRequest } from "../server/www.ts"

const next = (): Promise<Response> => Promise.resolve(new Response("de pagina"))
const visit = (url: string): Promise<Response> => onRequest({ request: new Request(url), next })
const sentTo = async (url: string): Promise<[number, string | null]> => {
  const response = await visit(url)
  return [response.status, response.headers.get("location")]
}

describe("the other names of the site", () => {
  it.each([
    ["https://www.woordscore.nl/familie-test?x=1", "https://woordscore.nl/familie-test?x=1"],
    ["https://woordlescore.nl/", "https://woordscore.nl/"],
    ["https://woordlescore.nl/familie-test", "https://woordscore.nl/familie-test"],
    ["https://www.woordlescore.nl/voorbeeld", "https://woordscore.nl/voorbeeld"],
    ["http://woordlescore.nl/voorbeeld", "https://woordscore.nl/voorbeeld"],
    [
      "https://www.woordscore.nl/api/woordle/familie-test",
      "https://woordscore.nl/api/woordle/familie-test",
    ],
  ])("send %s on to %s", async (from, to) => {
    expect(await sentTo(from)).toEqual([301, to])
  })

  it("leave woordscore.nl itself alone", async () => {
    const response = await visit("https://woordscore.nl/familie-test")
    expect(response.status).toBe(200)
    expect(await response.text()).toBe("de pagina")
  })

  it("leave the address Cloudflare gives the project alone", async () => {
    expect((await visit("https://woordscore.pages.dev/")).status).toBe(200)
  })
})
