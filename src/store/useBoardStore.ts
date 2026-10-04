// One store for the scoreboard, made of three slices: what the page shows, the scores with their
// figures, and what the visitor picked on them.
import { create } from "zustand"
import type { ScoresSlice } from "./scoresSlice.ts"
import { createScoresSlice } from "./scoresSlice.ts"
import type { SessionSlice } from "./sessionSlice.ts"
import { createSessionSlice } from "./sessionSlice.ts"
import type { ViewSlice } from "./viewSlice.ts"
import { createViewSlice } from "./viewSlice.ts"

export type BoardState = SessionSlice & ScoresSlice & ViewSlice

export const useBoardStore = create<BoardState>()((...store) => ({
  ...createSessionSlice(...store),
  ...createScoresSlice(...store),
  ...createViewSlice(...store),
}))

export const useColors = (): Record<string, string> => useBoardStore(state => state.colors)
