import { HOME } from "../../lib/address.ts"
import { useBoardStore } from "../../store/useBoardStore.ts"

/** Said first under a code nobody uses: maybe it was mistyped. */
export function NoBoard(): React.JSX.Element {
  const code = useBoardStore(state => state.code)
  return (
    <section>
      <h2>Geen scorebord gevonden</h2>
      <p className="hint">
        Onder de code <b className="new-code">{code}</b> bestaat geen scorebord. Dit is een nieuwe
        code.
      </p>
      <p className="callout">
        Verwachtte je hier een scorebord? Dan klopt de code niet. Controleer of hij goed is
        overgetypt, of vraag in de groep om de link.
      </p>
      <p className="cta">
        <a className="btn" id="new-link-free" href={HOME}>
          Andere code invullen
        </a>
      </p>
    </section>
  )
}
