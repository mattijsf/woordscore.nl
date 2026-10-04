// The standard score format: what counts as a valid line, and how scores are added.
import { describe, expect, it } from "vitest"
import { FAIL, dateOf, dayOf, merge, parseCsv, toCsv, toDay } from "../src/lib/scores.ts"
import { csv, must } from "./helpers.ts"

describe("puzzle numbers and dates", () => {
  it("puts every puzzle one day after the one before", () => {
    expect(dateOf(1592)).toBe("2025-10-28")
    expect(dateOf(1593)).toBe("2025-10-29")
    expect(dateOf(1932)).toBe("2026-10-03")
    expect(dayOf(1657) - dayOf(1592)).toBe(65)
    expect(dayOf(1592)).toBe(toDay("2025-10-28"))
  })
})

describe("parseCsv", () => {
  it("reads a score with and without the optional columns", () => {
    const rows = parseCsv(
      csv("1592,2025-10-28,Iris,3,2025-10-28T07:55,-Y-Y-/-----/GGGGG", "1593,2025-10-29,Jesse,X,,")
    )
    expect(rows).toEqual([
      {
        puzzle: 1592,
        date: "2025-10-28",
        player: "Iris",
        turns: 3,
        shared: "2025-10-28T07:55",
        grid: "-Y-Y-/-----/GGGGG",
      },
      { puzzle: 1593, date: "2025-10-29", player: "Jesse", turns: FAIL, shared: "", grid: "" },
    ])
  })

  it("reads nothing from an empty file", () => {
    expect(parseCsv("")).toEqual([])
  })

  it("writes back exactly what it read", () => {
    const text = csv(
      "1592,2025-10-28,Iris,3,2025-10-28T07:55,-Y-Y-/-----/GGGGG",
      "1593,2025-10-29,Jesse,X,,"
    )
    expect(toCsv(parseCsv(text))).toBe(text)
  })

  it.each([
    ["other columns", "puzzle,player,turns\n1592,Iris,3\n", /regel 1: verwacht de kolommen/],
    ["a missing column", csv("1592,2025-10-28,Iris,3,"), /verwacht 6 kolommen, vond 5/],
    ["seven turns", csv("1592,2025-10-28,Iris,7,,"), /bij turns/],
    ["a name with markup", csv("1592,2025-10-28,<b>x</b>,3,,"), /bij player/],
    [
      "a date that is not the day of the puzzle",
      csv("1592,2025-10-29,Iris,3,,"),
      /puzzel 1592 valt op 2025-10-28/,
    ],
    [
      "fewer rows than turns",
      csv("1592,2025-10-28,Iris,3,,-----/GGGGG"),
      /vakjes passen niet bij 3\/6/,
    ],
    [
      "a solved row before the last",
      csv("1592,2025-10-28,Iris,3,,GGGGG/-----/GGGGG"),
      /vakjes passen niet/,
    ],
    [
      "a solved row in a failed game",
      csv("1592,2025-10-28,Iris,X,,-----/-----/-----/-----/-----/GGGGG"),
      /vakjes passen niet bij X\/6/,
    ],
    [
      "the same player twice on a puzzle",
      csv("1592,2025-10-28,Iris,3,,", "1592,2025-10-28,Iris,4,,"),
      /regel 3: Iris heeft puzzel 1592 al gedeeld/,
    ],
  ])("refuses %s", (_, text, message) => {
    expect(() => parseCsv(text)).toThrow(message)
  })
})

describe("merge", () => {
  const stored = parseCsv(csv("1592,2025-10-28,Iris,3,,"))

  it("adds scores that are not there yet, at the end", () => {
    const { rows, added } = merge(
      stored,
      parseCsv(csv("1593,2025-10-29,Iris,4,,", "1592,2025-10-28,Jesse,5,,"))
    )
    expect(added).toBe(2)
    expect(rows.map(row => `${row.puzzle} ${row.player}`)).toEqual([
      "1592 Iris",
      "1593 Iris",
      "1592 Jesse",
    ])
  })

  it("never changes a score that is already there", () => {
    const { rows, added } = merge(stored, parseCsv(csv("1592,2025-10-28,Iris,1,,")))
    expect(added).toBe(0)
    expect(rows).toEqual(stored)
  })

  it("counts a score once when the new scores hold it twice", () => {
    const first = must(stored[0])
    const twice = [
      { ...first, puzzle: 1593, date: "2025-10-29" },
      { ...first, puzzle: 1593, date: "2025-10-29", turns: 6 },
    ]
    const { rows, added } = merge(stored, twice)
    expect(added).toBe(1)
    expect(rows.at(-1)?.turns).toBe(3)
  })
})
