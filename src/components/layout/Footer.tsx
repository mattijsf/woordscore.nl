import { data } from "../../lib/board.ts"
import { pc } from "../../lib/format.ts"

export function Footer(): React.JSX.Element {
  const { first, last, rules, periods } = data
  return (
    <footer>
      <p>
        Gebaseerd op de scores die in de groep zijn gedeeld, van puzzel {first} ({periods.all.from_}
        ) tot en met {last} ({periods.all.to}). Een niet-geraden woord telt als {rules.failAs}{" "}
        beurten. Dubbel gedeelde scores tellen één keer. Wie minder dan {pc(rules.minShare)} van de
        puzzels speelde, staat buiten het klassement en de prijzenkast.
      </p>
    </footer>
  )
}
