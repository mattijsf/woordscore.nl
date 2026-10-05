import react from "@vitejs/plugin-react"
import { readFile, writeFile } from "node:fs/promises"
import { join } from "node:path"
import type { Plugin } from "vite"
import { createServer, defineConfig } from "vite"

/** Folds the built script and stylesheet into index.html, so dist/ is that one file. */
function singleFile(): Plugin {
  const escape = (text: string): string => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  return {
    name: "single-file",
    enforce: "post",
    generateBundle(_, bundle) {
      const pages = Object.values(bundle).filter(file => file.fileName.endsWith(".html"))
      for (const [name, file] of Object.entries(bundle)) {
        const tag = new RegExp(
          `<(?:script|link)[^>]*(?:src|href)="\\./${escape(name)}"[^>]*>(?:</script>)?`
        )
        let inline: string
        if (file.type === "chunk") {
          inline = `<script type="module">${file.code.replaceAll("</script", "<\\/script")}</script>`
        } else if (name.endsWith(".css")) {
          inline = `<style>${String(file.source)}</style>`
        } else {
          continue
        }
        for (const page of pages) {
          if (page.type === "asset") {
            page.source = String(page.source).replace(tag, () => inline)
          }
        }
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete -- the bundle is a plain record of output files
        delete bundle[name]
      }
    },
  }
}

/**
 * Builds the start page into dist/index.html, so that search engines and link previews read it
 * without running the script. The page takes it over in place (src/main.tsx); server/page.ts
 * leaves it out at every other address.
 */
function prerender(): Plugin {
  let page = ""
  return {
    name: "prerender-start-page",
    apply: "build",
    configResolved(config) {
      page = join(config.root, config.build.outDir, "index.html")
    },
    async closeBundle() {
      const server = await createServer({
        server: { middlewareMode: true },
        appType: "custom",
        logLevel: "silent",
      })
      try {
        const { renderStartPage } = (await server.ssrLoadModule("/src/entry-server.tsx")) as {
          renderStartPage: () => string
        }
        const html = await readFile(page, "utf8")
        await writeFile(
          page,
          html
            .replace('<div id="root"></div>', `<div id="root">${renderStartPage()}</div>`)
            .replace('<body data-mode="loading">', '<body data-mode="start">')
        )
      } finally {
        await server.close()
      }
    },
  }
}

export default defineConfig({
  base: "./",
  plugins: [react(), singleFile(), prerender()],
  build: {
    assetsInlineLimit: () => true, // fonts and images become data: URLs
    cssCodeSplit: false,
    modulePreload: { polyfill: false },
  },
})
