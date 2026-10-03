#!/usr/bin/env node
// Adds the scores from a WhatsApp export to data/scores.csv and regenerates the page data.
// Scores already in the file stay as they are, so hand-made corrections survive a new import.
// Usage: npm run import -- "/path/to/WhatsApp-chat.txt"
import { readFileSync } from "node:fs"
import { generate } from "./generate.ts"
import type { Score } from "./lib/scores.ts"
import { FAIL, readScores, toDay, toIso, writeScores } from "./lib/scores.ts"

const HEAD = /^(\d\d)-(\d\d)-(\d{4}) (\d\d):(\d\d) - (?:([^:]+): )?(.*)$/
const RESULT = /Woordle\s+(\d+)\s+([1-6Xx])\/6/
const ROW = /^[🟩🟨⬛⬜]{5}/u
const SQUARES: Record<string, string> = { "🟩": "G", "🟨": "Y" }

interface Message {
  date: string
  time: string
  player: string | null
  lines: string[]
}

/** Every shared score in the export, in message order. */
function parse(text: string): Score[] {
  const messages: Message[] = []
  for (const line of text.replaceAll("‎", "").split(/\r?\n/)) {
    const head = HEAD.exec(line)
    if (head) {
      const [, dd = "", mm = "", yyyy = "", hours = "", minutes = "", sender, body = ""] = head
      const name =
        sender
          ?.trim()
          .split(/\s+/)[0]
          ?.replace(/[,<>&"']/g, "") ?? ""
      messages.push({
        date: `${yyyy}-${mm}-${dd}`,
        time: `${hours}:${minutes}`,
        player: name === "" ? null : name,
        lines: [body],
      })
    } else {
      messages.at(-1)?.lines.push(line)
    }
  }

  const found: Omit<Score, "date">[] = []
  const offsets = new Map<number, number>()
  for (const { date, time, player, lines } of messages) {
    const result = player ? RESULT.exec(lines.join("\n")) : null
    if (!player || !result) {
      continue
    }
    const puzzle = Number(result[1])
    const offset = toDay(date) - puzzle
    offsets.set(offset, (offsets.get(offset) ?? 0) + 1)
    const grid = lines
      .slice(1)
      .filter(line => ROW.test(line))
      .map(line =>
        Array.from(line)
          .slice(0, 5)
          .map(square => SQUARES[square] ?? "-")
          .join("")
      )
    found.push({
      puzzle,
      player,
      turns: /x/i.test(result[2] ?? "") ? FAIL : Number(result[2]),
      shared: `${date}T${time}`,
      grid: grid.slice(0, 6).join("/"),
    })
  }
  // Sharing after midnight shifts a day; the most common offset is the real one.
  const zero = [...offsets].sort((a, b) => b[1] - a[1])[0]?.[0] ?? 0
  return found.map(score => ({ ...score, date: toIso(zero + score.puzzle) }))
}

try {
  const input = process.argv[2]
  if (!input) {
    throw new Error('Gebruik: npm run import -- "/pad/naar/WhatsApp-chat.txt"')
  }
  const found = parse(readFileSync(input, "utf8"))
  if (!found.length) {
    throw new Error(`Geen Woordle-uitslagen gevonden in ${input}`)
  }

  const rows = readScores()
  const known = new Set(rows.map(row => `${row.player}|${row.puzzle}`))
  let added = 0
  for (const score of found) {
    const key = `${score.player}|${score.puzzle}`
    if (known.has(key)) {
      continue // already in the file, or shared twice: the first one counts
    }
    known.add(key)
    rows.push(score)
    added += 1
  }
  writeScores(rows)
  console.log(`data/scores.csv: ${added} nieuwe scores, ${rows.length} in totaal`)
  generate()
} catch (error) {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
}
