import type { Score } from "./scores.ts"

// one colour per player, handed out in the order they first shared a score, so it stays theirs
const PALETTE = [
  "#D2447F",
  "#19A7B8",
  "#8B929A",
  "#E3871C",
  "#2F7FD6",
  "#7C5BD9",
  "#4E9A3B",
  "#C8553D",
  "#5B6ABF",
  "#A0892B",
]

export function colorsFor(rows: Score[]): Record<string, string> {
  const firstShared = new Map<string, string>()
  for (const row of rows) {
    const moment = `${String(row.puzzle).padStart(6, "0")} ${row.shared || "~"}`
    const known = firstShared.get(row.player)
    if (known === undefined || moment < known) {
      firstShared.set(row.player, moment)
    }
  }
  const inOrder = [...firstShared].sort(([, a], [, b]) => {
    if (a < b) {
      return -1
    }
    return a > b ? 1 : 0
  })
  return Object.fromEntries(
    inOrder.map(([name], index) => [name, PALETTE[index % PALETTE.length] ?? ""])
  )
}
