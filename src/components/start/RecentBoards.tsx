import { useMemo, useSyncExternalStore } from "react"
import { linkTo } from "../../lib/address.ts"
import { recent } from "../../lib/recent.ts"

/** The scoreboards opened on this device, to open again with one tap. */
export function RecentBoards(): React.JSX.Element | null {
  // the page built ahead of time knows no device, so it starts without the list
  const stored = useSyncExternalStore(recent.subscribe, recent.stored, () => null)
  const visits = useMemo(() => recent.shown(stored), [stored])
  if (!visits.length) {
    return null
  }
  return (
    <div id="recent">
      <p className="hint">Recent bezocht op dit apparaat:</p>
      <div className="upload" id="recent-list">
        {visits.map(({ code }) => (
          <a key={code} className="btn" href={linkTo(code)}>
            {code}
          </a>
        ))}
      </div>
      <p className="hint">
        <button
          type="button"
          className="term"
          id="recent-clear"
          onClick={() => {
            recent.write([])
          }}
        >
          Lijst wissen
        </button>
      </p>
    </div>
  )
}
