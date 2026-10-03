import { PERIOD_KEYS, periodOf } from "../../lib/board.ts"
import { useViewStore } from "../../store/useViewStore.ts"

export function PeriodNav(): React.JSX.Element {
  const period = useViewStore(state => state.period)
  const choosePeriod = useViewStore(state => state.choosePeriod)
  return (
    <nav className="period" aria-label="Periode">
      <div className="wrap">
        <div className="seg">
          {PERIOD_KEYS.map(key => (
            <button
              key={key}
              type="button"
              aria-pressed={key === period}
              onClick={() => {
                choosePeriod(key)
              }}
            >
              {periodOf(key).name}
            </button>
          ))}
        </div>
      </div>
    </nav>
  )
}
