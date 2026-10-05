// www.woordscore.nl sends everything on to woordscore.nl.
import { describe, expect, it } from "vitest"
import { onRequest } from "../server/www.ts"

const next = (): Promise<Response> => Promise.resolve(new Response("de pagina"))
const visit = (url: string): Promise<Response> => onRequest({ request: new Request(url), next })

describe("the www address", () => {
  it("sends a visitor on to the same page without www", async () => {
    const response = await visit("https://www.woordscore.nl/familie-test?x=1#all")
    expect(response.status).toBe(301)
    expect(response.headers.get("location")).toBe("https://woordscore.nl/familie-test?x=1#all")
  })

  it("sends calls to the server on as well", async () => {
    expect(
      (await visit("https://www.woordscore.nl/api/woordle/familie-test")).headers.get("location")
    ).toBe("https://woordscore.nl/api/woordle/familie-test")
  })

  it("leaves the address without www alone", async () => {
    const response = await visit("https://woordscore.nl/familie-test")
    expect(response.status).toBe(200)
    expect(await response.text()).toBe("de pagina")
  })
})
