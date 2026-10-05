import { useBoardStore } from "../../store/useBoardStore.ts"
import type { Periods } from "../../types/board.ts"
import { Info } from "../tips/Info.tsx"

export function PeriodNav({ periods }: { periods: Periods }): React.JSX.Element {
  const period = useBoardStore(state => state.period)
  const choosePeriod = useBoardStore(state => state.choosePeriod)
  return (
    <nav className="period" aria-label="Periode">
      <div className="wrap">
        <div className="seg">
          {Object.entries(periods).map(([key, P]) => (
            <button
              key={key}
              type="button"
              aria-pressed={key === period}
              onClick={() => {
                choosePeriod(key)
              }}
            >
              {P.name}
            </button>
          ))}
        </div>
        <Info tip="periode" name="periode" />
      </div>
    </nav>
  )
}
