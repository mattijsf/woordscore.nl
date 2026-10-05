import { Icon } from "../common/Icon.tsx"

/** Every page ends with what is kept and what never leaves the device. */
export function Privacy(): React.JSX.Element {
  return (
    <section className="privacy" id="privacy">
      <h2>
        <span className="badge g" data-icon="shield-check">
          <Icon name="shield-check" />
        </span>
        Privacy
      </h2>
      <p>
        <b>Je chatberichten worden nooit verstuurd.</b> De export van de groepschat wordt op je
        eigen telefoon of computer uitgelezen. De berichten komen niet bij Woordscore terecht en
        worden nergens bewaard.
      </p>
      <p>
        <b>Bewaard worden alleen de scores en de namen van de spelers.</b> Bij elke score horen het
        puzzelnummer, de naam van de speler, het aantal beurten, het tijdstip van delen en de
        kleuren van de vakjes. Daarnaast bewaart Woordscore de naam van het scorebord en welke naam
        uit WhatsApp bij welke speler hoort.
      </p>
      <p>
        Iedereen die de code van een scorebord kent, kan die gegevens zien. Een scorebord verwijder
        je op het scorebord zelf, onder ‘Delen’.
      </p>
      <p>
        Zoekmachines en AI-diensten krijgen te horen dat ze scoreborden niet mogen lezen of opnemen.
        Alleen deze beginpagina mag gevonden worden.
      </p>
    </section>
  )
}
