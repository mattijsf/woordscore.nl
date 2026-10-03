import { COLORS } from "../../lib/board.ts"

interface PlayerChipProps {
  name: string
  pressed: boolean
  onClick: () => void
}

export function PlayerChip({ name, pressed, onClick }: PlayerChipProps): React.JSX.Element {
  return (
    <button type="button" aria-pressed={pressed} onClick={onClick}>
      <i className="dot" style={{ background: COLORS[name] }} />
      {name}
    </button>
  )
}
