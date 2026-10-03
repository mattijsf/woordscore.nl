import type { MouseEvent } from "react"
import { useTipStore } from "../../store/useTipStore.ts"

interface InfoProps {
  tip: string | undefined
  /** what the tip is about, for screen readers */
  name: string
}

/** The i button beside a heading or a figure, which opens its explanation. */
export function Info({ tip, name }: InfoProps): React.JSX.Element {
  const openTip = useTipStore(state => state.openTip)
  const onClick = (event: MouseEvent): void => {
    event.preventDefault()
    if (tip) {
      openTip(tip, false)
    }
  }
  return (
    <button type="button" className="info" aria-label={`Uitleg: ${name}`} onClick={onClick}>
      i
    </button>
  )
}
