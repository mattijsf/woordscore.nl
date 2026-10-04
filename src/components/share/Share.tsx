import { useRef, useState } from "react"
import { linkTo } from "../../lib/address.ts"
import { copyText } from "../../lib/clipboard.ts"
import { useBoardStore } from "../../store/useBoardStore.ts"
import { Info } from "../tips/Info.tsx"
import { Admin } from "./Admin.tsx"

/** The link to pass on, and renaming or removing the scoreboard. */
export function Share(): React.JSX.Element {
  const code = useBoardStore(state => state.code)
  const justStarted = useBoardStore(state => state.justStarted)
  const field = useRef<HTMLInputElement>(null)
  const link = location.origin + linkTo(code)
  const [status, setStatus] = useState(
    justStarted ? "Het scorebord is begonnen. Deel de code of de link in de groepschat." : ""
  )
  const copy = async (): Promise<void> => {
    const copied = await copyText(link, field.current)
    setStatus(
      copied
        ? "Link gekopieerd."
        : "Kopiëren lukte niet. De link is geselecteerd; kopieer hem zelf."
    )
  }
  return (
    <section id="share">
      <h2>
        Delen <Info tip="delen" name="delen" />
      </h2>
      <p className="hint">
        Iedereen met de code of deze link kan het scorebord bekijken, bijwerken, een andere naam
        geven en verwijderen.
      </p>
      <div className="upload">
        <input
          type="text"
          id="share-link"
          ref={field}
          className="field"
          readOnly
          aria-label="Link naar dit scorebord"
          value={link}
        />
        <button type="button" className="btn" id="share-copy" onClick={() => void copy()}>
          Kopieer link
        </button>
      </div>
      <p className="hint" id="share-status" role="status">
        {status}
      </p>
      <Admin />
    </section>
  )
}
