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
            De cijfers komen uit de scores die in de groepschat zijn gedeeld, zoals ‘Woordle {last}{" "}
            4/6’ met de vakjes eronder.
          </p>
          <p>
            Een potje dat niet in de chat is gedeeld, telt niet mee. Dat geldt ook voor een score
            die als afbeelding is gestuurd en voor berichten die in de export ontbreken.
          </p>
          <p>Staat dezelfde puzzel twee keer van iemand in de chat, dan telt de eerste.</p>
          <p>
            Een score wordt overgeslagen als de vakjes niet bij de uitslag passen, als hij meer dan
            een week na de puzzel is gedeeld, of als de afzender alleen als telefoonnummer in de
            export staat.
          </p>
          <p>
            Hoe spelers aan hun naam komen, staat bij <Term tip="namen">namen</Term>. Hoe je nieuwe
            scores toevoegt, staat bij <Term tip="upload">bijwerken</Term>.
          </p>
          <p>
            Dit scorebord loopt van puzzel {first} ({periods.all.from_}) tot en met puzzel {last} (
            {periods.all.to}).
          </p>
        </>
      ),
    },
    upload: {
      title: "Bijwerken",
      body: (
        <>
          <p>
            Kies onder ‘Bijwerken’ een export van de groepschat. De stappen staan daar onder ‘Hoe
            exporteer ik de chat?’.
          </p>
          <p>
            Je telefoon of computer leest het bestand zelf uit. Naar deze website gaan per score het
            puzzelnummer, de naam, het aantal beurten, het tijdstip van delen en de kleuren van de
            vakjes. De berichten uit de chat worden niet verstuurd.
          </p>
          <p>
            Je ziet eerst hoeveel nieuwe scores er zijn. Ze worden bewaard als je op ‘Stand
            bijwerken’ tikt.
          </p>
          <p>
            Bijwerken voegt scores toe. Wat al bewaard is, blijft staan, ook als jouw export iets
            anders zegt.
          </p>
          <p>
            Bij een naam die het scorebord nog niet kent, krijg je een vraag. Zie{" "}
            <Term tip="namen">namen</Term>.
          </p>
          <p>
            Iedereen met de code kan bijwerken. Zie <Term tip="delen">delen</Term>.
          </p>
        </>
      ),
    },
    delen: {
      title: "Delen",
      body: (
        <>
          <p>Jullie hebben de code van dit scorebord zelf gekozen. Hij staat ook in de link.</p>
          <p>
            Met de code kan iemand het scorebord bekijken, bijwerken, een andere naam geven en
            verwijderen. Een wachtwoord is er niet.
          </p>
          <p>
            Geef de code daarom alleen aan mensen uit de groep. Een code die voor de hand ligt, kan
            een ander raden.
          </p>
          <p>
            Het scorebord krijgt bij het beginnen de naam van de groep uit de bestandsnaam van de
            export. Lukt dat niet, dan wordt het de code. Je kunt de naam altijd aanpassen.
          </p>
          <p>
            Na verwijderen is alles weg. Met een export kun je onder dezelfde code opnieuw beginnen.
            De namen moet je dan opnieuw kiezen.
          </p>
        </>
      ),
    },
    namen: {
      title: "Namen",
      body: (
        <>
          <p>
            Bij elke score in een export staat de naam van de afzender in WhatsApp. Het scorebord
            neemt daarvan het eerste woord. Bij twee afzenders met hetzelfde eerste woord neemt het
            de hele naam.
          </p>
          <p>
            De export bevat de namen zoals ze in de telefoon van de exporteur staan. Dezelfde
            persoon kan daardoor de ene keer ‘Ruben’ heten en de andere keer ‘Papa’.
          </p>
          <p>Bij het beginnen kies je per speler de naam op het scorebord.</p>
          <p>
            Bij een onbekende naam in een latere export kies je of het een nieuwe speler is, met een
            naam naar keuze, of iemand die al meedoet. Een speler kan zo meerdere namen in WhatsApp
            hebben.
          </p>
          <p>
            Het scorebord onthoudt die keuze en vraagt het bij een volgende export niet opnieuw.
            Terugdraaien kan niet, en de naam van een speler ligt daarna vast.
          </p>
          <p>
            Wie bij een bestaande speler per ongeluk ‘nieuwe speler’ kiest, verdeelt de scores over
            twee spelers.
          </p>
        </>
      ),
    },
    puzzel: {
      title: "Puzzel",
      body: (
        <>
          <p>De Woordle van één dag. Het nummer gaat elke dag één omhoog.</p>
          <p>
            Een score telt voor de dag van de puzzel, ook als hij na middernacht of de volgende
            ochtend is gedeeld.
          </p>
          <p>
            Bovenaan staat van hoeveel puzzels iemand een score deelde. Bij{" "}
            <Term tip="deelname">deelname</Term> tellen ook de puzzels mee waarvan niemand iets
            deelde.
          </p>
        </>
      ),
    },
    potje: {
      title: "Potje",
      body: (
        <>
          <p>Een gedeelde score van één speler voor één puzzel.</p>
          <p>
            Welke scores meetellen, staat bij <Term tip="bron">waar de cijfers vandaan komen</Term>.
          </p>
        </>
      ),
    },
    periode: {
      title: "Periode",
      body: (
        <>
          <p>
            Met de knoppen bovenaan kies je een jaar of ‘Altijd’. Alle cijfers gaan dan over die
            periode.
          </p>
          <p>
            Een jaar loopt van 1 januari tot en met 31 december. Het eerste jaar begint bij de
            eerste gedeelde puzzel (nr. {first}) en het lopende jaar eindigt bij de laatste (nr.{" "}
            {last}).
          </p>
          <p>
            Een <Term tip="reeks">reeks</Term> wordt per periode geteld. Loopt een reeks door over
            de jaarwisseling, dan zie je hem alleen bij ‘Altijd’ in zijn geheel.
          </p>
        </>
      ),
    },
    beurten: {
      title: "Beurten",
      body: (
        <>
          <p>Het aantal pogingen tot het woord geraden was, van 1 tot en met 6.</p>
          <p>
            In het totaal bovenaan telt een <Term tip="x">niet-geraden woord</Term> als 6 beurten,
            want zoveel zijn er gespeeld.
          </p>
          <p>
            In een <Term tip="gemiddelde">gemiddelde</Term> telt het als {fail}. Het totaal gedeeld
            door het aantal potjes komt daardoor iets lager uit dan het gemiddelde ernaast.
          </p>
        </>
      ),
    },
    gemiddelde: {
      title: "Gemiddeld aantal beurten",
      body: (
        <>
          <p>
            Alle beurten van iemands <Term tip="potje">potjes</Term> opgeteld en gedeeld door het
            aantal potjes. Lager is beter.
          </p>
          <p>
            Een <Term tip="x">niet-geraden woord</Term> telt als {fail} beurten, één meer dan raden
            in de laatste beurt.
          </p>
          <p>Puzzels waarvan iemand geen score deelde, tellen niet mee.</p>
          <p>
            Je ziet twee decimalen. De volgorde in het klassement gaat op het onafgeronde getal.
          </p>
        </>
      ),
    },
    x: {
      title: "Niet geraden (X)",
      body: (
        <>
          <p>Het woord is na zes beurten niet geraden. Woordle schrijft dat als X/6.</p>
          <p>
            Een X telt als {fail} beurten in een <Term tip="gemiddelde">gemiddelde</Term>, levert
            geen <Term tip="dagzege">dagzege</Term> op en beëindigt een{" "}
            <Term tip="reeks">reeks</Term>.
          </p>
        </>
      ),
    },
    klassement: {
      title: "Klassement",
      body: (
        <>
          <p>
            De volgorde gaat op <Term tip="gemiddelde">gemiddeld aantal beurten</Term>, met het
            laagste bovenaan. Bij een exact gelijk gemiddelde beslist het alfabet.
          </p>
          <p>
            Wie in de periode van minder dan {share} van de puzzels een score deelde, staat onderaan
            met een streepje. Zo’n speler doet ook niet mee in de prijzenkast en de duels.
          </p>
          <p>
            Per speler zie je het aantal <Term tip="potje">potjes</Term>, het percentage{" "}
            <Term tip="geraden">geraden</Term>, het aantal <Term tip="dagzege">dagzeges</Term>, de{" "}
            <Term tip="vorm">vorm</Term> en de <Term tip="verdeling">verdeling</Term> van de
            beurten.
          </p>
        </>
      ),
    },
    geraden: {
      title: "Geraden",
      body: (
        <>
          <p>
            Het deel van iemands potjes waarin het woord is geraden. De rest is{" "}
            <Term tip="x">niet geraden</Term>.
          </p>
          <p>Het percentage is afgerond. Er staat pas 100% als elk potje geraden is.</p>
        </>
      ),
    },
    dagzege: {
      title: "Dagzege",
      body: (
        <>
          <p>
            Je hebt een dagzege als niemand de puzzel van die dag in minder beurten raadde dan jij.
          </p>
          <p>
            Er moeten minstens twee spelers een score hebben gedeeld. Bij een gelijke beste score
            krijgen die spelers allemaal een dagzege.
          </p>
          <p>
            Een <Term tip="x">X</Term> levert geen dagzege op, ook als iedereen een X had.
          </p>
          <p>
            <Term tip="alleen">Dagzeges alleen</Term> zijn de dagzeges die je met niemand deelde.
          </p>
        </>
      ),
    },
    alleen: {
      title: "Dagzeges alleen",
      body: (
        <>
          <p>
            Het aantal <Term tip="dagzege">dagzeges</Term> waarbij geen andere speler dezelfde score
            had.
          </p>
        </>
      ),
    },
    verdeling: {
      title: "Verdeling van beurten",
      body: (
        <>
          <p>
            Hoe vaak iemand in 1, 2, 3, 4, 5 of 6 beurten klaar was en hoe vaak het woord{" "}
            <Term tip="x">niet geraden</Term> werd.
          </p>
          <p>
            Elke kleur in de balk staat voor een aantal beurten. Een bredere kleur betekent dat die
            score vaker voorkwam. Het cijfer in een vak is het aantal beurten en ontbreekt als het
            vak te smal is.
          </p>
          <p>De aantallen staan onder ‘Meer cijfers’.</p>
        </>
      ),
    },
    deelname: {
      title: "Deelname",
      body: (
        <>
          <p>
            Het aantal puzzels waarvan iemand een score deelde, als percentage van alle puzzels in
            de periode. Puzzels waarvan niemand iets deelde, tellen mee in dat totaal.
          </p>
          <p>
            Onder de {share} sta je buiten het <Term tip="klassement">klassement</Term>.
          </p>
          <p>De prijs ‘Trouwste speler’ gaat naar wie de meeste scores deelde.</p>
          <p>
            Het percentage is afgerond. Er staat pas 100% als iemand van elke puzzel een score
            deelde.
          </p>
        </>
      ),
    },
    reeks: {
      title: "Langste reeks",
      body: (
        <>
          <p>
            Het grootste aantal dagen achter elkaar met een gedeelde score waarbij het woord geraden
            is.
          </p>
          <p>
            Een dag zonder score of met een <Term tip="x">X</Term> beëindigt de reeks.
          </p>
          <p>
            De reeks wordt geteld binnen de gekozen <Term tip="periode">periode</Term>.
          </p>
        </>
      ),
    },
    vorm: {
      title: "Vorm",
      body: (
        <>
          <p>
            Het <Term tip="gemiddelde">gemiddeld aantal beurten</Term> over de laatste{" "}
            {rules.formDays} puzzels, tot en met puzzel {last}.
          </p>
          <p>
            Erachter staat de vergelijking met het gemiddelde over de hele periode. ‘Beter’ is
            minstens 0,10 beurt lager, ‘slechter’ minstens 0,10 hoger. Daartussen staat ‘gelijk’.
          </p>
          <p>
            Bij minder dan {rules.minForm} scores in die {rules.formDays} dagen wordt geen vorm
            getoond. Bij een afgesloten jaar ook niet.
          </p>
        </>
      ),
    },
    huidig: {
      title: "Huidige reeks",
      body: (
        <>
          <p>
            De <Term tip="reeks">reeks</Term> die nog loopt, geteld tot en met de laatste puzzel op
            deze pagina (nr. {last}).
          </p>
          <p>Wie van die puzzel geen score deelde of het woord niet raadde, staat op 0.</p>
          <p>
            Vanaf 3 dagen staat er in het klassement een vlam met het aantal dagen achter de naam.
          </p>
        </>
      ),
    },
    eerste: {
      title: "Als eerste gedeeld",
      body: (
        <>
          <p>Hoe vaak iemand als eerste de score van een puzzel deelde.</p>
          <p>Dit telt bij puzzels waarvan minstens twee spelers een score deelden.</p>
          <p>
            Het tijdstip van het bericht in de chat beslist. Bij twee berichten in dezelfde minuut
            telt de volgorde in de chat.
          </p>
        </>
      ),
    },
    opener: {
      title: "Na de eerste beurt",
      body: (
        <>
          <p>Het gemiddelde aantal groene en gele vakjes in de eerste rij.</p>
          <p>
            Groen is een goede letter op de goede plek. Geel is een goede letter op een andere plek.
          </p>
          <p>Het hangt af van het eerste woord dat iemand kiest, en van geluk.</p>
        </>
      ),
    },
    tijdstip: {
      title: "Deelt meestal rond",
      body: (
        <>
          <p>
            Het middelste tijdstip van iemands berichten met een score. De helft is vroeger op de
            dag verstuurd en de helft later.
          </p>
          <p>Wanneer iemand speelde, weet het scorebord niet.</p>
          <p>
            Alleen de tijd op de klok telt. Een bericht van vijf over twaalf ’s nachts geldt als
            vroeg.
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
            van een maand. Een lagere lijn is beter.
          </p>
          <p>
            Bij minder dan {rules.minPerMonth} scores in een maand krijgt die maand geen punt en is
            de lijn onderbroken. Een maand waarin niemand {rules.minPerMonth} scores deelde, staat
            niet in de grafiek.
          </p>
        </>
      ),
    },
    prijzen: {
      title: "Prijzenkast",
      body: (
        <>
          <p>
            Elke prijs gaat over één cijfer in de gekozen <Term tip="periode">periode</Term>. Bij de
            meeste wint de hoogste waarde, bij een paar de laagste. Tik op de i bij een prijs voor
            de regel.
          </p>
          <p>
            Spelers zonder plek in het <Term tip="klassement">klassement</Term> doen niet mee. Bij
            een gelijke stand delen spelers de prijs.
          </p>
          <p>
            Een groen vakje staat voor een prestatie, een geel voor een gewoonte en een grijs voor
            pech.
          </p>
        </>
      ),
    },
    besteopener: {
      title: "Beste opener",
      body: (
        <>
          <p>
            Het gemiddelde aantal groene en gele vakjes in de eerste rij, bij elkaar opgeteld. Het
            hoogste gemiddelde wint. Zie <Term tip="opener">na de eerste beurt</Term>.
          </p>
        </>
      ),
    },
    nachtuil: {
      title: "Nachtuil",
      body: (
        <>
          <p>
            Wie gewoonlijk het laatst op de dag deelt, gemeten met het{" "}
            <Term tip="tijdstip">middelste tijdstip</Term> van de berichten.
          </p>
        </>
      ),
    },
    vroegstevogel: {
      title: "Vroegste vogel",
      body: (
        <>
          <p>
            Wie gewoonlijk het vroegst op de dag deelt, gemeten met het{" "}
            <Term tip="tijdstip">middelste tijdstip</Term> van de berichten.
          </p>
        </>
      ),
    },
    nippertje: {
      title: "Op het nippertje",
      body: (
        <>
          <p>Hoe vaak iemand het woord in de zesde beurt raadde.</p>
        </>
      ),
    },
    raak: {
      title: "In één keer raak",
      body: (
        <>
          <p>
            Het woord in de eerste beurt geraden. Iedereen bij wie dat lukte staat erbij, met de
            datum.
          </p>
        </>
      ),
    },
    letter: {
      title: "Op één letter na",
      body: (
        <>
          <p>
            Hoe vaak iemand het woord <Term tip="x">niet raadde</Term> met vier groene vakjes in de
            zesde rij.
          </p>
        </>
      ),
    },
    koudestart: {
      title: "Koude start",
      body: (
        <>
          <p>Hoe vaak de eerste rij helemaal grijs was.</p>
          <p>Erbij staat wie na zo’n begin het vaakst in hooguit drie beurten klaar was.</p>
        </>
      ),
    },
    constant: {
      title: "Meest constant",
      body: (
        <>
          <p>De speler van wie de scores het minst van elkaar verschillen.</p>
          <p>
            Het getal is de standaarddeviatie. Die zegt hoe ver iemands scores gemiddeld van het
            eigen gemiddelde af liggen.
          </p>
          <p>
            Iemand die altijd 5 beurten nodig heeft, is constanter dan iemand die afwisselend 2 en 4
            nodig heeft. Een <Term tip="x">X</Term> telt als {fail} beurten.
          </p>
        </>
      ),
    },
    bestemaand: {
      title: "Beste maand",
      body: (
        <>
          <p>
            De maand met iemands laagste <Term tip="gemiddelde">gemiddeld aantal beurten</Term>. De
            prijs gaat naar het laagste maandgemiddelde van alle spelers.
          </p>
          <p>Een maand telt mee vanaf {rules.minBestMonth} scores van die speler.</p>
        </>
      ),
    },
    pauze: {
      title: "Langste pauze",
      body: (
        <>
          <p>Het grootste aantal dagen achter elkaar zonder gedeelde score.</p>
          <p>Geteld wordt tussen iemands eerste en laatste score in de periode.</p>
        </>
      ),
    },
    gedachtenlezers: {
      title: "Gedachtenlezers",
      body: (
        <>
          <p>
            De twee spelers die het vaakst bij dezelfde puzzel dezelfde vakjes deelden, met evenveel
            rijen en in elke rij dezelfde kleuren.
          </p>
          <p>Welke woorden ze invulden, is uit de vakjes niet op te maken.</p>
          <p>Een woord dat in één beurt geraden is, telt hier niet mee.</p>
        </>
      ),
    },
    weekdag: {
      title: "Per weekdag",
      body: (
        <>
          <p>
            Het <Term tip="gemiddelde">gemiddeld aantal beurten</Term> van alle potjes bij puzzels
            van die weekdag. De dag van de <Term tip="puzzel">puzzel</Term> telt.
          </p>
          <p>De verschillen zijn klein en kunnen toeval zijn.</p>
          <p>
            Onder ‘Meer cijfers’ staat per speler de beste en de zwaarste weekdag. Een weekdag telt
            daarvoor mee vanaf {rules.minPerWeekday} scores.
          </p>
        </>
      ),
    },
    duels: {
      title: "Onderlinge duels",
      body: (
        <>
          <p>
            Voor elk tweetal zijn de puzzels geteld waarvan ze allebei een score deelden. Wie minder
            beurten nodig had, wint. Een <Term tip="x">X</Term> verliest van elke geraden score.
          </p>
          <p>
            In een vak staat eerst hoe vaak de speler links won van de speler boven, en daarna hoe
            vaak die verloor. Puzzels met een gelijke score staan er niet in. X tegen X is ook
            gelijk.
          </p>
          <p>
            Groen betekent dat de speler links vaker won dan verloor, geel dat het gelijk staat.
            Spelers zonder plek in het <Term tip="klassement">klassement</Term> staan niet in de
            tabel.
          </p>
        </>
      ),
    },
    uitschieters: {
      title: "Uitschieters",
      body: (
        <>
          <p>
            Per puzzel is het <Term tip="gemiddelde">gemiddeld aantal beurten</Term> berekend van
            iedereen die er een score van deelde. Een <Term tip="x">X</Term> telt als {fail}.
          </p>
          <p>
            De vijf hoogste gemiddelden zijn de zwaarste puzzels en de vijf laagste de makkelijkste.
            Bij een gelijk gemiddelde staat de oudste puzzel eerst.
          </p>
          <p>Een puzzel doet mee vanaf {rules.minOutlier} spelers.</p>
          <p>
            Groen is de beste score van die puzzel. Grijs met een X is niet geraden. Een punt
            betekent dat de speler geen score deelde.
          </p>
        </>
      ),
    },
  }
}
