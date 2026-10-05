import { ranked } from "../../lib/ranking.ts"
import { useBoardStore } from "../../store/useBoardStore.ts"
import type { Period } from "../../types/board.ts"
import { Info } from "../tips/Info.tsx"
import { DistributionKey } from "./DistributionKey.tsx"
import { PlayerRow } from "./PlayerRow.tsx"
import { ShareStanding } from "./ShareStanding.tsx"

interface RankingProps {
  period: Period
  /** the number of latest puzzles a form is worked out over */
  formDays: number
  /** the last puzzle on the scoreboard */
  last: number
}

export function Ranking({ period: P, formDays, last }: RankingProps): React.JSX.Element {
  const demo = useBoardStore(state => state.demo)
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
            formDays={formDays}
            rank={player.qual ? ++rank : null}
          />
        ))}
      </div>
      <DistributionKey />
      {demo ? null : <ShareStanding period={P} last={last} />}
    </section>
  )
}
