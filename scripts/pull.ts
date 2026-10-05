#!/usr/bin/env node
// Adds the scores of one scoreboard on woordscore.nl to data/scores.csv, as a copy to keep.
// The names are the ones on the scoreboard. Look at the result with `git diff` before
// committing: anyone who knows the code can add scores.
// Usage: npm run pull -- <code>
import { merge, parseCsv } from "../src/lib/scores.ts"
import { readScores, run, writeScores } from "./lib/scores.ts"

await run(async () => {
  const code = process.argv[2]
  if (!code) {
    throw new Error("Gebruik: npm run pull -- <code van het scorebord>")
  }
  const url = `https://woordscore.nl/api/woordle/${code}`
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`${url} antwoordt ${response.status}`)
  }
  const { rows, added } = merge(readScores(), parseCsv(await response.text(), url))
  writeScores(rows)
  console.log(`data/scores.csv: ${added} nieuwe scores van het scorebord, ${rows.length} in totaal`)
})
