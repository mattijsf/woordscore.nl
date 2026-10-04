import { startPage } from "../../lib/address.ts"
import { players } from "../../lib/players.ts"
import { useBoardStore } from "../../store/useBoardStore.ts"
import { Info } from "../tips/Info.tsx"
import { ExportHowTo } from "./ExportHowTo.tsx"
import { LinkedNames } from "./LinkedNames.tsx"
import { NameLinks } from "./NameLinks.tsx"
import { useUpload } from "./useUpload.ts"

/** Starting a scoreboard under a free code, or adding a newer export to the one on show. */
export function Update(): React.JSX.Element {
  const code = useBoardStore(state => state.code)
  const starting = useBoardStore(state => state.mode === "new")
  const rows = useBoardStore(state => state.rows)
  const upload = useUpload()
  const { pending } = upload
  return (
    <section id="update">
      <h2>
        {starting ? (
          "Scorebord beginnen"
        ) : (
          <>
            Bijwerken <Info tip="upload" name="bijwerken" />
          </>
        )}
      </h2>
      {starting ? (
        <>
          <p className="hint">
            Onder de code <b>{code}</b> bestaat nog geen scorebord. Kies een export van de
            groepschat waarin jullie de scores delen om het te beginnen. Daarvoor zijn minstens 2
            scores nodig. De berichten blijven op je eigen apparaat. Alleen de scores worden
            bewaard, met de voornamen uit WhatsApp erbij.
          </p>
          <p className="hint">
            <a href={startPage()}>Een andere code invullen</a>
          </p>
        </>
      ) : (
        <p className="hint">
          Kies een export van de groepschat. De berichten blijven op je eigen apparaat. Alleen de
          scores worden bewaard, met de voornamen uit WhatsApp erbij.
        </p>
      )}
      <ExportHowTo />
      {starting ? (
        <label className="labelled">
          Naam van het scorebord
          <input
            type="text"
            id="group-name"
            className="field"
            maxLength={60}
            placeholder="Bijvoorbeeld: Woordle familie"
            autoComplete="off"
            value={upload.groupName}
            onChange={event => {
              upload.setGroupName(event.target.value)
            }}
          />
        </label>
      ) : null}
      <div className="upload">
        <label className="btn">
          Export kiezen
          <input
            type="file"
            id="upload"
            accept=".txt,.zip,text/plain,application/zip"
            hidden
            onChange={event => void upload.choose(event)}
          />
        </label>
      </div>
      <p className="hint" id="upload-status" role="status">
        {upload.status}
      </p>
      {pending && !pending.starting && pending.strangers.length ? (
        <NameLinks
          strangers={pending.strangers}
          known={players(rows).sort()}
          links={upload.links}
          onChange={upload.setLinks}
        />
      ) : null}
      <div className="upload">
        <button
          type="button"
          className="btn go"
          id="upload-confirm"
          hidden={!upload.canConfirm}
          onClick={() => void upload.confirm()}
        >
          {upload.confirmLabel}
        </button>
      </div>
      {starting ? null : <LinkedNames />}
    </section>
  )
}
