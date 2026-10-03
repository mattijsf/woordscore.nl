import { useColors } from "../../store/useBoardStore.ts"
interface PlayerChipProps {
  name: string
  pressed: boolean
  onClick: () => void
}

export function PlayerChip({ name, pressed, onClick }: PlayerChipProps): React.JSX.Element {
  const COLORS = useColors()
  return (
    <button type="button" aria-pressed={pressed} onClick={onClick}>
      <i className="dot" style={{ background: COLORS[name] }} />
      {name}
    </button>
  )
}
