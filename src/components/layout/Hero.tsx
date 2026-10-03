import { data } from "../../lib/board.ts"
import { Lede } from "./Lede.tsx"
import { Tiles } from "./Tiles.tsx"

export function Hero(): React.JSX.Element {
  return (
    <header className="hero">
      <Tiles />
      <h1>{data.title}</h1>
      <Lede />
      <p className="hint">
        Tik op een onderstreept woord of op een{" "}
        <span className="info as-text" aria-hidden="true">
          i
        </span>{" "}
        voor uitleg.
      </p>
    </header>
  )
}
