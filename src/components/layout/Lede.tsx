import { nf, ni } from "../../lib/format.ts"
import { usePeriod } from "../../store/useViewStore.ts"

/** The period in one sentence: how much was played and how it went. */
export function Lede(): React.JSX.Element {
  const P = usePeriod()
  const start =
    P.kind === "all"
      ? `Sinds ${P.from_} deelden jullie`
      : `In ${P.name} deelden jullie${P.kind === "open" ? " tot nu toe" : ""}`
  return (
    <p className="lede">
      {start} <b>{ni(P.games)} potjes</b> over {ni(P.played)} puzzels. Samen goed voor{" "}
      {ni(P.guesses)} beurten, gemiddeld <b>{nf(P.avg)}</b> per potje. {P.fails} keer bleef het
      woord ongeraden.
    </p>
  )
}
