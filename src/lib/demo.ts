// The example scoreboard behind /voorbeeld: invented players with invented scores, made in the
// browser. Nothing of it is stored. The same day always gives the same scores.
import type { Score } from "./scores.ts"
import { FAIL, dateOf, dayOf } from "./scores.ts"

export const DEMO_CODE = "voorbeeld"
export const DEMO_TITLE = "Voorbeeldgroep"

const DAYS = 240
/** name, chance to share on a day, how often each number of turns comes up (1..6, X), usual hour of sharing */
type DemoPlayer = [name: string, eagerness: number, chances: number[], hour: number]
const PLAYERS: DemoPlayer[] = [
  ["Anna", 0.93, [0.004, 0.07, 0.3, 0.34, 0.19, 0.08, 0.016], 8],
  ["Bram", 0.8, [0.002, 0.05, 0.22, 0.34, 0.24, 0.11, 0.038], 19],
  ["Carla", 0.72, [0.003, 0.06, 0.26, 0.33, 0.21, 0.1, 0.037], 13],
  ["Daan", 0.6, [0.001, 0.03, 0.17, 0.32, 0.27, 0.15, 0.059], 22],
  ["Emma", 0.85, [0.002, 0.04, 0.2, 0.35, 0.25, 0.12, 0.038], 7],
  ["Finn", 0.06, [0, 0.03, 0.15, 0.3, 0.27, 0.17, 0.08], 16],
]

/** A random number generator that gives the same numbers for the same seed. */
function seeded(seed: number): () => number {
  let state = seed
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** A square that is not green: now and then yellow. */
const square = (random: () => number): string => (random() < 0.25 ? "Y" : "-")

/** Squares that fit the result: more of them right with every row, the last row all green when solved. */
function grid(turns: number, random: () => number): string {
  const rows: string[] = []
  const count = turns === FAIL ? 6 : turns
  let green = [false, false, false, false, false]
  for (let row = 1; row <= count; row += 1) {
    if (row === count && turns !== FAIL) {
      rows.push("GGGGG")
      break
    }
    green = green.map(right => right || random() < 0.12 + row * 0.07)
    if (green.every(Boolean)) {
      green[Math.floor(random() * 5)] = false // not solved yet
    }
    rows.push(green.map(right => (right ? "G" : square(random))).join(""))
  }
  return rows.join("/")
}

export function demoRows(now = Date.now()): Score[] {
  const today = Math.floor(now / 86_400_000)
  const last = today - dayOf(0) // the puzzle of today
  const random = seeded(last)
  const rows: Score[] = []
  for (let puzzle = last - DAYS + 1; puzzle <= last; puzzle += 1) {
    const day: Score[] = []
    for (const [player, eagerness, chances, hour] of PLAYERS) {
      if (random() > eagerness) {
        continue
      }
      let pick = random()
      const turns = chances.findIndex(chance => (pick -= chance) < 0) + 1 || 4
      const minute = Math.max(0, Math.min(1439, Math.round(hour * 60 + (random() - 0.5) * 360)))
      const shared = `${dateOf(puzzle)}T${String(Math.floor(minute / 60)).padStart(2, "0")}:${String(minute % 60).padStart(2, "0")}`
      const result = turns === 7 ? FAIL : turns
      day.push({
        puzzle,
        date: dateOf(puzzle),
        player,
        turns: result,
        shared,
        grid: grid(result, random),
      })
    }
    rows.push(...day.sort((a, b) => (a.shared < b.shared ? -1 : 1)))
  }
  return rows
}
