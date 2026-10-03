import { nf } from "../../lib/format.ts"
import { WEEKDAYS } from "../../lib/weekdays.ts"
import { usePeriod } from "../../store/useViewStore.ts"
import { Info } from "../tips/Info.tsx"

/** The average of everyone per weekday: the lightest day green, the hardest grey. */
export function Weekdays(): React.JSX.Element {
  const P = usePeriod()
  const known = P.weekday.filter(v => v != null)
  const lo = Math.min(...known)
  const hi = Math.max(...known)
  const mark = (v: number | null): string => {
    if (known.length < 2) {
      return ""
    }
    if (v === lo) {
      return "lo"
    }
    return v === hi ? "hi" : ""
  }
  return (
    <section>
      <h2>
        Per weekdag <Info tip="weekdag" name="per weekdag" />
      </h2>
      <p className="hint">
        Gemiddeld aantal beurten van iedereen samen. Groen is de lichtste dag, grijs de zwaarste.
      </p>
      <div className="week">
        {P.weekday.map((v, i) => {
          const day = WEEKDAYS[i] ?? ""
          return (
            <div key={day} className={mark(v)}>
              {day.slice(0, 2)}
              <b title={`${day}: ${P.weekdayGames[i] ?? 0} potjes`}>{v == null ? "–" : nf(v)}</b>
            </div>
          )
        })}
      </div>
    </section>
  )
}
