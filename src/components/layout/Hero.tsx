import type { OpenBoard } from "../../hooks/useOpenBoard.ts"
import { Lede } from "./Lede.tsx"
import { Tiles } from "./Tiles.tsx"

export function Hero({ board }: { board: OpenBoard | null }): React.JSX.Element {
  return (
    <header className="hero">
      <a className="logo" href="/" aria-label="Woordscore, naar de beginpagina">
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
          Voor groepen die Woordle spelen op{" "}
          <a href="https://woordle.nl" rel="noopener">
            woordle.nl
          </a>{" "}
          en hun uitslag in WhatsApp delen. Woordscore telt die uitslagen op en laat zien wie er het
          beste in is.
        </p>
      )}
    </header>
  )
}
