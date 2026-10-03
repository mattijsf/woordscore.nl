#!/usr/bin/env node
// Puts the scoreboard into a built mattix.nl, as <dist>/woordle-scorebord.html.
//
//   node ../woordle-scorebord/scripts/install.ts [dist]
//
// mattix.nl stays one Cloudflare Pages project with one deploy; this repo adds its single
// page after `vite build` there, the way andamp-site does. The page is rebuilt from
// data/scores.csv first, so what goes out always matches the scores in this repo.
import { execFileSync } from "node:child_process"
import { copyFileSync, existsSync } from "node:fs"
import { join } from "node:path"
import { projectPath } from "./lib/scores.ts"

const PAGE = "woordle-scorebord.html"
const dist = process.argv[2] ?? "dist"

if (!existsSync(join(dist, "index.html"))) {
  console.error(`woordle-scorebord: ${dist} is geen gebouwde site; draai eerst vite build`)
  process.exit(1)
}

execFileSync("npm", ["run", "--silent", "build"], {
  cwd: projectPath("."),
  stdio: ["ignore", "ignore", "inherit"],
})
copyFileSync(projectPath("dist/index.html"), join(dist, PAGE))
console.log(`woordle-scorebord: in ${dist}/${PAGE}`)
