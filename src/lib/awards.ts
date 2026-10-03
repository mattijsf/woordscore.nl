// The trophy cabinet: who leads a period on one figure each.
import type { Award, Month, Player } from "../types/board.ts"
import { list, nl, share } from "./format.ts"

interface AwardOptions {
  lowest?: boolean
  among?: Player[]
  /** no award when the best value is 0 */
  skipZero?: boolean
}

export function awards(players: Player[], puzzles: number, twins: Map<string, string[]>): Award[] {
  const eligible = players.filter(p => p.qual)
  if (!eligible.length) {
    return []
  }

  const award = (
    title: string,
    value: (p: Player) => number,
    text: (p: Player) => string,
    note: (p: Player, winners: Player[]) => string,
    { lowest = false, among = eligible, skipZero = false }: AwardOptions = {}
  ): Award[] => {
    const top = Math[lowest ? "min" : "max"](...among.map(value))
    if (skipZero && top === 0) {
      return []
    }
    const winners = among.filter(p => value(p) === top)
    const [winner] = winners
    if (!winner) {
      return []
    }
    return [
      {
        title,
        who: list(winners.map(p => p.name)),
        value: text(winner),
        note: note(winner, winners),
      },
    ]
  }
  const timed = eligible.filter(p => p.medianMin !== null)
  const minute = (p: Player): number => p.medianMin ?? 0
  const saved = Math.max(...eligible.map(p => p.coldSaved))
  const savers = list(eligible.filter(p => p.coldSaved === saved).map(p => p.name))
  // rounded, so that 52/14 and 78/21 count as the same average
  const monthAvg = (p: Player): number => Math.round((p.bestMonth?.avg ?? 0) * 1e6) / 1e6
  const names = new Set(eligible.map(p => p.name))
  const pairs = [...twins].filter(([pair]) => pair.split(" & ").every(name => names.has(name)))
  const most = Math.max(0, ...pairs.map(([, dates]) => dates.length))
  const closest = pairs.filter(([, dates]) => dates.length === most)
  const month = (p: Player): Month => p.bestMonth ?? { label: "", games: 0, avg: 0 }

  const result = [
    ...award(
      "Langste reeks",
      p => p.best,
      p => `${p.best} ${p.best === 1 ? "dag" : "dagen"}`,
      p => `op rij geraden, tot en met ${p.bestEnd}`
    ),
    ...award(
      "Meeste dagzeges",
      p => p.wins,
      p => `${p.wins}×`,
      p => `beste score van de dag, waarvan ${p.solo}× alleen`
    ),
    ...award(
      "Trouwste speler",
      p => p.games,
      p => share(p.games, puzzles),
      p => `${p.games} van de ${puzzles} puzzels gedeeld`
    ),
    ...award(
      "Als eerste klaar",
      p => p.first,
      p => `${p.first}×`,
      () => "als eerste de score van de dag gedeeld"
    ),
    ...award(
      "Beste opener",
      p => p.greens + p.yellows,
      p => nl(p.greens + p.yellows),
      () => "gekleurde vakjes in de eerste rij, gemiddeld"
    ),
    ...award(
      "Nachtuil",
      minute,
      p => p.median,
      () => "middelste tijdstip van delen",
      {
        among: timed,
      }
    ),
    ...award(
      "Vroegste vogel",
      minute,
      p => p.median,
      () => "middelste tijdstip van delen",
      {
        lowest: true,
        among: timed,
      }
    ),
    ...award(
      "Op het nippertje",
      p => p.six,
      p => `${p.six}×`,
      () => "pas in de zesde beurt geraden"
    ),
    ...award(
      "Op één letter na",
      p => p.near,
      p => `${p.near}×`,
      () => "niet geraden met vier groene vakjes in de laatste rij",
      { skipZero: true }
    ),
    ...award(
      "Koude start",
      p => p.cold,
      p => `${p.cold}×`,
      () =>
        `eerste rij helemaal grijs${saved ? `; daarna het vaakst toch in hooguit drie beurten klaar: ${savers} (${saved}×)` : ""}`,
      { skipZero: true }
    ),
    ...award(
      "Meest constant",
      p => Math.round(p.sd * 1e6) / 1e6,
      p => nl(p.sd),
      () => "scores verschillen het minst van elkaar",
      { lowest: true }
    ),
    ...award(
      "Beste maand",
      monthAvg,
      p => nl(month(p).avg),
      (p, winners) =>
        winners.length > 1
          ? winners.map(w => `${w.name} in ${month(w).label} (${month(w).games} potjes)`).join("; ")
          : `${month(p).label}, ${month(p).games} potjes`,
      { lowest: true, among: eligible.filter(p => p.bestMonth) }
    ),
    ...award(
      "Langste pauze",
      p => p.gap,
      p => `${p.gap} ${p.gap === 1 ? "dag" : "dagen"}`,
      p => `achter elkaar niets gedeeld, vanaf ${p.gapFrom}`,
      { skipZero: true }
    ),
  ]
  if (most) {
    result.push({
      title: "Gedachtenlezers",
      who: list(closest.map(([pair]) => pair)),
      value: `${most}×`,
      // with several pairs, say which date belongs to which pair
      note:
        closest.length > 1
          ? closest.map(([pair, dates]) => `${pair} op ${list(dates)}`).join("; ")
          : `precies dezelfde vakjes op ${list(closest[0]?.[1] ?? [])}`,
    })
  }
  const aces = eligible.filter(p => p.ones.length)
  if (aces.length) {
    result.push({
      title: "In één keer raak",
      who: list(aces.map(p => p.name)),
      value: "1/6",
      note: aces.map(p => `${p.name} op ${list(p.ones)}`).join("; "),
    })
  }
  return result
}
