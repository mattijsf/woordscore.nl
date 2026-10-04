const STEPS = [
  {
    title: "Speel en deel",
    text: (
      <>
        Speel elke dag Woordle op{" "}
        <a href="https://woordle.nl" rel="noopener">
          woordle.nl
        </a>{" "}
        en deel je uitslag in jullie WhatsApp-groep, zoals jullie dat al doen.
      </>
    ),
  },
  {
    title: "Begin een scorebord",
    text: "Kies een code, exporteer de groepschat en kies dat bestand hier. De berichten blijven op je eigen apparaat. Alleen de scores worden bewaard, met de voornamen uit WhatsApp erbij.",
  },
  {
    title: "Deel de code",
    text: "Iedereen met de code ziet de stand. Met een nieuwere export werkt iemand uit de groep het scorebord bij. Houd jullie namen in WhatsApp gelijk: een andere naam telt als een nieuwe speler.",
  },
]

export function HowItWorks(): React.JSX.Element {
  return (
    <section>
      <h2>Zo werkt het</h2>
      <ol className="steps">
        {STEPS.map(({ title, text }, i) => (
          <li key={title}>
            <span className="rank r1">{i + 1}</span>
            <div>
              <b>{title}</b>
              <p>{text}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
