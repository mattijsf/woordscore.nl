import { useRef, useState } from "react"
import { linkTo } from "../../lib/address.ts"
import { copyText } from "../../lib/clipboard.ts"
import { storedKey } from "../../lib/storedKey.ts"
import { useBoardStore } from "../../store/useBoardStore.ts"
import { Info } from "../tips/Info.tsx"
import { Admin } from "./Admin.tsx"

/** The link to pass on, and what it takes to remove the scoreboard. */
export function Share(): React.JSX.Element {
  const code = useBoardStore(state => state.code)
  const startedWith = useBoardStore(state => state.startedWith)
  const field = useRef<HTMLInputElement>(null)
  const link = linkTo(code)
  const [status, setStatus] = useState(
    startedWith
      ? "Het scorebord is begonnen. Deel de code of de link in de groepschat. Bewaar ook de beheercode hieronder: alleen daarmee kun je het scorebord later verwijderen."
      : ""
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
        Delen <Info tip="delen" name="delen en beheer" />
      </h2>
      <p className="hint">
        Iedereen met de code of deze link kan het scorebord bekijken en bijwerken.
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
      <Admin initialKey={startedWith || storedKey.get(code)} open={Boolean(startedWith)} />
    </section>
  )
}
