import type { MouseEvent, ReactNode } from "react"
import { use } from "react"
import { useTipStore } from "../../store/useTipStore.ts"
import { InSheet } from "./InSheet.ts"

interface TermProps {
  tip: string
  children: ReactNode
}

/** An underlined word that opens its explanation. */
export function Term({ tip, children }: TermProps): React.JSX.Element {
  const openTip = useTipStore(state => state.openTip)
  const deeper = use(InSheet)
  const onClick = (event: MouseEvent): void => {
    event.preventDefault() // a term inside a player's row must not fold the row open
    openTip(tip, deeper)
  }
  return (
    <button type="button" className="term" onClick={onClick}>
      {children}
    </button>
  )
}
