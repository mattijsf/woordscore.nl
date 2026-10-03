import { COLORS } from "../../lib/board.ts"
import { nf, pc } from "../../lib/format.ts"
import type { Period, Player } from "../../types/board.ts"

const turnsLabel = (i: number): string => (i < 6 ? String(i + 1) : "X")
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
              <b>{p.games}</b> potjes
            </span>
            <span>
              <b>{pc(p.solved / p.games)}</b> geraden
            </span>
            <span>
              <b>{p.wins}</b> dagzeges
            </span>
          </span>
        </span>
        <span className="avg">
          {nf(p.avg)}
          <small>gemiddeld</small>
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
          {p.qual ? "" : " (te weinig potjes voor het klassement)"}
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
          <dt>Deelname</dt>
          <dd>{pc(p.part)} van de puzzels</dd>
          <dt>Dagzeges alleen</dt>
          <dd>{p.solo}</dd>
          <dt>Langste reeks</dt>
          <dd>{days(p.best)}</dd>
          {P.kind === "closed" ? null : (
            <>
              <dt>Huidige reeks</dt>
              <dd>{days(p.cur)}</dd>
            </>
          )}
          <dt>Als eerste gedeeld</dt>
          <dd>{p.first}×</dd>
          <dt>Na de eerste beurt</dt>
          <dd>
            {nf(p.greens)} groen, {nf(p.yellows)} geel
          </dd>
          <dt>Deelt meestal rond</dt>
          <dd>{p.median}</dd>
        </dl>
      </div>
    </details>
  )
}
