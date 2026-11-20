/** Questions that open in place (native <details>, works without JavaScript). */
export default function Accordion({ items }: { items: { question: string; answer: string }[] }) {
  return (
    <div className="accordion">
      {items.map((item) => (
        <details className="acc-item" key={item.question}>
          <summary>
            <span>{item.question}</span>
            <span className="acc-icon" aria-hidden="true" />
          </summary>
          <p>{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
