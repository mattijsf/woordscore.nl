// The scores on show, every figure worked out from them, and what the visitor picked: the period
// on show and the player whose line stands out in the chart.
//
// The page starts from the scores it was built with, then takes in what the server has and what
// the visitor uploads. Everything shown is worked out again from `rows` each time they change.
import { create } from "zustand"
import config from "../../data/config.json"
import builtIn from "../../data/scores.csv?raw"
import { fetchScores } from "../lib/api.ts"
import type { Score } from "../lib/scores.ts"
import { merge, parseCsv } from "../lib/scores.ts"
import { compute } from "../lib/stats.ts"
import type { BoardData, Period } from "../types/board.ts"

// colours come from data/config.json; names without one take the next from SPARE
const SPARE = ["#4E9A3B", "#C8553D", "#5B6ABF", "#A0892B"]
function withColors(data: BoardData, colors: Record<string, string>): Record<string, string> {
  const next = { ...colors }
  for (const p of data.periods.all.players) {
    if (!(p.name in next)) {
      next[p.name] = SPARE[Object.keys(next).length % SPARE.length] ?? ""
    }
  }
  return next
}

/** The period in the address, as #all or #y2025; else the current year. */
function periodFromHash(data: BoardData): string {
  const key = location.hash.slice(1)
  const keys = Object.keys(data.periods)
  return key in data.periods ? key : (keys[Math.max(keys.length - 2, 0)] ?? "all")
}

/** A highlighted player stays highlighted only in a period where they have a line. */
const focusIn = (P: Period | undefined, focus: string | null): string | null =>
  focus && P?.trend[focus]?.some(v => v != null) ? focus : null

interface BoardState {
  rows: Score[]
  data: BoardData
  colors: Record<string, string>
  period: string
  focus: string | null
  /** shows these scores instead of the ones on show */
  show: (rows: Score[]) => void
  /** takes in the scores other people uploaded; without a server the built-in ones stand */
  sync: () => Promise<void>
  choosePeriod: (key: string) => void
  followHash: () => void
  toggleFocus: (name: string) => void
}

const initialRows = parseCsv(builtIn)
const initialData = compute(initialRows, config)

export const useBoardStore = create<BoardState>()((set, get) => ({
  rows: initialRows,
  data: initialData,
  colors: withColors(initialData, config.colors),
  period: periodFromHash(initialData),
  focus: null,
  show: rows => {
    const data = compute(rows, config)
    set(state => {
      const period = state.period in data.periods ? state.period : periodFromHash(data)
      return {
        rows,
        data,
        colors: withColors(data, state.colors),
        period,
        focus: focusIn(data.periods[period], state.focus),
      }
    })
  },
  sync: async () => {
    if (!config.api) {
      return
    }
    try {
      const merged = merge(get().rows, await fetchScores(config.api))
      if (merged.added) {
        get().show(merged.rows)
      }
    } catch {
      // offline, or opened as a loose file
    }
  },
  choosePeriod: key => {
    history.replaceState(null, "", `#${key}`)
    set(state => ({ period: key, focus: focusIn(state.data.periods[key], state.focus) }))
  },
  followHash: () => {
    set(state => {
      const period = periodFromHash(state.data)
      return { period, focus: focusIn(state.data.periods[period], state.focus) }
    })
  },
  toggleFocus: name => {
    set(state => ({ focus: state.focus === name ? null : name }))
  },
}))

export const usePeriod = (): Period =>
  useBoardStore(state => state.data.periods[state.period] ?? state.data.periods.all)
export const useData = (): BoardData => useBoardStore(state => state.data)
export const useColors = (): Record<string, string> => useBoardStore(state => state.colors)
