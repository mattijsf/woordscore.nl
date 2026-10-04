const SAMPLE_STACK = [
  [2, 14, ""],
  [3, 70, "3"],
  [4, 68, "4"],
  [5, 38, "5"],
  [6, 16, "6"],
  [7, 6, ""],
] as const

const FEATURES = [
  ["Klassement", "Wie raadt het woord gemiddeld in de minste beurten, per jaar en over alles."],
  ["Prijzenkast", "Langste reeks, meeste dagzeges, nachtuil, koude start en meer."],
  ["Onderlinge duels", "Wie wint het vaakst van wie."],
  ["Verloop", "Het gemiddelde per maand en per weekdag."],
  ["Uitschieters", "De zwaarste en de makkelijkste puzzels."],
  ["Uitleg erbij", "Bij elk cijfer staat hoe het is berekend."],
]

/** What a scoreboard shows: one row of a ranking, and the parts of the page. */
export function Preview(): React.JSX.Element {
  return (
    <section>
      <h2>Wat je te zien krijgt</h2>
      <figure className="sample" aria-label="Voorbeeld van een regel uit het klassement">
        <span className="rank r1">1</span>
        <span>
          <span className="name">
            <i className="dot" style={{ background: "#2F7FD6" }} />
            Anna
          </span>
          <span className="facts">
            <span>
              <b>212</b> potjes
            </span>
            <span>
              <b>97%</b> geraden
            </span>
            <span>
              <b>81</b> dagzeges
            </span>
          </span>
        </span>
        <span className="avg">
          3,87<small>gemiddeld</small>
        </span>
        <span className="stack" aria-hidden="true">
          {SAMPLE_STACK.map(([turns, count, label]) => (
            <i key={turns} className={`s${turns}`} style={{ flex: `${count} 0 0` }}>
              {label}
            </i>
          ))}
        </span>
        <figcaption>Voorbeeld</figcaption>
      </figure>
      <div className="awards features">
        {FEATURES.map(([title, text]) => (
          <div key={title} className="award">
            <b>{title}</b>
            <span className="n">{text}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
