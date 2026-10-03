import { data } from "../../lib/board.ts"
import { Term } from "../tips/Term.tsx"

export function Footer(): React.JSX.Element {
  const { first, last, periods } = data
  return (
    <footer>
      <p>
        Scores uit de groepschat, puzzel {first} ({periods.all.from_}) tot en met {last} (
        {periods.all.to}). <Term tip="bron">Waar komen de cijfers vandaan?</Term>
      </p>
    </footer>
  )
}
