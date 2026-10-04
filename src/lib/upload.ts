// What an export holds for this scoreboard, and the names in it linked to players it knows.
import type { Aliases } from "./api.ts"
import { ni } from "./format.ts"
import { underPlayer } from "./players.ts"
import type { Score } from "./scores.ts"
import { merge } from "./scores.ts"

export const MIN_TO_START = 2 // scores an export must hold before a new code is taken

export const scores = (n: number, fresh = ""): string =>
  `${ni(n)} ${fresh}${n === 1 ? "score" : "scores"}`

/** What the chosen export holds, until it is confirmed. */
export type Pending =
  | { starting: true; rows: Score[] }
  | { starting: false; found: Score[]; skipped: string; strangers: string[] }

export interface Review {
  /** every score once the export is taken in */
  rows: Score[]
  added: number
  message: string
}

/** The scores of an export to add, under the links chosen so far, taken into `rows`. */
export function review(found: Score[], skipped: string, links: Aliases, rows: Score[]): Review {
  const merged = merge(rows, underPlayer(found, links))
  const last = Math.max(...found.map(row => row.puzzle))
  const news = merged.added
    ? `Daarvan ${merged.added === 1 ? "is" : "zijn"} er ${ni(merged.added)} nieuw.`
    : "Er zit niets nieuws bij."
  return {
    ...merged,
    message: `${scores(found.length)} gevonden tot en met puzzel ${last}. ${news}${skipped}`,
  }
}
