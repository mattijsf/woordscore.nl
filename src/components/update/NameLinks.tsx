import type { Aliases } from "../../lib/api.ts"

interface NameLinksProps {
  /** the names the scoreboard does not know */
  strangers: string[]
  /** the players it does know */
  known: string[]
  links: Aliases
  onChange: (links: Aliases) => void
}

/**
 * A name the scoreboard has not seen may be a new player, or a player it knows under another
 * name. The visitor says which, per name; a link is kept, so the question comes only once.
 */
export function NameLinks({
  strangers,
  known,
  links,
  onChange,
}: NameLinksProps): React.JSX.Element {
  const choose = (name: string, player: string): void => {
    const next = { ...links }
    if (player) {
      next[name] = player
    } else {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete -- the links are keyed by name
      delete next[name]
    }
    onChange(next)
  }
  return (
    <div id="link-names">
      <p className="hint">
        {strangers.length === 1 ? "Deze naam staat" : "Deze namen staan"} nog niet op het scorebord.
        Kies of het een nieuwe speler is, of iemand die al meedoet onder een andere naam. Een
        koppeling wordt bewaard en geldt ook bij een volgende export. Ze kan niet ongedaan worden
        gemaakt.
      </p>
      {strangers.map(name => (
        <label key={name} className="labelled">
          {name}
          <select
            className="field"
            value={links[name] ?? ""}
            onChange={event => {
              choose(name, event.target.value)
            }}
          >
            <option value="">Nieuwe speler</option>
            {known.map(player => (
              <option key={player} value={player}>
                Dezelfde speler als {player}
              </option>
            ))}
          </select>
        </label>
      ))}
    </div>
  )
}
