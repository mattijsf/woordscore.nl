// The example scoreboard: invented, but it has to be a valid set of scores that fills every part of the page.
import { describe, expect, it } from "vitest"
import { demoRows } from "../src/lib/demo.ts"
import { dateOf, parseCsv, toCsv } from "../src/lib/scores.ts"
import { compute } from "../src/lib/stats.ts"

const NOW = Date.UTC(2026, 9, 5, 12)
const rows = demoRows(NOW)

describe("the example scoreboard", () => {
  it("holds only valid scores", () => {
    expect(toCsv(parseCsv(toCsv(rows)))).toBe(toCsv(rows))
  })

  it("runs up to the puzzle of today", () => {
    expect(dateOf(Math.max(...rows.map(row => row.puzzle)))).toBe("2026-10-05")
  })

  it("is the same every time on the same day, and moves on the next day", () => {
    expect(demoRows(NOW + 3_600_000)).toEqual(rows)
    expect(demoRows(NOW + 86_400_000)).not.toEqual(rows)
  })

  it("fills the ranking, the awards, the duels and the outliers", () => {
    const { periods } = compute(rows)
    const ranked = periods.all.players.filter(player => player.qual)
    expect(ranked.length).toBeGreaterThanOrEqual(5)
    expect(periods.all.players.some(player => !player.qual)).toBe(true) // someone outside the ranking, to show that too
    expect(periods.all.awards.length).toBeGreaterThanOrEqual(12)
    expect(periods.all.hard).toHaveLength(5)
    expect(ranked.every(player => player.form !== null)).toBe(true)
  })
})
