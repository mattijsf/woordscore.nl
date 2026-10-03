// Explanations open in one sheet; a term inside the sheet goes a level deeper, with a way back.
import { create } from "zustand"

interface TipState {
  /** the tips opened in the sheet, the one on show last; empty when the sheet is closed */
  trail: string[]
  /** opens a tip on its own, or one level deeper when asked from inside the sheet */
  openTip: (key: string, deeper: boolean) => void
  back: () => void
  close: () => void
}

export const useTipStore = create<TipState>()(set => ({
  trail: [],
  openTip: (key, deeper) => {
    set(state => ({ trail: deeper ? [...state.trail, key] : [key] }))
  },
  back: () => {
    set(state => ({ trail: state.trail.slice(0, -1) }))
  },
  close: () => {
    set({ trail: [] })
  },
}))
