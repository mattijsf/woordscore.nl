import type { OpenBoard } from "../../hooks/useOpenBoard.ts"
import { Lede } from "./Lede.tsx"
import { Tiles } from "./Tiles.tsx"

export function Hero({ board }: { board: OpenBoard | null }): React.JSX.Element {
  return (
    <header className="hero">
      <a className="logo" href="?kies" aria-label="Woordscore, naar de beginpagina">
        <Tiles />
      </a>
      <h1>{board ? board.data.title : "Woordscore"}</h1>
      {board ? (
        <>
          <Lede period={board.period} />
          <p className="hint">
            Tik op een onderstreept woord of op een{" "}
            <span className="info as-text" aria-hidden="true">
              i
            </span>{" "}
            voor uitleg.
          </p>
        </>
      ) : (
        <p className="lede">
          Het scorebord bij jullie Woordle-groep. Van de uitslagen die jullie in de groepschat
          delen, maakt Woordscore een klassement, een prijzenkast en onderlinge duels.
        </p>
      )}
    </header>
  )
}
