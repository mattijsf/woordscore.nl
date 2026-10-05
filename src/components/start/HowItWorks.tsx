const STEPS = [
  {
    title: "Speel en deel",
    text: (
      <>
        Speel elke dag Woordle op{" "}
        <a href="https://woordle.nl" rel="noopener">
          woordle.nl
        </a>{" "}
        en deel je uitslag in jullie WhatsApp-groep.
      </>
    ),
  },
  {
    title: "Begin een scorebord",
    text: "Kies een code en upload een export van de groepschat. De berichten blijven op je eigen apparaat. Het scorebord bewaart de scores en de namen van de spelers.",
  },
  {
    title: "Deel de code",
    text: "Iedereen met de code ziet de stand. Met een nieuwere export werkt iemand uit de groep het scorebord bij.",
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
