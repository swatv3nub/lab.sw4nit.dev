const stages = [
  { name: "Reconix", question: "What exists?", detail: "Discover attack surface." },
  { name: "Reconix Cloud", question: "Run and normalize reconnaissance", detail: "Execute and normalize collection." },
  { name: "ThreatLens", question: "What is related?", detail: "Correlate security findings." },
  { name: "ORION", question: "What does this actually mean?", detail: "Investigate evidence and assessments." },
  { name: "Analyst Report", question: "What should happen next?", detail: "Communicate evidence-backed findings." }
];

export function Pipeline() {
  return (
    <section className="pipeline-section" id="pipeline" aria-labelledby="pipeline-title">
      <div className="section-heading">
        <p className="section-code">RESEARCH SYSTEM / FLOW</p>
        <h2 id="pipeline-title">From surface discovery to analyst judgment.</h2>
      </div>
      <ol className="pipeline-list">
        {stages.map((stage, index) => (
          <li key={stage.name}>
            <span className="pipeline-index">{String(index + 1).padStart(2, "0")}</span>
            <div>
              <h3>{stage.name}</h3>
              <p>{stage.question}</p>
            </div>
            <span className="pipeline-detail">{stage.detail}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
