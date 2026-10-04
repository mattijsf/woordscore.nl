import { HOME } from "../../lib/address.ts"
import type { BoardData } from "../../types/board.ts"
import { Term } from "../tips/Term.tsx"

export function Footer({ data }: { data: BoardData }): React.JSX.Element {
  const { first, last, periods } = data
  return (
    <footer>
      <p>
        Scores uit de groepschat, puzzel {first} ({periods.all.from_}) tot en met {last} (
        {periods.all.to}). <Term tip="bron">Waar komen de cijfers vandaan?</Term>
      </p>
      <p>
        Woordscore · <a href={HOME}>Een ander scorebord openen</a> ·{" "}
        <a href="https://woordle.nl" rel="noopener">
          Woordle spelen op woordle.nl
        </a>
      </p>
    </footer>
  )
}
