import { useBoardStore } from "../../store/useBoardStore.ts"

/** What the page says while it loads a scoreboard, or why it could not. */
export function Notice(): React.JSX.Element {
  const notice = useBoardStore(state => state.notice)
  return (
    <section>
      <p>{notice}</p>
    </section>
  )
}
