import { data } from "../../lib/board.ts"
import { usePeriod } from "../../store/useViewStore.ts"
import { PuzzleTable } from "./PuzzleTable.tsx"

export function Outliers(): React.JSX.Element {
  const P = usePeriod()
  return (
    <section>
      <h2>Uitschieters</h2>
      <p className="hint">
        Puzzels waar minstens {data.rules.minOutlier} van jullie aan meededen. Groen is de beste
        score van die dag.
      </p>
      <h3>Zwaarste puzzels</h3>
      <PuzzleTable period={P} puzzles={P.hard} />
      <h3>Makkelijkste puzzels</h3>
      <PuzzleTable period={P} puzzles={P.easy} />
    </section>
  )
}
