import { HOME } from "../../lib/address.ts"

/** Said above the example, so that nobody takes its players for real ones. */
export function DemoNotice(): React.JSX.Element {
  return (
    <section>
      <p className="callout">Dit is een voorbeeld. De spelers en hun scores zijn verzonnen.</p>
      <p className="cta">
        <a className="btn go" href={HOME}>
          Open of begin je eigen scorebord
        </a>
      </p>
    </section>
  )
}
