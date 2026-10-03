// Every explanation on the page. A tip has a title and a body and opens from a term (an
// underlined word) or an i button; bodies link on to other tips with <Term>.
import type { ReactNode } from "react"
import { Term } from "../components/tips/Term.tsx"
import type { BoardData as TipData } from "../types/board.ts"

export interface Tip {
  title: string
  body: ReactNode
}

export function tips({ rules, first, last, periods }: TipData): Record<string, Tip> {
  const share = `${Math.round(rules.minShare * 100)}%`
  const fail = rules.failAs

  return {
    bron: {
      title: "Waar de cijfers vandaan komen",
      body: (
        <>
          <p>
            Alles is berekend uit de scores die in de groepschat zijn gedeeld: het bericht “Woordle{" "}
            {last} 4/6” met de gekleurde vakjes.
          </p>
          <p>
            Wat niet gedeeld is, bestaat hier niet. Een potje dat wel gespeeld maar niet gedeeld is,
            telt als niet gespeeld. Een score die alleen als afbeelding is gedeeld, telt ook niet.
          </p>
          <p>Deelde iemand dezelfde puzzel twee keer, dan telt de eerste keer.</p>
          <p>
            De pagina loopt van puzzel {first} ({periods.all.from_}) tot en met {last} (
            {periods.all.to}).
          </p>
        </>
      ),
    },
    puzzel: {
      title: "Puzzel",
      body: (
        <>
          <p>De Woordle van één dag, herkenbaar aan het nummer.</p>
          <p>
            Een puzzel hoort bij de dag van zijn nummer, niet bij het moment van delen. Wie na
            middernacht deelt, speelde nog de puzzel van de dag ervoor.
          </p>
          <p>
            Bovenaan staat op hoeveel puzzels minstens één van jullie een score deelde. Bij{" "}
            <Term tip="deelname">deelname</Term> tellen alle puzzels in de periode mee, ook de dagen
            waarop niemand deelde.
          </p>
        </>
      ),
    },
    potje: {
      title: "Potje",
      body: (
        <>
          <p>Eén gedeelde score: één speler, één puzzel.</p>
          <p>
            Alleen wat in de chat staat telt. Zie{" "}
            <Term tip="bron">waar de cijfers vandaan komen</Term>.
          </p>
        </>
      ),
    },
    periode: {
      title: "Periode",
      body: (
        <>
          <p>
            Een jaar telt de puzzels van dat kalenderjaar. “Altijd” telt alles vanaf de eerste
            gedeelde puzzel.
          </p>
          <p>
            Elk cijfer op de pagina geldt voor de gekozen periode. Ook een{" "}
            <Term tip="reeks">reeks</Term> wordt binnen de periode geteld: loopt hij over de
            jaarwisseling, dan is hij in een jaaroverzicht in tweeën geknipt en staat hij alleen bij
            “Altijd” in zijn geheel.
          </p>
        </>
      ),
    },
    beurten: {
      title: "Beurten",
      body: (
        <>
          <p>Het aantal pogingen tot het woord geraden was: 1 tot 6.</p>
          <p>
            In het totaal bovenaan telt een <Term tip="x">niet-geraden woord</Term> als de 6 beurten
            die echt gedaan zijn. In een <Term tip="gemiddelde">gemiddelde</Term> telt het als{" "}
            {fail}.
          </p>
        </>
      ),
    },
    gemiddelde: {
      title: "Gemiddeld aantal beurten",
      body: (
        <>
          <p>
            Alle beurten opgeteld, gedeeld door het aantal <Term tip="potje">potjes</Term>. Lager is
            beter.
          </p>
          <p>
            Een <Term tip="x">niet-geraden woord</Term> telt als {fail}: één meer dan de slechtste
            geraden score, zodat niet raden altijd slechter uitpakt dan raden in de zesde beurt.
          </p>
          <p>
            Dagen waarop iemand niet deelde tellen niet mee: ze maken het gemiddelde niet beter en
            niet slechter.
          </p>
        </>
      ),
    },
    x: {
      title: "Niet geraden (X)",
      body: (
        <>
          <p>Na zes beurten het woord niet gevonden. Woordle noteert dat als X/6.</p>
          <p>
            Een X telt als {fail} in elk <Term tip="gemiddelde">gemiddelde</Term>, levert nooit een{" "}
            <Term tip="dagzege">dagzege</Term> op en breekt een <Term tip="reeks">reeks</Term>.
          </p>
        </>
      ),
    },
    klassement: {
      title: "Klassement",
      body: (
        <>
          <p>
            Volgorde op <Term tip="gemiddelde">gemiddeld aantal beurten</Term>, het laagste
            bovenaan. Bij een exact gelijk gemiddelde staat de naam die eerder in het alfabet komt
            boven.
          </p>
          <p>
            Wie minder dan {share} van de puzzels in de periode deelde, staat onderaan met een
            streepje in plaats van een plek: over zo weinig potjes zegt een gemiddelde te weinig.
            Die spelers dingen ook niet mee in de prijzenkast en de duels.
          </p>
          <p>
            Per speler staan er: het aantal <Term tip="potje">potjes</Term>, het percentage{" "}
            <Term tip="geraden">geraden</Term>, het aantal <Term tip="dagzege">dagzeges</Term> en de{" "}
            <Term tip="verdeling">verdeling</Term> als balk.
          </p>
        </>
      ),
    },
    geraden: {
      title: "Geraden",
      body: (
        <>
          <p>
            Het deel van iemands potjes waarin het woord binnen zes beurten is gevonden. De rest is{" "}
            <Term tip="x">niet geraden</Term>.
          </p>
        </>
      ),
    },
    dagzege: {
      title: "Dagzege",
      body: (
        <>
          <p>De beste score van de dag onder iedereen die die puzzel deelde.</p>
          <p>
            Telt alleen als minstens twee van jullie de puzzel deelden. Hebben meerdere spelers
            dezelfde beste score, dan krijgen ze allemaal een dagzege. Een <Term tip="x">X</Term>{" "}
            wint nooit, ook niet als iedereen een X had.
          </p>
          <p>
            <Term tip="alleen">Dagzeges alleen</Term> telt de keren dat niemand anders dezelfde
            score had.
          </p>
        </>
      ),
    },
    alleen: {
      title: "Dagzeges alleen",
      body: (
        <>
          <p>
            Het aantal <Term tip="dagzege">dagzeges</Term> waarbij niemand anders die dag dezelfde
            score had.
          </p>
        </>
      ),
    },
    verdeling: {
      title: "Verdeling van beurten",
      body: (
        <>
          <p>
            Hoe vaak iemand in 1, 2, 3, 4, 5 of 6 beurten klaar was, en hoe vaak het woord{" "}
            <Term tip="x">niet geraden</Term> werd.
          </p>
          <p>
            In de balk is de breedte van een kleur het aandeel van iemands potjes. Het cijfer in een
            vak is het aantal beurten; bij smalle vakken valt het weg. De aantallen zelf staan onder
            “Meer cijfers”.
          </p>
        </>
      ),
    },
    deelname: {
      title: "Deelname",
      body: (
        <>
          <p>
            Het aantal gedeelde potjes als percentage van alle puzzels in de periode. Dagen waarop
            niemand deelde tellen mee als gemist.
          </p>
          <p>
            Onder {share} sta je buiten het <Term tip="klassement">klassement</Term>. In de
            prijzenkast gaat “Trouwste speler” naar de hoogste deelname.
          </p>
        </>
      ),
    },
    reeks: {
      title: "Langste reeks",
      body: (
        <>
          <p>
            Het grootste aantal dagen achter elkaar waarop iemand een score deelde én het woord
            raadde.
          </p>
          <p>
            Een dag zonder gedeelde score breekt de reeks, net als een <Term tip="x">X</Term>. De
            reeks wordt binnen de gekozen <Term tip="periode">periode</Term> geteld.
          </p>
        </>
      ),
    },
    huidig: {
      title: "Huidige reeks",
      body: (
        <>
          <p>
            De <Term tip="reeks">reeks</Term> die doorloopt tot en met de laatste puzzel op deze
            pagina (nr. {last}).
          </p>
          <p>Wie die laatste puzzel niet deelde of niet raadde, staat op 0.</p>
        </>
      ),
    },
    eerste: {
      title: "Als eerste gedeeld",
      body: (
        <>
          <p>Hoe vaak iemands bericht het eerste was met de score van een puzzel.</p>
          <p>
            Telt alleen op dagen dat minstens twee van jullie deelden. Het gaat om het tijdstip van
            het bericht in de chat, niet om wanneer er gespeeld is.
          </p>
        </>
      ),
    },
    opener: {
      title: "Na de eerste beurt",
      body: (
        <>
          <p>
            Het gemiddelde aantal groene vakjes (juiste letter op de juiste plek) en gele vakjes
            (juiste letter op de verkeerde plek) in de eerste rij.
          </p>
          <p>Zegt iets over het startwoord, en over geluk.</p>
        </>
      ),
    },
    tijdstip: {
      title: "Deelt meestal rond",
      body: (
        <>
          <p>
            Het middelste tijdstip van alle keren dat iemand een score deelde: de helft van de
            berichten was vroeger, de helft later.
          </p>
          <p>
            Het is het tijdstip van het bericht in de chat. Wanneer er gespeeld is, weet de pagina
            niet.
          </p>
        </>
      ),
    },
    verloop: {
      title: "Verloop per maand",
      body: (
        <>
          <p>
            Per speler het <Term tip="gemiddelde">gemiddeld aantal beurten</Term> over de puzzels
            van die maand. Lager is beter.
          </p>
          <p>
            Een maand met minder dan {rules.minPerMonth} potjes krijgt geen punt; de lijn is daar
            onderbroken. Een maand waarin niemand dat aantal haalt, staat niet op de as.
          </p>
        </>
      ),
    },
    prijzen: {
      title: "Prijzenkast",
      body: (
        <>
          <p>
            Elke prijs gaat naar wie in de gekozen <Term tip="periode">periode</Term> op één cijfer
            bovenaan staat. Tik op de i van een prijs voor de precieze regel.
          </p>
          <p>
            Alleen spelers in het <Term tip="klassement">klassement</Term> dingen mee. Bij een
            gelijke stand delen ze de prijs.
          </p>
        </>
      ),
    },
    besteopener: {
      title: "Beste opener",
      body: (
        <>
          <p>
            Groene en gele vakjes <Term tip="opener">na de eerste beurt</Term> bij elkaar opgeteld,
            gemiddeld per potje. De hoogste wint.
          </p>
        </>
      ),
    },
    nachtuil: {
      title: "Nachtuil",
      body: (
        <>
          <p>
            Wie het laatst op de dag deelt, gemeten als het{" "}
            <Term tip="tijdstip">middelste tijdstip</Term> van al zijn of haar berichten.
          </p>
        </>
      ),
    },
    vroegstevogel: {
      title: "Vroegste vogel",
      body: (
        <>
          <p>
            Wie het vroegst op de dag deelt, gemeten als het{" "}
            <Term tip="tijdstip">middelste tijdstip</Term> van al zijn of haar berichten.
          </p>
        </>
      ),
    },
    nippertje: {
      title: "Op het nippertje",
      body: (
        <>
          <p>Het aantal keren dat het woord pas in de zesde en laatste beurt geraden werd.</p>
        </>
      ),
    },
    raak: {
      title: "In één keer raak",
      body: (
        <>
          <p>
            Het woord in de eerste beurt geraden. Iedereen bij wie dat gelukt is staat erbij, met de
            datum.
          </p>
        </>
      ),
    },
    duels: {
      title: "Onderlinge duels",
      body: (
        <>
          <p>
            Voor elk tweetal: alle dagen waarop allebei een score deelden. Wie minder beurten nodig
            had, wint die dag. Een <Term tip="x">X</Term> verliest van elke geraden score.
          </p>
          <p>
            In een vak staat gewonnen–verloren van de speler in de rij tegen de speler in de kolom.
            Gelijke dagen, ook X tegen X, staan er niet in.
          </p>
          <p>
            Groen: de speler in de rij staat voor. Geel: precies gelijk. Alleen spelers in het{" "}
            <Term tip="klassement">klassement</Term> staan in de tabel.
          </p>
        </>
      ),
    },
    uitschieters: {
      title: "Uitschieters",
      body: (
        <>
          <p>
            Per puzzel het <Term tip="gemiddelde">gemiddeld aantal beurten</Term> van iedereen die
            hem deelde, met een <Term tip="x">X</Term> als {fail}. De vijf hoogste gemiddelden zijn
            de zwaarste puzzels, de vijf laagste de makkelijkste.
          </p>
          <p>
            Alleen puzzels die door minstens {rules.minOutlier} van jullie zijn gedeeld tellen mee,
            anders bepaalt één score het gemiddelde. Bij een gelijk gemiddelde staat de oudste
            puzzel eerst.
          </p>
          <p>
            Groen is de beste score van die dag, grijs met X is niet geraden, een punt betekent dat
            iemand die puzzel niet deelde.
          </p>
        </>
      ),
    },
  }
}
