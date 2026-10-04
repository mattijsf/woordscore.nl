// What the page shows: the start page that asks for a code, a scoreboard, the offer to start one
// under a free code, or a message while loading or after an error.
import type { StateCreator } from "zustand"
import { codeInAddress } from "../lib/address.ts"
import { getBoard, removeBoard, startBoard } from "../lib/api.ts"
import { CODE_RULES, VALID_CODE } from "../lib/code.ts"
import { messageOf } from "../lib/messages.ts"
import type { Score } from "../lib/scores.ts"
import { storedKey } from "../lib/storedKey.ts"
import type { BoardState } from "./useBoardStore.ts"

export const BRAND = "Woordscore"

export type Mode = "loading" | "start" | "board" | "new" | "error"

export interface SessionSlice {
  /** the code in the address; "" on the start page */
  code: string
  mode: Mode
  /** what the page says while loading, or what went wrong */
  notice: string
  /** what the start page says under the code field */
  codeMessage: string
  /** the key handed out when this visitor just started the scoreboard, else "" */
  startedWith: string
  /** counts the times a scoreboard was opened, so that what belongs to it starts afresh */
  opened: number
  /** loads the scoreboard in the address, or asks for a code */
  open: (startedWith?: string) => Promise<void>
  askCode: (message?: string) => void
  /** starts a scoreboard under the free code in the address, keeps its key here and opens it */
  startScoreboard: (rows: Score[], title: string) => Promise<void>
  /** removes the scoreboard with the key that was handed out when it was started */
  removeScoreboard: (key: string) => Promise<void>
}

const code = codeInAddress()

export const createSessionSlice: StateCreator<BoardState, [], [], SessionSlice> = (set, get) => ({
  code,
  mode: code ? "loading" : "start",
  notice: "",
  codeMessage: "",
  startedWith: "",
  opened: 0,
  open: async (startedWith = "") => {
    if (!VALID_CODE.test(code)) {
      get().askCode(CODE_RULES)
      return
    }
    set({ notice: "Scorebord laden…", mode: "loading" })
    try {
      const board = await getBoard(code)
      if (!board) {
        set({ mode: "new" }) // a free code: offer to start a scoreboard under it
        return
      }
      set(state => ({
        title: board.title || BRAND,
        aliases: board.aliases,
        startedWith,
        opened: state.opened + 1,
      }))
      get().show(board.rows)
      set({ mode: "board" })
    } catch (error) {
      set({ notice: `Het scorebord kon niet geladen worden: ${messageOf(error)}.`, mode: "error" })
    }
  },
  askCode: (message = "") => {
    set({ codeMessage: message, mode: "start" })
  },
  startScoreboard: async (rows, title) => {
    const key = await startBoard(code, rows, title)
    if (key) {
      storedKey.set(code, key)
    }
    await get().open(key)
  },
  removeScoreboard: async key => {
    await removeBoard(code, key)
    storedKey.clear(code)
  },
})
