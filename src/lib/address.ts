// The link says which scoreboard this is: ?g=<code>. Without a code the page asks for one.
import config from "../../data/config.json"

/** The address of the start page, where a code is asked for. */
export const startPage = (): string => `${location.pathname}?kies`
export const linkTo = (code: string): string => `${location.origin}${location.pathname}?g=${code}`

export function codeInAddress(): string {
  const query = new URLSearchParams(location.search)
  if (query.has("kies")) {
    return ""
  }
  const asked = query.get("g") ?? ""
  return asked === "" ? config.defaultGroup : asked
}
