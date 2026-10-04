import { useEffect } from "react"
import { Awards } from "./components/board/Awards.tsx"
import { Duels } from "./components/board/Duels.tsx"
import { Outliers } from "./components/board/Outliers.tsx"
import { Ranking } from "./components/board/Ranking.tsx"
import { Trend } from "./components/board/Trend.tsx"
import { Weekdays } from "./components/board/Weekdays.tsx"
import { Footer } from "./components/layout/Footer.tsx"
import { Hero } from "./components/layout/Hero.tsx"
import { Notice } from "./components/layout/Notice.tsx"
import { PeriodNav } from "./components/layout/PeriodNav.tsx"
import { Share } from "./components/share/Share.tsx"
import { StartPage } from "./components/start/StartPage.tsx"
import { TipSheet } from "./components/tips/TipSheet.tsx"
import { NoBoard } from "./components/update/NoBoard.tsx"
import { Update } from "./components/update/Update.tsx"
import { useBodyMode } from "./hooks/useBodyMode.ts"
import { useDocumentTitle } from "./hooks/useDocumentTitle.ts"
import { useHashPeriod } from "./hooks/useHashPeriod.ts"
import { useOpenBoard } from "./hooks/useOpenBoard.ts"
import { BRAND } from "./store/sessionSlice.ts"
import { useBoardStore } from "./store/useBoardStore.ts"

export function App(): React.JSX.Element {
  const mode = useBoardStore(state => state.mode)
  const opened = useBoardStore(state => state.opened)
  const board = useOpenBoard()
  useBodyMode(mode)
  useHashPeriod()
  useDocumentTitle(board ? `${board.data.title} – ${BRAND}` : BRAND)
  useEffect(() => {
    const { code, open } = useBoardStore.getState()
    if (code) {
      void open()
    }
  }, [])
  const P = board?.period
  return (
    <>
      <div className="wrap">
        <Hero board={board} />
      </div>
      {board ? <PeriodNav periods={board.data.periods} /> : null}
      <main className="wrap">
        {mode === "loading" || mode === "error" ? <Notice /> : null}
        {mode === "start" ? <StartPage /> : null}
        {P ? (
          <>
            <Ranking period={P} />
            <Trend period={P} />
            <Weekdays period={P} />
            <Awards period={P} />
            <Duels period={P} />
            <Outliers period={P} />
          </>
        ) : null}
        {mode === "new" ? <NoBoard /> : null}
        {board || mode === "new" ? <Update key={`${mode}-${opened}`} /> : null}
        {board ? (
          <>
            <Share key={opened} />
            <Footer data={board.data} />
          </>
        ) : null}
      </main>
      <TipSheet />
    </>
  )
}
