import { data } from "../../lib/board.ts"
import { Lede } from "./Lede.tsx"
import { Tiles } from "./Tiles.tsx"

export function Hero(): React.JSX.Element {
  return (
    <header className="hero">
      <Tiles />
      <h1>{data.title}</h1>
      <Lede />
    </header>
  )
}
