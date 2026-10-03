#!/usr/bin/env node
// Turns data/scores.csv and data/config.json into src/data.json, the figures the page shows.
// Usage: npm run generate
import { existsSync, readFileSync, writeFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import type {
  Award,
  BoardData,
  Duel,
  Month,
  Period,
  PeriodKind,
  Periods,
  Player,
  Puzzle,
  Rules,
} from "../src/types/board.ts"
import type { Score } from "./lib/scores.ts"
import { FAIL, projectPath, readScores, toDay } from "./lib/scores.ts"

interface Config {
  title: string
  rules: Rules
  colors: Record<string, string>
}

const DEFAULTS: Config = {
  title: "Woordle scorebord",
  rules: {
    failAs: 7,
    minShare: 0.1,
    minPerMonth: 5,
    minOutlier: 4,
    minPerWeekday: 5,
    minBestMonth: 10,
  },
  colors: {},
}
const MONTHS = "jan feb mrt apr mei jun jul aug sep okt nov dec".split(" ")
const DAY = 86_400_000

/** One shared score, ready to count. */
interface Game {
  player: string
  number: number
  turns: number
  failed: boolean
  minute: number | null
  rows: string[] | null
  green: number | null
  yellow: number | null
}

const formatDay = (day: number): string => {
  const d = new Date(day * DAY)
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()] ?? ""} ${d.getUTCFullYear()}`
}
const monthKey = (day: number): string => new Date(day * DAY).toISOString().slice(0, 7)
const weekday = (day: number): number => (day + 3) % 7 // 0 = Monday; 1 January 1970 was a Thursday
const greens = (row: string): number => (row.match(/G/g) ?? []).length
const mean = (xs: number[]): number => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0)
const count = <T>(xs: T[], test: (x: T) => boolean): number => xs.filter(test).length
const list = (xs: string[]): string =>
  xs.length === 1 ? (xs[0] ?? "") : `${xs.slice(0, -1).join(", ")} en ${xs.at(-1) ?? ""}`
const nl = (x: number): string => x.toFixed(2).replace(".", ",")
const clock = (minute: number): string =>
  `${String(Math.floor(minute / 60)).padStart(2, "0")}:${String(minute % 60).padStart(2, "0")}`

function readConfig(): Config {
  const file = projectPath("data/config.json")
  const config = (existsSync(file) ? JSON.parse(readFileSync(file, "utf8")) : {}) as Partial<Config>
  return { ...DEFAULTS, ...config, rules: { ...DEFAULTS.rules, ...config.rules } }
}

/** Rows from the standard format as games, plus the day each puzzle number falls on. */
function toGames(
  rows: Score[],
  rules: Rules
): { games: Game[]; dayOf: (number: number) => number } {
  const [head] = rows
  if (!head) {
    throw new Error("Geen scores.")
  }
  const zero = toDay(head.date) - head.puzzle
  const games = rows.map(row => {
    if (toDay(row.date) - row.puzzle !== zero) {
      throw new Error(
        `Puzzel ${row.puzzle} van ${row.player} staat op ${row.date}; dat past niet bij puzzel ${head.puzzle} op ${head.date}.`
      )
    }
    const expected = row.turns === FAIL ? 6 : row.turns
    const opening = row.grid.split("/")[0] ?? ""
    if (row.grid && row.grid.split("/").length !== expected) {
      console.warn(
        `Let op: puzzel ${row.puzzle} van ${row.player} heeft ${row.grid.split("/").length} rijen bij ${expected} beurten.`
      )
    }
    return {
      player: row.player,
      number: row.puzzle,
      turns: row.turns === FAIL ? rules.failAs : row.turns,
      failed: row.turns === FAIL,
      minute: row.shared ? +row.shared.slice(11, 13) * 60 + +row.shared.slice(14, 16) : null,
      rows: row.grid ? row.grid.split("/") : null,
      green: row.grid ? greens(opening) : null,
      yellow: row.grid ? (opening.match(/Y/g) ?? []).length : null,
    }
  })
  return { games, dayOf: number => zero + number }
}

/** All figures for one period; `numbers` is the contiguous range of puzzle numbers. */
function period(
  name: string,
  kind: PeriodKind,
  numbers: number[],
  allGames: Game[],
  dayOf: (number: number) => number,
  rules: Rules
): Period {
  const firstNumber = numbers[0] ?? 0
  const lastNumber = numbers.at(-1) ?? 0
  const games = allGames.filter(g => g.number >= firstNumber && g.number <= lastNumber)
  const byPuzzle = new Map<number, Map<string, Game>>() // in sharing order
  const byPlayer = new Map<string, Game[]>()
  for (const g of games) {
    const shared = byPuzzle.get(g.number) ?? new Map<string, Game>()
    shared.set(g.player, g)
    byPuzzle.set(g.number, shared)
    byPlayer.set(g.player, [...(byPlayer.get(g.player) ?? []), g])
  }
  const contested = [...byPuzzle.values()].filter(shared => shared.size > 1)
  const lowest = (shared: Map<string, Game>): number =>
    Math.min(...[...shared.values()].map(g => g.turns))
  const months = [...new Set(numbers.map(n => monthKey(dayOf(n))))]
  const names = [...byPlayer.keys()].sort()

  const players: Player[] = []
  const trend: Record<string, (number | null)[]> = {}
  for (const player of names) {
    const own = byPlayer.get(player) ?? []
    const solvedOn = new Set(own.filter(g => !g.failed).map(g => g.number))
    const dist = [1, 2, 3, 4, 5, 6].map(t => count(own, g => !g.failed && g.turns === t))
    const fails = count(own, g => g.failed)
    dist.push(fails)

    let streak = 0
    let best = 0
    let bestEnd: number | null = null
    for (const n of numbers) {
      streak = solvedOn.has(n) ? streak + 1 : 0
      if (streak > best) {
        ;[best, bestEnd] = [streak, n]
      }
    }

    const wins = contested.filter(shared => {
      const mine = shared.get(player)
      return mine !== undefined && !mine.failed && mine.turns === lowest(shared)
    })
    const minutes = own
      .map(g => g.minute)
      .filter(m => m !== null)
      .sort((a, b) => a - b)
    const median = minutes[Math.floor(minutes.length / 2)] ?? null
    const openings = own.filter(g => g.green !== null)
    const avg = mean(own.map(g => g.turns))
    const cold = own.filter(g => g.rows?.[0] === "-----")
    const perMonth = months.map(month =>
      own.filter(g => monthKey(dayOf(g.number)) === month).map(g => g.turns)
    )
    const fullMonths: Month[] = perMonth
      .map((turns, i) => {
        const key = months[i] ?? ""
        return {
          label: `${MONTHS[+key.slice(5) - 1] ?? ""} ${key.slice(0, 4)}`,
          games: turns.length,
          avg: mean(turns),
        }
      })
      .filter(month => month.games >= rules.minBestMonth)

    // longest run of days without a shared score, between someone's first and last game
    let gap = 0
    let gapFrom: number | null = null
    const played = own.map(g => g.number).sort((a, b) => a - b)
    for (const [i, n] of played.entries()) {
      const before = played[i - 1]
      if (before !== undefined && n - before - 1 > gap) {
        ;[gap, gapFrom] = [n - before - 1, before + 1]
      }
    }

    players.push({
      name: player,
      games: own.length,
      part: own.length / numbers.length,
      solved: own.length - fails,
      avg,
      sd: Math.sqrt(mean(own.map(g => (g.turns - avg) ** 2))),
      dist,
      wins: wins.length,
      solo: count(
        wins,
        shared => count([...shared.values()], g => g.turns === lowest(shared)) === 1
      ),
      first: count(contested, shared => shared.keys().next().value === player),
      best,
      bestEnd: bestEnd === null ? "" : formatDay(dayOf(bestEnd)),
      cur: streak,
      greens: mean(openings.map(g => g.green ?? 0)),
      yellows: mean(openings.map(g => g.yellow ?? 0)),
      median: median === null ? "–" : clock(median),
      medianMin: median,
      six: dist[5] ?? 0,
      fails,
      qual: own.length >= rules.minShare * numbers.length,
      ones: own.filter(g => g.turns === 1).map(g => formatDay(dayOf(g.number))),
      near: count(own, g => g.failed && g.rows !== null && greens(g.rows.at(-1) ?? "") === 4),
      cold: cold.length,
      coldSaved: count(cold, g => !g.failed && g.turns <= 3),
      bestMonth: fullMonths.toSorted((a, b) => a.avg - b.avg)[0] ?? null,
      gap,
      gapFrom: gapFrom === null ? "" : formatDay(dayOf(gapFrom)),
      weekdays: [0, 1, 2, 3, 4, 5, 6].map(d => {
        const turns = own.filter(g => weekday(dayOf(g.number)) === d).map(g => g.turns)
        return turns.length >= rules.minPerWeekday ? mean(turns) : null
      }),
    })

    trend[player] = perMonth.map(turns =>
      turns.length >= rules.minPerMonth ? Math.round(mean(turns) * 1000) / 1000 : null
    )
  }

  const h2h: Record<string, Duel> = {}
  for (const a of names) {
    for (const b of names) {
      if (a === b) {
        continue
      }
      const both = [...byPuzzle.values()].flatMap(s => {
        const [x, y] = [s.get(a), s.get(b)]
        return x && y ? [[x.turns, y.turns] as const] : []
      })
      h2h[`${a}|${b}`] = [
        count(both, ([x, y]) => x < y),
        count(both, ([x, y]) => x === y),
        count(both, ([x, y]) => x > y),
      ]
    }
  }

  // pairs who shared exactly the same grid for a puzzle; a one-row grid is a 1/6, not a coincidence
  const twins = new Map<string, string[]>() // "A & B" -> dates
  for (const [n, shared] of byPuzzle) {
    const grids = [...shared.values()].flatMap(g =>
      g.rows && g.rows.length >= 2 ? [{ player: g.player, grid: g.rows.join() }] : []
    )
    grids.forEach((a, i) => {
      grids.slice(i + 1).forEach(b => {
        if (a.grid !== b.grid) {
          return
        }
        const pair = [a.player, b.player].sort().join(" & ")
        twins.set(pair, [...(twins.get(pair) ?? []), formatDay(dayOf(n))])
      })
    })
  }
  const byWeekday = [0, 1, 2, 3, 4, 5, 6].map(d =>
    games.filter(g => weekday(dayOf(g.number)) === d).map(g => g.turns)
  )

  // failed games are written as 7 here whatever rules.failAs says; the page shows 7 as X
  const busy: Puzzle[] = [...byPuzzle]
    .filter(([, shared]) => shared.size >= rules.minOutlier)
    .map(([n, shared]) => ({
      n,
      date: formatDay(dayOf(n)),
      avg: mean([...shared.values()].map(g => g.turns)),
      scores: Object.fromEntries(
        [...shared].map(([player, g]) => [player, g.failed ? FAIL : g.turns])
      ),
    }))

  return {
    name,
    kind,
    puzzles: numbers.length,
    played: byPuzzle.size,
    games: games.length,
    avg: mean(games.map(g => g.turns)),
    guesses: games.reduce((sum, g) => sum + (g.failed ? 6 : g.turns), 0),
    fails: count(games, g => g.failed),
    contested: contested.length,
    from_: formatDay(dayOf(firstNumber)),
    to: formatDay(dayOf(lastNumber)),
    months: months.map(key => `${MONTHS[+key.slice(5) - 1] ?? ""} '${key.slice(2, 4)}`),
    trend,
    weekday: byWeekday.map(turns => (turns.length ? mean(turns) : null)),
    weekdayGames: byWeekday.map(turns => turns.length),
    players,
    h2h,
    hard: busy.toSorted((a, b) => b.avg - a.avg || a.n - b.n).slice(0, 5),
    easy: busy.toSorted((a, b) => a.avg - b.avg || a.n - b.n).slice(0, 5),
    awards: awards(players, numbers.length, twins),
  }
}

interface AwardOptions {
  lowest?: boolean
  among?: Player[]
  /** no award when the best value is 0 */
  skipZero?: boolean
}

function awards(players: Player[], puzzles: number, twins: Map<string, string[]>): Award[] {
  const eligible = players.filter(p => p.qual)
  if (!eligible.length) {
    return []
  }

  const award = (
    title: string,
    value: (p: Player) => number,
    text: (p: Player) => string,
    note: (p: Player, winners: Player[]) => string,
    { lowest = false, among = eligible, skipZero = false }: AwardOptions = {}
  ): Award[] => {
    const top = Math[lowest ? "min" : "max"](...among.map(value))
    if (skipZero && top === 0) {
      return []
    }
    const winners = among.filter(p => value(p) === top)
    const [winner] = winners
    if (!winner) {
      return []
    }
    return [
      {
        title,
        who: list(winners.map(p => p.name)),
        value: text(winner),
        note: note(winner, winners),
      },
    ]
  }
  const timed = eligible.filter(p => p.medianMin !== null)
  const minute = (p: Player): number => p.medianMin ?? 0
  const saved = Math.max(...eligible.map(p => p.coldSaved))
  const savers = list(eligible.filter(p => p.coldSaved === saved).map(p => p.name))
  // rounded, so that 52/14 and 78/21 count as the same average
  const monthAvg = (p: Player): number => Math.round((p.bestMonth?.avg ?? 0) * 1e6) / 1e6
  const names = new Set(eligible.map(p => p.name))
  const pairs = [...twins].filter(([pair]) => pair.split(" & ").every(name => names.has(name)))
  const most = Math.max(0, ...pairs.map(([, dates]) => dates.length))
  const closest = pairs.filter(([, dates]) => dates.length === most)
  const month = (p: Player): Month => p.bestMonth ?? { label: "", games: 0, avg: 0 }

  const result = [
    ...award(
      "Langste reeks",
      p => p.best,
      p => `${p.best} dagen`,
      p => `op rij geraden, tot en met ${p.bestEnd}`
    ),
    ...award(
      "Meeste dagzeges",
      p => p.wins,
      p => `${p.wins}×`,
      p => `beste score van de dag, waarvan ${p.solo}× alleen`
    ),
    ...award(
      "Trouwste speler",
      p => p.games,
      p => `${Math.round(p.part * 100)}%`,
      p => `${p.games} van de ${puzzles} puzzels gedeeld`
    ),
    ...award(
      "Als eerste klaar",
      p => p.first,
      p => `${p.first}×`,
      () => "het eerste bericht van de dag"
    ),
    ...award(
      "Beste opener",
      p => p.greens + p.yellows,
      p => nl(p.greens + p.yellows),
      () => "gekleurde vakjes gemiddeld na de eerste beurt"
    ),
    ...award(
      "Nachtuil",
      minute,
      p => p.median,
      () => "doorsnee tijdstip van delen",
      {
        among: timed,
      }
    ),
    ...award(
      "Vroegste vogel",
      minute,
      p => p.median,
      () => "doorsnee tijdstip van delen",
      {
        lowest: true,
        among: timed,
      }
    ),
    ...award(
      "Op het nippertje",
      p => p.six,
      p => `${p.six}×`,
      () => "pas in de zesde beurt geraden"
    ),
    ...award(
      "Op één letter na",
      p => p.near,
      p => `${p.near}×`,
      () => "niet geraden met vier groene vakjes in de laatste rij",
      { skipZero: true }
    ),
    ...award(
      "Koude start",
      p => p.cold,
      p => `${p.cold}×`,
      () =>
        `eerste rij helemaal grijs${saved ? `; daarna vaakst toch binnen drie beurten: ${savers} (${saved}×)` : ""}`,
      { skipZero: true }
    ),
    ...award(
      "Meest constant",
      p => Math.round(p.sd * 1e6) / 1e6,
      p => nl(p.sd),
      () => "kleinste spreiding in aantal beurten",
      { lowest: true }
    ),
    ...award(
      "Beste maand",
      monthAvg,
      p => nl(month(p).avg),
      (p, winners) =>
        winners.length > 1
          ? winners.map(w => `${w.name} in ${month(w).label} (${month(w).games} potjes)`).join("; ")
          : `${month(p).label}, ${month(p).games} potjes`,
      { lowest: true, among: eligible.filter(p => p.bestMonth) }
    ),
    ...award(
      "Langste pauze",
      p => p.gap,
      p => `${p.gap} ${p.gap === 1 ? "dag" : "dagen"}`,
      p => `niets gedeeld vanaf ${p.gapFrom}`,
      { skipZero: true }
    ),
  ]
  if (most) {
    result.push({
      title: "Gedachtenlezers",
      who: list(closest.map(([pair]) => pair)),
      value: `${most}×`,
      note: `exact hetzelfde vakjespatroon op dezelfde dag: ${closest.map(([, dates]) => list(dates)).join("; ")}`,
    })
  }
  const aces = eligible.filter(p => p.ones.length)
  if (aces.length) {
    result.push({
      title: "In één keer raak",
      who: list(aces.map(p => p.name)),
      value: "1/6",
      note: aces.map(p => `${p.name} op ${list(p.ones)}`).join("; "),
    })
  }
  return result
}

export function generate(): void {
  const rows = readScores()
  if (!rows.length) {
    throw new Error(
      'data/scores.csv is leeg of ontbreekt. Vul het bestand of draai eerst: npm run import -- "<WhatsApp-export>.txt"'
    )
  }
  const config = readConfig()
  const { games, dayOf } = toGames(rows, config.rules)

  const first = Math.min(...games.map(g => g.number))
  const last = Math.max(...games.map(g => g.number))
  const numbers = Array.from({ length: last - first + 1 }, (_, i) => first + i)
  const yearOf = (n: number): number => new Date(dayOf(n) * DAY).getUTCFullYear()
  const years = [...new Set(numbers.map(yearOf))]

  const byYear: Record<string, Period> = {}
  for (const year of years) {
    const kind = year === years.at(-1) ? "open" : "closed"
    const inYear = numbers.filter(n => yearOf(n) === year)
    byYear[`y${year}`] = period(String(year), kind, inYear, games, dayOf, config.rules)
  }
  const periods: Periods = {
    ...byYear,
    all: period("Altijd", "all", numbers, games, dayOf, config.rules),
  }

  const data: BoardData = {
    title: config.title,
    first,
    last,
    rules: config.rules,
    colors: config.colors,
    periods,
  }
  writeFileSync(projectPath("src/data.json"), `${JSON.stringify(data, null, 2)}\n`)
  console.log(
    `src/data.json: ${games.length} potjes, puzzel ${first} t/m ${last} (${periods.all.to})`
  )
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    generate()
  } catch (error) {
    console.error(error instanceof Error ? error.message : error)
    process.exit(1)
  }
}
