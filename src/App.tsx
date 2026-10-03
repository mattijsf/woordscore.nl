import { useEffect } from "react"
import { Awards } from "./components/board/Awards.tsx"
import { Duels } from "./components/board/Duels.tsx"
import { Outliers } from "./components/board/Outliers.tsx"
import { Ranking } from "./components/board/Ranking.tsx"
import { Trend } from "./components/board/Trend.tsx"
import { Weekdays } from "./components/board/Weekdays.tsx"
import { Footer } from "./components/layout/Footer.tsx"
import { Hero } from "./components/layout/Hero.tsx"
import { PeriodNav } from "./components/layout/PeriodNav.tsx"
import { TipSheet } from "./components/tips/TipSheet.tsx"
import { Update } from "./components/update/Update.tsx"
import { useDocumentTitle } from "./hooks/useDocumentTitle.ts"
import { useHashPeriod } from "./hooks/useHashPeriod.ts"
import { useBoardStore, useData } from "./store/useBoardStore.ts"

export function App(): React.JSX.Element {
  const { title } = useData()
  const sync = useBoardStore(state => state.sync)
  useHashPeriod()
  useDocumentTitle(`${title} – scorebord`)
  useEffect(() => {
    void sync()
  }, [sync])
  return (
    <>
      <div className="wrap">
        <Hero />
      </div>
      <PeriodNav />
      <main className="wrap">
        <Ranking />
        <Trend />
        <Weekdays />
        <Awards />
        <Duels />
        <Outliers />
        <Update />
        <Footer />
      </main>
      <TipSheet />
    </>
  )
}
