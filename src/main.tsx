import { StrictMode } from "react"
import { createRoot, hydrateRoot } from "react-dom/client"
import { App } from "./App.tsx"
import { tidyAddress } from "./lib/address.ts"
import { useBoardStore } from "./store/useBoardStore.ts"
import "./styles/app.css"

const { code, mode } = useBoardStore.getState()
tidyAddress(code)

const root = document.getElementById("root")
if (!root) {
  throw new Error("index.html has no #root")
}
const app = (
  <StrictMode>
    <App />
  </StrictMode>
)
// the start page comes built into index.html; any other page is made here
if (mode === "start" && root.firstElementChild) {
  hydrateRoot(root, app)
} else {
  root.replaceChildren()
  createRoot(root).render(app)
}
