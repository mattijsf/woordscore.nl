// Numbers the way they are written in Dutch: 3,87 and 1.234.
export const nf = (x: number, digits = 2): string =>
  x.toLocaleString("nl-NL", { minimumFractionDigits: digits, maximumFractionDigits: digits })
export const ni = (x: number): string => x.toLocaleString("nl-NL")
export const pc = (x: number): string => `${Math.round(x * 100)}%`

/** How a failed game is written in the figures; the page shows it as X. */
export const FAILED = 7
