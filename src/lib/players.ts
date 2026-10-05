// Players and the names they have in WhatsApp.
import type { Score } from "./scores.ts"

/** Every player in the scores, in the order they first appear. */
export const players = (rows: Score[]): string[] => [...new Set(rows.map(row => row.player))]

/** The scores with every linked name replaced by the player it belongs to. */
export const underPlayer = (rows: Score[], names: Record<string, string>): Score[] =>
  rows.map(row => {
    const player = names[row.player]
    return player ? { ...row, player } : row
  })

/** "WhatsApp-chat met Woordle-groep.txt" -> "Woordle-groep" */
export const guessName = (file: string): string =>
  (
    /^WhatsApp[- ]chat(?: -| met| with| mit| avec| con)? (.+)$/i.exec(
      file.replace(/\.(txt|zip)$/i, "").replace(/_/g, " ")
    )?.[1] ?? ""
  )
    .trim()
    .slice(0, 60)
