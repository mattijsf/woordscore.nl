import { useBoardStore } from "../store/useBoardStore.ts"
import type { BoardData, Period } from "../types/board.ts"

export interface OpenBoard {
  data: BoardData
  /** the period on show */
  period: Period
}

/** The scoreboard on show with the period picked on it, or null while none is open. */
export function useOpenBoard(): OpenBoard | null {
  const data = useBoardStore(state => (state.mode === "board" ? state.data : null))
  const key = useBoardStore(state => state.period)
  return data ? { data, period: data.periods[key] ?? data.periods.all } : null
}
