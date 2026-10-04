import { NAME_RULES, nameAsTyped } from "../../lib/names.ts"
import type { NameChoice } from "../../lib/upload.ts"
import { choiceFor } from "../../lib/upload.ts"
import { CleanedInput } from "../common/CleanedInput.tsx"

interface NameFieldsProps {
  names: string[]
  /** the players the scoreboard knows; empty when it starts */
  known: string[]
  choices: Record<string, NameChoice>
  onChange: (name: string, choice: NameChoice) => void
}

/**
 * Each name the scoreboard has not seen gets a question: is this a player it knows under another
 * name, or a new player, and what should that player be called?
 */
export function NameFields({
  names,
  known,
  choices,
  onChange,
}: NameFieldsProps): React.JSX.Element {
  const fields = names.map(name => {
    const choice = choices[name] ?? choiceFor(name)
    return (
      <div key={name} className="who">
        <span>{name}</span>
        {known.length ? (
          <select
            className="field"
            value={choice.player}
            onChange={event => {
              onChange(name, { ...choice, player: event.target.value })
            }}
          >
            <option value="">Nieuwe speler, met de naam:</option>
            {known.map(player => (
              <option key={player} value={player}>
                Dezelfde speler als {player}
              </option>
            ))}
          </select>
        ) : null}
        <CleanedInput
          type="text"
          className="field"
          autoComplete="off"
          aria-label={`Naam op het scorebord voor ${name}`}
          hidden={Boolean(choice.player)}
          value={choice.field}
          clean={nameAsTyped}
          onValue={(cleaned, typed) => {
            // said right under the field it is about
            onChange(name, {
              ...choice,
              field: cleaned,
              note: cleaned === typed ? choice.note : NAME_RULES,
            })
          }}
        />
        <small role="status">{choice.note}</small>
      </div>
    )
  })
  return <>{fields}</>
}
