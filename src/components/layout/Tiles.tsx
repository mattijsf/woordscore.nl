// The logo: WOORD with two green squares, then SCORE all green.
const ROWS = [
  ["W", "O", "O", "R", "D"].map((letter, i) => [letter, i === 2 || i === 3 ? "g" : ""] as const),
  ["S", "C", "O", "R", "E"].map(letter => [letter, "g"] as const),
]

export function Tiles(): React.JSX.Element {
  return (
    <div className="grid" aria-hidden="true">
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
