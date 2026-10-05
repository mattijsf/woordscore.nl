import { useEffect } from "react"
import type { Mode } from "../store/sessionSlice.ts"

/** Puts the mode on <body>, where the stylesheet sizes the logo and the title by it. */
export function useBodyMode(mode: Mode): void {
  useEffect(() => {
    document.body.dataset.mode = mode
  }, [mode])
}
