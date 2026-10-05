// The start page as HTML, built into index.html when the site is built, so that it can be read
// without running the page's script. vite.config.ts calls this.
import { StrictMode } from "react"
import { renderToString } from "react-dom/server"
import { App } from "./App.tsx"

export const renderStartPage = (): string =>
  renderToString(
    <StrictMode>
      <App />
    </StrictMode>
  )
