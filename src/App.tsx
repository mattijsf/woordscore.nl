import { Awards } from "./components/board/Awards.tsx"
import { Duels } from "./components/board/Duels.tsx"
import { Outliers } from "./components/board/Outliers.tsx"
import { Ranking } from "./components/board/Ranking.tsx"
import { Trend } from "./components/board/Trend.tsx"
import { Footer } from "./components/layout/Footer.tsx"
import { Hero } from "./components/layout/Hero.tsx"
import { PeriodNav } from "./components/layout/PeriodNav.tsx"
import { useDocumentTitle } from "./hooks/useDocumentTitle.ts"
import { useHashPeriod } from "./hooks/useHashPeriod.ts"
import { data } from "./lib/board.ts"

export function App(): React.JSX.Element {
  useHashPeriod()
  useDocumentTitle(`${data.title} – scorebord`)
  return (
    <>
      <div className="wrap">
        <Hero />
      </div>
      <PeriodNav />
      <main className="wrap">
        <Ranking />
        <Trend />
        <Awards />
        <Duels />
        <Outliers />
        <Footer />
      </main>
    </>
  )
}
