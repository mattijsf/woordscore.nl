const KEY = ["1", "2", "3", "4", "5", "6", "niet geraden"]

/** What the colours in a distribution stand for. */
export function DistributionKey(): React.JSX.Element {
  return (
    <div className="key" aria-hidden="true">
      {KEY.map((label, i) => (
        <span key={label}>
          <i className={`s${i + 1}`} />
          {label}
        </span>
      ))}
    </div>
  )
}
