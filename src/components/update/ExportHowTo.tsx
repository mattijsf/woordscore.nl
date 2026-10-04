/** The steps to export a WhatsApp chat, folded away until asked for. */
export function ExportHowTo(): React.JSX.Element {
  return (
    <details className="how">
      <summary>Hoe exporteer ik de chat?</summary>
      <h4>Android</h4>
      <ol>
        <li>Open de groep in WhatsApp.</li>
        <li>Tik rechtsboven op de drie puntjes, dan op “Meer” en dan op “Chat exporteren”.</li>
        <li>Kies “Zonder media”.</li>
        <li>Bewaar het bestand op je telefoon, bijvoorbeeld in Bestanden of Drive.</li>
      </ol>
      <h4>iPhone</h4>
      <ol>
        <li>Open de groep in WhatsApp.</li>
        <li>Tik bovenaan op de naam van de groep.</li>
        <li>Scrol naar beneden en tik op “Exporteer chat”.</li>
        <li>Kies “Zonder media”.</li>
        <li>Tik op “Bewaar in Bestanden”.</li>
      </ol>
      <p>
        Tik daarna hieronder op “Export kiezen” en kies dat bestand. WhatsApp maakt meestal een
        .zip-bestand met een .txt erin, soms een los .txt-bestand. Allebei werken.
      </p>
    </details>
  )
}
