// Two Woordle rows: WINST with three yellow squares, then STAND all green.
const ROWS = [
  ["W", "I", "N", "S", "T"].map((letter, i) => [letter, i < 2 ? "" : "y"] as const),
  ["S", "T", "A", "N", "D"].map(letter => [letter, "g"] as const),
]

export function Tiles(): React.JSX.Element {
  return (
    <div
      className="grid"
      role="img"
      aria-label="Twee Woordle-rijen: WINST met drie gele vakjes, daarna STAND helemaal groen"
    >
      {ROWS.flatMap((row, r) =>
        row.map(([letter, tone], c) => (
          <span
            key={`${r}-${c}`}
            className={tone ? `tile ${tone}` : "tile"}
            style={{ "--i": r * 6 + c }}
          >
            {letter}
          </span>
        ))
      )}
    </div>
  )
}
