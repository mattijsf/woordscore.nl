// What an export holds for this scoreboard, and what the visitor chose for each name in it.
import type { Aliases } from "./api.ts"
import { ni } from "./format.ts"
import { NAME_RULES } from "./names.ts"
import { players, underPlayer } from "./players.ts"
import type { Score } from "./scores.ts"
import { isPlayerName, merge } from "./scores.ts"

export const MIN_TO_START = 2 // scores an export must hold before a new code is taken

export const scores = (n: number, fresh = ""): string =>
  `${ni(n)} ${fresh}${n === 1 ? "score" : "scores"}`

/** What the chosen export holds, until it is confirmed. */
export interface Pending {
  found: Score[]
  skipped: string
  /** the names asked about: all of them when a scoreboard starts, else the ones it does not know */
  names: string[]
  /** when a scoreboard starts: its name, after the group in the name of the file */
  title: string
}

/** What was chosen for one name in WhatsApp. */
export interface NameChoice {
  /** a player the scoreboard knows, or "" for a new player */
  player: string
  /** the name of the new player */
  field: string
  /** said under the field when something typed could not be kept */
  note: string
}

export const choiceFor = (name: string): NameChoice => ({ player: "", field: name, note: "" })

/** What was chosen per name, as { name in WhatsApp: name on the scoreboard }; throws on a name that cannot be used. */
function chosenLinks(names: string[], choices: Record<string, NameChoice>): Aliases {
  const links: Aliases = {}
  for (const name of names) {
    const { player, field } = choices[name] ?? choiceFor(name)
    const trimmed = field.trim()
    let target = name
    if (player) {
      target = player
    } else if (trimmed) {
      target = trimmed
    }
    if (!isPlayerName(target)) {
      throw new Error(`‘${target}’ kan geen naam zijn. ${NAME_RULES}`)
    }
    if (target !== name) {
      links[name] = target
    }
  }
  return links
}

export interface Review {
  links: Aliases
  /** every score once the export is taken in */
  rows: Score[]
  added: number
  message: string
}

/** The scores of the export under the names chosen so far, taken into `rows`. Throws on a name that cannot be used. */
export function review(
  pending: Pending,
  choices: Record<string, NameChoice>,
  rows: Score[],
  starting: boolean
): Review {
  const links = chosenLinks(pending.names, choices)
  const merged = merge(starting ? [] : rows, underPlayer(pending.found, links))
  const numbers = pending.found.map(row => row.puzzle)
  const names = players(merged.rows)
  const message = starting
    ? `${scores(pending.found.length)} gevonden van ${names.length} ${names.length === 1 ? "speler" : "spelers"}, puzzel ${Math.min(...numbers)} tot en met ${Math.max(...numbers)}.${pending.skipped}`
    : `${scores(pending.found.length)} gevonden tot en met puzzel ${Math.max(...numbers)}. ${merged.added ? `Daarvan ${merged.added === 1 ? "is" : "zijn"} er ${ni(merged.added)} nieuw.` : "Er zit niets nieuws bij."}${pending.skipped}`
  return { links, ...merged, message }
}
