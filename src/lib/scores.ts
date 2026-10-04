// The standard score format (data/scores.csv): one line per shared score, in the order the
// scores were shared. The page, the scripts and the server all read and write it through here.

export const FAIL = 7 // how an X/6 is held in memory; the file says "X"

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

const COLUMNS = ["puzzle", "date", "player", "turns", "shared", "grid"] as const
type Column = (typeof COLUMNS)[number]
const DAY = 86_400_000
// Woordle numbers its puzzles by day, so one known pair fixes the date of every other puzzle.
const ANCHOR = { puzzle: 1592, date: "2025-10-28" }

const CHECKS: Record<Column, [RegExp, string]> = {
  puzzle: [/^\d{1,6}$/, "een puzzelnummer"],
  date: [/^\d{4}-\d\d-\d\d$/, "een datum als 2026-10-03"],
  // letters, digits, spaces, hyphens, full stops and apostrophes; never a comma, markup or one of | & "
  player: [
    /^[\p{L}\p{N}][\p{L}\p{N} .'’-]{0,23}$/u,
    "een naam van hooguit 24 letters, cijfers, spaties, streepjes, punten en apostroffen",
  ],
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
const toIso = (day: number): string => new Date(day * DAY).toISOString().slice(0, 10)
/** The day a puzzle number falls on. */
export const dayOf = (puzzle: number): number => toDay(ANCHOR.date) + puzzle - ANCHOR.puzzle
export const dateOf = (puzzle: number): string => toIso(dayOf(puzzle))
export const isPlayerName = (name: string): boolean => CHECKS.player[0].test(name)

/** Rows from the text of a scores file. Throws, naming the line, on anything that is not a valid score. */
export function parseCsv(text: string, source = "scores.csv"): Score[] {
  const [header = "", ...lines] = text.split(/\r?\n/)
  if (!text.trim()) {
    return []
  }
  if (header.trim() !== COLUMNS.join(",")) {
    throw new Error(`${source} regel 1: verwacht de kolommen ${COLUMNS.join(",")}`)
  }

  const rows: Score[] = []
  const seen = new Set<string>()
  lines.forEach((line, index) => {
    if (!line.trim()) {
      return
    }
    const where = `${source} regel ${index + 2}`
    const cells = line.split(",").map(cell => cell.trim())
    if (cells.length !== COLUMNS.length) {
      throw new Error(`${where}: verwacht ${COLUMNS.length} kolommen, vond ${cells.length}`)
    }
    const [puzzleCell = "", date = "", player = "", turnsCell = "", shared = "", grid = ""] = cells
    const row: Record<Column, string> = {
      puzzle: puzzleCell,
      date,
      player,
      turns: turnsCell,
      shared,
      grid,
    }
    for (const column of COLUMNS) {
      const [pattern, expected] = CHECKS[column]
      if (!pattern.test(row[column])) {
        throw new Error(`${where}: "${row[column]}" bij ${column}, verwacht ${expected}`)
      }
    }
    const puzzle = +puzzleCell
    const turns = /x/i.test(turnsCell) ? FAIL : +turnsCell
    if (date !== dateOf(puzzle)) {
      throw new Error(`${where}: puzzel ${puzzle} valt op ${dateOf(puzzle)}, niet op ${date}`)
    }
    if (grid) {
      const squares = grid.split("/")
      const solvedAt = squares.indexOf("GGGGG")
      const fits =
        turns === FAIL
          ? squares.length === 6 && solvedAt === -1
          : squares.length === turns && solvedAt === turns - 1
      if (!fits) {
        throw new Error(`${where}: de vakjes passen niet bij ${turnsCell}/6`)
      }
    }
    const key = `${player}|${puzzle}`
    if (seen.has(key)) {
      throw new Error(`${where}: ${player} heeft puzzel ${puzzle} al gedeeld`)
    }
    seen.add(key)
    rows.push({ puzzle, date, player, turns, shared, grid })
  })
  return rows
}

export function toCsv(rows: Score[]): string {
  const cell = (row: Score, column: Column): string =>
    column === "turns" && row.turns === FAIL ? "X" : String(row[column])
  const lines = rows.map(row => COLUMNS.map(column => cell(row, column)).join(","))
  return `${[COLUMNS.join(","), ...lines].join("\n")}\n`
}

/** Adds the scores that are not there yet. What is already there stays as it is: the first one counts. */
export function merge(existing: Score[], found: Score[]): { rows: Score[]; added: number } {
  const rows = [...existing]
  const known = new Set(rows.map(row => `${row.player}|${row.puzzle}`))
  let added = 0
  for (const row of found) {
    const key = `${row.player}|${row.puzzle}`
    if (known.has(key)) {
      continue
    }
    known.add(key)
    rows.push(row)
    added += 1
  }
  return { rows, added }
}
