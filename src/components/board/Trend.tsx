import { ranked } from "../../lib/ranking.ts"
import { useBoardStore } from "../../store/useBoardStore.ts"
import type { Period } from "../../types/board.ts"
import { Info } from "../tips/Info.tsx"
import { PlayerChip } from "./PlayerChip.tsx"
import { TrendChart } from "./TrendChart.tsx"

export function Trend({ period: P }: { period: Period }): React.JSX.Element {
  const focus = useBoardStore(state => state.focus)
  const toggleFocus = useBoardStore(state => state.toggleFocus)
  const withLine = ranked(P).filter(p => P.trend[p.name]?.some(v => v != null))
  return (
    <section>
      <h2>
        Verloop per maand <Info tip="verloop" name="verloop per maand" />
      </h2>
      <p className="hint">Gemiddelde per maand. Tik op een naam om die lijn uit te lichten.</p>
      <div className="chips">
        {withLine.map(p => (
          <PlayerChip
            key={p.name}
            name={p.name}
            pressed={focus === p.name}
            onClick={() => {
              toggleFocus(p.name)
            }}
          />
        ))}
      </div>
      <TrendChart period={P} focus={focus} />
    </section>
  )
}
