// The address says which scoreboard this is: woordscore.nl/<code>. At / the page asks for a code.
import { toCode } from "./code.ts"

export const HOME = "/"
export const linkTo = (code: string): string => `/${code}`

export function codeInAddress(): string {
  if (typeof location === "undefined") {
    return "" // building the start page ahead of time, where there is no address
  }
  const [first = ""] = location.pathname.split("/").filter(Boolean)
  if (first.includes(".")) {
    return "" // a file, not a code
  }
  try {
    return toCode(decodeURIComponent(first))
  } catch {
    return ""
  }
}

/** One address per scoreboard: /Jansens/ and /jansens/x both become /jansens. */
export function tidyAddress(code: string): void {
  if (code && location.pathname !== linkTo(code)) {
    history.replaceState(null, "", linkTo(code) + location.hash)
  }
}
