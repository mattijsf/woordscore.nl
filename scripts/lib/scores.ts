// data/scores.csv and data/config.json on disk, for the scripts.
import { existsSync, readFileSync, writeFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import type { Score } from "../../src/lib/scores.ts"
import { parseCsv, toCsv } from "../../src/lib/scores.ts"
import type { Config } from "../../src/lib/stats.ts"

const FILE = "data/scores.csv"

export const projectPath = (relative: string): string =>
  fileURLToPath(new URL(`../../${relative}`, import.meta.url))
export const readScores = (): Score[] =>
  existsSync(projectPath(FILE)) ? parseCsv(readFileSync(projectPath(FILE), "utf8"), FILE) : []
export const writeScores = (rows: Score[]): void => {
  writeFileSync(projectPath(FILE), toCsv(rows))
}
export const readConfig = (): Config =>
  JSON.parse(readFileSync(projectPath("data/config.json"), "utf8")) as Config

/** Runs a script's work and turns a thrown error into a one-line message. */
export async function run(work: () => void | Promise<void>): Promise<void> {
  try {
    await work()
  } catch (error) {
    console.error(error instanceof Error ? error.message : error)
    process.exit(1)
  }
}
