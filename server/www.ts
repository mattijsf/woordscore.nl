// Cloudflare Pages middleware: the site has one address, woordscore.nl. Its www address and the
// second domain, woordlescore.nl, send everything on to it, so that a scoreboard has one link.
const HOME = "woordscore.nl"
const OTHER_NAMES = new Set(["www.woordscore.nl", "woordlescore.nl", "www.woordlescore.nl"])

interface MiddlewareContext {
  request: Request
  next: () => Promise<Response>
}

export async function onRequest({ request, next }: MiddlewareContext): Promise<Response> {
  const url = new URL(request.url)
  if (OTHER_NAMES.has(url.hostname)) {
    url.hostname = HOME
  } else if (url.hostname.startsWith("www.")) {
    url.hostname = url.hostname.slice(4) // the same rule for a test address
  } else {
    return next()
  }
  url.protocol = "https:"
  return Response.redirect(url.toString(), 301)
}
