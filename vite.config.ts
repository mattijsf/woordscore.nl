import react from "@vitejs/plugin-react"
import type { Plugin } from "vite"
import { defineConfig } from "vite"

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

export default defineConfig({
  base: "./",
  plugins: [react(), singleFile()],
  build: {
    assetsInlineLimit: () => true, // fonts and images become data: URLs
    cssCodeSplit: false,
    modulePreload: { polyfill: false },
  },
})
