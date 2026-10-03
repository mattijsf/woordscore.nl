// Finds the shared Woordle scores in the text of a WhatsApp export and returns them in the
// standard format. Nothing else from the chat is kept.
import type { Score } from "./scores.ts"
import { FAIL, dateOf, dayOf, isPlayerName, toDay } from "./scores.ts"

// Android writes "28-10-2025 07:55 - Name: text", iPhone "[28-10-2025, 07:55:12] Name: text".
const HEAD =
  /^\[?(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4}),? (\d{1,2})[:.](\d{2})(?:[:.]\d{2})?\]?(?: -)? (?:([^:]+): )?(.*)$/
const RESULT = /Woordle\s+(\d+)\s+([1-6Xx])\/6/
const ROW = /^[🟩🟨⬛⬜]{5}/u
const SQUARES: Record<string, string> = { "🟩": "G", "🟨": "Y" }
const MAX_DAYS_LATE = 7 // a score shared longer after its puzzle than this is taken for a typo

const two = (text: string): string => text.padStart(2, "0")

interface Message {
  date: string
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
      const [, day = "", month = "", year = "", hours = "", minutes = "", sender, body = ""] = head
      const name =
        sender
          ?.trim()
          .split(/\s+/)[0]
          ?.replace(/[^\p{L}-]/gu, "") ?? ""
      messages.push({
        date: `${year.length === 2 ? `20${year}` : year}-${two(month)}-${two(day)}`,
        time: `${two(hours)}:${minutes}`,
        player: name === "" ? null : name,
        lines: [body],
      })
    } else {
      messages.at(-1)?.lines.push(line)
    }
  }

  const rows: Score[] = []
  const seen = new Set<string>()
  let ignored = 0
  for (const { date, time, player, lines } of messages) {
    const result = player ? RESULT.exec(lines.join("\n")) : null
    if (!player || !result) {
      continue
    }
    const puzzle = Number(result[1])
    const turns = /x/i.test(result[2] ?? "") ? FAIL : Number(result[2])
    const late = toDay(date) - dayOf(puzzle)
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
    const fits =
      !grid.length ||
      (turns === FAIL
        ? grid.length === 6 && solvedAt === -1
        : grid.length === turns && solvedAt === turns - 1)
    if (!isPlayerName(player) || late < 0 || late > MAX_DAYS_LATE || !fits) {
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
      shared: `${date}T${time}`,
      grid: grid.join("/"),
    })
  }
  return { rows, ignored }
}
