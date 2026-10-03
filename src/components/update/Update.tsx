import type { ChangeEvent } from "react"
import { useState } from "react"
import config from "../../../data/config.json"
import { postScores } from "../../lib/api.ts"
import { readExport } from "../../lib/export-file.ts"
import { ni } from "../../lib/format.ts"
import type { Score } from "../../lib/scores.ts"
import { merge } from "../../lib/scores.ts"
import { parseChat } from "../../lib/whatsapp.ts"
import { useBoardStore } from "../../store/useBoardStore.ts"
import { Info } from "../tips/Info.tsx"

const messageOf = (error: unknown): string =>
  error instanceof Error ? error.message : String(error)

/** Takes the scores out of a chosen export and, once confirmed, keeps them on the server. */
export function Update(): React.JSX.Element {
  const [pending, setPending] = useState<{ rows: Score[]; added: number } | null>(null)
  const [status, setStatus] = useState("")

  const choose = async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = event.target.files?.[0]
    event.target.value = ""
    setPending(null)
    if (!file) {
      return
    }
    try {
      const found = parseChat(await readExport(file))
      const merged = merge(useBoardStore.getState().rows, found.rows)
      if (!found.rows.length) {
        setStatus("Geen Woordle-scores gevonden in dit bestand.")
      } else if (!merged.added) {
        setStatus(`${ni(found.rows.length)} scores gevonden; ze stonden er allemaal al in.`)
      } else {
        const last = Math.max(...found.rows.map(row => row.puzzle))
        setPending(merged)
        setStatus(
          `${ni(found.rows.length)} scores gevonden, waarvan ${ni(merged.added)} nieuw, tot en met puzzel ${last}.`
        )
      }
    } catch (error) {
      setStatus(`Dit bestand kon niet gelezen worden: ${messageOf(error)}.`)
    }
  }

  const confirm = async (): Promise<void> => {
    if (!pending) {
      return
    }
    const { show } = useBoardStore.getState()
    const { added, rows } = pending
    show(rows)
    setPending(null)
    try {
      if (!config.api) {
        throw new Error("deze pagina heeft geen server")
      }
      const kept = await postScores(config.api, rows)
      show(merge(useBoardStore.getState().rows, kept).rows)
      const { last } = useBoardStore.getState().data
      setStatus(
        `${ni(added)} nieuwe scores verwerkt en bewaard. Iedereen ziet nu de stand tot en met puzzel ${last}.`
      )
    } catch (error) {
      setStatus(
        `${ni(added)} nieuwe scores verwerkt op dit scherm, maar bewaren lukte niet (${messageOf(error)}). Na herladen is de oude stand terug.`
      )
    }
  }

  return (
    <section>
      <h2>
        Bijwerken <Info tip="upload" name="bijwerken" />
      </h2>
      <p className="hint">
        Kies een export van de groepschat. De berichten blijven op je eigen apparaat; alleen de
        scores worden bewaard.
      </p>
      <div className="upload">
        <label className="btn">
          Export kiezen
          <input
            type="file"
            id="upload"
            accept=".txt,.zip,text/plain,application/zip"
            hidden
            onChange={event => void choose(event)}
          />
        </label>
        <button
          type="button"
          className="btn go"
          id="upload-confirm"
          hidden={!pending}
          onClick={() => void confirm()}
        >
          Stand bijwerken
        </button>
      </div>
      <p className="hint" id="upload-status" role="status">
        {status}
      </p>
    </section>
  )
}
