// What the visitor picked: the period on show, and the player whose line stands out in the chart.
import type { StateCreator } from "zustand"
import type { BoardData, Period } from "../types/board.ts"
import type { BoardState } from "./useBoardStore.ts"

/** The period in the address, as #all or #y2025; else the current year. */
export function periodFromHash(data: BoardData): string {
  const key = location.hash.slice(1)
  const keys = Object.keys(data.periods)
  return key in data.periods ? key : (keys[Math.max(keys.length - 2, 0)] ?? "all")
}

/** A highlighted player stays highlighted only in a period where they have a line. */
export const focusIn = (P: Period | undefined, focus: string | null): string | null =>
  focus && P?.trend[focus]?.some(v => v != null) ? focus : null

export interface ViewSlice {
  /** the key of the period on show, as in data.periods */
  period: string
  focus: string | null
  choosePeriod: (key: string) => void
  followHash: () => void
  toggleFocus: (name: string) => void
}

export const createViewSlice: StateCreator<BoardState, [], [], ViewSlice> = set => ({
  period: "",
  focus: null,
  choosePeriod: key => {
    history.replaceState(null, "", `#${key}`)
    set(state => ({ period: key, focus: focusIn(state.data?.periods[key], state.focus) }))
  },
  followHash: () => {
    set(state => {
      if (!state.data) {
        return {}
      }
      const period = periodFromHash(state.data)
      return { period, focus: focusIn(state.data.periods[period], state.focus) }
    })
  },
  toggleFocus: name => {
    set(state => ({ focus: state.focus === name ? null : name }))
  },
})
