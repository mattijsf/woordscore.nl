import type { SyntheticEvent } from "react"
import { useState } from "react"
import { linkTo } from "../../lib/address.ts"
import { CODE_RULES, VALID_CODE, asTyped, losesCharacters, toCode } from "../../lib/code.ts"
import { useBoardStore } from "../../store/useBoardStore.ts"
import { CleanedInput } from "../common/CleanedInput.tsx"
import { RecentBoards } from "./RecentBoards.tsx"

/** Asks for the code of a scoreboard, and goes there. */
export function CodeForm(): React.JSX.Element {
  const code = useBoardStore(state => state.code)
  const codeMessage = useBoardStore(state => state.codeMessage)
  const [value, setValue] = useState(code)
  const [message, setMessage] = useState(codeMessage)
  const submit = (event: SyntheticEvent): void => {
    event.preventDefault()
    const next = toCode(value)
    if (!VALID_CODE.test(next)) {
      setMessage(CODE_RULES)
      return
    }
    location.href = linkTo(next)
  }
  return (
    <section>
      <h2>Scorebord openen of beginnen</h2>
      <p className="hint">
        <b>Openen:</b> vul de code van jullie scorebord in.
      </p>
      <p className="hint">
        <b>Nieuw beginnen:</b> verzin zelf een code. Als die nog vrij is, kun je daarna een export
        van de groepschat kiezen.
      </p>
      <form className="upload" id="enter" onSubmit={submit}>
        <CleanedInput
          type="text"
          id="code-field"
          className="field"
          placeholder="Code, bijvoorbeeld familie-jansen-42"
          autoComplete="off"
          autoCapitalize="none"
          spellCheck="false"
          aria-label="Code van het scorebord"
          value={value}
          clean={asTyped}
          onValue={(cleaned, typed) => {
            // say what a code may hold as soon as something typed or pasted could not be kept
            if (losesCharacters(typed)) {
              setMessage(`${CODE_RULES} Andere tekens worden weggelaten.`)
            } else if (!cleaned) {
              setMessage("")
            }
            setValue(cleaned)
          }}
        />
        <button type="submit" className="btn go">
          Verder
        </button>
      </form>
      <p className="hint" id="code-status" role="status">
        {message}
      </p>
      <RecentBoards />
    </section>
  )
}
