import { ranked } from "../../lib/ranking.ts"
import type { Period } from "../../types/board.ts"
import { Info } from "../tips/Info.tsx"
import { DistributionKey } from "./DistributionKey.tsx"
import { PlayerRow } from "./PlayerRow.tsx"

export function Ranking({ period: P }: { period: Period }): React.JSX.Element {
  let rank = 0
  return (
    <section>
      <h2>
        Klassement <Info tip="klassement" name="klassement" />
      </h2>
      <p className="hint">Lager is beter. Tik op een speler voor meer cijfers.</p>
      <div className="board">
        {ranked(P).map(player => (
          <PlayerRow
            key={player.name}
            player={player}
            period={P}
            rank={player.qual ? ++rank : null}
          />
        ))}
      </div>
      <DistributionKey />
    </section>
  )
}
