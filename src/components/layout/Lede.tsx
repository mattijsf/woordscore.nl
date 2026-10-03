import { nf, ni } from "../../lib/format.ts"
import { usePeriod } from "../../store/useViewStore.ts"
import { Term } from "../tips/Term.tsx"

/** The period in one sentence: how much was played and how it went. */
export function Lede(): React.JSX.Element {
  const P = usePeriod()
  const start =
    P.kind === "all"
      ? `Sinds ${P.from_} deelden jullie`
      : `In ${P.name} deelden jullie${P.kind === "open" ? " tot nu toe" : ""}`
  return (
    <p className="lede">
      {start}{" "}
      <b>
        {ni(P.games)} <Term tip="potje">potjes</Term>
      </b>{" "}
      over {ni(P.played)} <Term tip="puzzel">puzzels</Term>. Samen goed voor {ni(P.guesses)}{" "}
      <Term tip="beurten">beurten</Term>, <Term tip="gemiddelde">gemiddeld</Term> <b>{nf(P.avg)}</b>{" "}
      per potje. {P.fails} keer bleef het woord <Term tip="x">ongeraden</Term>.
    </p>
  )
}
