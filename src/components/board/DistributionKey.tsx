import { Info } from "../tips/Info.tsx"

const KEY = ["1", "2", "3", "4", "5", "6", "niet geraden"]

/** What the colours in a distribution stand for. */
export function DistributionKey(): React.JSX.Element {
  return (
    <div className="key">
      {KEY.map((label, i) => (
        <span key={label}>
          <i className={`s${i + 1}`} />
          {label}
        </span>
      ))}
      <Info tip="verdeling" name="verdeling" />
    </div>
  )
}
