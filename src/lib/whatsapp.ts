// Finds the shared Woordle scores in the text of a WhatsApp export and returns them in the
// standard format. Nothing else from the chat is kept.
//
// The line WhatsApp puts before each message depends on the phone and its language:
//   28-10-2025 07:55 - Name: text          Dutch, Android
//   [28-10-2025, 07:55:12] Name: text      Dutch, iPhone
//   28.10.25, 07:55 - Name: text           German
//   10/28/25, 7:55 AM - Name: text         American
//   2025-10-28, 07:55 - Name: text         year first
// The score itself ("Woordle 1592 3/6" and the squares) comes from the game and is the same everywhere.
import type { Score } from "./scores.ts"
import { FAIL, dateOf, dayOf, isPlayerName, toDay } from "./scores.ts"

const HEAD =
  /^\[?(\d{1,4})[-/.](\d{1,2})[-/.](\d{1,4}),?\s(\d{1,2})[:.](\d{2})(?:[:.]\d{2})?(?:\s?([ap])\.?\s?m\.?)?\]?(?:\s-)?\s(?:([^:]+): )?(.*)$/i
const RESULT = /Woordle\s+(\d+)\s+([1-6Xx])\/6/
const ROW = /^[🟩🟨⬛⬜]{5}/u
const SQUARES: Record<string, string> = { "🟩": "G", "🟨": "Y" }
const MAX_DAYS_LATE = 7 // a score shared longer after its puzzle than this is taken for a typo
// where the day, the month and the year sit among the three numbers of a date
const ORDERS = { dmy: [0, 1, 2], mdy: [1, 0, 2], ymd: [2, 1, 0] } as const
type Order = keyof typeof ORDERS
type DateNumbers = [string, string, string]

const two = (text: string): string => text.padStart(2, "0")

function isoDate(numbers: DateNumbers, order: Order): string | null {
  const [day, month, year] = ORDERS[order].map(i => numbers[i])
  if (day === undefined || month === undefined || year === undefined) {
    return null
  }
  if (+month < 1 || +month > 12 || +day < 1 || +day > 31 || year.length === 3) {
    return null
  }
  return `${year.length <= 2 ? `20${two(year)}` : year}-${two(month)}-${two(day)}`
}
/** How many days after its puzzle a message was sent, or null when that is not a plausible score. */
function daysLate(date: string | null, puzzle: number): number | null {
  const late = date ? toDay(date) - dayOf(puzzle) : -1
  return late >= 0 && late <= MAX_DAYS_LATE ? late : null
}

interface Message {
  numbers: DateNumbers
  time: string
  player: string | null
  lines: string[]
}

export interface Chat {
  /** every shared score, in message order */
  rows: Score[]
  /** results that could not be a real score */
  ignored: number
}

export function parseChat(text: string): Chat {
  const messages: Message[] = []
  for (const line of text.replace(/[\u200e\u200f\u202a-\u202e\ufeff]/g, "").split(/\r?\n/)) {
    const head = HEAD.exec(line)
    if (head) {
      const [, a = "", b = "", c = "", hours = "", minutes = "", half, sender, body = ""] = head
      const hour = half ? (+hours % 12) + (half.toLowerCase() === "p" ? 12 : 0) : +hours
      const name =
        sender
          ?.trim()
          .split(/\s+/)[0]
          ?.replace(/[^\p{L}-]/gu, "") ?? ""
      messages.push({
        numbers: [a, b, c],
        time: `${two(String(hour))}:${minutes}`,
        player: name === "" ? null : name,
        lines: [body],
      })
    } else {
      messages.at(-1)?.lines.push(line)
    }
  }
  const shared = messages.flatMap(message => {
    const result = message.player ? RESULT.exec(message.lines.join("\n")) : null
    return message.player && result
      ? [{ ...message, player: message.player, puzzle: Number(result[1]), turns: result[2] ?? "" }]
      : []
  })

  // 3/10 is 3 October on one phone and 10 March on another. The puzzle number says which day
  // it was, so the order that puts the most scores on the day of their puzzle is the right one.
  const fits = (order: Order): number =>
    shared.filter(m => daysLate(isoDate(m.numbers, order), m.puzzle) !== null).length
  const orders: Order[] = ["dmy", "mdy", "ymd"]
  const order = orders.reduce((best, candidate) =>
    fits(candidate) > fits(best) ? candidate : best
  )

  const rows: Score[] = []
  const seen = new Set<string>()
  let ignored = 0
  for (const { numbers, time, player, lines, puzzle, turns: result } of shared) {
    const turns = /x/i.test(result) ? FAIL : Number(result)
    const date = isoDate(numbers, order)
    const grid = lines
      .slice(1)
      .filter(line => ROW.test(line))
      .map(line =>
        Array.from(line)
          .slice(0, 5)
          .map(square => SQUARES[square] ?? "-")
          .join("")
      )
    const solvedAt = grid.indexOf("GGGGG")
    const matches =
      !grid.length ||
      (turns === FAIL
        ? grid.length === 6 && solvedAt === -1
        : grid.length === turns && solvedAt === turns - 1)
    if (!isPlayerName(player) || daysLate(date, puzzle) === null || !matches) {
      ignored += 1
      continue
    }
    if (seen.has(`${player}|${puzzle}`)) {
      continue // shared twice: the first one counts
    }
    seen.add(`${player}|${puzzle}`)
    rows.push({
      puzzle,
      date: dateOf(puzzle),
      player,
      turns,
      shared: `${date ?? ""}T${time}`,
      grid: grid.join("/"),
    })
  }
  return { rows, ignored }
}
