import { ranked } from "../../lib/ranking.ts"
import { usePeriod } from "../../store/useViewStore.ts"
import { DistributionKey } from "./DistributionKey.tsx"
import { PlayerRow } from "./PlayerRow.tsx"

export function Ranking(): React.JSX.Element {
  const P = usePeriod()
  let rank = 0
  return (
    <section>
      <h2>Klassement</h2>
      <p className="hint">
        Gerangschikt op gemiddeld aantal beurten, dus lager is beter. Tik op een speler voor alle
        cijfers.
      </p>
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
