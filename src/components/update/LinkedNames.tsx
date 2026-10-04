import { useBoardStore } from "../../store/useBoardStore.ts"

/** The names in WhatsApp that count as another player on this scoreboard. */
export function LinkedNames(): React.JSX.Element {
  const aliases = useBoardStore(state => state.aliases)
  const linked = Object.entries(aliases)
  return (
    <p className="hint" id="alias-list">
      {linked.length
        ? `Namen uit WhatsApp die anders op het scorebord staan: ${linked.map(([alias, player]) => `${alias} is ${player}`).join(", ")}.`
        : ""}
    </p>
  )
}
