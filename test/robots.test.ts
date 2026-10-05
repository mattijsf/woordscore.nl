// robots.txt: only the start page is open, also once Cloudflare has put its own rules above ours.
import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

const OURS = readFileSync(new URL("../public/robots.txt", import.meta.url), "utf8")
// what Cloudflare's "Bot Preference Sync" prepends, as seen on woordscore.nl
const CLOUDFLARE = `# BEGIN Cloudflare Managed content
User-agent: *
Content-Signal: search=yes,ai-train=no,use=reference
Allow: /

User-agent: GPTBot
Disallow: /
# END Cloudflare Managed Content
`

/** Whether a crawler may fetch a path, the way RFC 9309 says: the longest rule that fits wins, and allow wins a tie. */
interface Rule {
  allow: boolean
  pattern: string
}
interface Group {
  agents: string[]
  rules: Rule[]
}

function allowed(robots: string, agent: string, path: string): boolean {
  const groups: Group[] = []
  let current: Group | null = null
  for (const raw of robots.split("\n")) {
    const line = raw.replace(/#.*/, "").trim()
    const [field = "", ...rest] = line.split(":")
    const value = rest.join(":").trim()
    if (/^user-agent$/i.test(field)) {
      if (!current || current.rules.length) {
        groups.push((current = { agents: [], rules: [] }))
      }
      current.agents.push(value.toLowerCase())
    } else if (/^(allow|disallow)$/i.test(field) && current && value) {
      current.rules.push({ allow: /^allow$/i.test(field), pattern: value })
    }
  }
  const own = groups.filter(group => group.agents.includes(agent.toLowerCase()))
  const rules = (own.length ? own : groups.filter(group => group.agents.includes("*"))).flatMap(
    group => group.rules
  )
  const fits = ({ pattern }: Rule): boolean =>
    new RegExp(
      `^${pattern
        .replace(/[.+?^{}()|[\]\\]/g, "\\$&")
        .replace(/\*/g, ".*")
        .replace(/\\?\$$/, "$")}`
    ).test(path)
  const best = rules
    .filter(fits)
    .sort((a, b) => b.pattern.length - a.pattern.length || Number(b.allow) - Number(a.allow))[0]
  return best ? best.allow : true
}

describe.each([
  ["on its own", OURS],
  ["under the rules Cloudflare adds", CLOUDFLARE + OURS],
])("robots.txt %s", (_, robots) => {
  it("opens the start page and the picture of a shared link", () => {
    expect(allowed(robots, "Googlebot", "/")).toBe(true)
    expect(allowed(robots, "Googlebot", "/og.png")).toBe(true)
  })

  it.each(["/familie-test", "/voorbeeld", "/api/woordle/familie-test", "/familie-test?x=1"])(
    "keeps every crawler out of %s",
    path => {
      expect(allowed(robots, "Googlebot", path)).toBe(false)
      expect(allowed(robots, "EenOnbekendeBot", path)).toBe(false)
    }
  )
})

describe("the check itself", () => {
  it('sees that a plain "Disallow: /" would lose from Cloudflare\'s "Allow: /"', () => {
    const weak = `${CLOUDFLARE}User-agent: *\nAllow: /$\nDisallow: /\n`
    expect(allowed(weak, "Googlebot", "/familie-test")).toBe(true)
  })

  it("gives a crawler with a group of its own only that group", () => {
    expect(allowed(CLOUDFLARE + OURS, "GPTBot", "/")).toBe(false)
  })
})
