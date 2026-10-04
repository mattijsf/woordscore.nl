import { CodeForm } from "./CodeForm.tsx"
import { HowItWorks } from "./HowItWorks.tsx"
import { Preview } from "./Preview.tsx"

/** The page without a code: what Woordscore is, and where to fill in a code. */
export function StartPage(): React.JSX.Element {
  return (
    <>
      <CodeForm />
      <HowItWorks />
      <Preview />
      <footer>
        <p>
          Woordle speel je op{" "}
          <a href="https://woordle.nl" rel="noopener">
            woordle.nl
          </a>
          . Woordscore is een los project en hoort daar niet bij.
        </p>
      </footer>
    </>
  )
}
