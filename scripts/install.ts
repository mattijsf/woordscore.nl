#!/usr/bin/env node
// Puts the scoreboard into a built mattix.nl.
//
//   node ../woordle-scorebord/scripts/install.ts [dist] [functions]
//
// mattix.nl stays one Cloudflare Pages project with one deploy; this repo adds to it after
// `vite build` there, the way andamp-site does:
//
//   the page    -> <dist>/woordle-scorebord.html, built first
//   the server  -> <functions>/api/woordle/[[path]].js, a stub that points back at
//                  server/woordle.ts here; Pages bundles it on deploy. It needs the KV
//                  binding WOORDLE.
import { execFileSync } from "node:child_process"
import { copyFileSync, existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs"
import { join, relative, resolve } from "node:path"
import { projectPath } from "./lib/scores.ts"

const PAGE = "woordle-scorebord.html"
const dist = process.argv[2] ?? "dist"
const functions = process.argv[3] ?? "functions"

if (!existsSync(join(dist, "index.html"))) {
  console.error(`woordle-scorebord: ${dist} is geen gebouwde site; draai eerst vite build`)
  process.exit(1)
}

execFileSync("npm", ["run", "--silent", "build"], {
  cwd: projectPath("."),
  stdio: ["ignore", "ignore", "inherit"],
})
copyFileSync(projectPath("dist/index.html"), join(dist, PAGE))

const api = join(functions, "api", "woordle")
const server = relative(resolve(api), projectPath("server/woordle.ts"))
rmSync(join(functions, "api", "woordle.js"), { force: true }) // the stub from before there were codes
mkdirSync(api, { recursive: true })
writeFileSync(
  join(api, "[[path]].js"),
  `// Written by woordle-scorebord/scripts/install.ts.\nexport { onRequest } from '${server}';\n`
)
console.log(`woordle-scorebord: in ${dist}/${PAGE} en ${api}/[[path]].js`)
