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
            Alle cijfers zijn berekend uit de scores die in de groepschat zijn gedeeld: berichten
            zoals “Woordle {last} 4/6” met de gekleurde vakjes eronder.
          </p>
          <p>
            Alleen die berichten tellen. Een potje dat wel gespeeld maar niet gedeeld is, telt niet
            mee. Hetzelfde geldt voor een score die als afbeelding is gedeeld, en voor een bericht
            dat in de export ontbreekt.
          </p>
          <p>Deelde iemand de score van dezelfde puzzel twee keer, dan telt de eerste keer.</p>
          <p>
            Een score telt ook niet mee als de vakjes niet bij de uitslag passen (bijvoorbeeld 4/6
            met drie rijen), of als hij meer dan een week na de dag van de puzzel is gedeeld.
          </p>
          <p>Spelers heten zoals ze in de export staan: met hun voornaam uit WhatsApp.</p>
          <p>
            De scores komen uit een export van de chat. Iedereen kan onderaan de pagina een nieuwere
            export uploaden; zie <Term tip="upload">bijwerken</Term>.
          </p>
          <p>
            Deze pagina loopt van puzzel {first} ({periods.all.from_}) tot en met puzzel {last} (
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
            Onder “Bijwerken” kies je een export van de groepschat. Hoe je die maakt, staat daar
            onder “Hoe exporteer ik de chat?”.
          </p>
          <p>
            Het bestand wordt op je eigen telefoon of computer uitgelezen. Alleen de gevonden scores
            worden naar mattix.nl gestuurd: puzzelnummer, voornaam, aantal beurten, tijdstip van
            delen en de kleuren van de vakjes. De berichten zelf worden niet verstuurd.
          </p>
          <p>
            Je ziet eerst hoeveel nieuwe scores er zijn. Pas als je op “Stand bijwerken” tikt,
            worden ze bewaard en ziet iedereen de nieuwe stand.
          </p>
          <p>
            Bijwerken voegt alleen scores toe. Een score die al bewaard is, wordt niet gewijzigd of
            verwijderd, ook niet als er in jouw export iets anders staat.
          </p>
          <p>
            De namen komen uit jouw export. Staat iemand in jouw telefoon onder een andere naam, dan
            komt die er als nieuwe speler bij. De pagina waarschuwt daarvoor voordat je bijwerkt.
          </p>
          <p>Iedereen met de link naar deze pagina kan bijwerken.</p>
        </>
      ),
    },
    puzzel: {
      title: "Puzzel",
      body: (
        <>
          <p>
            De Woordle van één dag. Elke puzzel heeft een nummer, en dat nummer gaat elke dag één
            omhoog.
          </p>
          <p>
            Een score hoort bij de dag van de puzzel, niet bij de dag waarop hij is gedeeld. Wie de
            score pas na middernacht of de volgende ochtend deelt, krijgt hem toch op de dag van de
            puzzel.
          </p>
          <p>
            Bovenaan de pagina staat van hoeveel puzzels minstens één score is gedeeld. Bij{" "}
            <Term tip="deelname">deelname</Term> tellen alle puzzels in de periode mee, ook die
            waarvan niemand een score deelde.
          </p>
        </>
      ),
    },
    potje: {
      title: "Potje",
      body: (
        <>
          <p>Eén gedeelde score van één speler voor één puzzel.</p>
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
            Met de knoppen bovenaan kies je een jaar of “Altijd”. Alle cijfers op de pagina gaan dan
            over die periode.
          </p>
          <p>
            Een jaar bevat de puzzels van 1 januari tot en met 31 december. Het eerste jaar begint
            bij de eerste puzzel waarvan een score is gedeeld (nr. {first}). Het lopende jaar
            eindigt bij de laatste (nr. {last}). “Altijd” bevat alles.
          </p>
          <p>
            Ook een <Term tip="reeks">reeks</Term> wordt per periode geteld. Een reeks die over de
            jaarwisseling loopt, is bij de losse jaren in twee stukken geknipt en staat alleen bij
            “Altijd” in zijn geheel.
          </p>
        </>
      ),
    },
    beurten: {
      title: "Beurten",
      body: (
        <>
          <p>Het aantal pogingen dat iemand nodig had om het woord te raden: 1 tot en met 6.</p>
          <p>
            Het totaal bovenaan de pagina telt de beurten die echt gespeeld zijn. Een{" "}
            <Term tip="x">niet-geraden woord</Term> telt daarin als 6.
          </p>
          <p>
            In een <Term tip="gemiddelde">gemiddelde</Term> telt een niet-geraden woord als {fail}.
            Daarom is het totaal gedeeld door het aantal potjes iets lager dan het gemiddelde dat
            ernaast staat.
          </p>
        </>
      ),
    },
    gemiddelde: {
      title: "Gemiddeld aantal beurten",
      body: (
        <>
          <p>
            De beurten van alle <Term tip="potje">potjes</Term> bij elkaar opgeteld en gedeeld door
            het aantal potjes. Hoe lager, hoe beter.
          </p>
          <p>
            Een <Term tip="x">niet-geraden woord</Term> telt als {fail} beurten. Dat is één meer dan
            de slechtste score waarmee het woord nog geraden is. Zo is niet raden altijd slechter
            dan raden in de zesde beurt.
          </p>
          <p>
            Een puzzel waarvan iemand geen score deelde, telt niet mee in het gemiddelde van die
            speler.
          </p>
          <p>
            Gemiddelden staan afgerond op twee decimalen. De volgorde wordt bepaald met de
            onafgeronde getallen.
          </p>
        </>
      ),
    },
    x: {
      title: "Niet geraden (X)",
      body: (
        <>
          <p>Het woord is na zes beurten niet geraden. Woordle schrijft dan X/6.</p>
          <p>
            Een X telt als {fail} beurten in elk <Term tip="gemiddelde">gemiddelde</Term>. Een X
            levert nooit een <Term tip="dagzege">dagzege</Term> op en beëindigt een{" "}
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
            De spelers staan op volgorde van <Term tip="gemiddelde">gemiddeld aantal beurten</Term>,
            de laagste bovenaan. Hebben twee spelers exact hetzelfde gemiddelde, dan staat de naam
            die eerder in het alfabet komt bovenaan.
          </p>
          <p>
            Wie in de gekozen periode van minder dan {share} van de puzzels een score deelde, krijgt
            geen plek maar een streepje en staat onderaan. Bij zo weinig potjes zegt een gemiddelde
            te weinig. Deze spelers doen ook niet mee in de prijzenkast en de onderlinge duels.
          </p>
          <p>
            Bij elke speler staan het aantal <Term tip="potje">potjes</Term>, het percentage{" "}
            <Term tip="geraden">geraden</Term>, het aantal <Term tip="dagzege">dagzeges</Term> en de{" "}
            <Term tip="verdeling">verdeling</Term> van de beurten.
          </p>
        </>
      ),
    },
    geraden: {
      title: "Geraden",
      body: (
        <>
          <p>
            Het percentage van iemands potjes waarin het woord binnen zes beurten is geraden. De
            rest is <Term tip="x">niet geraden</Term>.
          </p>
          <p>
            Het percentage is afgerond op hele procenten. Er staat alleen 100% als echt elk potje
            geraden is.
          </p>
        </>
      ),
    },
    dagzege: {
      title: "Dagzege",
      body: (
        <>
          <p>
            Je krijgt een dagzege als niemand de puzzel van die dag in minder beurten raadde dan
            jij.
          </p>
          <p>
            Een dagzege telt alleen als minstens twee spelers een score van die puzzel deelden.
            Hebben meerdere spelers dezelfde beste score, dan krijgen ze allemaal een dagzege.
          </p>
          <p>
            Met een <Term tip="x">X</Term> krijg je nooit een dagzege, ook niet als iedereen een X
            had.
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
            Hoe vaak iemand het woord in 1, 2, 3, 4, 5 of 6 beurten raadde, en hoe vaak het{" "}
            <Term tip="x">niet geraden</Term> werd.
          </p>
          <p>
            In de gekleurde balk hoort bij elk aantal beurten een kleur. Hoe breder de kleur, hoe
            groter het deel van iemands potjes met die score. Het cijfer in een kleurvak is het
            aantal beurten. In een smal vak past het cijfer niet en ontbreekt het.
          </p>
          <p>De precieze aantallen staan onder “Meer cijfers”.</p>
        </>
      ),
    },
    deelname: {
      title: "Deelname",
      body: (
        <>
          <p>
            Het aantal puzzels waarvan iemand een score deelde, als percentage van alle puzzels in
            de periode. Puzzels waarvan niemand een score deelde, tellen ook mee in dat totaal.
          </p>
          <p>
            Wie onder de {share} blijft, staat buiten het <Term tip="klassement">klassement</Term>.
          </p>
          <p>De prijs “Trouwste speler” gaat naar wie de meeste scores deelde.</p>
          <p>
            Het percentage is afgerond op hele procenten. Er staat alleen 100% als iemand van elke
            puzzel een score deelde.
          </p>
        </>
      ),
    },
    reeks: {
      title: "Langste reeks",
      body: (
        <>
          <p>
            Het grootste aantal dagen achter elkaar waarop iemand een score deelde en het woord
            raadde.
          </p>
          <p>
            Een dag zonder gedeelde score beëindigt de reeks, en een <Term tip="x">X</Term> ook.
          </p>
          <p>
            De reeks wordt geteld binnen de gekozen <Term tip="periode">periode</Term>.
          </p>
        </>
      ),
    },
    huidig: {
      title: "Huidige reeks",
      body: (
        <>
          <p>
            De <Term tip="reeks">reeks</Term> die nog loopt: het aantal dagen achter elkaar, tot en
            met de laatste puzzel op deze pagina (nr. {last}), waarop iemand een score deelde en het
            woord raadde.
          </p>
          <p>Wie van die laatste puzzel geen score deelde of het woord niet raadde, staat op 0.</p>
        </>
      ),
    },
    eerste: {
      title: "Als eerste gedeeld",
      body: (
        <>
          <p>Hoe vaak iemand als eerste de score van een puzzel deelde.</p>
          <p>Dit telt alleen bij puzzels waarvan minstens twee spelers een score deelden.</p>
          <p>
            Het gaat om het tijdstip van het bericht in de chat, niet om het moment waarop iemand
            speelde. Staan twee berichten in dezelfde minuut, dan telt de volgorde in de chat.
          </p>
        </>
      ),
    },
    opener: {
      title: "Na de eerste beurt",
      body: (
        <>
          <p>
            Het gemiddelde aantal groene en gele vakjes in de eerste rij, dus na het eerste woord.
          </p>
          <p>
            Groen is een goede letter op de goede plek. Geel is een letter die wel in het woord zit,
            maar op een andere plek.
          </p>
          <p>Dit zegt iets over het eerste woord dat iemand kiest, en over geluk.</p>
        </>
      ),
    },
    tijdstip: {
      title: "Deelt meestal rond",
      body: (
        <>
          <p>
            Het middelste tijdstip van alle berichten waarin iemand een score deelde. De helft van
            die berichten is vroeger op de dag verstuurd, de andere helft later.
          </p>
          <p>Het gaat om het moment van delen. Wanneer iemand speelde, is niet bekend.</p>
          <p>
            Alleen de tijd op de klok telt, niet de datum. Een bericht van vijf over twaalf ’s
            nachts geldt dus als heel vroeg, niet als heel laat.
          </p>
        </>
      ),
    },
    verloop: {
      title: "Verloop per maand",
      body: (
        <>
          <p>
            Voor elke speler het <Term tip="gemiddelde">gemiddeld aantal beurten</Term> over de
            puzzels van één maand. Hoe lager de lijn, hoe beter.
          </p>
          <p>
            Deelde een speler in een maand minder dan {rules.minPerMonth} scores, dan krijgt die
            maand geen punt en is de lijn daar onderbroken. Een maand waarin geen enkele speler{" "}
            {rules.minPerMonth} scores deelde, ontbreekt in de grafiek.
          </p>
        </>
      ),
    },
    prijzen: {
      title: "Prijzenkast",
      body: (
        <>
          <p>
            Elke prijs gaat over één cijfer, berekend over de gekozen{" "}
            <Term tip="periode">periode</Term>. De speler met de hoogste waarde wint, of bij sommige
            prijzen de laagste. Tik op de i bij een prijs om te lezen hoe die wordt berekend.
          </p>
          <p>
            Alleen spelers met een plek in het <Term tip="klassement">klassement</Term> doen mee.
            Bij een gelijke stand delen de spelers de prijs.
          </p>
        </>
      ),
    },
    besteopener: {
      title: "Beste opener",
      body: (
        <>
          <p>
            Het gemiddelde aantal gekleurde vakjes in de eerste rij: groen en geel bij elkaar
            opgeteld. De speler met het hoogste gemiddelde wint. Zie ook{" "}
            <Term tip="opener">na de eerste beurt</Term>.
          </p>
        </>
      ),
    },
    nachtuil: {
      title: "Nachtuil",
      body: (
        <>
          <p>
            De speler die gewoonlijk het laatst op de dag een score deelt. Dat wordt gemeten met het{" "}
            <Term tip="tijdstip">middelste tijdstip</Term> van al zijn of haar berichten met een
            score.
          </p>
        </>
      ),
    },
    vroegstevogel: {
      title: "Vroegste vogel",
      body: (
        <>
          <p>
            De speler die gewoonlijk het vroegst op de dag een score deelt. Dat wordt gemeten met
            het <Term tip="tijdstip">middelste tijdstip</Term> van al zijn of haar berichten met een
            score.
          </p>
        </>
      ),
    },
    nippertje: {
      title: "Op het nippertje",
      body: (
        <>
          <p>Hoe vaak iemand het woord pas in de zesde en laatste beurt raadde.</p>
        </>
      ),
    },
    raak: {
      title: "In één keer raak",
      body: (
        <>
          <p>
            Het woord in de eerste beurt geraden. Iedereen die dat is gelukt staat erbij, met de
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
            Hoe vaak iemand het woord <Term tip="x">niet raadde</Term> terwijl de zesde rij vier
            groene vakjes had: vier letters op de goede plek en één letter fout.
          </p>
        </>
      ),
    },
    koudestart: {
      title: "Koude start",
      body: (
        <>
          <p>
            Hoe vaak de eerste rij helemaal grijs was. Geen enkele letter van het eerste woord zat
            dan in het woord van die dag.
          </p>
          <p>
            Bij de prijs staat ook wie na zo’n begin het vaakst toch in hooguit drie beurten klaar
            was.
          </p>
        </>
      ),
    },
    constant: {
      title: "Meest constant",
      body: (
        <>
          <p>De speler van wie de scores het minst van elkaar verschillen.</p>
          <p>
            Het getal is de standaarddeviatie: een maat voor hoe ver iemands scores gemiddeld van
            het eigen gemiddelde af liggen. Hoe lager het getal, hoe constanter.
          </p>
          <p>
            Constant is niet hetzelfde als goed. Wie altijd in 5 beurten klaar is, is constanter dan
            wie afwisselend 2 en 4 beurten nodig heeft. Een <Term tip="x">X</Term> telt als {fail}{" "}
            beurten.
          </p>
        </>
      ),
    },
    bestemaand: {
      title: "Beste maand",
      body: (
        <>
          <p>
            Voor elke speler de maand met zijn of haar laagste{" "}
            <Term tip="gemiddelde">gemiddeld aantal beurten</Term>. De prijs gaat naar de speler met
            het laagste van al die gemiddelden.
          </p>
          <p>
            Een maand telt alleen mee als de speler in die maand minstens {rules.minBestMonth}{" "}
            scores deelde. Anders zou een maand met een paar gelukkige dagen winnen.
          </p>
        </>
      ),
    },
    pauze: {
      title: "Langste pauze",
      body: (
        <>
          <p>Het grootste aantal dagen achter elkaar waarop iemand geen score deelde.</p>
          <p>
            Alleen de dagen tussen iemands eerste en laatste gedeelde score in de periode tellen. De
            tijd daarvoor en daarna is geen pauze.
          </p>
        </>
      ),
    },
    gedachtenlezers: {
      title: "Gedachtenlezers",
      body: (
        <>
          <p>
            De twee spelers die het vaakst bij dezelfde puzzel precies dezelfde vakjes deelden:
            evenveel rijen, met in elke rij dezelfde kleuren op dezelfde plek.
          </p>
          <p>
            Ze kunnen daarbij verschillende woorden hebben ingevuld. De vakjes laten alleen de
            kleuren zien, niet de letters.
          </p>
          <p>
            Een woord dat in één beurt geraden is, telt niet mee. Die ene groene rij is bij iedereen
            gelijk.
          </p>
        </>
      ),
    },
    weekdag: {
      title: "Per weekdag",
      body: (
        <>
          <p>
            Het <Term tip="gemiddelde">gemiddeld aantal beurten</Term> van alle potjes bij puzzels
            van die weekdag. Het gaat om de dag van de <Term tip="puzzel">puzzel</Term>, niet om de
            dag waarop de score is gedeeld.
          </p>
          <p>De verschillen tussen de dagen zijn klein en kunnen toeval zijn.</p>
          <p>
            Onder “Meer cijfers” staat bij elke speler zijn of haar beste en zwaarste weekdag. Een
            weekdag waarop de speler minder dan {rules.minPerWeekday} scores deelde, doet daarbij
            niet mee.
          </p>
        </>
      ),
    },
    duels: {
      title: "Onderlinge duels",
      body: (
        <>
          <p>
            Voor elk tweetal spelers zijn alle puzzels geteld waarvan ze allebei een score deelden.
            Wie de puzzel in minder beurten raadde, wint. Een <Term tip="x">X</Term> verliest van
            elke geraden score.
          </p>
          <p>
            In elk vak staat eerst hoe vaak de speler links (de rij) won van de speler boven (de
            kolom), en daarna hoe vaak hij of zij verloor. Puzzels met een gelijke score staan er
            niet in; ook X tegen X is gelijk.
          </p>
          <p>
            Een groen vak betekent dat de speler links vaker won dan verloor. Een geel vak betekent
            dat het gelijk staat. Alleen spelers met een plek in het{" "}
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
            Voor elke puzzel is het <Term tip="gemiddelde">gemiddeld aantal beurten</Term> berekend
            van alle spelers die er een score van deelden. Een <Term tip="x">X</Term> telt als{" "}
            {fail}.
          </p>
          <p>
            De vijf puzzels met het hoogste gemiddelde zijn de zwaarste, de vijf met het laagste
            gemiddelde de makkelijkste. Bij een gelijk gemiddelde staat de oudste puzzel eerst.
          </p>
          <p>
            Een puzzel doet alleen mee als minstens {rules.minOutlier} spelers er een score van
            deelden. Anders bepaalt één score te veel.
          </p>
          <p>
            In de tabel is een groen vak de beste score van die puzzel. Een grijs vak met X is niet
            geraden. Een punt betekent dat de speler van die puzzel geen score deelde.
          </p>
        </>
      ),
    },
  }
}
