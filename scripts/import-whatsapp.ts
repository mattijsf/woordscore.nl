#!/usr/bin/env node
// Adds the scores from a WhatsApp export to data/scores.csv.
// Scores already in the file stay as they are, so hand-made corrections survive a new import.
// Usage: npm run import -- "/path/to/WhatsApp-chat.txt"
import { readFileSync } from "node:fs"
import { merge } from "../src/lib/scores.ts"
import { parseChat } from "../src/lib/whatsapp.ts"
import { readScores, run, writeScores } from "./lib/scores.ts"

await run(() => {
  const input = process.argv[2]
  if (!input) {
    throw new Error('Gebruik: npm run import -- "/pad/naar/WhatsApp-chat.txt"')
  }
  const found = parseChat(readFileSync(input, "utf8"))
  if (!found.rows.length) {
    throw new Error(`Geen Woordle-uitslagen gevonden in ${input}`)
  }
  const { rows, added } = merge(readScores(), found.rows)
  writeScores(rows)
  const skipped = found.ignored ? `, ${found.ignored} onbruikbare overgeslagen` : ""
  console.log(`data/scores.csv: ${added} nieuwe scores, ${rows.length} in totaal${skipped}`)
})
