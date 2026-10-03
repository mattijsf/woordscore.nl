#!/usr/bin/env node
// Adds the scores people uploaded on the site to data/scores.csv, so the repository keeps up
// with the server. Look at the result with `git diff` before committing: anyone can upload.
// Usage: npm run pull [-- https://mattix.nl/api/woordle]
import { merge, parseCsv } from "../src/lib/scores.ts"
import { readScores, run, writeScores } from "./lib/scores.ts"

await run(async () => {
  const url = process.argv[2] ?? "https://mattix.nl/api/woordle"
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`${url} antwoordt ${response.status}`)
  }
  const { rows, added } = merge(readScores(), parseCsv(await response.text(), url))
  writeScores(rows)
  console.log(`data/scores.csv: ${added} nieuwe scores van de site, ${rows.length} in totaal`)
})
