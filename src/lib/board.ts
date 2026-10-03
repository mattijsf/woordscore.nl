// The figures of this scoreboard, generated from data/scores.csv when the page is built.
import data from "../data.json"
import type { Period } from "../types/board.ts"

export { data }
export const PERIOD_KEYS = Object.keys(data.periods)

// colours come from data/config.json; names without one take the next from SPARE
const SPARE = ["#4E9A3B", "#C8553D", "#5B6ABF", "#A0892B"]
export const COLORS: Record<string, string> = { ...data.colors }
data.periods.all.players
  .filter(p => !(p.name in COLORS))
  .forEach((p, i) => {
    COLORS[p.name] = SPARE[i % SPARE.length] ?? "#888"
  })

export const periodOf = (key: string): Period => data.periods[key] ?? data.periods.all
