import { useBoardStore } from "../../store/useBoardStore.ts"
import { IconSlot } from "../common/Icon.tsx"
import { Info } from "../tips/Info.tsx"
import { ExportHowTo } from "./ExportHowTo.tsx"
import { NameReview } from "./NameReview.tsx"
import { useUpload } from "./useUpload.ts"

/** Starting a scoreboard under a free code, or adding a newer export to the one on show. */
export function Update(): React.JSX.Element {
  const code = useBoardStore(state => state.code)
  const starting = useBoardStore(state => state.mode === "new")
  const upload = useUpload()
  const { pending } = upload
  return (
    <section id="update">
      <h2>
        {starting ? (
          "Nieuw scorebord beginnen?"
        ) : (
          <>
            Bijwerken <Info tip="upload" name="bijwerken" />
          </>
        )}
      </h2>
      {starting ? (
        <p className="hint">
          De code <b className="new-code">{code}</b> is nog niet in gebruik. Je kunt er dus een
          nieuw scorebord onder beginnen. Kies daarvoor een export van de groepschat waarin jullie
          de scores delen. Er zijn minstens 2 scores nodig; pas dan is de code van jullie. De
          berichten blijven op je eigen apparaat. Alleen de scores worden bewaard, met de voornamen
          uit WhatsApp erbij.
        </p>
      ) : (
        <p className="hint">
          Kies een export van de groepschat. De berichten blijven op je eigen apparaat. Alleen de
          scores worden bewaard, met de voornamen uit WhatsApp erbij.
        </p>
      )}
      <ExportHowTo />
      <div className="upload">
        <label className="btn go">
          <IconSlot name="upload" />
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
      {pending?.names.length ? (
        <NameReview
          names={pending.names}
          starting={starting}
          choices={upload.choices}
          onChoice={upload.setChoice}
          title={upload.title}
          onTitle={upload.setTitle}
        />
      ) : null}
      <div className="upload">
        <button
          type="button"
          className="btn go"
          id="upload-confirm"
          hidden={!upload.canConfirm}
          disabled={Boolean(upload.refused)}
          onClick={() => void upload.confirm()}
        >
          {upload.confirmLabel}
        </button>
      </div>
    </section>
  )
}
