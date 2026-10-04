import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { App } from "./App.tsx"
import { tidyAddress } from "./lib/address.ts"
import { useBoardStore } from "./store/useBoardStore.ts"
import "./styles/app.css"

tidyAddress(useBoardStore.getState().code)

const root = document.getElementById("root")
if (!root) {
  throw new Error("index.html has no #root")
}
createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>
)
