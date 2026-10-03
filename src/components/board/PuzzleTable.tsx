import { FAILED, nf } from "../../lib/format.ts"
import { ranked } from "../../lib/ranking.ts"
import type { Period, Puzzle } from "../../types/board.ts"

interface PuzzleTableProps {
  period: Period
  puzzles: Puzzle[]
}

/** Puzzles as rows, with the turns of every player who shared one; the best of each day in green. */
export function PuzzleTable({ period: P, puzzles }: PuzzleTableProps): React.JSX.Element {
  const names = ranked(P)
    .map(p => p.name)
    .filter(n => puzzles.some(z => n in z.scores))
  return (
    <div className="scroll">
      <table className="pz">
        <thead>
          <tr>
            <th />
            {names.map(n => (
              <th key={n} scope="col" title={n}>
                {n.slice(0, 3)}
              </th>
            ))}
            <th scope="col">Gem.</th>
          </tr>
        </thead>
        <tbody>
          {puzzles.map(z => {
            const best = Math.min(...Object.values(z.scores))
            return (
              <tr key={z.n}>
                <th scope="row">
                  {z.date.replace(/ 20(\d\d)$/, " ’$1")}
                  <small>nr. {z.n}</small>
                </th>
                {names.map(n => (
                  <td key={n}>
                    <Turns turns={z.scores[n]} best={best} />
                  </td>
                ))}
                <td className="gem">{nf(z.avg, 1)}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function Turns({ turns, best }: { turns: number | undefined; best: number }): React.JSX.Element {
  if (turns == null) {
    return <span className="none">·</span>
  }
  if (turns === FAILED) {
    return <span className="x">X</span>
  }
  return <span className={turns === best ? "best" : ""}>{turns}</span>
}
