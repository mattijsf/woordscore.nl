// The figures on the page, checked against a small set of scores worked out by hand.
//
//   puzzle  day              Anna         Bram          Carla
//   1592    Tue 28 Oct 2025  3 at 08:00   4 at 09:00
//   1593    Wed 29 Oct 2025  X at 10:00   4 at 07:00    4 at 07:00
//   1594    Thu 30 Oct 2025  2 at 08:00
//   1595    Fri 31 Oct 2025  (nobody)
//   1596    Sat  1 Nov 2025  5 at 23:00   5, ten past midnight
import { describe, expect, it } from "vitest"
import { parseCsv } from "../src/lib/scores.ts"
import { compute } from "../src/lib/stats.ts"
import type { Award, Period, Player } from "../src/types/board.ts"
import { csv, must } from "./helpers.ts"

const SCORES = csv(
  "1592,2025-10-28,Anna,3,2025-10-28T08:00,-----/-YG--/GGGGG",
  "1592,2025-10-28,Bram,4,2025-10-28T09:00,",
  "1593,2025-10-29,Anna,X,2025-10-29T10:00,G-Y--/G-Y--/GG---/GGG--/GGGG-/GGGG-",
  "1593,2025-10-29,Bram,4,2025-10-29T07:00,-----/--Y--/-GG--/GGGGG",
  "1593,2025-10-29,Carla,4,2025-10-29T07:00,-----/--Y--/-GG--/GGGGG",
  "1594,2025-10-30,Anna,2,2025-10-30T08:00,Y----/GGGGG",
  "1596,2025-11-01,Anna,5,2025-11-01T23:00,",
  "1596,2025-11-01,Bram,5,2025-11-02T00:10,"
)
const rows = parseCsv(SCORES)
const all = compute(rows).periods.all
const player = (name: string, period: Period = all): Player =>
  must(
    period.players.find(p => p.name === name),
    name
  )
const award = (title: string, period: Period = all): Award | undefined =>
  period.awards.find(a => a.title === title)

describe("the period as a whole", () => {
  it("counts puzzles, games and turns", () => {
    expect(all).toMatchObject({
      puzzles: 5,
      played: 4,
      games: 8,
      contested: 3,
      fails: 1,
      from_: "28 okt 2025",
      to: "1 nov 2025",
    })
  })

  it("counts a failed game as 6 turns in the total and as 7 in the average", () => {
    expect(all.guesses).toBe(33)
    expect(all.avg).toBeCloseTo(34 / 8)
  })

  it("averages each weekday over the puzzles of that day", () => {
    expect(all.weekday).toEqual([null, 3.5, 5, 2, null, 5, null])
    expect(all.weekdayGames).toEqual([0, 2, 3, 1, 0, 2, 0])
  })
})

describe("a player", () => {
  it("averages with a failed game as 7, and leaves out days not played", () => {
    expect(player("Anna")).toMatchObject({
      games: 4,
      solved: 3,
      fails: 1,
      dist: [0, 1, 1, 0, 1, 0, 1],
    })
    expect(player("Anna").avg).toBeCloseTo(17 / 4)
    expect(player("Bram").avg).toBeCloseTo(13 / 3)
    expect(player("Anna").sd).toBeCloseTo(Math.sqrt(14.75 / 4))
  })

  it("takes part in a share of all puzzles, the days nobody played included", () => {
    expect(player("Anna").part).toBeCloseTo(4 / 5)
    expect(player("Carla").part).toBeCloseTo(1 / 5)
  })

  it("wins the day with the lowest score when two or more played; shared wins count, a failed game never", () => {
    expect(player("Anna")).toMatchObject({ wins: 2, solo: 1 }) // 1592 alone, 1596 shared; 1594 nobody else played
    expect(player("Bram")).toMatchObject({ wins: 2, solo: 0 })
    expect(player("Carla")).toMatchObject({ wins: 1, solo: 0 })
  })

  it("is first by the time of the message; in the same minute the order of the rows decides", () => {
    expect(player("Anna").first).toBe(2)
    expect(player("Bram").first).toBe(1) // 1593: Bram and Carla both at 07:00, Bram's row comes first
    expect(player("Carla").first).toBe(0)
  })

  it("builds a streak from days shared and solved; a missed day or a failed game ends it", () => {
    expect(player("Anna")).toMatchObject({ best: 1, bestEnd: "28 okt 2025", cur: 1 })
    expect(player("Bram")).toMatchObject({ best: 2, bestEnd: "29 okt 2025", cur: 1 })
  })

  it("has its longest break between the first and the last game", () => {
    expect(player("Anna")).toMatchObject({ gap: 1, gapFrom: "31 okt 2025" })
    expect(player("Bram")).toMatchObject({ gap: 2, gapFrom: "30 okt 2025" })
    expect(player("Carla").gap).toBe(0)
  })

  it("shares around the middle one of its clock times", () => {
    expect(player("Anna").median).toBe("10:00") // 08:00 08:00 10:00 23:00
    expect(player("Bram").median).toBe("07:00") // 00:10 07:00 09:00
  })

  it("counts the squares of the first row, over games that have squares", () => {
    expect(player("Anna").greens).toBeCloseTo(1 / 3)
    expect(player("Anna").yellows).toBeCloseTo(2 / 3)
    expect(player("Anna")).toMatchObject({ cold: 1, coldSaved: 1, near: 1, six: 0 })
    expect(player("Bram")).toMatchObject({ cold: 1, coldSaved: 0 })
  })

  it("is outside the ranking below the minimum share of puzzles", () => {
    const strict = compute(rows, { rules: { minShare: 0.5 } }).periods.all
    expect(strict.players.map(p => [p.name, p.qual])).toEqual([
      ["Anna", true],
      ["Bram", true],
      ["Carla", false],
    ])
    expect(strict.awards.every(a => !a.who.includes("Carla"))).toBe(true)
  })
})

describe("form", () => {
  // puzzles 1592 to 1651: Anna plays all 60, a 5 on the first thirty and a 3 on the last thirty;
  // Bram plays the last nine only
  const lines = []
  for (let n = 1592; n <= 1651; n += 1) {
    const date = new Date(Date.UTC(2025, 9, 28) + (n - 1592) * 86_400_000)
      .toISOString()
      .slice(0, 10)
    lines.push(`${n},${date},Anna,${n < 1622 ? 5 : 3},,`)
    if (n > 1642) {
      lines.push(`${n},${date},Bram,4,,`)
    }
  }
  const period = compute(parseCsv(csv(...lines))).periods.all

  it("is the average over the last thirty puzzles of the period", () => {
    expect(player("Anna", period)).toMatchObject({ avg: 4, form: 3, formGames: 30 })
  })

  it("is left out for someone with too few games in those days", () => {
    expect(player("Bram", period)).toMatchObject({ form: null, formGames: 9 })
  })
})

describe("duels", () => {
  it("counts won, tied and lost on puzzles both played", () => {
    expect(all.h2h["Anna|Bram"]).toEqual([1, 1, 1])
    expect(all.h2h["Bram|Anna"]).toEqual([1, 1, 1])
    expect(all.h2h["Anna|Carla"]).toEqual([0, 0, 1])
    expect(all.h2h["Bram|Carla"]).toEqual([0, 1, 0])
  })
})

describe("awards", () => {
  it("go to the best on one figure, shared on a tie", () => {
    expect(award("Meeste dagzeges")).toMatchObject({ who: "Anna en Bram", value: "2×" })
    expect(award("Langste reeks")).toMatchObject({ who: "Bram", value: "2 dagen" })
    expect(award("Trouwste speler")).toMatchObject({ who: "Anna", value: "80%" })
    expect(award("Als eerste klaar")).toMatchObject({ who: "Anna", value: "2×" })
    expect(award("Op één letter na")).toMatchObject({ who: "Anna", value: "1×" })
    expect(award("Langste pauze")).toMatchObject({ who: "Bram", value: "2 dagen" })
    expect(award("Nachtuil")).toMatchObject({ who: "Anna", value: "10:00" })
    expect(award("Vroegste vogel")).toMatchObject({ who: "Bram en Carla", value: "07:00" })
  })

  it("name the pair that shared the very same squares", () => {
    expect(award("Gedachtenlezers")).toMatchObject({
      who: "Bram & Carla",
      value: "1×",
      note: "precies dezelfde vakjes op 29 okt 2025",
    })
  })

  it("are left out when nobody earned them", () => {
    expect(award("In één keer raak")).toBeUndefined()
    expect(award("Beste maand")).toBeUndefined() // nobody has ten games in a month
  })

  it("only show 100% for someone who shared every puzzle", () => {
    const lines = []
    for (let n = 1592; n < 1792; n += 1) {
      const date = new Date(Date.UTC(2025, 9, 28) + (n - 1592) * 86_400_000)
        .toISOString()
        .slice(0, 10)
      if (n !== 1700) {
        lines.push(`${n},${date},Anna,4,,`)
      }
      if (n === 1592 || n === 1791) {
        lines.push(`${n},${date},Bram,4,,`)
      }
    }
    const period = compute(parseCsv(csv(...lines))).periods.all
    expect(player("Anna", period).games).toBe(199)
    expect(award("Trouwste speler", period)).toMatchObject({ who: "Anna", value: "99%" })
  })
})

describe("outliers and trend", () => {
  const loose = compute(rows, { rules: { minOutlier: 2, minPerMonth: 1 } }).periods.all

  it("rank puzzles by average, the older one first on a tie, and need enough players", () => {
    expect(loose.hard.map(z => [z.n, z.avg])).toEqual([
      [1593, 5],
      [1596, 5],
      [1592, 3.5],
    ])
    expect(loose.easy.map(z => z.n)).toEqual([1592, 1593, 1596])
    expect(loose.hard[0]?.scores).toEqual({ Anna: 7, Bram: 4, Carla: 4 })
    expect(all.hard).toEqual([]) // by default four players are needed
  })

  it("average per month, and skip a month with too few games", () => {
    expect(loose.months).toEqual(["okt '25", "nov '25"])
    expect(loose.trend.Anna).toEqual([4, 5])
    expect(all.trend.Anna).toEqual([null, null])
  })
})

describe("periods", () => {
  it("are one per calendar year plus one for everything", () => {
    const { periods, first, last } = compute(
      parseCsv(
        csv("1656,2025-12-31,Anna,3,,", "1657,2026-01-01,Anna,4,,", "1592,2025-10-28,Anna,3,,")
      )
    )
    expect([first, last]).toEqual([1592, 1657])
    expect(Object.entries(periods).map(([key, p]) => [key, p.name, p.kind, p.puzzles])).toEqual([
      ["y2025", "2025", "closed", 65],
      ["y2026", "2026", "open", 1],
      ["all", "Altijd", "all", 66],
    ])
  })

  it("count a streak within the period, so one across New Year is cut in two", () => {
    const { periods } = compute(
      parseCsv(csv("1656,2025-12-31,Anna,3,,", "1657,2026-01-01,Anna,4,,"))
    )
    expect([periods.y2025, periods.y2026, periods.all].map(p => p?.players[0]?.best)).toEqual([
      1, 1, 2,
    ])
  })
})

describe("the order of the rows", () => {
  it("does not matter, apart from who was first within the same minute", () => {
    const moved = [...rows.slice(5), ...rows.slice(0, 5)] // older scores at the end, as after an upload from another phone
    expect(compute(moved)).toEqual(compute(rows))
  })
})
