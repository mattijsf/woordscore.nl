import type { MouseEvent } from "react"
import { useEffect, useMemo, useRef } from "react"
import { tips } from "../../content/tips.tsx"
import { useData } from "../../store/useBoardStore.ts"
import { useTipStore } from "../../store/useTipStore.ts"
import { InSheet } from "./InSheet.ts"

/** The sheet that shows one explanation at a time. */
export function TipSheet(): React.JSX.Element {
  const data = useData()
  const TIPS = useMemo(() => tips(data), [data])
  const trail = useTipStore(state => state.trail)
  const back = useTipStore(state => state.back)
  const close = useTipStore(state => state.close)
  const dialog = useRef<HTMLDialogElement>(null)
  const card = useRef<HTMLDivElement>(null)
  const key = trail.at(-1)
  const tip = key === undefined ? undefined : TIPS[key]

  useEffect(() => {
    const sheet = dialog.current
    if (tip && sheet && !sheet.open) {
      sheet.showModal()
    } else if (!tip && sheet?.open) {
      sheet.close()
    }
  }, [tip])
  useEffect(() => {
    card.current?.scrollTo({ top: 0 })
  }, [trail])

  const onClick = (event: MouseEvent): void => {
    if (event.target === event.currentTarget) {
      close() // a tap beside the sheet
    }
  }
  return (
    <dialog id="tip" ref={dialog} aria-labelledby="tip-title" onClose={close} onClick={onClick}>
      <InSheet value>
        <div className="tip-card" ref={card}>
          <div className="tip-head">
            <button type="button" id="tip-back" hidden={trail.length < 2} onClick={back}>
              ‹ Terug
            </button>
            <h3 id="tip-title">{tip?.title}</h3>
            <button type="button" id="tip-close" aria-label="Sluiten" onClick={close}>
              ×
            </button>
          </div>
          <div id="tip-body">{tip?.body}</div>
        </div>
      </InSheet>
    </dialog>
  )
}
