import { COLORS } from "../../lib/board.ts"
import { nf, share } from "../../lib/format.ts"
import { WEEKDAYS } from "../../lib/weekdays.ts"
import type { Period, Player } from "../../types/board.ts"
import { Term } from "../tips/Term.tsx"

const turnsLabel = (i: number): string => (i < 6 ? String(i + 1) : "X")
/** The best and the hardest weekday, once a player has an average for at least two. */
function weekdayExtremes(p: Player): { best: string; worst: string } | null {
  const days = p.weekdays.flatMap((v, i) => (v == null ? [] : [{ v, day: WEEKDAYS[i] ?? "" }]))
  const [head] = days
  if (!head || days.length < 2) {
    return null
  }
  const best = days.reduce((a, b) => (b.v < a.v ? b : a), head)
  const worst = days.reduce((a, b) => (b.v > a.v ? b : a), head)
  return { best: `${best.day} (${nf(best.v)})`, worst: `${worst.day} (${nf(worst.v)})` }
}

const days = (n: number): string => `${n} ${n === 1 ? "dag" : "dagen"}`

interface PlayerRowProps {
  player: Player
  period: Period
  /** place in the ranking, or null when outside it */
  rank: number | null
}

/** One player: the main figures, and everything else when opened. */
export function PlayerRow({ player: p, period: P, rank }: PlayerRowProps): React.JSX.Element {
  const most = Math.max(...p.dist)
  const week = weekdayExtremes(p)
  const label = `Verdeling: ${p.dist.map((c, i) => `${i < 6 ? i + 1 : "niet geraden"}: ${c}`).join(", ")}`
  return (
    <details className="row">
      <summary>
        <span className={`rank ${rank ? `r${rank}` : "out"}`}>{rank ?? "–"}</span>
        <span>
          <span className="name">
            <i className="dot" style={{ background: COLORS[p.name] }} />
            {p.name}
          </span>
          <span className="facts">
            <span>
              <b>{p.games}</b> <Term tip="potje">potjes</Term>
            </span>
            <span>
              <b>{share(p.solved, p.games)}</b> <Term tip="geraden">geraden</Term>
            </span>
            <span>
              <b>{p.wins}</b> <Term tip="dagzege">dagzeges</Term>
            </span>
          </span>
        </span>
        <span className="avg">
          {nf(p.avg)}
          <small>
            <Term tip="gemiddelde">gemiddeld</Term>
          </small>
        </span>
        <span className="stack" role="img" aria-label={label}>
          {p.dist.map((c, i) =>
            c ? (
              <i key={i} className={`s${i + 1}`} style={{ flex: `${c} 0 0` }}>
                {c / p.games >= 0.075 ? turnsLabel(i) : ""}
              </i>
            ) : null
          )}
        </span>
        <span className="toggle">
          <span className="o">Meer cijfers</span>
          <span className="c">Minder cijfers</span>
          {p.qual ? null : (
            <>
              {" "}
              (te weinig potjes voor het <Term tip="klassement">klassement</Term>)
            </>
          )}
        </span>
      </summary>
      <div className="more">
        <div className="hist">
          {p.dist.map((c, i) => (
            <div key={i}>
              {turnsLabel(i)}
              <span className={`s${i + 1}`} style={{ width: `${most ? (c / most) * 100 : 0}%` }}>
                {c}
              </span>
            </div>
          ))}
        </div>
        <dl>
          <dt>
            <Term tip="deelname">Deelname</Term>
          </dt>
          <dd>{share(p.games, P.puzzles)} van de puzzels</dd>
          <dt>
            <Term tip="alleen">Dagzeges alleen</Term>
          </dt>
          <dd>{p.solo}</dd>
          <dt>
            <Term tip="reeks">Langste reeks</Term>
          </dt>
          <dd>{days(p.best)}</dd>
          {P.kind === "closed" ? null : (
            <>
              <dt>
                <Term tip="huidig">Huidige reeks</Term>
              </dt>
              <dd>{days(p.cur)}</dd>
            </>
          )}
          <dt>
            <Term tip="eerste">Als eerste gedeeld</Term>
          </dt>
          <dd>{p.first}×</dd>
          <dt>
            <Term tip="opener">Na de eerste beurt</Term>
          </dt>
          <dd>
            {nf(p.greens)} groen, {nf(p.yellows)} geel
          </dd>
          <dt>
            <Term tip="tijdstip">Deelt meestal rond</Term>
          </dt>
          <dd>{p.median}</dd>
          {week ? (
            <>
              <dt>
                <Term tip="weekdag">Beste weekdag</Term>
              </dt>
              <dd>{week.best}</dd>
              <dt>
                <Term tip="weekdag">Zwaarste weekdag</Term>
              </dt>
              <dd>{week.worst}</dd>
            </>
          ) : null}
        </dl>
      </div>
    </details>
  )
}
