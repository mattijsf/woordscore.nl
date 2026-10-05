import { useRef, useState } from "react"
import { flushSync } from "react-dom"
import { linkTo } from "../../lib/address.ts"
import { nf } from "../../lib/format.ts"
import { ranked } from "../../lib/ranking.ts"
import { useBoardStore } from "../../store/useBoardStore.ts"
import type { Period } from "../../types/board.ts"
import { IconSlot } from "../common/Icon.tsx"

const COPIED = "De stand is gekopieerd. Plak hem in de groepschat."

interface ShareStandingProps {
  period: Period
  /** the last puzzle on the scoreboard */
  last: number
}

/** The standing of the chosen period as a short message, for the group chat. */
export function ShareStanding({ period: P, last }: ShareStandingProps): React.JSX.Element {
  const code = useBoardStore(state => state.code)
  const title = useBoardStore(state => state.title)
  const [status, setStatus] = useState("")
  const [shown, setShown] = useState<string | null>(null)
  const field = useRef<HTMLTextAreaElement>(null)

  const standing = (): string => {
    const lines = ranked(P)
      .filter(p => p.qual)
      .map((p, i) => `${i + 1}. ${p.name} ${nf(p.avg)}`)
    const when = P.kind === "all" ? "" : ` ${P.name}`
    return [
      `${title}, de stand${when}`,
      ...lines,
      `Gemiddeld aantal beurten, tot en met puzzel ${last}.`,
      location.origin + linkTo(code),
    ].join("\n")
  }

  const share = async (): Promise<void> => {
    const text = standing()
    try {
      if ("share" in navigator) {
        await navigator.share({ text })
        setStatus("")
        return
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return // the share sheet was closed
      }
    }
    try {
      await navigator.clipboard.writeText(text)
      setStatus(COPIED)
    } catch {
      // no share sheet and no clipboard, as on a plain http address: show it to copy by hand
      flushSync(() => {
        setShown(text)
      })
      field.current?.select()
      // eslint-disable-next-line @typescript-eslint/no-deprecated -- the one way left without clipboard access
      const copied = document.execCommand("copy")
      setStatus(copied ? COPIED : "Kopieer de tekst hieronder en plak hem in de groepschat.")
    }
  }

  return (
    <>
      <div className="upload">
        <button type="button" className="btn go" id="share-standing" onClick={() => void share()}>
          <IconSlot name="share" />
          Deel de stand
        </button>
      </div>
      <p className="hint" id="standing-status" role="status">
        {status}
      </p>
      <textarea
        id="standing-text"
        className="field"
        rows={8}
        readOnly
        hidden={shown === null}
        aria-label="De stand als bericht"
        ref={field}
        value={shown ?? ""}
      />
    </>
  )
}
