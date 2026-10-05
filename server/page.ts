// Cloudflare Pages Function in front of the page itself: fills in what a link preview shows.
//
// WhatsApp and other apps read the title, description and picture of a link from the HTML,
// without running the page's script. So for woordscore.nl/<code> the name of that scoreboard
// is written into the page here. Everything else about the page stays as it was built.
import type { KV, PageContext } from "./kv.ts"

const BRAND = "Woordscore"
const CODE = /^[a-z0-9][a-z0-9-]{4,30}[a-z0-9]$/
const PICTURE = "/og.png"
// the start page, as built into the page: everything in #root, which closes the body
const START_PAGE = /(<div id="root">)[\s\S]*(<\/div>\s*<\/body>)/

const escape = (text: string): string =>
  text.replace(/[&<>"]/g, character => `&#${character.charCodeAt(0)};`)
const setMeta = (html: string, property: string, content: string): string =>
  html.replace(
    new RegExp(`(<meta property="${property}" content=")[^"]*(")`),
    (_, before: string, after: string) => before + escape(content) + after
  )

/** The name of the scoreboard a path points at, or null when there is none. */
async function scoreboardName(pathname: string, kv: KV): Promise<string | null> {
  const [first = "", ...rest] = pathname.split("/").filter(Boolean)
  const code = first.toLowerCase()
  if (rest.length || !CODE.test(code)) {
    return null
  }
  const group = await kv.get(`group:${code}`)
  return group === null ? null : ((JSON.parse(group) as { title?: string } | null)?.title ?? null)
}

export async function onRequest({ request, env, next }: PageContext): Promise<Response> {
  const response = await next()
  if (
    request.method !== "GET" ||
    !(response.headers.get("content-type") ?? "").includes("text/html")
  ) {
    return response
  }

  const url = new URL(request.url)
  const name = await scoreboardName(url.pathname, env.WOORDLE)
  let html = await response.text()
  if (name) {
    html = setMeta(html, "og:title", `${name} | ${BRAND}`)
    html = setMeta(html, "og:description", `De stand van ${name} op ${BRAND}.`)
    html = html.replace(/<title>[^<]*<\/title>/, `<title>${escape(name)} | ${BRAND}</title>`)
  }
  html = setMeta(html, "og:url", url.origin + url.pathname)
  html = setMeta(html, "og:image", url.origin + PICTURE)
  // the start page is built into the page, for whoever reads it without its script; any other
  // address shows something else, so there it would only flash by
  if (url.pathname !== "/") {
    html = html
      .replace(START_PAGE, "$1$2")
      .replace('<body data-mode="start">', '<body data-mode="loading">')
  }

  const headers = new Headers(response.headers)
  // they belong to the page as it was built
  ;["content-length", "etag"].forEach(header => {
    headers.delete(header)
  })
  headers.set("cache-control", "no-cache")
  return new Response(html, { status: response.status, headers })
}
