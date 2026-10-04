import type { Period } from "../../types/board.ts"
import { Info } from "../tips/Info.tsx"
import { PuzzleTable } from "./PuzzleTable.tsx"

export function Outliers({ period: P }: { period: Period }): React.JSX.Element {
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
