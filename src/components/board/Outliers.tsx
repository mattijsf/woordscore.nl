import { usePeriod } from "../../store/useViewStore.ts"
import { Info } from "../tips/Info.tsx"
import { PuzzleTable } from "./PuzzleTable.tsx"

export function Outliers(): React.JSX.Element {
  const P = usePeriod()
  return (
    <section>
      <h2>
        Uitschieters <Info tip="uitschieters" name="uitschieters" />
      </h2>
      <p className="hint">De puzzels met het hoogste en het laagste gemiddelde.</p>
      <h3>Zwaarste puzzels</h3>
      <PuzzleTable period={P} puzzles={P.hard} />
      <h3>Makkelijkste puzzels</h3>
      <PuzzleTable period={P} puzzles={P.easy} />
    </section>
  )
}
