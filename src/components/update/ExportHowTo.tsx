/** The steps to export a WhatsApp chat, folded away until asked for. */
export function ExportHowTo(): React.JSX.Element {
  return (
    <details className="how">
      <summary>Hoe exporteer ik de chat?</summary>
      <h4>Android</h4>
      <ol>
        <li>Open de groep in WhatsApp.</li>
        <li>
          Tik rechtsboven op de drie puntjes (“Meer opties”), dan op “Meer” en dan op “Chat
          exporteren”.
        </li>
        <li>Kies “Zonder media” als daarom wordt gevraagd.</li>
        <li>Kies waar je de export bewaart, bijvoorbeeld in Bestanden of Drive.</li>
      </ol>
      <h4>iPhone</h4>
      <ol>
        <li>Open de groep in WhatsApp.</li>
        <li>Tik bovenaan op de naam van de groep en dan op “Exporteer chat”.</li>
        <li>Kies “Zonder media” als daarom wordt gevraagd.</li>
        <li>Kies waar je de export bewaart, bijvoorbeeld met “Bewaar in Bestanden”.</li>
      </ol>
      <p>Tik daarna hieronder op “Export kiezen” en kies het bestand dat je net bewaarde.</p>
    </details>
  )
}
