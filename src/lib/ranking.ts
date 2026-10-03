import type { Period, Player } from "../types/board.ts"

/** The ranking first, best average on top, then everyone who played too little to be in it. */
export const ranked = (P: Period): Player[] => {
  const byAverage = (a: Player, b: Player): number => a.avg - b.avg
  return [
    ...P.players.filter(p => p.qual).sort(byAverage),
    ...P.players.filter(p => !p.qual).sort(byAverage),
  ]
}
