// Cloudflare Pages middleware: www.woordscore.nl is the same site, and everything asked there
// is sent on to woordscore.nl, so that a scoreboard has one address.

interface MiddlewareContext {
  request: Request
  next: () => Promise<Response>
}

export async function onRequest({ request, next }: MiddlewareContext): Promise<Response> {
  const url = new URL(request.url)
  if (!url.hostname.startsWith("www.")) {
    return next()
  }
  url.hostname = url.hostname.slice(4)
  return Response.redirect(url.toString(), 301)
}
