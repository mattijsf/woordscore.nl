// The scores on show and every figure worked out from them, again each time they change.
import type { StateCreator } from "zustand"
import config from "../../data/config.json"
import type { Aliases } from "../lib/api.ts"
import { addScores } from "../lib/api.ts"
import { colorsFor } from "../lib/colors.ts"
import type { Score } from "../lib/scores.ts"
import { merge } from "../lib/scores.ts"
import { compute } from "../lib/stats.ts"
import type { BoardData } from "../types/board.ts"
import type { BoardState } from "./useBoardStore.ts"
import { focusIn, periodFromHash } from "./viewSlice.ts"

export interface ScoresSlice {
  title: string
  aliases: Aliases
  rows: Score[]
  /** the figures, once there are scores */
  data: BoardData | null
  colors: Record<string, string>
  /** shows these scores instead of the ones on show */
  show: (rows: Score[]) => void
  /**
   * Shows the scores at once and keeps them on the server, with the names they are linked to.
   * Answers the last puzzle on show afterwards.
   */
  keepScores: (rows: Score[], links: Aliases) => Promise<number>
}

export const createScoresSlice: StateCreator<BoardState, [], [], ScoresSlice> = (set, get) => ({
  title: "Woordscore",
  aliases: {},
  rows: [],
  data: null,
  colors: {},
  show: rows => {
    const data = compute(rows, { ...config, title: get().title })
    set(state => {
      const period = state.period in data.periods ? state.period : periodFromHash(data)
      return {
        rows,
        data,
        colors: colorsFor(rows),
        period,
        focus: focusIn(data.periods[period], state.focus),
      }
    })
  },
  keepScores: async (rows, links) => {
    get().show(rows)
    const kept = await addScores(get().code, rows, links)
    set({ aliases: kept.aliases })
    get().show(merge(get().rows, kept.rows).rows)
    return get().data?.last ?? 0
  },
})
