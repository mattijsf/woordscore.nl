// The figures the page shows, as scripts/generate.ts writes them to src/data.json.

export type PeriodKind = "all" | "open" | "closed"

export interface Rules {
  /** X/6 counts as this many turns in averages */
  failAs: number
  /** below this share of the puzzles: outside ranking and awards */
  minShare: number
  /** fewer games in a month: no point in the trend chart */
  minPerMonth: number
  /** players needed for hardest/easiest puzzles */
  minOutlier: number
  /** fewer games on a weekday: no best/worst weekday for that player */
  minPerWeekday: number
  /** games needed for a month to count as someone's best month */
  minBestMonth: number
}

export interface Month {
  label: string
  games: number
  avg: number
}

export interface Player {
  name: string
  games: number
  part: number
  solved: number
  avg: number
  /** standard deviation of the turns */
  sd: number
  /** games per number of turns, 1 to 6, then the failed ones */
  dist: number[]
  wins: number
  solo: number
  first: number
  best: number
  bestEnd: string
  cur: number
  greens: number
  yellows: number
  median: string
  medianMin: number | null
  six: number
  fails: number
  qual: boolean
  ones: string[]
  /** failed with four green squares in the last row */
  near: number
  /** first row all grey */
  cold: number
  /** of those, solved in three turns or fewer */
  coldSaved: number
  bestMonth: Month | null
  /** longest run of days without a shared score */
  gap: number
  gapFrom: string
  /** average per weekday, Monday first; null below rules.minPerWeekday */
  weekdays: (number | null)[]
}

export interface Award {
  title: string
  who: string
  value: string
  note: string
}

export interface Puzzle {
  n: number
  date: string
  avg: number
  /** turns per player; a failed game is 7 */
  scores: Record<string, number>
}

/** Won, tied and lost against one other player. */
export type Duel = [won: number, tied: number, lost: number]

export interface Period {
  name: string
  kind: PeriodKind
  puzzles: number
  played: number
  games: number
  avg: number
  guesses: number
  fails: number
  contested: number
  from_: string
  to: string
  months: string[]
  trend: Record<string, (number | null)[]>
  /** average per weekday, Monday first */
  weekday: (number | null)[]
  weekdayGames: number[]
  players: Player[]
  h2h: Record<string, Duel>
  hard: Puzzle[]
  easy: Puzzle[]
  awards: Award[]
}

export type Periods = Record<string, Period> & { all: Period }

export interface BoardData {
  title: string
  first: number
  last: number
  rules: Rules
  colors: Record<string, string>
  periods: Periods
}
