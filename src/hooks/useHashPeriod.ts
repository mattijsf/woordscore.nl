import { useEffect } from "react"
import { useBoardStore } from "../store/useBoardStore.ts"

/** Opens the period named in the address when the address changes, as with the back button. */
export function useHashPeriod(): void {
  const followHash = useBoardStore(state => state.followHash)
  useEffect(() => {
    addEventListener("hashchange", followHash)
    return () => {
      removeEventListener("hashchange", followHash)
    }
  }, [followHash])
}
