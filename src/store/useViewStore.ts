// What the visitor picked: the period on show, and the player whose line stands out in the chart.
import { create } from "zustand"
import { PERIOD_KEYS, data, periodOf } from "../lib/board.ts"
import type { Period } from "../types/board.ts"

/** The period in the address, as #all or #y2025; else the current year. */
const periodFromHash = (): string => {
  const key = location.hash.slice(1)
  return key in data.periods ? key : (PERIOD_KEYS[Math.max(PERIOD_KEYS.length - 2, 0)] ?? "all")
}

/** A highlighted player stays highlighted only in a period where they have a line. */
const focusIn = (key: string, focus: string | null): string | null =>
  focus && periodOf(key).trend[focus]?.some(v => v != null) ? focus : null

interface ViewState {
  period: string
  focus: string | null
  choosePeriod: (key: string) => void
  followHash: () => void
  toggleFocus: (name: string) => void
}

export const useViewStore = create<ViewState>()(set => ({
  period: periodFromHash(),
  focus: null,
  choosePeriod: key => {
    history.replaceState(null, "", `#${key}`)
    set(state => ({ period: key, focus: focusIn(key, state.focus) }))
  },
  followHash: () => {
    const key = periodFromHash()
    set(state => ({ period: key, focus: focusIn(key, state.focus) }))
  },
  toggleFocus: name => {
    set(state => ({ focus: state.focus === name ? null : name }))
  },
}))

export const usePeriod = (): Period => periodOf(useViewStore(state => state.period))
