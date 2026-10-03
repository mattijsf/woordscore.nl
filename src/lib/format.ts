// Numbers the way they are written in Dutch: 3,87 and 1.234.
export const nf = (x: number, digits = 2): string =>
  x.toLocaleString("nl-NL", { minimumFractionDigits: digits, maximumFractionDigits: digits })
export const ni = (x: number): string => x.toLocaleString("nl-NL")

/** A share of a count: only 100% when it is all of them, only 0% when it is none. */
export const share = (part: number, whole: number): string => {
  if (part === whole) {
    return "100%"
  }
  return part === 0 ? "0%" : `${Math.min(99, Math.max(1, Math.round((part / whole) * 100)))}%`
}

/** How a failed game is written in the figures; the page shows it as X. */
export const FAILED = 7

/** "a", "a en b", "a, b en c" */
export const list = (xs: string[]): string =>
  xs.length === 1 ? (xs[0] ?? "") : `${xs.slice(0, -1).join(", ")} en ${xs.at(-1) ?? ""}`
/** Two decimals with a comma, as in an award: 3,87 */
export const nl = (x: number): string => x.toFixed(2).replace(".", ",")
