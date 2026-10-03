#!/usr/bin/env node
// Checks that data/scores.csv is valid and that every figure can be worked out from it.
// Runs before `dev` and `build`, so a bad line stops the build instead of breaking the page.
// Usage: npm run check
import { compute } from "../src/lib/stats.ts"
import { readConfig, readScores, run } from "./lib/scores.ts"

await run(() => {
  const rows = readScores()
  const { first, last, periods } = compute(rows, readConfig())
  console.log(
    `data/scores.csv: ${rows.length} potjes, puzzel ${first} t/m ${last} (${periods.all.to})`
  )
})
