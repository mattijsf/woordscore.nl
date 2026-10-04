import { ranked } from "../../lib/ranking.ts"
import type { Period } from "../../types/board.ts"
import { Info } from "../tips/Info.tsx"

export function Duels({ period: P }: { period: Period }): React.JSX.Element {
  const names = ranked(P)
    .filter(p => p.qual)
    .map(p => p.name)
  return (
    <section>
      <h2>
        Onderlinge duels <Info tip="duels" name="onderlinge duels" />
      </h2>
      <p className="hint">Gewonnen–verloren van de rij tegen de kolom.</p>
      <div className="scroll">
        <table className="duel">
          <thead>
            <tr>
              <th />
              {names.map(n => (
                <th key={n} scope="col">
                  {n}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {names.map(a => (
              <tr key={a}>
                <th scope="row">{a}</th>
                {names.map(b => {
                  if (a === b) {
                    return (
                      <td key={b} className="self">
                        ·
                      </td>
                    )
                  }
                  const [w, t, l] = P.h2h[`${a}|${b}`] ?? [0, 0, 0]
                  const tone = w === l ? "even" : ""
                  return (
                    <td
                      key={b}
                      className={w > l ? "lead" : tone}
                      title={`${a} tegen ${b}: ${w} gewonnen, ${t} gelijk, ${l} verloren`}
                    >
                      {w}–{l}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
