import { players } from "../../lib/players.ts"
import type { NameChoice } from "../../lib/upload.ts"
import { useBoardStore } from "../../store/useBoardStore.ts"
import { NameFields } from "./NameFields.tsx"

interface NameReviewProps {
  /** the names asked about */
  names: string[]
  /** whether a scoreboard starts: then every name is asked about, and it gets a name of its own */
  starting: boolean
  choices: Record<string, NameChoice>
  onChoice: (name: string, choice: NameChoice) => void
  title: string
  onTitle: (title: string) => void
}

/** The question per name, and when a scoreboard starts, its name. */
export function NameReview({
  names,
  starting,
  choices,
  onChoice,
  title,
  onTitle,
}: NameReviewProps): React.JSX.Element {
  const rows = useBoardStore(state => state.rows)
  const intro = starting
    ? "Zo komen de spelers op het scorebord te staan. Pas een naam aan als iemand anders moet heten dan in WhatsApp."
    : `${names.length === 1 ? "Deze naam staat" : "Deze namen staan"} nog niet op het scorebord. Kies of het een nieuwe speler is, of iemand die al meedoet onder een andere naam. Een nieuwe speler kun je een andere naam geven.`
  return (
    <div id="link-names">
      {/* the name of the scoreboard itself can be changed later; the names of the players cannot */}
      {starting ? (
        <label className="labelled">
          Naam van het scorebord
          <input
            type="text"
            id="start-title"
            className="field"
            maxLength={60}
            autoComplete="off"
            value={title}
            onChange={event => {
              onTitle(event.target.value)
            }}
          />
        </label>
      ) : null}
      <p className="hint">
        {intro} De keuze wordt bewaard, geldt ook bij een volgende export en kan niet ongedaan
        worden gemaakt.
      </p>
      <NameFields
        names={names}
        known={starting ? [] : players(rows).sort()}
        choices={choices}
        onChange={onChoice}
      />
    </div>
  )
}
