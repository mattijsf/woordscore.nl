import type { SyntheticEvent } from "react"
import { useState } from "react"
import { CODE_RULES, VALID_CODE, toCode } from "../../lib/code.ts"
import { useBoardStore } from "../../store/useBoardStore.ts"

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
    location.search = `?g=${next}`
  }
  return (
    <section>
      <h2>Open jullie scorebord</h2>
      <p className="hint">
        Vul de code van jullie scorebord in. Nog geen scorebord? Kies zelf een code. Is die nog
        vrij, dan kun je het scorebord beginnen.
      </p>
      <form className="upload" id="enter" onSubmit={submit}>
        <input
          type="text"
          id="code-field"
          className="field"
          placeholder="Code, bijvoorbeeld familie-jansen-42"
          autoComplete="off"
          autoCapitalize="none"
          spellCheck="false"
          aria-label="Code van het scorebord"
          value={value}
          onChange={event => {
            setValue(event.target.value)
          }}
        />
        <button type="submit" className="btn go">
          Openen
        </button>
      </form>
      <p className="hint" id="code-status" role="status">
        {message}
      </p>
    </section>
  )
}
