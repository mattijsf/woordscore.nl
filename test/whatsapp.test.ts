// Reading shared scores out of a WhatsApp export, whatever the phone and its language.
import { describe, expect, it } from "vitest"
import { FAIL } from "../src/lib/scores.ts"
import type { Chat } from "../src/lib/whatsapp.ts"
import { parseChat } from "../src/lib/whatsapp.ts"
import { shared } from "./helpers.ts"

const GRID = "-Y--Y/---YY/GGGGG"
const one = (head: string, puzzle = 1932): Chat => parseChat(shared(head, puzzle, 3, GRID))

describe("the line before each message", () => {
  it.each([
    ["Dutch, Android", "03-10-2026 08:50 - Sanne V: ", "2026-10-03T08:50"],
    ["Dutch, iPhone", "[03-10-2026, 08:50:12] Sanne V: ", "2026-10-03T08:50"],
    ["German", "03.10.26, 08:50 - Sanne V: ", "2026-10-03T08:50"],
    ["British", "03/10/2026, 08:50 - Sanne V: ", "2026-10-03T08:50"],
    ["American, morning", "10/3/26, 8:50 AM - Sanne V: ", "2026-10-03T08:50"],
    ["American, evening, iPhone", "[10/3/26, 8:50:12 PM] Sanne V: ", "2026-10-03T20:50"],
    ["American with a narrow space before PM", "10/3/26, 8:50 PM - Sanne V: ", "2026-10-03T20:50"],
    ["p.m. written with dots", "3/10/2026, 8:50 p.m. - Sanne V: ", "2026-10-03T20:50"],
    ["noon", "10/3/26, 12:05 PM - Sanne V: ", "2026-10-03T12:05"],
    ["year first, dashes", "2026-10-03, 08:50 - Sanne V: ", "2026-10-03T08:50"],
    ["year first, slashes", "2026/10/03, 08:50 - Sanne V: ", "2026-10-03T08:50"],
  ])("reads %s", (_, head, moment) => {
    const { rows, ignored } = one(head)
    expect(ignored).toBe(0)
    expect(rows).toEqual([
      { puzzle: 1932, date: "2026-10-03", player: "Sanne", turns: 3, shared: moment, grid: GRID },
    ])
  })

  it("takes just after midnight in AM/PM as the next day at 00:05", () => {
    expect(one("10/4/26, 12:05 AM - Sanne V: ").rows[0]?.shared).toBe("2026-10-04T00:05")
  })

  it("works out whether the day or the month comes first from the puzzle numbers", () => {
    const dayFirst = parseChat(
      [
        shared("03/10/2026, 08:50 - Anna: ", 1932, 3, GRID),
        shared("04/10/2026, 08:50 - Anna: ", 1933, 3, GRID),
      ].join("\n")
    )
    const monthFirst = parseChat(
      [
        shared("10/03/2026, 08:50 - Anna: ", 1932, 3, GRID),
        shared("10/04/2026, 08:50 - Anna: ", 1933, 3, GRID),
      ].join("\n")
    )
    expect(dayFirst.rows.map(row => row.shared)).toEqual(["2026-10-03T08:50", "2026-10-04T08:50"])
    expect(monthFirst.rows.map(row => row.shared)).toEqual(["2026-10-03T08:50", "2026-10-04T08:50"])
  })
})

describe("what counts as a shared score", () => {
  it("dates a score by its puzzle, also when it was shared after midnight", () => {
    const { rows } = one("04-10-2026 00:10 - Anna: ")
    expect(rows[0]).toMatchObject({ date: "2026-10-03", shared: "2026-10-04T00:10" })
  })

  it("keeps the first word of the name, letters only", () => {
    expect(one("03-10-2026 08:50 - Iris de Wit: ").rows[0]?.player).toBe("Iris")
    expect(one("03-10-2026 08:50 - ~ Jan-Willem 🙂: ").rows[0]?.player).toBe("Jan-Willem")
  })

  it("keeps the whole name of two senders who share a first name", () => {
    const text = [
      shared("03-10-2026 08:50 - Jan de Vries: ", 1932, 3, GRID),
      shared("03-10-2026 09:10 - Jan Bakker: ", 1932, 3, GRID),
      shared("03-10-2026 09:30 - Anna Smit: ", 1932, 3, GRID),
    ].join("\n")
    expect(parseChat(text).rows.map(row => row.player)).toEqual([
      "Jan de Vries",
      "Jan Bakker",
      "Anna",
    ])
  })

  it("reads X/6 as not solved", () => {
    const { rows } = parseChat(
      shared("03-10-2026 08:50 - Anna: ", 1932, "X", "-----/-----/-----/-----/-----/GGGG-")
    )
    expect(rows[0]?.turns).toBe(FAIL)
  })

  it("finds a score after other text, and squares followed by a remark", () => {
    const text =
      "03-10-2026 09:55 - Lotte: Bijna vergeten😅Woordle 1932 2/6\n\n⬜🟩🟩🟩⬜\n🟩🟩🟩🟩🟩 Ha"
    expect(parseChat(text).rows[0]).toMatchObject({
      player: "Lotte",
      turns: 2,
      grid: "-GGG-/GGGGG",
    })
  })

  it("keeps nothing of ordinary messages and notices", () => {
    const text = [
      "27-10-2025 15:33 - Iris heeft de groep Woordle gemaakt",
      "03-10-2026 08:00 - Anna: Goedemorgen!\nwie speelt er mee?",
      "03-10-2026 08:01 - Anna: <Media weggelaten>",
      shared("03-10-2026 08:50 - Anna: ", 1932, 3, GRID),
    ].join("\n")
    expect(parseChat(text)).toEqual({
      rows: [expect.objectContaining({ player: "Anna", puzzle: 1932 })],
      ignored: 0,
    })
  })

  it("strips the invisible marks WhatsApp puts in a line", () => {
    expect(one("‎03-10-2026 08:50 - ‎Anna: ").rows).toHaveLength(1)
  })

  it("counts the first when a score is shared twice", () => {
    const text = [
      shared("03-10-2026 08:50 - Anna: ", 1932, 3, GRID),
      shared("03-10-2026 21:00 - Anna: ", 1932, 2, "-----/GGGGG"),
    ].join("\n")
    expect(parseChat(text)).toEqual({
      rows: [expect.objectContaining({ turns: 3, shared: "2026-10-03T08:50" })],
      ignored: 0,
    })
  })

  it.each([
    ["squares that do not fit the result", shared("03-10-2026 08:50 - Anna: ", 1932, 4, GRID)],
    ["a score shared before its puzzle", shared("01-10-2026 08:50 - Anna: ", 1932, 3, GRID)],
    ["a score shared more than a week late", shared("12-10-2026 08:50 - Anna: ", 1932, 3, GRID)],
    [
      "a sender who is only a phone number",
      shared("03-10-2026 08:50 - +31 6 12345678: ", 1932, 3, GRID),
    ],
  ])("skips %s", (_, text) => {
    expect(parseChat(text)).toEqual({ rows: [], ignored: 1 })
  })

  it("still takes a score shared a week late", () => {
    expect(one("10-10-2026 08:50 - Anna: ").rows).toHaveLength(1)
  })
})
