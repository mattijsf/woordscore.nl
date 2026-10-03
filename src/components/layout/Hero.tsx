import { useData } from "../../store/useBoardStore.ts"
import { Lede } from "./Lede.tsx"
import { Tiles } from "./Tiles.tsx"

export function Hero(): React.JSX.Element {
  const { title } = useData()
  return (
    <header className="hero">
      <Tiles />
      <h1>{title}</h1>
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
