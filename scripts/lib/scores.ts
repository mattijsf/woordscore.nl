// Reading and writing data/scores.csv, the standard format every other script works from.
import { existsSync, readFileSync, writeFileSync } from "node:fs"
import { fileURLToPath } from "node:url"

export const FAIL = 7 // how an X/6 is stored in memory; the file says "X"
export const projectPath = (relative: string): string =>
  fileURLToPath(new URL(`../../${relative}`, import.meta.url))

export interface Score {
  puzzle: number
  date: string
  player: string
  /** 1 to 6, or FAIL */
  turns: number
  /** moment of sharing as 2026-10-03T08:50, or empty */
  shared: string
  /** rows as "--Y--/GGGGG", or empty */
  grid: string
}

const FILE = "data/scores.csv"
const COLUMNS = ["puzzle", "date", "player", "turns", "shared", "grid"] as const
type Column = (typeof COLUMNS)[number]
const DAY = 86_400_000

const CHECKS: Record<Column, [RegExp, string]> = {
  puzzle: [/^\d+$/, "een puzzelnummer"],
  date: [/^\d{4}-\d\d-\d\d$/, "een datum als 2026-10-03"],
  player: [/^[^,<>&"']+$/, "een naam zonder komma of leestekens als < > & \" '"],
  turns: [/^[1-6X]$/i, "een getal van 1 tot 6, of X"],
  shared: [/^(\d{4}-\d\d-\d\dT\d\d:\d\d)?$/, "leeg of een moment als 2026-10-03T08:50"],
  grid: [
    /^([GY-]{5}(\/[GY-]{5}){0,5})?$/,
    "leeg of rijen van vijf tekens G, Y of -, gescheiden door /",
  ],
}

/** Days since 1970 for an ISO date, and back. */
export const toDay = (iso: string): number =>
  Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10)) / DAY
export const toIso = (day: number): string => new Date(day * DAY).toISOString().slice(0, 10)

/** Rows in file order, which is the order the scores were shared in. */
export function readScores(): Score[] {
  if (!existsSync(projectPath(FILE))) {
    return []
  }
  const [header = "", ...lines] = readFileSync(projectPath(FILE), "utf8").split(/\r?\n/)
  if (header.trim() !== COLUMNS.join(",")) {
    throw new Error(`${FILE} regel 1: verwacht de kolommen ${COLUMNS.join(",")}`)
  }
  const rows: Score[] = []
  const seen = new Set<string>()
  lines.forEach((line, index) => {
    if (!line.trim()) {
      return
    }
    const where = `${FILE} regel ${index + 2}`
    const cells = line.split(",").map(cell => cell.trim())
    if (cells.length !== COLUMNS.length) {
      throw new Error(`${where}: verwacht ${COLUMNS.length} kolommen, vond ${cells.length}`)
    }
    const [puzzle = "", date = "", player = "", turns = "", shared = "", grid = ""] = cells
    const row: Record<Column, string> = { puzzle, date, player, turns, shared, grid }
    for (const column of COLUMNS) {
      const [pattern, expected] = CHECKS[column]
      if (!pattern.test(row[column])) {
        throw new Error(`${where}: "${row[column]}" bij ${column}, verwacht ${expected}`)
      }
    }
    if (toIso(toDay(row.date)) !== row.date) {
      throw new Error(`${where}: ${row.date} is geen bestaande datum`)
    }
    const key = `${row.player}|${row.puzzle}`
    if (seen.has(key)) {
      throw new Error(`${where}: ${row.player} heeft puzzel ${row.puzzle} al gedeeld`)
    }
    seen.add(key)
    rows.push({ ...row, puzzle: +row.puzzle, turns: /x/i.test(row.turns) ? FAIL : +row.turns })
  })
  return rows
}

export function writeScores(rows: Score[]): void {
  const cell = (row: Score, column: Column): string =>
    column === "turns" && row.turns === FAIL ? "X" : String(row[column])
  const lines = rows.map(row => COLUMNS.map(column => cell(row, column)).join(","))
  writeFileSync(projectPath(FILE), `${[COLUMNS.join(","), ...lines].join("\n")}\n`)
}
