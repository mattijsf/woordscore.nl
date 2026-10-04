import { AWARD_TIPS } from "../../content/awards.ts"
import type { Period } from "../../types/board.ts"
import { Info } from "../tips/Info.tsx"

export function Awards({ period: P }: { period: Period }): React.JSX.Element {
  return (
    <section>
      <h2>
        Prijzenkast <Info tip="prijzen" name="prijzenkast" />
      </h2>
      <div className="awards">
        {P.awards.map(a => (
          <div key={a.title} className={a.title === "In één keer raak" ? "award wide" : "award"}>
            <span className="t">
              {a.title}
              <Info tip={AWARD_TIPS[a.title]} name={a.title} />
            </span>
            <span className="v">{a.value}</span>
            <span className="w">{a.who}</span>
            <span className="n">{a.note}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
