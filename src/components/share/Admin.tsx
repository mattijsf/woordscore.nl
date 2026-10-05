import { useState } from "react"
import { HOME } from "../../lib/address.ts"
import { toCode } from "../../lib/code.ts"
import { messageOf } from "../../lib/messages.ts"
import { useBoardStore } from "../../store/useBoardStore.ts"
import { IconSlot } from "../common/Icon.tsx"

/** Another name for the scoreboard, or removing it, which takes the code typed out. */
export function Admin(): React.JSX.Element {
  const code = useBoardStore(state => state.code)
  const title = useBoardStore(state => state.title)
  const keepName = useBoardStore(state => state.rename)
  const removeScoreboard = useBoardStore(state => state.removeScoreboard)
  const [name, setName] = useState(title)
  const [confirmation, setConfirmation] = useState("")
  const [status, setStatus] = useState("")

  const rename = async (): Promise<void> => {
    const wanted = name.trim()
    if (!wanted) {
      setStatus("Vul een naam in.")
      return
    }
    try {
      setName(await keepName(wanted))
      setStatus("De naam is gewijzigd.")
    } catch (error) {
      setStatus(`De naam wijzigen lukte niet: ${messageOf(error)}.`)
    }
  }
  const remove = async (): Promise<void> => {
    try {
      await removeScoreboard(toCode(confirmation))
      location.href = HOME
    } catch (error) {
      setStatus(`Verwijderen lukte niet: ${messageOf(error)}.`)
    }
  }

  return (
    <details className="how" id="admin">
      <summary>Naam wijzigen of scorebord verwijderen</summary>
      <label className="labelled" htmlFor="admin-title">
        Naam van het scorebord
      </label>
      <div className="upload">
        <input
          type="text"
          id="admin-title"
          className="field"
          maxLength={60}
          autoComplete="off"
          value={name}
          onChange={event => {
            setName(event.target.value)
          }}
        />
        <button type="button" className="btn" id="admin-rename" onClick={() => void rename()}>
          <IconSlot name="pencil" />
          Naam wijzigen
        </button>
      </div>
      <label className="labelled" htmlFor="admin-confirm">
        Scorebord verwijderen
      </label>
      <p>
        Alle scores en gekoppelde namen van dit scorebord worden gewist. Dat kan niet ongedaan
        worden gemaakt. Typ de code <b className="this-code">{code}</b> om te bevestigen.
      </p>
      <div className="upload">
        <input
          type="text"
          id="admin-confirm"
          className="field"
          autoComplete="off"
          autoCapitalize="none"
          spellCheck="false"
          value={confirmation}
          onChange={event => {
            setConfirmation(event.target.value)
          }}
        />
        {/* removing takes the code typed out, so that it cannot happen by a slip of the finger */}
        <button
          type="button"
          className="btn danger"
          id="admin-delete"
          disabled={toCode(confirmation) !== code}
          onClick={() => void remove()}
        >
          <IconSlot name="trash" />
          Scorebord verwijderen
        </button>
      </div>
      <p className="hint" id="admin-status" role="status">
        {status}
      </p>
    </details>
  )
}
