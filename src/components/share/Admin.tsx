import { useState } from "react"
import { startPage } from "../../lib/address.ts"
import { messageOf } from "../../lib/messages.ts"
import { useBoardStore } from "../../store/useBoardStore.ts"

interface AdminProps {
  /** the key to fill in: the one handed out on this device, if any */
  initialKey: string
  open: boolean
}

/** Removing the scoreboard, which takes the key handed out when it was started. */
export function Admin({ initialKey, open }: AdminProps): React.JSX.Element {
  const title = useBoardStore(state => state.title)
  const removeScoreboard = useBoardStore(state => state.removeScoreboard)
  const [key, setKey] = useState(initialKey)
  const [status, setStatus] = useState("")
  const remove = async (): Promise<void> => {
    if (!key.trim()) {
      setStatus("Vul eerst de beheercode in.")
      return
    }
    if (!confirm(`“${title}” met alle scores verwijderen? Dat kan niet ongedaan worden gemaakt.`)) {
      return
    }
    try {
      await removeScoreboard(key.trim())
      location.href = startPage()
    } catch (error) {
      setStatus(`Verwijderen lukte niet: ${messageOf(error)}.`)
    }
  }
  return (
    <details className="how" id="admin" open={open}>
      <summary>Beheer</summary>
      <p>
        Met de beheercode kun je dit scorebord verwijderen. Wie het scorebord begon, kreeg die code.
        Op dat apparaat is hij hieronder al ingevuld.
      </p>
      <div className="upload">
        <input
          type="text"
          id="admin-key"
          className="field"
          placeholder="Beheercode"
          autoComplete="off"
          aria-label="Beheercode"
          value={key}
          onChange={event => {
            setKey(event.target.value)
          }}
        />
        <button type="button" className="btn" id="admin-delete" onClick={() => void remove()}>
          Scorebord verwijderen
        </button>
      </div>
      <p className="hint" id="admin-status" role="status">
        {status}
      </p>
    </details>
  )
}
